import api from './axiosInstance';

/**
 * Admin API module — Dashboard, Monitoring, Overdue
 */
export const adminAPI = {
  // ─── Dashboard & Stats ───────────────────────────────────

  getDashboard: async () => {
    const response = await api.get('/api/v1/admin/dashboard');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/api/v1/admin/stats/users');
    return response.data;
  },

  getOrderStats: async () => {
    const response = await api.get('/api/v1/admin/stats/orders');
    return response.data;
  },

  getDeliveryStats: async () => {
    const response = await api.get('/api/v1/admin/stats/deliveries');
    return response.data;
  },

  // ─── Monitoring: Stores ──────────────────────────────────

  getStores: async (params = {}) => {
    const response = await api.get('/api/v1/admin/stores', { params });
    return response.data;
  },

  getStoreDetail: async (id) => {
    const response = await api.get(`/api/v1/admin/stores/${id}`);
    return response.data;
  },

  // ─── Monitoring: Products ────────────────────────────────

  getProducts: async (params = {}) => {
    const response = await api.get('/api/v1/admin/products', { params });
    return response.data;
  },

  // ─── Monitoring: Orders ──────────────────────────────────

  getOrders: async (params = {}) => {
    const response = await api.get('/api/v1/admin/orders', { params });
    return response.data;
  },

  getOrderDetail: async (id) => {
    const response = await api.get(`/api/v1/admin/orders/${id}`);
    return response.data;
  },

  // ─── Monitoring: Deliveries ──────────────────────────────

  getDeliveries: async (params = {}) => {
    const response = await api.get('/api/v1/admin/deliveries', { params });
    return response.data;
  },

  getDeliveryDetail: async (id) => {
    const response = await api.get(`/api/v1/admin/deliveries/${id}`);
    return response.data;
  },

  // ─── Overdue Handling ────────────────────────────────────

  getOverdueOrders: async () => {
    const response = await api.get('/api/v1/admin/overdue-orders');
    return response.data;
  },

  processAllOverdue: async () => {
    const response = await api.post('/api/v1/admin/overdue/process');
    return response.data;
  },

  refundOverdueOrder: async (orderId) => {
    const response = await api.post(`/api/v1/admin/overdue/${orderId}/refund`);
    return response.data;
  },

  simulateNextDay: async (hours = 24) => {
    const response = await api.post('/api/v1/admin/simulate-next-day', { hours });
    return response.data;
  },

  // ─── Users ───────────────────────────────────────────────

  getUsers: async (params = {}) => {
    const response = await api.get('/api/v1/admin/users', { params });
    return response.data;
  },
};
