import {
  getCalendarHeight,
  getCalendarTop,
} from "../../../../shared/utils/calendarGrid";
import type { ViewMode } from "../../types";

export function getLoadingMeetingBlocks(dayIndex: number, view: ViewMode) {
  const blocks = [
    { start: "09:00", end: "10:00" },
    { start: "11:30", end: "12:30" },
    { start: "14:00", end: "15:30" },
  ];

  if (view === "day") {
    return blocks;
  }

  return blocks.filter((_, index) => (dayIndex + index) % 2 === 0);
}

export function getMonthSkeletonCount(day: Date) {
  return day.getDate() % 3 === 0 ? 2 : 1;
}

type TimelineSkeletonProps = {
  dateKey: string;
  index: number;
  start: string;
  end: string;
};

export function MeetingTimelineSkeleton({
  dateKey,
  index,
  start,
  end,
}: TimelineSkeletonProps) {
  return (
    <div
      key={`${dateKey}-timeline-skeleton-${index}`}
      className="absolute left-[8px] right-[8px] z-20 overflow-hidden rounded-[7px] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-[7px] shadow-sm"
      style={{
        top: getCalendarTop(start),
        height: getCalendarHeight(start, end),
      }}
      aria-hidden="true"
    >
      <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--surface-3)]" />
      <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-[var(--surface)]" />
      <div className="mt-2 h-2.5 w-4/5 animate-pulse rounded bg-[var(--surface)]" />
    </div>
  );
}

export function MeetingMonthSkeleton({
  dateKey,
  index,
}: {
  dateKey: string;
  index: number;
}) {
  return (
    <div
      key={`${dateKey}-meeting-skeleton-${index}`}
      className="h-[24px] animate-pulse rounded bg-[var(--surface-2)]"
    />
  );
}

export function MeetingListSkeleton({ index }: { index: number }) {
  return (
    <div
      key={`meeting-list-skeleton-${index}`}
      className="relative rounded-[12px] border border-[var(--border)] px-4 py-3 pr-12"
      aria-hidden="true"
    >
      <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--surface-3)]" />
      <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-[var(--surface-2)]" />
      <div className="absolute right-3 top-3 h-7 w-7 animate-pulse rounded-full bg-[var(--surface-2)]" />
    </div>
  );
}
