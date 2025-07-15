<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Destination;

class DestinationController extends Controller
{
    private Destination $model;

    public function __construct()
    {
        $this->model = new Destination();
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

        // validation minimale
        $required = ['groupId','name','priceHouse','priceTravel','dates','proposedBy'];
        foreach ($required as $f) {
            if (!isset($data[$f]) || $data[$f] === '') {
                $this->json(['error' => "Champ $f manquant"], 400);
                return;
            }
        }

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
