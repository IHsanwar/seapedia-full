import api from './axiosInstance';

export const reviewsAPI = {
  getReviews: async () => {
    const response = await api.get('/api/reviews');
    return response.data;
  },

  submitReview: async (data) => {
    const response = await api.post('/api/reviews', data);
    return response.data;
  }
};
