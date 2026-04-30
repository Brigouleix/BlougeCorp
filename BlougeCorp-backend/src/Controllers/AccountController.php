<?php

class AccountController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * PUT /api/account/password — changer le mot de passe
     */
    public function changePassword(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $oldPassword = $input['oldPassword'] ?? '';
        $newPassword = $input['newPassword'] ?? '';

        if (!$oldPassword || !$newPassword) {
            http_response_code(400);
            echo json_encode(['error' => 'Ancien et nouveau mot de passe requis.']);
            return;
        }

        if (strlen($newPassword) < 12) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nouveau mot de passe doit contenir au moins 12 caractères.']);
            return;
        }

        // Vérifier l'ancien mot de passe
        $stmt = $this->db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user['user_id']]);
        $userData = $stmt->fetch();

        if (!$userData || !password_verify($oldPassword, $userData['password'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Ancien mot de passe incorrect.']);
            return;
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('UPDATE users SET password = ? WHERE id = ?');
        $stmt->execute([$hash, $user['user_id']]);

        echo json_encode(['message' => 'Mot de passe modifié avec succès.']);
    }

    /**
     * DELETE /api/account — supprimer le compte
     */
    public function deleteAccount(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';

        // Vérifier le mot de passe
        $stmt = $this->db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user['user_id']]);
        $userData = $stmt->fetch();

        if (!$userData || !password_verify($password, $userData['password'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Mot de passe incorrect.']);
            return;
        }

        $stmt = $this->db->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$user['user_id']]);

        echo json_encode(['message' => 'Compte supprimé avec succès.']);
    }
}
