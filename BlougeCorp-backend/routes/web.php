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
$router->post('/users-by-emails', 'UserController@getUsersByEmails');


//  Groupes
$router->delete('api/groups/(\d+)', 'GroupController@delete');
$router->get('api/groups', 'GroupController@index');
$router->post('api/groups/create', 'GroupController@create');
$router->get('api/groups/(\d+)/members', 'GroupController@members');



// Destinations
$router->get   ('api/destinations', 'DestinationController@index');
$router->get   ('api/destinations/(\d+)', 'DestinationController@index');   
$router->post  ('api/destinations/create', 'DestinationController@create');
$router->delete('api/destinations/(\d+)', 'DestinationController@delete');

// commentaires
$router->post('api/commentaire/create', 'CommentaireController@create');
$router->delete('api/commentaire/(\d+)', 'CommentaireController@delete');
$router->get('api/commentaire/destination/(\d+)', 'CommentaireController@getByDestination');
$router->get('api/commentaire', 'CommentaireController@index'); 




