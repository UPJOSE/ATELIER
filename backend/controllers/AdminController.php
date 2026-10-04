<?php
// ====================================================================
// CONTROLADOR: AdminController (Exclusivo Administrador: rol = 'admin')
// ====================================================================

require_once __DIR__ . '/../middleware/admin.php';
require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/VarianteProducto.php';
require_once __DIR__ . '/../models/Categoria.php';
require_once __DIR__ . '/../models/Venta.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../helpers/Response.php';

class AdminController {
    private Producto $productoModel;
    private VarianteProducto $varianteModel;
    private Categoria $categoriaModel;
    private Venta $ventaModel;
    private Usuario $usuarioModel;

    public function __construct() {
        // Exige rol 'admin' de inmediato
        AdminMiddleware::requireAdmin();

        $this->productoModel = new Producto();
        $this->varianteModel = new VarianteProducto();
        $this->categoriaModel = new Categoria();
        $this->ventaModel = new Venta();
        $this->usuarioModel = new Usuario();
    }

    // ---------------- DASHBOARD ----------------

    public function dashboard(): void {
        $stats = $this->ventaModel->obtenerEstadisticasDashboard();
        Response::json($stats);
    }

    // ---------------- PRODUCTOS CRUD ----------------

    public function productos(): void {
        $filtros = [
            'buscar'    => $_GET['buscar'] ?? '',
            'categoria' => $_GET['categoria'] ?? '',
        ];
        $productos = $this->productoModel->listar($filtros);
        Response::json($productos);
    }

    public function getProducto(int $id): void {
        $producto = $this->productoModel->obtenerPorId($id);
        if (!$producto) {
            Response::error('Producto no encontrado.', 404);
        }
        Response::json($producto);
    }

    public function storeProducto(): void {
        $input = Response::getJsonInput();

        $required = ['idtipoproducto', 'idmodelo', 'nombreproducto', 'preciobase'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es requerido.", 422);
            }
        }

