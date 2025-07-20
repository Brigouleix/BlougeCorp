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

    // Validation des champs obligatoires sauf proposedBy
    $required = ['groupId', 'name', 'priceHouse', 'priceTravel', 'dates'];
    foreach ($required as $f) {
        if (!isset($data[$f]) || $data[$f] === '') {
            $this->json(['error' => "Champ $f manquant"], 400);
            return;
        }
    }

    // Forcer proposedBy � l'email de l'utilisateur connect�
    $data['proposedBy'] = $payload['email'];

    // V�rification emails
    if (isset($data['emails']) && !is_array($data['emails'])) {
        $this->json(['error' => "Le champ 'emails' doit �tre un tableau d'adresses e-mail"], 400);
        return;
    }

    // Traduction emails en IDs utilisateurs
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

    $data['members'] = $members;

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
        $this->json(['message' => 'Destination supprim�e']);
    }
}
