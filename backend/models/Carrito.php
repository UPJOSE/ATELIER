<?php
// ====================================================================
// MODELO: Carrito (Tablas: carritocompras, carritodetalle, varianteproducto)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class Carrito {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function obtenerOCrearCarrito(int $idconsumidor): int {
        $stmt = $this->db->prepare("
            SELECT idcarritocompras 
            FROM carritocompras 
            WHERE idconsumidor = :idconsumidor
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
        $idcarrito = $stmt->fetchColumn();

        if ($idcarrito) {
            return (int)$idcarrito;
        }

        // Crear nuevo carrito respetando UNIQUE(idconsumidor)
        $stmtCreate = $this->db->prepare("
            INSERT INTO carritocompras (idconsumidor, fechacreacion)
            VALUES (:idconsumidor, CURRENT_TIMESTAMP)
            ON CONFLICT (idconsumidor) DO UPDATE SET fechacreacion = CURRENT_TIMESTAMP
            RETURNING idcarritocompras
        ");
        $stmtCreate->execute([':idconsumidor' => $idconsumidor]);
        return (int)$stmtCreate->fetchColumn();
    }

    public function obtenerCarritoConItems(int $idconsumidor): array {
        $idcarrito = $this->obtenerOCrearCarrito($idconsumidor);

        $stmt = $this->db->prepare("
            SELECT 
                cd.idcarritodetalle,
                cd.idcarrito,
                cd.idinventario,
                cd.cantidad,
                vp.stock,
                vp.talla,
                vp.color,
                p.idproducto,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                p.imagen_url,
                COALESCE(p.preciooferta, p.preciobase) AS preciounitario,
                (cd.cantidad * COALESCE(p.preciooferta, p.preciobase)) AS subtotal
            FROM carritodetalle cd
            INNER JOIN varianteproducto vp ON cd.idinventario = vp.idvarianteproducto
            INNER JOIN producto p ON vp.idproducto = p.idproducto
            WHERE cd.idcarrito = :idcarrito
            ORDER BY cd.idcarritodetalle ASC
        ");
        $stmt->execute([':idcarrito' => $idcarrito]);
        $items = $stmt->fetchAll();

        $total = 0.0;
        $totalItems = 0;
        foreach ($items as $item) {
            $total += (float)$item['subtotal'];
            $totalItems += (int)$item['cantidad'];
        }

        return [
            'idcarrito'   => $idcarrito,
            'items'       => $items,
            'total_items' => $totalItems,
            'total_monto' => round($total, 2),
        ];
    }

    public function agregarItem(int $idconsumidor, int $idinventario, int $cantidad = 1): array {
        if ($cantidad <= 0) {
            throw new Exception("La cantidad debe ser mayor a cero.");
        }

        // 1. Validar que la variante exista y tenga stock
        $stmtVar = $this->db->prepare("
            SELECT vp.stock, p.nombreproducto, vp.talla, vp.color 
            FROM varianteproducto vp
            INNER JOIN producto p ON vp.idproducto = p.idproducto
            WHERE vp.idvarianteproducto = :id
        ");
        $stmtVar->execute([':id' => $idinventario]);
        $variante = $stmtVar->fetch();

        if (!$variante) {
            throw new Exception("La variante de producto seleccionada no existe.");
        }

        $idcarrito = $this->obtenerOCrearCarrito($idconsumidor);

        // 2. Verificar si ya existe en el carrito
        $stmtCheck = $this->db->prepare("
            SELECT idcarritodetalle, cantidad 
            FROM carritodetalle 
            WHERE idcarrito = :idcarrito AND idinventario = :idinventario
        ");
        $stmtCheck->execute([
            ':idcarrito'    => $idcarrito,
            ':idinventario' => $idinventario,
        ]);
        $itemExistente = $stmtCheck->fetch();

        $cantidadFinal = $cantidad;
        if ($itemExistente) {
            $cantidadFinal += (int)$itemExistente['cantidad'];
        }

        if ($cantidadFinal > (int)$variante['stock']) {
            throw new Exception("Stock insuficiente. Stock disponible: {$variante['stock']}.");
        }

        if ($itemExistente) {
            $stmtUpd = $this->db->prepare("
                UPDATE carritodetalle 
                SET cantidad = :cantidad 
                WHERE idcarritodetalle = :id
            ");
            $stmtUpd->execute([
                ':cantidad' => $cantidadFinal,
                ':id'       => $itemExistente['idcarritodetalle'],
            ]);
        } else {
            $stmtIns = $this->db->prepare("
                INSERT INTO carritodetalle (idcarrito, idinventario, cantidad)
                VALUES (:idcarrito, :idinventario, :cantidad)
            ");
            $stmtIns->execute([
                ':idcarrito'    => $idcarrito,
                ':idinventario' => $idinventario,
                ':cantidad'     => $cantidad,
            ]);
        }

        return $this->obtenerCarritoConItems($idconsumidor);
    }

    public function actualizarCantidad(int $idconsumidor, int $idcarritodetalle, int $nuevaCantidad): array {
        $idcarrito = $this->obtenerOCrearCarrito($idconsumidor);

        if ($nuevaCantidad <= 0) {
            return $this->eliminarItem($idconsumidor, $idcarritodetalle);
        }

        // Verificar pertenencia y stock disponible
        $stmtCheck = $this->db->prepare("
            SELECT cd.idcarritodetalle, cd.idinventario, vp.stock 
            FROM carritodetalle cd
            INNER JOIN varianteproducto vp ON cd.idinventario = vp.idvarianteproducto
            WHERE cd.idcarritodetalle = :id AND cd.idcarrito = :idcarrito
        ");
        $stmtCheck->execute([
            ':id'        => $idcarritodetalle,
            ':idcarrito' => $idcarrito,
        ]);
        $item = $stmtCheck->fetch();

        if (!$item) {
            throw new Exception("El item del carrito no existe o no pertenece a su sesión.");
        }

        if ($nuevaCantidad > (int)$item['stock']) {
            throw new Exception("Stock insuficiente. Máximo disponible: {$item['stock']}.");
        }

        $stmtUpd = $this->db->prepare("
            UPDATE carritodetalle 
            SET cantidad = :cantidad 
            WHERE idcarritodetalle = :id
        ");
        $stmtUpd->execute([
            ':cantidad' => $nuevaCantidad,
            ':id'       => $idcarritodetalle,
        ]);

        return $this->obtenerCarritoConItems($idconsumidor);
    }

    public function eliminarItem(int $idconsumidor, int $idcarritodetalle): array {
        $idcarrito = $this->obtenerOCrearCarrito($idconsumidor);

        $stmt = $this->db->prepare("
            DELETE FROM carritodetalle 
            WHERE idcarritodetalle = :id AND idcarrito = :idcarrito
        ");
        $stmt->execute([
            ':id'        => $idcarritodetalle,
            ':idcarrito' => $idcarrito,
        ]);

        return $this->obtenerCarritoConItems($idconsumidor);
    }

    public function vaciarCarrito(int $idconsumidor): void {
        $idcarrito = $this->obtenerOCrearCarrito($idconsumidor);
        $stmt = $this->db->prepare("DELETE FROM carritodetalle WHERE idcarrito = :idcarrito");
        $stmt->execute([':idcarrito' => $idcarrito]);
    }
}
