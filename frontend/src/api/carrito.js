import { api } from './client';

export const carritoApi = {
  obtener: () => api.get('/carrito'),
  agregar: (idinventario, cantidad = 1) => api.post('/carrito/items', { idinventario, cantidad }),
  actualizar: (id, cantidad) => api.put(`/carrito/items/${id}`, { cantidad }),
  eliminar: (id) => api.delete(`/carrito/items/${id}`),
  vaciar: () => api.delete('/carrito'),
};
