import type { User } from '../../entities/user/user.types'
import { apiRequest } from './httpClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export const authApi = {
  login: (payload: LoginRequest) => apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: payload }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  refresh: () => apiRequest<LoginResponse>('/auth/refresh', { method: 'POST' }),
  me: () => apiRequest<User>('/auth/me'),
  forgotPassword: (email: string) => apiRequest<void>('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token: string, password: string) =>
    apiRequest<void>('/auth/reset-password', { method: 'POST', body: { token, password } }),
}
