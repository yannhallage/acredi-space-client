export interface Channel {
  id: string
  name: string
  teamId?: string
  projectId?: string
  createdAt: string
}

export interface DirectConversation {
  id: string
  participantIds: string[]
  updatedAt: string
}

export interface MessageAttachment {
  id: string
  fileId: string
  name: string
  mimeType: string
}

export interface Message {
  id: string
  channelId?: string
  directConversationId?: string
  meetingId?: string
  authorId: string
  body: string
  attachments: MessageAttachment[]
  threadRootId?: string
  createdAt: string
  editedAt?: string
}
