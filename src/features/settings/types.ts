import type { IconName } from '../../shared/ui';
import type { PermissionCode } from '../../shared/permissions';

export type SettingKey =
  | 'profile'
  | 'profiles'
  | 'preferences'
  | 'members'
  | 'roles'
  | 'invitations'
  | 'general'
  | 'dashboard'
  | 'defaults'
  | 'brand'
  | 'emailAccounts'
  | 'emailTemplates'
  | 'assignmentRules'
  | 'slaPolicies'
  | 'subscription'
  | 'invoices';

export type SettingRow = {
  action: string;
  description: string;
  href?: string;
  title: string;
};

export type SettingItem = {
  icon: IconName;
  key: SettingKey;
  label: string;
  permissions: readonly PermissionCode[];
  rows: SettingRow[];
  sectionTitle: string;
  subtitle: string;
  title: string;
  updatePermissions: readonly PermissionCode[];
};

export type SettingGroup = {
  title: string;
  items: SettingItem[];
};

export type ModalSettingProps = {
  userEmail: string;
  userName: string;
  workspaceName: string;
  onClose: () => void;
};
