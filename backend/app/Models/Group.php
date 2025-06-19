<?php
namespace App\Models;

use PDO;
use Database;

class Group {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->getConnection();
    }

    public function create(string $name, array $members, int $creatorId, ?string $image = null): bool {
        $query = "INSERT INTO groups (name, members, creator_id) VALUES (:name, :members, :creator_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':members', json_encode($members));
        $stmt->bindValue(':creator_id', $creatorId);
        return $stmt->execute();
    }

    public function userExists(string $email): ?int {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ? $user['id'] : null;
    }
}
