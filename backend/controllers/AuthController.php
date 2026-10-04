<?php
// ====================================================================
// CONTROLADOR: AuthController
// Manejo de Registro, Inicio de Sesión, Cierre de Sesión y Perfil
// ====================================================================

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthController {
    private Usuario $usuarioModel;

    public function __construct() {
        $this->usuarioModel = new Usuario();
    }

    public function register(): void {
        $input = Response::getJsonInput();

        // Validaciones estrictas de campos requeridos
        $required = ['nombres', 'apellidopaterno', 'apellidomaterno', 'nombreusuario', 'correo', 'password'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es obligatorio.", 422);
            }
        }

        if (!filter_var($input['correo'], FILTER_VALIDATE_EMAIL)) {
            Response::error("El formato del correo electrónico no es válido.", 422);
        }

        if (strlen($input['password']) < 6) {
            Response::error("La contraseña debe contener al menos 6 caracteres.", 422);
        }

        // Verificar si el correo o nombre de usuario ya existen
        $existente = $this->usuarioModel->buscarPorCorreo($input['correo']);
        if ($existente) {
            Response::error("El correo electrónico ya se encuentra registrado.", 409);
        }

        try {
            $nuevoUsuario = $this->usuarioModel->registrar([
                'nombres'         => trim($input['nombres']),
                'apellidopaterno' => trim($input['apellidopaterno']),
                'apellidomaterno' => trim($input['apellidomaterno']),
                'celular'         => trim($input['celular'] ?? ''),
                'nombreusuario'   => trim($input['nombreusuario']),
                'correo'          => trim($input['correo']),
                'password'        => $input['password'],
                'rol'             => 'cliente', // Registro público siempre como cliente
            ]);

            // Crear sesión segura
            $_SESSION['usuario'] = [
                'idloginusuario'  => $nuevoUsuario['idloginusuario'],
                'idconsumidor'    => $nuevoUsuario['idconsumidor'],
                'rol'             => $nuevoUsuario['rol'],
                'correo'          => $nuevoUsuario['correo'],
                'nombreusuario'   => $nuevoUsuario['nombreusuario'],
                'nombres'         => $nuevoUsuario['nombres'],
                'apellidopaterno' => $nuevoUsuario['apellidopaterno'],
                'exp'             => time() + (86400 * 7),
            ];

            // Generar token para clientes que prefieran header Authorization
            $token = base64_encode(json_encode($_SESSION['usuario']));

            Response::json([
                'usuario' => $_SESSION['usuario'],
                'token'   => $token,
            ], 201, 'Usuario registrado exitosamente.');
        } catch (Exception $e) {
            error_log("Error en registro: " . $e->getMessage());
            Response::error('Error al registrar el usuario. Verifique que el nombre de usuario o correo no estén duplicados.', 400);
        }
    }

    public function login(): void {
        $input = Response::getJsonInput();

        if (empty($input['correo']) || empty($input['password'])) {
            Response::error('Debe ingresar correo y contraseña.', 422);
        }

        $usuario = $this->usuarioModel->buscarPorCorreo($input['correo']);

        if (!$usuario || !password_verify($input['password'], $usuario['password'])) {
            Response::error('Credenciales incorrectas. Verifique su correo y contraseña.', 401);
        }

        // Iniciar sesión en backend
        $datosSesion = [
            'idloginusuario'  => $usuario['idloginusuario'],
            'idconsumidor'    => $usuario['idconsumidor'],
            'rol'             => $usuario['rol'] ?? 'cliente',
            'correo'          => $usuario['correo'],
            'nombreusuario'   => $usuario['nombreusuario'],
            'nombres'         => $usuario['nombres'],
            'apellidopaterno' => $usuario['apellidopaterno'],
            'exp'             => time() + (86400 * 7),
        ];

        $_SESSION['usuario'] = $datosSesion;
        $token = base64_encode(json_encode($datosSesion));

        // NUNCA devolver el hash de password al cliente
        Response::json([
            'usuario' => $datosSesion,
            'token'   => $token,
        ], 200, 'Inicio de sesión exitoso.');
    }

    public function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        Response::json(null, 200, 'Sesión cerrada correctamente.');
    }

    public function me(): void {
        $auth = AuthMiddleware::requireAuth();
        $perfil = $this->usuarioModel->obtenerPorId((int)$auth['idconsumidor']);

        if (!$perfil) {
            Response::error('Usuario no encontrado.', 404);
        }

        Response::json($perfil);
    }

    public function updateProfile(): void {
        $auth = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        $required = ['nombres', 'apellidopaterno', 'apellidomaterno'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es obligatorio.", 422);
            }
        }

        $exito = $this->usuarioModel->actualizarPerfil((int)$auth['idconsumidor'], [
            'nombres'         => trim($input['nombres']),
            'apellidopaterno' => trim($input['apellidopaterno']),
            'apellidomaterno' => trim($input['apellidomaterno']),
            'celular'         => trim($input['celular'] ?? ''),
        ]);

        if ($exito) {
            $perfilActualizado = $this->usuarioModel->obtenerPorId((int)$auth['idconsumidor']);
            $_SESSION['usuario']['nombres'] = $perfilActualizado['nombres'];
            $_SESSION['usuario']['apellidopaterno'] = $perfilActualizado['apellidopaterno'];
            Response::json($perfilActualizado, 200, 'Perfil actualizado correctamente.');
        } else {
            Response::error('No se pudo actualizar el perfil.', 400);
        }
    }
}
