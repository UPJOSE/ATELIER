import { api } from './client';

export const productosApi = {
  listar: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return api.get(`/productos${qs ? '?' + qs : ''}`);
  },
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  obtenerVariantes: (id) => api.get(`/productos/${id}/variantes`),
  destacados: (limit = 8) => api.get(`/productos/destacados?limit=${limit}`),
  ofertas: (limit = 8) => api.get(`/productos/ofertas?limit=${limit}`),
  categorias: () => api.get('/categorias'),
  modelos: () => api.get('/modelos'),
};
