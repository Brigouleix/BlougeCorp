<?php

use PHPMailer\PHPMailer\PHPMailer;

class GroupController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function index(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $stmt = $this->db->prepare('
            SELECT g.id, g.name, g.description, g.image, g.creator_id, g.created_at
            FROM groups_ g
            JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = ?
            ORDER BY g.created_at DESC
        ');
        $stmt->execute([$user['user_id']]);
        $groups = $stmt->fetchAll();

        foreach ($groups as &$group) {
            $memberStmt = $this->db->prepare('
                SELECT u.username FROM users u
                JOIN group_members gm ON gm.user_id = u.id
                WHERE gm.group_id = ?
            ');
            $memberStmt->execute([$group['id']]);
            $group['members'] = $memberStmt->fetchAll(PDO::FETCH_COLUMN);

            $creatorStmt = $this->db->prepare('SELECT username FROM users WHERE id = ?');
            $creatorStmt->execute([$group['creator_id']]);
            $group['creator'] = $creatorStmt->fetchColumn();
        }

        echo json_encode($groups);
    }

    public function create(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $name        = trim($input['name'] ?? '');
        $emails      = $input['emails'] ?? [];
        $image       = $input['image'] ?? null;
        $description = trim($input['description'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom du groupe est requis.']);
            return;
        }

        $stmt = $this->db->prepare('INSERT INTO groups_ (name, description, image, creator_id) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $description, $image, $user['user_id']]);
        $groupId = $this->db->lastInsertId();

        // Ajouter le créateur comme membre
        $stmt = $this->db->prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
        $stmt->execute([$groupId, $user['user_id']]);

        $members = [$user['username']];
        foreach ($emails as $email) {
            $email = trim($email);
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

            $userStmt = $this->db->prepare('SELECT id, username FROM users WHERE email = ?');
            $userStmt->execute([$email]);
            $existingUser = $userStmt->fetch();

            if ($existingUser) {
                $addStmt = $this->db->prepare('INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)');
                $addStmt->execute([$groupId, $existingUser['id']]);
                $members[] = $existingUser['username'];
            } else {
                // Créer une invitation
                $invStmt = $this->db->prepare('INSERT INTO invitations (group_id, email) VALUES (?, ?)');
                $invStmt->execute([$groupId, $email]);
                $this->sendInviteEmail($email, $name);
            }
        }

        echo json_encode([
            'id'          => (int) $groupId,
            'name'        => $name,
            'description' => $description,
            'members'     => $members,
            'creator'     => $user['username'],
        ]);
    }

    public function delete(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $groupId = (int) ($params['id'] ?? 0);

        $stmt = $this->db->prepare('SELECT creator_id FROM groups_ WHERE id = ?');
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();

        if (!$group) {
            http_response_code(404);
            echo json_encode(['error' => 'Groupe introuvable.']);
            return;
        }

        if ((int) $group['creator_id'] !== (int) $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Seul le créateur peut supprimer ce groupe.']);
            return;
        }

        $stmt = $this->db->prepare('DELETE FROM groups_ WHERE id = ?');
        $stmt->execute([$groupId]);

        echo json_encode(['message' => 'Groupe supprimé avec succès.']);
    }

    /**
     * GET /api/invitations — invitations en attente pour l'utilisateur connecté
     */
    public function getInvitations(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $stmt = $this->db->prepare('
            SELECT i.id, i.group_id, g.name as group_name, i.status, i.created_at
            FROM invitations i
            JOIN groups_ g ON g.id = i.group_id
            WHERE i.email = ? AND i.status = "pending"
            ORDER BY i.created_at DESC
        ');
        $stmt->execute([$user['email']]);

        echo json_encode($stmt->fetchAll());
    }

    /**
     * POST /api/invitations/{id}/accept
     */
    public function acceptInvitation(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $invId = (int) ($params['id'] ?? 0);

        $stmt = $this->db->prepare('SELECT * FROM invitations WHERE id = ? AND email = ?');
        $stmt->execute([$invId, $user['email']]);
        $inv = $stmt->fetch();

        if (!$inv) {
            http_response_code(404);
            echo json_encode(['error' => 'Invitation introuvable.']);
            return;
        }

        // Ajouter au groupe
        $this->db->prepare('INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)')
                 ->execute([$inv['group_id'], $user['user_id']]);

        // Marquer comme acceptée
        $this->db->prepare('UPDATE invitations SET status = "accepted" WHERE id = ?')
                 ->execute([$invId]);

        echo json_encode(['message' => 'Invitation acceptée.']);
    }

    /**
     * POST /api/invitations/{id}/decline
     */
    public function declineInvitation(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $invId = (int) ($params['id'] ?? 0);

        $this->db->prepare('UPDATE invitations SET status = "declined" WHERE id = ? AND email = ?')
                 ->execute([$invId, $user['email']]);

        echo json_encode(['message' => 'Invitation déclinée.']);
    }

    /**
     * POST /api/invitations/send — envoyer des invitations par email
     */
    public function sendInvitations(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $input   = json_decode(file_get_contents('php://input'), true);
        $groupId = (int) ($input['groupId'] ?? 0);
        $emails  = $input['emails'] ?? [];

        // Vérifier que le groupe existe
        $stmt = $this->db->prepare('SELECT name FROM groups_ WHERE id = ?');
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();

        if (!$group) {
            http_response_code(404);
            echo json_encode(['error' => 'Groupe introuvable.']);
            return;
        }

        $sent = [];
        foreach ($emails as $email) {
            $email = trim($email);
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

            // Vérifier si déjà membre
            $checkStmt = $this->db->prepare('
                SELECT gm.id FROM group_members gm
                JOIN users u ON u.id = gm.user_id
                WHERE gm.group_id = ? AND u.email = ?
            ');
            $checkStmt->execute([$groupId, $email]);
            if ($checkStmt->fetch()) continue; // déjà membre

            // Vérifier si invitation déjà envoyée
            $invCheck = $this->db->prepare('SELECT id FROM invitations WHERE group_id = ? AND email = ? AND status = "pending"');
            $invCheck->execute([$groupId, $email]);
            if ($invCheck->fetch()) continue; // invitation déjà en attente

            // Créer l'invitation
            $this->db->prepare('INSERT INTO invitations (group_id, email) VALUES (?, ?)')
                     ->execute([$groupId, $email]);

            $this->sendInviteEmail($email, $group['name']);
            $sent[] = $email;
        }

        echo json_encode([
            'message' => count($sent) . ' invitation(s) envoyée(s).',
            'sent'    => $sent,
        ]);
    }

    private function sendInviteEmail(string $to, string $groupName): bool
    {
        $smtpUser = $_ENV['MAIL_USERNAME'] ?? '';
        $smtpPass = $_ENV['MAIL_PASSWORD'] ?? '';

        if (empty($smtpUser) || empty($smtpPass)) {
            error_log("BlougeCorp: SMTP non configuré — invitation en BDD uniquement pour $to.");
            return false;
        }

        $appUrl      = rtrim($_ENV['APP_URL'] ?? 'http://localhost:3000', '/');
        $registerUrl = "$appUrl/register";
        $loginUrl    = "$appUrl/";

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Timeout    = 15;
            $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp-relay.brevo.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtpUser;
            $mail->Password   = $smtpPass;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) ($_ENV['MAIL_PORT'] ?? 587);
            $mail->CharSet    = 'UTF-8';

            $from     = $_ENV['MAIL_FROM']      ?? $smtpUser;
            $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'BlougeCorp';
            $mail->setFrom($from, $fromName);
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = "✈️ Invitation au groupe « $groupName » - BlougeCorp";
            $mail->Body    = "
                <div style='font-family:sans-serif;max-width:520px;margin:auto;padding:2rem;background:#f0f4ff;border-radius:16px'>
                    <h2 style='color:#4f46e5'>✈️ Vous êtes invité(e) !</h2>
                    <p>Vous avez été invité(e) à rejoindre le groupe <b>$groupName</b> sur <b>BlougeCorp</b>, l'organisateur de voyages en groupe.</p>
                    <div style='margin:1.5rem 0;display:flex;gap:1rem;flex-wrap:wrap'>
                        <a href='$registerUrl'
                           style='display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;border-radius:12px;text-decoration:none;font-weight:bold'>
                            Créer mon compte
                        </a>
                        <a href='$loginUrl'
                           style='display:inline-block;padding:12px 24px;background:rgba(79,70,229,0.1);color:#4f46e5;border-radius:12px;text-decoration:none;font-weight:bold;border:1.5px solid rgba(79,70,229,0.3)'>
                            J'ai déjà un compte
                        </a>
                    </div>
                    <p style='color:#666;font-size:0.85rem'>
                        Une fois connecté, rendez-vous dans <b>Mes Groupes</b> pour voir l'invitation en attente.
                    </p>
                    <hr style='border:none;border-top:1px solid #ddd;margin:1.5rem 0'>
                    <p style='color:#aaa;font-size:0.75rem'>BlougeCorp — Organisateur de voyages en groupe</p>
                </div>";
            $mail->AltBody = "Invitation au groupe $groupName sur BlougeCorp. Inscrivez-vous sur : $registerUrl";

            $mail->send();
            error_log("BlougeCorp: Invitation envoyée à $to pour le groupe '$groupName'.");
            return true;
        } catch (\Exception $e) {
            error_log("BlougeCorp SMTP ERROR (invite) : " . $e->getMessage());
            return false;
        }
    }
}
