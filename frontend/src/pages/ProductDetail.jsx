import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productosApi } from '../api/productos';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selección de variante
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);

  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const data = await productosApi.obtenerPorId(id);
      if (data) {
        setProducto(data);
        const vars = data.variantes || [];
        setVariantes(vars);

        // Preseleccionar primera variante con stock
        const conStock = vars.find((v) => Number(v.stock) > 0) || vars[0];
        if (conStock) {
          setSelectedTalla(conStock.talla);
          setSelectedColor(conStock.color);
        }
      }
    } catch (err) {
      setToast({ message: 'Error cargando información de la prenda.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Extraer tallas y colores únicos de las variantes reales
  const tallasUnicas = Array.from(new Set(variantes.map((v) => v.talla)));
  const coloresUnicos = Array.from(new Set(variantes.map((v) => v.color)));

  // Buscar la variante específica correspondiente a la selección del usuario
  const varianteSeleccionada = variantes.find(
    (v) => v.talla === selectedTalla && v.color.toLowerCase() === selectedColor.toLowerCase()
  );

  const stockDisponible = varianteSeleccionada ? Number(varianteSeleccionada.stock) : 0;
  const tieneStock = stockDisponible > 0;

  const tieneOferta = producto?.preciooferta && Number(producto.preciooferta) > 0 && Number(producto.preciooferta) < Number(producto.preciobase);
  const precioFinal = tieneOferta ? Number(producto.preciooferta) : Number(producto?.preciobase || 0);
  const fallbackImg = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Inicie sesión para agregar productos a su carrito.' } });
      return;
    }

    if (!varianteSeleccionada) {
      setToast({ message: 'Por favor seleccione una talla y color disponibles.', type: 'error' });
      return;
    }

    if (stockDisponible <= 0) {
      setToast({ message: 'La variante seleccionada se encuentra agotada.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await addToCart(varianteSeleccionada.idvarianteproducto, cantidad);
      setToast({
        message: `¡${producto.nombreproducto} (${selectedTalla}/${selectedColor}) añadido a la bolsa!`,
        type: 'success',
      });
    } catch (err) {
      setToast({ message: err.message || 'Error al agregar al carrito.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p>Cargando detalles de la prenda...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Producto no encontrado</h2>
        <Link to="/productos" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver al Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Migas de Pan */}
      <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
        <Link to="/">Inicio</Link> / <Link to="/productos">Catálogo</Link> / <span style={{ color: 'var(--text-main)' }}>{producto.nombreproducto}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        {/* Galería de Imagen */}
        <div style={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
        }}>
          <img
            src={producto.imagen_url || fallbackImg}
            alt={producto.nombreproducto}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          {tieneOferta && (
            <span className="badge-offer" style={{ top: '16px', left: '16px', padding: '6px 12px', fontSize: '0.85rem' }}>
              OFERTA DE TEMPORADA
            </span>
          )}
        </div>

        {/* Información y Compra */}
        <div>
          {/* Metadata */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-neutral">{producto.categoria}</span>
            <span className="badge badge-info">{producto.modelo}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '1rem' }}>
            {producto.nombreproducto}
          </h1>

          {/* Precios */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: tieneOferta ? '#e11d48' : 'var(--text-main)' }}>
              S/ {precioFinal.toFixed(2)}
            </span>
            {tieneOferta && (
              <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                S/ {Number(producto.preciobase).toFixed(2)}
              </span>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '1.5rem 0' }} />

          {/* Selector de Tallas */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Selecciona tu Talla:</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Talla: <strong>{selectedTalla || 'Ninguna'}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {tallasUnicas.map((t) => {
                // Verificar si esta talla tiene stock en algún color
                const stockPorTalla = variantes
                  .filter((v) => v.talla === t)
                  .reduce((acc, curr) => acc + Number(curr.stock), 0);

                const isSelected = selectedTalla === t;

                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTalla(t);
                      setCantidad(1);
                    }}
                    disabled={stockPorTalla === 0}
                    style={{
                      minWidth: '48px',
                      height: '44px',
                      padding: '0 0.85rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0f172a' : '1px solid var(--border-medium)',
                      background: isSelected ? '#0f172a' : stockPorTalla === 0 ? '#f1f5f9' : 'white',
                      color: isSelected ? 'white' : stockPorTalla === 0 ? '#94a3b8' : '#0f172a',
                      fontWeight: 700,
                      cursor: stockPorTalla === 0 ? 'not-allowed' : 'pointer',
                      position: 'relative',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Color */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Selecciona tu Color:</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Color: <strong>{selectedColor || 'Ninguno'}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {coloresUnicos.map((c) => {
                const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(c);
                      setCantidad(1);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-medium)',
                      background: isSelected ? '#eff6ff' : 'white',
                      color: isSelected ? '#1d4ed8' : '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disponibilidad de Stock en PostgreSQL */}
          <div style={{
            padding: '1rem',
            background: tieneStock ? '#f0fdf4' : '#fee2e2',
            border: `1px solid ${tieneStock ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '12px',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ fontWeight: 700, color: tieneStock ? '#16a34a' : '#dc2626', fontSize: '0.9rem' }}>
                {tieneStock ? '✓ Stock Disponible en Base de Datos' : '✗ Variante Agotada'}
              </span>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                {varianteSeleccionada ? (
                  `Variante ID #${varianteSeleccionada.idvarianteproducto}: ${stockDisponible} unidades disponibles`
                ) : (
                  'Seleccione talla y color para verificar existencia'
                )}
              </p>
            </div>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>PostgreSQL 16</span>
          </div>

          {/* Selector de Cantidad y Botón de Compra */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                disabled={!tieneStock || cantidad <= 1}
                style={{ width: '40px', height: '48px', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 700 }}
              >
                -
              </button>
              <input
                type="number"
                readOnly
                value={cantidad}
                style={{ width: '50px', height: '48px', border: 'none', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}
              />
              <button
                type="button"
                onClick={() => setCantidad((prev) => Math.min(stockDisponible, prev + 1))}
                disabled={!tieneStock || cantidad >= stockDisponible}
                style={{ width: '40px', height: '48px', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 700 }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!tieneStock || submitting}
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '0.9rem 1.5rem', opacity: tieneStock ? 1 : 0.6 }}
            >
              {submitting ? 'Añadiendo a la bolsa...' : tieneStock ? 'Agregar al Carrito 🛍️' : 'Agotado'}
            </button>
          </div>

          {/* Especificaciones Técnicas */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.75rem' }}>
              Ficha del Producto (Modelo Relacional)
            </h4>
            <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#334155' }}>
              <div><strong>Código Producto:</strong> #{producto.idproducto}</div>
              <div><strong>Tipo / Categoría:</strong> {producto.categoria}</div>
              <div><strong>Línea / Corte:</strong> {producto.modelo}</div>
              <div><strong>Variantes Totales:</strong> {variantes.length} opciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