        try {
            $nuevo = $this->productoModel->crear($input);
            Response::json($nuevo, 201, 'Producto creado exitosamente.');
        } catch (Exception $e) {
            Response::error('Error al registrar el producto: ' . $e->getMessage(), 400);
        }
    }

    public function updateProducto(int $id): void {
        $input = Response::getJsonInput();

        $required = ['idtipoproducto', 'idmodelo', 'nombreproducto', 'preciobase'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es requerido.", 422);
            }
        }

        try {
            $this->productoModel->actualizar($id, $input);
            $actualizado = $this->productoModel->obtenerPorId($id);
            Response::json($actualizado, 200, 'Producto modificado exitosamente.');
        } catch (Exception $e) {
            Response::error('Error al actualizar el producto: ' . $e->getMessage(), 400);
        }
    }

    public function deleteProducto(int $id): void {
        try {
            $this->productoModel->eliminar($id);
            Response::json(null, 200, 'Producto eliminado exitosamente.');
        } catch (Exception $e) {
            // Manejo de conflicto de integridad referencial con ventas existentes
            Response::error($e->getMessage(), 409);
        }
    }

    // ---------------- VARIANTES / INVENTARIO CRUD ----------------

    public function variantes(): void {
        $idproducto = isset($_GET['idproducto']) ? (int)$_GET['idproducto'] : null;
        $variantes = $this->varianteModel->listarTodas($idproducto);
        Response::json($variantes);
    }

    public function storeVariante(): void {
        $input = Response::getJsonInput();

        $required = ['idproducto', 'talla', 'color'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es obligatorio.", 422);
            }
        }

        $stock = isset($input['stock']) ? (int)$input['stock'] : 0;

        try {
            $nueva = $this->varianteModel->crear(
                (int)$input['idproducto'],
                $stock,
                $input['talla'],
                $input['color']
            );
            Response::json($nueva, 201, 'Variante e inventario registrados.');
        } catch (Exception $e) {
            Response::error('Error al crear la variante: ' . $e->getMessage(), 400);
        }
    }

    public function updateVariante(int $id): void {
        $input = Response::getJsonInput();

        $required = ['talla', 'color'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                Response::error("El campo '{$field}' es obligatorio.", 422);
            }
        }

        $stock = isset($input['stock']) ? (int)$input['stock'] : 0;

        try {
            $this->varianteModel->actualizar($id, $stock, $input['talla'], $input['color']);
            $actualizada = $this->varianteModel->obtenerPorId($id);
            Response::json($actualizada, 200, 'Variante actualizada correctamente.');
        } catch (Exception $e) {
            Response::error('Error al actualizar la variante: ' . $e->getMessage(), 400);
        }
    }

    public function deleteVariante(int $id): void {
        try {
            $this->varianteModel->eliminar($id);
            Response::json(null, 200, 'Variante eliminada.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 409);
        }
    }

    // ---------------- CATEGORÍAS (TIPOPRODUCTO) CRUD ----------------

    public function categorias(): void {
        $cats = $this->categoriaModel->listarTipos();
        Response::json($cats);
    }

    public function storeCategoria(): void {
        $input = Response::getJsonInput();
        if (empty($input['nombretipo'])) {
            Response::error("El campo 'nombretipo' es requerido.", 422);
        }

        try {
            $nueva = $this->categoriaModel->crearTipo($input['nombretipo']);
            Response::json($nueva, 201, 'Categoría creada.');
        } catch (Exception $e) {
            Response::error('Error al crear categoría: ' . $e->getMessage(), 400);
        }
    }

    public function updateCategoria(int $id): void {
        $input = Response::getJsonInput();
        if (empty($input['nombretipo'])) {
            Response::error("El campo 'nombretipo' es requerido.", 422);
        }

        try {
            $this->categoriaModel->actualizarTipo($id, $input['nombretipo']);
            Response::json(null, 200, 'Categoría actualizada.');
        } catch (Exception $e) {
            Response::error('Error al actualizar categoría: ' . $e->getMessage(), 400);
        }
    }

    public function deleteCategoria(int $id): void {
        try {
            $this->categoriaModel->eliminarTipo($id);
            Response::json(null, 200, 'Categoría eliminada.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 409);
        }
    }

    // ---------------- MODELOS ----------------

    public function modelos(): void {
        $modelos = $this->categoriaModel->listarModelos();
        Response::json($modelos);
    }

    public function storeModelo(): void {
        $input = Response::getJsonInput();
        if (empty($input['nombremodelo'])) {
            Response::error("El campo 'nombremodelo' es requerido.", 422);
        }

        try {
            $nuevo = $this->categoriaModel->crearModelo($input['nombremodelo']);
            Response::json($nuevo, 201, 'Modelo registrado.');
        } catch (Exception $e) {
            Response::error('Error al crear modelo: ' . $e->getMessage(), 400);
        }
    }

    // ---------------- PEDIDOS / VENTAS ----------------

    public function pedidos(): void {
        $filtros = [
            'estado' => $_GET['estado'] ?? '',
            'buscar' => $_GET['buscar'] ?? '',
        ];
        $pedidos = $this->ventaModel->listarTodasAdmin($filtros);
        Response::json($pedidos);
    }

    public function getPedido(int $id): void {
        $pedido = $this->ventaModel->obtenerDetalle($id);
        if (!$pedido) {
            Response::error('Pedido no encontrado.', 404);
        }
        Response::json($pedido);
    }

    public function updatePedidoEstado(int $id): void {
        $input = Response::getJsonInput();
        if (empty($input['estadoventa'])) {
            Response::error("El campo 'estadoventa' es requerido.", 422);
        }

        try {
            $this->ventaModel->actualizarEstado($id, $input['estadoventa']);
            $pedido = $this->ventaModel->obtenerDetalle($id);
            Response::json($pedido, 200, 'Estado del pedido actualizado.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    // ---------------- USUARIOS ----------------

    public function usuarios(): void {
        $usuarios = $this->usuarioModel->listarTodos();
        Response::json($usuarios);
    }
}
