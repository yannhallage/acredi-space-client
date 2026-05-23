import { Navigate, useLocation } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import type { Role } from '../../entities/user/user.types'
import { useAuth } from '../providers/AuthProvider'

export function AuthGuard({ children }: PropsWithChildren) {
  const location = useLocation()
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className="route-loader">Chargement...</div>
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

interface RoleGuardProps extends PropsWithChildren {
  roles: Role[]
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { hasRole } = useAuth()

  if (!hasRole(roles)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}
