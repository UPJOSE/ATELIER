import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Cabecera y Navegación Rápida Admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>Panel de Administración</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem' }}>Dashboard Ejecutivo</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Métricas en tiempo real computadas desde PostgreSQL 16 (VM1)</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/productos" className="btn btn-secondary btn-sm">Productos</Link>
          <Link to="/admin/inventario" className="btn btn-secondary btn-sm">Inventario / Variantes</Link>
          <Link to="/admin/categorias" className="btn btn-secondary btn-sm">Categorías</Link>
          <Link to="/admin/pedidos" className="btn btn-secondary btn-sm">Pedidos</Link>
          <Link to="/admin/usuarios" className="btn btn-secondary btn-sm">Usuarios</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Calculando métricas desde PostgreSQL...</div>
      ) : (
        <>
          {/* Tarjetas de Métricas Reales */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Ingresos Totales</span>
              <div className="metric-value" style={{ color: '#16a34a' }}>
                S/ {Number(stats?.total_ingresos || 0).toFixed(2)}
              </div>
              <span className="metric-sub">Tabla: <code>venta.montototal</code></span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Pedidos Registrados</span>
              <div className="metric-value">
                {stats?.total_pedidos || 0}
              </div>
              <span className="metric-sub">Tabla: <code>venta</code></span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Productos Catálogo</span>
              <div className="metric-value">
                {stats?.total_productos || 0}
              </div>
              <span className="metric-sub">Tabla: <code>producto</code></span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Stock Total en Almacén</span>
              <div className="metric-value" style={{ color: '#2563eb' }}>
                {stats?.stock_total || 0} uds
              </div>
              <span className="metric-sub">{stats?.total_variantes || 0} variantes (<code>varianteproducto</code>)</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Categorías</span>
              <div className="metric-value">
                {stats?.total_categorias || 0}
              </div>
              <span className="metric-sub">Tabla: <code>tipoproducto</code></span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Usuarios Registrados</span>
              <div className="metric-value">
                {stats?.total_usuarios || 0}
              </div>
              <span className="metric-sub">{stats?.total_clientes || 0} clientes activos</span>
            </div>
          </div>

          {/* Tabla de Pedidos Recientes */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Últimos Pedidos Recibidos</h2>
              <Link to="/admin/pedidos" className="btn btn-secondary btn-sm">Ver Todos los Pedidos →</Link>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Cliente</th>
                    <th>Comprobante</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.pedidos_recientes?.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas registradas aún.</td>
                    </tr>
                  ) : (
                    stats?.pedidos_recientes?.map((p) => (
                      <tr key={p.idventa}>
                        <td><strong>#{p.idventa}</strong></td>
                        <td>{p.cliente}</td>
                        <td><code>{p.numcomprobante || 'Pendiente'}</code></td>
                        <td>{new Date(p.fechaventa).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${p.estadoventa === 'pagado' ? 'badge-success' : 'badge-warning'}`}>
                            {p.estadoventa}
                          </span>
                        </td>
                        <td><strong>S/ {Number(p.montototal).toFixed(2)}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
