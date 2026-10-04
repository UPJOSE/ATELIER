import React, { createContext, useContext, useState, useEffect } from 'react';
import { carritoApi } from '../api/carrito';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, total_monto: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], total_items: 0, total_monto: 0 });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await carritoApi.obtener();
      if (data) {
        setCart(data);
      }
    } catch (err) {
      console.error('Error cargando carrito:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (idinventario, cantidad = 1) => {
    if (!isAuthenticated) {
      throw new Error('Debe iniciar sesión para agregar prendas a su carrito.');
    }
    const data = await carritoApi.agregar(idinventario, cantidad);
    if (data) {
      setCart(data);
    }
    return data;
  };

  const updateQuantity = async (idcarritodetalle, cantidad) => {
    const data = await carritoApi.actualizar(idcarritodetalle, cantidad);
    if (data) {
      setCart(data);
    }
    return data;
  };

  const removeFromCart = async (idcarritodetalle) => {
    const data = await carritoApi.eliminar(idcarritodetalle);
    if (data) {
      setCart(data);
    }
    return data;
  };

  const clearCart = async () => {
    await carritoApi.vaciar();
    setCart({ items: [], total_items: 0, total_monto: 0 });
  };

  const value = {
    cart,
    cartCount: cart.total_items || 0,
    cartTotal: cart.total_monto || 0,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
