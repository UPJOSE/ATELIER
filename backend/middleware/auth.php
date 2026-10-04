<?php
// ====================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ====================================================================

require_once __DIR__ . '/../helpers/Response.php';

class AuthMiddleware {
    public static function requireAuth(): array {
        // 1. Revisar sesión PHP
        if (!empty($_SESSION['usuario'])) {
            return $_SESSION['usuario'];
        }

        // 2. Soporte opcional para Authorization header Bearer token (en caso de clientes API o pruebas)
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            $decoded = json_decode(base64_decode($token), true);
            if (is_array($decoded) && !empty($decoded['idconsumidor']) && !empty($decoded['exp']) && $decoded['exp'] > time()) {
                $_SESSION['usuario'] = $decoded;
                return $decoded;
            }
        }

        Response::error('No autenticado. Por favor inicie sesión para continuar.', 401);
        exit;
    }

    public static function getOptionalUser(): ?array {
        if (!empty($_SESSION['usuario'])) {
            return $_SESSION['usuario'];
        }

        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            $decoded = json_decode(base64_decode($token), true);
            if (is_array($decoded) && !empty($decoded['idconsumidor']) && !empty($decoded['exp']) && $decoded['exp'] > time()) {
                return $decoded;
            }
        }

        return null;
    }
}
