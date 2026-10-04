import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !password) {
      setToast({ message: 'Ingrese correo y contraseña.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(correo, password);
      setToast({ message: 'Sesión iniciada con éxito.', type: 'success' });
      
      // Si es admin, redirigir a panel
      if (res?.usuario?.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setToast({ message: err.message || 'Error al iniciar sesión.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const setCredencialesDemo = (tipo) => {
    if (tipo === 'cliente') {
      setCorreo('cliente@tienda.com');
      setPassword('Cliente123!');
    } else {
      setCorreo('admin@tienda.com');
      setPassword('Admin123!');
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div style={{
        background: 'white',
        borderRadius: '24px',
        border: '1px solid var(--border-light)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Bienvenido
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Ingresa a tu cuenta para gestionar tu carrito y pedidos
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Cuentas Demo Rápidas */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed var(--border-medium)',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>
            Credenciales de Prueba (PostgreSQL Seeder):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setCredencialesDemo('cliente')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Cliente Demo
            </button>
            <button
              type="button"
              onClick={() => setCredencialesDemo('admin')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          ¿No tienes una cuenta aún?{' '}
          <Link to="/registro" style={{ color: '#2563eb', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
