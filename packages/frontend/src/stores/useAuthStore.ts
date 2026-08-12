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
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: AdminUser | null, token?: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  loading: true,
  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    set({ user, token: currentToken, isAuthenticated: !!user, loading: false });
  },
  setLoading: (loading) => set({ loading }),
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },
}));
