import type { MouseEvent } from "react";
import {
  addDays,
  formatDayName,
  formatDayNumber,
  getCalendarHours,
  toDateKey,
} from "../../../../shared/utils/calendarGrid";
import type { Meeting, ViewMode } from "../../types";
import { isPastDateTime } from "../../utils";
import {
  getLoadingMeetingBlocks,
  MeetingTimelineSkeleton,
} from "../skeletons/MeetingSkeletons";
import { MeetingCard } from "./MeetingCard";

type MeetingWeekViewProps = {
  view: ViewMode;
  visibleDays: Date[];
  selectedDateKey: string;
  calendarGridClass: string;
  meetings: Meeting[];
  isLoading: boolean;
  onSelectDay: (day: Date) => void;
  onCreateAtSlot: (dateKey: string, hour: string) => void;
  onPastDateWarning: (message: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>, meetingId: string) => void;
};

export function MeetingWeekView({
  view,
  visibleDays,
  selectedDateKey,
  calendarGridClass,
  meetings,
  isLoading,
  onSelectDay,
  onCreateAtSlot,
  onPastDateWarning,
  onOpenMeeting,
  onToggleMenu,
}: MeetingWeekViewProps) {
  const hours = getCalendarHours();

  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[var(--border)]">
      <div
        className={`grid ${calendarGridClass} border-b border-[var(--border)] bg-[var(--surface)]`}
      >
        <div className="h-11" />
        {visibleDays.map((day) => {
          const dateKey = toDateKey(day);
          const active = dateKey === selectedDateKey;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(day)}
              className="flex h-11 items-center justify-center gap-2 border-r border-[var(--border)] text-[12px] font-semibold capitalize last:border-r-0 hover:bg-[var(--surface-2)]"
              type="button"
            >
              <span>{formatDayName(day)}</span>
              <span
                className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                  active ? "bg-[#168cf0] text-white" : "text-[var(--text)]"
                }`}
              >
                {formatDayNumber(day)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`relative grid min-h-0 flex-1 ${calendarGridClass} overflow-auto`}
      >
        <div className="border-r border-[var(--border)]">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-[72px] pr-3 pt-2 text-right text-[12px] font-medium text-[var(--muted-soft)]"
            >
              {hour}
            </div>
          ))}
        </div>

        {visibleDays.map((day, dayIndex) => {
          const dateKey = toDateKey(day);
          const dayMeetings = meetings.filter(
            (meeting) => meeting.date === dateKey,
          );

          return (
            <div
              key={dateKey}
              className="relative min-w-[132px] border-r border-[var(--border)] last:border-r-0"
            >
              {hours.map((hour) => {
                const slotDateKey =
                  hour === "00:00" ? toDateKey(addDays(day, 1)) : dateKey;

                return (
                  <button
                    key={hour}
                    onClick={() => {
                      if (isPastDateTime(slotDateKey, hour)) {
                        onPastDateWarning(
                          "Impossible de créer une réunion à une date déjà passée.",
                        );
                        return;
                      }
                      onCreateAtSlot(slotDateKey, hour);
                    }}
                    className={`block h-[72px] w-full border-b border-[var(--border)] text-left ${
                      isPastDateTime(slotDateKey, hour)
                        ? "cursor-not-allowed bg-[color-mix(in_srgb,var(--bg)_72%,var(--surface))]"
                        : "cursor-pointer hover:bg-[var(--surface-2)]"
                    }`}
                    type="button"
                  />
                );
              })}

              {isLoading
                ? getLoadingMeetingBlocks(dayIndex, view).map((block, index) => (
                    <MeetingTimelineSkeleton
                      key={`${dateKey}-timeline-skeleton-${index}`}
                      dateKey={dateKey}
                      index={index}
                      start={block.start}
                      end={block.end}
                    />
                  ))
                : dayMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onOpenMeeting={onOpenMeeting}
                      onToggleMenu={onToggleMenu}
                    />
                  ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
