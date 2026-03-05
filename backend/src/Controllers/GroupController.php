<?php

use PHPMailer\PHPMailer\PHPMailer;

class GroupController
{
    private PDO $db;

    public function __construct(PDO $db) { $this->db = $db; }

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
            $ms = $this->db->prepare('SELECT u.username FROM users u JOIN group_members gm ON gm.user_id = u.id WHERE gm.group_id = ?');
            $ms->execute([$group['id']]);
            $group['members'] = $ms->fetchAll(PDO::FETCH_COLUMN);

            $cs = $this->db->prepare('SELECT username FROM users WHERE id = ?');
            $cs->execute([$group['creator_id']]);
            $group['creator'] = $cs->fetchColumn();
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
        $name = trim($input['name'] ?? '');
        $emails = $input['emails'] ?? [];
        $image = $input['image'] ?? null;
        $description = trim($input['description'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom du groupe est requis.']);
            return;
        }

        $stmt = $this->db->prepare('INSERT INTO groups_ (name, description, image, creator_id) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $description, $image, $user['user_id']]);
        $groupId = $this->db->lastInsertId();

        $stmt = $this->db->prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
        $stmt->execute([$groupId, $user['user_id']]);

        $members = [$user['username']];
        foreach ($emails as $email) {
            $email = trim($email);
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

            $us = $this->db->prepare('SELECT id, username FROM users WHERE email = ?');
            $us->execute([$email]);
            $existing = $us->fetch();

            if ($existing) {
                $this->db->prepare('INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)')->execute([$groupId, $existing['id']]);
                $members[] = $existing['username'];
            } else {
                $this->sendInvite($email, $name);
            }
        }

        echo json_encode([
            'id' => (int) $groupId,
            'name' => $name,
            'description' => $description,
            'members' => $members,
            'creator' => $user['username'],
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

        $id = (int) ($params['id'] ?? 0);
        $stmt = $this->db->prepare('SELECT creator_id FROM groups_ WHERE id = ?');
        $stmt->execute([$id]);
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

        $this->db->prepare('DELETE FROM groups_ WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Groupe supprimé.']);
    }

    private function sendInvite(string $to, string $groupName): void
    {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $_ENV['MAIL_HOST'];
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USERNAME'];
            $mail->Password = $_ENV['MAIL_PASSWORD'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = (int) $_ENV['MAIL_PORT'];
            $mail->CharSet = 'UTF-8';
            $mail->setFrom($_ENV['MAIL_FROM'], $_ENV['MAIL_FROM_NAME']);
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = "Invitation - $groupName";
            $mail->Body = "<h2>Rejoignez le groupe <b>$groupName</b> sur BlougeCorp !</h2><p><a href='http://localhost:3000/register'>S'inscrire</a></p>";
            $mail->send();
        } catch (\Exception $e) {
            error_log("Mail error: " . $e->getMessage());
        }
    }
}
