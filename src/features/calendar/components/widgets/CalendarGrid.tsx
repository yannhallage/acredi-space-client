import dayjs from "dayjs";
import type { CalendarEvent } from "../../../../shared/api/callendar/types";
import {
  eventColorSoftBackground,
  resolveEventColor,
} from "../../../../shared/api/callendar/normalizers";
import {
  addDays,
  formatDayName,
  formatDayNumber,
  getCalendarHours,
  getLocalTime,
  toDateKey,
} from "../../../../shared/utils/calendarGrid";
import type { ViewMode } from "../../types";
import {
  getEventHeight,
  getEventTop,
  getEventTypeLabel,
  getLoadingEventBlocks,
  getMonthSkeletonCount,
  getSkeletonHeight,
  getSkeletonTop,
  sortEvents,
} from "../../utils";

type CalendarGridProps = {
  allEvents: CalendarEvent[];
  calendarDate: Date;
  calendarEvents: CalendarEvent[];
  calendarGridClass: string;
  calendarTimelineMinWidth: string;
  isCalendarLoading: boolean;
  monthDays: Date[];
  selectedDateKey: string;
  selectedDayEvents: CalendarEvent[];
  view: ViewMode;
  visibleDays: Date[];
  weekDays: Date[];
  onOpenCreateModal: (dateKey?: string, hour?: string) => void;
  onOpenDayView: (day: Date) => void;
  onOpenEventDetail: (event: CalendarEvent) => void;
  onEventContextMenu: (event: CalendarEvent, clientX: number, clientY: number) => void;
  onSelectDay: (day: Date) => void;
};

function CalendarEventCard({
  event,
  absolute = true,
  onOpenEventDetail,
  onEventContextMenu,
}: {
  event: CalendarEvent;
  absolute?: boolean;
  onOpenEventDetail: (event: CalendarEvent) => void;
  onEventContextMenu: (event: CalendarEvent, clientX: number, clientY: number) => void;
}) {
  const eventColor = resolveEventColor(event.color, event.type);

  return (
    <button
      className={`${absolute ? "absolute left-[8px] right-[8px] z-20" : "relative"} overflow-hidden rounded-[7px] border-l-4 px-2 py-[6px] pr-8 text-left shadow-sm transition hover:brightness-[0.98]`}
      style={{
        ...(absolute
          ? {
              top: getEventTop(event),
              height: getEventHeight(event),
            }
          : {}),
        backgroundColor: eventColorSoftBackground(eventColor, absolute ? 0.16 : 0.1),
        borderLeftColor: eventColor,
      }}
      onClick={() => onOpenEventDetail(event)}
      onContextMenu={(mouseEvent) => {
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        onEventContextMenu(event, mouseEvent.clientX, mouseEvent.clientY);
      }}
      type="button"
    >
      <div className="truncate text-[12px] font-bold leading-[15px] text-[var(--text)]">
        {event.title}
      </div>
      <div className="truncate text-[11px] font-semibold leading-[14px] text-[var(--text)]">
        {getLocalTime(event.start)} - {getLocalTime(event.end)} ·{" "}
        {getEventTypeLabel(event)}
      </div>
      {event.location ? (
        <div className="mt-[2px] truncate text-[11px] font-medium leading-[14px] text-[var(--text)]">
          {event.location}
        </div>
      ) : null}
    </button>
  );
}

