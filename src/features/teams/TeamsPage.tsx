import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUsersQuery } from "../../shared/api/users";
import type { User } from "../../shared/types";
import { Avatar, Icon } from "../../shared/ui";
import {
  useAddTeamMember,
  useCreateTeam,
  useTeamMembers,
  useTeams,
} from "./hooks";
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

const roleLabels: Record<TeamMemberRole, string> = {
  ADMIN: "Admin",
  COLLABORATOR: "Collaborateur",
  MANAGER: "Manager",
};

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

function getErrorMessage(error: unknown) {
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

  return "Une erreur est survenue pendant la creation.";
}

function memberDisplayName(member: TeamMember) {
  return member.user?.name || member.userId || "Utilisateur";
}

function memberDisplayEmail(member: TeamMember) {
  return member.user?.email || "TeamMember";
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

function TeamCard({
  onOpenDetails,
  team,
}: {
  onOpenDetails: (team: Team) => void;
  team: Team;
}) {
  const membersQuery = useTeamMembers(team.id);
  const members = membersQuery.data ?? [];
  const membersCount = membersQuery.data ? members.length : team.membersCount;

  return (
    <article className="team-card">
      <header>
        <span style={{ background: team.color }} />

        <div>
          <h2>{team.name}</h2>
          <p>{team.description || "Equipe Acredi Space"}</p>
        </div>
      </header>

      <div className="team-card-meta">
        <span>
          <Icon name="users" size={14} />
          {membersCount} membre{membersCount > 1 ? "s" : ""}
        </span>

        <span>
          <Icon name="message" size={14} />
          {team.slug ? `#${team.slug}` : "#team"}
        </span>
      </div>

      <div className="team-card-footer">
        <div className="team-avatars" aria-label={`${membersCount} membres`}>
          <TeamAvatarStack
            loading={membersQuery.isLoading}
            members={members}
          />
        </div>

        <button
          className="button ghost"
          type="button"
          onClick={() => onOpenDetails(team)}
        >
          Ouvrir
          <Icon name="arrowRight" size={14} />
        </button>
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
          [user.name, user.email, user.role, user.team, user.status].join(" ")
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
                    )
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
                        {person.status}
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

function TeamDetailsModal({
  onClose,
  team,
}: {
  onClose: () => void;
  team: Team;
}) {
  const membersQuery = useTeamMembers(team.id);
  const members = membersQuery.data ?? [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-details-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={onClose}
    >
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
              <h2 id="team-details-title">{team.name}</h2>
              <small>{team.slug ? `#${team.slug}` : "#team"}</small>
            </div>
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

        <section className="team-details-summary">
          <div>
            <span>Description</span>
            <p>{team.description || "Aucune description"}</p>
          </div>
          <div>
            <span>Couleur</span>
            <p>{team.color}</p>
          </div>
        </section>

        <section className="team-details-users">
          <div className="team-details-users-head">
            <h3>Utilisateurs</h3>
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
              <table className="team-details-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ajoute le</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <Avatar
                          name={memberDisplayName(member)}
                          presence={member.user?.presence}
                          size={28}
                        />
                        <strong>{memberDisplayName(member)}</strong>
                      </td>
                      <td>{memberDisplayEmail(member)}</td>
                      <td>{roleLabels[member.roleName]}</td>
                      <td>{member.joinedAt.toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length === 0 ? (
              <div className="team-user-empty">
                <Icon name="users" size={18} />
                <strong>Aucun utilisateur</strong>
                <span>Cette equipe ne contient pas encore de membre.</span>
              </div>
            ) : null}
          </div>
        </section>

        <footer>
          <button className="button primary notes-submit" type="button" onClick={onClose}>
            Fermer
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}

export function TeamsPage() {
  const teamsQuery = useTeams();
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const resetCreateTeam = createTeamMutation.reset;
  const resetAddMember = addMemberMutation.reset;
  const [form, setForm] = useState<TeamFormState>(createInitialTeamForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [detailsTeam, setDetailsTeam] = useState<Team | null>(null);
  const usersQuery = useUsersQuery({ enabled: isDrawerOpen });
  const teams = teamsQuery.data ?? [];
  const isSubmitting = createTeamMutation.isPending || addMemberMutation.isPending;
  const canSubmit = form.name.trim().length >= 2 && !isSubmitting;

  const selectedUserIds = useMemo(
    () => new Set(form.members.map((member) => member.user.id)),
    [form.members]
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
    value: TeamFormState[K]
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
        member.user.id === userId ? { ...member, roleName } : member
      ),
    }));
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
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div className="teams-page">
      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Teams</span>
          <Icon name="building" size={14} />
          <strong>Equipes</strong>
        </div>

        <button
          className="button primary notes-create-button"
          type="button"
          onClick={openDrawer}
        >
          <Icon name="plus" size={12} />
          Creer
        </button>
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
        {teamsQuery.isLoading
          ? teamSkeletons.map((item) => <TeamCardSkeleton key={item} />)
          : teams.map((team) => (
              <TeamCard
                key={team.id}
                onOpenDetails={setDetailsTeam}
                team={team}
              />
            ))}

        {!teamsQuery.isLoading && !teamsQuery.isError && teams.length === 0 ? (
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
                                        event.target.value as TeamMemberRole
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
    </div>
  );
}
