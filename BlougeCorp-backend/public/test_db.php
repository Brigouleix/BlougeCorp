<?php
//  Active l'affichage de toutes les erreurs pour faciliter le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//  Inclusion du fichier de connexion PDO
require_once __DIR__ . '/../config/database.php';

try {
    //  Étape 1 : Création d'une table temporaire pour le test
    $pdo->exec("
        CREATE TEMPORARY TABLE IF NOT EXISTS test_connexion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    //  Étape 2 : Insertion d’un message de test
    $insert = $pdo->prepare("INSERT INTO test_connexion (message) VALUES (:msg)");
    $insert->execute(['msg' => 'Test de connexion réussi !']);

    //  Étape 3 : Lecture du dernier message inséré
    $select = $pdo->query("SELECT * FROM test_connexion ORDER BY id DESC LIMIT 1");
    $result = $select->fetch(PDO::FETCH_ASSOC);

    //  Étape 4 : Suppression de la table temporaire (nettoyage)
    $pdo->exec("DROP TEMPORARY TABLE IF EXISTS test_connexion");

    //  Réponse JSON formatée en cas de succès
    echo json_encode([
        "success" => true,
        "message" => $result['message'],
        "created_at" => $result['created_at']
    ]);
} catch (PDOException $e) {
    //  Bloc de gestion des erreurs PDO (connexion, requêtes...)
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Erreur PDO : " . $e->getMessage()
    ]);
} catch (Exception $e) {
    //  Bloc de gestion des autres erreurs PHP éventuelles
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Erreur générale : " . $e->getMessage()
    ]);
}