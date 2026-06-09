import { PERMISSIONS, type PermissionCode } from './constants';
import {
  ADMIN_FEATURE_PERMISSIONS,
  FEATURE_PERMISSION_REQUIREMENTS,
  TEAM_CREATE_PERMISSIONS,
} from './requirements';
import { hasAnyPermissionCode } from './utils';

interface AppRoutePermissionRule {
  path: string;
  permissions: readonly PermissionCode[];
}

export const APP_ROUTE_PERMISSION_RULES = [
  { path: '/app/teams/create', permissions: TEAM_CREATE_PERMISSIONS },
  { path: '/app/users', permissions: FEATURE_PERMISSION_REQUIREMENTS.users },
  { path: '/app/admin', permissions: ADMIN_FEATURE_PERMISSIONS },
  { path: '/app/dashboard', permissions: FEATURE_PERMISSION_REQUIREMENTS.dashboard },
  { path: '/app/files', permissions: FEATURE_PERMISSION_REQUIREMENTS.files },
  { path: '/app/chat', permissions: FEATURE_PERMISSION_REQUIREMENTS.chat },
  { path: '/app/dm', permissions: FEATURE_PERMISSION_REQUIREMENTS.chat },
  { path: '/app/calendar', permissions: FEATURE_PERMISSION_REQUIREMENTS.calendar },
  { path: '/app/meeting', permissions: FEATURE_PERMISSION_REQUIREMENTS.meetings },
  { path: '/app/my-team', permissions: FEATURE_PERMISSION_REQUIREMENTS.myTeams },
  {
    path: '/app/profile',
    permissions: [
      PERMISSIONS.EDIT_OWN_ACCOUNT,
      PERMISSIONS.VIEW_OWN_ROLE_PERMISSIONS,
    ],
  },
  { path: '/app/teams', permissions: FEATURE_PERMISSION_REQUIREMENTS.teams },
  { path: '/app/notes', permissions: FEATURE_PERMISSION_REQUIREMENTS.notes },
] as const satisfies readonly AppRoutePermissionRule[];

export const DEFAULT_APP_ROUTE_CANDIDATES = [
  { path: '/app/dashboard', permissions: FEATURE_PERMISSION_REQUIREMENTS.dashboard },
  { path: '/app/files', permissions: FEATURE_PERMISSION_REQUIREMENTS.files },
  { path: '/app/dm/dm-yann', permissions: FEATURE_PERMISSION_REQUIREMENTS.chat },
  { path: '/app/meeting/meet-daily', permissions: FEATURE_PERMISSION_REQUIREMENTS.meetings },
  { path: '/app/calendar', permissions: FEATURE_PERMISSION_REQUIREMENTS.calendar },
  { path: '/app/my-team', permissions: FEATURE_PERMISSION_REQUIREMENTS.myTeams },
  { path: '/app/teams', permissions: FEATURE_PERMISSION_REQUIREMENTS.teams },
  { path: '/app/users', permissions: FEATURE_PERMISSION_REQUIREMENTS.users },
  { path: '/app/notes', permissions: FEATURE_PERMISSION_REQUIREMENTS.notes },
] as const satisfies readonly AppRoutePermissionRule[];

function pathMatches(pathname: string, routePath: string) {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function getRoutePermissionRule(pathname: string) {
  return APP_ROUTE_PERMISSION_RULES.find((rule) =>
    pathMatches(pathname, rule.path)
  );
}

export function getDefaultAllowedAppPath(permissionCodes: ReadonlySet<string>) {
  return (
    DEFAULT_APP_ROUTE_CANDIDATES.find((route) =>
      hasAnyPermissionCode(permissionCodes, route.permissions)
    )?.path ?? null
  );
}
