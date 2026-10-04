import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pedidosApi } from '../api/pedidos';

export default function Orders() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidosApi.misPedidos();
      setPedidos(data || []);
    } catch (err) {
      console.error('Error cargando historial de pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (idventa) => {
    try {
      setLoadingDetalle(true);
      const data = await pedidosApi.detalle(idventa);
      setSelectedPedido(data);
    } catch (err) {
      console.error('Error cargando detalle del pedido:', err);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pagado':
      case 'entregado':
        return 'badge-success';
      case 'preparando':
      case 'enviado':
        return 'badge-info';
      case 'pendiente':
        return 'badge-warning';
      case 'cancelado':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="container page-wrapper">
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '0.5rem' }}>
        Historial de Pedidos
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
        Registro de compras y comprobantes de pago asociados en PostgreSQL.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '20px',
          border: '1px dashed var(--border-medium)',
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No registras pedidos aún</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Explora las prendas de nuestra colección y realiza tu primera compra.
          </p>
          <Link to="/productos" className="btn btn-primary">Ir al Catálogo</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedidos.map((ped) => (
            <div
              key={ped.idventa}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Pedido
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  #{ped.idventa}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(ped.fechaventa).toLocaleDateString()} {new Date(ped.fechaventa).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Estado
                </span>
                <div>
                  <span className={`badge ${getBadgeClass(ped.estadoventa)}`} style={{ textTransform: 'capitalize' }}>
                    {ped.estadoventa}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Comprobante
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {ped.tipocomprobante || 'Boleta'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <code>{ped.numcomprobante || 'Pendiente'}</code>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Total
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                  S/ {Number(ped.montototal).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {ped.total_prendas} prendas
                </div>
              </div>

              <div>
                <button
                  onClick={() => verDetalle(ped.idventa)}
                  className="btn btn-secondary btn-sm"
                >
                  Ver Prendas 🔍
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detalle de Pedido */}
      {selectedPedido && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Detalle del Pedido #{selectedPedido.idventa}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Comprobante: {selectedPedido.tipocomprobante} {selectedPedido.numcomprobante}
                </span>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {selectedPedido.items?.map((item) => (
                <div
                  key={item.idventadetalle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                  }}
                >
                  <img
                    src={item.imagen_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'}
                    alt={item.nombreproducto}
                    style={{ width: '56px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.nombreproducto}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Talla: <strong>{item.talla}</strong> | Color: <strong>{item.color}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {item.cantidadproductos} × S/ {Number(item.preciounitario).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    S/ {Number(item.subtotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Pagado:</span>
              <span>S/ {Number(selectedPedido.montototal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
