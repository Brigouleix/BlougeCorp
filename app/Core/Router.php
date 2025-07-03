<?php
namespace App\Core;

class Router
{
    private $routes = [];

    public function addRoute($method, $uri, $action) {
        $this->routes[$method][$uri] = $action;
    }

    public function get($uri, $action) {
        $this->addRoute('GET', $uri, $action);
    }

    public function post($uri, $action) {
        $this->addRoute('POST', $uri, $action);
    }

    public function put($uri, $action) {
        $this->addRoute('PUT', $uri, $action);
    }

    public function delete($uri, $action) {
        $this->addRoute('DELETE', $uri, $action);
    }

public function dispatch($method, $uri) {
    // Extraire uniquement le chemin sans les query params
    $path = parse_url($uri, PHP_URL_PATH);

    // --- Gestion du basePath selon environnement ---
    // Définis ici le chemin relatif à retirer selon ta config
    // Par exemple, sous XAMPP, si ton projet est dans /BlougeCorp-backend/public
    // Sinon, vide la variable si tu utilises php -S localhost:8000 directement
    $basePath = '/BlougeCorp-backend/public';

    // Retirer le basePath du début si présent
    if ($basePath !== '' && strpos($path, $basePath) === 0) {
        $path = substr($path, strlen($basePath));
    }

    // Nettoyer les slashes superflus au début et fin
    $path = trim($path, '/');

    // -- Debug : afficher la méthode, le path traité, et toutes les routes --
    var_dump($method, $path, $this->routes);

    // Vérifier que la route existe dans le tableau des routes
    if (isset($this->routes[$method][$path])) {
        $action = $this->routes[$method][$path];

        if (is_callable($action)) {
            call_user_func($action);
        } else if (is_string($action)) {
            [$controllerName, $methodName] = explode('@', $action);

            $controllerClass = "\\App\\Controllers\\$controllerName";
            if (!class_exists($controllerClass)) {
                http_response_code(500);
                echo json_encode(['error' => "Contrôleur $controllerClass introuvable."]);
                return;
            }

            $controller = new $controllerClass();
            if (!method_exists($controller, $methodName)) {
                http_response_code(500);
                echo json_encode(['error' => "Méthode $methodName introuvable dans $controllerClass."]);
                return;
            }

            call_user_func([$controller, $methodName]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Action de route invalide']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Route non trouvée']);
    }
}


}

