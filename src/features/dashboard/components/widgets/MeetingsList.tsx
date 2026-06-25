import type { DashboardMeeting } from "../../../../shared/api/dashboard";
import { formatDateTime, getMeetingTarget, upcomingMeetings } from "../../utils";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

type MeetingsListProps = {
  isLoading: boolean;
  meetings: DashboardMeeting[];
};

export function MeetingsList({ isLoading, meetings }: MeetingsListProps) {
  if (isLoading) return <ListSkeleton />;

  const items = upcomingMeetings(meetings);

  if (!items.length) {
    return (
      <EmptyBlock
        illustration="meeting"
        title="Aucune reunion a venir"
        body="Les reunions planifiees apparaitront ici."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((meeting) => (
        <li className="flex min-w-0 items-center gap-2.5 rounded-lg bg-[var(--surface-2)] p-2.5" key={meeting.id}>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              meeting.status === "LIVE" ? "bg-emerald-500" : "bg-[#5B6CFF]"
            }`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold text-[var(--text)]">{meeting.title}</span>
            <small className="block truncate text-[11px] text-[var(--muted)]">
              {meeting.status === "LIVE" ? "En direct" : formatDateTime(meeting.startsAt)}
              {meeting.roomName ? ` - ${meeting.roomName}` : ""}
            </small>
          </span>
          <a
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold ${
              meeting.status === "LIVE"
                ? "bg-[#5B6CFF] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            }`}
            href={getMeetingTarget(meeting)}
          >
            {meeting.status === "LIVE" ? "Rejoindre" : "Voir"}
          </a>
        </li>
      ))}
    </ul>
  );
}
