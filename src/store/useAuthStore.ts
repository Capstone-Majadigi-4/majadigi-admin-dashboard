import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      login: (user, accessToken, refreshToken) =>
        set({ isAuthenticated: true, user, token: accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ token: accessToken, refreshToken }),
      logout: () =>
        set({ isAuthenticated: false, user: null, token: null, refreshToken: null }),
    }),
    { name: 'majadigi-auth' }
  )
);
