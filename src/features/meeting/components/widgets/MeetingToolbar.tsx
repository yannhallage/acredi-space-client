import type { ViewMode } from "../../types";
import { formatMeetingTitle, isPastDateTime } from "../../utils";

type MeetingToolbarProps = {
  view: ViewMode;
  selectedDate: Date;
  selectedDateKey: string;
  onGoToday: () => void;
  onGoPrevious: () => void;
  onGoNext: () => void;
  onViewChange: (view: ViewMode) => void;
  onCreateMeeting: () => void;
  onPastDateWarning: (message: string) => void;
};

export function MeetingToolbar({
  view,
  selectedDate,
  selectedDateKey,
  onGoToday,
  onGoPrevious,
  onGoNext,
  onViewChange,
  onCreateMeeting,
  onPastDateWarning,
}: MeetingToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onGoToday}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-semibold shadow-sm hover:bg-[var(--surface-2)]"
          type="button"
        >
          Aujourd'hui
        </button>

        <div className="flex overflow-hidden rounded-full border border-[var(--border)] shadow-sm">
          <button
            onClick={onGoPrevious}
            className="px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)]"
            type="button"
          >
            ‹
          </button>
          <div className="h-8 w-px bg-[var(--border)]" />
          <button
            onClick={onGoNext}
            className="px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)]"
            type="button"
          >
            ›
          </button>
        </div>

        <h1 className="text-[16px] font-semibold capitalize tracking-tight sm:text-[17px]">
          {formatMeetingTitle(selectedDate, view)}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-full border border-[var(--border)] p-1 shadow-sm">
          {(["list", "month", "week", "day"] as ViewMode[]).map((item) => (
            <button
              key={item}
              onClick={() => onViewChange(item)}
              className={`rounded-full px-3 py-2 text-[11px] font-semibold sm:px-4 ${
                view === item
                  ? "bg-[var(--surface-2)] shadow-sm"
                  : "hover:bg-[var(--surface-2)]"
              }`}
              type="button"
            >
              {item === "list"
                ? "Liste"
                : item === "month"
                  ? "Mois"
                  : item === "week"
                    ? "Semaine"
                    : "Jour"}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (isPastDateTime(selectedDateKey, "09:00")) {
              onPastDateWarning(
                "Sélectionne une date future pour créer une réunion.",
              );
              return;
            }
            onCreateMeeting();
          }}
          className="rounded-full bg-[var(--text)] px-4 py-2 text-[11px] font-semibold text-[var(--bg)] shadow-sm hover:opacity-90"
          type="button"
        >
          Créer une réunion
        </button>
      </div>
    </div>
  );
}
