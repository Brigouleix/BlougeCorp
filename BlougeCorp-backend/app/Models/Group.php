<?php
namespace App\Models;

use PDO;

class Group {
    private $conn;

    public function __construct() {
        $this->conn = (new \Database())->getConnection();
    }

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

    public function userExists(string $email): ?int {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? (int)$user['id'] : null;
    }


    public function findForUserEmail(string $email): array
{
    $sql = "SELECT * FROM groups
            WHERE creator_id = (SELECT id FROM users WHERE email = :email)
               OR JSON_CONTAINS(members, JSON_QUOTE(:email))";
    $stmt = $this->conn->prepare($sql);
    $stmt->execute(['email' => $email]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}



}
