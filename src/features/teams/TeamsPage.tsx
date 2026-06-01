import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import {
  useTeamsQuery,
  useCreateTeamMutation,
  type TeamResponse,
} from "../../shared/api/teams";
import { useUsersQuery } from "../../shared/api/users";
import type { User } from "../../shared/types";
import { Avatar, Icon } from "../../shared/ui";

type TeamMemberLike = Partial<Pick<User, "id" | "name" | "email" | "presence" | "role">> & {
  userId?: string;
  fullName?: string;
};

type TeamWithMembers = TeamResponse & {
  memberCount?: number;
  membersCount?: number;
  memberIds?: string[];
  members?: TeamMemberLike[];
};

const teamSkeletons = [
  "team-skeleton-1",
  "team-skeleton-2",
  "team-skeleton-3",
  "team-skeleton-4",
];

const userPickerSkeletons = [
  "team-user-skeleton-1",
  "team-user-skeleton-2",
  "team-user-skeleton-3",
];

const teamColorOptions = [
  { value: "#5B6CFF", label: "Bleu" },
  { value: "#8B7FFF", label: "Violet" },
  { value: "#22C55E", label: "Vert" },
  { value: "#F59E0B", label: "Ambre" },
  { value: "#EF4444", label: "Rouge" },
  { value: "#06B6D4", label: "Cyan" },
];

const defaultTeamColor = teamColorOptions[0].value;

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

function TeamUserOptionSkeleton() {
  return (
    <div className="team-user-option team-user-option-skeleton" aria-hidden="true">
      <span className="skeleton-avatar" />
      <span className="skeleton-copy">
        <span className="skeleton-line team-user-skeleton-name" />
        <span className="skeleton-line team-user-skeleton-email" />
      </span>
      <span className="skeleton-pill team-user-skeleton-role" />
    </div>
  );
}

function hasTeamMemberReferences(team: TeamResponse) {
  const nextTeam = team as TeamWithMembers;
  return Boolean(nextTeam.members?.length || nextTeam.memberIds?.length);
}

function resolveTeamMembers(team: TeamWithMembers, userDirectory: User[]) {
  const usersById = new Map(userDirectory.map((user) => [user.id, user]));
  const fromMembers = Array.isArray(team.members)
    ? team.members
        .map((member) => {
          const id = member.id ?? member.userId ?? "";
          const directoryUser = id ? usersById.get(id) : undefined;

          return {
            id: id || member.email || member.name || member.fullName || "",
            name:
              member.name ??
              member.fullName ??
              directoryUser?.name ??
              member.email ??
              "Utilisateur",
            email: member.email ?? directoryUser?.email ?? "",
            presence: member.presence ?? directoryUser?.presence,
          };
        })
        .filter((member) => member.id)
    : [];

  if (fromMembers.length > 0) {
    return fromMembers;
  }

  return Array.isArray(team.memberIds)
    ? team.memberIds
        .map((id) => usersById.get(id))
        .filter((user): user is User => Boolean(user))
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          presence: user.presence,
        }))
    : [];
}

