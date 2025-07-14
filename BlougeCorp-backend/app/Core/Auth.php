<?php
namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class Auth
{
   
    private static function secret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'CLE_PAR_DEFAUT';
        error_log('[Auth::secret] JWT_SECRET utilisé : ' . $secret); 
        return $secret;
    }


    
    public static function checkToken(): ?array
{
    // AJOUT DE TRACE TEMPORAIRE
    file_put_contents(
        __DIR__ . '/../../debug_token.log',
        date('[Y-m-d H:i:s] ') .
        'Authorization: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'ABSENT') . PHP_EOL,
        FILE_APPEND
    );
    // 

    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!preg_match('/^Bearer\s+(.+)$/i', $hdr, $m)) {
        return null;
    }

    try {
        $decoded = JWT::decode($m[1], new Key(self::secret(), 'HS256'));
        return (array)$decoded;
    } catch (\Throwable $e) {
        //  trace l’erreur JWT
        file_put_contents(
            __DIR__ . '/../../debug_token.log',
            date('[Y-m-d H:i:s] ') . 'JWT error: ' . $e->getMessage() . PHP_EOL,
            FILE_APPEND
        );
        return null;
    }
}


   
    public static function generateToken(int $userId, string $email): string
    {
        $payload = [
            'sub'   => $userId,
            'email' => $email,
            'exp'   => time() + 3600, 
        ];
        return JWT::encode($payload, self::secret(), 'HS256');
    }
}