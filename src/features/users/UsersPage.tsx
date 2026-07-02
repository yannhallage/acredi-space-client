import { AnimatePresence } from "framer-motion";

import Toast from "../../components/app/Toast/Toast";
import {
  PermissionGate,
  USERS_INVITE_PERMISSIONS,
} from "../../shared/permissions";
import { Icon } from "../../shared/ui";
import {
  DeleteUserConfirmModal,
  EditUserModal,
  InviteUserModal,
  UsersFilters,
  UsersTable,
} from "./components";
import { useUsersPage } from "./hooks/useUsersPage";

export function UsersPage() {
  const page = useUsersPage();

  return (
    <div className="page-stack users-page">
      {page.toast.show ? (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      ) : null}

      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Utilisateurs</span>
        </div>

        <PermissionGate permissions={USERS_INVITE_PERMISSIONS}>
          <button
            className="button primary notes-create-button"
            type="button"
            disabled={page.authLoading}
            onClick={page.openInvite}
          >
            <Icon name="plus" size={12} />
            Create
          </button>
        </PermissionGate>
      </section>

      <UsersFilters
        nameFilter={page.nameFilter}
        emailFilter={page.emailFilter}
        authLoading={page.authLoading}
        canViewUsers={page.canViewUsers}
        onNameFilterChange={page.setNameFilter}
        onEmailFilterChange={page.setEmailFilter}
        onRefresh={page.handleRefresh}
        onToggleSort={() => page.setSortAsc((current) => !current)}
      />

      <UsersTable
        loading={page.loading}
        visibleUsers={page.visibleUsers}
        hasFilters={page.hasFilters}
        canViewUsers={page.canViewUsers}
        errorMessage={page.usersQuery.error?.message}
        openActionsUserId={page.openActionsUserId}
        onOpenActionsChange={page.setOpenActionsUserId}
        onRefetch={page.usersQuery.refetch}
        onEdit={page.openEditUser}
        onDelete={page.setDeletingUser}
        onToast={({ intent, message }) => {
          page.showToast(intent, message);
        }}
      />

      <AnimatePresence>
        {page.isInviteOpen && page.canInviteUsers ? (
          <InviteUserModal
            name={page.name}
            email={page.email}
            role={page.role}
            errorMessage={page.inviteMutation.error?.message}
            isPending={page.inviteMutation.isPending}
            onNameChange={page.setName}
            onEmailChange={page.setEmail}
            onRoleChange={page.setRole}
            onClose={page.closeInvite}
            onSubmit={() => {
              page.inviteUser().catch(() => undefined);
            }}
          />
        ) : null}

        {page.editingUser ? (
          <EditUserModal
            editName={page.editName}
            editEmail={page.editEmail}
            editRole={page.editRole}
            errorMessage={page.updateUserMutation.error?.message}
            isPending={page.updateUserMutation.isPending}
            onEditNameChange={page.setEditName}
            onEditEmailChange={page.setEditEmail}
            onEditRoleChange={page.setEditRole}
            onClose={page.closeEditUser}
            onSubmit={() => {
              page.submitEditUser().catch(() => undefined);
            }}
          />
        ) : null}

        {page.deletingUser ? (
          <DeleteUserConfirmModal
            user={page.deletingUser}
            errorMessage={page.deleteUserMutation.error?.message}
            isPending={page.deleteUserMutation.isPending}
            onClose={() => page.setDeletingUser(null)}
            onConfirm={() => {
              page.confirmDeleteUser().catch(() => undefined);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
