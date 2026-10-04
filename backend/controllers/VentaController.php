<?php
// ====================================================================
// CONTROLADOR: VentaController (Cliente Autenticado)
// ====================================================================

require_once __DIR__ . '/../models/Venta.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/Response.php';

class VentaController {
    private Venta $ventaModel;

    public function __construct() {
        $this->ventaModel = new Venta();
    }

    public function checkout(): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        $tipocomprobante = $input['tipocomprobante'] ?? 'Boleta';

        try {
            $resultado = $this->ventaModel->procesarCheckout((int)$user['idconsumidor'], $tipocomprobante);
            Response::json($resultado, 201, 'Compra realizada con éxito. Comprobante generado.');
        } catch (Exception $e) {
            error_log("Error en checkout: " . $e->getMessage());
            Response::error($e->getMessage(), 400);
        }
    }

    public function myOrders(): void {
        $user = AuthMiddleware::requireAuth();
        $pedidos = $this->ventaModel->listarPorCliente((int)$user['idconsumidor']);
        Response::json($pedidos);
    }

    public function showOrder(int $id): void {
        $user = AuthMiddleware::requireAuth();
        $pedido = $this->ventaModel->obtenerDetalle($id, (int)$user['idconsumidor']);

        if (!$pedido) {
            Response::error('Pedido no encontrado o no pertenece a su cuenta.', 404);
        }

        Response::json($pedido);
    }
}
