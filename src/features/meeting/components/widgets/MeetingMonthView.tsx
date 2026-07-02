import {
  formatDayName,
  formatDayNumber,
  getMonthGrid,
  toDateKey,
} from "../../../../shared/utils/calendarGrid";
import type { Meeting } from "../../types";
import { isPastMeeting } from "../../utils";
import {
  getMonthSkeletonCount,
  MeetingMonthSkeleton,
} from "../skeletons/MeetingSkeletons";

type MeetingMonthViewProps = {
  selectedDate: Date;
  selectedDateKey: string;
  meetings: Meeting[];
  isLoading: boolean;
  weekDays: Date[];
  onSelectDay: (day: Date) => void;
  onOpenMeeting: (meeting: Meeting) => void;
};

export function MeetingMonthView({
  selectedDate,
  selectedDateKey,
  meetings,
  isLoading,
  weekDays,
  onSelectDay,
  onOpenMeeting,
}: MeetingMonthViewProps) {
  const monthDays = getMonthGrid(selectedDate);

  return (
    <div className="mt-5 grid min-h-0 flex-1 grid-rows-[36px_minmax(0,1fr)] overflow-hidden border-l border-t border-[var(--border)]">
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface)]">
        {weekDays.map((day) => (
          <div
            key={toDateKey(day)}
            className="flex items-center justify-center border-r border-[var(--border)] text-[12px] font-semibold capitalize last:border-r-0"
          >
            {formatDayName(day, true)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 overflow-y-auto">
        {monthDays.map((day) => {
          const dateKey = toDateKey(day);
          const dayMeetings = meetings.filter(
            (meeting) => meeting.date === dateKey,
          );
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = dateKey === selectedDateKey;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(day)}
              className="min-h-[104px] border-b border-r border-[var(--border)] p-2 text-left hover:bg-[var(--surface-2)]"
              type="button"
            >
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                  isSelected
                    ? "bg-[#168cf0] text-white"
                    : isCurrentMonth
                      ? "text-[var(--text)]"
                      : "text-[var(--muted)]"
                }`}
              >
                {formatDayNumber(day)}
              </span>

              <div className="mt-2 space-y-1">
                {isLoading ? (
                  Array.from({ length: getMonthSkeletonCount(day) }).map(
                    (_, index) => (
                      <MeetingMonthSkeleton
                        key={`${dateKey}-meeting-skeleton-${index}`}
                        dateKey={dateKey}
                        index={index}
                      />
                    ),
                  )
                ) : (
                  <>
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <div
                        key={meeting.id}
                        className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${
                          isPastMeeting(meeting)
                            ? "bg-[var(--surface-2)] text-[var(--muted)] opacity-70 grayscale"
                            : `text-[#171717] ${meeting.color}`
                        }`}
                      >
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenMeeting(meeting);
                          }}
                          className="block w-full truncate text-left"
                          type="button"
                        >
                          {meeting.start} · {meeting.title}
                        </button>
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <p className="text-[11px] font-semibold text-[var(--muted-soft)]">
                        +{dayMeetings.length - 3}
                      </p>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
