<?php
namespace App\Models;

use PDO;

class Group {
    private $conn;

    public function __construct() {
        $this->conn = (new \Database())->getConnection();
    }

    // Création d'un groupe
    public function create(string $name, array $members, int $creatorId, ?string $image = null, ?string $description = null): bool {
        $query = "INSERT INTO groups (name, members, creator_id, image, description) VALUES (:name, :members, :creator_id, :image, :description)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':members', json_encode($members));
        $stmt->bindValue(':creator_id', $creatorId);
        $stmt->bindValue(':image', $image);
        $stmt->bindValue(':description', $description);
        return $stmt->execute();
    }

    // Trouver un groupe avec données du créateur (email et nom)
    public function find(int $id): ?array {
        $sql = "SELECT g.*, u.email AS creator_email, u.nom AS creator_name
                FROM groups g
                JOIN users u ON g.creator_id = u.id
                WHERE g.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        $group = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($group) {
            $group['members'] = json_decode($group['members'], true) ?: [];
        }
        return $group ?: null;
    }

    // Trouver tous les groupes pour un utilisateur donné (avec jointure créateur)
    public function findForUserEmail(string $email): array {
        $sql = "SELECT g.*, u.email AS creator_email, u.nom AS creator_name
                FROM groups g
                JOIN users u ON g.creator_id = u.id
                WHERE g.creator_id = (SELECT id FROM users WHERE email = :email)
                   OR JSON_CONTAINS(g.members, JSON_QUOTE(:email))";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['email' => $email]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$r) {
            $r['members'] = json_decode($r['members'], true) ?: [];
        }
        return $rows;
    }

    public function delete(int $id): bool {
        $stmt = $this->conn->prepare("DELETE FROM groups WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    // Vérifier si un utilisateur existe (utile ailleurs)
    public function userExists(string $email): ?int {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? (int)$user['id'] : null;
    }

    // Récupérer les membres d'un groupe (suppose table group_members)
    public function getMembers(int $groupId): array {
        $sql = "SELECT u.id, u.nom, u.email
                FROM group_members gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ?";
        return $this->db->prepare($sql, [$groupId], true);
    }
}
