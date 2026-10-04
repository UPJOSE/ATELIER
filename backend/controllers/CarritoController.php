<?php
// ====================================================================
// CONTROLADOR: CarritoController (Cliente Autenticado)
// ====================================================================

require_once __DIR__ . '/../models/Carrito.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/Response.php';

class CarritoController {
    private Carrito $carritoModel;

    public function __construct() {
        $this->carritoModel = new Carrito();
    }

    public function getCart(): void {
        $user = AuthMiddleware::requireAuth();
        $carrito = $this->carritoModel->obtenerCarritoConItems((int)$user['idconsumidor']);
        Response::json($carrito);
    }

    public function addItem(): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        if (empty($input['idinventario'])) {
            Response::error('Debe seleccionar una variante de producto válida.', 422);
        }

        $idinventario = (int)$input['idinventario'];
        $cantidad = isset($input['cantidad']) ? (int)$input['cantidad'] : 1;

        try {
            $carritoActualizado = $this->carritoModel->agregarItem((int)$user['idconsumidor'], $idinventario, $cantidad);
            Response::json($carritoActualizado, 200, 'Producto agregado al carrito.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function updateItem(int $id): void {
        $user = AuthMiddleware::requireAuth();
        $input = Response::getJsonInput();

        if (!isset($input['cantidad'])) {
            Response::error('Debe especificar la nueva cantidad.', 422);
        }

        $cantidad = (int)$input['cantidad'];

        try {
            $carritoActualizado = $this->carritoModel->actualizarCantidad((int)$user['idconsumidor'], $id, $cantidad);
            Response::json($carritoActualizado, 200, 'Cantidad actualizada.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function removeItem(int $id): void {
        $user = AuthMiddleware::requireAuth();

        try {
            $carritoActualizado = $this->carritoModel->eliminarItem((int)$user['idconsumidor'], $id);
            Response::json($carritoActualizado, 200, 'Item removido del carrito.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function clearCart(): void {
        $user = AuthMiddleware::requireAuth();
        $this->carritoModel->vaciarCarrito((int)$user['idconsumidor']);
        Response::json(['items' => [], 'total_items' => 0, 'total_monto' => 0], 200, 'Carrito vaciado.');
    }
}
