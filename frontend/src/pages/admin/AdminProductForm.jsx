import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Toast from '../../components/Toast';

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombreproducto: '',
    idtipoproducto: '',
    idmodelo: '',
    preciobase: '',
    preciooferta: '',
    imagen_url: '',
  });

  const [categorias, setCategorias] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    cargarCatalogosYProducto();
  }, [id]);

  const cargarCatalogosYProducto = async () => {
    try {
      setLoading(true);
      const [cats, mods] = await Promise.all([
        adminApi.getCategorias(),
        adminApi.getModelos(),
      ]);
      setCategorias(cats || []);
      setModelos(mods || []);

      if (isEditing) {
        const prod = await adminApi.getProducto(id);
        if (prod) {
          setForm({
            nombreproducto: prod.nombreproducto || '',
            idtipoproducto: String(prod.idtipoproducto || ''),
            idmodelo: String(prod.idmodelo || ''),
            preciobase: String(prod.preciobase || ''),
            preciooferta: prod.preciooferta ? String(prod.preciooferta) : '',
            imagen_url: prod.imagen_url || '',
          });
        }
      }
    } catch (err) {
      setToast({ message: 'Error cargando datos del formulario.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombreproducto || !form.idtipoproducto || !form.idmodelo || !form.preciobase) {
      setToast({ message: 'Complete todos los campos requeridos.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await adminApi.updateProducto(id, form);
        setToast({ message: 'Producto actualizado con éxito.', type: 'success' });
      } else {
        await adminApi.createProducto(form);
        setToast({ message: 'Producto registrado en PostgreSQL.', type: 'success' });
      }
      setTimeout(() => navigate('/admin/productos'), 1000);
    } catch (err) {
      setToast({ message: err.message || 'Error guardando producto.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
          {isEditing ? 'Editar Prenda' : 'Registrar Nueva Prenda'}
        </h1>
        <Link to="/admin/productos" className="btn btn-secondary btn-sm">Cancelar</Link>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border-light)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Producto</label>
            <input
              type="text"
              name="nombreproducto"
              className="form-control"
              placeholder="Ej. Polo Oversize Heavyweight Noir"
              value={form.nombreproducto}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Categoría (tipoproducto)</label>
              <select
                name="idtipoproducto"
                className="form-control"
                value={form.idtipoproducto}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione Categoría</option>
                {categorias.map((c) => (
                  <option key={c.idtipoproducto} value={c.idtipoproducto}>
                    {c.nombretipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Modelo / Corte (modelo)</label>
              <select
                name="idmodelo"
                className="form-control"
                value={form.idmodelo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione Modelo</option>
                {modelos.map((m) => (
                  <option key={m.idmodelo} value={m.idmodelo}>
                    {m.nombremodelo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Precio Base (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="preciobase"
                className="form-control"
                placeholder="Ej. 89.90"
                value={form.preciobase}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio Oferta (Opcional S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="preciooferta"
                className="form-control"
                placeholder="Ej. 69.90"
                value={form.preciooferta}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL de Imagen (Migración 001: imagen_url)</label>
            <input
              type="url"
              name="imagen_url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={form.imagen_url}
              onChange={handleChange}
            />
          </div>

          {/* Vista previa de imagen */}
          {form.imagen_url && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Vista Previa:</span>
              <img
                src={form.imagen_url}
                alt="Vista previa"
                style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-medium)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ padding: '0.9rem' }}
          >
            {submitting ? 'Guardando en PostgreSQL...' : isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}
