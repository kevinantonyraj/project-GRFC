const BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY   = 'gr_admin_token';
const REFRESH_KEY = 'gr_admin_refresh';
const USER_KEY    = 'gr_admin_user';

export const saveTokens = (access, refresh, user) => {
  localStorage.setItem(TOKEN_KEY,   access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY,    JSON.stringify(user));
};

export const getToken   = ()  => localStorage.getItem(TOKEN_KEY);
export const getRefresh = ()  => localStorage.getItem(REFRESH_KEY);
export const getUser    = ()  => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const authApi = {

  login: async (email, password) => {
    const res = await fetch(`${BASE}/auth/login/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    return res.json();
  },

  verify: async () => {
    const token = getToken();
    if (!token) return { success: false };
    const res = await fetch(`${BASE}/auth/verify/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  logout: async () => {
    const refresh = getRefresh();
    const token   = getToken();
    try {
      await fetch(`${BASE}/auth/logout/`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch { /* ignore network errors on logout */ }
    clearTokens();
  },
};

export const authHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};