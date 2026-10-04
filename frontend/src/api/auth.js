import { api } from './client';

export const authApi = {
  register: (datos) => api.post('/auth/register', datos),
  login: (correo, password) => api.post('/auth/login', { correo, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (datos) => api.put('/perfil', datos),
};
