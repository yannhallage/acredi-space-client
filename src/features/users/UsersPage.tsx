import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useInviteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../../shared/api/users";
import {
  PermissionGate,
  USERS_INVITE_PERMISSIONS,
  USERS_VIEW_PERMISSIONS,
  usePermissions,
} from "../../shared/permissions";
import type { AdminRole, User } from "../../shared/types";
import { Avatar, Icon, type IconName } from "../../shared/ui";
import { NotUsers } from "./components/NotUsers";
import Toast from "../../components/app/Toast/Toast";

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "collaborator", label: "Collaborator" },
];

const userSkeletons = [
  "user-skeleton-1",
  "user-skeleton-2",
  "user-skeleton-3",
  "user-skeleton-4",
  "user-skeleton-5",
];

function roleLabel(user: User) {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "Admin";
  }

  if (user.adminRole === "manager") {
    return "Manager";
  }

  return "Collaborator";
}

function roleIcon(user: User): IconName {
  return user.adminRole === "admin" || user.adminRole === "owner"
    ? "shield"
    : "users";
}

function UserRowSkeleton() {
  return (
    <article className="users-row users-row-skeleton" aria-hidden="true">
      <span className="skeleton-avatar users-initial" />
      <div className="users-person">
        <span className="skeleton-line skeleton-user-name" />
        <span className="skeleton-line skeleton-user-email" />
        <span className="skeleton-line skeleton-user-status" />
      </div>
      <span className="skeleton-pill" />
      <span className="skeleton-status" />
      <span className="skeleton-more" />
    </article>
  );
}

function getInviteErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    const responseMessage = maybeError.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return "Failed to invite user";
}

function adminRoleFromUser(user: User): AdminRole {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "admin";
  }

  if (user.adminRole === "manager") {
    return "manager";
  }

  return "collaborator";
}

// function roleNameFromAdminRole(role: AdminRole): "ADMIN" | "MANAGER" | "USER" {
//   if (role === "admin" || role === "owner") {
//     return "ADMIN";
//   }

//   if (role === "manager") {
//     return "MANAGER";
//   }

//   return "USER";
// }

function roleNameFromAdminRole(
  role: AdminRole,
): "ADMIN" | "MANAGER" | "COLLABORATOR" {
  if (role === "admin" || role === "owner") {
    return "ADMIN";
  }

  if (role === "manager") {
    return "MANAGER";
  }

  return "COLLABORATOR";
}

