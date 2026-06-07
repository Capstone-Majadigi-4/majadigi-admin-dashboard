import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  const loginDummy = (nik: string, password: string): boolean => {
    if (nik === 'admin' && password === 'admin123') {
      login({ id: 'admin-001', nik: 'admin', nama: 'Admin Majadigi' });
      return true;
    }
    return false;
  };

  return { isAuthenticated, user, loginDummy, logout };
}
