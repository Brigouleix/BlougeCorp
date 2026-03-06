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
require_once __DIR__ . '/../src/Controllers/AccountController.php';
require_once __DIR__ . '/../src/Controllers/CommentController.php';

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
$accountController = new AccountController($db);
$commentController = new CommentController($db);

$router->post('/api/register', [$authController, 'register']);
$router->post('/api/login', [$authController, 'login']);

$router->get('/api/groups', [$groupController, 'index']);
$router->post('/api/groups/create', [$groupController, 'create']);
$router->delete('/api/groups/{id}', [$groupController, 'delete']);

// Invitations
$router->get('/api/invitations', [$groupController, 'invitations']);
$router->post('/api/invitations/{id}/accept', [$groupController, 'acceptInvitation']);
$router->post('/api/invitations/{id}/decline', [$groupController, 'declineInvitation']);
$router->post('/api/invitations/send', [$groupController, 'sendInvitations']);

$router->post('/api/destinations', [$destinationController, 'create']);
$router->get('/api/destinations', [$destinationController, 'index']);
$router->get('/api/destinations/{id}', [$destinationController, 'show']);
$router->delete('/api/destinations/{id}', [$destinationController, 'delete']);

// Comments
$router->get('/api/destinations/{destId}/comments', [$commentController, 'index']);
$router->post('/api/destinations/{destId}/comments', [$commentController, 'create']);
$router->delete('/api/comments/{commentId}', [$commentController, 'delete']);

// Account
$router->put('/api/account/password', [$accountController, 'changePassword']);
$router->delete('/api/account', [$accountController, 'deleteAccount']);

$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
