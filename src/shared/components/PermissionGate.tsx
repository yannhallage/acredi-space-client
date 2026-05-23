import type { PropsWithChildren, ReactNode } from 'react'
import type { Role } from '../../entities/user/user.types'
import { useAuth } from '../../app/providers/AuthProvider'

interface PermissionGateProps extends PropsWithChildren {
  roles: Role[]
  fallback?: ReactNode
}

export function PermissionGate({ children, fallback = null, roles }: PermissionGateProps) {
  const { hasRole } = useAuth()

  if (!hasRole(roles)) {
    return fallback
  }

  return children
}
