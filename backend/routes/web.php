<?php
class Router {
    private $routes = [];

    public function addRoute($uri, $controllerMethod) {
        $this->routes[$uri] = $controllerMethod;
    }

    public function dispatch() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        if (array_key_exists($uri, $this->routes)) {
            list($controller, $method) = explode('@', $this->routes[$uri]);
            require_once "../app/Controllers/$controller.php";
            (new $controller())->$method();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Route non trouvée']);
        }
    }
}

// Exemple de route
$router = new Router();
$router->addRoute('/api/tasks', 'Api/TaskController@index');
