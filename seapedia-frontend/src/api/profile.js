import api from './axiosInstance';

export const profileAPI = {
  // GET /api/profile — get current user profile
  getProfile: async () => {
    const response = await api.get('/api/profile');
    return response.data;
  },

  // PUT /api/profile — update current user profile
  updateProfile: async (data) => {
    const response = await api.put('/api/profile', data);
    return response.data;
  },

  // GET /api/profile/dashboard — get dashboard summary
  getDashboard: async () => {
    const response = await api.get('/api/profile/dashboard');
    return response.data;
  },
};
