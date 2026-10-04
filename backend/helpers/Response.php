<?php
// ====================================================================
// CLASE HELPER PARA RESPUESTAS JSON Y PROCESAMIENTO DE INPUTS
// ====================================================================

class Response {
    public static function json(mixed $data, int $statusCode = 200, string $message = ''): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => $statusCode >= 200 && $statusCode < 300,
        ];

        if ($message !== '') {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $statusCode = 400, mixed $errors = null): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => false,
            'error'   => $message,
        ];

        if ($errors !== null) {
            $response['details'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return $_POST ?? [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
