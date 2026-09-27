import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,

      setAdmin: (admin, token) => {
        set({ admin, token });
      },

      logout: () => {
        set({ admin: null, token: null });
      },

      isAuthenticated: () => !!get().token
    }),
    { name: 'starbyte-admin', version: 1 }
  )
);

export default useAdminStore;
