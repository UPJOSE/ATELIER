import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productosApi } from '../api/productos';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [destData, ofData, catData] = await Promise.all([
        productosApi.destacados(4).catch(() => []),
        productosApi.ofertas(4).catch(() => []),
        productosApi.categorias().catch(() => []),
      ]);
      setDestacados(destData || []);
      setOfertas(ofData || []);
      setCategorias(catData || []);
    } catch (err) {
      console.error('Error cargando datos de inicio:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Principal */}
      <section className="container">
        <div className="hero-banner">
          <div>
            <span className="hero-tag">Colección Primavera / Verano 2026</span>
            <h1 className="hero-title">El Arte del Buen Vestir Redefinido</h1>
            <p className="hero-subtitle">
              Prendas de alta gama concebidas con tejidos premium, cortes contemporáneos y producción sostenible. Diseñadas para destacar tu identidad.
            </p>
            <div className="hero-cta-group">
              <Link to="/productos" className="btn btn-primary">
                Explorar Catálogo
              </Link>
              <Link to="/productos?solo_ofertas=1" className="btn btn-secondary">
                Ver Ofertas de Temporada 🔥
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
              alt="Editorial Moda"
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Beneficios de la Tienda */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '1.5rem' }}>
              🚚
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Envíos a Todo el Perú</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Entregas seguras y rápidas a domicilio</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '1.5rem' }}>
              🛡️
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Transacciones Seguras</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Simulación y emisión de comprobantes fiscales</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '1.5rem' }}>
              ✨
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Materiales Seleccionados</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Algodón pima, lino y acabados premium</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', fontSize: '1.5rem' }}>
              ☁️
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Nube Microsoft Azure</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Arquitectura 3 capas VM1 (Datos) + VM2 (Web)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="container" style={{ marginTop: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563eb', fontWeight: 700 }}>Categorías</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.25rem' }}>Explora por Colección</h2>
          </div>
          <Link to="/categorias" className="btn btn-secondary btn-sm">Ver Todas</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {categorias.slice(0, 6).map((cat) => (
            <Link
              key={cat.idtipoproducto}
              to={`/productos?categoria=${cat.idtipoproducto}`}
              style={{
                background: 'white',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'block',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary)' }}>
                {cat.nombretipo}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {cat.total_productos} productos disponibles
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="container" style={{ marginTop: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2563eb', fontWeight: 700 }}>Selección Exclusiva</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.25rem' }}>Productos Destacados</h2>
          </div>
          <Link to="/productos" className="btn btn-secondary btn-sm">Ver Catálogo</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Cargando prendas desde PostgreSQL...</div>
        ) : (
          <div className="products-grid">
            {destacados.map((prod) => (
              <ProductCard key={prod.idproducto} producto={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Banner de Nueva Colección */}
      <section className="container" style={{ marginTop: '5rem' }}>
        <div style={{
          background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '24px',
          padding: '5rem 3rem',
          textAlign: 'center',
          color: 'white',
        }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>
            Lanzamiento Exclusivo
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', margin: '1rem 0' }}>
            Estilo Urbano y Minimalista
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#e2e8f0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Prendas confeccionadas para resistir el paso del tiempo. Explora cortes Oversize, Slim y siluetas atemporales.
          </p>
          <Link to="/productos" className="btn btn-primary" style={{ background: 'white', color: '#0f172a' }}>
            Comprar Colección Ahora
          </Link>
        </div>
      </section>

      {/* Productos en Oferta */}
      {ofertas.length > 0 && (
        <section className="container" style={{ marginTop: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e11d48', fontWeight: 700 }}>Precios Rebajados</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.25rem' }}>Ofertas Especiales 🔥</h2>
            </div>
            <Link to="/productos?solo_ofertas=1" className="btn btn-secondary btn-sm">Ver Todas las Ofertas</Link>
          </div>

          <div className="products-grid">
            {ofertas.map((prod) => (
              <ProductCard key={prod.idproducto} producto={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Sección de Confianza y Arquitectura */}
      <section className="container" style={{ marginTop: '6rem' }}>
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginBottom: '1rem' }}>
            Arquitectura de Despliegue en Microsoft Azure
          </h3>
          <p style={{ maxWidth: '750px', margin: '0 auto 2rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Este sistema implementa una separación física estricta entre la Capa de Datos (VM1 en PostgreSQL 16) y las Capas de Presentación y Aplicación (VM2 con Apache 2 y PHP 8.x). La comunicación interna viaja a través de la red privada segura de Azure.
          </p>
          <div style={{ display: 'inline-flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-neutral" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              VM1: PostgreSQL 16 (20.25.217.22)
            </span>
            <span className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              VM2: Apache + PHP REST (64.236.189.196)
            </span>
            <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Frontend: React 18 + Vite SPA
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
