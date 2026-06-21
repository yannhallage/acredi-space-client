import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast, { type ToastIntent } from "../../components/app/Toast/Toast";
import { useUsersQuery } from "../../shared/api/users";
import { teamService } from "../../shared/api/teams/service";
import { useAuth } from "../../shared/context";
import {
  PermissionGate,
  TEAM_CREATE_PERMISSIONS,
  TEAM_DELETE_PERMISSIONS,
} from "../../shared/permissions";
import type { User } from "../../shared/types";
import { AccessDeniedState, Avatar, Icon } from "../../shared/ui";
import { canAccessAllTeams } from "./access";
import { TeamDetailsModal } from "./components/TeamDetailsModal";
import {
  useAddTeamMember,
  useCreateTeam,
  useDeleteTeam,
  useTeamMembers,
  useTeams,
} from "./hooks";
import { memberDisplayName } from "./teamMemberDisplay";
import type { Team, TeamMember, TeamMemberRole } from "./types";

const teamSkeletons = [
  "team-skeleton-1",
  "team-skeleton-2",
  "team-skeleton-3",
  "team-skeleton-4",
];

const teamColors = [
  "#5B6CFF",
  "#8B7FFF",
  "#22C55E",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
  "#EC4899",
  "#64748B",
];

function userPresenceLabel(user: Pick<User, "enabled" | "presence">) {
  return user.enabled === false || user.presence === "offline"
    ? "Inactif"
    : "Disponible";
}

type DraftTeamMember = {
  roleName: TeamMemberRole;
  user: User;
};

type TeamFormState = {
  avatarUrl: string;
  description: string;
  members: DraftTeamMember[];
  name: string;
  teamColor: string;
};

type ToastState = {
  intent: ToastIntent;
  message: string;
  show: boolean;
};

function createInitialTeamForm(): TeamFormState {
  return {
    avatarUrl: "",
    description: "",
    members: [],
    name: "",
    teamColor: teamColors[0],
  };
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue.",
) {
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

  return fallback;
}

function TeamCardSkeleton() {
  return (
    <article className="team-card team-card-skeleton" aria-hidden="true">
      <header>
        <span className="skeleton-line team-skeleton-accent" />
        <div className="skeleton-copy">
          <span className="skeleton-line team-skeleton-title" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-short" />
        </div>
      </header>

      <div className="team-card-meta">
        <span className="skeleton-line team-skeleton-meta" />
        <span className="skeleton-line team-skeleton-meta" />
      </div>

      <div className="team-card-footer">
        <div className="team-avatars">
          <span className="skeleton-avatar" />
          <span className="skeleton-avatar" />
          <span className="skeleton-avatar" />
        </div>

        <span className="skeleton-pill team-skeleton-button" />
      </div>
    </article>
  );
}

function TeamsPageSkeleton() {
  return (
    <div className="teams-page teams-page-skeleton" aria-busy="true">
      <section className="notes-toolbar" aria-hidden="true">
        <div className="team-page-skeleton-title">
          <span className="skeleton-line team-page-skeleton-kicker" />
          <span className="skeleton-line team-page-skeleton-heading" />
        </div>
        <span className="skeleton-pill team-page-skeleton-create" />
      </section>

      <section className="teams-grid" aria-label="Chargement des equipes">
        {teamSkeletons.map((item) => (
          <TeamCardSkeleton key={item} />
        ))}
      </section>
    </div>
  );
}

function TeamAvatarStack({
  loading,
  members,
}: {
  loading: boolean;
  members: TeamMember[];
}) {
  if (loading) {
    return (
      <>
        <span className="skeleton-avatar" />
        <span className="skeleton-avatar" />
        <span className="skeleton-avatar" />
      </>
    );
  }

  const users = members
    .map((member) => ({
      id: member.user?.id ?? member.userId,
      name: memberDisplayName(member),
      presence: member.user?.presence,
    }))
    .filter((user) => Boolean(user.id));

  if (users.length === 0) {
    return (
      <span className="team-avatar-empty">
        <Icon name="users" size={13} />
      </span>
    );
  }

  return (
    <>
      {users.slice(0, 4).map((user) => (
        <Avatar
          key={user.id}
          name={user.name}
          presence={user.presence}
          ring="var(--surface)"
          size={34}
        />
      ))}
      {users.length > 4 ? (
        <span className="team-avatar-more">+{users.length - 4}</span>
      ) : null}
    </>
  );
}