export function CalendarGrid({
  allEvents,
  calendarDate,
  calendarEvents,
  calendarGridClass,
  calendarTimelineMinWidth,
  isCalendarLoading,
  monthDays,
  selectedDateKey,
  selectedDayEvents,
  view,
  visibleDays,
  weekDays,
  onOpenCreateModal,
  onOpenDayView,
  onOpenEventDetail,
  onEventContextMenu,
  onSelectDay,
}: CalendarGridProps) {
  const hours = getCalendarHours();

  if (view === "month") {
    return (
      <>
        <div className="mt-4 min-h-0 flex-1 overflow-auto border-l border-t border-[var(--border)] sm:mt-5">
          <div className="grid min-h-full min-w-[640px] grid-rows-[36px_minmax(0,1fr)] sm:min-w-0">
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
                const dayEvents = sortEvents(
                  calendarEvents.filter(
                    (event) => toDateKey(event.start) === dateKey,
                  ),
                );
                const isCurrentMonth =
                  day.getMonth() === calendarDate.getMonth();
                const isSelected = dateKey === selectedDateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => onOpenDayView(day)}
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
                      {isCalendarLoading
                        ? Array.from({
                            length: getMonthSkeletonCount(day),
                          }).map((_, index) => (
                            <div
                              key={`${dateKey}-calendar-month-skeleton-${index}`}
                              className="h-[24px] animate-pulse rounded border-l-4 border-[var(--surface-3)] bg-[var(--surface-2)]"
                              aria-hidden="true"
                            />
                          ))
                        : null}

                      {dayEvents.slice(0, 3).map((event) => {
                        const eventColor = resolveEventColor(
                          event.color,
                          event.type,
                        );

                        return (
                        <div
                          key={event.id}
                          className="truncate rounded border-l-4 px-2 py-1 text-[11px] font-semibold text-[var(--text)]"
                          style={{
                            backgroundColor: eventColorSoftBackground(
                              eventColor,
                              0.14,
                            ),
                            borderLeftColor: eventColor,
                          }}
                        >
                          <button
                            onClick={(mouseEvent) => {
                              mouseEvent.stopPropagation();
                              onOpenEventDetail(event);
                            }}
                            onContextMenu={(mouseEvent) => {
                              mouseEvent.preventDefault();
                              mouseEvent.stopPropagation();
                              onEventContextMenu(
                                event,
                                mouseEvent.clientX,
                                mouseEvent.clientY,
                              );
                            }}
                            className="block w-full truncate text-left"
                            type="button"
                          >
                            {getLocalTime(event.start)} · {event.title}
                          </button>
                        </div>
                        );
                      })}

                      {dayEvents.length > 3 ? (
                        <p className="text-[11px] font-semibold text-[var(--muted-soft)]">
                          +{dayEvents.length - 3}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {renderDaySummary()}
      </>
    );
  }

  if (view === "list") {
    return (
      <>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-[var(--border)] pt-4">
          <div className="space-y-2">
            {isCalendarLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`calendar-list-skeleton-${index}`}
                  className="relative rounded-[12px] border border-[var(--border)] px-4 py-3 pr-12"
                  aria-hidden="true"
                >
                  <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--surface-3)]" />
                  <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-[var(--surface-2)]" />
                </div>
              ))
            ) : allEvents.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] p-8 text-center text-[13px] font-medium text-[var(--muted-soft)]">
                Aucun evenement pour le moment.
              </div>
            ) : (
              allEvents.map((event) => {
                const eventColor = resolveEventColor(event.color, event.type);

                return (
                <div
                  key={event.id}
                  className="relative rounded-[12px] cursor-pointer border border-[var(--border)] bg-[var(--surface)] px-4 py-3 pr-12 hover:bg-[var(--surface-2)]"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: eventColor,
                    backgroundColor: eventColorSoftBackground(eventColor, 0.08),
                  }}
                >
                  <button
                    onClick={() => onOpenEventDetail(event)}
                    onContextMenu={(mouseEvent) => {
                      mouseEvent.preventDefault();
                      onEventContextMenu(
                        event,
                        mouseEvent.clientX,
                        mouseEvent.clientY,
                      );
                    }}
                    className="block w-full text-left hover:opacity-80"
                    type="button"
                  >
                    <p className="text-[13px] font-bold">{event.title}</p>
                    <p className="text-[12px] font-medium text-[var(--muted-soft)]">
                      {dayjs(event.start).format("DD/MM/YYYY")} ·{" "}
                      {getLocalTime(event.start)} - {getLocalTime(event.end)} ·{" "}
                      {getEventTypeLabel(event)}
                    </p>
                  </button>
                </div>
                );
              })
            )}
          </div>
        </div>
        {renderDaySummary()}
      </>
    );
  }

  return (
    <>
      <div className="mt-4 min-h-0 flex-1 overflow-auto border-t border-[var(--border)] sm:mt-5">
        <div
          className={`sticky top-0 z-30 grid ${calendarTimelineMinWidth} ${calendarGridClass} border-b border-[var(--border)] bg-[var(--surface)]`}
        >
          <div className="h-11" />
          {visibleDays.map((day) => {
            const dateKey = toDateKey(day);
            const active = dateKey === selectedDateKey;

            return (
              <button
                key={dateKey}
                onClick={() => onSelectDay(day)}
                className="flex h-11 items-center justify-center gap-1 border-r border-[var(--border)] text-[11px] font-semibold capitalize last:border-r-0 hover:bg-[var(--surface-2)] sm:gap-2 sm:text-[12px]"
                type="button"
              >
                <span className="truncate">{formatDayName(day)}</span>
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
          className={`relative grid ${calendarTimelineMinWidth} ${calendarGridClass}`}
        >
          <div className="border-r border-[var(--border)]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[72px] pr-2 pt-2 text-right text-[11px] font-medium text-[var(--muted-soft)] sm:pr-3 sm:text-[12px]"
              >
                {hour}
              </div>
            ))}
          </div>

          {visibleDays.map((day, dayIndex) => {
            const dateKey = toDateKey(day);
            const dayEvents = sortEvents(
              calendarEvents.filter(
                (event) => toDateKey(event.start) === dateKey,
              ),
            );

            return (
              <div
                key={dateKey}
                className="relative min-w-[104px] border-r border-[var(--border)] last:border-r-0 sm:min-w-[132px]"
              >
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() =>
                      hour === "00:00"
                        ? onOpenCreateModal(toDateKey(addDays(day, 1)), hour)
                        : onOpenCreateModal(dateKey, hour)
                    }
                    className="block h-[72px] w-full cursor-pointer border-b border-[var(--border)] text-left hover:bg-[var(--surface-2)]"
                    type="button"
                  />
                ))}

                {isCalendarLoading
                  ? getLoadingEventBlocks(view, dayIndex).map((block, index) => (
                      <div
                        key={`${dateKey}-calendar-timeline-skeleton-${index}`}
                        className="absolute left-[8px] right-[8px] z-20 overflow-hidden rounded-[7px] border-l-4 border-[var(--surface-3)] bg-[var(--surface-2)] px-2 py-[7px] shadow-sm"
                        style={{
                          top: getSkeletonTop(block.start),
                          height: getSkeletonHeight(block.start, block.end),
                        }}
                        aria-hidden="true"
                      >
                        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--surface-3)]" />
                        <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-[var(--surface-2)]" />
                        <div className="mt-2 h-2.5 w-4/5 animate-pulse rounded bg-[var(--surface-2)]" />
                      </div>
                    ))
                  : dayEvents.map((event) => (
                      <CalendarEventCard
                        key={event.id}
                        event={event}
                        onOpenEventDetail={onOpenEventDetail}
                        onEventContextMenu={onEventContextMenu}
                      />
                    ))}
              </div>
            );
          })}
        </div>
      </div>
      {renderDaySummary()}
    </>
  );

  function renderDaySummary() {
    if (isCalendarLoading) {
      return (
        <div className="mt-3 shrink-0 overflow-x-auto border-t border-[var(--border)] pt-3">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`calendar-day-summary-skeleton-${index}`}
                className="min-w-[190px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-sm"
                aria-hidden="true"
              >
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-[var(--surface-3)]" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[var(--surface-2)]" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedDayEvents.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 shrink-0 overflow-x-auto border-t border-[var(--border)] pt-3">
        <div className="flex gap-2">
          {selectedDayEvents.slice(0, 6).map((event) => (
            <button
              key={event.id}
              className="min-w-[190px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-[12px] shadow-sm hover:bg-[var(--surface-2)]"
              type="button"
              onClick={() => onOpenEventDetail(event)}
              onContextMenu={(mouseEvent) => {
                mouseEvent.preventDefault();
                onEventContextMenu(
                  event,
                  mouseEvent.clientX,
                  mouseEvent.clientY,
                );
              }}
            >
              <strong className="block truncate">{event.title}</strong>
              <span className="mt-1 block text-[11px] font-semibold text-[var(--muted-soft)]">
                {getLocalTime(event.start)} - {getLocalTime(event.end)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
}
