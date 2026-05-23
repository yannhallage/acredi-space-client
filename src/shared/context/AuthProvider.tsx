import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockApi } from '../api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('acredi-session');
    if (session !== 'active') {
      setLoading(false);
      return;
    }

    mockApi
      .getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email: string) => {
        setLoading(true);
        const nextUser = await mockApi.login(email);
        localStorage.setItem('acredi-session', 'active');
        setUser(nextUser);
        setLoading(false);
      },
      logout: () => {
        localStorage.removeItem('acredi-session');
        setUser(null);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
