import { create } from 'zustand';

interface AdminUser {
  id: string;
  username: string;
  name?: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, isAuthenticated: false, loading: false }),
}));
