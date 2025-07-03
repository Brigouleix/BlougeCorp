<?php

$router->post('api/register', 'AuthController@register');
$router->get('api/users', 'UserController@index');
$router->get('api/register', function() {
    echo json_encode(['message' => 'Test GET route works']);
});
