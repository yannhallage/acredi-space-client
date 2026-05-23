import type { Meeting, MeetingRecording } from '../../entities/meeting/meeting.types'
import { apiRequest } from './httpClient'

export type CreateMeetingRequest = Omit<Meeting, 'id' | 'jitsiRoomName'>

export const meetingsApi = {
  list: () => apiRequest<Meeting[]>('/meetings'),
  create: (payload: CreateMeetingRequest) => apiRequest<Meeting>('/meetings', { method: 'POST', body: payload }),
  get: (id: string) => apiRequest<Meeting>(`/meetings/${id}`),
  update: (id: string, payload: Partial<Meeting>) => apiRequest<Meeting>(`/meetings/${id}`, { method: 'PATCH', body: payload }),
  join: (id: string) => apiRequest<{ roomName: string; jwt?: string }>(`/meetings/${id}/join`, { method: 'POST' }),
  recordings: (id: string) => apiRequest<MeetingRecording[]>(`/meetings/${id}/recordings`),
}
