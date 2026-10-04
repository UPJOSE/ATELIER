<?php
// ====================================================================
// CONTROLADOR: ProductoController (Público)
// ====================================================================

require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/VarianteProducto.php';
require_once __DIR__ . '/../helpers/Response.php';

class ProductoController {
    private Producto $productoModel;
    private VarianteProducto $varianteModel;

    public function __construct() {
        $this->productoModel = new Producto();
        $this->varianteModel = new VarianteProducto();
    }

    public function index(): void {
        $filtros = [
            'buscar'       => $_GET['buscar'] ?? '',
            'categoria'    => $_GET['categoria'] ?? '',
            'modelo'       => $_GET['modelo'] ?? '',
            'talla'        => $_GET['talla'] ?? '',
            'color'        => $_GET['color'] ?? '',
            'solo_ofertas' => $_GET['solo_ofertas'] ?? '',
            'orden'        => $_GET['orden'] ?? '',
        ];

        $productos = $this->productoModel->listar($filtros);
        Response::json($productos);
    }

    public function show(int $id): void {
        $producto = $this->productoModel->obtenerPorId($id);

        if (!$producto) {
            Response::error('Producto no encontrado.', 404);
        }

        Response::json($producto);
    }

    public function variantes(int $id): void {
        $producto = $this->productoModel->obtenerPorId($id);
        if (!$producto) {
            Response::error('Producto no encontrado.', 404);
        }

        $variantes = $this->varianteModel->listarPorProducto($id);
        Response::json($variantes);
    }

    public function destacados(): void {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;
        $productos = $this->productoModel->obtenerDestacados($limit);
        Response::json($productos);
    }

    public function ofertas(): void {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 8;
        $productos = $this->productoModel->obtenerOfertas($limit);
        Response::json($productos);
    }
}
