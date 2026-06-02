import type { ReactNode } from 'react';
import type { PermissionCode } from './constants';
import { usePermissions } from './usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'all' | 'any';
  permission?: PermissionCode;
  permissions?: readonly PermissionCode[];
}

export function PermissionGate({
  children,
  fallback = null,
  mode = 'any',
  permission,
  permissions = [],
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission, hasPermission } = usePermissions();
  const requiredPermissions = permission ? [permission] : permissions;

  const canRender =
    requiredPermissions.length === 0
      ? true
      : mode === 'all'
        ? hasAllPermissions(requiredPermissions)
        : requiredPermissions.length === 1
          ? hasPermission(requiredPermissions[0])
          : hasAnyPermission(requiredPermissions);

  return canRender ? <>{children}</> : <>{fallback}</>;
}
