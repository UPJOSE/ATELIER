<?php
// ====================================================================
// MODELO: Direccion (Tablas: direccion, distrito, provincia, departamento, metodopago)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class Direccion {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function listarPorConsumidor(int $idconsumidor): array {
        $stmt = $this->db->prepare("
            SELECT 
                d.iddireccion,
                d.idconsumidor,
                d.iddistrito,
                d.callenumero,
                d.referenciadetalle,
                d.esprincipaldireccion,
                dis.nombredistrito,
                pro.idprovincia,
                pro.nombreprovincia,
                dep.iddepartamento,
                dep.nombredepartamento
            FROM direccion d
            INNER JOIN distrito dis ON d.iddistrito = dis.iddistrito
            INNER JOIN provincia pro ON dis.idprovincia = pro.idprovincia
            INNER JOIN departamento dep ON pro.iddepartamento = dep.iddepartamento
            WHERE d.idconsumidor = :idconsumidor
            ORDER BY d.esprincipaldireccion DESC, d.iddireccion DESC
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
        return $stmt->fetchAll();
    }

    public function crear(int $idconsumidor, array $datos): array {
        $esPrincipal = !empty($datos['esprincipaldireccion']);

        if ($esPrincipal) {
            $this->desactivarPrincipales($idconsumidor);
        }

        $stmt = $this->db->prepare("
            INSERT INTO direccion (idconsumidor, iddistrito, callenumero, referenciadetalle, esprincipaldireccion)
            VALUES (:idconsumidor, :iddistrito, :callenumero, :referenciadetalle, :esprincipaldireccion)
            RETURNING iddireccion, idconsumidor, iddistrito, callenumero, referenciadetalle, esprincipaldireccion
        ");
        $stmt->execute([
            ':idconsumidor'          => $idconsumidor,
            ':iddistrito'            => (int)$datos['iddistrito'],
            ':callenumero'           => trim($datos['callenumero']),
            ':referenciadetalle'     => !empty($datos['referenciadetalle']) ? trim($datos['referenciadetalle']) : null,
            ':esprincipaldireccion'  => $esPrincipal ? 1 : 0,
        ]);
        return $stmt->fetch();
    }

    public function actualizar(int $iddireccion, int $idconsumidor, array $datos): bool {
        $esPrincipal = !empty($datos['esprincipaldireccion']);

        if ($esPrincipal) {
            $this->desactivarPrincipales($idconsumidor);
        }

        $stmt = $this->db->prepare("
            UPDATE direccion
            SET iddistrito           = :iddistrito,
                callenumero          = :callenumero,
                referenciadetalle    = :referenciadetalle,
                esprincipaldireccion = :esprincipaldireccion
            WHERE iddireccion = :iddireccion AND idconsumidor = :idconsumidor
        ");
        return $stmt->execute([
            ':iddistrito'            => (int)$datos['iddistrito'],
            ':callenumero'           => trim($datos['callenumero']),
            ':referenciadetalle'     => !empty($datos['referenciadetalle']) ? trim($datos['referenciadetalle']) : null,
            ':esprincipaldireccion'  => $esPrincipal ? 1 : 0,
            ':iddireccion'           => $iddireccion,
            ':idconsumidor'          => $idconsumidor,
        ]);
    }

    public function eliminar(int $iddireccion, int $idconsumidor): bool {
        $stmt = $this->db->prepare("
            DELETE FROM direccion 
            WHERE iddireccion = :iddireccion AND idconsumidor = :idconsumidor
        ");
        return $stmt->execute([
            ':iddireccion'  => $iddireccion,
            ':idconsumidor' => $idconsumidor,
        ]);
    }

    public function establecerPrincipal(int $iddireccion, int $idconsumidor): bool {
        $this->desactivarPrincipales($idconsumidor);
        $stmt = $this->db->prepare("
            UPDATE direccion 
            SET esprincipaldireccion = TRUE 
            WHERE iddireccion = :iddireccion AND idconsumidor = :idconsumidor
        ");
        return $stmt->execute([
            ':iddireccion'  => $iddireccion,
            ':idconsumidor' => $idconsumidor,
        ]);
    }

    private function desactivarPrincipales(int $idconsumidor): void {
        $stmt = $this->db->prepare("
            UPDATE direccion 
            SET esprincipaldireccion = FALSE 
            WHERE idconsumidor = :idconsumidor
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
    }

    // ---------------- CASCADA UBIGEO ----------------

    public function obtenerDepartamentos(): array {
        return $this->db->query("SELECT iddepartamento, nombredepartamento FROM departamento ORDER BY nombredepartamento ASC")->fetchAll();
    }

    public function obtenerProvincias(int $iddepartamento): array {
        $stmt = $this->db->prepare("
            SELECT idprovincia, iddepartamento, nombreprovincia 
            FROM provincia 
            WHERE iddepartamento = :iddepartamento 
            ORDER BY nombreprovincia ASC
        ");
        $stmt->execute([':iddepartamento' => $iddepartamento]);
        return $stmt->fetchAll();
    }

    public function obtenerDistritos(int $idprovincia): array {
        $stmt = $this->db->prepare("
            SELECT iddistrito, idprovincia, nombredistrito 
            FROM distrito 
            WHERE idprovincia = :idprovincia 
            ORDER BY nombredistrito ASC
        ");
        $stmt->execute([':idprovincia' => $idprovincia]);
        return $stmt->fetchAll();
    }

    // ---------------- MÉTODOS DE PAGO ----------------

    public function listarMetodosPago(int $idconsumidor): array {
        $stmt = $this->db->prepare("
            SELECT 
                idmetodopago,
                idconsumidor,
                tipometodopago,
                bancoemisor,
                numeroenmascarado,
                nombretitular,
                esprincipalmetodo
            FROM metodopago
            WHERE idconsumidor = :idconsumidor
            ORDER BY esprincipalmetodo DESC, idmetodopago DESC
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
        return $stmt->fetchAll();
    }

    public function crearMetodoPago(int $idconsumidor, array $datos): array {
        // Enmascarar número de tarjeta por estricta seguridad (PCI-DSS)
        $numeroCompleto = preg_replace('/\D/', '', $datos['numero'] ?? '4242424242424242');
        $ultimos4 = substr($numeroCompleto, -4) ?: '4242';
        $enmascarado = '****-****-****-' . $ultimos4;

        $stmt = $this->db->prepare("
            INSERT INTO metodopago (idconsumidor, tipometodopago, bancoemisor, numeroenmascarado, nombretitular, esprincipalmetodo)
            VALUES (:idconsumidor, :tipometodopago, :bancoemisor, :numeroenmascarado, :nombretitular, :esprincipalmetodo)
            RETURNING idmetodopago, idconsumidor, tipometodopago, bancoemisor, numeroenmascarado, nombretitular, esprincipalmetodo
        ");
        $stmt->execute([
            ':idconsumidor'       => $idconsumidor,
            ':tipometodopago'     => trim($datos['tipometodopago'] ?? 'Tarjeta de Crédito'),
            ':bancoemisor'        => trim($datos['bancoemisor'] ?? 'Banco Local'),
            ':numeroenmascarado'  => $enmascarado,
            ':nombretitular'      => strtoupper(trim($datos['nombretitular'] ?? 'Titular')),
            ':esprincipalmetodo'  => !empty($datos['esprincipalmetodo']) ? 1 : 0,
        ]);
        return $stmt->fetch();
    }
}
