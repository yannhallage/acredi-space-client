import { useCallback, useMemo } from 'react';
import { useAuth } from '../context';
import type { PermissionCode } from './constants';
import {
  createPermissionSet,
  hasAllPermissionCodes,
  hasAnyPermissionCode,
  hasPermissionCode,
} from './utils';

export function usePermissions() {
  const { loading, permissions } = useAuth();

  const permissionCodes = useMemo(
    () => createPermissionSet(permissions),
    [permissions]
  );

  const hasPermission = useCallback(
    (permission: PermissionCode) =>
      hasPermissionCode(permissionCodes, permission),
    [permissionCodes]
  );

  const hasAnyPermission = useCallback(
    (items: readonly PermissionCode[]) =>
      hasAnyPermissionCode(permissionCodes, items),
    [permissionCodes]
  );

  const hasAllPermissions = useCallback(
    (items: readonly PermissionCode[]) =>
      hasAllPermissionCodes(permissionCodes, items),
    [permissionCodes]
  );

  return {
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    loading,
    permissionCodes,
  };
}
