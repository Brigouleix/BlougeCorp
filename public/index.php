﻿<?php
// Gérer le CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Charger la base de données (adapté à ta config)
require_once __DIR__ . '/../config/database.php';

// Charger le routeur
require_once __DIR__ . '/../app/Core/Router.php';

use App\Core\Router;

spl_autoload_register(function ($class) {
    $baseDir = __DIR__ . '/../app/';

    // Enlever le préfixe "App\" du namespace pour mapper vers le dossier "app/"
    $prefix = 'App\\';

    if (strncmp($prefix, $class, strlen($prefix)) === 0) {
        $relativeClass = substr($class, strlen($prefix)); // Enlève "App\"
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

        var_dump($file);

        if (file_exists($file)) {
            require_once $file;
        } else {
            error_log("Autoload: Fichier non trouvé pour la classe $class (cherché : $file)");
        }
    }
});



try {
    $router = new Router();

    // Charger les routes
    require_once __DIR__ . '/../routes/web.php';

    // Dispatcher la requête HTTP actuelle
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
