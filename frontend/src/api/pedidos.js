import { api } from './client';

export const pedidosApi = {
  checkout: (tipocomprobante = 'Boleta') => api.post('/checkout', { tipocomprobante }),
  misPedidos: () => api.get('/pedidos'),
  detalle: (id) => api.get(`/pedidos/${id}`),
};
