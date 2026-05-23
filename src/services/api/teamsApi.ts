import type { Team } from '../../entities/team/team.types'
import type { ApiCollection } from '../../shared/types/api'
import { apiRequest } from './httpClient'

export const teamsApi = {
  list: () => apiRequest<ApiCollection<Team>>('/teams'),
  get: (id: string) => apiRequest<Team>(`/teams/${id}`),
  create: (payload: Pick<Team, 'name' | 'managerId'>) => apiRequest<Team>('/teams', { method: 'POST', body: payload }),
  update: (id: string, payload: Partial<Team>) => apiRequest<Team>(`/teams/${id}`, { method: 'PATCH', body: payload }),
}
