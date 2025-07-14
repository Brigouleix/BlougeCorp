<?php
require_once "../app/models/Utilisateur.php";

class UtilisateurController {
    public function index() {
        $db = (new Database())->getConnection();
        $utilisateurModel = new Utilisateur($db);
        $utilisateurs = $utilisateurModel->getAll();
        echo json_encode($utilisateurs);
    }
}
