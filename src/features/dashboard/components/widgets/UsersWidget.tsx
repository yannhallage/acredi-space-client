import type { WidgetComponentProps } from "../../constants";
import { kpiNumber, onlineUsers } from "../../utils";
import { MetricCard } from "./MetricCard";
import { PeopleList } from "./PeopleList";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

export function UsersWidget({ context }: WidgetComponentProps) {
  if (context.isUsersLoading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard label="Utilisateurs" value={String(context.users.length || kpiNumber(context.stats, "users"))} variant="blue" />
        <MetricCard label="Connectes" value={String(onlineUsers(context.users).length)} variant="green" />
      </div>
      <PeopleList emptyTitle="Aucun utilisateur" isLoading={false} users={context.users.slice(0, 4)} />
    </div>
  );
}

export function OnlineUsersWidget({ context }: WidgetComponentProps) {
  return (
    <PeopleList
      emptyTitle="Aucun utilisateur connecte"
      isLoading={context.isUsersLoading}
      users={onlineUsers(context.users)}
    />
  );
}
