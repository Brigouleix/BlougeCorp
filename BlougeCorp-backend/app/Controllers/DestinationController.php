<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Destination;
use PDO;
use Database;

class DestinationController extends Controller
{
    private Destination $model;
    private PDO $conn;

    public function __construct()
    {
        $this->model = new Destination();
        $this->conn = (new Database())->getConnection();
    }

    /** GET /api/destinations or /api/destinations/{groupId} */
    public function index(?int $groupId = null): void
    {
        $this->json($this->model->list($groupId));
    }

    /** POST /api/destinations/create */
    public function create(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant'], 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        // Champs requis
        $required = ['groupId','name','priceHouse','priceTravel','dates','proposedBy'];
        foreach ($required as $f) {
            if (!isset($data[$f]) || $data[$f] === '') {
                $this->json(['error' => "Champ $f manquant"], 400);
                return;
            }
        }

        // On vérifie que 'emails' est bien un tableau (optionnel mais recommandé)
        if (isset($data['emails']) && !is_array($data['emails'])) {
            $this->json(['error' => "Le champ 'emails' doit être un tableau d'adresses e-mail"], 400);
            return;
        }

        // Traduire les emails en IDs utilisateurs (via table users)
        $members = [];
        if (!empty($data['emails'])) {
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");

            foreach ($data['emails'] as $email) {
                $stmt->execute(['email' => $email]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user) {
                    $members[] = $user['id'];
                }
            }
        }

        // Injecter les membres (IDs) dans le payload pour le modèle
        $data['members'] = $members;

        // Création dans le modèle
        $dest = $this->model->create($data);
        if (!$dest) {
            $this->json(['error' => 'Erreur insertion destination'], 500);
            return;
        }
        $this->json($dest, 201);
    }

    /** DELETE /api/destinations/{id} */
    public function delete(int $id): void
    {
        if (!$this->model->delete($id)) {
            $this->json(['error' => 'Suppression impossible'], 500);
            return;
        }
        $this->json(['message' => 'Destination supprimée']);
    }
}
