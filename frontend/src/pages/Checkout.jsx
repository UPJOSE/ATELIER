import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { pedidosApi } from '../api/pedidos';
import { direccionesApi } from '../api/direcciones';
import Toast from '../components/Toast';

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [direcciones, setDirecciones] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [metodoPago, setMetodoPago] = useState('tarjeta_simulada');

  // Formulario de nueva dirección rápida
  const [mostrarNuevaDir, setMostrarNuevaDir] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [nuevaDir, setNuevaDir] = useState({
    iddepartamento: '',
    idprovincia: '',
    iddistrito: '',
    callenumero: '',
    referenciadetalle: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ordenCompletada, setOrdenCompletada] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const items = cart?.items || [];
  const total = Number(cart?.total_monto || 0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dirs, deps] = await Promise.all([
        direccionesApi.listar().catch(() => []),
        direccionesApi.departamentos().catch(() => []),
      ]);
      setDirecciones(dirs || []);
      setDepartamentos(deps || []);

      const principal = dirs?.find((d) => d.esprincipaldireccion) || dirs?.[0];
      if (principal) {
        setSelectedDireccionId(String(principal.iddireccion));
      } else if (dirs?.length === 0) {
        setMostrarNuevaDir(true);
      }
    } catch (err) {
      console.error('Error cargando checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptoChange = async (depId) => {
    setNuevaDir((prev) => ({ ...prev, iddepartamento: depId, idprovincia: '', iddistrito: '' }));
    setProvincias([]);
    setDistritos([]);
    if (depId) {
      const provs = await direccionesApi.provincias(depId);
      setProvincias(provs || []);
    }
  };

  const handleProvChange = async (provId) => {
    setNuevaDir((prev) => ({ ...prev, idprovincia: provId, iddistrito: '' }));
    setDistritos([]);
    if (provId) {
      const dists = await direccionesApi.distritos(provId);
      setDistritos(dists || []);
    }
  };

  const handleGuardarDireccion = async (e) => {
    e.preventDefault();
    if (!nuevaDir.iddistrito || !nuevaDir.callenumero) {
      setToast({ message: 'Por favor complete todos los datos de la dirección.', type: 'error' });
      return;
    }

    try {
      const guardada = await direccionesApi.crear({
        iddistrito: nuevaDir.iddistrito,
        callenumero: nuevaDir.callenumero,
        referenciadetalle: nuevaDir.referenciadetalle,
        esprincipaldireccion: true,
      });
      setToast({ message: 'Dirección guardada exitosamente.', type: 'success' });
      setMostrarNuevaDir(false);
      const dirs = await direccionesApi.listar();
      setDirecciones(dirs);
      setSelectedDireccionId(String(guardada.iddireccion));
    } catch (err) {
      setToast({ message: err.message || 'Error guardando dirección.', type: 'error' });
    }
  };

  const handleProcesarCompra = async () => {
    if (items.length === 0) {
      setToast({ message: 'El carrito no tiene prendas para procesar.', type: 'error' });
      return;
    }

    if (!selectedDireccionId && !mostrarNuevaDir) {
      setToast({ message: 'Seleccione o registre una dirección de entrega.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const resultado = await pedidosApi.checkout(tipoComprobante);
      setOrdenCompletada(resultado);
      await fetchCart(); // Actualiza el estado global de la bolsa
    } catch (err) {
      setToast({ message: err.message || 'Error durante el checkout.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (ordenCompletada) {
    return (
      <div className="container page-wrapper" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          padding: '3.5rem 2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            ¡Compra Confirmada!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Tu pedido ha sido procesado de forma exitosa y registrado en PostgreSQL 16.
          </p>

          {/* Ficha del Comprobante de Pago */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.9rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Comprobante de Pago Electrónico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><strong>N° de Pedido:</strong> #{ordenCompletada.idventa}</div>
              <div><strong>Tipo:</strong> {ordenCompletada.comprobante?.tipocomprobante}</div>
              <div><strong>Comprobante:</strong> <code>{ordenCompletada.comprobante?.numcomprobante}</code></div>
              <div><strong>Estado Venta:</strong> <span className="badge badge-success">{ordenCompletada.estadoventa}</span></div>
              <div><strong>Total Pagado:</strong> S/ {Number(ordenCompletada.montototal).toFixed(2)}</div>
              <div><strong>Emisión:</strong> {new Date(ordenCompletada.fechaventa).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/pedidos" className="btn btn-primary">
              Ver Mis Pedidos
            </Link>
            <Link to="/productos" className="btn btn-secondary">
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '2rem' }}>
        Finalizar Pedido
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        {/* Pasos de Entrega y Pago */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Paso 1: Dirección de Entrega */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>1. Dirección de Envío</h2>
              {direcciones.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMostrarNuevaDir(!mostrarNuevaDir)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {mostrarNuevaDir ? 'Seleccionar existente' : '+ Nueva Dirección'}
                </button>
              )}
            </div>

            {!mostrarNuevaDir && direcciones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {direcciones.map((d) => (
                  <label
                    key={d.iddireccion}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: selectedDireccionId === String(d.iddireccion) ? '2px solid #2563eb' : '1px solid var(--border-medium)',
                      background: selectedDireccionId === String(d.iddireccion) ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="dir"
                      value={d.iddireccion}
                      checked={selectedDireccionId === String(d.iddireccion)}
                      onChange={(e) => setSelectedDireccionId(e.target.value)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.callenumero}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {d.nombredistrito}, {d.nombreprovincia} - {d.nombredepartamento}
                      </div>
                      {d.referenciadetalle && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Ref: {d.referenciadetalle}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* Formulario Rápido de Ubigeo */
              <form onSubmit={handleGuardarDireccion}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Departamento</label>
                    <select
                      className="form-control"
                      value={nuevaDir.iddepartamento}
                      onChange={(e) => handleDeptoChange(e.target.value)}
                      required
                    >
                      <option value="">Seleccione</option>
                      {departamentos.map((dep) => (
                        <option key={dep.iddepartamento} value={dep.iddepartamento}>
                          {dep.nombredepartamento}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Provincia</label>
                    <select
                      className="form-control"
                      value={nuevaDir.idprovincia}
                      onChange={(e) => handleProvChange(e.target.value)}
                      disabled={!nuevaDir.iddepartamento}
                      required
                    >
                      <option value="">Seleccione</option>
                      {provincias.map((p) => (
                        <option key={p.idprovincia} value={p.idprovincia}>
                          {p.nombreprovincia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Distrito</label>
                    <select
                      className="form-control"
                      value={nuevaDir.iddistrito}
                      onChange={(e) => setNuevaDir({ ...nuevaDir, iddistrito: e.target.value })}
                      disabled={!nuevaDir.idprovincia}
                      required
                    >
                      <option value="">Seleccione</option>
                      {distritos.map((dist) => (
                        <option key={dist.iddistrito} value={dist.iddistrito}>
                          {dist.nombredistrito}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección (Calle / Av. y Número)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Av. Larco 450, Dpto 301"
                    value={nuevaDir.callenumero}
                    onChange={(e) => setNuevaDir({ ...nuevaDir, callenumero: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Referencia (Opcional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej. Frente al centro comercial"
                    value={nuevaDir.referenciadetalle}
                    onChange={(e) => setNuevaDir({ ...nuevaDir, referenciadetalle: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-secondary btn-sm">
                  Guardar Dirección
                </button>
              </form>
            )}
          </div>

          {/* Paso 2: Tipo de Comprobante */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              2. Comprobante de Pago
            </h2>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="comprobante"
                  value="Boleta"
                  checked={tipoComprobante === 'Boleta'}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                />
                Boleta de Venta
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="comprobante"
                  value="Factura"
                  checked={tipoComprobante === 'Factura'}
                  onChange={(e) => setTipoComprobante(e.target.value)}
                />
                Factura Electrónica
              </label>
            </div>
          </div>

          {/* Paso 3: Método de Pago Simulado */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              3. Forma de Pago
            </h2>
            <div style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid #2563eb',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Simulación Segura de Pasarela</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tarjeta de prueba **** **** **** 4242</div>
                </div>
              </div>
              <span className="badge badge-success">Activo</span>
            </div>
          </div>
        </div>

        {/* Resumen Lateral */}
        <aside style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: '90px'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Tu Pedido ({items.length} prendas)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {items.map((item) => (
              <div key={item.idcarritodetalle} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.nombreproducto}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.talla} / {item.color} × {item.cantidad}</div>
                </div>
                <div style={{ fontWeight: 700 }}>
                  S/ {Number(item.subtotal).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '1rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
            <span>Total a Pagar:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleProcesarCompra}
            disabled={submitting || items.length === 0}
            className="btn btn-primary btn-block"
            style={{ padding: '0.9rem 1.5rem', fontSize: '1rem' }}
          >
            {submitting ? 'Confirmando en Base de Datos...' : 'Pagar y Generar Comprobante'}
          </button>
        </aside>
      </div>
    </div>
  );
}
