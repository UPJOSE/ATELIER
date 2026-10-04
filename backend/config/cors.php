<?php
// ====================================================================
// CONFIGURACIÓN DE CORS Y POLÍTICAS DE SESIÓN
// Permite peticiones seguras entre el frontend React y la API REST PHP
// ====================================================================

function handleCors(): void {
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://64.236.189.196',
        'https://64.236.189.196',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true) || empty($origin)) {
        header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
    } else {
        // En producción también puede permitirse el origen del propio host
        header("Access-Control-Allow-Origin: " . $origin);
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function initSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        // Configuración de cookie de sesión segura
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        
        session_set_cookie_params([
            'lifetime' => 86400 * 7, // 7 días
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => $isHttps ? 'None' : 'Lax',
        ]);
        session_start();
    }
}
