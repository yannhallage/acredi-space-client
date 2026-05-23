/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Role, User } from '../../entities/user/user.types'
import { setAccessToken } from '../../services/api/httpClient'
import { queryClient } from './QueryProvider'

interface LoginPayload {
  email: string
  password: string
}

interface AuthContextValue {
  status: 'authenticated' | 'loading' | 'unauthenticated'
  user: User | null
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const demoUser: User = {
  id: 'user-admin-demo',
  email: 'admin@acredi.local',
  firstName: 'Yann',
  lastName: 'Hallage',
  role: 'ADMIN',
  teamIds: ['team-it', 'team-direction'],
  presence: 'AVAILABLE',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(demoUser)
  const [status, setStatus] = useState<AuthContextValue['status']>('authenticated')

  const login = useCallback(async (payload: LoginPayload) => {
    setStatus('loading')
    setAccessToken(`demo-access-token:${payload.email}`)
    setUser(demoUser)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
    queryClient.clear()
  }, [])

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      logout,
      hasRole,
    }),
    [hasRole, login, logout, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
