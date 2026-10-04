import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p>Verificando permisos de administración...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #fee2e2' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Acceso Restringido (403)</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Su cuenta no cuenta con rol de <strong>Administrador</strong>. Esta área está reservada exclusivamente para la gestión de la tienda.
          </p>
          <a href="/" className="btn btn-primary">Volver a la Tienda</a>
        </div>
      </div>
    );
  }

  return children;
}
