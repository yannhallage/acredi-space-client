import type { WidgetComponentProps } from "../../constants";
import { formatDateTime, upcomingCalendarEvents } from "../../utils";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

export function MyCalendarWidget({ context }: WidgetComponentProps) {
  if (context.isCalendarLoading) return <ListSkeleton />;

  const events = upcomingCalendarEvents(context.calendarEvents);

  if (!events.length) {
    return (
      <EmptyBlock
        illustration="calendar"
        title="Aucun evenement a venir"
        body="Votre calendrier est libre pour le moment."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--surface)]">
        {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((day) => (
          <span className="px-2 py-1.5 text-center text-[10px] font-medium text-[var(--muted)]" key={day}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid min-h-[150px] grid-cols-5 gap-2 bg-[var(--surface-2)] p-2.5">
        {events.slice(0, 5).map((event, index) => (
          <div
            className="min-w-0 self-start rounded-md bg-[#5B6CFF]/10 p-2.5 text-[#5B6CFF]"
            key={event.id}
            style={{ gridColumnStart: (index % 5) + 1 }}
          >
            <strong className="block truncate text-[12px] font-semibold">{event.title}</strong>
            <small className="mt-1 block truncate text-[10px] text-[#5B6CFF] opacity-80">
              {event.location || formatDateTime(event.startsAt)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
