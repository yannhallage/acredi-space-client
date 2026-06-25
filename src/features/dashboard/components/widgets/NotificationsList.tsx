import type { DashboardNotification } from "../../../../shared/api/dashboard";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

type NotificationsListProps = {
  isLoading: boolean;
  notifications: DashboardNotification[];
};

export function NotificationsList({
  isLoading,
  notifications,
}: NotificationsListProps) {
  if (isLoading) return <ListSkeleton />;

  const items = [...notifications]
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .slice(0, 5);

  if (!items.length) {
    return <EmptyBlock title="Aucune notification" body="Les alertes importantes apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((notification) => (
        <li className="flex min-w-0 items-start gap-2.5" key={notification.id}>
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              notification.readAt ? "bg-slate-300" : "bg-[#5B6CFF]"
            }`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-[var(--text)]">{notification.title}</span>
            <small className="line-clamp-2 text-[11px] leading-4 text-[var(--muted)]">{notification.message}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
