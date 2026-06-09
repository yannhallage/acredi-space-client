import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../../shared/api/mockData";
import { Avatar, Icon } from "../../shared/ui";
import { useAddTeamMember, useCreateTeam } from "./hooks";
import "./create-team-page.css";

type TeamMemberRole = "COLLABORATOR" | "MANAGER" | "ADMIN";

type SelectedMember = {
  id: string;
  roleName: TeamMemberRole;
};

type TeamFormState = {
  name: string;
  description: string;
  teamColor: string;
  members: SelectedMember[];
};

const initialForm: TeamFormState = {
  name: "",
  description: "",
  teamColor: "#6366F1",
  members: [],
};

const colors = [
  "#6366F1",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#64748B",
];

const roleLabels: Record<TeamMemberRole, string> = {
  COLLABORATOR: "Collaborateur",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();

  const [form, setForm] = useState<TeamFormState>(initialForm);
  const [userQuery, setUserQuery] = useState("");

  const canSubmit = form.name.trim().length >= 2;

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [userQuery]);

  const selectedUsers = useMemo(() => {
    return form.members
      .map((member) => {
        const user = users.find((item) => item.id === member.id);

        if (!user) return null;

        return {
          ...user,
          roleName: member.roleName,
        };
      })
      .filter(Boolean);
  }, [form.members]);

  function updateField<K extends keyof TeamFormState>(
    key: K,
    value: TeamFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleMember(userId: string) {
    setForm((current) => {
      const exists = current.members.some((member) => member.id === userId);

      if (exists) {
        return {
          ...current,
          members: current.members.filter((member) => member.id !== userId),
        };
      }

      return {
        ...current,
        members: [
          ...current.members,
          {
            id: userId,
            roleName: "COLLABORATOR",
          },
        ],
      };
    });
  }

  function updateMemberRole(userId: string, roleName: TeamMemberRole) {
    setForm((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === userId ? { ...member, roleName } : member
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      await createTeamMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        teamColor: form.teamColor,
        avatarUrl: null,
      });

      navigate("/app/teams");
    } catch (error) {
      console.error("Erreur création équipe :", error);
    }
  }

  return (
    <div className="create-team-page">
      <section className="create-team-header">
        <button
          className="button ghost"
          type="button"
          onClick={() => navigate("/app/teams")}
        >
          <Icon name="arrowLeft" size={14} />
          Retour
        </button>

        <div>
          <span>Teams</span>
          <h1>Créer une équipe</h1>
          <p>
            Configure une équipe, choisis sa couleur et ajoute les membres qui
            doivent y accéder.
          </p>
        </div>
      </section>

      <form className="create-team-layout" onSubmit={handleSubmit}>
        <section className="create-team-main">
          <article className="create-team-card">
            <div className="create-team-card-header">
              <div>
                <h2>Informations générales</h2>
                <p>Ces informations seront visibles sur la carte équipe.</p>
              </div>
            </div>

            <label className="team-field">
              <span>Nom de l’équipe</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ex: Produit, Design, Direction..."
                maxLength={120}
                autoFocus
              />
            </label>

            <label className="team-field">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Décris rapidement le rôle de cette équipe..."
                rows={5}
                maxLength={500}
              />
            </label>

            <div className="team-field">
              <span>Couleur de l’équipe</span>

              <div className="team-color-list">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={
                      form.teamColor === color
                        ? "team-color active"
                        : "team-color"
                    }
                    style={{ backgroundColor: color }}
                    onClick={() => updateField("teamColor", color)}
                  />
                ))}
              </div>
            </div>
          </article>

          <article className="create-team-card">
            <div className="create-team-card-header">
              <div>
                <h2>Membres</h2>
                <p>
                  Les membres ne sont pas encore envoyés au backend car les IDs
                  mockés ne sont pas des UUID.
                </p>
              </div>

              <strong>{form.members.length} sélectionné(s)</strong>
            </div>

            <div className="team-user-search">
              <Icon name="search" size={15} />
              <input
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                placeholder="Rechercher par nom, email ou rôle"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="team-selected-users">
                {selectedUsers.map((user) =>
                  user ? (
                    <div className="team-selected-user" key={user.id}>
                      <div className="team-selected-user-info">
                        <Avatar
                          name={user.name}
                          size={32}
                          presence={user.presence}
                        />

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>

                      <select
                        value={user.roleName}
                        onChange={(event) =>
                          updateMemberRole(
                            user.id,
                            event.target.value as TeamMemberRole
                          )
                        }
                      >
                        <option value="COLLABORATOR">Collaborateur</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button
                        type="button"
                        className="team-remove-user"
                        onClick={() => toggleMember(user.id)}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className="team-user-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const selected = form.members.some(
                    (member) => member.id === user.id
                  );

                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={
                        selected ? "team-user-row selected" : "team-user-row"
                      }
                      onClick={() => toggleMember(user.id)}
                    >
                      <Avatar
                        name={user.name}
                        size={34}
                        presence={user.presence}
                      />

                      <span>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </span>

                      <em>{user.role}</em>

                      <Icon name={selected ? "check" : "plus"} size={15} />
                    </button>
                  );
                })
              ) : (
                <div className="team-users-empty">
                  <Icon name="users" size={22} />
                  <strong>Aucun utilisateur trouvé</strong>
                  <p>Essaie avec un autre nom, email ou rôle.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="create-team-summary">
          <article className="team-preview">
            <span
              className="team-preview-color"
              style={{ backgroundColor: form.teamColor }}
            />

            <div>
              <h3>{form.name || "Nom de l’équipe"}</h3>
              <p>
                {form.description ||
                  "La description de ton équipe apparaîtra ici."}
              </p>
            </div>

            <div className="team-preview-meta">
              <span>
                <Icon name="users" size={14} />
                {form.members.length} membre(s)
              </span>
            </div>

            {selectedUsers.length > 0 && (
              <div className="team-preview-members">
                {selectedUsers.slice(0, 5).map((user) =>
                  user ? (
                    <div key={user.id}>
                      <Avatar
                        name={user.name}
                        size={26}
                        presence={user.presence}
                      />
                      <span>{user.name}</span>
                      <small>{roleLabels[user.roleName]}</small>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </article>

          <div className="create-team-actions">
            <button
              className="button ghost"
              type="button"
              onClick={() => navigate("/app/teams")}
            >
              Annuler
            </button>

            <button
              className="button primary"
              type="submit"
              disabled={
                !canSubmit ||
                createTeamMutation.isPending ||
                addMemberMutation.isPending
              }
            >
              <Icon name="plus" size={14} />
              {createTeamMutation.isPending
                ? "Création..."
                : "Créer l’équipe"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}