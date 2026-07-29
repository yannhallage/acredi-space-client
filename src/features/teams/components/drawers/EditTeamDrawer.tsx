import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Avatar, Icon } from "../../../../shared/ui";
import { TEAM_COLORS } from "../../constants";
import { useRemoveTeamMember, useTeamMembers } from "../../hooks";
import { memberDisplayName, roleLabels } from "../../teamMemberDisplay";
import { getErrorMessage } from "../../utils";
import type { Team } from "../../types";

export function EditTeamDrawer({
  error,
  isOpen,
  isUpdating,
  onClose,
  onSubmit,
  team,
}: {
  error: string | null;
  isOpen: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (request: {
    description: string;
    name: string;
    teamColor: string;
  }) => Promise<void>;
  team: Team | null;
}) {
  const teamId = team?.id ?? "";
  const membersQuery = useTeamMembers(teamId);
  const removeMemberMutation = useRemoveTeamMember();
  const members = membersQuery.data ?? [];

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0]);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!team) {
      return;
    }

    setDescription(team.description ?? "");
    setName(team.name);
    setTeamColor(team.color);
    setRemoveError(null);
    setRemovingUserId(null);
  }, [team]);

  const isBusy = isUpdating || removeMemberMutation.isPending;
  const canSubmit = name.trim().length >= 2 && !isBusy;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isBusy, isOpen, onClose]);

  async function handleRemoveMember(userId: string, displayName: string) {
    if (!team || removeMemberMutation.isPending) {
      return;
    }

    setRemoveError(null);
    setRemovingUserId(userId);

    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id,
        userId,
      });
    } catch (caught) {
      setRemoveError(
        getErrorMessage(
          caught,
          `Impossible de retirer ${displayName} de l'equipe.`,
        ),
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && team ? (
        <motion.div
          className="team-drawer-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={() => {
            if (!isBusy) {
              onClose();
            }
          }}
        >
          <motion.aside
            className="team-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-edit-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <form
              className="team-drawer-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canSubmit) {
                  return;
                }
                onSubmit({ description, name, teamColor }).catch(
                  () => undefined,
                );
              }}
            >
              <header className="team-drawer-header">
                <div className="team-drawer-title">
                  <span style={{ background: teamColor }} />
                  <div>
                    <small>Teams</small>
                    <h2 id="team-edit-drawer-title">Modifier l'équipe</h2>
                  </div>
                </div>

                <button
                  className="icon-button"
                  type="button"
                  aria-label="Fermer"
                  disabled={isBusy}
                  onClick={onClose}
                >
                  <Icon name="x" size={16} />
                </button>
              </header>

              <div className="team-drawer-body">
                {error || removeError ? (
                  <div className="team-form-error">
                    <Icon name="alert" size={16} />
                    {error || removeError}
                  </div>
                ) : null}

                <section className="team-drawer-section">
                  <label className="note-field">
                    <span>Nom</span>
                    <input
                      autoFocus
                      maxLength={160}
                      value={name}
                      disabled={isBusy}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nom de l'équipe"
                    />
                  </label>

                  <label className="note-field">
                    <span>Description</span>
                    <textarea
                      maxLength={1000}
                      value={description}
                      disabled={isBusy}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Description de l'équipe"
                      rows={5}
                    />
                  </label>

                  <div className="note-field">
                    <span>Couleur</span>
                    <div className="team-color-picker">
                      {TEAM_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={
                            teamColor === color ? "selected" : undefined
                          }
                          style={{ background: color }}
                          aria-label={`Couleur ${color}`}
                          disabled={isBusy}
                          onClick={() => setTeamColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                <section className="team-drawer-section team-drawer-members">
                  <div className="team-member-section-head">
                    <div>
                      <h3>Membres</h3>
                      <span>{members.length} membre(s)</span>
                    </div>
                  </div>

                  <div className="team-member-table-wrap">
                    {membersQuery.isLoading ? (
                      <div className="team-details-loading">
                        <span className="skeleton-line" />
                        <span className="skeleton-line" />
                        <span className="skeleton-line" />
                      </div>
                    ) : null}

                    {!membersQuery.isLoading && membersQuery.isError ? (
                      <div className="team-member-empty-table">
                        <Icon name="alert" size={18} />
                        <strong>Membres indisponibles</strong>
                        <span>{membersQuery.error.message}</span>
                      </div>
                    ) : null}

                    {!membersQuery.isLoading &&
                    !membersQuery.isError &&
                    members.length > 0 ? (
                      <table className="team-member-table">
                        <thead>
                          <tr>
                            <th>Utilisateur</th>
                            <th>Role</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => {
                            const displayName = memberDisplayName(member);
                            const isOwner = member.userId === team.ownerId;
                            const isRemoving =
                              removingUserId === member.userId;

                            return (
                              <tr key={member.id}>
                                <td>
                                  <Avatar
                                    name={displayName}
                                    presence={member.user?.presence}
                                    size={30}
                                    src={member.user?.avatarUrl}
                                  />
                                  <span>
                                    <strong>{displayName}</strong>
                                    <small>
                                      {member.user?.email || roleLabels[member.roleName]}
                                    </small>
                                  </span>
                                </td>
                                <td>{roleLabels[member.roleName]}</td>
                                <td>
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
                                      disabled={isBusy}
                                      onClick={() =>
                                        handleRemoveMember(
                                          member.userId,
                                          displayName,
                                        )
                                      }
                                    >
                                      <Icon
                                        name={isRemoving ? "refresh" : "trash"}
                                        size={14}
                                      />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : null}

                    {!membersQuery.isLoading &&
                    !membersQuery.isError &&
                    members.length === 0 ? (
                      <div className="team-member-empty-table">
                        <Icon name="users" size={18} />
                        <strong>Aucun membre</strong>
                        <span>
                          Cette equipe ne contient pas encore de membre.
                        </span>
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>

              <footer className="team-drawer-footer">
                <button
                  className="button ghost"
                  type="button"
                  disabled={isBusy}
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!canSubmit}
                >
                  <Icon name="edit" size={14} />
                  {isUpdating ? "Modification..." : "Enregistrer"}
                </button>
              </footer>
            </form>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
