import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Avatar, Icon } from "../../../../shared/ui";
import type { User } from "../../../../shared/types";
import { useTeamMembers } from "../../hooks";
import type { Team, TeamMemberRole } from "../../types";
import { getErrorMessage, normalizeSearch, userPresenceLabel } from "../../utils";

export function AddExistingTeamMemberModal({
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
          [person.name, person.email, person.role, person.team, person.status].join(
            " ",
          ),
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
              <span>
                {getErrorMessage(
                  error,
                  "Nous n’avons pas pu charger les utilisateurs.",
                )}
              </span>
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
