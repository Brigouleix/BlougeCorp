<?php

use PHPMailer\PHPMailer\PHPMailer;

class AdminController
{
    private PDO $db;
    private const ADMIN_EMAIL = 'antoine.brigouleix@gmail.com';

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    private function checkAdmin(): bool
    {
        $user = JWT::getUserFromRequest();
        if (!$user || ($user['email'] ?? '') !== self::ADMIN_EMAIL) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé.']);
            return false;
        }
        return true;
    }

    public function stats(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $users        = $this->db->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $groups       = $this->db->query('SELECT COUNT(*) FROM groups_')->fetchColumn();
        $destinations = $this->db->query('SELECT COUNT(*) FROM destinations')->fetchColumn();
        $archived     = $this->db->query('SELECT COUNT(*) FROM destinations WHERE archived = 1')->fetchColumn();
        $comments     = $this->db->query('SELECT COUNT(*) FROM comments')->fetchColumn();

        echo json_encode([
            'users'        => (int) $users,
            'groups'       => (int) $groups,
            'destinations' => (int) $destinations,
            'archived'     => (int) $archived,
            'comments'     => (int) $comments,
        ]);
    }

    public function users(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $stmt = $this->db->query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
        echo json_encode($stmt->fetchAll());
    }

    public function deleteUser(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $id = (int) ($params['id'] ?? 0);
        $this->db->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Utilisateur supprimé.']);
    }

    public function groups(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $stmt = $this->db->query('
            SELECT g.id, g.name, g.description, g.created_at, u.username AS creator_name, u.email AS creator_email
            FROM groups_ g
            LEFT JOIN users u ON g.creator_id = u.id
            ORDER BY g.created_at DESC
        ');
        echo json_encode($stmt->fetchAll());
    }

    public function deleteGroup(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $id = (int) ($params['id'] ?? 0);
        $this->db->prepare('DELETE FROM groups_ WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Groupe supprimé.']);
    }

    public function destinations(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $stmt = $this->db->query('
            SELECT d.id, d.name, d.dates, d.proposed_by, d.archived, d.created_at,
                   g.name AS group_name
            FROM destinations d
            LEFT JOIN groups_ g ON d.group_id = g.id
            ORDER BY d.created_at DESC
        ');
        echo json_encode($stmt->fetchAll());
    }

    public function deleteDestination(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $id = (int) ($params['id'] ?? 0);
        $this->db->prepare('DELETE FROM destinations WHERE id = ?')->execute([$id]);
        echo json_encode(['message' => 'Destination supprimée.']);
    }

    public function testEmail(array $params): void
    {
        if (!$this->checkAdmin()) return;

        $smtpUser = $_ENV['MAIL_USERNAME'] ?? '';
        $smtpPass = $_ENV['MAIL_PASSWORD'] ?? '';

        if (empty($smtpUser) || empty($smtpPass)) {
            http_response_code(400);
            echo json_encode([
                'error'   => 'MAIL_USERNAME et/ou MAIL_PASSWORD sont vides dans le fichier .env.',
                'config'  => [
                    'host'     => $_ENV['MAIL_HOST'] ?? '(vide)',
                    'port'     => $_ENV['MAIL_PORT'] ?? '(vide)',
                    'username' => empty($smtpUser) ? '(VIDE)' : substr($smtpUser, 0, 3) . '***',
                    'from'     => $_ENV['MAIL_FROM'] ?? '(vide)',
                ],
            ]);
            return;
        }

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
            $mail->addAddress(self::ADMIN_EMAIL);
            $mail->isHTML(true);
            $mail->Subject = '✅ Test email BlougeCorp';
            $mail->Body    = "<p>Test SMTP réussi ! BlougeCorp peut envoyer des emails.</p><p>Hôte : <b>{$_ENV['MAIL_HOST']}</b> | Port : <b>{$_ENV['MAIL_PORT']}</b></p>";
            $mail->AltBody = 'Test SMTP BlougeCorp réussi.';
            $mail->send();

            echo json_encode(['message' => "Email de test envoyé avec succès à " . self::ADMIN_EMAIL]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error'   => 'Échec SMTP : ' . $e->getMessage(),
                'config'  => [
                    'host'     => $_ENV['MAIL_HOST'] ?? '(vide)',
                    'port'     => $_ENV['MAIL_PORT'] ?? '(vide)',
                    'username' => substr($smtpUser, 0, 3) . '***',
                ],
            ]);
        }
    }
}
