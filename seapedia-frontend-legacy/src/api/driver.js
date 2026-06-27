import api from './axiosInstance';

export const driverAPI = {
  register: async (data) => {
    const response = await api.post('/api/v1/driver/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/v1/driver/profile');
    return response.data;
  },

  getAvailableJobs: async (page = 1) => {
    const response = await api.get(`/api/v1/driver/jobs?page=${page}`);
    return response.data;
  },

  getMyJobs: async (page = 1) => {
    const response = await api.get(`/api/v1/driver/my-jobs?page=${page}`);
    return response.data;
  },

  takeJob: async (deliveryId) => {
    const response = await api.post(`/api/v1/driver/jobs/${deliveryId}/take`);
    return response.data;
  },

  completeJob: async (deliveryId) => {
    const response = await api.post(`/api/v1/driver/jobs/${deliveryId}/complete`);
    return response.data;
  }
};
