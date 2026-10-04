<?php
// ====================================================================
// CONTROLADOR: DireccionController (Direcciones, Ubigeo y Métodos de Pago)
// ====================================================================

require_once __DIR__ . '/../models/Direccion.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/Response.php';

class DireccionController {
    private Direccion $direccionModel;

    public function __construct() {
        $this->direccionModel = new Direccion();
    }

    public function index(): void {
        $user = AuthMiddleware::requireAuth();
        $direcciones = $this->direccionModel->listarPorConsumidor((int)$user['idconsumidor']);
        Response::json($direcciones);
    }

    public function store(): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        if (empty($input['iddistrito']) || empty($input['callenumero'])) {
            Response::error('Debe seleccionar un distrito e ingresar la calle y número.', 422);
        }

        try {
            $nueva = $this->direccionModel->crear((int)$user['idconsumidor'], $input);
            Response::json($nueva, 201, 'Dirección registrada correctamente.');
        } catch (Exception $e) {
            Response::error('Error al guardar la dirección: ' . $e->getMessage(), 400);
        }
    }

    public function update(int $id): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        if (empty($input['iddistrito']) || empty($input['callenumero'])) {
            Response::error('Debe seleccionar un distrito e ingresar la calle y número.', 422);
        }

        try {
            $this->direccionModel->actualizar($id, (int)$user['idconsumidor'], $input);
            Response::json(null, 200, 'Dirección actualizada.');
        } catch (Exception $e) {
            Response::error('Error al actualizar la dirección: ' . $e->getMessage(), 400);
        }
    }

    public function destroy(int $id): void {
        $user = AuthMiddleware::requireAuth();
        $this->direccionModel->eliminar($id, (int)$user['idconsumidor']);
        Response::json(null, 200, 'Dirección eliminada.');
    }

    public function setPrincipal(int $id): void {
        $user = AuthMiddleware::requireAuth();
        $this->direccionModel->establecerPrincipal($id, (int)$user['idconsumidor']);
        Response::json(null, 200, 'Dirección establecida como principal.');
    }

    // ---------------- UBIGEO ----------------

    public function departamentos(): void {
        $deps = $this->direccionModel->obtenerDepartamentos();
        Response::json($deps);
    }

    public function provincias(int $iddepartamento): void {
        $provs = $this->direccionModel->obtenerProvincias($iddepartamento);
        Response::json($provs);
    }

    public function distritos(int $idprovincia): void {
        $dist = $this->direccionModel->obtenerDistritos($idprovincia);
        Response::json($dist);
    }

    // ---------------- MÉTODOS DE PAGO ----------------

    public function listarMetodosPago(): void {
        $user = AuthMiddleware::requireAuth();
        $metodos = $this->direccionModel->listarMetodosPago((int)$user['idconsumidor']);
        Response::json($metodos);
    }

    public function crearMetodoPago(): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        if (empty($input['numero']) || empty($input['nombretitular'])) {
            Response::error('Número de tarjeta y nombre del titular son requeridos.', 422);
        }

        try {
            $nuevo = $this->direccionModel->crearMetodoPago((int)$user['idconsumidor'], $input);
            Response::json($nuevo, 201, 'Método de pago guardado.');
        } catch (Exception $e) {
            Response::error('Error al registrar método de pago: ' . $e->getMessage(), 400);
        }
    }
}
