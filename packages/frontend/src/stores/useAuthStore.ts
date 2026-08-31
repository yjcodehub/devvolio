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

const getInitialUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialUser,
  loading: true,
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    set({ user, token: currentToken, isAuthenticated: !!user, loading: false });
  },
  setLoading: (loading) => set({ loading }),
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },
}));
