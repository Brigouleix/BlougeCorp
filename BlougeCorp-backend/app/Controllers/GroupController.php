<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Models\Group;

class GroupController
{
    
    public function create(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token manquant ou invalide']);
            return;
        }
        $creatorId = (int)$payload['sub'];

        $data = json_decode(file_get_contents('php://input'), true);
        $name        = $data['name']        ?? '';
        $emails      = $data['emails']      ?? [];
        $image       = $data['image']       ?? null;
        $description = $data['description'] ?? null;

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Nom requis.']);
            return;
        }

        $groupModel = new Group();
        $ok = $groupModel->create($name, $emails, $creatorId, $image, $description);

        echo json_encode(['success' => $ok]);
    }

    
    public function index(): void
    {
        $payload = Auth::checkToken();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token manquant ou invalide']);
            return;
        }

        $userEmail = $payload['email'];     

        $groupModel = new Group();
        $groups = $groupModel->findForUserEmail($userEmail);

        echo json_encode($groups);
    }

    public function delete($id)
{
    // Récupérer l'utilisateur connecté via JWT ou session
    $user = Auth::checkToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorisé']);
        return;
    }

    $group = Group::find($id);
    if (!$group) {
        http_response_code(404);
        echo json_encode(['error' => 'Groupe non trouvé']);
        return;
    }

    // Vérifie si l'utilisateur est l'auteur/admin
    if ($group->creator !== $user['sub']) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès refusé']);
        return;
    }

    // Suppression
    if ($group->delete()) {
        echo json_encode(['message' => 'Groupe supprimé avec succès']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la suppression']);
    }
}


}
