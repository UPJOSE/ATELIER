<?php
// ====================================================================
// MODELO: Producto (Tablas: producto, tipoproducto, modelo, varianteproducto)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class Producto {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function listar(array $filtros = []): array {
        $conditions = [];
        $params = [];

        // Filtro por búsqueda textual
        if (!empty($filtros['buscar'])) {
            $conditions[] = "(p.nombreproducto ILIKE :buscar OR t.nombretipo ILIKE :buscar OR m.nombremodelo ILIKE :buscar)";
            $params[':buscar'] = '%' . trim($filtros['buscar']) . '%';
        }

        // Filtro por categoría (idtipoproducto)
        if (!empty($filtros['categoria'])) {
            $conditions[] = "p.idtipoproducto = :categoria";
            $params[':categoria'] = (int)$filtros['categoria'];
        }

        // Filtro por modelo (idmodelo)
        if (!empty($filtros['modelo'])) {
            $conditions[] = "p.idmodelo = :modelo";
            $params[':modelo'] = (int)$filtros['modelo'];
        }

        // Filtro por ofertas
        if (!empty($filtros['solo_ofertas']) && ($filtros['solo_ofertas'] === '1' || $filtros['solo_ofertas'] === 'true')) {
            $conditions[] = "(p.preciooferta IS NOT NULL AND p.preciooferta > 0 AND p.preciooferta < p.preciobase)";
        }

        // Filtro por talla
        if (!empty($filtros['talla'])) {
            $conditions[] = "EXISTS (
                SELECT 1 FROM varianteproducto v 
                WHERE v.idproducto = p.idproducto 
                  AND UPPER(v.talla) = UPPER(:talla)
                  AND v.stock > 0
            )";
            $params[':talla'] = trim($filtros['talla']);
        }

        // Filtro por color
        if (!empty($filtros['color'])) {
            $conditions[] = "EXISTS (
                SELECT 1 FROM varianteproducto v 
                WHERE v.idproducto = p.idproducto 
                  AND LOWER(v.color) = LOWER(:color)
                  AND v.stock > 0
            )";
            $params[':color'] = trim($filtros['color']);
        }

        $whereClause = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

        // Ordenamiento por precio o novedad
        $orderBy = 'p.idproducto DESC';
        if (!empty($filtros['orden'])) {
            switch ($filtros['orden']) {
                case 'precio_asc':
                    $orderBy = 'COALESCE(p.preciooferta, p.preciobase) ASC';
                    break;
                case 'precio_desc':
                    $orderBy = 'COALESCE(p.preciooferta, p.preciobase) DESC';
                    break;
                case 'nombre_asc':
                    $orderBy = 'p.nombreproducto ASC';
                    break;
                case 'nombre_desc':
                    $orderBy = 'p.nombreproducto DESC';
                    break;
            }
        }

        $sql = "
            SELECT 
                p.idproducto,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                p.imagen_url,
                p.idtipoproducto,
                t.nombretipo AS categoria,
                p.idmodelo,
                m.nombremodelo AS modelo,
                COALESCE(SUM(v.stock), 0)::INTEGER AS stock_total,
                COUNT(v.idvarianteproducto)::INTEGER AS total_variantes
            FROM producto p
            INNER JOIN tipoproducto t ON p.idtipoproducto = t.idtipoproducto
            INNER JOIN modelo m ON p.idmodelo = m.idmodelo
            LEFT JOIN varianteproducto v ON p.idproducto = v.idproducto
            {$whereClause}
            GROUP BY p.idproducto, p.nombreproducto, p.preciobase, p.preciooferta, p.imagen_url, p.idtipoproducto, t.nombretipo, p.idmodelo, m.nombremodelo
            ORDER BY {$orderBy}
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $productos = $stmt->fetchAll();

        // Opcional: Anexar lista de tallas y colores disponibles
        if (!empty($productos)) {
            $ids = array_column($productos, 'idproducto');
            $inClause = implode(',', array_map('intval', $ids));
            $sqlVars = "
                SELECT idproducto, talla, color, stock 
                FROM varianteproducto 
                WHERE idproducto IN ({$inClause}) AND stock > 0
                ORDER BY talla, color
            ";
            $stmtVars = $this->db->query($sqlVars);
            $variantes = $stmtVars->fetchAll();

            $variantesPorProducto = [];
            foreach ($variantes as $var) {
                $pid = $var['idproducto'];
                if (!isset($variantesPorProducto[$pid])) {
                    $variantesPorProducto[$pid] = ['tallas' => [], 'colores' => []];
                }
                if (!in_array($var['talla'], $variantesPorProducto[$pid]['tallas'])) {
                    $variantesPorProducto[$pid]['tallas'][] = $var['talla'];
                }
                if (!in_array($var['color'], $variantesPorProducto[$pid]['colores'])) {
                    $variantesPorProducto[$pid]['colores'][] = $var['color'];
                }
            }

            foreach ($productos as &$prod) {
                $pid = $prod['idproducto'];
                $prod['tallas_disponibles'] = $variantesPorProducto[$pid]['tallas'] ?? [];
                $prod['colores_disponibles'] = $variantesPorProducto[$pid]['colores'] ?? [];
            }
        }

        return $productos;
    }

    public function obtenerPorId(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                p.idproducto,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                p.imagen_url,
                p.idtipoproducto,
                t.nombretipo AS categoria,
                p.idmodelo,
                m.nombremodelo AS modelo,
                COALESCE(SUM(v.stock), 0)::INTEGER AS stock_total
            FROM producto p
            INNER JOIN tipoproducto t ON p.idtipoproducto = t.idtipoproducto
            INNER JOIN modelo m ON p.idmodelo = m.idmodelo
            LEFT JOIN varianteproducto v ON p.idproducto = v.idproducto
            WHERE p.idproducto = :id
            GROUP BY p.idproducto, p.nombreproducto, p.preciobase, p.preciooferta, p.imagen_url, p.idtipoproducto, t.nombretipo, p.idmodelo, m.nombremodelo
        ");
        $stmt->execute([':id' => $id]);
        $producto = $stmt->fetch();

        if (!$producto) {
            return null;
        }

        // Obtener variantes completas de la tabla varianteproducto
        $stmtVar = $this->db->prepare("
            SELECT 
                idvarianteproducto,
                idproducto,
                stock,
                talla,
                color
            FROM varianteproducto
            WHERE idproducto = :id
            ORDER BY talla ASC, color ASC
        ");
        $stmtVar->execute([':id' => $id]);
        $producto['variantes'] = $stmtVar->fetchAll();

        return $producto;
    }

    public function obtenerDestacados(int $limit = 8): array {
        return $this->listar(['orden' => 'precio_desc']);
    }

    public function obtenerOfertas(int $limit = 8): array {
        return $this->listar(['solo_ofertas' => 'true']);
    }

    public function crear(array $datos): array {
        $stmt = $this->db->prepare("
            INSERT INTO producto (idtipoproducto, idmodelo, nombreproducto, preciobase, preciooferta, imagen_url)
            VALUES (:idtipoproducto, :idmodelo, :nombreproducto, :preciobase, :preciooferta, :imagen_url)
            RETURNING idproducto, idtipoproducto, idmodelo, nombreproducto, preciobase, preciooferta, imagen_url
        ");
        $stmt->execute([
            ':idtipoproducto' => (int)$datos['idtipoproducto'],
            ':idmodelo'       => (int)$datos['idmodelo'],
            ':nombreproducto' => trim($datos['nombreproducto']),
            ':preciobase'     => (float)$datos['preciobase'],
            ':preciooferta'   => !empty($datos['preciooferta']) ? (float)$datos['preciooferta'] : null,
            ':imagen_url'     => !empty($datos['imagen_url']) ? trim($datos['imagen_url']) : null,
        ]);
        return $stmt->fetch();
    }

    public function actualizar(int $id, array $datos): bool {
        $stmt = $this->db->prepare("
            UPDATE producto
            SET idtipoproducto = :idtipoproducto,
                idmodelo       = :idmodelo,
                nombreproducto = :nombreproducto,
                preciobase     = :preciobase,
                preciooferta   = :preciooferta,
                imagen_url     = :imagen_url
            WHERE idproducto = :id
        ");
        return $stmt->execute([
            ':idtipoproducto' => (int)$datos['idtipoproducto'],
            ':idmodelo'       => (int)$datos['idmodelo'],
            ':nombreproducto' => trim($datos['nombreproducto']),
            ':preciobase'     => (float)$datos['preciobase'],
            ':preciooferta'   => !empty($datos['preciooferta']) ? (float)$datos['preciooferta'] : null,
            ':imagen_url'     => !empty($datos['imagen_url']) ? trim($datos['imagen_url']) : null,
            ':id'             => $id,
        ]);
    }

    public function eliminar(int $id): bool {
        // Validación de Integridad Referencial:
        // No eliminar físicamente si existe en historial de ventas (ventadetalle)
        $stmtCheck = $this->db->prepare("
            SELECT COUNT(*) 
            FROM ventadetalle vd
            INNER JOIN varianteproducto vp ON vd.idinventario = vp.idvarianteproducto
            WHERE vp.idproducto = :id
        ");
        $stmtCheck->execute([':id' => $id]);
        $ventasCount = (int)$stmtCheck->fetchColumn();

        if ($ventasCount > 0) {
            throw new Exception("No es posible eliminar el producto porque mantiene registros asociados en el historial de ventas.");
        }

        // Si no tiene ventas, eliminar primero dependencias en carritodetalle y varianteproducto de forma atómica
        $this->db->beginTransaction();
        try {
            $stmtCart = $this->db->prepare("
                DELETE FROM carritodetalle 
                WHERE idinventario IN (SELECT idvarianteproducto FROM varianteproducto WHERE idproducto = :id)
            ");
            $stmtCart->execute([':id' => $id]);

            $stmtVar = $this->db->prepare("DELETE FROM varianteproducto WHERE idproducto = :id");
            $stmtVar->execute([':id' => $id]);

            $stmtProd = $this->db->prepare("DELETE FROM producto WHERE idproducto = :id");
            $stmtProd->execute([':id' => $id]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
