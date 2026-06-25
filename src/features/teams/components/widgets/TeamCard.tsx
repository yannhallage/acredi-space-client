import {
  PermissionGate,
  TEAM_DELETE_PERMISSIONS,
} from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";
import { useTeamMembers } from "../../hooks";
import type { Team } from "../../types";
import { TeamActionsDropdown } from "./TeamActionsDropdown";
import { TeamAvatarStack } from "./TeamAvatarStack";

export function TeamCard({
  isActionsOpen,
  isDeleting,
  onActionsOpenChange,
  onOpenDetails,
  onRequestAddMember,
  onRequestDelete,
  onRequestEdit,
  team,
}: {
  isActionsOpen: boolean;
  isDeleting: boolean;
  onActionsOpenChange: (open: boolean) => void;
  onOpenDetails: (team: Team) => void;
  onRequestAddMember: (team: Team) => void;
  onRequestDelete: (team: Team) => void;
  onRequestEdit: (team: Team) => void;
  team: Team;
}) {
  const membersQuery = useTeamMembers(team.id);
  const members = membersQuery.data ?? [];
  const membersCount = membersQuery.data ? members.length : team.membersCount;

  return (
    <article className="team-card">
      <header className="team-card-header">
        <span style={{ background: team.color }} />

        <div className="team-card-title">
          <h2>{team.name}</h2>
          <p>{team.description || "Equipe Acredi Space"}</p>
        </div>

        <TeamActionsDropdown
          isOpen={isActionsOpen}
          onOpenChange={onActionsOpenChange}
          onRequestAddMember={onRequestAddMember}
          onRequestEdit={onRequestEdit}
          team={team}
        />
      </header>

      <div className="team-card-meta">
        <span>
          <Icon name="users" size={14} />
          {membersCount} membre{membersCount > 1 ? "s" : ""}
        </span>
      </div>

      <div className="team-card-footer">
        <div className="team-avatars" aria-label={`${membersCount} membres`}>
          <TeamAvatarStack loading={membersQuery.isLoading} members={members} />
        </div>

        <div className="team-card-actions">
          <PermissionGate permissions={TEAM_DELETE_PERMISSIONS}>
            <button
              className="icon-button bordered danger"
              type="button"
              aria-label={`Supprimer ${team.name}`}
              title="Supprimer"
              disabled={isDeleting}
              onClick={() => onRequestDelete(team)}
            >
              <Icon name="trash" size={14} />
            </button>
          </PermissionGate>

          <button
            className="icon-button bordered"
            type="button"
            aria-label={`Voir ${team.name}`}
            title="Voir"
            onClick={() => onOpenDetails(team)}
          >
            <Icon name="eye" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
