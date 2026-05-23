export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'FILE_VIEW'
  | 'FILE_DOWNLOAD'
  | 'FILE_SHARE'
  | 'FILE_DELETE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'TEAM_UPDATE'

export interface AuditLog {
  id: string
  actorId: string
  action: AuditAction
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  createdAt: string
}
