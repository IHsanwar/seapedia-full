import api from './axiosInstance';

export const sellerReportsAPI = {
  // Get income report
  getIncomeReport: async () => {
    try {
      const response = await api.get('/api/v1/seller/reports/income');
      return response.data;
    } catch (error) {
      console.error('Error fetching income report:', error);
      throw error;
    }
  },

  // Get order list with pagination
  getOrderList: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/seller/reports/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching order list:', error);
      throw error;
    }
  },

  // Get processed orders
  getProcessedOrders: async () => {
    try {
      const response = await api.get('/api/v1/seller/reports/processed-orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching processed orders:', error);
      throw error;
    }
  },
};
