import api from './axiosInstance';

export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/api/v1/buyer/cart');
    return response.data;
  },

  addToCart: async (productId, quantity) => {
    const response = await api.post('/api/v1/buyer/cart', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(`/api/v1/buyer/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/api/v1/buyer/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/api/v1/buyer/cart');
    return response.data;
  },
};
