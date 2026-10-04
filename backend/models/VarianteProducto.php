<?php
// ====================================================================
// MODELO: VarianteProducto (Tabla: varianteproducto)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class VarianteProducto {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function listarPorProducto(int $idproducto): array {
        $stmt = $this->db->prepare("
            SELECT 
                v.idvarianteproducto,
                v.idproducto,
                v.stock,
                v.talla,
                v.color
            FROM varianteproducto v
            WHERE v.idproducto = :idproducto
            ORDER BY v.talla ASC, v.color ASC
        ");
        $stmt->execute([':idproducto' => $idproducto]);
        return $stmt->fetchAll();
    }

    public function obtenerPorId(int $idvariante): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                v.idvarianteproducto,
                v.idproducto,
                v.stock,
                v.talla,
                v.color,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                p.imagen_url
            FROM varianteproducto v
            INNER JOIN producto p ON v.idproducto = p.idproducto
            WHERE v.idvarianteproducto = :id
        ");
        $stmt->execute([':id' => $idvariante]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function crear(int $idproducto, int $stock, string $talla, string $color): array {
        $stmt = $this->db->prepare("
            INSERT INTO varianteproducto (idproducto, stock, talla, color)
            VALUES (:idproducto, :stock, :talla, :color)
            RETURNING idvarianteproducto, idproducto, stock, talla, color
        ");
        $stmt->execute([
            ':idproducto' => $idproducto,
            ':stock'      => max(0, $stock),
            ':talla'      => strtoupper(trim($talla)),
            ':color'      => trim($color),
        ]);
        return $stmt->fetch();
    }

    public function actualizar(int $idvariante, int $stock, string $talla, string $color): bool {
        $stmt = $this->db->prepare("
            UPDATE varianteproducto
            SET stock = :stock,
                talla = :talla,
                color = :color
            WHERE idvarianteproducto = :id
        ");
        return $stmt->execute([
            ':stock' => max(0, $stock),
            ':talla' => strtoupper(trim($talla)),
            ':color' => trim($color),
            ':id'    => $idvariante,
        ]);
    }

    public function eliminar(int $idvariante): bool {
        // Verificar si la variante ya tiene historial en ventas
        $stmtCheck = $this->db->prepare("SELECT COUNT(*) FROM ventadetalle WHERE idinventario = :id");
        $stmtCheck->execute([':id' => $idvariante]);
        if ((int)$stmtCheck->fetchColumn() > 0) {
            throw new Exception("No se puede eliminar la variante porque forma parte del historial de ventas.");
        }

        // Eliminar referencias en carritos no confirmados para mantener consistencia
        $stmtCart = $this->db->prepare("DELETE FROM carritodetalle WHERE idinventario = :id");
        $stmtCart->execute([':id' => $idvariante]);

        $stmt = $this->db->prepare("DELETE FROM varianteproducto WHERE idvarianteproducto = :id");
        return $stmt->execute([':id' => $idvariante]);
    }

    public function listarTodas(?int $idproducto = null): array {
        $sql = "
            SELECT 
                v.idvarianteproducto,
                v.idproducto,
                v.stock,
                v.talla,
                v.color,
                p.nombreproducto,
                p.preciobase,
                p.preciooferta,
                t.nombretipo,
                m.nombremodelo
            FROM varianteproducto v
            INNER JOIN producto p ON v.idproducto = p.idproducto
            LEFT JOIN tipoproducto t ON p.idtipoproducto = t.idtipoproducto
            LEFT JOIN modelo m ON p.idmodelo = m.idmodelo
        ";
        $params = [];

        if ($idproducto !== null) {
            $sql .= " WHERE v.idproducto = :idproducto";
            $params[':idproducto'] = $idproducto;
        }

        $sql .= " ORDER BY p.nombreproducto ASC, v.talla ASC, v.color ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
