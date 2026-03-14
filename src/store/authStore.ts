import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // In a real app, initialize this maybe by pinging an auth check endpoint
  user: null,
  login: (user) => {
    set({ isAuthenticated: true, user });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
