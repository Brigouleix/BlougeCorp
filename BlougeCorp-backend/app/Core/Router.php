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
    $path = parse_url($uri, PHP_URL_PATH);

    $basePath = '/BlougeCorp-backend/public';
    if ($basePath !== '' && strpos($path, $basePath) === 0) {
        $path = substr($path, strlen($basePath));
    }
    $path = trim($path, '/');

    // Gestion CORS preflight (OPTIONS)
    if ($method === 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        http_response_code(200);
        exit();
    }

    // Route match
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

