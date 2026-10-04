<?php
// ====================================================================
// CONTROLADOR: CategoriaController (Público)
// ====================================================================

require_once __DIR__ . '/../models/Categoria.php';
require_once __DIR__ . '/../helpers/Response.php';

class CategoriaController {
    private Categoria $categoriaModel;

    public function __construct() {
        $this->categoriaModel = new Categoria();
    }

    public function index(): void {
        $categorias = $this->categoriaModel->listarTipos();
        Response::json($categorias);
    }

    public function show(int $id): void {
        $categoria = $this->categoriaModel->obtenerTipoPorId($id);
        if (!$categoria) {
            Response::error('Categoría no encontrada.', 404);
        }
        Response::json($categoria);
    }

    public function modelos(): void {
        $modelos = $this->categoriaModel->listarModelos();
        Response::json($modelos);
    }
}
