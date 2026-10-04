import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Páginas Públicas
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas Cliente
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';

// Páginas Administrador
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Catalog />} />
                <Route path="/productos/:id" element={<ProductDetail />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />

                {/* Rutas Protegidas - Cliente */}
                <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

                {/* Rutas Administrador */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/productos" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/productos/nuevo" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                <Route path="/admin/productos/:id/editar" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
                <Route path="/admin/categorias" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/inventario" element={<AdminRoute><AdminInventory /></AdminRoute>} />
                <Route path="/admin/pedidos" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
