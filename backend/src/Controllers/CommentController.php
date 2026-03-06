<?php

class CommentController
{
    private PDO $db;

    public function __construct(PDO $db) { $this->db = $db; }

    public function index(array $params): void
    {
        Database::ensureCommentsTable();
        $destId = (int) ($params['destId'] ?? 0);

        $stmt = $this->db->prepare('SELECT * FROM comments WHERE destination_id = ? ORDER BY created_at DESC');
        $stmt->execute([$destId]);

        echo json_encode($stmt->fetchAll());
    }

    public function create(array $params): void
    {
        Database::ensureCommentsTable();
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié']);
            return;
        }

        $destId = (int) ($params['destId'] ?? 0);
        $input = json_decode(file_get_contents('php://input'), true);
        $text = trim($input['text'] ?? '');
        $rating = (int) ($input['rating'] ?? 5);

        if (!$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Le commentaire ne peut pas être vide.']);
            return;
        }

        if ($rating < 1 || $rating > 5) $rating = 5;

        $stmt = $this->db->prepare('INSERT INTO comments (destination_id, user_id, username, text, rating) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$destId, $user['user_id'], $user['username'], $text, $rating]);

        echo json_encode([
            'id' => (int) $this->db->lastInsertId(),
            'destination_id' => $destId,
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'text' => $text,
            'rating' => $rating,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public function delete(array $params): void
    {
        Database::ensureCommentsTable();
        $user = JWT::getUserFromRequest();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié']);
            return;
        }

        $commentId = (int) ($params['commentId'] ?? 0);

        $stmt = $this->db->prepare('SELECT * FROM comments WHERE id = ?');
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();

        if (!$comment) {
            http_response_code(404);
            echo json_encode(['error' => 'Commentaire introuvable']);
            return;
        }

        if ((int) $comment['user_id'] !== (int) $user['user_id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Vous ne pouvez supprimer que vos propres commentaires.']);
            return;
        }

        $this->db->prepare('DELETE FROM comments WHERE id = ?')->execute([$commentId]);
        echo json_encode(['message' => 'Commentaire supprimé']);
    }
}
