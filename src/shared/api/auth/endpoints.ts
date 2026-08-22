export const authEndpoints = {
  register: "/auth/register",
  signupStart: "/auth/signup/start",
  signupVerifyEmail: "/auth/signup/verify-email",
  signupCompleteOrganization: "/auth/signup/complete-organization",
  login: "/auth/login",
  verifyOtp: "/auth/verify-otp",
  refresh: "/auth/refresh",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;