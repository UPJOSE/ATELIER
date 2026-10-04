import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [updatingId, setUpdatingId] = useState(null);

  const items = cart?.items || [];
  const total = Number(cart?.total_monto || 0);
  const totalItems = cart?.total_items || 0;

  const handleUpdate = async (item, delta) => {
    const nuevaCant = Number(item.cantidad) + delta;
    if (nuevaCant > Number(item.stock)) {
      setToast({ message: `No puedes superar el stock disponible (${item.stock} uds).`, type: 'error' });
      return;
    }

    try {
      setUpdatingId(item.idcarritodetalle);
      await updateQuantity(item.idcarritodetalle, nuevaCant);
    } catch (err) {
      setToast({ message: err.message || 'Error actualizando cantidad.', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (idcarritodetalle) => {
    try {
      await removeFromCart(idcarritodetalle);
      setToast({ message: 'Prenda eliminada del carrito.', type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Error eliminando item.', type: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>
          Tu Bolsa de Compras
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Inicia sesión para revisar los artículos seleccionados en tu carrito.
        </p>
        <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛍️</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '0.75rem' }}>
          Tu bolsa está vacía
        </h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Aún no has agregado ninguna prenda a tu carrito de compras.
        </p>
        <Link to="/productos" className="btn btn-primary">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem' }}>
          Bolsa de Compras ({totalItems})
        </h1>
        <button
          onClick={clearCart}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Vaciar Carrito
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>
        {/* Listado de Items en carritodetalle */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item) => (
              <div
                key={item.idcarritodetalle}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center',
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Imagen */}
                <img
                  src={item.imagen_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                  alt={item.nombreproducto}
                  style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                />

                {/* Detalles de Variante y Producto */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {item.nombreproducto}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="badge badge-neutral">Talla: {item.talla}</span>
                    <span className="badge badge-neutral">Color: {item.color}</span>
                    <span className="badge badge-info">Stock: {item.stock}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Control de Cantidad */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item, -1)}
                        disabled={updatingId === item.idcarritodetalle}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ width: '36px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item, 1)}
                        disabled={updatingId === item.idcarritodetalle || Number(item.cantidad) >= Number(item.stock)}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.idcarritodetalle)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    S/ {Number(item.subtotal).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    S/ {Number(item.preciounitario).toFixed(2)} c/u
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen del Pedido */}
        <aside style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: '90px',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            Resumen de Compra
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal ({totalItems} prendas):</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Costo de Envío:</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Gratis</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
              <span>Total:</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-block"
            style={{ padding: '0.9rem 1.5rem', fontSize: '1rem' }}
          >
            Proceder al Checkout →
          </button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            🔒 Compra protegida. Simulación de pago y emisión de comprobante en VM1.
          </div>
        </aside>
      </div>
    </div>
  );
}
