import api from './axiosInstance';

export const buyerReportsAPI = {
  // Get spending report
  getSpendingReport: async () => {
    try {
      const response = await api.get('/api/v1/buyer/reports/spending');
      return response.data;
    } catch (error) {
      console.error('Error fetching spending report:', error);
      throw error;
    }
  },

  // Get order history with pagination
  getOrderHistory: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/buyer/reports/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  },
};
