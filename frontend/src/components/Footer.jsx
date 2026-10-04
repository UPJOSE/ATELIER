import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand-logo" style={{ color: 'white', marginBottom: '1rem' }}>
              ATELIER
              <span className="brand-badge">Moda</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8', maxWidth: '320px' }}>
              Plataforma de comercio electrónico de moda contemporánea diseñada con arquitectura de tres capas: React + PHP REST API + PostgreSQL 16 sobre Microsoft Azure.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Navegación</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Inicio</Link></li>
              <li><Link to="/productos" className="footer-link">Catálogo Completo</Link></li>
              <li><Link to="/categorias" className="footer-link">Colecciones</Link></li>
              <li><Link to="/productos?solo_ofertas=1" className="footer-link">Ofertas Especiales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Mi Cuenta</h4>
            <ul className="footer-links">
              <li><Link to="/perfil" className="footer-link">Mi Perfil</Link></li>
              <li><Link to="/pedidos" className="footer-link">Historial de Pedidos</Link></li>
              <li><Link to="/carrito" className="footer-link">Bolsa de Compras</Link></li>
              <li><Link to="/admin/login" className="footer-link">Acceso Administrativo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Arquitectura de Servidores</h4>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong style={{ color: 'white' }}>VM1 (Datos):</strong> 20.25.217.22 (PostgreSQL 16)</div>
              <div><strong style={{ color: 'white' }}>VM2 (Web/App):</strong> 64.236.189.196 (Apache + PHP + React)</div>
              <div style={{ marginTop: '0.5rem', color: '#38bdf8' }}>✓ Red Privada Azure Peering Activo</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ATELIER Moda S.A.C. - Proyecto Académico de Sistemas Operativos - UPC.</p>
          <p>Desarrollado para Sustentación de Arquitectura de Sistemas Distribuidos.</p>
        </div>
      </div>
    </footer>
  );
}
