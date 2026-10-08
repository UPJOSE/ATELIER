import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

export default function AdminLogin() {
  const [correo, setCorreo] = useState('admin@tienda.com');
  const [password, setPassword] = useState('Admin123!');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await login(correo, password);
      if (res?.usuario?.rol !== 'admin' && res?.usuario?.rol !== 'administrador') {
        setToast({ message: 'La cuenta no posee rol de Administrador.', type: 'error' });
        return;
      }
      navigate('/admin');
    } catch (err) {
      setToast({ message: err.message || 'Error de autenticación.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{
        background: '#090d16',
        color: 'white',
        borderRadius: '24px',
        border: '1px solid #1e293b',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Seguridad Azure</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Acceso Administrativo
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Panel de control y gestión del ecommerce
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#e2e8f0' }}>Correo Institucional</label>
            <input
              type="email"
              className="form-control"
              style={{ background: '#1e293b', color: 'white', borderColor: '#334155' }}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#e2e8f0' }}>Contraseña</label>
            <input
              type="password"
              className="form-control"
              style={{ background: '#1e293b', color: 'white', borderColor: '#334155' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ background: '#2563eb', color: 'white', marginTop: '1rem', padding: '0.85rem' }}
          >
            {submitting ? 'Verificando RBAC...' : 'Ingresar al Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline' }}>
            ← Volver a la Tienda Pública
          </a>
        </div>
      </div>
    </div>
  );
}
