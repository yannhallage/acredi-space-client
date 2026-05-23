export type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATOR'

export type PresenceStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE' | 'IN_MEETING'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: Role
  teamIds: string[]
  presence: PresenceStatus
  customStatus?: string
}
