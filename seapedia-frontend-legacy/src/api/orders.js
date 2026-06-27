import api from './axiosInstance';

export const orderAPI = {
  getOrders: async () => {
    const response = await api.get('/api/v1/buyer/orders');
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/api/v1/buyer/orders/${id}`);
    return response.data;
  },

  checkout: async (data) => {
    const response = await api.post('/api/v1/buyer/orders/checkout', data);
    return response.data;
  },

  applyVoucher: async (data) => {
    const response = await api.post('/api/v1/buyer/orders/apply-voucher', data);
    return response.data;
  },
};