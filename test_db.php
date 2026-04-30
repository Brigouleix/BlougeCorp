<?php
echo "Test A: localhost...\n";
try {
    $pdo = new PDO('mysql:host=localhost', 'root', '', [
        PDO::ATTR_TIMEOUT => 3,
    ]);
    echo "localhost OK!\n";
} catch (Exception $e) {
    echo "localhost ERREUR: " . $e->getMessage() . "\n";
}

echo "Test B: 127.0.0.1...\n";
try {
    $pdo = new PDO('mysql:host=127.0.0.1', 'root', '', [
        PDO::ATTR_TIMEOUT => 3,
    ]);
    echo "127.0.0.1 OK!\n";
} catch (Exception $e) {
    echo "127.0.0.1 ERREUR: " . $e->getMessage() . "\n";
}

echo "Test C: localhost:3306...\n";
try {
    $pdo = new PDO('mysql:host=localhost;port=3306', 'root', '', [
        PDO::ATTR_TIMEOUT => 3,
    ]);
    echo "localhost:3306 OK!\n";
} catch (Exception $e) {
    echo "localhost:3306 ERREUR: " . $e->getMessage() . "\n";
}

echo "3. Test base blougecorp...\n";
try {
    $pdo->exec("CREATE DATABASE IF NOT EXISTS blougecorp CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    echo "4. Base blougecorp OK!\n";
} catch (Exception $e) {
    echo "4. ERREUR base: " . $e->getMessage() . "\n";
}

echo "5. Connexion a blougecorp...\n";
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=blougecorp', 'root', '', [
        PDO::ATTR_TIMEOUT => 5,
    ]);
    echo "6. OK!\n";
} catch (Exception $e) {
    echo "6. ERREUR: " . $e->getMessage() . "\n";
    exit(1);
}

echo "7. Creation tables...\n";
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo "8. Table users OK!\n";
} catch (Exception $e) {
    echo "8. ERREUR: " . $e->getMessage() . "\n";
}

echo "\nTout est bon! MySQL fonctionne.\n";
