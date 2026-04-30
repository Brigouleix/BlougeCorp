<?php

class PhotoController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * GET /api/groups/{groupId}/photos
     */
    public function index(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $groupId = (int) ($params['groupId'] ?? 0);

        // Vérifier que l'utilisateur est membre du groupe
        $check = $this->db->prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?');
        $check->execute([$groupId, $user['user_id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé.']);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM photos WHERE group_id = ? ORDER BY created_at DESC');
        $stmt->execute([$groupId]);

        echo json_encode($stmt->fetchAll());
    }

    /**
     * POST /api/groups/{groupId}/photos
     */
    public function create(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $groupId = (int) ($params['groupId'] ?? 0);

        // Vérifier membership
        $check = $this->db->prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?');
        $check->execute([$groupId, $user['user_id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé.']);
            return;
        }

        $input   = json_decode(file_get_contents('php://input'), true);
        $image   = $input['image'] ?? '';
        $caption = trim($input['caption'] ?? '');

        if (!$image) {
            http_response_code(400);
            echo json_encode(['error' => 'Image requise.']);
            return;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO photos (group_id, user_id, username, image, caption) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$groupId, $user['user_id'], $user['username'], $image, $caption]);

        $id = $this->db->lastInsertId();

        echo json_encode([
            'id'         => (int) $id,
            'group_id'   => $groupId,
            'user_id'    => (int) $user['user_id'],
            'username'   => $user['username'],
            'image'      => $image,
            'caption'    => $caption,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * DELETE /api/photos/{photoId}
     */
    public function delete(array $params): void
    {
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié.']);
            return;
        }

        $photoId = (int) ($params['photoId'] ?? 0);

        $stmt = $this->db->prepare('SELECT user_id FROM photos WHERE id = ?');
        $stmt->execute([$photoId]);
        $photo = $stmt->fetch();

        if (!$photo) {
            http_response_code(404);
            echo json_encode(['error' => 'Photo introuvable.']);
            return;
        }

        if ((int) $photo['user_id'] !== (int) $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Vous ne pouvez supprimer que vos propres photos.']);
            return;
        }

        $stmt = $this->db->prepare('DELETE FROM photos WHERE id = ?');
        $stmt->execute([$photoId]);

        echo json_encode(['message' => 'Photo supprimée.']);
    }
}
