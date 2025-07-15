<?php
$router->get('api/debug-group/(\d+)', function ($id) {
    echo json_encode(['debug' => 'Route OK pour ID ' . $id]);
});


//  Routes système / debug / test
$router->get('', function () {
    echo json_encode(['message' => 'Bienvenue sur l’API BlougeCorp (racine)']);
});
$router->get('index.php', function () {
    echo json_encode(['message' => 'Bienvenue via index.php']);
});
$router->get('api/debug', function () {
    echo json_encode(['status' => 'OK', 'route' => 'api/debug']);
});
$router->post('api/test', function () {
    echo json_encode(['message' => 'Route test OK']);
});

//  Authentification & utilisateurs
$router->post('api/register', 'AuthController@register');
$router->post('api/login', 'AuthController@login');
$router->get('api/confirm/([a-f0-9]{64})', 'AuthController@confirm');
$router->get('api/users', 'UserController@index');

//  Groupes
$router->delete('api/groups/(\d+)', 'GroupController@delete');
$router->get('api/groups', 'GroupController@index');
$router->post('api/groups/create', 'GroupController@create');


// Destinations
$router->get   ('api/destinations',                 'DestinationController@index');
$router->get   ('api/destinations/(\d+)',           'DestinationController@index');   // liste d’un groupe
$router->post  ('api/destinations/create',          'DestinationController@create');
$router->delete('api/destinations/(\d+)',           'DestinationController@delete');
