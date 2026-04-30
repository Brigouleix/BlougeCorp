<?php
// Point d'entrée de l'API BlougeCorp

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/JWT.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/GroupController.php';
require_once __DIR__ . '/../src/Controllers/DestinationController.php';
require_once __DIR__ . '/../src/Controllers/CommentController.php';
require_once __DIR__ . '/../src/Controllers/AccountController.php';
require_once __DIR__ . '/../src/Controllers/PhotoController.php';
require_once __DIR__ . '/../src/Controllers/RoadTripController.php';
require_once __DIR__ . '/../src/Controllers/AdminController.php';

// Charger .env depuis la racine du projet
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$router = new Router();
$db = Database::connect();

$authController        = new AuthController($db);
$groupController       = new GroupController($db);
$destinationController = new DestinationController($db);
$commentController     = new CommentController($db);
$accountController     = new AccountController($db);
$photoController       = new PhotoController($db);
$roadTripController    = new RoadTripController($db);
$adminController       = new AdminController($db);

// === Auth ===
$router->post('/api/register', [$authController, 'register']);
$router->post('/api/login',    [$authController, 'login']);
$router->post('/api/auth/forgot-password', [$authController, 'forgotPassword']);
$router->post('/api/auth/reset-password',  [$authController, 'resetPassword']);

// === Groups ===
$router->get('/api/groups',           [$groupController, 'index']);
$router->post('/api/groups/create',   [$groupController, 'create']);
$router->delete('/api/groups/{id}',   [$groupController, 'delete']);

// === Invitations ===
$router->get('/api/invitations',                  [$groupController, 'getInvitations']);
$router->post('/api/invitations/{id}/accept',     [$groupController, 'acceptInvitation']);
$router->post('/api/invitations/{id}/decline',    [$groupController, 'declineInvitation']);
$router->post('/api/invitations/send',            [$groupController, 'sendInvitations']);

// === Destinations ===
$router->get('/api/destinations',           [$destinationController, 'index']);
$router->get('/api/destinations/{id}',      [$destinationController, 'show']);
$router->post('/api/destinations',          [$destinationController, 'create']);
$router->put('/api/destinations/{id}',         [$destinationController, 'update']);
$router->patch('/api/destinations/{id}/archive', [$destinationController, 'archive']);
$router->delete('/api/destinations/{id}',        [$destinationController, 'delete']);

// === Road Trips ===
$router->get('/api/groups/{groupId}/roadtrips',    [$roadTripController, 'index']);
$router->post('/api/groups/{groupId}/roadtrips',   [$roadTripController, 'create']);
$router->delete('/api/roadtrips/{id}',             [$roadTripController, 'delete']);

// === Comments ===
$router->get('/api/destinations/{destId}/comments',  [$commentController, 'index']);
$router->post('/api/destinations/{destId}/comments', [$commentController, 'create']);
$router->delete('/api/comments/{commentId}',         [$commentController, 'delete']);

// === Photos ===
$router->get('/api/groups/{groupId}/photos',   [$photoController, 'index']);
$router->post('/api/groups/{groupId}/photos',  [$photoController, 'create']);
$router->delete('/api/photos/{photoId}',       [$photoController, 'delete']);

// === Account ===
$router->put('/api/account/password', [$accountController, 'changePassword']);
$router->delete('/api/account',       [$accountController, 'deleteAccount']);

// === Admin ===
$router->get('/api/admin/stats',                  [$adminController, 'stats']);
$router->get('/api/admin/users',                  [$adminController, 'users']);
$router->delete('/api/admin/users/{id}',          [$adminController, 'deleteUser']);
$router->get('/api/admin/groups',                 [$adminController, 'groups']);
$router->delete('/api/admin/groups/{id}',         [$adminController, 'deleteGroup']);
$router->get('/api/admin/destinations',           [$adminController, 'destinations']);
$router->delete('/api/admin/destinations/{id}',   [$adminController, 'deleteDestination']);
$router->post('/api/admin/test-email',             [$adminController, 'testEmail']);

// Dispatch
$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
