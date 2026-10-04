import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Toast from '../../components/Toast';

export default function AdminInventory() {
  const [variantes, setVariantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductoId, setSelectedProductoId] = useState('');

  // Formulario de nueva / edición variante
  const [form, setForm] = useState({
    idproducto: '',
    talla: '',
    color: '',
    stock: '10',
  });
  const [editandoVar, setEditandoVar] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    cargarProductos();
    cargarVariantes();
  }, []);

  useEffect(() => {
    cargarVariantes();
  }, [selectedProductoId]);

  const cargarProductos = async () => {
    try {
      const data = await adminApi.getProductos();
      setProductos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarVariantes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getVariantes(selectedProductoId || null);
      setVariantes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoVar) {
        await adminApi.updateVariante(editandoVar.idvarianteproducto, {
          talla: form.talla,
          color: form.color,
          stock: form.stock,
        });
        setToast({ message: 'Variante actualizada.', type: 'success' });
        setEditandoVar(null);
      } else {
        await adminApi.createVariante(form);
        setToast({ message: 'Variante registrada en varianteproducto.', type: 'success' });
      }
      setForm({ idproducto: selectedProductoId || '', talla: '', color: '', stock: '10' });
      cargarVariantes();
    } catch (err) {
      setToast({ message: err.message || 'Error guardando variante.', type: 'error' });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta variante de producto?')) return;
    try {
      await adminApi.deleteVariante(id);
      setToast({ message: 'Variante eliminada.', type: 'success' });
      cargarVariantes();
    } catch (err) {
      setToast({ message: err.message || 'No se puede eliminar la variante con ventas registradas.', type: 'error' });
    }
  };

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Inventario de Variantes</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Control de tallas, colores y existencias en la tabla <code>varianteproducto</code></p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Volver al Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Formulario Crear / Editar */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {editandoVar ? `Editar Variante #${editandoVar.idvarianteproducto}` : 'Registrar Variante'}
          </h2>

          <form onSubmit={handleSubmit}>
            {!editandoVar && (
              <div className="form-group">
                <label className="form-label">Producto Asociado</label>
                <select
                  className="form-control"
                  value={form.idproducto}
                  onChange={(e) => setForm({ ...form, idproducto: e.target.value })}
                  required
                >
                  <option value="">Seleccione Producto</option>
                  {productos.map((p) => (
                    <option key={p.idproducto} value={p.idproducto}>
                      {p.nombreproducto}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Talla</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. M, L, 32"
                  value={form.talla}
                  onChange={(e) => setForm({ ...form, talla: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Negro, Blanco"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stock en Almacén</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {editandoVar ? 'Actualizar Stock' : 'Añadir Variante'}
            </button>

            {editandoVar && (
              <button
                type="button"
                onClick={() => {
                  setEditandoVar(null);
                  setForm({ idproducto: '', talla: '', color: '', stock: '10' });
                }}
                className="btn btn-secondary btn-block"
                style={{ marginTop: '0.5rem' }}
              >
                Cancelar Edición
              </button>
            )}
          </form>
        </div>

        {/* Listado de Variantes */}
        <div>
          {/* Selector de Producto para Filtrar */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filtrar por Prenda:</label>
            <select
              className="form-control"
              style={{ maxWidth: '320px' }}
              value={selectedProductoId}
              onChange={(e) => setSelectedProductoId(e.target.value)}
            >
              <option value="">Todas las prendas ({variantes.length} variantes)</option>
              {productos.map((p) => (
                <option key={p.idproducto} value={p.idproducto}>
                  {p.nombreproducto}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>Consultando stock...</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v) => (
                    <tr key={v.idvarianteproducto}>
                      <td>#{v.idvarianteproducto}</td>
                      <td><strong>{v.nombreproducto}</strong></td>
                      <td><span className="badge badge-neutral">{v.talla}</span></td>
                      <td>{v.color}</td>
                      <td>
                        <span className={`badge ${Number(v.stock) > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {v.stock} uds
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditandoVar(v);
                              setForm({
                                idproducto: String(v.idproducto),
                                talla: v.talla,
                                color: v.color,
                                stock: String(v.stock),
                              });
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.6rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(v.idvarianteproducto)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.6rem' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
