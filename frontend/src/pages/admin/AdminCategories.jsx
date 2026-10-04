import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Toast from '../../components/Toast';

export default function AdminCategories() {
  const [categorias, setCategorias] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombreTipo, setNombreTipo] = useState('');
  const [editandoCat, setEditandoCat] = useState(null);

  const [nombreModelo, setNombreModelo] = useState('');

  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cats, mods] = await Promise.all([
        adminApi.getCategorias(),
        adminApi.getModelos(),
      ]);
      setCategorias(cats || []);
      setModelos(mods || []);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    if (!nombreTipo.trim()) return;

    try {
      if (editandoCat) {
        await adminApi.updateCategoria(editandoCat.idtipoproducto, nombreTipo);
        setToast({ message: 'Categoría actualizada.', type: 'success' });
        setEditandoCat(null);
      } else {
        await adminApi.createCategoria(nombreTipo);
        setToast({ message: 'Categoría registrada en tipoproducto.', type: 'success' });
      }
      setNombreTipo('');
      cargarDatos();
    } catch (err) {
      setToast({ message: err.message || 'Error guardando categoría.', type: 'error' });
    }
  };

  const handleEliminarCategoria = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombre}"?`)) return;

    try {
      await adminApi.deleteCategoria(id);
      setToast({ message: 'Categoría eliminada.', type: 'success' });
      cargarDatos();
    } catch (err) {
      setToast({
        message: err.message || 'No se puede eliminar la categoría porque contiene productos vinculados.',
        type: 'error',
      });
    }
  };

  const handleCrearModelo = async (e) => {
    e.preventDefault();
    if (!nombreModelo.trim()) return;

    try {
      await adminApi.createModelo(nombreModelo);
      setToast({ message: 'Modelo registrado en tabla modelo.', type: 'success' });
      setNombreModelo('');
      cargarDatos();
    } catch (err) {
      setToast({ message: err.message || 'Error creando modelo.', type: 'error' });
    }
  };

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Categorías y Modelos</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Gestión de <code>tipoproducto</code> y <code>modelo</code> en PostgreSQL 16</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Volver al Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Sección Categorías (tipoproducto) */}
        <div>
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editandoCat ? `Editar Categoría #${editandoCat.idtipoproducto}` : 'Nueva Categoría (tipoproducto)'}
            </h2>
            <form onSubmit={handleGuardarCategoria} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Polos, Camisas, Casacas..."
                value={nombreTipo}
                onChange={(e) => setNombreTipo(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                {editandoCat ? 'Actualizar' : 'Guardar'}
              </button>
              {editandoCat && (
                <button
                  type="button"
                  onClick={() => { setEditandoCat(null); setNombreTipo(''); }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de Categoría</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.idtipoproducto}>
                    <td>#{cat.idtipoproducto}</td>
                    <td><strong>{cat.nombretipo}</strong></td>
                    <td>
                      <span className="badge badge-neutral">{cat.total_productos} productos</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditandoCat(cat);
                            setNombreTipo(cat.nombretipo);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.6rem' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarCategoria(cat.idtipoproducto, cat.nombretipo)}
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
        </div>

        {/* Sección Modelos (modelo) */}
        <div>
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Nuevo Modelo / Corte (modelo)
            </h2>
            <form onSubmit={handleCrearModelo} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Oversize Fit, Slim..."
                value={nombreModelo}
                onChange={(e) => setNombreModelo(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                Crear Modelo
              </button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Modelo</th>
                  <th>Asociados</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((m) => (
                  <tr key={m.idmodelo}>
                    <td>#{m.idmodelo}</td>
                    <td><strong>{m.nombremodelo}</strong></td>
                    <td><span className="badge badge-info">{m.total_productos}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
