import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ producto }) {
  const {
    idproducto,
    nombreproducto,
    preciobase,
    preciooferta,
    imagen_url,
    categoria,
    modelo,
    stock_total,
    tallas_disponibles = [],
  } = producto;

  const tieneOferta = preciooferta && Number(preciooferta) > 0 && Number(preciooferta) < Number(preciobase);
  const precioFinal = tieneOferta ? Number(preciooferta) : Number(preciobase);
  
  // Porcentaje de descuento
  const porcentaje = tieneOferta 
    ? Math.round(((Number(preciobase) - Number(preciooferta)) / Number(preciobase)) * 100) 
    : 0;

  // Placeholder elegante si no hay imagen en BD
  const fallbackImg = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="product-card">
      <Link to={`/productos/${idproducto}`} className="product-image-box">
        <img
          src={imagen_url || fallbackImg}
          alt={nombreproducto}
          className="product-image"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        {tieneOferta && (
          <span className="badge-offer">
            -{porcentaje}% OFF
          </span>
        )}
      </Link>

      <div className="product-info">
        <div className="product-meta">
          <span>{categoria || 'Prenda'}</span>
          <span>{modelo || 'Corte'}</span>
        </div>

        <Link to={`/productos/${idproducto}`}>
          <h3 className="product-name">{nombreproducto}</h3>
        </Link>

        {tallas_disponibles.length > 0 && (
          <div className="product-variants-tags">
            {tallas_disponibles.slice(0, 4).map((t, idx) => (
              <span key={idx} className="variant-pill">{t}</span>
            ))}
            {tallas_disponibles.length > 4 && (
              <span className="variant-pill">+{tallas_disponibles.length - 4}</span>
            )}
          </div>
        )}

        <div className="product-pricing">
          <span className={`price-current ${tieneOferta ? 'price-offer' : ''}`}>
            S/ {precioFinal.toFixed(2)}
          </span>
          {tieneOferta && (
            <span className="price-original">
              S/ {Number(preciobase).toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ marginTop: '0.85rem' }}>
          <Link to={`/productos/${idproducto}`} className="btn btn-secondary btn-sm btn-block">
            Ver Detalles y Tallas
          </Link>
        </div>
      </div>
    </div>
  );
}
