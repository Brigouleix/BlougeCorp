<?php
require_once "../app/models/Utilisateur.php";

class UtilisateurController {
    public function index() {
        $db = (new Database())->getConnection();
        $utilisateurModel = new Utilisateur($db);
        $utilisateurs = $utilisateurModel->getAll();
        echo json_encode($utilisateurs);
    }
    public function getUsersByEmails() {
    $data = json_decode(file_get_contents("php://input"), true);
    $emails = $data['emails'] ?? [];

    if (empty($emails)) {
        http_response_code(400);
        echo json_encode(["error" => "Emails manquants"]);
        return;
    }

    $placeholders = implode(',', array_fill(0, count($emails), '?'));
    $stmt = $this->pdo->prepare("SELECT email, nom FROM users WHERE email IN ($placeholders)");
    $stmt->execute($emails);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);
}

}
