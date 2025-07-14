<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Group;

/**
 * CRUD (minimal) des groupes.
 */
class GroupController extends Controller
{
    public function index(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant ou invalide'], 401);
            return;
        }

        $groupModel = new Group();
        $groups = $groupModel->findForUserEmail($payload['email']);

        $this->json($groups);
    }


    public function create(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant ou invalide'], 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $name        = $data['name']        ?? '';
        $emails      = $data['emails']      ?? [];
        $image       = $data['image']       ?? null;
        $description = $data['description'] ?? null;

        if (!$name) {
            $this->json(['error' => 'Nom requis.'], 400);
            return;
        }

        $groupModel = new Group();
        $ok = $groupModel->create($name, $emails, (int)$payload['sub'], $image, $description);

        $this->json(['success' => $ok]);
    }

 
    public function delete(int $id): void
    {   
        error_log("GroupController::delete called with id = $id");
        $payload = Auth::checkToken();
        if (!$payload) {
            $this->json(['error' => 'Token manquant ou invalide'], 401);
            return;
        }

        $groupModel = new Group();
        $group = $groupModel->find($id);

        if (!$group) {
            $this->json(['error' => 'Groupe non trouvé'], 404);
            return;
        }

        if ((int)$group['creator_id'] !== (int)$payload['sub']) {
            $this->json(['error' => 'Accès refusé'], 403);
            return;
        }

        if ($groupModel->delete($id)) {
            $this->json(['message' => 'Groupe supprimé avec succès']);
        } else {
            $this->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }
}
