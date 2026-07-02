import { AnimatePresence } from "framer-motion";

import Toast from "../../components/app/Toast/Toast";
import {
  PermissionGate,
  TEAM_CREATE_PERMISSIONS,
} from "../../shared/permissions";
import { AccessDeniedState, Icon } from "../../shared/ui";
import { TEAM_SKELETON_KEYS } from "./constants";
import {
  AddExistingTeamMemberModal,
  CreateTeamDrawer,
  DeleteTeamConfirmModal,
  EditTeamModal,
  TeamCard,
  TeamCardSkeleton,
  TeamDetailsModal,
  TeamsPageSkeleton,
  TeamUserPickerModal,
} from "./components";
import { useTeamsPageController } from "./useTeamsPageController";

export function TeamsPage() {
  const controller = useTeamsPageController();

  if (controller.isTeamsInitialLoading) {
    return <TeamsPageSkeleton />;
  }

  if (!controller.canViewAllTeams) {
    return (
      <AccessDeniedState
        title="Acces reserve"
        body="La liste globale des equipes est reservee aux managers et administrateurs."
      />
    );
  }

  return (
    <div className="teams-page">
      {controller.toast.show ? (
        <Toast intent={controller.toast.intent} message={controller.toast.message} />
      ) : null}

      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Teams</span>
          <Icon name="building" size={14} />
          <strong>Equipes</strong>
        </div>

        <PermissionGate permissions={TEAM_CREATE_PERMISSIONS}>
          <button
            className="button primary notes-create-button"
            type="button"
            onClick={controller.openDrawer}
          >
            <Icon name="plus" size={12} />
            Creer
          </button>
        </PermissionGate>
      </section>

      {controller.teamsQuery.isError ? (
        <div className="team-error-banner">
          Erreur lors du chargement des equipes:{" "}
          {controller.teamsQuery.error.message}
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              controller.teamsQuery.refetch().catch(() => undefined);
            }}
          >
            Reessayer
          </button>
        </div>
      ) : null}

      <section className="teams-grid" aria-label="Teams">
        {controller.isTeamsFetching
          ? TEAM_SKELETON_KEYS.map((item) => (
              <TeamCardSkeleton key={item} />
            ))
          : controller.teams.map((team) => (
              <TeamCard
                isActionsOpen={controller.openActionsTeamId === team.id}
                isDeleting={
                  controller.isDeletingTeam &&
                  controller.deleteTargetTeam?.id === team.id
                }
                key={team.id}
                onActionsOpenChange={(open) =>
                  controller.setOpenActionsTeamId(open ? team.id : null)
                }
                onOpenDetails={controller.setDetailsTeam}
                onRequestAddMember={controller.openAddMemberModal}
                onRequestDelete={controller.openDeleteTeamModal}
                onRequestEdit={controller.openEditTeamModal}
                team={team}
              />
            ))}

        {!controller.isTeamsFetching &&
        !controller.teamsQuery.isError &&
        controller.teams.length === 0 ? (
          <div className="notes-empty">
            <Icon name="users" size={18} />
            <strong>Aucune equipe</strong>
            <span>Creez une equipe pour demarrer un espace de travail.</span>
          </div>
        ) : null}
      </section>

      <CreateTeamDrawer
        canSubmit={controller.canSubmit}
        form={controller.form}
        formError={controller.formError}
        isOpen={controller.isDrawerOpen}
        isSubmitting={controller.isSubmitting}
        onClose={controller.closeDrawer}
        onOpenUserPicker={() => controller.setIsUserPickerOpen(true)}
        onRemoveMember={controller.removeDraftMember}
        onSubmit={controller.handleSubmit}
        onUpdateField={controller.updateField}
        onUpdateMemberRole={controller.updateDraftMemberRole}
      />

      <TeamUserPickerModal
        error={controller.usersQuery.error}
        isOpen={controller.isUserPickerOpen}
        loading={controller.usersQuery.loading}
        onClose={() => controller.setIsUserPickerOpen(false)}
        onRetry={controller.usersQuery.refetch}
        onSelect={controller.addDraftMember}
        selectedUserIds={controller.selectedUserIds}
        users={controller.usersQuery.data ?? []}
      />

      <AnimatePresence>
        {controller.detailsTeam ? (
          <TeamDetailsModal
            key={controller.detailsTeam.id}
            onClose={() => controller.setDetailsTeam(null)}
            team={controller.detailsTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {controller.deleteTargetTeam ? (
          <DeleteTeamConfirmModal
            key={controller.deleteTargetTeam.id}
            error={controller.deleteError}
            isDeleting={controller.isDeletingTeam}
            onClose={controller.closeDeleteTeamModal}
            onConfirm={controller.handleConfirmDeleteTeam}
            team={controller.deleteTargetTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {controller.editTargetTeam ? (
          <EditTeamModal
            key={controller.editTargetTeam.id}
            error={controller.editTeamError}
            isUpdating={controller.isUpdatingTeam}
            onClose={controller.closeEditTeamModal}
            onSubmit={controller.handleUpdateTeam}
            team={controller.editTargetTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {controller.addMemberTargetTeam ? (
          <AddExistingTeamMemberModal
            key={controller.addMemberTargetTeam.id}
            addMemberPending={controller.addMemberMutation.isPending}
            error={controller.usersQuery.error}
            loading={controller.usersQuery.loading}
            onAdd={controller.handleAddMemberToExistingTeam}
            onClose={controller.closeAddMemberModal}
            onRetry={controller.usersQuery.refetch}
            team={controller.addMemberTargetTeam}
            users={controller.usersQuery.data ?? []}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
