import api from './axiosInstance';

export const promosAPI = {
  // Get available promos for buyers
  getAvailablePromos: async () => {
    try {
      const response = await api.get('/api/v1/buyer/promos/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available promos:', error);
      throw error;
    }
  },

  // Apply promo code (validate and calculate discount)
  applyPromo: async (promoCode, subtotal) => {
    try {
      const response = await api.post('/api/v1/buyer/orders/apply-promo', {
        promo_code: promoCode,
        subtotal,
      });
      return response.data;
    } catch (error) {
      console.error('Error applying promo:', error);
      throw error;
    }
  },

  // Admin: Get all promos
  getAllPromos: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/admin/promos', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching promos:', error);
      throw error;
    }
  },

  // Admin: Get promo detail
  getPromo: async (id) => {
    try {
      const response = await api.get(`/api/v1/admin/promos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promo:', error);
      throw error;
    }
  },

  // Admin: Create promo
  createPromo: async (data) => {
    try {
      const response = await api.post('/api/v1/admin/promos', data);
      return response.data;
    } catch (error) {
      console.error('Error creating promo:', error);
      throw error;
    }
  },

  // Admin: Update promo
  updatePromo: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/admin/promos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating promo:', error);
      throw error;
    }
  },

  // Admin: Delete promo
  deletePromo: async (id) => {
    try {
      const response = await api.delete(`/api/v1/admin/promos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting promo:', error);
      throw error;
    }
  },
};
