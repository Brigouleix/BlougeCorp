<?php
$host = 'localhost';
$db = 'blougecorp';
$user = 'root';
$pass = ''; // adapte selon ta config

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Connexion à la base de données échouée.']));
}
