import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Toast from '../../components/Toast';

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const estadosPermitidos = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];

  useEffect(() => {
    cargarPedidos();
  }, [filtroEstado]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPedidos({ estado: filtroEstado });
      setPedidos(data || []);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (idventa, nuevoEstado) => {
    try {
      await adminApi.updatePedidoEstado(idventa, nuevoEstado);
      setToast({ message: `Estado del pedido #${idventa} actualizado a "${nuevoEstado}".`, type: 'success' });
      cargarPedidos();
    } catch (err) {
      setToast({ message: err.message || 'Error al actualizar estado.', type: 'error' });
    }
  };

  const handleVerDetalle = async (idventa) => {
    try {
      const data = await adminApi.getPedido(idventa);
      setSelectedPedido(data);
    } catch (err) {
      setToast({ message: 'Error cargando detalle.', type: 'error' });
    }
  };

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Gestión de Pedidos</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Control de órdenes comerciales y estados de venta (<code>venta</code>, <code>comprobantepago</code>)</p>
        </div>
        <Link to="/admin" className="btn btn-secondary btn-sm">← Volver al Dashboard</Link>
      </div>

      {/* Filtro por Estado */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filtrar por Estado:</label>
        <select
          className="form-control"
          style={{ maxWidth: '240px' }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los Estados ({pedidos.length})</option>
          {estadosPermitidos.map((est) => (
            <option key={est} value={est}>{est.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Consultando ventas en PostgreSQL...</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Fecha</th>
                <th>Comprobante</th>
                <th>Monto Total</th>
                <th>Estado Venta</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron órdenes registradas.</td>
                </tr>
              ) : (
                pedidos.map((p) => (
                  <tr key={p.idventa}>
                    <td><strong>#{p.idventa}</strong></td>
                    <td>{p.cliente_nombre}</td>
                    <td><span style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.correo}</span></td>
                    <td>{new Date(p.fechaventa).toLocaleDateString()}</td>
                    <td>
                      <div>{p.tipocomprobante}</div>
                      <code>{p.numcomprobante}</code>
                    </td>
                    <td><strong>S/ {Number(p.montototal).toFixed(2)}</strong></td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                        value={p.estadoventa}
                        onChange={(e) => handleCambiarEstado(p.idventa, e.target.value)}
                      >
                        {estadosPermitidos.map((est) => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleVerDetalle(p.idventa)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem' }}
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle */}
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
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Pedido #{selectedPedido.idventa} - {selectedPedido.nombres} {selectedPedido.apellidopaterno}
              </h3>
              <button onClick={() => setSelectedPedido(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#475569' }}>
              <div><strong>Comprobante:</strong> {selectedPedido.tipocomprobante} {selectedPedido.numcomprobante}</div>
              <div><strong>Fecha Emisión:</strong> {new Date(selectedPedido.fechaemision).toLocaleString()}</div>
              <div><strong>Teléfono:</strong> {selectedPedido.celular || 'No registrado'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedPedido.items?.map((it) => (
                <div key={it.idventadetalle} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.nombreproducto}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Talla: {it.talla} | Color: {it.color} | Cantidad: {it.cantidadproductos}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>S/ {Number(it.subtotal).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <span>Total Orden:</span>
              <span>S/ {Number(selectedPedido.montototal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
