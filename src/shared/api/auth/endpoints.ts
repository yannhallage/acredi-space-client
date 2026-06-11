export const authEndpoints = {
  register: "/auth/register",
  login: "/auth/login",
  verifyOtp: "/auth/verify-otp",
  refresh: "/auth/refresh",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;