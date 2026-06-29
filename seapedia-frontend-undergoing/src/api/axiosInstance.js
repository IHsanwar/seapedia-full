import axios from 'axios';

// ---------------------------------------------------------------------------
// Token helpers — sessionStorage (default/aman) + localStorage (rememberMe)
// ---------------------------------------------------------------------------

/** Baca token: cek sessionStorage dulu, lalu localStorage (rememberMe) */
export const getToken = () =>
  sessionStorage.getItem('seapedia_token') ||
  localStorage.getItem('seapedia_token') ||
  null;

/** Simpan token ke storage yang sesuai */
export const saveToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('seapedia_token', token);
    sessionStorage.removeItem('seapedia_token');
  } else {
    sessionStorage.setItem('seapedia_token', token);
    localStorage.removeItem('seapedia_token');
  }
};

/** Hapus token dari KEDUA storage */
export const clearToken = () => {
  sessionStorage.removeItem('seapedia_token');
  localStorage.removeItem('seapedia_token');
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — sertakan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle sesi berakhir / akses ditolak
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Token expired / invalid → sesi berakhir
        clearToken();
        window.dispatchEvent(
          new CustomEvent('auth-session-ended', {
            detail: { reason: 'expired' },
          })
        );
      } else if (status === 403) {
        // Akses ditolak — kemungkinan role berubah dari backend
        window.dispatchEvent(
          new CustomEvent('auth-session-ended', {
            detail: { reason: 'forbidden' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;