function getTeamMemberCount(team: TeamWithMembers, resolvedCount: number) {
  if (typeof team.memberCount === "number") return team.memberCount;
  if (typeof team.membersCount === "number") return team.membersCount;
  if (Array.isArray(team.members)) return team.members.length;
  if (Array.isArray(team.memberIds)) return team.memberIds.length;
  return resolvedCount;
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { data: teams, loading, error: teamsError, refetch } = useTeamsQuery();
  const shouldLoadUsers =
    Boolean(teams?.some(hasTeamMemberReferences)) || loading === false;
  const usersQuery = useUsersQuery({ enabled: shouldLoadUsers });
  const { mutateAsync: createTeam, isPending: isCreating } =
    useCreateTeamMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamColor, setTeamColor] = useState(defaultTeamColor);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const userDirectory = usersQuery.data ?? [];

  const availableUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();

    return userDirectory
      .filter((user) => {
        if (!query) return true;

        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
        );
      })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userDirectory, userQuery]);

  const selectedUsers = useMemo(
    () =>
      selectedUserIds
        .map((id) => userDirectory.find((user) => user.id === id))
        .filter((user): user is User => Boolean(user)),
    [selectedUserIds, userDirectory]
  );

  const resetCreateForm = useCallback(() => {
    setTeamName("");
    setTeamDescription("");
    setTeamColor(defaultTeamColor);
    setSelectedUserIds([]);
    setUserQuery("");
    setCreateError(null);
  }, []);

  const closeCreateModal = useCallback(() => {
    if (isCreating) return;

    setIsCreateOpen(false);
    resetCreateForm();
  }, [isCreating, resetCreateForm]);

  useEffect(() => {
    if (!isCreateOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCreateModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeCreateModal, isCreateOpen]);

  const toggleMember = useCallback((userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }, []);

  const handleCreateTeam = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateError(null);

      if (!teamName.trim()) {
        setCreateError("Le nom de l'équipe est requis");
        return;
      }

      try {
        await createTeam({
          name: teamName.trim(),
          description: teamDescription.trim(),
          teamColor,
          members: selectedUserIds.map((id) => ({ id })),
        });

        setIsCreateOpen(false);
        resetCreateForm();
        await refetch();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur lors de la création";
        setCreateError(message);
      }
    },
    [
      createTeam,
      refetch,
      resetCreateForm,
      selectedUserIds,
      teamColor,
      teamDescription,
      teamName,
    ]
  );

  return (
    <div className="teams-page">
      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Teams</span>
          <Icon name="building" size={14} />
          <strong>Équipes</strong>
        </div>
        <button
          className="button primary notes-create-button"
          type="button"
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          disabled={isCreating}
        >
          <Icon name="plus" size={12} />
          Créer une équipe
        </button>
      </section>

      {teamsError && (
        <div className="team-error-banner">
          Erreur lors du chargement des équipes: {teamsError.message}
        </div>
      )}

      <section className="teams-grid" aria-label="Teams">
        {loading
          ? teamSkeletons.map((item) => <TeamCardSkeleton key={item} />)
          : teams?.map((team) => {
              const nextTeam = team as TeamWithMembers;
              const teamMembers = resolveTeamMembers(nextTeam, userDirectory).slice(0, 4);
              const memberCount = getTeamMemberCount(nextTeam, teamMembers.length);

              return (
                <article className="team-card" key={team.id}>
                  <header>
                    <span style={{ background: team.teamColor || defaultTeamColor }} />
                    <div>
                      <h2>{team.name}</h2>
                      <p>{team.description || "Équipe Acredi Space"}</p>
                    </div>
                  </header>

                  <div className="team-card-meta">
                    <span>
                      <Icon name="users" size={14} />
                      {memberCount} membre{memberCount > 1 ? "s" : ""}
                    </span>
                    <span>
                      <Icon name="message" size={14} />#
                      {team.slug || "general"}
                    </span>
                  </div>

                  <div className="team-card-footer">
                    <div className="team-avatars" aria-hidden="true">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <Avatar
                            key={member.id}
                            name={member.name}
                            size={30}
                            presence={member.presence}
                          />
                        ))
                      ) : (
                        <span className="team-avatar-empty">
                          <Icon name="users" size={15} />
                        </span>
                      )}
                    </div>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => {
                        navigate(`/app/chat/${team.slug}`);
                      }}
                    >
                      Ouvrir
                      <Icon name="arrowRight" size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
      </section>

      <AnimatePresence>
        {isCreateOpen ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeCreateModal}
          >
            <motion.form
              className="note-modal team-create-modal"
              aria-label="Créer une équipe"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={handleCreateTeam}
            >
              <header className="team-modal-header">
                <div className="team-modal-title">
                  <span
                    className="team-modal-icon"
                    style={{ background: teamColor }}
                    aria-hidden="true"
                  >
                    <Icon name="building" size={18} />
                  </span>
                  <div className="team-modal-copy">
                    <h2>Créer une équipe</h2>
                    <small>Un espace clair pour organiser les membres et le canal.</small>
                  </div>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Fermer"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                >
                  <Icon name="x" size={16} />
                </button>
              </header>

              {createError && <div className="team-form-error">{createError}</div>}

              <label className="note-field">
                <span>
                  Nom de l'équipe <b>*</b>
                </span>
                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Direction produit"
                  autoFocus
                  disabled={isCreating}
                />
              </label>

              <div className="note-field team-color-field">
                <span>Couleur</span>
                <div className="team-color-picker">
                  {teamColorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={teamColor === color.value ? "selected" : ""}
                      aria-label={`Couleur ${color.label}`}
                      aria-pressed={teamColor === color.value}
                      onClick={() => setTeamColor(color.value)}
                      disabled={isCreating}
                      style={{ background: color.value }}
                    />
                  ))}
                </div>
              </div>

              <label className="note-field team-description-field">
                <span>Description</span>
                <div className="team-description-box">
                  <i style={{ background: teamColor }} aria-hidden="true" />
                  <textarea
                    value={teamDescription}
                    onChange={(event) => setTeamDescription(event.target.value)}
                    placeholder="Objectif, ton, rituels, responsabilités..."
                    rows={5}
                    maxLength={240}
                    disabled={isCreating}
                  />
                  <div className="team-description-meta">
                    <span>{teamDescription.length}/240</span>
                  </div>
                </div>
              </label>

              <div className="note-field team-users-field">
                <span>Utilisateurs</span>
                <div className="team-user-picker">
                  <div className="team-user-search">
                    <Icon name="search" size={15} />
                    <input
                      value={userQuery}
                      onChange={(event) => setUserQuery(event.target.value)}
                      placeholder="Rechercher par nom, email ou rôle"
                      disabled={isCreating || usersQuery.loading}
                    />
                  </div>

                  {selectedUsers.length > 0 ? (
                    <div className="team-selected-users" aria-label="Membres sélectionnés">
                      {selectedUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="team-selected-user"
                          onClick={() => toggleMember(user.id)}
                          disabled={isCreating}
                        >
                          <Avatar name={user.name} size={22} presence={user.presence} />
                          <span>{user.name}</span>
                          <Icon name="x" size={12} />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="team-user-results" aria-live="polite">
                    {usersQuery.loading ? (
                      userPickerSkeletons.map((item) => (
                        <TeamUserOptionSkeleton key={item} />
                      ))
                    ) : usersQuery.error ? (
                      <div className="team-user-empty">
                        <strong>Utilisateurs indisponibles</strong>
                        <span>{usersQuery.error.message}</span>
                        <button
                          className="button ghost"
                          type="button"
                          onClick={() => {
                            usersQuery.refetch().catch(() => undefined);
                          }}
                        >
                          Réessayer
                        </button>
                      </div>
                    ) : availableUsers.length > 0 ? (
                      availableUsers.map((user) => {
                        const selected = selectedUserIds.includes(user.id);

                        return (
                          <button
                            key={user.id}
                            type="button"
                            className={`team-user-option${selected ? " selected" : ""}`}
                            aria-pressed={selected}
                            onClick={() => toggleMember(user.id)}
                            disabled={isCreating}
                          >
                            <Avatar name={user.name} size={34} presence={user.presence} />
                            <span className="team-user-option-copy">
                              <strong>{user.name}</strong>
                              <small>{user.email}</small>
                            </span>
                            <span className="team-user-role">{user.role}</span>
                            <span className="team-user-check">
                              <Icon name={selected ? "check" : "plus"} size={14} />
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="team-user-empty">
                        <strong>Aucun utilisateur trouvé</strong>
                        <span>Essayez un autre nom ou email.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <footer className="team-modal-footer">
                <button
                  className="button ghost"
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                >
                  Annuler
                </button>
                <button
                  className="button primary team-submit"
                  type="submit"
                  disabled={!teamName.trim() || isCreating}
                  style={{ background: teamColor }}
                >
                  {isCreating ? (
                    <>
                      <ClipLoader size={12} color="#fff" />
                      Création...
                    </>
                  ) : (
                    "Créer"
                  )}
                </button>
              </footer>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
