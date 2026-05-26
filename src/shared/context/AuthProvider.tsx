import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "../api/api";
import type { User } from "../types";

interface OtpSession {
  email: string;
  challengeId?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<OtpSession>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("acredi-session");

    if (session !== "active") {
      setLoading(false);
      return;
    }

    api
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("acredi-session");
        localStorage.removeItem("otp-session");
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),

      login: async (email: string, password: string) => {
        setLoading(true);

        try {
          const response = await api.login(email, password);

          const otpSession: OtpSession = {
            email,
            challengeId: response.otpId,
          };

          localStorage.setItem("otp-session", JSON.stringify(otpSession));

          return otpSession;
        } finally {
          setLoading(false);
        }
      },

      verifyOtp: async (code: string) => {
        setLoading(true);

        try {
          const otpSessionRaw = localStorage.getItem("otp-session");

          if (!otpSessionRaw) {
            throw new Error("Session OTP introuvable");
          }

          const otpSession: OtpSession = JSON.parse(otpSessionRaw);

          if (!otpSession.challengeId) {
            throw new Error("Identifiant OTP introuvable");
          }

          const response = await api.verifyOtp(otpSession.challengeId, code);

          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("acredi-session", "active");
          localStorage.removeItem("otp-session");

          setUser(response.user);
        } finally {
          setLoading(false);
        }
      },

      logout: () => {
        localStorage.removeItem("acredi-session");
        localStorage.removeItem("otp-session");
        setUser(null);
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}