import api from './axiosInstance';

export const addressAPI = {
  getAddresses: async () => {
    const response = await api.get('/api/v1/buyer/addresses');
    return response.data;
  },

  createAddress: async (data) => {
    const response = await api.post('/api/v1/buyer/addresses', data);
    return response.data;
  },

  getAddress: async (id) => {
    const response = await api.get(`/api/v1/buyer/addresses/${id}`);
    return response.data;
  },

  updateAddress: async (id, data) => {
    const response = await api.put(`/api/v1/buyer/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/api/v1/buyer/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await api.post(`/api/v1/buyer/addresses/${id}/set-default`);
    return response.data;
  },
};
