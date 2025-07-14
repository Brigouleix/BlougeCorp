<?php

namespace App\Controllers;

use PDO;
use Exception;

class DestinationController
{
    private $pdo;

    public function __construct()
    {
        require_once __DIR__ . '/../../config/database.php';
        $this->pdo = $pdo;
    }

    public function index()
    {
        try {
            $stmt = $this->pdo->query("SELECT * FROM destinations");
            $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($destinations);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la récupération des destinations"]);
        }
    }

    public function create()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['name'], $data['priceHouse'], $data['priceTravel'], $data['dates'], $data['proposedBy'])) {
            http_response_code(400);
            echo json_encode(["error" => "Champs manquants"]);
            return;
        }

        // Nettoyage et fallback
        $name = $data['name'];
        $image = $data['image'] ?? null;
        $priceHouse = $data['priceHouse'];
        $priceTravel = $data['priceTravel'];
        $dates = $data['dates'];
        $proposedBy = $data['proposedBy'];
        $members = isset($data['members']) ? json_encode($data['members']) : json_encode([]);
        $location = isset($data['location']) ? json_encode($data['location']) : null;

        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO destinations (name, image, priceHouse, priceTravel, dates, proposedBy, members, location)
                VALUES (:name, :image, :priceHouse, :priceTravel, :dates, :proposedBy, :members, :location)
            ");

            $stmt->execute([
                ':name' => $name,
                ':image' => $image,
                ':priceHouse' => $priceHouse,
                ':priceTravel' => $priceTravel,
                ':dates' => $dates,
                ':proposedBy' => $proposedBy,
                ':members' => $members,
                ':location' => $location
            ]);

            echo json_encode(["message" => "Destination créée avec succès"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'insertion : " . $e->getMessage()]);
        }
    }
}
