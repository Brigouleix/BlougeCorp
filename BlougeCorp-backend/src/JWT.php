<?php

class JWT
{
    private static function getSecret(): string
    {
        return $_ENV['JWT_SECRET'] ?? 'blougecorp-default-secret-change-me';
    }

    public static function encode(array $payload): string
    {
        $header = self::base64url(['alg' => 'HS256', 'typ' => 'JWT']);

        $payload['iat'] = time();
        $payload['exp'] = time() + 86400; // 24h
        $body = self::base64url($payload);

        $signature = self::base64urlRaw(
            hash_hmac('sha256', "$header.$body", self::getSecret(), true)
        );

        return "$header.$body.$signature";
    }

    public static function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $signature] = $parts;

        $expected = self::base64urlRaw(
            hash_hmac('sha256', "$header.$body", self::getSecret(), true)
        );

        if (!hash_equals($expected, $signature)) return null;

        $payload = json_decode(base64_decode(strtr($body, '-_', '+/')), true);
        if (!$payload) return null;

        if (isset($payload['exp']) && $payload['exp'] < time()) return null;

        return $payload;
    }

    public static function getUserFromRequest(): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) return null;

        return self::decode($m[1]);
    }

    private static function base64url(array $data): string
    {
        return self::base64urlRaw(json_encode($data));
    }

    private static function base64urlRaw(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
