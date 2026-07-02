import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { formatCalendarTitle } from "../../../../shared/utils/calendarGrid";
import type { ViewMode } from "../../types";
import { CALENDAR_VIEWS } from "../../utils";

type CalendarToolbarProps = {
  calendarDate: Date;
  eventCount: number;
  isCalendarLoading: boolean;
  view: ViewMode;
  onCreateEvent: () => void;
  onGoNext: () => void;
  onGoPrevious: () => void;
  onGoToday: () => void;
  onViewChange: (view: ViewMode) => void;
};

export function CalendarToolbar({
  calendarDate,
  eventCount,
  isCalendarLoading,
  view,
  onCreateEvent,
  onGoNext,
  onGoPrevious,
  onGoToday,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          onClick={onGoToday}
          className="w-full rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-semibold shadow-sm hover:bg-[var(--surface-2)] sm:w-auto"
          type="button"
        >
          Aujourd'hui
        </button>

        <div className="flex w-full overflow-hidden rounded-full border border-[var(--border)] shadow-sm sm:w-auto">
          <button
            onClick={onGoPrevious}
            className="flex-1 px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)] sm:flex-none"
            aria-label="Periode precedente"
            type="button"
          >
            ‹
          </button>
          <div className="h-8 w-px bg-[var(--border)]" />
          <button
            onClick={onGoNext}
            className="flex-1 px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)] sm:flex-none"
            aria-label="Periode suivante"
            type="button"
          >
            ›
          </button>
        </div>

        <div className="min-w-0">
          <h1 className="text-[16px] font-semibold capitalize tracking-tight sm:text-[17px]">
            {formatCalendarTitle(calendarDate, view)}
          </h1>
          <p className="mt-1 text-[12px] font-medium text-[var(--muted-soft)]">
            {isCalendarLoading ? (
              <span
                className="block h-3 w-24 animate-pulse rounded bg-[var(--surface-3)]"
                aria-hidden="true"
              />
            ) : (
              <>
                {eventCount} evenement
                {eventCount > 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid w-full grid-cols-4 items-center rounded-full border border-[var(--border)] p-1 shadow-sm sm:flex sm:w-auto">
          {CALENDAR_VIEWS.map((calendarView) => (
            <button
              key={calendarView.value}
              onClick={() => onViewChange(calendarView.value)}
              className={`min-w-0 rounded-full px-2 py-2 text-[11px] font-semibold sm:px-4 ${
                view === calendarView.value
                  ? "bg-[var(--surface-2)] shadow-sm"
                  : "hover:bg-[var(--surface-2)]"
              }`}
              aria-pressed={view === calendarView.value}
              type="button"
            >
              {calendarView.label}
            </button>
          ))}
        </div>

        <PermissionGate permission={PERMISSIONS.USE_CALENDAR_PLANNING}>
          <button
            onClick={onCreateEvent}
            className="w-full rounded-full bg-[var(--text)] cursor-pointer px-4 py-2 text-[11px] font-semibold text-[var(--bg)] shadow-sm hover:opacity-90 sm:w-auto"
            type="button"
          >
            Creer un evenement
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}
