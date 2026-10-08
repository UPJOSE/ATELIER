import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authApi.me();
      if (data) {
        setUser(data);
        localStorage.setItem('auth_user', JSON.stringify(data));
      }
    } catch (err) {
      // Si expira o no hay sesión
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (correo, password) => {
    const res = await authApi.login(correo, password);
    if (res?.usuario) {
      setUser(res.usuario);
      localStorage.setItem('auth_user', JSON.stringify(res.usuario));
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
      }
    }
    return res;
  };

  const register = async (datos) => {
    const res = await authApi.register(datos);
    if (res?.usuario) {
      setUser(res.usuario);
      localStorage.setItem('auth_user', JSON.stringify(res.usuario));
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
      }
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignorar error al limpiar localmente
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin' || user?.rol === 'administrador',
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
