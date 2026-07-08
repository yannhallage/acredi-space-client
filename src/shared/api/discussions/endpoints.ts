export const discussionEndpoints = {
  mine: "/discussions/mine",
  byId: (id: string) => `/discussions/${id}`,
  byTeam: (teamId: string) => `/teams/${teamId}/discussions`,
  createForTeam: (teamId: string) => `/teams/${teamId}/discussions`,
  messages: (discussionId: string) => `/discussions/${discussionId}/messages`,
  
  messageById: (discussionId: string, messageId: string) =>
  `/discussions/${discussionId}/messages/${messageId}`,
} as const;
