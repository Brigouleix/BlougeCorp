<?php
namespace App\Models;

use PDO;
use Database;

class Destination {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->getConnection();
    }

    public function create(array $data): bool {
        $stmt = $this->conn->prepare("
            INSERT INTO destinations (name, image, members)
            VALUES (:name, :image, :members)
        ");
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':image', $data['image'] ?? '');
        $stmt->bindValue(':members', json_encode($data['members'] ?? []));
        return $stmt->execute();
    }
}
