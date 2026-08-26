import { useCallback, useEffect, useMemo, useState } from "react";
import type { ToastIntent } from "../../components/app/Toast/Toast";
import { useUsersQuery } from "../../shared/api/users";
import { teamService } from "../../shared/api/teams/service";
import { useAuth } from "../../shared/context";
import {
  feedback,
  resolveActionFeedback,
  validationFeedback,
  type Feedback,
} from "../../shared/feedback";
import type { User } from "../../shared/types";
import { canAccessAllTeams } from "./access";
import {
  useAddTeamMember,
  useCreateTeam,
  useDeleteTeam,
  useTeamMembers,
  useTeams,
} from "./hooks";
import { createInitialTeamForm, type TeamFormState } from "./teamForm";
import type { Team, TeamMemberRole } from "./types";
import { getErrorMessage } from "./utils";

type ToastState = {
  intent: ToastIntent;
  message: string;
  show: boolean;
};

export function useTeamsPageController() {
  const { loading: authLoading, user } = useAuth();
  const canViewAllTeams = canAccessAllTeams(user?.adminRole);
  const teamsQuery = useTeams({ enabled: canViewAllTeams });
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const deleteTeamMutation = useDeleteTeam();
  const resetCreateTeam = createTeamMutation.reset;
  const resetAddMember = addMemberMutation.reset;
  const [form, setForm] = useState<TeamFormState>(createInitialTeamForm);
  const [formError, setFormError] = useState<Feedback | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [detailsTeam, setDetailsTeam] = useState<Team | null>(null);
  const [deleteTargetTeam, setDeleteTargetTeam] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<Feedback | null>(null);
  const [editTargetTeam, setEditTargetTeam] = useState<Team | null>(null);
  const [addMemberTargetTeam, setAddMemberTargetTeam] = useState<Team | null>(
    null,
  );
  const [openActionsTeamId, setOpenActionsTeamId] = useState<string | null>(
    null,
  );
  const [editTeamError, setEditTeamError] = useState<Feedback | null>(null);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });
  const editMembersQuery = useTeamMembers(editTargetTeam?.id ?? "");
  const usersQuery = useUsersQuery({
    enabled:
      isDrawerOpen ||
      Boolean(addMemberTargetTeam) ||
      Boolean(editTargetTeam) ||
      isUserPickerOpen,
  });
  const teams = teamsQuery.data ?? [];
  const isSubmitting =
    createTeamMutation.isPending || addMemberMutation.isPending;
  const isDeletingTeam = deleteTeamMutation.isPending;
  const isTeamsInitialLoading =
    authLoading ||
    (canViewAllTeams &&
      (teamsQuery.isPending ||
        teamsQuery.isLoading ||
        (teamsQuery.isFetching && !teamsQuery.data && !teamsQuery.isError)));
  const isTeamsFetching =
    canViewAllTeams &&
    !teamsQuery.isError &&
    (teamsQuery.isPending || teamsQuery.isLoading || teamsQuery.isFetching);
  const canSubmit = form.name.trim().length >= 2 && !isSubmitting;

  const selectedUserIds = useMemo(() => {
    if (editTargetTeam) {
      return new Set(
        (editMembersQuery.data ?? []).map(
          (member) => member.user?.id ?? member.userId,
        ),
      );
    }

    return new Set(form.members.map((member) => member.user.id));
  }, [editMembersQuery.data, editTargetTeam, form.members]);

  const closeDrawer = useCallback(
    (options?: { force?: boolean }) => {
      if (isSubmitting && !options?.force) {
        return;
      }

      setIsDrawerOpen(false);
      setIsUserPickerOpen(false);
      setForm(createInitialTeamForm());
      setFormError(null);
      resetCreateTeam();
      resetAddMember();
    },
    [isSubmitting, resetAddMember, resetCreateTeam],
  );

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isUserPickerOpen) {
        setIsUserPickerOpen(false);
        return;
      }

      if (!isSubmitting) {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeDrawer, isDrawerOpen, isSubmitting, isUserPickerOpen]);

  function openDrawer() {
    resetCreateTeam();
    resetAddMember();
    setForm(createInitialTeamForm());
    setFormError(null);
    setEditTargetTeam(null);
    setEditTeamError(null);
    setIsDrawerOpen(true);
  }

  function updateField<K extends keyof TeamFormState>(
    key: K,
    value: TeamFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function addDraftMember(user: User) {
    setForm((current) => {
      if (current.members.some((member) => member.user.id === user.id)) {
        return current;
      }

      return {
        ...current,
        members: [...current.members, { roleName: "COLLABORATOR", user }],
      };
    });
  }

  function removeDraftMember(userId: string) {
    setForm((current) => ({
      ...current,
      members: current.members.filter((member) => member.user.id !== userId),
    }));
  }

  function updateDraftMemberRole(userId: string, roleName: TeamMemberRole) {
    setForm((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.user.id === userId ? { ...member, roleName } : member,
      ),
    }));
  }

  const showToast = useCallback(
    (intent: ToastIntent, message: string, timeout = 4000) => {
      setToast({ show: true, intent, message });

      window.setTimeout(() => {
        setToast((current) => ({ ...current, show: false }));
      }, timeout);
    },
    [],
  );

  async function handleSelectPickerUser(user: User) {
    if (editTargetTeam) {
      if (addMemberMutation.isPending) {
        return;
      }

      try {
        await addMemberMutation.mutateAsync({
          teamId: editTargetTeam.id,
          request: {
            roleName: "COLLABORATOR",
            userId: user.id,
          },
        });

        await teamsQuery.refetch();
        showToast("success", "Membre ajoute avec succes.");
      } catch (error) {
        showToast(
          "error",
          getErrorMessage(error, "Impossible d'ajouter ce membre."),
          5000,
        );
      }

      return;
    }

    addDraftMember(user);
  }

  function openDeleteTeamModal(team: Team) {
    if (isDeletingTeam) {
      return;
    }

    deleteTeamMutation.reset();
    setDeleteError(null);
    setDeleteTargetTeam(team);
  }

  function closeDeleteTeamModal() {
    if (isDeletingTeam) {
      return;
    }

    setDeleteTargetTeam(null);
    setDeleteError(null);
    deleteTeamMutation.reset();
  }

  function openEditTeamModal(team: Team) {
    if (isUpdatingTeam) {
      return;
    }

    setIsDrawerOpen(false);
    setIsUserPickerOpen(false);
    setEditTeamError(null);
    setEditTargetTeam(team);
  }

  function closeEditTeamModal(options?: { force?: boolean }) {
    if (isUpdatingTeam && !options?.force) {
      return;
    }

    setEditTargetTeam(null);
    setEditTeamError(null);
    setIsUserPickerOpen(false);
  }

  function openAddMemberModal(team: Team) {
    if (addMemberMutation.isPending) {
      return;
    }

    addMemberMutation.reset();
    setAddMemberTargetTeam(team);
  }

  function closeAddMemberModal() {
    if (addMemberMutation.isPending) {
      return;
    }

    setAddMemberTargetTeam(null);
    addMemberMutation.reset();
  }

  async function handleUpdateTeam(request: {
    description: string;
    name: string;
    teamColor: string;
  }) {
    if (!editTargetTeam || isUpdatingTeam) {
      return;
    }

    const nextName = request.name.trim();

    if (nextName.length < 2) {
      setEditTeamError(
        validationFeedback(
          "Le nom de l'équipe doit contenir au moins 2 caractères.",
        ),
      );
      return;
    }

    setEditTeamError(null);
    setIsUpdatingTeam(true);

    try {
      await teamService.update(editTargetTeam.id, {
        description: request.description.trim() || undefined,
        name: nextName,
        teamColor: request.teamColor,
      });

      await teamsQuery.refetch();
      closeEditTeamModal({ force: true });
      showToast("success", "Equipe modifiee avec succes.");
    } catch (error) {
      const nextFeedback = resolveActionFeedback(
        error,
        feedback(
          "error",
          "Modification impossible",
          "Nous n’avons pas pu modifier cette équipe. Réessayez dans un moment.",
        ),
      );

      setEditTeamError(nextFeedback);
      showToast("error", nextFeedback.description, 5000);
    } finally {
      setIsUpdatingTeam(false);
    }
  }

  async function handleAddMemberToExistingTeam(
    team: Team,
    selectedUser: User,
    roleName: TeamMemberRole,
  ) {
    if (addMemberMutation.isPending) {
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        teamId: team.id,
        request: {
          roleName,
          userId: selectedUser.id,
        },
      });

      await teamsQuery.refetch();
      setAddMemberTargetTeam(null);
      addMemberMutation.reset();
      showToast("success", "Membre ajoute avec succes.");
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "Impossible d'ajouter ce membre."),
        5000,
      );
    }
  }

  async function handleConfirmDeleteTeam() {
    if (!deleteTargetTeam || isDeletingTeam) {
      return;
    }

    const teamToDelete = deleteTargetTeam;

    setDeleteError(null);

    try {
      await deleteTeamMutation.mutateAsync(teamToDelete.id);

      if (detailsTeam?.id === teamToDelete.id) {
        setDetailsTeam(null);
      }

      setDeleteTargetTeam(null);
      setDeleteError(null);
      deleteTeamMutation.reset();
      showToast("success", "Team supprimee avec succes.");
      teamsQuery.refetch().catch(() => undefined);
    } catch (error) {
      const nextFeedback = resolveActionFeedback(
        error,
        feedback(
          "error",
          "Suppression impossible",
          "Nous n’avons pas pu supprimer cette équipe. Réessayez dans un moment.",
        ),
      );

      setDeleteError(nextFeedback);
      showToast("error", nextFeedback.description, 5000);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setFormError(null);

    try {
      const createdTeam = await createTeamMutation.mutateAsync({
        avatarUrl: form.avatarUrl.trim() || null,
        description: form.description.trim() || null,
        name: form.name.trim(),
        teamColor: form.teamColor,
      });

      for (const member of form.members) {
        await addMemberMutation.mutateAsync({
          teamId: createdTeam.id,
          request: {
            roleName: member.roleName,
            userId: member.user.id,
          },
        });
      }

      await teamsQuery.refetch();
      closeDrawer({ force: true });
      showToast("success", "Equipe creee avec succes.");
    } catch (error) {
      setFormError(
        resolveActionFeedback(
          error,
          feedback(
            "error",
            "Création impossible",
            "Nous n’avons pas pu créer cette équipe. Réessayez dans un moment.",
          ),
        ),
      );
    }
  }

  return {
    addMemberMutation,
    addMemberTargetTeam,
    addDraftMember,
    handleSelectPickerUser,
    canSubmit,
    canViewAllTeams,
    closeAddMemberModal,
    closeDeleteTeamModal,
    closeDrawer,
    closeEditTeamModal,
    deleteError,
    deleteTargetTeam,
    detailsTeam,
    editTargetTeam,
    editTeamError,
    form,
    formError,
    handleAddMemberToExistingTeam,
    handleConfirmDeleteTeam,
    handleSubmit,
    handleUpdateTeam,
    isDeletingTeam,
    isDrawerOpen,
    isSubmitting,
    isTeamsFetching,
    isTeamsInitialLoading,
    isUpdatingTeam,
    isAddingMember: addMemberMutation.isPending && Boolean(editTargetTeam),
    isUserPickerOpen,
    openActionsTeamId,
    openAddMemberModal,
    openDeleteTeamModal,
    openDrawer,
    openEditTeamModal,
    removeDraftMember,
    selectedUserIds,
    setDetailsTeam,
    setIsUserPickerOpen,
    setOpenActionsTeamId,
    teams,
    teamsQuery,
    toast,
    updateDraftMemberRole,
    updateField,
    usersQuery,
  };
}
