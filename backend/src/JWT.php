<?php

class JWT
{
    private static function getSecret(): string
    {
        return $_ENV['JWT_SECRET'] ?? 'default-secret';
    }

    public static function encode(array $payload): string
    {
        $header = self::b64(['alg' => 'HS256', 'typ' => 'JWT']);
        $payload['iat'] = time();
        $payload['exp'] = time() + 86400;
        $body = self::b64($payload);
        $sig = self::b64raw(hash_hmac('sha256', "$header.$body", self::getSecret(), true));
        return "$header.$body.$sig";
    }

    public static function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $sig] = $parts;
        $expected = self::b64raw(hash_hmac('sha256', "$header.$body", self::getSecret(), true));
        if (!hash_equals($expected, $sig)) return null;

        $payload = json_decode(base64_decode(strtr($body, '-_', '+/')), true);
        if (!$payload || (isset($payload['exp']) && $payload['exp'] < time())) return null;

        return $payload;
    }

    public static function getUserFromRequest(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) return null;
        return self::decode($m[1]);
    }

    private static function b64(array $data): string
    {
        return self::b64raw(json_encode($data));
    }

    private static function b64raw(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
