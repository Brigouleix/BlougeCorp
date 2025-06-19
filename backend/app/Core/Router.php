<?php
namespace App\Core;

class Router
{
    private $routes = [];

    public function post($uri, $action) {
        $this->routes['POST'][$uri] = $action;
    }

    public function dispatch($method, $uri) {
        $uri = trim(parse_url($uri, PHP_URL_PATH), '/');

        if (isset($this->routes[$method][$uri])) {
            [$controllerName, $methodName] = explode('@', $this->routes[$method][$uri]);

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
            http_response_code(404);
            echo json_encode(['message' => 'Route non trouvée']);
        }
    }
}
