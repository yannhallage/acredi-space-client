export const PERMISSIONS = {
  AUTHENTICATE: 'auth.authenticate',

  EDIT_OWN_ACCOUNT: 'account.edit_own',
  VIEW_OWN_ROLE_PERMISSIONS: 'roles.view_own',

  VIEW_ALL_USERS: 'users.view_all',
  CREATE_USERS: 'users.create',
  UPDATE_USERS: 'users.update',
  DELETE_USERS: 'users.delete',
  MANAGE_ACCOUNTS: 'users.manage_accounts',
  INVITE_COLLABORATORS: 'users.invite_collaborators',

  UPLOAD_OWN_FILES: 'files.upload_own',
  VIEW_OWN_FILES: 'files.view_own',
  VIEW_ALL_FILES: 'files.view_all',
  VIEW_SHARED_FILES: 'files.view_shared',
  ACCESS_TEAM_FILES: 'files.access_team',
  SHARE_FILES: 'files.share',
  UPDATE_FILES: 'files.update',
  DELETE_FILES: 'files.delete',

  CREATE_FOLDER: 'folders.create',
  VIEW_FOLDERS: 'folders.view',
  UPDATE_FOLDERS: 'folders.update',
  DELETE_FOLDERS: 'folders.delete',
  MANAGE_FOLDERS: 'folders.manage',

  JOIN_TEAM: 'teams.join',
  VIEW_TEAMS: 'teams.view',
  CREATE_TEAM: 'teams.create',
  UPDATE_TEAM: 'teams.update',
  DELETE_TEAM: 'teams.delete',
  MANAGE_TEAM: 'teams.manage',

  VIEW_NOTES: 'notes.view',
  CREATE_NOTES: 'notes.create',
  UPDATE_NOTES: 'notes.update',
  DELETE_NOTES: 'notes.delete',
  SHARE_NOTES: 'notes.share',

  VIEW_DASHBOARD: 'dashboard.view',

  VIEW_ORGANIZATION: 'organization.view',
  UPDATE_ORGANIZATION: 'organization.update',

  JOIN_MEETING: 'meetings.join',
  VIEW_MEETINGS: 'meetings.view',
  PLAN_MEETINGS: 'meetings.plan',
  UPDATE_MEETINGS: 'meetings.update',
  DELETE_MEETINGS: 'meetings.delete',
  MANAGE_TEAM_MEETINGS_ACCESS: 'meetings.manage_team_access',
  USE_VIDEOCONFERENCE: 'meetings.videoconference',

  VIEW_CALENDAR: 'calendar.view',
  USE_CALENDAR_PLANNING: 'calendar.planning',

  CHAT_WITH_COLLABORATORS: 'chat.collaborators',

  VIEW_NOTIFICATIONS: 'notifications.view',

  VIEW_SETTINGS: 'settings.view',
  UPDATE_SETTINGS: 'settings.update',
  VIEW_COMPANY_SETTINGS: 'settings.company.view',
  UPDATE_COMPANY_SETTINGS: 'settings.company.update',
  VIEW_SECURITY_SETTINGS: 'settings.security.view',
  UPDATE_SECURITY_SETTINGS: 'settings.security.update',
  VIEW_BILLING_SETTINGS: 'settings.billing.view',
  UPDATE_BILLING_SETTINGS: 'settings.billing.update',
  MANAGE_SETTINGS: 'settings.manage',

  MANAGE_ROLES_PERMISSIONS: 'roles.manage',

  CONFIGURE_PLATFORM: 'platform.configure',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
