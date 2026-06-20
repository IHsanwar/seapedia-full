import api from './axiosInstance';

export const productsAPI = {
  // GET /api/v1/products — public catalogue listing
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response && error.response.status === 404) {
        return { data: [], message: 'Products API not ready yet' };
      }
      throw error;
    }
  },

  // GET /api/v1/products/{id}-{slug} — public product detail
  // productSlug format: "{id}-{slug}" e.g. "2-kaos-seapedia"
  getProductBySlug: async (productSlug) => {
    try {
      const response = await api.get(`/api/v1/products/${productSlug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productSlug}:`, error);
      throw error;
    }
  },

  // GET /api/v1/stores/{slug} — public store detail
  getStoreBySlug: async (storeSlug) => {
    try {
      const response = await api.get(`/api/v1/stores/${storeSlug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching store ${storeSlug}:`, error);
      throw error;
    }
  },
};