function UserActionsDropdown({
  isOpen,
  onOpenChange,
  user,
  onChanged,
  onEdit,
  onDelete,
  onToast,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onChanged: () => Promise<unknown>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToast: (toast: {
    intent: "success" | "info" | "warning" | "error";
    message: string;
  }) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const isActive = user.enabled !== false;
  const isPending =
    activateMutation.isPending || deactivateMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  async function handleToggleStatus(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (isPending) return;

    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(user.id);
        onToast({
          intent: "success",
          message: "Utilisateur désactivé avec succès",
        });
      } else {
        await activateMutation.mutateAsync(user.id);
        onToast({
          intent: "success",
          message: "Utilisateur activé avec succès",
        });
      }

      onOpenChange(false);
      await onChanged();
    } catch (error) {
      onToast({
        intent: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible de modifier le statut de l'utilisateur",
      });
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="users-actions-dropdown"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="icon-button users-more"
        type="button"
        aria-label={`Options ${user.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!isOpen);
        }}
      >
        <Icon name="moreH" size={19} />
      </button>

      <AnimatePresence>
        {isOpen ? (
        <motion.div
          className="users-actions-menu"
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="users-actions-item"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation();
              onOpenChange(false);
              onEdit(user);
            }}
          >
            Modifier les informations
          </button>

          <button
            type="button"
            className={
              isActive
                ? "users-actions-item danger"
                : "users-actions-item success"
            }
            role="menuitem"
            disabled={isPending}
            onClick={handleToggleStatus}
          >
            {isPending
              ? "Traitement..."
              : isActive
                ? "Désactiver utilisateur"
                : "Activer utilisateur"}
          </button>

          <button
            type="button"
            className="users-actions-item danger"
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation();
              onOpenChange(false);
              onDelete(user);
            }}
          >
            Supprimer utilisateur
          </button>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const { hasAnyPermission, loading: authLoading } = usePermissions();
  const canViewUsers = hasAnyPermission(USERS_VIEW_PERMISSIONS);
  const canInviteUsers = hasAnyPermission(USERS_INVITE_PERMISSIONS);

  const usersQuery = useUsersQuery({ enabled: !authLoading && canViewUsers });
  const inviteMutation = useInviteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("collaborator");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [openActionsUserId, setOpenActionsUserId] = useState<string | null>(
    null,
  );

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("collaborator");

  const loading = authLoading || usersQuery.loading;

  const [toast, setToast] = useState<{
    show: boolean;
    intent: "success" | "info" | "warning" | "error";
    message: string;
  }>({
    show: false,
    intent: "success",
    message: "",
  });

  const visibleUsers = useMemo(() => {
    const nameQuery = nameFilter.trim().toLowerCase();
    const emailQuery = emailFilter.trim().toLowerCase();
    const users = usersQuery.data ?? [];

    return users
      .filter((user) => {
        const matchesName =
          nameQuery.length === 0 || user.name.toLowerCase().includes(nameQuery);
        const matchesEmail =
          emailQuery.length === 0 ||
          user.email.toLowerCase().includes(emailQuery);

        return matchesName && matchesEmail;
      })
      .slice()
      .sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      );
  }, [emailFilter, nameFilter, sortAsc, usersQuery.data]);

  const hasFilters =
    nameFilter.trim().length > 0 || emailFilter.trim().length > 0;

  function showToast(
    intent: "success" | "info" | "warning" | "error",
    message: string,
    timeout = 4000,
  ) {
    setToast({
      show: true,
      intent,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, timeout);
  }

  function closeInvite() {
    setIsInviteOpen(false);
    inviteMutation.reset();
    setName("");
    setEmail("");
    setRole("collaborator");
  }

  async function inviteUser() {
    if (!canInviteUsers) {
      showToast(
        "error",
        "Vous n'avez pas les droits necessaires pour inviter un utilisateur.",
      );
      return;
    }

    const nextName = name.trim();
    const nextEmail = email.trim();

    if (!nextName || !nextEmail) {
      showToast("warning", "Please fill all required fields");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = nextName.split(/\s+/);

      await inviteMutation.mutateAsync({
        email: nextEmail,
        firstName,
        lastName: lastNameParts.join(" "),
        name: nextName,
        roleName: roleNameFromAdminRole(role),
      });

      await usersQuery.refetch();

      showToast("success", "Utilisateur invité avec succès");
      closeInvite();
    } catch (error) {
      showToast("error", getInviteErrorMessage(error), 5000);
    }
  }

  function openEditUser(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(adminRoleFromUser(user));
    updateUserMutation.reset();
  }

  function closeEditUser() {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("collaborator");
    updateUserMutation.reset();
  }

  async function submitEditUser() {
    if (!editingUser) return;

    const nextName = editName.trim();
    const nextEmail = editEmail.trim();

    if (!nextName || !nextEmail) {
      showToast("warning", "Veuillez renseigner le nom et l'email.");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = nextName.split(/\s+/);

      await updateUserMutation.mutateAsync(editingUser.id, {
        firstName,
        lastName: lastNameParts.join(" "),
        email: nextEmail,
        roleName: roleNameFromAdminRole(editRole),
      });

      await usersQuery.refetch();

      showToast("success", "Utilisateur modifié avec succès");
      closeEditUser();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossible de modifier l'utilisateur",
      );
    }
  }

  async function confirmDeleteUser() {
    if (!deletingUser) return;

    try {
      await deleteUserMutation.mutateAsync(deletingUser.id);
      await usersQuery.refetch();

      showToast("success", "Utilisateur supprimé avec succès");
      setDeletingUser(null);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossible de supprimer l'utilisateur",
      );
    }
  }

  return (
    <div className="page-stack users-page">
      {toast.show && <Toast intent={toast.intent} message={toast.message} />}

      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Utilisateurs</span>
        </div>

        <PermissionGate permissions={USERS_INVITE_PERMISSIONS}>
          <button
            className="button primary notes-create-button"
            type="button"
            disabled={authLoading}
            onClick={() => {
              inviteMutation.reset();
              setIsInviteOpen(true);
            }}
          >
            <Icon name="plus" size={12} />
            Create
          </button>
        </PermissionGate>
      </section>

      <section className="notes-filters" aria-label="Users filters">
        <div className="notes-filter-inputs">
          <label>
            <span>Name</span>
            <input
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              placeholder="Name"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
              placeholder="Email"
            />
          </label>
        </div>

        <div className="notes-filter-actions">
          <button
            className="icon-button bordered"
            type="button"
            aria-label="Refresh users"
            disabled={authLoading || !canViewUsers}
            onClick={() => {
              setNameFilter("");
              setEmailFilter("");
              usersQuery.refetch().catch(() => undefined);
            }}
          >
            <Icon name="refresh" size={14} />
          </button>

          <button
            className="button ghost"
            type="button"
            onClick={() => setSortAsc((current) => !current)}
          >
            <Icon name="sort" size={14} />
            Sort
          </button>
        </div>
      </section>

      <section
        className={
          !loading && visibleUsers.length === 0
            ? "users-list users-list-empty"
            : "users-list"
        }
        aria-label="Users list"
      >
        {loading
          ? userSkeletons.map((item) => <UserRowSkeleton key={item} />)
          : visibleUsers.map((user) => (
              <motion.article
                className="users-row"
                key={user.id}
                role="button"
                tabIndex={0}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                onClick={() =>
                  navigate(`/app/users/${user.id}`, { state: { user } })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/app/users/${user.id}`, { state: { user } });
                  }
                }}
              >
                <Avatar
                  name={user.name}
                  size={42}
                  presence={user.presence}
                  src={user.avatarUrl}
                />

                <div className="users-person">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>

                <span className="users-status">
                  {user.enabled === false ? "Désactivé" : "Activé"}
                  {user.invitationStatus ? ` • ${user.invitationStatus}` : ""}
                </span>

                <button
                  className="users-role"
                  type="button"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Icon name={roleIcon(user)} size={15} />
                  {roleLabel(user)}
                </button>

                <UserActionsDropdown
                  isOpen={openActionsUserId === user.id}
                  onOpenChange={(open) =>
                    setOpenActionsUserId(open ? user.id : null)
                  }
                  user={user}
                  onChanged={usersQuery.refetch}
                  onEdit={openEditUser}
                  onDelete={setDeletingUser}
                  onToast={({ intent, message }) => {
                    showToast(intent, message);
                  }}
                />
              </motion.article>
            ))}

        {!loading && visibleUsers.length === 0 ? (
          <NotUsers
            hasFilters={hasFilters}
            message={
              canViewUsers
                ? usersQuery.error?.message
                : "Vous n'avez pas les droits necessaires pour afficher les utilisateurs."
            }
          />
        ) : null}
      </section>

      <AnimatePresence>
        {isInviteOpen && canInviteUsers ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeInvite}
          >
            <motion.form
              className="note-modal users-note-modal"
              aria-label="Invite user"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                inviteUser().catch(() => undefined);
              }}
            >
              <header>
                <h2>Invite user</h2>
                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Close invite user"
                    onClick={closeInvite}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </header>

              <label className="note-field">
                <span>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  autoFocus
                />
              </label>

              <label className="note-field">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  type="email"
                />
              </label>

              <label className="note-field">
                <span>Role</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as AdminRole)}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {inviteMutation.error ? (
                <p className="auth-error text-red-500 text-sm">
                  {inviteMutation.error.message}
                </p>
              ) : null}

              <footer>
                <button
                  className="button ghost"
                  type="button"
                  onClick={closeInvite}
                >
                  Cancel
                </button>

                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={
                    !name.trim() || !email.trim() || inviteMutation.isPending
                  }
                >
                  {inviteMutation.isPending ? "Invitation..." : "Invite"}
                </button>
              </footer>
            </motion.form>
          </motion.div>
        ) : null}

        {editingUser ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeEditUser}
          >
            <motion.form
              className="note-modal users-note-modal"
              aria-label="Modifier utilisateur"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                submitEditUser().catch(() => undefined);
              }}
            >
              <header>
                <h2>Modifier utilisateur</h2>
                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Fermer"
                    onClick={closeEditUser}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </header>

              <label className="note-field">
                <span>Nom complet</span>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Nom complet"
                  autoFocus
                />
              </label>

              <label className="note-field">
                <span>Email</span>
                <input
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  placeholder="name@company.com"
                  type="email"
                />
              </label>

              <label className="note-field">
                <span>Rôle</span>
                <select
                  value={editRole}
                  onChange={(event) =>
                    setEditRole(event.target.value as AdminRole)
                  }
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {updateUserMutation.error ? (
                <p className="auth-error text-red-500 text-sm">
                  {updateUserMutation.error.message}
                </p>
              ) : null}

              <footer>
                <button
                  className="button ghost"
                  type="button"
                  onClick={closeEditUser}
                >
                  Annuler
                </button>

                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={
                    !editName.trim() ||
                    !editEmail.trim() ||
                    updateUserMutation.isPending
                  }
                >
                  {updateUserMutation.isPending ? "Modification..." : "Modifier"}
                </button>
              </footer>
            </motion.form>
          </motion.div>
        ) : null}

        {deletingUser ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={() => setDeletingUser(null)}
          >
            <motion.div
              className="note-modal users-note-modal"
              role="dialog"
              aria-label="Supprimer utilisateur"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header>
                <h2>Supprimer utilisateur</h2>
                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setDeletingUser(null)}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </header>

              <p>
                Voulez-vous vraiment supprimer{" "}
                <strong>{deletingUser.name}</strong> ?
              </p>

              <p className="auth-error text-red-500 text-sm">
                Cette action est irréversible.
              </p>

              {deleteUserMutation.error ? (
                <p className="auth-error text-red-500 text-sm">
                  {deleteUserMutation.error.message}
                </p>
              ) : null}

              <footer>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setDeletingUser(null)}
                >
                  Annuler
                </button>

                <button
                  className="button primary notes-submit danger"
                  type="button"
                  disabled={deleteUserMutation.isPending}
                  onClick={() => {
                    confirmDeleteUser().catch(() => undefined);
                  }}
                >
                  {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
