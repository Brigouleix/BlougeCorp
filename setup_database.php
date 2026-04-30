<?php
/**
 * Script d'initialisation de la base de données MySQL pour BlougeCorp
 *
 * Usage : php setup_database.php
 *
 * Ce script :
 * 1. Crée la base de données 'blougecorp' si elle n'existe pas
 * 2. Crée toutes les tables nécessaires
 * 3. Affiche un résumé
 */

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$dbName = 'blougecorp';

echo "=== BlougeCorp - Initialisation de la base de données ===\n\n";

try {
    // Connexion sans base de données pour la créer
    $pdo = new PDO("mysql:host=$host", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "[1/3] Connexion à MySQL... OK\n";

    // Créer la base de données
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "[2/3] Base de données '$dbName' créée... OK\n";

    // Se connecter à la base
    $pdo->exec("USE `$dbName`");

    // Créer les tables
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS groups_ (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image LONGTEXT,
            creator_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS group_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_member (group_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS invitations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            status ENUM('pending','accepted','declined') DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS destinations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT DEFAULT NULL,
            name VARCHAR(255) NOT NULL,
            image LONGTEXT,
            price_house DECIMAL(10,2) DEFAULT 0,
            price_travel DECIMAL(10,2) DEFAULT 0,
            dates VARCHAR(255),
            proposed_by VARCHAR(100),
            members TEXT,
            location_lat DOUBLE,
            location_lng DOUBLE,
            location_address VARCHAR(500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            destination_id INT NOT NULL,
            user_id INT NOT NULL,
            username VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            rating INT NOT NULL DEFAULT 5,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "[3/3] Tables créées... OK\n\n";

    // Afficher les tables créées
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables dans '$dbName' :\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }

    echo "\n✅ Base de données initialisée avec succès !\n";
    echo "\nTu peux maintenant accéder à phpMyAdmin : http://localhost/phpmyadmin\n";
    echo "Base de données : $dbName\n";

} catch (PDOException $e) {
    echo "❌ ERREUR : " . $e->getMessage() . "\n";
    echo "\nAssure-toi que :\n";
    echo "  1. XAMPP est démarré (Apache + MySQL)\n";
    echo "  2. MySQL fonctionne sur le port 3306\n";
    exit(1);
}
