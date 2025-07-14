<?php
namespace App\Models;
use PDO;
use Database;

class User
{
    private PDO $conn;

    public function __construct()
    {
        // on instancie Database et on récupère la connexion PDO
        $this->conn = (new \Database())->getConnection();
    }

    /* -----------  méthodes  ---------------- */

    /** Récupère un utilisateur par email */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }

    /** Insère un nouvel utilisateur et renvoie son id */
    public function create(
        string $email,
        string $motDePasse,
        string $username,
        string $token
    ): int {
        $stmt = $this->conn->prepare(
            'INSERT INTO users (email, mot_de_passe, nom, confirmation_token, est_confirme)
             VALUES (:email, :pwd, :username, :token, 0)'
        );
        $stmt->execute([
            'email'    => $email,
            'pwd'      => $motDePasse,
            'username' => $username,
            'token'    => $token,
        ]);
        return (int) $this->conn->lastInsertId();
    }

    /** Vérifie email + mot de passe (hash) */
    public function checkCredentials(string $email, string $password): ?array
    {
        $user = $this->findByEmail($email);
        if ($user && password_verify($password, $user['mot_de_passe'])) {
            return $user;
        }
        return null;
    }

    /** Confirme un compte via le token */
    public function confirmAccount(string $token): ?array
    {
        $stmt = $this->conn->prepare(
            'SELECT * FROM users WHERE confirmation_token = :tkn AND est_confirme = 0'
        );
        $stmt->execute(['tkn' => $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $upd = $this->conn->prepare(
                'UPDATE users SET est_confirme = 1, confirmation_token = NULL WHERE id = :id'
            );
            $upd->execute(['id' => $user['id']]);
            return $user;
        }
        return null;
    }
}
