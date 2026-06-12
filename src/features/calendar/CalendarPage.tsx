import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Toast, { type ToastIntent } from "../../components/app/Toast/Toast";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
} from "../../shared/api/callendar";
import type { CalendarEvent } from "../../shared/api/callendar/types";
import { useUsersQuery } from "../../shared/api/users";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import type { User } from "../../shared/types";
import { Avatar, Icon } from "../../shared/ui";
import { CalendarEventDetailModal } from "./CalendarEventDetailModal";
import { CreateCalendarEventModal } from "./CreateCalendarEventModal";

dayjs.locale("fr");

type ViewMode = "list" | "month" | "week" | "day";

type CreateSlot = {
  endsAt: string;
  startsAt: string;
};

const calendarViews: Array<{ label: string; value: ViewMode }> = [
  { label: "Liste", value: "list" },
  { label: "Mois", value: "month" },
  { label: "Semaine", value: "week" },
  { label: "Jour", value: "day" },
];

const hourHeight = 72;
const startHour = 7;
const endHour = 22;

function toDateKey(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function getMonthGrid(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = getMonday(firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function formatTitle(date: Date, view: ViewMode) {
  if (view === "month") {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  if (view === "list") {
    return "Tous les evenements";
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: view === "day" ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayName(date: Date, short = false) {
  return date.toLocaleDateString("fr-FR", {
    weekday: short ? "short" : "long",
  });
}

function formatDayNumber(date: Date) {
  return String(date.getDate()).padStart(2, "0");
}

function getLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function buildDateTimeLocal(dateKey: string, time: string) {
  return `${dateKey}T${time}`;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    const responseMessage = maybeError.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return "Une erreur est survenue.";
}

function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

function getEventTypeLabel(event: CalendarEvent) {
  return event.type === "MEETING" ? "Reunion" : "Evenement";
}

export function CalendarPage() {
  const today = new Date();
  const eventsQuery = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();

  const [calendarDate, setCalendarDate] = useState(today);
  const [view, setView] = useState<ViewMode>("week");
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [participantEvent, setParticipantEvent] =
    useState<CalendarEvent | null>(null);
  const [toast, setToast] = useState<{
    intent: ToastIntent;
    message: string;
    show: boolean;
  }>({
    intent: "success",
    message: "",
    show: false,
  });

  const calendarEvents = useMemo(
    () => eventsQuery.data ?? [],
    [eventsQuery.data],
  );
  const isCalendarLoading =
    eventsQuery.isPending ||
    eventsQuery.isLoading ||
    (!eventsQuery.isSuccess && eventsQuery.isFetching);

  const hours = useMemo(
    () =>
      Array.from(
        { length: endHour - startHour + 1 },
        (_, index) => `${String(startHour + index).padStart(2, "0")}:00`,
      ),
    [],
  );

  const weekDays = useMemo(() => {
    const monday = getMonday(calendarDate);
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [calendarDate]);

  const monthDays = useMemo(() => getMonthGrid(calendarDate), [calendarDate]);
  const selectedDateKey = toDateKey(calendarDate);
  const visibleDays = view === "day" ? [calendarDate] : weekDays;
  const calendarGridClass =
    view === "day"
      ? "grid-cols-[58px_minmax(240px,1fr)] sm:grid-cols-[74px_minmax(260px,1fr)]"
      : "grid-cols-[58px_repeat(7,minmax(104px,1fr))] sm:grid-cols-[74px_repeat(7,minmax(132px,1fr))]";
  const calendarTimelineMinWidth =
    view === "day" ? "min-w-[320px] sm:min-w-[334px]" : "min-w-[790px] sm:min-w-[998px]";

  const selectedDayEvents = useMemo(
    () =>
      sortEvents(
        calendarEvents.filter((event) => toDateKey(event.start) === selectedDateKey),
      ),
    [calendarEvents, selectedDateKey],
  );

  const allEvents = useMemo(() => sortEvents(calendarEvents), [calendarEvents]);

  function showToast(intent: ToastIntent, message: string) {
    setToast({ intent, message, show: true });

    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 4000);
  }

  function getTop(event: CalendarEvent) {
    return Math.max(
      0,
      ((timeToMinutes(getLocalTime(event.start)) - startHour * 60) / 60) *
        hourHeight,
    );
  }

  function getHeight(event: CalendarEvent) {
    return Math.max(
      34,
      ((event.end.getTime() - event.start.getTime()) / 3600000) * hourHeight,
    );
  }

  function getLoadingEventBlocks(dayIndex: number) {
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

  function getSkeletonTop(start: string) {
    return Math.max(
      0,
      ((timeToMinutes(start) - startHour * 60) / 60) * hourHeight,
    );
  }

  function getSkeletonHeight(start: string, end: string) {
    return Math.max(
      34,
      ((timeToMinutes(end) - timeToMinutes(start)) / 60) * hourHeight,
    );
  }

  function getMonthSkeletonCount(day: Date) {
    return day.getDate() % 3 === 0 ? 2 : 1;
  }

  function openCreateModal(dateKey = selectedDateKey, hour = "09:00") {
    const hourNumber = Number(hour.split(":")[0]);
    const nextHour = `${String(Math.min(hourNumber + 1, 23)).padStart(2, "0")}:00`;

    setCreateSlot({
      startsAt: buildDateTimeLocal(dateKey, hour),
      endsAt: buildDateTimeLocal(dateKey, nextHour),
    });
  }

  function openEventDetail(event: CalendarEvent) {
    setCalendarDate(event.start);
    setSelectedEvent(event);
  }

  function openParticipantsModal(event: CalendarEvent) {
    updateEventMutation.reset();
    setSelectedEvent(null);
    setParticipantEvent(event);
  }

  async function handleCreateEvent(event: {
    endsAt: string;
    startsAt: string;
    title: string;
  }) {
    try {
      await createEventMutation.mutateAsync({
        endsAt: event.endsAt,
        location: null,
        participantIds: [],
        startsAt: event.startsAt,
        title: event.title,
      });

      setCreateSlot(null);
      showToast("success", "Evenement cree avec succes");
    } catch (error) {
      console.error("Erreur creation evenement :", error);
      showToast("error", getErrorMessage(error));
    }
  }

  async function handleUpdateParticipants(
    event: CalendarEvent,
    participantIds: string[],
  ) {
    try {
      await updateEventMutation.mutateAsync({
        id: event.id,
        request: {
          participantIds,
        },
      });

      setParticipantEvent(null);
      showToast("success", "Participants mis a jour");
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  }

  function goToday() {
    setCalendarDate(new Date());
  }

  function goPrevious() {
    if (view === "month") setCalendarDate(addMonths(calendarDate, -1));
    else if (view === "day") setCalendarDate(addDays(calendarDate, -1));
    else setCalendarDate(addDays(calendarDate, -7));
  }

  function goNext() {
    if (view === "month") setCalendarDate(addMonths(calendarDate, 1));
    else if (view === "day") setCalendarDate(addDays(calendarDate, 1));
    else setCalendarDate(addDays(calendarDate, 7));
  }

  function renderEventCard(event: CalendarEvent, absolute = true) {
    const eventColor = event.color || "#5B6CFF";

    return (
      <button
        key={event.id}
        className={`${absolute ? "absolute left-[8px] right-[8px] z-20" : "relative"} overflow-hidden rounded-[7px] border-l-4 px-2 py-[6px] pr-8 text-left shadow-sm transition hover:brightness-[0.98]`}
        style={
          absolute
            ? {
                top: getTop(event),
                height: getHeight(event),
                backgroundColor: `${eventColor}26`,
                borderLeftColor: eventColor,
                color: eventColor,
              }
            : {
                backgroundColor: `${eventColor}18`,
                borderLeftColor: eventColor,
                color: eventColor,
              }
        }
        onClick={() => openEventDetail(event)}
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

  return (
    <div className="flex h-full min-h-[calc(100dvh-132px)] w-full bg-[var(--bg)] p-2 text-[13px] text-[var(--text)] sm:min-h-0 sm:p-4">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      <div className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-[var(--shadow)] sm:rounded-[18px] sm:px-6 sm:py-5">
        <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={goToday}
              className="w-full rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-semibold shadow-sm hover:bg-[var(--surface-2)] sm:w-auto"
              type="button"
            >
              Aujourd'hui
            </button>

            <div className="flex w-full overflow-hidden rounded-full border border-[var(--border)] shadow-sm sm:w-auto">
              <button
                onClick={goPrevious}
                className="flex-1 px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)] sm:flex-none"
                aria-label="Periode precedente"
                type="button"
              >
                ‹
              </button>
              <div className="h-8 w-px bg-[var(--border)]" />
              <button
                onClick={goNext}
                className="flex-1 px-4 py-2 text-[14px] leading-none hover:bg-[var(--surface-2)] sm:flex-none"
                aria-label="Periode suivante"
                type="button"
              >
                ›
              </button>
            </div>

            <div className="min-w-0">
              <h1 className="text-[16px] font-semibold capitalize tracking-tight sm:text-[17px]">
                {formatTitle(calendarDate, view)}
              </h1>
              <p className="mt-1 text-[12px] font-medium text-[var(--muted-soft)]">
                {isCalendarLoading ? (
                  <span
                    className="block h-3 w-24 animate-pulse rounded bg-[var(--surface-3)]"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    {calendarEvents.length} evenement
                    {calendarEvents.length > 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid w-full grid-cols-4 items-center rounded-full border border-[var(--border)] p-1 shadow-sm sm:flex sm:w-auto">
              {calendarViews.map((calendarView) => (
                <button
                  key={calendarView.value}
                  onClick={() => setView(calendarView.value)}
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
                onClick={() => openCreateModal()}
                className="w-full rounded-full bg-[var(--text)] cursor-pointer px-4 py-2 text-[11px] font-semibold text-[var(--bg)] shadow-sm hover:opacity-90 sm:w-auto"
                type="button"
              >
                Creer un evenement
              </button>
            </PermissionGate>
          </div>
        </div>

        {eventsQuery.isError ? (
          <div className="mt-4 shrink-0 rounded-[12px] border border-[color-mix(in_srgb,var(--red)_28%,var(--border))] bg-[var(--red-soft)] px-4 py-3 text-[12px] font-medium text-[var(--red)]">
            Impossible de charger le calendrier.
          </div>
        ) : null}

        {view === "month" ? (
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
                const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                const isSelected = dateKey === selectedDateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      setCalendarDate(day);
                      setView("day");
                    }}
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

                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded border-l-4 px-2 py-1 text-[11px] font-semibold text-[var(--text)]"
                          style={{
                            backgroundColor: `${event.color}22`,
                            borderLeftColor: event.color,
                          }}
                        >
                          <button
                            onClick={(mouseEvent) => {
                              mouseEvent.stopPropagation();
                              openEventDetail(event);
                            }}
                            className="block w-full truncate text-left"
                            type="button"
                          >
                            {getLocalTime(event.start)} · {event.title}
                          </button>
                        </div>
                      ))}

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
        ) : view === "list" ? (
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
                allEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative rounded-[12px] cursor-pointer border border-[var(--border)] bg-[var(--surface)] px-4 py-3 pr-12 hover:bg-[var(--surface-2)]"
                  >
                    <button
                      onClick={() => openEventDetail(event)}
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
                ))
              )}
            </div>
          </div>
        ) : (
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
                    onClick={() => setCalendarDate(day)}
                    className="flex h-11 items-center justify-center gap-1 border-r border-[var(--border)] text-[11px] font-semibold capitalize last:border-r-0 hover:bg-[var(--surface-2)] sm:gap-2 sm:text-[12px]"
                    type="button"
                  >
                    <span className="truncate">{formatDayName(day)}</span>
                    <span
                      className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        active
                          ? "bg-[#168cf0] text-white"
                          : "text-[var(--text)]"
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
                        onClick={() => openCreateModal(dateKey, hour)}
                        className="block h-[72px] w-full cursor-pointer border-b border-[var(--border)] text-left hover:bg-[var(--surface-2)]"
                        type="button"
                      />
                    ))}

                    {isCalendarLoading
                      ? getLoadingEventBlocks(dayIndex).map((block, index) => (
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
                            <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-[var(--surface)]" />
                            <div className="mt-2 h-2.5 w-4/5 animate-pulse rounded bg-[var(--surface)]" />
                          </div>
                        ))
                      : dayEvents.map((event) => renderEventCard(event))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCalendarLoading ? (
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
        ) : selectedDayEvents.length > 0 ? (
          <div className="mt-3 shrink-0 overflow-x-auto border-t border-[var(--border)] pt-3">
            <div className="flex gap-2">
              {selectedDayEvents.slice(0, 6).map((event) => (
                <button
                  key={event.id}
                  className="min-w-[190px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-[12px] shadow-sm hover:bg-[var(--surface-2)]"
                  type="button"
                  onClick={() => openEventDetail(event)}
                >
                  <strong className="block truncate">{event.title}</strong>
                  <span className="mt-1 block text-[11px] font-semibold text-[var(--muted-soft)]">
                    {getLocalTime(event.start)} - {getLocalTime(event.end)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <CreateCalendarEventModal
        open={Boolean(createSlot)}
        initialEndsAt={createSlot?.endsAt}
        initialStartsAt={createSlot?.startsAt}
        onClose={() => setCreateSlot(null)}
        onCreate={handleCreateEvent}
      />

      <CalendarEventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onManageParticipants={openParticipantsModal}
      />

      {participantEvent ? (
        <CalendarParticipantsModal
          event={participantEvent}
          error={updateEventMutation.error}
          isSaving={updateEventMutation.isPending}
          onClose={() => {
            updateEventMutation.reset();
            setParticipantEvent(null);
          }}
          onSave={(participantIds) =>
            handleUpdateParticipants(participantEvent, participantIds)
          }
        />
      ) : null}
    </div>
  );
}

type CalendarParticipantsModalProps = {
  error: Error | null;
  event: CalendarEvent;
  isSaving: boolean;
  onClose: () => void;
  onSave: (participantIds: string[]) => Promise<void>;
};

function CalendarParticipantsModal({
  error,
  event,
  isSaving,
  onClose,
  onSave,
}: CalendarParticipantsModalProps) {
  const usersQuery = useUsersQuery();
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    event.participants.map((participant) => participant.id),
  );

  useEffect(() => {
    setQuery("");
    setSelectedIds(event.participants.map((participant) => participant.id));
  }, [event]);

  const filteredUsers = useMemo(() => {
    const value = normalizeSearch(query.trim());

    if (!value) return users;

    return users.filter((user) => {
      const searchable = normalizeSearch(
        [user.name, user.email, user.role, user.team, user.status].join(" "),
      );

      return searchable.includes(value);
    });
  }, [query, users]);

  const selectedUsers = useMemo(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));

    return selectedIds
      .map((id) => {
        const user = usersById.get(id);

        if (user) return user;

        const participant = event.participants.find((item) => item.id === id);

        if (!participant) return null;

        return {
          adminRole: "member",
          email: participant.email,
          id: participant.id,
          name: `${participant.firstName} ${participant.lastName}`.trim(),
          presence: "online",
          role: "Participant",
          status: "Ajoute",
          team: "Calendrier",
        } satisfies User;
      })
      .filter((user): user is User => Boolean(user));
  }, [event.participants, selectedIds, users]);

  function toggleParticipant(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function handleClose() {
    if (isSaving) return;
    onClose();
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    onSave(selectedIds).catch(() => undefined);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="note-modal-overlay"
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onMouseDown={handleClose}
      >
        <motion.section
          className="note-modal calendar-note-modal calendar-participants-modal"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        >
          <header>
            <div>
              <h2>Ajouter participant</h2>
              <span>{event.title}</span>
            </div>

            <button
              className="icon-button"
              type="button"
              disabled={isSaving}
              onClick={handleClose}
            >
              <Icon name="x" size={16} />
            </button>
          </header>

          <form className="calendar-event-form" onSubmit={handleSubmit}>
            <div className="calendar-field">
              <span>Participants</span>

              <div className="calendar-participant-search">
                <Icon name="search" size={15} />
                <input
                  value={query}
                  onChange={(inputEvent) => setQuery(inputEvent.target.value)}
                  placeholder="Rechercher un utilisateur"
                  disabled={isSaving}
                />
              </div>

              {selectedUsers.length > 0 ? (
                <div className="calendar-selected-participants">
                  {selectedUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="calendar-selected-participant"
                      disabled={isSaving}
                      onClick={() => toggleParticipant(user.id)}
                    >
                      <Avatar
                        name={user.name}
                        size={24}
                        presence={user.presence}
                      />
                      <span>{user.name}</span>
                      <Icon name="x" size={12} />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="calendar-participant-list">
                {usersQuery.loading ? (
                  <div className="calendar-participant-empty">
                    Chargement des utilisateurs...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const selected = selectedIds.includes(user.id);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={isSaving}
                        className={
                          selected
                            ? "calendar-participant selected"
                            : "calendar-participant"
                        }
                        onClick={() => toggleParticipant(user.id)}
                      >
                        <Avatar
                          name={user.name}
                          size={32}
                          presence={user.presence}
                        />

                        <span>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </span>

                        <Icon name={selected ? "check" : "plus"} size={15} />
                      </button>
                    );
                  })
                ) : (
                  <div className="calendar-participant-empty">
                    Aucun utilisateur trouve
                  </div>
                )}
              </div>

              {error ? (
                <p className="calendar-form-error">{error.message}</p>
              ) : null}
            </div>

            <footer className="calendar-event-modal-actions">
              <button
                className="button ghost"
                type="button"
                disabled={isSaving}
                onClick={handleClose}
              >
                Annuler
              </button>

              <button
                className="button primary notes-submit"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </footer>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
