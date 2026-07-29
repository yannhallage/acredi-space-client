import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Toast from "../../../../components/app/Toast/Toast";
import { Avatar, Icon } from "../../../../shared/ui";
import { useRemoveTeamMember, useTeamMembers } from "../../hooks";
import { memberDisplayName, roleLabels } from "../../teamMemberDisplay";
import { getErrorMessage } from "../../utils";
import type { Team } from "../../types";

interface TeamDetailsModalProps {
  canManageMembers?: boolean;
  onClose: () => void;
  team: Team;
}

export function TeamDetailsModal({
  canManageMembers = false,
  onClose,
  team,
}: TeamDetailsModalProps) {
  const membersQuery = useTeamMembers(team.id);
  const removeMemberMutation = useRemoveTeamMember();
  const members = membersQuery.data ?? [];
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !removeMemberMutation.isPending) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, removeMemberMutation.isPending]);

  async function handleRemoveMember(userId: string, displayName: string) {
    if (removeMemberMutation.isPending) {
      return;
    }

    setRemoveError(null);
    setRemovingUserId(userId);

    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id,
        userId,
      });
    } catch (error) {
      setRemoveError(
        getErrorMessage(
          error,
          `Impossible de retirer ${displayName} de l'equipe.`,
        ),
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <motion.div
      className="note-modal-overlay team-details-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={() => {
        if (!removeMemberMutation.isPending) {
          onClose();
        }
      }}
    >
      {removeError ? <Toast intent="error" message={removeError} /> : null}

      <motion.section
        className="note-modal team-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-details-title"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="team-details-title">
            <i style={{ background: team.color }} />
            <div>
              <h2 id="team-details-title">Membres</h2>
              <small>{team.name}</small>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={removeMemberMutation.isPending}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <section className="team-details-users">
          <div className="team-details-users-head">
            <h3>Liste des membres</h3>
            <span>{members.length} membre(s)</span>
          </div>

          <div className="team-details-table-wrap">
            {membersQuery.isLoading ? (
              <div className="team-details-loading">
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </div>
            ) : null}

            {!membersQuery.isLoading && membersQuery.isError ? (
              <div className="team-user-empty">
                <Icon name="alert" size={18} />
                <strong>Membres indisponibles</strong>
                <span>{membersQuery.error.message}</span>
              </div>
            ) : null}

            {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length > 0 ? (
              <table
                className={
                  canManageMembers
                    ? "team-details-table team-details-table--manage"
                    : "team-details-table"
                }
              >
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Role</th>
                    {canManageMembers ? <th aria-label="Actions" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const displayName = memberDisplayName(member);
                    const isOwner = member.userId === team.ownerId;

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="team-details-user-cell">
                            <Avatar
                              name={displayName}
                              presence={member.user?.presence}
                              size={28}
                              src={member.user?.avatarUrl}
                            />
                            <strong>{displayName}</strong>
                          </div>
                        </td>
                        <td>{roleLabels[member.roleName]}</td>
                        {canManageMembers ? (
                          <td className="team-details-actions-cell">
                            {isOwner ? (
                              <span className="team-details-owner-badge">
                                Proprietaire
                              </span>
                            ) : (
                              <button
                                className="icon-button bordered danger"
                                type="button"
                                aria-label={`Retirer ${displayName}`}
                                title="Retirer"
                                disabled={removeMemberMutation.isPending}
                                onClick={() =>
                                  handleRemoveMember(member.userId, displayName)
                                }
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null}

            {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length === 0 ? (
              <div className="team-user-empty">
                <Icon name="users" size={18} />
                <strong>Aucun membre</strong>
                <span>Cette equipe ne contient pas encore de membre.</span>
              </div>
            ) : null}
          </div>
        </section>
      </motion.section>
    </motion.div>
  );
}
