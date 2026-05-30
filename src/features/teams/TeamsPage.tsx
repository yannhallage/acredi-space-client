import { useNavigate } from "react-router-dom";
import { Icon } from "../../shared/ui";
import { useTeams } from "./hooks";

const teamSkeletons = [
  "team-skeleton-1",
  "team-skeleton-2",
  "team-skeleton-3",
  "team-skeleton-4",
];

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

export function TeamsPage() {
  const navigate = useNavigate();
  const teamsQuery = useTeams();

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
          onClick={() => navigate("/app/teams/create")}
        >
          <Icon name="plus" size={12} />
          Créer
        </button>
      </section>

      {teamsQuery.isError ? (
        <div className="team-users-empty">
          <Icon name="users" size={22} />
          <strong>Erreur lors du chargement des équipes</strong>
          <p>Vérifie que le backend est lancé et que tu es bien connecté.</p>
        </div>
      ) : null}

      <section className="teams-grid" aria-label="Teams">
        {teamsQuery.isLoading
          ? teamSkeletons.map((item) => <TeamCardSkeleton key={item} />)
          : teamsQuery.data?.map((team) => {
              const membersCount = team.membersCount ?? 0;

              return (
                <article className="team-card" key={team.id}>
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
                    <div className="team-avatars" aria-hidden="true">
                      <span className="skeleton-avatar" />
                      <span className="skeleton-avatar" />
                      <span className="skeleton-avatar" />
                    </div>

                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => {
                        navigate(`/app/teams/${team.id}`);
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
    </div>
  );
}