import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, token } = res.data;
          set({ user, token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed.';
          set({ loading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          const { user, token } = res.data;
          set({ user, token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed.';
          set({ loading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      updateProfile: async (data) => {
        try {
          const res = await api.put('/auth/profile', data);
          set({ user: res.data.user });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message || 'Update failed.' };
        }
      },

      initAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }
    }),
    { name: 'starbyte-auth', version: 1 }
  )
);

export default useAuthStore;
