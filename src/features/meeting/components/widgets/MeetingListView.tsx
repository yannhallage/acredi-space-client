import type { MouseEvent } from "react";
import type { Meeting } from "../../types";
import { isPastMeeting } from "../../utils";
import { MeetingListSkeleton } from "../skeletons/MeetingSkeletons";

type MeetingListViewProps = {
  meetings: Meeting[];
  isLoading: boolean;
  onOpenMeeting: (meeting: Meeting) => void;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>, meetingId: string) => void;
};

export function MeetingListView({
  meetings,
  isLoading,
  onOpenMeeting,
  onToggleMenu,
}: MeetingListViewProps) {
  return (
    <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-[var(--border)] pt-4">
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <MeetingListSkeleton key={`meeting-list-skeleton-${index}`} index={index} />
          ))
        ) : meetings.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[var(--border)] p-8 text-center text-[13px] font-medium text-[var(--muted-soft)]">
            Aucune réunion pour le moment.
          </div>
        ) : (
          [...meetings]
            .sort((a, b) =>
              `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`),
            )
            .map((meeting) => (
              <div
                key={meeting.id}
                className={`relative rounded-[12px] border px-4 py-3 pr-12 ${
                  isPastMeeting(meeting)
                    ? "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] opacity-75 grayscale"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <button
                  onClick={() => onOpenMeeting(meeting)}
                  className="block w-full text-left hover:opacity-80"
                  type="button"
                >
                  <p className="text-[13px] font-bold">{meeting.title}</p>
                  <p
                    className={`text-[12px] font-medium ${
                      isPastMeeting(meeting)
                        ? "text-[var(--muted)]"
                        : "text-[var(--muted-soft)]"
                    }`}
                  >
                    {meeting.date} · {meeting.start} - {meeting.end} ·{" "}
                    {meeting.mode}
                    {meeting.joinUrl ? " · Cliquer pour rejoindre" : ""}
                  </p>
                </button>
                <button
                  onClick={(event) => onToggleMenu(event, meeting.id)}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[16px] leading-none text-[var(--text)] hover:bg-[var(--surface-2)]"
                  aria-label="Options de la réunion"
                  type="button"
                >
                  ⋮
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
