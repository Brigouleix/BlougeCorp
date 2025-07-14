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

    // Préflight OPTIONS
    if ($method === 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        http_response_code(200);
        exit();
    }

    // Route exacte
    if (isset($this->routes[$method][$path])) {
        $action = $this->routes[$method][$path];
        return $this->executeAction($action);
    }

    // Parcourir les routes avec paramètres (regex)
    foreach ($this->routes[$method] as $pattern => $action) {
        $regex = '#^' . $pattern . '$#';
        if (preg_match($regex, $path, $matches)) {
            array_shift($matches); // Supprime le match complet
            return $this->executeAction($action, $matches);
        }
    }

    http_response_code(404);
    echo json_encode(['message' => 'Route non trouvée']);
}

private function executeAction($action, $params = []) {
    if (is_callable($action)) {
        call_user_func_array($action, $params);
    } elseif (is_string($action)) {
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

        call_user_func_array([$controller, $methodName], $params);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Action de route invalide']);
    }
}




}

