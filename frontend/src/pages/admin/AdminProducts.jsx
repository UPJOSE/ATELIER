import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Toast from '../../components/Toast';

export default function AdminProducts() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProductos({ buscar });
      setProductos(data || []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el producto "${nombre}"?`)) {
      return;
    }

    try {
      await adminApi.deleteProducto(id);
      setToast({ message: 'Producto eliminado correctamente.', type: 'success' });
      cargarProductos();
    } catch (err) {
      setToast({
        message: err.message || 'No se puede eliminar el producto debido a restricciones de integridad en ventas.',
        type: 'error',
      });
    }
  };

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Gestión de Productos</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Tabla maestra <code>producto</code> en PostgreSQL 16</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin" className="btn btn-secondary btn-sm">← Volver al Dashboard</Link>
          <Link to="/admin/productos/nuevo" className="btn btn-primary btn-sm">+ Nuevo Producto</Link>
        </div>
      </div>

      {/* Barra de Filtro */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', maxWidth: '480px' }}>
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          className="form-control"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <button onClick={cargarProductos} className="btn btn-secondary btn-sm">Buscar</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Consultando productos...</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prenda</th>
                <th>Categoría</th>
                <th>Modelo</th>
                <th>Precio Base</th>
                <th>Precio Oferta</th>
                <th>Stock Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron productos.</td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.idproducto}>
                    <td>#{prod.idproducto}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={prod.imagen_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80'}
                          alt={prod.nombreproducto}
                          style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontWeight: 600 }}>{prod.nombreproducto}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{prod.categoria}</span></td>
                    <td>{prod.modelo}</td>
                    <td>S/ {Number(prod.preciobase).toFixed(2)}</td>
                    <td>
                      {prod.preciooferta ? (
                        <span style={{ color: '#e11d48', fontWeight: 700 }}>
                          S/ {Number(prod.preciooferta).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${Number(prod.stock_total) > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {prod.stock_total} uds
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/productos/${prod.idproducto}/editar`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                          Editar
                        </Link>
                        <button
                          onClick={() => handleEliminar(prod.idproducto, prod.nombreproducto)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.6rem' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