function TeamActionsDropdown({
  isOpen,
  onOpenChange,
  onRequestAddMember,
  onRequestEdit,
  team,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAddMember: (team: Team) => void;
  onRequestEdit: (team: Team) => void;
  team: Team;
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      ref={dropdownRef}
      className="team-actions-dropdown"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="icon-button bordered"
        type="button"
        aria-label={`Options ${team.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Options"
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className="team-more-vertical">⋮</span>
      </button>

      <AnimatePresence>
        {isOpen ? (
        <motion.div
          className="team-actions-menu"
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="team-actions-item"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onRequestEdit(team);
            }}
          >
            Modifier l'équipe
          </button>

          <button
            type="button"
            className="team-actions-item"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onRequestAddMember(team);
            }}
          >
            Ajouter des membres
          </button>
        </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TeamCard({
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

function TeamUserPickerModal({
  isOpen,
  loading,
  onClose,
  onRetry,
  onSelect,
  selectedUserIds,
  users,
  error,
}: {
  error: Error | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onRetry: () => Promise<User[]>;
  onSelect: (user: User) => void;
  selectedUserIds: Set<string>;
  users: User[];
}) {
  const [query, setQuery] = useState("");

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((user) => !selectedUserIds.has(user.id))
      .filter((user) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch(
          [user.name, user.email, user.role, user.team, user.status].join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [query, selectedUserIds, users]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="dm-new-conversation-overlay team-user-picker-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="dm-new-conversation-modal team-user-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-user-picker-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="team-user-picker-title">Ajouter un utilisateur</h2>
                <small>{visibleUsers.length} contacts disponibles</small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="dm-new-conversation-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur..."
              />
            </label>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["team-picker-loading-1", "team-picker-loading-2"].map(
                    (item) => (
                      <div
                        className="dm-new-conversation-user team-picker-row-skeleton"
                        key={item}
                      >
                        <span className="skeleton-dot" />
                        <span className="skeleton-avatar" />
                        <span>
                          <span className="skeleton-line" />
                          <span className="skeleton-line skeleton-short" />
                        </span>
                        <span className="skeleton-pill" />
                      </div>
                    ),
                  )
                : visibleUsers.map((person) => (
                    <button
                      key={person.id}
                      className="dm-new-conversation-user"
                      type="button"
                      onClick={() => {
                        onSelect(person);
                        onClose();
                      }}
                    >
                      <Icon name="plus" size={16} />
                      <Avatar
                        name={person.name}
                        presence={person.presence}
                        size={34}
                      />
                      <span>
                        <strong>{person.name}</strong>
                        <small>
                          {person.role} - {person.team}
                        </small>
                      </span>
                      <em
                        className={`dm-new-conversation-status presence-${person.presence}`}
                      >
                        {userPresenceLabel(person)}
                      </em>
                    </button>
                  ))}

              {!loading && error ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="alert" size={18} />
                  <strong>Chargement impossible</strong>
                  <span>{error.message}</span>
                  <button
                    className="button ghost mini"
                    type="button"
                    onClick={() => {
                      onRetry().catch(() => undefined);
                    }}
                  >
                    Reessayer
                  </button>
                </div>
              ) : null}

              {!loading && !error && visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouve</strong>
                  <span>Essayez un autre nom, email ou role.</span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="users" size={14} />
                TeamMember
              </span>
              <small>{selectedUserIds.size} selectionne(s)</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EditTeamModal({
  error,
  isUpdating,
  onClose,
  onSubmit,
  team,
}: {
  error: string | null;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (request: {
    description: string;
    name: string;
    teamColor: string;
  }) => Promise<void>;
  team: Team;
}) {
  const [description, setDescription] = useState(team.description ?? "");
  const [name, setName] = useState(team.name);
  const [teamColor, setTeamColor] = useState(team.color);

  const canSubmit = name.trim().length >= 2 && !isUpdating;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUpdating) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isUpdating, onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-edit-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={() => {
        if (!isUpdating) {
          onClose();
        }
      }}
    >
      <motion.form
        className="note-modal team-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Modifier equipe"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ description, name, teamColor }).catch(() => undefined);
        }}
      >
        <header>
          <div className="team-details-title">
            <i style={{ background: teamColor }} />
            <div>
              <h2>Modifier l'équipe</h2>
              <small>{team.name}</small>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={isUpdating}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        {error ? (
          <div className="team-form-error">
            <Icon name="alert" size={16} />
            {error}
          </div>
        ) : null}

        <label className="note-field">
          <span>Nom</span>
          <input
            autoFocus
            maxLength={160}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nom de l'équipe"
          />
        </label>

        <label className="note-field">
          <span>Description</span>
          <textarea
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description de l'équipe"
            rows={5}
          />
        </label>

        <div className="note-field">
          <span>Couleur</span>
          <div className="team-color-picker">
            {teamColors.map((color) => (
              <button
                key={color}
                type="button"
                className={teamColor === color ? "selected" : undefined}
                style={{ background: color }}
                aria-label={`Couleur ${color}`}
                onClick={() => setTeamColor(color)}
              />
            ))}
          </div>
        </div>

        <footer>
          <button
            className="button ghost"
            type="button"
            disabled={isUpdating}
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="button primary notes-submit"
            type="submit"
            disabled={!canSubmit}
          >
            {isUpdating ? "Modification..." : "Modifier"}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
}

function AddExistingTeamMemberModal({
  addMemberPending,
  error,
  loading,
  onAdd,
  onClose,
  onRetry,
  team,
  users,
}: {
  addMemberPending: boolean;
  error: Error | null;
  loading: boolean;
  onAdd: (team: Team, user: User, roleName: TeamMemberRole) => Promise<void>;
  onClose: () => void;
  onRetry: () => Promise<User[]>;
  team: Team;
  users: User[];
}) {
  const membersQuery = useTeamMembers(team.id);
  const members = membersQuery.data ?? [];
  const [query, setQuery] = useState("");
  const [roleName, setRoleName] = useState<TeamMemberRole>("COLLABORATOR");

  const selectedUserIds = useMemo(
    () => new Set(members.map((member) => member.user?.id ?? member.userId)),
    [members],
  );

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => !selectedUserIds.has(person.id))
      .filter((person) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status].join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [query, selectedUserIds, users]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !addMemberPending) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [addMemberPending, onClose]);

  return (
    <motion.div
      className="dm-new-conversation-overlay team-user-picker-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      onMouseDown={() => {
        if (!addMemberPending) {
          onClose();
        }
      }}
    >
      <motion.section
        className="dm-new-conversation-modal team-user-picker-modal team-add-member-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ajouter des membres"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dm-new-conversation-header">
          <div>
            <h2>Ajouter des membres</h2>
            <small>{team.name}</small>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={addMemberPending}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <label className="note-field team-member-role-field">
          <span>Role du membre</span>
          <select
            value={roleName}
            onChange={(event) =>
              setRoleName(event.target.value as TeamMemberRole)
            }
          >
            <option value="COLLABORATOR">Collaborateur</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <label className="dm-new-conversation-search">
          <Icon name="search" size={16} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un utilisateur..."
          />
        </label>

        <div className="dm-new-conversation-list">
          <p>Utilisateurs disponibles</p>

          {loading || membersQuery.isLoading ? (
            ["team-member-loading-1", "team-member-loading-2"].map((item) => (
              <div
                className="dm-new-conversation-user team-picker-row-skeleton"
                key={item}
              >
                <span className="skeleton-avatar" />
                <span>
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-short" />
                </span>
              </div>
            ))
          ) : visibleUsers.length > 0 ? (
            visibleUsers.map((person) => (
              <button
                key={person.id}
                className="dm-new-conversation-user"
                type="button"
                disabled={addMemberPending}
                onClick={() => {
                  onAdd(team, person, roleName).catch(() => undefined);
                }}
              >
                <Icon name="plus" size={16} />
                <Avatar name={person.name} presence={person.presence} size={34} />
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.email}</small>
                </span>
                <em className={`dm-new-conversation-status presence-${person.presence}`}>
                  {userPresenceLabel(person)}
                </em>
              </button>
            ))
          ) : null}

          {!loading && error ? (
            <div className="dm-new-conversation-empty">
              <Icon name="alert" size={18} />
              <strong>Chargement impossible</strong>
              <span>{error.message}</span>
              <button
                className="button ghost mini"
                type="button"
                onClick={() => {
                  onRetry().catch(() => undefined);
                }}
              >
                Reessayer
              </button>
            </div>
          ) : null}

          {!loading &&
          !error &&
          !membersQuery.isLoading &&
          visibleUsers.length === 0 ? (
            <div className="dm-new-conversation-empty">
              <Icon name="users" size={18} />
              <strong>Aucun utilisateur disponible</strong>
              <span>Tous les utilisateurs sont deja dans cette equipe.</span>
            </div>
          ) : null}
        </div>
      </motion.section>
    </motion.div>
  );
}

function DeleteTeamConfirmModal({
  error,
  isDeleting,
  onClose,
  onConfirm,
  team,
}: {
  error: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  team: Team;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDeleting, onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-delete-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
    >
      <motion.section
        className="note-modal team-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="team-delete-title"
        aria-describedby="team-delete-description"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="team-delete-title">
            <span className="team-delete-icon">
              <Icon name="alert" size={18} />
            </span>
            <div>
              <h2 id="team-delete-title">Supprimer la team ?</h2>
              <small>{team.name}</small>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={isDeleting}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <p id="team-delete-description">
          Cette action supprimera definitivement la team et ses informations
          associees. Voulez-vous continuer ?
        </p>

        {error ? (
          <div className="team-delete-error">
            <Icon name="alert" size={16} />
            {error}
          </div>
        ) : null}

        <footer>
          <button
            className="button ghost"
            type="button"
            disabled={isDeleting}
            onClick={onClose}
          >
            Non
          </button>
          <button
            className="button danger"
            type="button"
            disabled={isDeleting}
            onClick={() => {
              onConfirm().catch(() => undefined);
            }}
          >
            <Icon name="trash" size={14} />
            {isDeleting ? "Suppression..." : "Oui, supprimer"}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}

export function TeamsPage() {
  const { loading: authLoading, user } = useAuth();
  const canViewAllTeams = canAccessAllTeams(user?.adminRole);
  const teamsQuery = useTeams({ enabled: canViewAllTeams });
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const deleteTeamMutation = useDeleteTeam();
  const resetCreateTeam = createTeamMutation.reset;
  const resetAddMember = addMemberMutation.reset;
  const [form, setForm] = useState<TeamFormState>(createInitialTeamForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [detailsTeam, setDetailsTeam] = useState<Team | null>(null);
  const [deleteTargetTeam, setDeleteTargetTeam] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTargetTeam, setEditTargetTeam] = useState<Team | null>(null);
  const [addMemberTargetTeam, setAddMemberTargetTeam] = useState<Team | null>(null);
  const [openActionsTeamId, setOpenActionsTeamId] = useState<string | null>(
    null,
  );
  const [editTeamError, setEditTeamError] = useState<string | null>(null);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });
  const usersQuery = useUsersQuery({
    enabled: isDrawerOpen || Boolean(addMemberTargetTeam),
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

  const selectedUserIds = useMemo(
    () => new Set(form.members.map((member) => member.user.id)),
    [form.members],
  );

  const closeDrawer = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsDrawerOpen(false);
    setIsUserPickerOpen(false);
    setForm(createInitialTeamForm());
    setFormError(null);
    resetCreateTeam();
    resetAddMember();
  }, [isSubmitting, resetAddMember, resetCreateTeam]);

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

    setEditTeamError(null);
    setEditTargetTeam(team);
  }

  function closeEditTeamModal() {
    if (isUpdatingTeam) {
      return;
    }

    setEditTargetTeam(null);
    setEditTeamError(null);
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
      setEditTeamError("Le nom de l'équipe doit contenir au moins 2 caractères.");
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
      setEditTargetTeam(null);
      setEditTeamError(null);
      showToast("success", "Equipe modifiee avec succes.");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier cette equipe.",
      );

      setEditTeamError(message);
      showToast("error", message, 5000);
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
      const message = getErrorMessage(
        error,
        "Impossible de supprimer cette equipe.",
      );

      setDeleteError(message);
      showToast("error", message, 5000);
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
      closeDrawer();
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Une erreur est survenue pendant la creation."),
      );
    }
  }

  if (isTeamsInitialLoading) {
    return <TeamsPageSkeleton />;
  }

  if (!canViewAllTeams) {
    return (
      <AccessDeniedState
        title="Acces reserve"
        body="La liste globale des equipes est reservee aux managers et administrateurs."
      />
    );
  }

  return (
    <div className="teams-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
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
            onClick={openDrawer}
          >
            <Icon name="plus" size={12} />
            Creer
          </button>
        </PermissionGate>
      </section>

      {teamsQuery.isError ? (
        <div className="team-error-banner">
          Erreur lors du chargement des equipes: {teamsQuery.error.message}
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              teamsQuery.refetch().catch(() => undefined);
            }}
          >
            Reessayer
          </button>
        </div>
      ) : null}

      <section className="teams-grid" aria-label="Teams">
        {isTeamsFetching
          ? teamSkeletons.map((item) => <TeamCardSkeleton key={item} />)
          : teams.map((team) => (
              <TeamCard
                isActionsOpen={openActionsTeamId === team.id}
                isDeleting={isDeletingTeam && deleteTargetTeam?.id === team.id}
                key={team.id}
                onActionsOpenChange={(open) =>
                  setOpenActionsTeamId(open ? team.id : null)
                }
                onOpenDetails={setDetailsTeam}
                onRequestAddMember={openAddMemberModal}
                onRequestDelete={openDeleteTeamModal}
                onRequestEdit={openEditTeamModal}
                team={team}
              />
            ))}

        {!isTeamsFetching && !teamsQuery.isError && teams.length === 0 ? (
          <div className="notes-empty">
            <Icon name="users" size={18} />
            <strong>Aucune equipe</strong>
            <span>Creez une equipe pour demarrer un espace de travail.</span>
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {isDrawerOpen ? (
          <motion.div
            className="team-drawer-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeDrawer}
          >
            <motion.aside
              className="team-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-drawer-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <form className="team-drawer-form" onSubmit={handleSubmit}>
                <header className="team-drawer-header">
                  <div className="team-drawer-title">
                    <span style={{ background: form.teamColor }} />
                    <div>
                      <small>Teams</small>
                      <h2 id="team-drawer-title">Creer une equipe</h2>
                    </div>
                  </div>

                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Fermer"
                    disabled={isSubmitting}
                    onClick={closeDrawer}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </header>

                <div className="team-drawer-body">
                  {formError ? (
                    <div className="team-form-error">
                      <Icon name="alert" size={16} />
                      {formError}
                    </div>
                  ) : null}

                  <section className="team-drawer-section">
                    <label className="note-field">
                      <span>Nom</span>
                      <input
                        autoFocus
                        maxLength={160}
                        value={form.name}
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                        placeholder="Direction, Produit, Design..."
                      />
                    </label>

                    <label className="note-field">
                      <span>Description</span>
                      <textarea
                        maxLength={1000}
                        value={form.description}
                        onChange={(event) =>
                          updateField("description", event.target.value)
                        }
                        placeholder="Description de l'equipe"
                        rows={5}
                      />
                    </label>

                    <label className="note-field">
                      <span>Avatar URL</span>
                      <input
                        maxLength={1024}
                        value={form.avatarUrl}
                        onChange={(event) =>
                          updateField("avatarUrl", event.target.value)
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <div className="note-field">
                      <span>Couleur</span>
                      <div className="team-color-picker">
                        {teamColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={
                              form.teamColor === color ? "selected" : undefined
                            }
                            style={{ background: color }}
                            aria-label={`Couleur ${color}`}
                            onClick={() => updateField("teamColor", color)}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="team-drawer-section team-drawer-members">
                    <div className="team-member-section-head">
                      <div>
                        <h3>Utilisateurs</h3>
                        <span>{form.members.length} selectionne(s)</span>
                      </div>
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => setIsUserPickerOpen(true)}
                      >
                        <Icon name="plus" size={14} />
                        Add user
                      </button>
                    </div>

                    <div className="team-member-table-wrap">
                      {form.members.length > 0 ? (
                        <table className="team-member-table">
                          <thead>
                            <tr>
                              <th>Utilisateur</th>
                              <th>Role</th>
                              <th aria-label="Actions" />
                            </tr>
                          </thead>
                          <tbody>
                            {form.members.map((member) => (
                              <tr key={member.user.id}>
                                <td>
                                  <Avatar
                                    name={member.user.name}
                                    presence={member.user.presence}
                                    size={30}
                                  />
                                  <span>
                                    <strong>{member.user.name}</strong>
                                    <small>{member.user.email}</small>
                                  </span>
                                </td>
                                <td>
                                  <select
                                    value={member.roleName}
                                    onChange={(event) =>
                                      updateDraftMemberRole(
                                        member.user.id,
                                        event.target.value as TeamMemberRole,
                                      )
                                    }
                                  >
                                    <option value="COLLABORATOR">
                                      Collaborateur
                                    </option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                  </select>
                                </td>
                                <td>
                                  <button
                                    className="icon-button bordered"
                                    type="button"
                                    aria-label={`Retirer ${member.user.name}`}
                                    onClick={() =>
                                      removeDraftMember(member.user.id)
                                    }
                                  >
                                    <Icon name="x" size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="team-member-empty-table">
                          <Icon name="users" size={18} />
                          <strong>Aucun utilisateur</strong>
                          <span>La table TeamMember est vide.</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <footer className="team-drawer-footer">
                  <button
                    className="button ghost"
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeDrawer}
                  >
                    Annuler
                  </button>
                  <button
                    className="button primary notes-submit"
                    type="submit"
                    disabled={!canSubmit}
                  >
                    <Icon name="plus" size={14} />
                    {isSubmitting ? "Creation..." : "Creer la team"}
                  </button>
                </footer>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TeamUserPickerModal
        error={usersQuery.error}
        isOpen={isUserPickerOpen}
        loading={usersQuery.loading}
        onClose={() => setIsUserPickerOpen(false)}
        onRetry={usersQuery.refetch}
        onSelect={addDraftMember}
        selectedUserIds={selectedUserIds}
        users={usersQuery.data ?? []}
      />

      <AnimatePresence>
        {detailsTeam ? (
          <TeamDetailsModal
            key={detailsTeam.id}
            onClose={() => setDetailsTeam(null)}
            team={detailsTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTargetTeam ? (
          <DeleteTeamConfirmModal
            key={deleteTargetTeam.id}
            error={deleteError}
            isDeleting={isDeletingTeam}
            onClose={closeDeleteTeamModal}
            onConfirm={handleConfirmDeleteTeam}
            team={deleteTargetTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editTargetTeam ? (
          <EditTeamModal
            key={editTargetTeam.id}
            error={editTeamError}
            isUpdating={isUpdatingTeam}
            onClose={closeEditTeamModal}
            onSubmit={handleUpdateTeam}
            team={editTargetTeam}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {addMemberTargetTeam ? (
          <AddExistingTeamMemberModal
            key={addMemberTargetTeam.id}
            addMemberPending={addMemberMutation.isPending}
            error={usersQuery.error}
            loading={usersQuery.loading}
            onAdd={handleAddMemberToExistingTeam}
            onClose={closeAddMemberModal}
            onRetry={usersQuery.refetch}
            team={addMemberTargetTeam}
            users={usersQuery.data ?? []}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
