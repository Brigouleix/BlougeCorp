<?php
require_once __DIR__ . '/../controllers/AuthController.php';

if (!isset($_GET['token'])) {
    die('Lien invalide.');
}

$token = $_GET['token'];
$controller = new AuthController();
$controller->confirmAccount($token);
