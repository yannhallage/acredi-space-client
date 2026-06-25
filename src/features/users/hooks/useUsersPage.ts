import { useMemo, useState } from "react";

import type { ToastIntent } from "../../../components/app/Toast/Toast";
import {
  useDeleteUserMutation,
  useInviteUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "../../../shared/api/users";
import {
  USERS_INVITE_PERMISSIONS,
  USERS_VIEW_PERMISSIONS,
  usePermissions,
} from "../../../shared/permissions";
import type { AdminRole, User } from "../../../shared/types";
import {
  adminRoleFromUser,
  getInviteErrorMessage,
  roleNameFromAdminRole,
} from "../utils";

type ToastState = {
  show: boolean;
  intent: ToastIntent;
  message: string;
};

export function useUsersPage() {
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

  const [toast, setToast] = useState<ToastState>({
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
    intent: ToastIntent,
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

  function openInvite() {
    inviteMutation.reset();
    setIsInviteOpen(true);
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

  function handleRefresh() {
    setNameFilter("");
    setEmailFilter("");
    usersQuery.refetch().catch(() => undefined);
  }

  return {
    authLoading,
    canViewUsers,
    canInviteUsers,
    loading,
    toast,
    nameFilter,
    emailFilter,
    sortAsc,
    visibleUsers,
    hasFilters,
    isInviteOpen,
    name,
    email,
    role,
    editingUser,
    deletingUser,
    openActionsUserId,
    editName,
    editEmail,
    editRole,
    usersQuery,
    inviteMutation,
    updateUserMutation,
    deleteUserMutation,
    setNameFilter,
    setEmailFilter,
    setSortAsc,
    setName,
    setEmail,
    setRole,
    setOpenActionsUserId,
    setEditName,
    setEditEmail,
    setEditRole,
    setDeletingUser,
    showToast,
    closeInvite,
    openInvite,
    inviteUser,
    openEditUser,
    closeEditUser,
    submitEditUser,
    confirmDeleteUser,
    handleRefresh,
  };
}
