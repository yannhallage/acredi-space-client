import type { User } from '../types';
import {
  calendarEvents,
  channels,
  conversations,
  dashboard,
  files,
  folders,
  meetings,
  messages,
  notifications,
  users,
  workspaces
} from './mockData';

const currentUserId = 'u-mohamed';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function delayed<T>(value: T, timeout = 180): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), timeout);
  });
}

export const mockApi = {
  login(email: string): Promise<User> {
    const match = users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? users[0];
    return delayed(match, 220);
  },
  getCurrentUser() {
    return delayed(users.find((user) => user.id === currentUserId) ?? users[0]);
  },
  getUsers() {
    return delayed(users);
  },
  getWorkspaces() {
    return delayed(workspaces);
  },
  getDashboard() {
    return delayed(dashboard);
  },
  getFiles() {
    return delayed({ folders, files });
  },
  getChannels() {
    return delayed(channels);
  },
  getMessages(channelId = 'design-acredi') {
    return delayed(messages.filter((message) => message.channelId === channelId));
  },
  getConversations() {
    return delayed(conversations);
  },
  getDirectMessages(conversationId = 'dm-yann') {
    return delayed(messages.filter((message) => message.conversationId === conversationId));
  },
  getCalendarEvents() {
    return delayed(calendarEvents);
  },
  getMeetings() {
    return delayed(meetings);
  },
  getNotifications() {
    return delayed(notifications);
  },
  getAdminUsers() {
    return delayed(users);
  }
};
