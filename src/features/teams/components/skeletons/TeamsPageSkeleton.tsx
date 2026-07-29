import { TEAM_SKELETON_KEYS } from "../../constants";
import { TeamCardSkeleton } from "./TeamCardSkeleton";

export function TeamsPageSkeleton() {
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
        {TEAM_SKELETON_KEYS.map((item) => (
          <TeamCardSkeleton key={item} />
        ))}
      </section>
    </div>
  );
}
