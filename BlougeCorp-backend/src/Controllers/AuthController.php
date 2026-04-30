<?php

use PHPMailer\PHPMailer\PHPMailer;

class AuthController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function register(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $email    = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$username || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Tous les champs sont requis.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email invalide.']);
            return;
        }

        if (strlen($password) < 12) {
            http_response_code(400);
            echo json_encode(['error' => 'Le mot de passe doit contenir au moins 12 caractères.']);
            return;
        }

        // Check existing email
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Cet email est déjà utilisé.']);
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        $stmt->execute([$username, $email, $hash]);

        $userId = $this->db->lastInsertId();

        echo json_encode([
            'user' => [
                'id'       => (int) $userId,
                'username' => $username,
                'email'    => $email,
            ]
        ]);
    }

    public function login(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $email    = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email et mot de passe requis.']);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email ou mot de passe incorrect.']);
            return;
        }

        $token = JWT::encode([
            'user_id'  => $user['id'],
            'email'    => $user['email'],
            'username' => $user['username'],
        ]);

        echo json_encode([
            'user' => [
                'id'       => (int) $user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
            ],
            'token' => $token,
        ]);
    }

    public function forgotPassword(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email invalide.']);
            return;
        }

        // Check user exists
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if (!$stmt->fetch()) {
            // Return success anyway (don't leak if email exists)
            echo json_encode(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
            return;
        }

        // Generate token
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Delete old tokens for this email
        $this->db->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);

        // Store token
        $this->db->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)')
                 ->execute([$email, $token, $expires]);

        // Try to send email
        $appUrl = rtrim($_ENV['APP_URL'] ?? 'http://localhost:3000', '/');
        $resetUrl = "$appUrl/reset-password?token=$token";
        $this->sendResetEmail($email, $resetUrl);

        echo json_encode([
            'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.',
            'debug_token' => $token, // à retirer en production
        ]);
    }

    public function resetPassword(array $params): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $token    = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (!$token || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Token et mot de passe requis.']);
            return;
        }

        if (strlen($password) < 12) {
            http_response_code(400);
            echo json_encode(['error' => 'Le mot de passe doit contenir au moins 12 caractères.']);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()');
        $stmt->execute([$token]);
        $reset = $stmt->fetch();

        if (!$reset) {
            http_response_code(400);
            echo json_encode(['error' => 'Token invalide ou expiré.']);
            return;
        }

        // Update password
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $this->db->prepare('UPDATE users SET password = ? WHERE email = ?')
                 ->execute([$hash, $reset['email']]);

        // Mark token as used
        $this->db->prepare('UPDATE password_resets SET used = 1 WHERE token = ?')
                 ->execute([$token]);

        echo json_encode(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    private function sendResetEmail(string $to, string $resetUrl): void
    {
        $smtpUser = $_ENV['MAIL_USERNAME'] ?? '';
        $smtpPass = $_ENV['MAIL_PASSWORD'] ?? '';

        if (empty($smtpUser) || empty($smtpPass)) {
            error_log("BlougeCorp: SMTP non configuré — MAIL_USERNAME ou MAIL_PASSWORD manquant dans .env");
            return;
        }

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Timeout    = 15;
            $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp-relay.brevo.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtpUser;
            $mail->Password   = $smtpPass;
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 587);
            $mail->CharSet    = 'UTF-8';

            $from     = $_ENV['MAIL_FROM']      ?? $smtpUser;
            $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'BlougeCorp';
            $mail->setFrom($from, $fromName);
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = 'Réinitialisation de mot de passe - BlougeCorp';
            $mail->Body    = "
            <div style='font-family:sans-serif;padding:2rem;background:#f0f4ff;border-radius:16px;max-width:500px;margin:auto'>
                <h2 style='color:#4f46e5'>🔐 Réinitialiser votre mot de passe</h2>
                <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe BlougeCorp (lien valable 1h) :</p>
                <a href='$resetUrl' style='display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;border-radius:12px;text-decoration:none;font-weight:bold;margin:1rem 0'>
                    Réinitialiser mon mot de passe
                </a>
                <p style='color:#888;font-size:0.8rem'>Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.</p>
                <hr style='border:none;border-top:1px solid #ddd;margin:1rem 0'>
                <p style='color:#aaa;font-size:0.75rem'>BlougeCorp — Organisateur de voyages</p>
            </div>";
            $mail->AltBody = "Réinitialisation BlougeCorp : $resetUrl (valable 1h)";
            $mail->send();
            error_log("BlougeCorp: Email reset envoyé à $to");
        } catch (\Exception $e) {
            error_log("BlougeCorp SMTP ERROR (reset) : " . $e->getMessage());
        }
    }
}
