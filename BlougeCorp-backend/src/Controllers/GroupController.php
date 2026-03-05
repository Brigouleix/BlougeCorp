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

        // Attach members to each group
        foreach ($groups as &$group) {
            $memberStmt = $this->db->prepare('
                SELECT u.username FROM users u
                JOIN group_members gm ON gm.user_id = u.id
                WHERE gm.group_id = ?
            ');
            $memberStmt->execute([$group['id']]);
            $group['members'] = $memberStmt->fetchAll(PDO::FETCH_COLUMN);

            // Get creator username
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

        // Create group
        $stmt = $this->db->prepare('INSERT INTO groups_ (name, description, image, creator_id) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $description, $image, $user['user_id']]);
        $groupId = $this->db->lastInsertId();

        // Add creator as member
        $stmt = $this->db->prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
        $stmt->execute([$groupId, $user['user_id']]);

        // Add existing users by email, send invites for unknown emails
        $members = [$user['username']];
        foreach ($emails as $email) {
            $email = trim($email);
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

            $userStmt = $this->db->prepare('SELECT id, username FROM users WHERE email = ?');
            $userStmt->execute([$email]);
            $existingUser = $userStmt->fetch();

            if ($existingUser) {
                // Add to group
                $addStmt = $this->db->prepare('INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)');
                $addStmt->execute([$groupId, $existingUser['id']]);
                $members[] = $existingUser['username'];
            } else {
                // Send invitation email
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

        // Check ownership
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

    private function sendInviteEmail(string $to, string $groupName): void
    {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USERNAME'];
            $mail->Password   = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) $_ENV['MAIL_PORT'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = "Invitation au groupe $groupName - BlougeCorp";
            $mail->Body    = "<h2>Vous êtes invité(e) à rejoindre le groupe <b>$groupName</b> sur BlougeCorp !</h2>"
                           . "<p>Créez votre compte pour rejoindre le groupe : <a href='http://localhost:3000/register'>S'inscrire</a></p>";

            $mail->send();
        } catch (\Exception $e) {
            // Log silently - don't block group creation
            error_log("Erreur envoi mail invitation: " . $e->getMessage());
        }
    }
}
