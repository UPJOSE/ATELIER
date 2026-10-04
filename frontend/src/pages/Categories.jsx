import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../api/productos';

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cats, mods] = await Promise.all([
        productosApi.categorias(),
        productosApi.modelos(),
      ]);
      setCategorias(cats || []);
      setModelos(mods || []);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper">
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Colecciones y Tipos de Prenda
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Explore nuestro catálogo clasificado según el modelo de datos relacional de la tabla <code>tipoproducto</code>.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Cargando categorías...</div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {categorias.map((cat) => (
              <div
                key={cat.idtipoproducto}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid var(--border-light)',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
                    ID #{cat.idtipoproducto}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    {cat.nombretipo}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {cat.total_productos} productos disponibles en stock
                  </p>
                </div>

                <Link
                  to={`/productos?categoria=${cat.idtipoproducto}`}
                  className="btn btn-secondary btn-block"
                >
                  Explorar {cat.nombretipo} →
                </Link>
              </div>
            ))}
          </div>

          {/* Modelos y Cortes */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '2.5rem',
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Cortes y Modelos de Confección
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Entidad <code>modelo</code>: Clasificación de calce y diseño.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {modelos.map((mod) => (
                <Link
                  key={mod.idmodelo}
                  to={`/productos?modelo=${mod.idmodelo}`}
                  className="badge badge-neutral"
                  style={{
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    border: '1px solid var(--border-medium)',
                    background: 'white',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  {mod.nombremodelo} ({mod.total_productos})
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
