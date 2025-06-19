<?php
require_once "../app/models/Invitation.php";

class InvitationController {
    public function index() {
        $db = (new Database())->getConnection();
        $invitationModel = new Invitation($db);
        $invitations = $invitationModel->getAll();
        echo json_encode($invitations);
    }
}
