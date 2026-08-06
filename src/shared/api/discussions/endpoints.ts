export const discussionEndpoints = {
  mine: "/discussions/mine",
  byId: (id: string) => `/discussions/${id}`,
  byTeam: (teamId: string) => `/teams/${teamId}/discussions`,
  createForTeam: (teamId: string) => `/teams/${teamId}/discussions`,
  messages: (discussionId: string) => `/discussions/${discussionId}/messages`,
  message: (discussionId: string, messageId: string) =>
    `/discussions/${discussionId}/messages/${messageId}`,
  shareMessage: (discussionId: string, messageId: string) =>
    `/discussions/${discussionId}/messages/${messageId}/share`,
} as const;