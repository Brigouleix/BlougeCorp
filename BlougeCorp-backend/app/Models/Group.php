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

    public function findById(int $id): ?array
{
    $stmt = $this->conn->prepare("SELECT * FROM groups WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $group = $stmt->fetch(PDO::FETCH_ASSOC);
    return $group ?: null;
}
public function find(int $id): ?array {
    $stmt = $this->conn->prepare("SELECT * FROM groups WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $group = $stmt->fetch(PDO::FETCH_ASSOC);
    return $group ?: null;
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

    // Trouver tous les groupes pour un utilisateur donné (par email)
    public function findForUserEmail(string $email): array
    {
        $sql = "SELECT * FROM groups
                WHERE creator_id = (SELECT id FROM users WHERE email = :email)
                   OR JSON_CONTAINS(members, JSON_QUOTE(:email))";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['email' => $email]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // décodage ici, une seule fois
        foreach ($rows as &$r) {
            $r['members'] = json_decode($r['members'], true) ?: [];
        }
        return $rows;
    }

}
