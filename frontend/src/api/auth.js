import api from './axiosInstance';

export const authAPI = {
  register: async (data) => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
  
  switchRole: async (role) => {
    const response = await api.post('/api/v1/auth/switch-role', { role });
    return response.data;
  },

  addRole: async (role) => {
    const response = await api.post('/api/v1/auth/add-role', { role });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/api/v1/profile/dashboard');
    return response.data;
  }
};
