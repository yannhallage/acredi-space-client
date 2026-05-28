export type Presence = 'online' | 'busy' | 'dnd' | 'offline';

export type AdminRole =
  | 'admin'
  | 'manager'
  | 'collaborator'
  | 'owner'
  | 'member'
  | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  presence: Presence;
  status: string;
  adminRole: AdminRole;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export interface FolderItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface FileItem {
  id: string;
  name: string;
  ext: string;
  color: string;
  size: string;
  modifiedLabel: string;
  modifiedAt: string;
  authorId: string;
  folderId: string;
  sharedWith: string[];
  selected?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  unread: number;
  urgent?: boolean;
  memberIds: string[];
  recentFileIds: string[];
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Message {
  id: string;
  channelId?: string;
  conversationId?: string;
  authorId: string;
  when: string;
  content: string;
  reactions?: Reaction[];
  attachmentId?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  unread: number;
  lastMessage: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  color: string;
  attendeeIds: string[];
  status: 'live' | 'upcoming' | 'done';
  location: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  duration: string;
  room: string;
  live: boolean;
  attendeeIds: string[];
}

export interface AppNotification {
  id: string;
  type: 'file' | 'message' | 'meeting' | 'system';
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  actorId?: string;
  target?: string;
}

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  color: string;
  data: number[];
}

export interface ActivityDay {
  day: string;
  meetings: number;
  messages: number;
  files: number;
}

export interface RecentActivity {
  id: string;
  actorId: string;
  verb: string;
  target: string;
  when: string;
  icon: string;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  activity: ActivityDay[];
  recentActivity: RecentActivity[];
  upcomingMeetings: Meeting[];
}
