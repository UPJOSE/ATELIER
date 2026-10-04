import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          ATELIER
          <span className="brand-badge">Moda</span>
        </Link>

        {/* Public Navigation */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Catálogo
              </NavLink>
            </li>
            <li>
              <NavLink to="/categorias" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Categorías
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos?solo_ofertas=1" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Ofertas 🔥
              </NavLink>
            </li>
            {isAdmin && (
              <li>
                <NavLink to="/admin" className="badge badge-info" style={{ textDecoration: 'none' }}>
                  Panel Admin ⚡
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Actions (Cart & User) */}
        <div className="nav-actions">
          {/* Cart Button */}
          <Link to="/carrito" className="cart-btn" title="Ver carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </Link>

          {/* User Status */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to={isAdmin ? "/admin" : "/perfil"} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>{user?.nombres || user?.nombreusuario}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Cerrar sesión">
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Ingresar
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registro
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
