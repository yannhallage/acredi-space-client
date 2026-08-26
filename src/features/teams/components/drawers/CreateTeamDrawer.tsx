import { AnimatePresence, motion } from "framer-motion";

import type { Feedback } from "../../../../shared/feedback";
import { Avatar, FeedbackBanner, Icon } from "../../../../shared/ui";
import { TEAM_COLORS } from "../../constants";
import type { TeamFormState } from "../../teamForm";
import type { TeamMemberRole } from "../../types";

export function CreateTeamDrawer({
  canSubmit,
  form,
  formError,
  isOpen,
  isSubmitting,
  onClose,
  onOpenUserPicker,
  onRemoveMember,
  onSubmit,
  onUpdateField,
  onUpdateMemberRole,
}: {
  canSubmit: boolean;
  form: TeamFormState;
  formError: Feedback | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onOpenUserPicker: () => void;
  onRemoveMember: (userId: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateField: <K extends keyof TeamFormState>(
    key: K,
    value: TeamFormState[K],
  ) => void;
  onUpdateMemberRole: (userId: string, roleName: TeamMemberRole) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="team-drawer-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
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
            <form className="team-drawer-form" onSubmit={onSubmit}>
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
                  onClick={onClose}
                >
                  <Icon name="x" size={16} />
                </button>
              </header>

              <div className="team-drawer-body">
                {formError ? <FeedbackBanner feedback={formError} /> : null}

                <section className="team-drawer-section">
                  <label className="note-field">
                    <span>Nom</span>
                    <input
                      autoFocus
                      maxLength={160}
                      value={form.name}
                      onChange={(event) =>
                        onUpdateField("name", event.target.value)
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
                        onUpdateField("description", event.target.value)
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
                        onUpdateField("avatarUrl", event.target.value)
                      }
                      placeholder="https://..."
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
                            form.teamColor === color ? "selected" : undefined
                          }
                          style={{ background: color }}
                          aria-label={`Couleur ${color}`}
                          onClick={() => onUpdateField("teamColor", color)}
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
                      onClick={onOpenUserPicker}
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
                            <th>Action</th>
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
                                    onUpdateMemberRole(
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
                                  onClick={() => onRemoveMember(member.user.id)}
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
                  onClick={onClose}
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
  );
}
