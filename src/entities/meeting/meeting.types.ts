export type MeetingRecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export interface MeetingRecurrence {
  frequency: MeetingRecurrenceFrequency
  interval: number
  until?: string
}

export interface Meeting {
  id: string
  title: string
  startsAt: string
  endsAt: string
  organizerId: string
  participantIds: string[]
  recurrence?: MeetingRecurrence
  jitsiRoomName: string
}

export interface MeetingRecording {
  id: string
  meetingId: string
  fileId: string
  durationSeconds: number
  createdAt: string
}
