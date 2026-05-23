import type { AuditLog } from '../../entities/audit/audit.types'
import type { FileItem } from '../../entities/file/file.types'
import type { Team } from '../../entities/team/team.types'
import type { User } from '../../entities/user/user.types'
import type { ApiCollection } from '../../shared/types/api'
import { apiRequest } from './httpClient'

export const adminApi = {
  users: () => apiRequest<ApiCollection<User>>('/admin/users'),
  createUser: (payload: Omit<User, 'id' | 'presence'>) => apiRequest<User>('/admin/users', { method: 'POST', body: payload }),
  updateUser: (id: string, payload: Partial<User>) => apiRequest<User>(`/admin/users/${id}`, { method: 'PATCH', body: payload }),
  teams: () => apiRequest<ApiCollection<Team>>('/admin/teams'),
  createTeam: (payload: Pick<Team, 'name' | 'managerId'>) => apiRequest<Team>('/admin/teams', { method: 'POST', body: payload }),
  updateTeam: (id: string, payload: Partial<Team>) => apiRequest<Team>(`/admin/teams/${id}`, { method: 'PATCH', body: payload }),
  files: () => apiRequest<ApiCollection<FileItem>>('/admin/files'),
  auditLogs: () => apiRequest<ApiCollection<AuditLog>>('/admin/audit-logs'),
}
