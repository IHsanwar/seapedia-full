import api from './axiosInstance';

export const profileAPI = {
  // GET /api/v1/profile — get current user profile
  getProfile: async () => {
    const response = await api.get('/api/v1/profile');
    return response.data;
  },

  // PUT /api/v1/profile — update current user profile
  updateProfile: async (data) => {
    const response = await api.put('/api/v1/profile', data);
    return response.data;
  },

  // DELETE /api/v1/profile — delete current user account
  deleteProfile: async () => {
    const response = await api.delete('/api/v1/profile');
    return response.data;
  },

  // GET /api/v1/profile/dashboard — get dashboard summary
  getDashboard: async () => {
    const response = await api.get('/api/v1/profile/dashboard');
    return response.data;
  },
};
