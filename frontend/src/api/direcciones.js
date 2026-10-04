import { api } from './client';

export const direccionesApi = {
  listar: () => api.get('/direcciones'),
  crear: (datos) => api.post('/direcciones', datos),
  actualizar: (id, datos) => api.put(`/direcciones/${id}`, datos),
  eliminar: (id) => api.delete(`/direcciones/${id}`),
  establecerPrincipal: (id) => api.put(`/direcciones/${id}/principal`),
  
  // Ubigeo
  departamentos: () => api.get('/ubigeo/departamentos'),
  provincias: (iddepartamento) => api.get(`/ubigeo/provincias/${iddepartamento}`),
  distritos: (idprovincia) => api.get(`/ubigeo/distritos/${idprovincia}`),

  // Métodos de pago
  metodosPago: () => api.get('/metodos-pago'),
  crearMetodoPago: (datos) => api.post('/metodos-pago', datos),
};
