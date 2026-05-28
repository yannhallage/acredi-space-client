import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authService,
  buildOtpSession,
  clearAuthSession,
  getLoginAuthResponse,
  getOtpSession,
  getStoredPermissions,
  getStoredUser,
  persistAuthSession,
  persistOtpSession,
  unwrapApiResponse,
} from "../api/auth";
import type {
  AuthPermissions,
  AuthResponse,
  OtpSession,
  PersistAuthSessionOptions,
} from "../api/auth";
import type { User } from "../types";

type LoginResult =
  | { status: "authenticated"; user: User }
  | { otpSession: OtpSession; status: "otp" };

interface AuthContextValue {
  user: User | null;
  permissions: AuthPermissions | null;
  loading: boolean;
  isAuthenticated: boolean;

  completeAuthSession: (
    response: AuthResponse,
    options?: PersistAuthSessionOptions
  ) => User;
  login: (
    email: string,
    password: string,
    options?: { trustDevice?: boolean }
  ) => Promise<LoginResult>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<AuthPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("acredi-session");
    const storedUser = getStoredUser();

    if (session !== "active" || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      setUser(storedUser);
      setPermissions(getStoredPermissions());
    } catch {
      clearAuthSession();
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAuthSession = useCallback((
    response: AuthResponse,
    options?: PersistAuthSessionOptions
  ) => {
    const authenticatedUser = persistAuthSession(response, options);
    setUser(authenticatedUser);
    setPermissions(response.permissions ?? getStoredPermissions());

    return authenticatedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      loading,
      isAuthenticated: Boolean(user),
      completeAuthSession,

      login: async (email: string, password: string, options = {}) => {
        setLoading(true);

        try {
          const response = unwrapApiResponse(
            await authService.login({
              email,
              password,
              useTrustedDevice: options.trustDevice,
            })
          );
          const authResponse = getLoginAuthResponse(response);

          if (authResponse) {
            const authenticatedUser = completeAuthSession(authResponse, {
              persistTrustedDevice: options.trustDevice,
              trustedDeviceEmail: email,
            });

            return { status: "authenticated", user: authenticatedUser };
          }

          const otpSession = {
            ...buildOtpSession(response, email),
            trustDevice: options.trustDevice,
          };
          persistOtpSession(otpSession);

          return { otpSession, status: "otp" };
        } finally {
          setLoading(false);
        }
      },

      verifyOtp: async (code: string) => {
        setLoading(true);

        try {
          const otpSession = getOtpSession();

          if (!otpSession) {
            throw new Error("Session OTP introuvable");
          }

          const response = unwrapApiResponse(
            await authService.verifyOtp({
              challengeId: otpSession.challengeId,
              code,
              email: otpSession.email,
              otpId: otpSession.challengeId,
            })
          );

          completeAuthSession(response, {
            persistTrustedDevice: otpSession.trustDevice,
            trustedDeviceEmail: otpSession.email,
          });
        } finally {
          setLoading(false);
        }
      },

      logout: () => {
        clearAuthSession();
        setUser(null);
        setPermissions(null);
      },
    }),
    [completeAuthSession, loading, permissions, user]
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
