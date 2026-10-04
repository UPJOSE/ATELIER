<?php
// ====================================================================
// MODELO: Venta (Tablas: venta, ventadetalle, comprobantepago, varianteproducto)
// ====================================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Carrito.php';

class Venta {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function procesarCheckout(int $idconsumidor, string $tipocomprobante = 'Boleta'): array {
        $carritoModel = new Carrito();
        $carrito = $carritoModel->obtenerCarritoConItems($idconsumidor);

        if (empty($carrito['items'])) {
            throw new Exception("El carrito de compras está vacío.");
        }

        $this->db->beginTransaction();
        try {
            $totalCalculado = 0.0;
            $itemsParaInsertar = [];

            // 1. Validar y bloquear stock con SELECT FOR UPDATE
            foreach ($carrito['items'] as $item) {
                $idvar = (int)$item['idinventario'];
                $cant = (int)$item['cantidad'];

                $stmtLock = $this->db->prepare("
                    SELECT stock 
                    FROM varianteproducto 
                    WHERE idvarianteproducto = :id 
                    FOR UPDATE
                ");
                $stmtLock->execute([':id' => $idvar]);
                $stockActual = (int)$stmtLock->fetchColumn();

                if ($stockActual < $cant) {
                    throw new Exception("Stock insuficiente para '{$item['nombreproducto']}' ({$item['talla']}/{$item['color']}). Stock disponible: {$stockActual}.");
                }

                $precioAplicable = !empty($item['preciooferta']) && (float)$item['preciooferta'] > 0 
                    ? (float)$item['preciooferta'] 
                    : (float)$item['preciobase'];

                $subtotal = $precioAplicable * $cant;
                $totalCalculado += $subtotal;

                $itemsParaInsertar[] = [
                    'idinventario'      => $idvar,
                    'cantidadproductos' => $cant,
                    'preciounitario'    => $precioAplicable,
                    'subtotal'          => $subtotal,
                ];
            }

            // 2. Insertar cabecera en venta
            $stmtVenta = $this->db->prepare("
                INSERT INTO venta (idconsumidor, estadoventa, montototal, fechaventa)
                VALUES (:idconsumidor, 'pagado', :montototal, CURRENT_TIMESTAMP)
                RETURNING idventa, fechaventa
            ");
            $stmtVenta->execute([
                ':idconsumidor' => $idconsumidor,
                ':montototal'   => round($totalCalculado, 2),
            ]);
            $ventaData = $stmtVenta->fetch();
            $idventa = (int)$ventaData['idventa'];

            // 3. Insertar ventadetalle y decrementar stock en varianteproducto
            $stmtDetalle = $this->db->prepare("
                INSERT INTO ventadetalle (idventa, idinventario, cantidadproductos)
                VALUES (:idventa, :idinventario, :cantidadproductos)
            ");

            $stmtUpdStock = $this->db->prepare("
                UPDATE varianteproducto 
                SET stock = stock - :cant 
                WHERE idvarianteproducto = :id
            ");

            foreach ($itemsParaInsertar as $itemDet) {
                $stmtDetalle->execute([
                    ':idventa'           => $idventa,
                    ':idinventario'      => $itemDet['idinventario'],
                    ':cantidadproductos' => $itemDet['cantidadproductos'],
                ]);

                $stmtUpdStock->execute([
                    ':cant' => $itemDet['cantidadproductos'],
                    ':id'   => $itemDet['idinventario'],
                ]);
            }

            // 4. Generar y registrar comprobante de pago
            $serie = (strtoupper($tipocomprobante) === 'FACTURA') ? 'F001' : 'B001';
            $numcomprobante = sprintf("%s-%08d", $serie, $idventa);

            $stmtComp = $this->db->prepare("
                INSERT INTO comprobantepago (idventa, tipocomprobante, numcomprobante, montopagado, fechaemision)
                VALUES (:idventa, :tipocomprobante, :numcomprobante, :montopagado, CURRENT_TIMESTAMP)
                RETURNING idcomprobante, numcomprobante, fechaemision
            ");
            $stmtComp->execute([
                ':idventa'         => $idventa,
                ':tipocomprobante' => (strtoupper($tipocomprobante) === 'FACTURA') ? 'Factura' : 'Boleta',
                ':numcomprobante'  => $numcomprobante,
                ':montopagado'     => round($totalCalculado, 2),
            ]);
            $compData = $stmtComp->fetch();

            // 5. Vaciar carrito de compras del usuario
            $carritoModel->vaciarCarrito($idconsumidor);

            $this->db->commit();

            return [
                'idventa'         => $idventa,
                'estadoventa'     => 'pagado',
                'montototal'      => round($totalCalculado, 2),
                'fechaventa'      => $ventaData['fechaventa'],
                'comprobante'     => [
                    'idcomprobante'   => $compData['idcomprobante'],
                    'tipocomprobante' => (strtoupper($tipocomprobante) === 'FACTURA') ? 'Factura' : 'Boleta',
                    'numcomprobante'  => $compData['numcomprobante'],
                    'montopagado'     => round($totalCalculado, 2),
                    'fechaemision'    => $compData['fechaemision'],
                ],
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function listarPorCliente(int $idconsumidor): array {
        $stmt = $this->db->prepare("
            SELECT 
                v.idventa,
                v.idconsumidor,
                v.estadoventa,
                v.montototal,
                v.fechaventa,
                c.tipocomprobante,
                c.numcomprobante,
                c.fechaemision,
                COUNT(vd.idventadetalle) AS total_lineas,
                COALESCE(SUM(vd.cantidadproductos), 0)::INTEGER AS total_prendas
            FROM venta v
            LEFT JOIN comprobantepago c ON v.idventa = c.idventa
            LEFT JOIN ventadetalle vd ON v.idventa = vd.idventa
            WHERE v.idconsumidor = :idconsumidor
            GROUP BY v.idventa, v.idconsumidor, v.estadoventa, v.montototal, v.fechaventa, c.tipocomprobante, c.numcomprobante, c.fechaemision
            ORDER BY v.fechaventa DESC
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
        return $stmt->fetchAll();
    }

    public function obtenerDetalle(int $idventa, ?int $idconsumidor = null): ?array {
        $sql = "
            SELECT 
                v.idventa,
                v.idconsumidor,
                v.estadoventa,
                v.montototal,
                v.fechaventa,
                c.tipocomprobante,
                c.numcomprobante,
                c.montopagado,
                c.fechaemision,
                con.nombres,
                con.apellidopaterno,
                con.apellidomaterno,
                con.celular,
                lu.correo
            FROM venta v
            INNER JOIN consumidor con ON v.idconsumidor = con.idconsumidor
            LEFT JOIN loginusuario lu ON con.idconsumidor = lu.idconsumidor
            LEFT JOIN comprobantepago c ON v.idventa = c.idventa
            WHERE v.idventa = :idventa
        ";
        $params = [':idventa' => $idventa];

        if ($idconsumidor !== null) {
            $sql .= " AND v.idconsumidor = :idconsumidor";
            $params[':idconsumidor'] = $idconsumidor;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $venta = $stmt->fetch();

        if (!$venta) {
            return null;
        }

        // Obtener líneas del pedido
        $stmtDetalle = $this->db->prepare("
            SELECT 
                vd.idventadetalle,
                vd.idventa,
                vd.idinventario,
                vd.cantidadproductos,
                vp.talla,
                vp.color,
                p.idproducto,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                p.imagen_url,
                COALESCE(p.preciooferta, p.preciobase) AS preciounitario,
                (vd.cantidadproductos * COALESCE(p.preciooferta, p.preciobase)) AS subtotal
            FROM ventadetalle vd
            INNER JOIN varianteproducto vp ON vd.idinventario = vp.idvarianteproducto
            INNER JOIN producto p ON vp.idproducto = p.idproducto
            WHERE vd.idventa = :idventa
            ORDER BY vd.idventadetalle ASC
        ");
        $stmtDetalle->execute([':idventa' => $idventa]);
        $venta['items'] = $stmtDetalle->fetchAll();

        return $venta;
    }

    public function listarTodasAdmin(array $filtros = []): array {
        $conditions = [];
        $params = [];

        if (!empty($filtros['estado'])) {
            $conditions[] = "v.estadoventa = :estado";
            $params[':estado'] = trim($filtros['estado']);
        }

        if (!empty($filtros['buscar'])) {
            $conditions[] = "(con.nombres ILIKE :buscar OR con.apellidopaterno ILIKE :buscar OR c.numcomprobante ILIKE :buscar)";
            $params[':buscar'] = '%' . trim($filtros['buscar']) . '%';
        }

        $whereClause = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $sql = "
            SELECT 
                v.idventa,
                v.idconsumidor,
                v.estadoventa,
                v.montototal,
                v.fechaventa,
                con.nombres || ' ' || con.apellidopaterno AS cliente_nombre,
                con.celular,
                lu.correo,
                c.tipocomprobante,
                c.numcomprobante,
                COALESCE(SUM(vd.cantidadproductos), 0)::INTEGER AS total_prendas
            FROM venta v
            INNER JOIN consumidor con ON v.idconsumidor = con.idconsumidor
            LEFT JOIN loginusuario lu ON con.idconsumidor = lu.idconsumidor
            LEFT JOIN comprobantepago c ON v.idventa = c.idventa
            LEFT JOIN ventadetalle vd ON v.idventa = vd.idventa
            {$whereClause}
            GROUP BY v.idventa, v.idconsumidor, v.estadoventa, v.montototal, v.fechaventa, con.nombres, con.apellidopaterno, con.celular, lu.correo, c.tipocomprobante, c.numcomprobante
            ORDER BY v.fechaventa DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function actualizarEstado(int $idventa, string $nuevoEstado): bool {
        $estadosPermitidos = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];
        if (!in_array($nuevoEstado, $estadosPermitidos, true)) {
            throw new Exception("Estado de venta no válido. Estados admitidos: " . implode(', ', $estadosPermitidos));
        }

        $stmt = $this->db->prepare("
            UPDATE venta 
            SET estadoventa = :estado 
            WHERE idventa = :id
        ");
        return $stmt->execute([':estado' => $nuevoEstado, ':id' => $idventa]);
    }

    public function obtenerEstadisticasDashboard(): array {
        // Métricas calculadas fielmente a partir de las tablas existentes:
        // producto, varianteproducto, tipoproducto, loginusuario, venta
        $stats = [];

        // 1. Total de Productos
        $stats['total_productos'] = (int)$this->db->query("SELECT COUNT(*) FROM producto")->fetchColumn();

        // 2. Total de Variantes y Stock Total
        $stmtVar = $this->db->query("SELECT COUNT(*) AS total_variantes, COALESCE(SUM(stock), 0) AS stock_total FROM varianteproducto");
        $varRow = $stmtVar->fetch();
        $stats['total_variantes'] = (int)$varRow['total_variantes'];
        $stats['stock_total'] = (int)$varRow['stock_total'];

        // 3. Categorías (tipoproducto)
        $stats['total_categorias'] = (int)$this->db->query("SELECT COUNT(*) FROM tipoproducto")->fetchColumn();

        // 4. Usuarios registrados
        $stats['total_usuarios'] = (int)$this->db->query("SELECT COUNT(*) FROM loginusuario")->fetchColumn();
        $stats['total_clientes'] = (int)$this->db->query("SELECT COUNT(*) FROM loginusuario WHERE rol = 'cliente'")->fetchColumn();

        // 5. Total de Ventas / Pedidos
        $stmtVentas = $this->db->query("
            SELECT 
                COUNT(*) AS total_pedidos,
                COALESCE(SUM(montototal), 0) AS total_ingresos
            FROM venta
        ");
        $ventasRow = $stmtVentas->fetch();
        $stats['total_pedidos'] = (int)$ventasRow['total_pedidos'];
        $stats['total_ingresos'] = round((float)$ventasRow['total_ingresos'], 2);

        // 6. Últimos 5 pedidos
        $stmtRecientes = $this->db->query("
            SELECT 
                v.idventa,
                v.estadoventa,
                v.montototal,
                v.fechaventa,
                con.nombres || ' ' || con.apellidopaterno AS cliente,
                c.numcomprobante
            FROM venta v
            INNER JOIN consumidor con ON v.idconsumidor = con.idconsumidor
            LEFT JOIN comprobantepago c ON v.idventa = c.idventa
            ORDER BY v.fechaventa DESC
            LIMIT 5
        ");
        $stats['pedidos_recientes'] = $stmtRecientes->fetchAll();

        return $stats;
    }
}
