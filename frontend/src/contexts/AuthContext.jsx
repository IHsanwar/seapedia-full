import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { getToken, saveToken, clearToken } from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [token, setToken]                 = useState(() => getToken());
  const [activeRole, setActiveRole]       = useState(null);
  const [roles, setRoles]                 = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionExpiredReason, setSessionExpiredReason] = useState('expired');

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Persist token ke storage (sessionStorage default, localStorage jika rememberMe) */
  const _saveToken = (newToken, remember = false) => {
    saveToken(newToken, remember);
    setToken(newToken);
  };

  /** Clear semua auth state + kedua storage */
  const _clearAuth = () => {
    clearToken();
    setToken(null);
    setUser(null);
    setRoles([]);
    setActiveRole(null);
  };

  /**
   * Parse UserResource shape dari backend:
   *   { data: { id, name, email, active_role, roles: ['buyer','seller',...], ... } }
   * dan push ke state.
   */
  const _applyUserData = (responseData) => {
    const userObj = responseData?.data ?? responseData;
    setUser(userObj);
    setRoles(Array.isArray(userObj?.roles) ? userObj.roles : []);
    setActiveRole(userObj?.active_role ?? null);
  };

  // ---------------------------------------------------------------------------
  // Bootstrap: fetch /auth/me on mount jika token ada
  // ---------------------------------------------------------------------------
  const fetchMe = useCallback(async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      _applyUserData(res);
    } catch {
      // 401 ditangani axios interceptor → 'auth-session-ended' event
    } finally {
      setIsLoading(false);
    }
  }, []); // no deps — baca token langsung dari storage

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ---------------------------------------------------------------------------
  // Handle session berakhir (401 expired / 403 forbidden) dari axios interceptor
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      const reason = e?.detail?.reason ?? 'expired';
      setSessionExpiredReason(reason);
      setSessionExpired(true);
      _clearAuth();
    };
    window.addEventListener('auth-session-ended', handler);
    return () => window.removeEventListener('auth-session-ended', handler);
  }, []);

  /** Panggil setelah user dismiss modal & redirect ke login */
  const clearSessionExpired = () => setSessionExpired(false);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  /**
   * Login dengan { login, password, rememberMe }
   * rememberMe = true → token disimpan di localStorage (persisten)
   * rememberMe = false (default) → token disimpan di sessionStorage (lebih aman)
   */
  const login = async (credentials) => {
    const { rememberMe = false, ...creds } = credentials;
    const res = await authAPI.login(creds);
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken, rememberMe);
      const meRes = await authAPI.getMe();
      _applyUserData(meRes);
      const meUser = meRes?.data ?? meRes;
      return { user: meUser, roles: Array.isArray(meUser?.roles) ? meUser.roles : [] };
    }
    return res;
  };

  /**
   * Register dengan { name, email, password, password_confirmation }
   * Backend auto-assign buyer role + kembalikan access_token.
   */
  const register = async (data) => {
    const res = await authAPI.register(data);
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken, false); // register selalu ke sessionStorage
      const meRes = await authAPI.getMe();
      _applyUserData(meRes);
      const meUser = meRes?.data ?? meRes;
      return { user: meUser, roles: Array.isArray(meUser?.roles) ? meUser.roles : [] };
    }
    return res;
  };

  /** Logout — revoke token di backend */
  const logout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    _clearAuth();
  };

  /**
   * Switch active role. Backend revoke token lama dan terbitkan token baru.
   * Simpan token baru dengan metode storage yang sama (pertahankan preference rememberMe).
   */
  const switchRole = async (role) => {
    const isRemembered = !!localStorage.getItem('seapedia_token');
    const res = await authAPI.switchRole(role);
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken, isRemembered);
      const meRes = await authAPI.getMe();
      _applyUserData(meRes);
    }
    return res;
  };

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const value = {
    user,
    token,
    activeRole,
    roles,
    isAuthenticated: !!token,
    isLoading,
    sessionExpired,
    sessionExpiredReason,
    clearSessionExpired,
    login,
    register,
    logout,
    switchRole,
    fetchMe,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
