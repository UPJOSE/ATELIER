import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsuarios();
      setUsuarios(data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Usuarios y Clientes</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Relación <code>loginusuario</code> ↔ <code>consumidor</code> y Roles RBAC</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Volver al Dashboard</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Consultando usuarios...</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Login</th>
                <th>ID Consumidor</th>
                <th>Usuario</th>
                <th>Correo Electrónico</th>
                <th>Nombre Completo</th>
                <th>Celular</th>
                <th>Rol de Acceso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.idloginusuario}>
                  <td><strong>#{u.idloginusuario}</strong></td>
                  <td>#{u.idconsumidor}</td>
                  <td><code>{u.nombreusuario}</code></td>
                  <td>{u.correo}</td>
                  <td>{u.nombres} {u.apellidopaterno} {u.apellidomaterno}</td>
                  <td>{u.celular || 'No registrado'}</td>
                  <td>
                    <span className={`badge ${u.rol === 'admin' ? 'badge-info' : 'badge-neutral'}`} style={{ textTransform: 'uppercase' }}>
                      {u.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
