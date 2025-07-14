<?php
namespace App\Core;

class Controller
{
    protected function json($data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit; // continue de bien sortir ici
    }

}
