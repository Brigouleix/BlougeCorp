<?php
require 'app/Config/Database.php';

try {
    $db = new Database();
    $stmt = $db->conn->query("SELECT * FROM users LIMIT 1");
    print_r($stmt->fetch(PDO::FETCH_ASSOC));
    echo "Connexion DB réussie!";
} catch (PDOException $e) {
    die("ERREUR DB: " . $e->getMessage());
}
INSERT INTO groups (name, members, creator_id) 
VALUES ('Groupe A', '[\"alice\", \"bob\"]', 1);