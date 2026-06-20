import api from './axiosInstance';

// Store API
export const storeAPI = {
  /** Get the current seller's store (GET /api/store) */
  getStore: async () => {
    const response = await api.get('/api/store');
    return response.data;
  },

  /** Create a new store (POST /api/store) - accepts JSON or FormData */
  createStore: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/api/store', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update store (PUT /api/store with JSON).
   * If a logo/banner file needs to be sent, pass FormData - we add _method=PUT for spoofing.
   */
  updateStore: async (data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await api.post('/api/store', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.put('/api/store', data);
    return response.data;
  },

  /** Delete store (DELETE /api/store) */
  deleteStore: async () => {
    const response = await api.delete('/api/store');
    return response.data;
  },
};

// Seller Product API
export const sellerProductAPI = {
  /** List seller's products (GET /api/v1/product/products) */
  getProducts: async () => {
    const response = await api.get('/api/v1/product/products');
    return response.data;
  },

  /** Get single product (GET /api/v1/product/product/:id) */
  getProduct: async (id) => {
    const response = await api.get(`/api/v1/product/product/${id}`);
    return response.data;
  },

  /**
   * Create product (POST /api/v1/product/product).
   * Pass a FormData to include thumbnail_image.
   */
  createProduct: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/api/v1/product/product', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update product.
   * If data is FormData (has file), use POST + _method=PUT spoofing.
   * Otherwise plain PUT with JSON.
   */
  updateProduct: async (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await api.post(`/api/v1/product/product/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.put(`/api/v1/product/product/${id}`, data);
    return response.data;
  },

  /** Delete product (DELETE /api/v1/product/product/:id) */
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/v1/product/product/${id}`);
    return response.data;
  },
};
