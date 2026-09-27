import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach token (admin or user)
api.interceptors.request.use(
  (config) => {
    // If Authorization is already provided, respect it
    if (config.headers?.Authorization) return config;

    const isAdminReq = config.url?.startsWith('/admin') || window.location.pathname.startsWith('/admin');

    if (isAdminReq) {
      const adminStored = localStorage.getItem('starbyte-admin');
      if (adminStored) {
        try {
          const { state } = JSON.parse(adminStored);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
            return config;
          }
        } catch {}
      }
    }

    const stored = localStorage.getItem('starbyte-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        // Admin unauthorized
        if (window.location.pathname !== '/admin/login') {
          localStorage.removeItem('starbyte-admin');
          window.location.href = '/admin/login';
        }
      } else {
        // Customer unauthorized
        localStorage.removeItem('starbyte-auth');
        if (window.location.pathname !== '/login') {
          // Do not interrupt browsing public pages
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
