import api from './axiosInstance';

export const reviewsAPI = {
  getReviews: async () => {
    const response = await api.get('/api/v1/reviews');
    return response.data;
  },

  submitReview: async (data) => {
    const response = await api.post('/api/v1/reviews', data);
    return response.data;
  }
};
