<?php
// Routage pour le serveur PHP intégré
if (php_sapi_name() === 'cli-server') {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
        return false;
    }
}

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/JWT.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/GroupController.php';
require_once __DIR__ . '/../src/Controllers/DestinationController.php';

// Charger .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$router = new Router();
$db = Database::connect();

$authController = new AuthController($db);
$groupController = new GroupController($db);
$destinationController = new DestinationController($db);

$router->post('/api/register', [$authController, 'register']);
$router->post('/api/login', [$authController, 'login']);

$router->get('/api/groups', [$groupController, 'index']);
$router->post('/api/groups/create', [$groupController, 'create']);
$router->delete('/api/groups/{id}', [$groupController, 'delete']);

$router->post('/api/destinations', [$destinationController, 'create']);
$router->get('/api/destinations', [$destinationController, 'index']);

$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
