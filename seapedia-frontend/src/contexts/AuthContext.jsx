import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(() => localStorage.getItem('seapedia_token'));
  const [activeRole, setActiveRole]   = useState(null);
  const [roles, setRoles]             = useState([]);
  const [isLoading, setIsLoading]     = useState(true);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Persist token in state + localStorage */
  const _saveToken = (newToken) => {
    localStorage.setItem('seapedia_token', newToken);
    setToken(newToken);
  };

  /** Clear all auth state */
  const _clearAuth = () => {
    localStorage.removeItem('seapedia_token');
    setToken(null);
    setUser(null);
    setRoles([]);
    setActiveRole(null);
  };

  /**
   * Parse the UserResource shape returned by the backend:
   *   { data: { id, name, email, active_role, roles: ['buyer','seller',...], ... } }
   * and push into state.
   */
  const _applyUserData = (responseData) => {
    // responseData is the parsed JSON body (already .data from axios)
    // Backend wraps everything in { success, message, data: { ...user } }
    const userObj = responseData?.data ?? responseData;
    setUser(userObj);
    setRoles(Array.isArray(userObj?.roles) ? userObj.roles : []);
    setActiveRole(userObj?.active_role ?? null);
  };

  // ---------------------------------------------------------------------------
  // Bootstrap: fetch /auth/me on mount if a token exists
  // ---------------------------------------------------------------------------
  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem('seapedia_token')) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      _applyUserData(res);
    } catch {
      // 401 handled by axios interceptor → 'auth-unauthorized' event
    } finally {
      setIsLoading(false);
    }
  }, []); // no deps – reads token from localStorage directly

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ---------------------------------------------------------------------------
  // Handle 401 from any axios response
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = () => _clearAuth();
    window.addEventListener('auth-unauthorized', handler);
    return () => window.removeEventListener('auth-unauthorized', handler);
  }, []);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  /**
   * Login with { login, password } — backend accepts email OR username in `login`.
   * Returns { user, roles } so the caller can decide where to redirect.
   */
  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    // Backend: { success, message, data: { user: UserResource, access_token, token_type } }
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken);
      // Now fetch /me to get the real roles + active_role from the token abilities
      const meRes = await authAPI.getMe();
      _applyUserData(meRes);
      const meUser = meRes?.data ?? meRes;
      return { user: meUser, roles: Array.isArray(meUser?.roles) ? meUser.roles : [] };
    }
    return res;
  };

  /**
   * Register with { name, email, password, password_confirmation }
   * Backend auto-assigns buyer role and returns access_token.
   */
  const register = async (data) => {
    const res = await authAPI.register(data);
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken);
      const meRes = await authAPI.getMe();
      _applyUserData(meRes);
      const meUser = meRes?.data ?? meRes;
      return { user: meUser, roles: Array.isArray(meUser?.roles) ? meUser.roles : [] };
    }
    return res;
  };

  /** Logout — revokes current token on the backend */
  const logout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    _clearAuth();
  };

  /**
   * Switch active role. Backend revokes old token and issues a new one.
   * We save the new token and refresh user state via /me.
   */
  const switchRole = async (role) => {
    const res = await authAPI.switchRole(role);
    const payload = res?.data ?? res;
    const newToken = payload?.access_token;

    if (newToken) {
      _saveToken(newToken);
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
