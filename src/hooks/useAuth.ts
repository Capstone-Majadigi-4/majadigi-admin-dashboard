import { useAuthStore } from '../store/useAuthStore';
import { apiFetch, BASE_URL } from '../services/apiClient';
import type { LoginResponse } from '../types';

export function useAuth() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  const loginWithCredentials = async (nik: string, password: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password, fcm_token: 'admin-web' }),
    });

    const json = await res.json() as { status: string; message?: string; data?: LoginResponse };

    if (!res.ok || json.status !== 'success' || !json.data) {
      throw new Error(json.message ?? 'Login gagal');
    }

    const { user: userData, access_token } = json.data;
    login(userData, access_token);
  };

  const logoutFromServer = async (): Promise<void> => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      logout();
    }
  };

  return { isAuthenticated, user, loginWithCredentials, logout: logoutFromServer };
}
