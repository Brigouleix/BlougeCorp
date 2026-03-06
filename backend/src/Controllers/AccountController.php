<?php

class AccountController
{
    private PDO $db;

    public function __construct(PDO $db) { $this->db = $db; }

    // PUT /api/account/password
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

        // Verify old password
        $stmt = $this->db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($oldPassword, $row['password'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Ancien mot de passe incorrect.']);
            return;
        }

        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $this->db->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hash, $user['user_id']]);

        echo json_encode(['message' => 'Mot de passe modifié avec succès.']);
    }

    // DELETE /api/account
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

        // Verify password for confirmation
        $stmt = $this->db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$user['user_id']]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Mot de passe incorrect.']);
            return;
        }

        // Delete groups created by user
        $this->db->prepare('DELETE FROM groups_ WHERE creator_id = ?')->execute([$user['user_id']]);
        // Delete group memberships
        $this->db->prepare('DELETE FROM group_members WHERE user_id = ?')->execute([$user['user_id']]);
        // Delete invitations
        Database::ensureInvitationsTable();
        $this->db->prepare('DELETE FROM invitations WHERE email = ?')->execute([$user['email']]);
        // Delete user
        $this->db->prepare('DELETE FROM users WHERE id = ?')->execute([$user['user_id']]);

        echo json_encode(['message' => 'Compte supprimé avec succès.']);
    }
}
