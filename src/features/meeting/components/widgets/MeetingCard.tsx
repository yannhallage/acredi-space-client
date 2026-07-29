import type { MouseEvent } from "react";
import {
  getCalendarHeight,
  getCalendarTop,
} from "../../../../shared/utils/calendarGrid";
import type { Meeting } from "../../types";
import { isPastMeeting } from "../../utils";

type MeetingCardProps = {
  meeting: Meeting;
  absolute?: boolean;
  onOpenMeeting: (meeting: Meeting) => void;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>, meetingId: string) => void;
};

export function MeetingCard({
  meeting,
  absolute = true,
  onOpenMeeting,
  onToggleMenu,
}: MeetingCardProps) {
  const past = isPastMeeting(meeting);

  return (
    <div
      key={meeting.id}
      className={`${absolute ? "absolute left-[8px] right-[8px] z-20" : "relative"} overflow-hidden rounded-[7px] px-2 py-[6px] pr-8 text-left shadow-sm ${
        past
          ? "cursor-not-allowed bg-[var(--surface-2)] text-[var(--muted)] opacity-70 grayscale"
          : `cursor-pointer ${meeting.color}`
      }`}
      style={
        absolute
          ? {
              top: getCalendarTop(meeting.start),
              height: getCalendarHeight(meeting.start, meeting.end),
            }
          : undefined
      }
    >
      <button
        onClick={() => {
          if (past) return;
          onOpenMeeting(meeting);
        }}
        disabled={past}
        className={`block w-full text-left ${past ? "cursor-not-allowed" : ""}`}
        type="button"
      >
        <div
          className={`truncate text-[12px] font-bold leading-[15px] ${
            past ? "text-[var(--muted)]" : "text-[#171717]"
          }`}
        >
          {meeting.title}
        </div>

        <div
          className={`truncate text-[11px] font-semibold leading-[14px] ${
            past ? "text-[var(--muted)]" : "text-[#171717]"
          }`}
        >
          {meeting.start} - {meeting.end} · {meeting.mode}
          {meeting.joinUrl && !past ? " · Rejoindre" : ""}
          {past ? " · Terminée" : ""}
        </div>

        {meeting.description && (
          <div
            className={`mt-[2px] truncate text-[11px] font-medium leading-[14px] ${
              past ? "text-[var(--muted)]" : "text-[#171717]"
            }`}
          >
            {meeting.description}
          </div>
        )}
      </button>

      {!past && (
        <button
          onClick={(event) => onToggleMenu(event, meeting.id)}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[16px] leading-none text-[#171717] hover:bg-black/10"
          aria-label="Options de la réunion"
          type="button"
        >
          ⋮
        </button>
      )}
    </div>
  );
}
