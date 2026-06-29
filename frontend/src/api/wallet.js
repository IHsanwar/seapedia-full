import api from './axiosInstance';

export const walletAPI = {
  getWallet: async () => {
    const response = await api.get('/api/v1/buyer/wallet');
    return response.data;
  },

  getWalletDetails: async () => {
    const response = await api.get('/api/v1/buyer/wallet/show');
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/api/v1/buyer/wallet/transactions');
    return response.data;
  },

  topup: async (data) => {
    const response = await api.post('/api/v1/buyer/wallet/topup', data);
    return response.data;
  },
};
