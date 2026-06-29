import api from './axiosInstance';

export const sellerOrderAPI = {
  getOrders: async () => {
    const response = await api.get('/api/v1/seller/orders');
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/api/v1/seller/orders/${id}`);
    return response.data;
  },

  processOrder: async (data) => {
    const response = await api.post('/api/v1/seller/orders/process', data);
    return response.data;
  },
};