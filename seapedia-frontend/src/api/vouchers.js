import api from './axiosInstance';

export const voucherAPI = {
  /**
   * Get all available vouchers for buyers
   * @returns {Promise} - List of available vouchers
   */
  getAvailableVouchers: async () => {
    const response = await api.get('/api/v1/buyer/vouchers/available');
    return response.data;
  },

  /**
   * Get single voucher by ID
   * @param {number} id - Voucher ID
   * @returns {Promise} - Voucher details
   */
  getVoucher: async (id) => {
    const response = await api.get(`/api/v1/buyer/vouchers/${id}`);
    return response.data;
  },

  /**
   * Apply voucher to calculate discount
   * @param {string} code - Voucher code
   * @param {number} subtotal - Order subtotal
   * @returns {Promise} - Discount calculation result
   */
  applyVoucher: async (code, subtotal) => {
    const response = await api.post('/api/v1/buyer/orders/apply-voucher', {
      voucher_code: code,
      subtotal,
    });
    return response.data;
  },
};

// Admin voucher management
export const adminVoucherAPI = {
  /**
   * Get all vouchers (admin)
   * @returns {Promise} - List of all vouchers
   */
  getVouchers: async () => {
    const response = await api.get('/api/v1/admin/vouchers');
    return response.data;
  },

  /**
   * Create new voucher (admin)
   * @param {Object} data - Voucher data
   * @returns {Promise} - Created voucher
   */
  createVoucher: async (data) => {
    const response = await api.post('/api/v1/admin/vouchers', data);
    return response.data;
  },

  /**
   * Update voucher (admin)
   * @param {number} id - Voucher ID
   * @param {Object} data - Voucher data
   * @returns {Promise} - Updated voucher
   */
  updateVoucher: async (id, data) => {
    const response = await api.put(`/api/v1/admin/vouchers/${id}`, data);
    return response.data;
  },

  /**
   * Delete voucher (admin)
   * @param {number} id - Voucher ID
   * @returns {Promise} - Deleted voucher
   */
  deleteVoucher: async (id) => {
    const response = await api.delete(`/api/v1/admin/vouchers/${id}`);
    return response.data;
  },
};
