import { api } from './client';

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Productos
  getProductos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/productos${q ? '?' + q : ''}`);
  },
  getProducto: (id) => api.get(`/admin/productos/${id}`),
  createProducto: (datos) => api.post('/admin/productos', datos),
  updateProducto: (id, datos) => api.put(`/admin/productos/${id}`, datos),
  deleteProducto: (id) => api.delete(`/admin/productos/${id}`),

  // Variantes
  getVariantes: (idproducto) => {
    const q = idproducto ? `?idproducto=${idproducto}` : '';
    return api.get(`/admin/variantes${q}`);
  },
  createVariante: (datos) => api.post('/admin/variantes', datos),
  updateVariante: (id, datos) => api.put(`/admin/variantes/${id}`, datos),
  deleteVariante: (id) => api.delete(`/admin/variantes/${id}`),

  // Categorías
  getCategorias: () => api.get('/admin/categorias'),
  createCategoria: (nombretipo) => api.post('/admin/categorias', { nombretipo }),
  updateCategoria: (id, nombretipo) => api.put(`/admin/categorias/${id}`, { nombretipo }),
  deleteCategoria: (id) => api.delete(`/admin/categorias/${id}`),

  // Modelos
  getModelos: () => api.get('/admin/modelos'),
  createModelo: (nombremodelo) => api.post('/admin/modelos', { nombremodelo }),

  // Pedidos
  getPedidos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/pedidos${q ? '?' + q : ''}`);
  },
  getPedido: (id) => api.get(`/admin/pedidos/${id}`),
  updatePedidoEstado: (id, estadoventa) => api.put(`/admin/pedidos/${id}/estado`, { estadoventa }),

  // Usuarios
  getUsuarios: () => api.get('/admin/usuarios'),
};
