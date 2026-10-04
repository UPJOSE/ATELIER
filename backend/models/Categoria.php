<?php
// ====================================================================
// MODELO: Categoria (Tablas: tipoproducto, modelo)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class Categoria {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // ---------------- TIPOPRODUCTO (CATEGORÍAS) ----------------

    public function listarTipos(): array {
        $stmt = $this->db->query("
            SELECT 
                t.idtipoproducto,
                t.nombretipo,
                COUNT(p.idproducto) AS total_productos
            FROM tipoproducto t
            LEFT JOIN producto p ON t.idtipoproducto = p.idtipoproducto
            GROUP BY t.idtipoproducto, t.nombretipo
            ORDER BY t.nombretipo ASC
        ");
        return $stmt->fetchAll();
    }

    public function obtenerTipoPorId(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT idtipoproducto, nombretipo 
            FROM tipoproducto 
            WHERE idtipoproducto = :id
        ");
        $stmt->execute([':id' => $id]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function crearTipo(string $nombre): array {
        $stmt = $this->db->prepare("
            INSERT INTO tipoproducto (nombretipo)
            VALUES (:nombre)
            RETURNING idtipoproducto, nombretipo
        ");
        $stmt->execute([':nombre' => trim($nombre)]);
        return $stmt->fetch();
    }

    public function actualizarTipo(int $id, string $nombre): bool {
        $stmt = $this->db->prepare("
            UPDATE tipoproducto 
            SET nombretipo = :nombre
            WHERE idtipoproducto = :id
        ");
        return $stmt->execute([':nombre' => trim($nombre), ':id' => $id]);
    }

    public function eliminarTipo(int $id): bool {
        // Verificar si tiene productos asociados
        $stmtCheck = $this->db->prepare("SELECT COUNT(*) FROM producto WHERE idtipoproducto = :id");
        $stmtCheck->execute([':id' => $id]);
        if ((int)$stmtCheck->fetchColumn() > 0) {
            throw new Exception("No se puede eliminar la categoría porque tiene productos vinculados.");
        }

        $stmt = $this->db->prepare("DELETE FROM tipoproducto WHERE idtipoproducto = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ---------------- MODELOS ----------------

    public function listarModelos(): array {
        $stmt = $this->db->query("
            SELECT 
                m.idmodelo,
                m.nombremodelo,
                COUNT(p.idproducto) AS total_productos
            FROM modelo m
            LEFT JOIN producto p ON m.idmodelo = p.idmodelo
            GROUP BY m.idmodelo, m.nombremodelo
            ORDER BY m.nombremodelo ASC
        ");
        return $stmt->fetchAll();
    }

    public function crearModelo(string $nombre): array {
        $stmt = $this->db->prepare("
            INSERT INTO modelo (nombremodelo)
            VALUES (:nombre)
            RETURNING idmodelo, nombremodelo
        ");
        $stmt->execute([':nombre' => trim($nombre)]);
        return $stmt->fetch();
    }
}
