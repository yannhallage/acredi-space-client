import type { AuthPermissions } from '../api/auth';
import type { PermissionCode } from './constants';

export type PermissionMode = 'all' | 'any';

export function normalizePermissionCode(value: string) {
  return value.trim().toLowerCase();
}

export function createPermissionSet(permissions: AuthPermissions | null | undefined) {
  return new Set(
    (permissions?.features ?? [])
      .map((feature) => normalizePermissionCode(feature.code ?? ''))
      .filter(Boolean)
  );
}

export function hasPermissionCode(
  permissionCodes: ReadonlySet<string>,
  permission: PermissionCode
) {
  return permissionCodes.has(normalizePermissionCode(permission));
}

export function hasAnyPermissionCode(
  permissionCodes: ReadonlySet<string>,
  permissions: readonly PermissionCode[]
) {
  return permissions.some((permission) =>
    hasPermissionCode(permissionCodes, permission)
  );
}

export function hasAllPermissionCodes(
  permissionCodes: ReadonlySet<string>,
  permissions: readonly PermissionCode[]
) {
  return permissions.every((permission) =>
    hasPermissionCode(permissionCodes, permission)
  );
}

export function meetsPermissionRequirement(
  permissionCodes: ReadonlySet<string>,
  permissions: readonly PermissionCode[],
  mode: PermissionMode = 'any'
) {
  if (permissions.length === 0) {
    return true;
  }

  return mode === 'all'
    ? hasAllPermissionCodes(permissionCodes, permissions)
    : hasAnyPermissionCode(permissionCodes, permissions);
}
