import { useCallback, useMemo, useState } from "react";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
} from "../../../shared/api/callendar";
import type { CalendarEvent } from "../../../shared/api/callendar/types";
import {
  addDays,
  addMonths,
  buildDateTimeLocal,
  getMonthGrid,
  getNextHourSlot,
  getWeekDays,
  toDateKey,
} from "../../../shared/utils/calendarGrid";
import type { CreateSlot, ToastState, ViewMode } from "../types";
import { getErrorMessage, sortEvents } from "../utils";

export function useCalendarPage() {
  const today = new Date();
  const eventsQuery = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();

  const [calendarDate, setCalendarDate] = useState(today);
  const [view, setView] = useState<ViewMode>("week");
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [participantEvent, setParticipantEvent] =
    useState<CalendarEvent | null>(null);
  const [toast, setToast] = useState<ToastState>({
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

  const weekDays = useMemo(() => getWeekDays(calendarDate), [calendarDate]);
  const monthDays = useMemo(() => getMonthGrid(calendarDate), [calendarDate]);
  const selectedDateKey = toDateKey(calendarDate);
  const visibleDays = view === "day" ? [calendarDate] : weekDays;
  const calendarGridClass =
    view === "day"
      ? "grid-cols-[58px_minmax(240px,1fr)] sm:grid-cols-[74px_minmax(260px,1fr)]"
      : "grid-cols-[58px_repeat(7,minmax(104px,1fr))] sm:grid-cols-[74px_repeat(7,minmax(132px,1fr))]";
  const calendarTimelineMinWidth =
    view === "day"
      ? "min-w-[320px] sm:min-w-[334px]"
      : "min-w-[790px] sm:min-w-[998px]";

  const selectedDayEvents = useMemo(
    () =>
      sortEvents(
        calendarEvents.filter(
          (event) => toDateKey(event.start) === selectedDateKey,
        ),
      ),
    [calendarEvents, selectedDateKey],
  );

  const allEvents = useMemo(() => sortEvents(calendarEvents), [calendarEvents]);

  const showToast = useCallback(
    (intent: ToastState["intent"], message: string) => {
      setToast({ intent, message, show: true });

      window.setTimeout(() => {
        setToast((current) => ({ ...current, show: false }));
      }, 4000);
    },
    [],
  );

  function openCreateModal(dateKey = selectedDateKey, hour = "09:00") {
    const nextSlot = getNextHourSlot(dateKey, hour);

    setCreateSlot({
      startsAt: buildDateTimeLocal(dateKey, hour),
      endsAt: buildDateTimeLocal(nextSlot.dateKey, nextSlot.time),
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

  function closeParticipantsModal() {
    updateEventMutation.reset();
    setParticipantEvent(null);
  }

  function selectDay(day: Date) {
    setCalendarDate(day);
  }

  function openDayView(day: Date) {
    setCalendarDate(day);
    setView("day");
  }

  return {
    allEvents,
    calendarDate,
    calendarEvents,
    calendarGridClass,
    calendarTimelineMinWidth,
    createSlot,
    eventsQuery,
    isCalendarLoading,
    monthDays,
    participantEvent,
    selectedDateKey,
    selectedDayEvents,
    selectedEvent,
    toast,
    updateEventMutation,
    view,
    visibleDays,
    weekDays,
    closeParticipantsModal,
    goNext,
    goPrevious,
    goToday,
    handleCreateEvent,
    handleUpdateParticipants,
    openCreateModal,
    openEventDetail,
    openParticipantsModal,
    openDayView,
    selectDay,
    setCreateSlot,
    setSelectedEvent,
    setView,
  };
}
