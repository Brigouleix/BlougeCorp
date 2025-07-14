<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/database.php';

try {
    $stmt = $pdo->query("SELECT NOW() AS current_time");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "current_time" => $row['current_time']
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur lors de la requête : " . $e->getMessage()
    ]);
}
