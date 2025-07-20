<?php
//  Active l'affichage de toutes les erreurs pour faciliter le d�bogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//  Inclusion du fichier de connexion PDO
require_once __DIR__ . '/../config/database.php';

try {
    //  �tape 1 : Cr�ation d'une table temporaire pour le test
    $pdo->exec("
        CREATE TEMPORARY TABLE IF NOT EXISTS test_connexion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    //  �tape 2 : Insertion d�un message de test
    $insert = $pdo->prepare("INSERT INTO test_connexion (message) VALUES (:msg)");
    $insert->execute(['msg' => 'Test de connexion r�ussi !']);

    //  �tape 3 : Lecture du dernier message ins�r�
    $select = $pdo->query("SELECT * FROM test_connexion ORDER BY id DESC LIMIT 1");
    $result = $select->fetch(PDO::FETCH_ASSOC);

    //  �tape 4 : Suppression de la table temporaire (nettoyage)
    $pdo->exec("DROP TEMPORARY TABLE IF EXISTS test_connexion");

    //  R�ponse JSON format�e en cas de succ�s
    echo json_encode([
        "success" => true,
        "message" => $result['message'],
        "created_at" => $result['created_at']
    ]);
} catch (PDOException $e) {
    //  Bloc de gestion des erreurs PDO (connexion, requ�tes...)
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Erreur PDO : " . $e->getMessage()
    ]);
} catch (Exception $e) {
    //  Bloc de gestion des autres erreurs PHP �ventuelles
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Erreur g�n�rale : " . $e->getMessage()
    ]);
}