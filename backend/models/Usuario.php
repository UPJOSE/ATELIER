<?php
// ====================================================================
// MODELO: Usuario (Tablas: consumidor, loginusuario)
// ====================================================================

require_once __DIR__ . '/../config/database.php';

class Usuario {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function registrar(array $datos): array {
        $this->db->beginTransaction();
        try {
            // 1. Insertar en tabla consumidor
            $stmtC = $this->db->prepare("
                INSERT INTO consumidor (nombres, apellidopaterno, apellidomaterno, celular)
                VALUES (:nombres, :apellidopaterno, :apellidomaterno, :celular)
                RETURNING idconsumidor
            ");
            $stmtC->execute([
                ':nombres'         => $datos['nombres'],
                ':apellidopaterno' => $datos['apellidopaterno'],
                ':apellidomaterno' => $datos['apellidomaterno'],
                ':celular'         => $datos['celular'] ?? null,
            ]);
            $idconsumidor = $stmtC->fetchColumn();

            // 2. Hashear contraseña de forma segura
            $hashPassword = password_hash($datos['password'], PASSWORD_BCRYPT);
            $rol = $datos['rol'] ?? 'cliente';

            // 3. Insertar en tabla loginusuario
            $stmtL = $this->db->prepare("
                INSERT INTO loginusuario (idconsumidor, nombreusuario, correo, password, rol)
                VALUES (:idconsumidor, :nombreusuario, :correo, :password, :rol)
                RETURNING idloginusuario
            ");
            $stmtL->execute([
                ':idconsumidor'  => $idconsumidor,
                ':nombreusuario' => $datos['nombreusuario'],
                ':correo'        => strtolower(trim($datos['correo'])),
                ':password'      => $hashPassword,
                ':rol'           => $rol,
            ]);
            $idloginusuario = $stmtL->fetchColumn();

            $this->db->commit();

            return [
                'idloginusuario'  => $idloginusuario,
                'idconsumidor'    => $idconsumidor,
                'nombreusuario'   => $datos['nombreusuario'],
                'correo'          => strtolower(trim($datos['correo'])),
                'nombres'         => $datos['nombres'],
                'apellidopaterno' => $datos['apellidopaterno'],
                'apellidomaterno' => $datos['apellidomaterno'],
                'celular'         => $datos['celular'] ?? null,
                'rol'             => $rol,
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function buscarPorCorreo(string $correo): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                l.idloginusuario,
                l.idconsumidor,
                l.nombreusuario,
                l.correo,
                l.password,
                l.rol,
                c.nombres,
                c.apellidopaterno,
                c.apellidomaterno,
                c.celular
            FROM loginusuario l
            INNER JOIN consumidor c ON l.idconsumidor = c.idconsumidor
            WHERE LOWER(l.correo) = LOWER(:correo)
            LIMIT 1
        ");
        $stmt->execute([':correo' => trim($correo)]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function obtenerPorId(int $idconsumidor): ?array {
        $stmt = $this->db->prepare("
            SELECT 
                l.idloginusuario,
                l.idconsumidor,
                l.nombreusuario,
                l.correo,
                l.rol,
                c.nombres,
                c.apellidopaterno,
                c.apellidomaterno,
                c.celular
            FROM loginusuario l
            INNER JOIN consumidor c ON l.idconsumidor = c.idconsumidor
            WHERE l.idconsumidor = :idconsumidor
            LIMIT 1
        ");
        $stmt->execute([':idconsumidor' => $idconsumidor]);
        $res = $stmt->fetch();
        return $res ?: null;
    }

    public function actualizarPerfil(int $idconsumidor, array $datos): bool {
        $stmt = $this->db->prepare("
            UPDATE consumidor 
            SET nombres = :nombres,
                apellidopaterno = :apellidopaterno,
                apellidomaterno = :apellidomaterno,
                celular = :celular
            WHERE idconsumidor = :idconsumidor
        ");
        return $stmt->execute([
            ':nombres'         => $datos['nombres'],
            ':apellidopaterno' => $datos['apellidopaterno'],
            ':apellidomaterno' => $datos['apellidomaterno'],
            ':celular'         => $datos['celular'] ?? null,
            ':idconsumidor'    => $idconsumidor,
        ]);
    }

    public function listarTodos(): array {
        $stmt = $this->db->query("
            SELECT 
                l.idloginusuario,
                l.idconsumidor,
                l.nombreusuario,
                l.correo,
                l.rol,
                c.nombres,
                c.apellidopaterno,
                c.apellidomaterno,
                c.celular
            FROM loginusuario l
            INNER JOIN consumidor c ON l.idconsumidor = c.idconsumidor
            ORDER BY l.idloginusuario DESC
        ");
        return $stmt->fetchAll();
    }
}
