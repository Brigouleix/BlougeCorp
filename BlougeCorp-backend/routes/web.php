<?php
$router->get('api/debug', function () {
    echo json_encode(['status' => 'OK', 'route' => 'api/debug']);
});

$router->get('api/confirm/([a-f0-9]{64})', 'AuthController@confirm');

$router->post('api/register', 'AuthController@register');
$router->get('api/users', 'UserController@index');
$router->post('api/login', 'AuthController@login');
$router->get('', function () {
    echo json_encode(['message' => 'Bienvenue sur l’API BlougeCorp (racine)']);
});

$router->get('index.php', function () {
    echo json_encode(['message' => 'Bienvenue via index.php']);
});
$router->get('api/groups', 'GroupController@index');

$router->post('api/groups/create', 'GroupController@create');
$router->post('api/test', function () {
    echo json_encode(['message' => 'Route test OK']);
});
$router->delete('api/groups/(\d+)', 'GroupController@delete');


