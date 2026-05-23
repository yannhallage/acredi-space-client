import type { FilePermission, FileVisibility } from './file.types'
import type { Role } from '../user/user.types'

const permissionWeights: Record<FilePermission, number> = {
  READ: 1,
  EDIT: 2,
  ADMIN: 3,
}

export function hasFilePermission(current: FilePermission, required: FilePermission) {
  return permissionWeights[current] >= permissionWeights[required]
}

export function canDeleteFile(role: Role, permission: FilePermission) {
  return role === 'ADMIN' || permission === 'ADMIN'
}

export function canShareFile(role: Role, visibility: FileVisibility, permission: FilePermission) {
  if (role === 'ADMIN') return true
  if (role === 'MANAGER' && visibility === 'TEAM') return true
  return permission === 'ADMIN'
}
