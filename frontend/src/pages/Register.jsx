import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Register() {
  const [form, setForm] = useState({
    nombres: '',
    apellidopaterno: '',
    apellidomaterno: '',
    celular: '',
    nombreusuario: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast({ message: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    if (form.password.length < 6) {
      setToast({ message: 'La contraseña debe contener al menos 6 caracteres.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      await register({
        nombres: form.nombres,
        apellidopaterno: form.apellidopaterno,
        apellidomaterno: form.apellidomaterno,
        celular: form.celular,
        nombreusuario: form.nombreusuario,
        correo: form.correo,
        password: form.password,
      });

      setToast({ message: '¡Cuenta creada con éxito!', type: 'success' });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setToast({ message: err.message || 'Error al registrar la cuenta.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: '580px', margin: '1rem auto' }}>
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
            Crear Cuenta de Cliente
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Registro relacional en tablas <code>consumidor</code> y <code>loginusuario</code>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Datos Personales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombres</label>
              <input
                type="text"
                name="nombres"
                className="form-control"
                placeholder="Ej. Valeria"
                value={form.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellido Paterno</label>
              <input
                type="text"
                name="apellidopaterno"
                className="form-control"
                placeholder="Ej. Rios"
                value={form.apellidopaterno}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Apellido Materno</label>
              <input
                type="text"
                name="apellidomaterno"
                className="form-control"
                placeholder="Ej. Gomez"
                value={form.apellidomaterno}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Celular</label>
              <input
                type="tel"
                name="celular"
                className="form-control"
                placeholder="Ej. 987654321"
                value={form.celular}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '1.25rem 0' }} />

          {/* Credenciales de Acceso */}
          <div className="form-group">
            <label className="form-label">Nombre de Usuario (Username)</label>
            <input
              type="text"
              name="nombreusuario"
              className="form-control"
              placeholder="Ej. valeria_moda"
              value={form.nombreusuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              placeholder="tu@correo.com"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repita su contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-block"
            style={{ padding: '0.85rem', marginTop: '1rem' }}
          >
            {submitting ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          ¿Ya tienes una cuenta registrada?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
