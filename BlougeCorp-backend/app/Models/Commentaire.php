<?php
namespace App\Models;

use PDO;
use Exception;

class Commentaire
{
    private $db;

    public function __construct()
    {
        // Utilise la connexion PDO globale
        $this->db = $GLOBALS['db'];
    }

    public function create($contenu, $user_id, $destination_id)
    {
        $sql = "INSERT INTO commentaire (contenu, user_id, destination_id, created_at)
                VALUES (:contenu, :user_id, :destination_id, NOW())";

        $stmt = $this->db->prepare($sql);

        $stmt->bindParam(':contenu', $contenu);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':destination_id', $destination_id, PDO::PARAM_INT);


        if (!$stmt->execute()) {
            throw new Exception("Erreur lors de l'insertion du commentaire.");
        }

        return $this->db->lastInsertId();
    }
}
