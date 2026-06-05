import { useAuth } from "../../shared/context";
import { AccessDeniedState, EmptyState, Icon, LoadingState } from "../../shared/ui";
import { canAccessMyTeams } from "./access";
import { useMyTeams } from "./hooks";
import type { Team } from "./types";

function formatTeamDate(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function MyTeamCard({ team }: { team: Team }) {
  return (
    <article className="team-card my-team-card">
      <header>
        <span style={{ background: team.color }} />

        <div>
          <h2>{team.name}</h2>
          <p>{team.description || "Equipe Acredi Space"}</p>
        </div>
      </header>

      <div className="team-card-meta">
        <span>
          <Icon name="message" size={14} />
          {team.slug ? `#${team.slug}` : "#team"}
        </span>
        <span>
          <Icon name="calendar" size={14} />
          {formatTeamDate(team.createdAt)}
        </span>
        {team.ownerName ? (
          <span>
            <Icon name="users" size={14} />
            {team.ownerName}
          </span>
        ) : null}
      </div>

      <div className="team-card-footer">
        <span className="team-card-footnote">My Team</span>
      </div>
    </article>
  );
}

export function MyTeamsPage() {
  const { user } = useAuth();
  const canViewMyTeams = canAccessMyTeams(user?.adminRole);
  const myTeamsQuery = useMyTeams({ enabled: canViewMyTeams });
  const teams = myTeamsQuery.data ?? [];

  if (!canViewMyTeams) {
    return (
      <AccessDeniedState
        title="Acces reserve"
        body="Cette section est disponible pour les collaborateurs et managers."
      />
    );
  }

  return (
    <div className="teams-page my-teams-page">
      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>My Team</span>
          <Icon name="users" size={14} />
          <strong>Mes equipes</strong>
        </div>
      </section>

      {myTeamsQuery.isError ? (
        <div className="team-error-banner">
          Erreur lors du chargement de mes equipes: {myTeamsQuery.error.message}
          <button
            className="button ghost"
            type="button"
            onClick={() => {
              myTeamsQuery.refetch().catch(() => undefined);
            }}
          >
            Reessayer
          </button>
        </div>
      ) : null}

      {myTeamsQuery.isLoading ? (
        <LoadingState label="Chargement de mes equipes..." />
      ) : teams.length > 0 ? (
        <section className="teams-grid" aria-label="Mes equipes">
          {teams.map((team) => (
            <MyTeamCard key={team.id} team={team} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="Aucune equipe"
          body="Vous n'etes rattache a aucune equipe pour le moment."
        />
      )}
    </div>
  );
}
