<?php
// ====================================================================
// CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL 16 (PDO_PGSQL)
// Soporta variables de entorno y archivo .env para máxima seguridad
// ====================================================================

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            self::loadEnv(__DIR__ . '/../.env');

            // Parámetros de conexión con prioridad:
            // 1. IP Privada de VM1 (si está configurada en entorno para VM2 -> VM1)
            // 2. IP Pública conocida de VM1 (20.25.217.22)
            $host = getenv('DB_HOST') ?: '20.25.217.22';
            $port = getenv('DB_PORT') ?: '5432';
            $dbname = getenv('DB_NAME') ?: 'ecommerce_db';
            $user = getenv('DB_USER') ?: 'ecommerce_user';
            $password = getenv('DB_PASSWORD') ?: 'ModaSecure2026!';

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};options='--client_encoding=UTF8'";

            try {
                self::$instance = new PDO($dsn, $user, $password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_TIMEOUT            => 5,
                ]);
            } catch (PDOException $e) {
                // Registro de error interno en logs del servidor sin exponer datos sensibles al cliente
                error_log("Error de conexión a PostgreSQL: " . $e->getMessage());
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'error'   => 'Error de conexión con la capa de datos. Por favor verifique el estado del servidor PostgreSQL.'
                ]);
                exit;
            }
        }
        return self::$instance;
    }

    private static function loadEnv(string $path): void {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (strpos($line, '=') !== false) {
                [$key, $val] = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val, " \t\n\r\0\x0B\"'");
                if (!getenv($key)) {
                    putenv("{$key}={$val}");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
    }
}
