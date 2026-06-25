import type { WidgetComponentProps } from "../../constants";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

export function TeamsWidget({ context }: WidgetComponentProps) {
  if (context.isTeamsLoading) return <ListSkeleton />;

  const teams = context.teams.slice(0, 5);

  if (!teams.length) {
    return <EmptyBlock title="Aucune equipe" body="Les equipes creees apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {teams.map((team) => (
        <li className="flex min-w-0 items-center gap-2.5" key={team.id}>
          <span className="h-9 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-semibold text-[var(--text)]">{team.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">{team.membersCount} membres</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function MyTeamWidget({ context }: WidgetComponentProps) {
  if (context.isTeamsLoading) return <ListSkeleton />;

  if (!context.myTeams.length) {
    return <EmptyBlock title="Aucune equipe" body="Vos equipes apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {context.myTeams.slice(0, 5).map((team) => (
        <li className="flex min-w-0 items-center gap-2.5" key={team.id}>
          <span className="h-9 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-semibold text-[var(--text)]">{team.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">
              {team.description || `${team.membersCount} membres`}
            </small>
          </span>
        </li>
      ))}
    </ul>
  );
}
