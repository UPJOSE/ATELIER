<?php
// ====================================================================
// MIDDLEWARE DE AUTORIZACIÓN: ADMINISTRADOR
// ====================================================================

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../helpers/Response.php';

class AdminMiddleware {
    public static function requireAdmin(): array {
        $usuario = AuthMiddleware::requireAuth();

        if (($usuario['rol'] ?? '') !== 'admin') {
            Response::error('Acceso denegado. Se requieren privilegios de Administrador para esta acción.', 403);
            exit;
        }

        return $usuario;
    }
}
