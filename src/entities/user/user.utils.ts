import type { User } from './user.types'

export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName'>) {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function getUserInitials(user: Pick<User, 'firstName' | 'lastName'>) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}
