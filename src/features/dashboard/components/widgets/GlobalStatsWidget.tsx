import type { WidgetComponentProps } from "../../constants";
import { kpiNumber } from "../../utils";
import { MetricCard } from "./MetricCard";
import { MetricSkeleton } from "../skeletons/DashboardSkeletons";

export function GlobalStatsWidget({ context }: WidgetComponentProps) {
  if (context.isStatsLoading) return <MetricSkeleton />;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        label="Utilisateurs"
        value={String(kpiNumber(context.stats, "users", context.users.length))}
        variant="blue"
      />
      <MetricCard label="Equipes" value={String(kpiNumber(context.stats, "teams", context.teams.length))} />
      <MetricCard
        label="Fichiers"
        value={String(kpiNumber(context.stats, "files", context.files.length))}
        variant="green"
      />
      <MetricCard label="Reunions" value={String(kpiNumber(context.stats, "meetings", context.meetings.length))} />
    </div>
  );
}
