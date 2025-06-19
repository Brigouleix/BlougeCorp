<?php
namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class User
{
    public static function findByEmail($email) {
        global $pdo;
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create($email, $motDePasse, $username) {
        global $pdo;
        $stmt = $pdo->prepare("INSERT INTO users (email, mot_de_passe, nom) VALUES (?, ?, ?)");
        $stmt->execute([$email, $motDePasse, $username]);
        return $pdo->lastInsertId();
    }

    public static function findByEmailAndPassword($email, $password) {
        $user = self::findByEmail($email);
        if ($user && password_verify($password, $user['mot_de_passe'])) {
            return $user;
        }
        return null;
    }
}
