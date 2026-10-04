<?php
// ====================================================================
// ENRUTADOR CENTRAL DE LA API REST - PHP 8.x
// Procesa peticiones HTTP/JSON y despacha a los controladores
// ====================================================================

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Controladores
require_once __DIR__ . '/../../controllers/AuthController.php';
require_once __DIR__ . '/../../controllers/ProductoController.php';
require_once __DIR__ . '/../../controllers/CategoriaController.php';
require_once __DIR__ . '/../../controllers/CarritoController.php';
require_once __DIR__ . '/../../controllers/VentaController.php';
require_once __DIR__ . '/../../controllers/DireccionController.php';
require_once __DIR__ . '/../../controllers/AdminController.php';

// Inicializar cabeceras CORS y sesión
handleCors();
initSession();

// Obtener método HTTP y URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar ruta: remover prefijos como /backend/public/api o /api
$prefix = '/api';
$pos = strpos($uri, $prefix);
if ($pos !== false) {
    $path = substr($uri, $pos + strlen($prefix));
} else {
    $path = $uri;
}
$path = '/' . trim($path, '/');
if ($path === '//' || $path === '') {
    $path = '/';
}

try {
    // ---------------- RUTAS PÚBLICAS: PRODUCTOS ----------------
    if ($method === 'GET' && $path === '/productos') {
        (new ProductoController())->index();
    }
    if ($method === 'GET' && $path === '/productos/destacados') {
        (new ProductoController())->destacados();
    }
    if ($method === 'GET' && $path === '/productos/ofertas') {
        (new ProductoController())->ofertas();
    }
    if ($method === 'GET' && preg_match('#^/productos/(\d+)$#', $path, $matches)) {
        (new ProductoController())->show((int)$matches[1]);
    }
    if ($method === 'GET' && preg_match('#^/productos/(\d+)/variantes$#', $path, $matches)) {
        (new ProductoController())->variantes((int)$matches[1]);
    }

    // ---------------- RUTAS PÚBLICAS: CATEGORÍAS Y MODELOS ----------------
    if ($method === 'GET' && $path === '/categorias') {
        (new CategoriaController())->index();
    }
    if ($method === 'GET' && preg_match('#^/categorias/(\d+)$#', $path, $matches)) {
        (new CategoriaController())->show((int)$matches[1]);
    }
    if ($method === 'GET' && $path === '/modelos') {
        (new CategoriaController())->modelos();
    }

    // ---------------- AUTENTICACIÓN ----------------
    if ($method === 'POST' && $path === '/auth/register') {
        (new AuthController())->register();
    }
    if ($method === 'POST' && $path === '/auth/login') {
        (new AuthController())->login();
    }
    if ($method === 'POST' && $path === '/auth/logout') {
        (new AuthController())->logout();
    }
    if ($method === 'GET' && $path === '/auth/me') {
        (new AuthController())->me();
    }

    // ---------------- CLIENTE: PERFIL Y DIRECCIONES ----------------
    if ($method === 'GET' && $path === '/perfil') {
        (new AuthController())->me();
    }
    if ($method === 'PUT' && $path === '/perfil') {
        (new AuthController())->updateProfile();
    }
    if ($method === 'GET' && $path === '/direcciones') {
        (new DireccionController())->index();
    }
    if ($method === 'POST' && $path === '/direcciones') {
        (new DireccionController())->store();
    }
    if ($method === 'PUT' && preg_match('#^/direcciones/(\d+)$#', $path, $matches)) {
        (new DireccionController())->update((int)$matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/direcciones/(\d+)$#', $path, $matches)) {
        (new DireccionController())->destroy((int)$matches[1]);
    }
    if ($method === 'PUT' && preg_match('#^/direcciones/(\d+)/principal$#', $path, $matches)) {
        (new DireccionController())->setPrincipal((int)$matches[1]);
    }

    // Ubigeo
    if ($method === 'GET' && $path === '/ubigeo/departamentos') {
        (new DireccionController())->departamentos();
    }
    if ($method === 'GET' && preg_match('#^/ubigeo/provincias/(\d+)$#', $path, $matches)) {
        (new DireccionController())->provincias((int)$matches[1]);
    }
    if ($method === 'GET' && preg_match('#^/ubigeo/distritos/(\d+)$#', $path, $matches)) {
        (new DireccionController())->distritos((int)$matches[1]);
    }

    // Métodos de pago
    if ($method === 'GET' && $path === '/metodos-pago') {
        (new DireccionController())->listarMetodosPago();
    }
    if ($method === 'POST' && $path === '/metodos-pago') {
        (new DireccionController())->crearMetodoPago();
    }

    // ---------------- CLIENTE: CARRITO ----------------
    if ($method === 'GET' && $path === '/carrito') {
        (new CarritoController())->getCart();
    }
    if ($method === 'POST' && $path === '/carrito/items') {
        (new CarritoController())->addItem();
    }
    if ($method === 'PUT' && preg_match('#^/carrito/items/(\d+)$#', $path, $matches)) {
        (new CarritoController())->updateItem((int)$matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/carrito/items/(\d+)$#', $path, $matches)) {
        (new CarritoController())->removeItem((int)$matches[1]);
    }
    if ($method === 'DELETE' && $path === '/carrito') {
        (new CarritoController())->clearCart();
    }

    // ---------------- CLIENTE: CHECKOUT Y PEDIDOS ----------------
    if ($method === 'POST' && $path === '/checkout') {
        (new VentaController())->checkout();
    }
    if ($method === 'GET' && $path === '/pedidos') {
        (new VentaController())->myOrders();
    }
    if ($method === 'GET' && preg_match('#^/pedidos/(\d+)$#', $path, $matches)) {
        (new VentaController())->showOrder((int)$matches[1]);
    }

    // ---------------- ADMINISTRADOR ----------------
    if ($method === 'GET' && $path === '/admin/dashboard') {
        (new AdminController())->dashboard();
    }

    // Admin Productos
    if ($method === 'GET' && $path === '/admin/productos') {
        (new AdminController())->productos();
    }
    if ($method === 'POST' && $path === '/admin/productos') {
        (new AdminController())->storeProducto();
    }
    if ($method === 'GET' && preg_match('#^/admin/productos/(\d+)$#', $path, $matches)) {
        (new AdminController())->getProducto((int)$matches[1]);
    }
    if ($method === 'PUT' && preg_match('#^/admin/productos/(\d+)$#', $path, $matches)) {
        (new AdminController())->updateProducto((int)$matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/productos/(\d+)$#', $path, $matches)) {
        (new AdminController())->deleteProducto((int)$matches[1]);
    }

    // Admin Variantes
    if ($method === 'GET' && $path === '/admin/variantes') {
        (new AdminController())->variantes();
    }
    if ($method === 'POST' && $path === '/admin/variantes') {
        (new AdminController())->storeVariante();
    }
    if ($method === 'PUT' && preg_match('#^/admin/variantes/(\d+)$#', $path, $matches)) {
        (new AdminController())->updateVariante((int)$matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/variantes/(\d+)$#', $path, $matches)) {
        (new AdminController())->deleteVariante((int)$matches[1]);
    }

    // Admin Categorías
    if ($method === 'GET' && $path === '/admin/categorias') {
        (new AdminController())->categorias();
    }
    if ($method === 'POST' && $path === '/admin/categorias') {
        (new AdminController())->storeCategoria();
    }
    if ($method === 'PUT' && preg_match('#^/admin/categorias/(\d+)$#', $path, $matches)) {
        (new AdminController())->updateCategoria((int)$matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/admin/categorias/(\d+)$#', $path, $matches)) {
        (new AdminController())->deleteCategoria((int)$matches[1]);
    }

    // Admin Modelos
    if ($method === 'GET' && $path === '/admin/modelos') {
        (new AdminController())->modelos();
    }
    if ($method === 'POST' && $path === '/admin/modelos') {
        (new AdminController())->storeModelo();
    }

    // Admin Pedidos
    if ($method === 'GET' && $path === '/admin/pedidos') {
        (new AdminController())->pedidos();
    }
    if ($method === 'GET' && preg_match('#^/admin/pedidos/(\d+)$#', $path, $matches)) {
        (new AdminController())->getPedido((int)$matches[1]);
    }
    if ($method === 'PUT' && preg_match('#^/admin/pedidos/(\d+)/estado$#', $path, $matches)) {
        (new AdminController())->updatePedidoEstado((int)$matches[1]);
    }

    // Admin Usuarios
    if ($method === 'GET' && $path === '/admin/usuarios') {
        (new AdminController())->usuarios();
    }

    // Ruta no encontrada en la API
    Response::error("Endpoint no encontrado: {$method} {$path}", 404);

} catch (Throwable $e) {
    error_log("Excepción no controlada en API: " . $e->getMessage() . " en " . $e->getFile() . ":" . $e->getLine());
    Response::error("Ocurrió un error en el servidor procesando la solicitud.", 500);
}
