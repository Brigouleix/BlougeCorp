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
}
