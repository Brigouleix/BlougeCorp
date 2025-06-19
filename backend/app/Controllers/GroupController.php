<?php
namespace App\Controllers;

use App\Models\Group;
use App\Mail\Mailer;

class GroupController {
    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);

        $name = $data['name'] ?? '';
        $emails = $data['emails'] ?? [];
        $creatorId = $data['creator_id'] ?? null;
        $image = $data['image'] ?? null;

        if (!$name || !$creatorId) {
            http_response_code(400);
            echo json_encode(['error' => 'Nom et créateur requis.']);
            return;
        }

        $groupModel = new Group();
        $validMembers = [];

        foreach ($emails as $email) {
            $userId = $groupModel->userExists($email);
            if ($userId) {
                Mailer::sendInvitation($email, $name);
            } else {
                Mailer::sendSignup($email);
            }
            $validMembers[] = $email;
        }

        $success = $groupModel->create($name, $validMembers, $creatorId, $image);
        echo json_encode(['success' => $success]);
    }
}
