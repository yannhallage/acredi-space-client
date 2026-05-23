import type { Role } from '../../entities/user/user.types'

const roleWeights: Record<Role, number> = {
  COLLABORATOR: 1,
  MANAGER: 2,
  ADMIN: 3,
}

export function hasMinimumRole(currentRole: Role, requiredRole: Role) {
  return roleWeights[currentRole] >= roleWeights[requiredRole]
}

export function canAccessAdmin(role: Role) {
  return role === 'ADMIN'
}

export function canManageTeam(role: Role) {
  return role === 'ADMIN' || role === 'MANAGER'
}

export function canCreateSharedFolder(role: Role) {
  return role === 'ADMIN' || role === 'MANAGER'
}
