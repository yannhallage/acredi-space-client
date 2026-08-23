import { useCallback, useMemo, useState } from "react";
import {
  useAddCalendarParticipants,
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
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
import { getErrorMessage, isManagedCalendarEvent, sortEvents } from "../utils";
import {
  buildMeetingRoomUrl,
  extractMeetingRoomName,
} from "../../../shared/api/meeting/room";

export function useCalendarPage() {
  const today = new Date();
  const eventsQuery = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();
  const addParticipantsMutation = useAddCalendarParticipants();

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
    addParticipantsMutation.reset();
    setSelectedEvent(null);
    setParticipantEvent(event);
  }

  async function handleCreateEvent(event: {
    allDay: boolean;
    color: string;
    createMeeting: boolean;
    description: string;
    endsAt: string;
    location: string;
    reminders: Array<{ method: "NOTIFICATION" | "EMAIL"; minutesBefore: number }>;
    startsAt: string;
    title: string;
  }) {
    try {
      await createEventMutation.mutateAsync({
        allDay: event.allDay,
        color: event.color,
        createMeeting: event.createMeeting,
        description: event.description || null,
        endsAt: event.endsAt,
        location: event.location || null,
        participantIds: [],
        reminders: event.reminders,
        startsAt: event.startsAt,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        title: event.title,
      });

      setCreateSlot(null);
      showToast(
        "success",
        event.createMeeting
          ? "Evenement et reunion crees avec succes"
          : "Evenement cree avec succes",
      );
    } catch (error) {
      console.error("Erreur creation evenement :", error);
      showToast("error", getErrorMessage(error));
    }
  }

  async function handleAddParticipants(
    event: CalendarEvent,
    participantIds: string[],
  ) {
    const existingIds = new Set(
      event.participants.map((participant) => participant.id),
    );
    const toAdd = participantIds.filter((id) => !existingIds.has(id));

    if (toAdd.length === 0) {
      setParticipantEvent(null);
      showToast("info", "Aucun nouveau participant a ajouter");
      return;
    }

    try {
      await addParticipantsMutation.mutateAsync({
        id: event.id,
        request: {
          participantIds: toAdd,
        },
      });

      setParticipantEvent(null);
      showToast("success", "Participants ajoutes");
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  }

  async function handleDeleteEvent(event: CalendarEvent) {
    if (!isManagedCalendarEvent(event)) {
      showToast("info", "Les reunions se suppriment depuis le module Reunion");
      return;
    }

    try {
      await deleteEventMutation.mutateAsync(event.id);
      setSelectedEvent(null);
      showToast(
        "success",
        `Evenement "${event.title}" supprime avec succes`,
      );
    } catch (error) {
      showToast(
        "error",
        `Echec de la suppression : ${getErrorMessage(error)}`,
      );
    }
  }

  function handleJoinMeeting(event: CalendarEvent) {
    const roomName =
      event.roomName ||
      extractMeetingRoomName(event.joinUrl) ||
      (event.type === "MEETING" && event.location
        ? extractMeetingRoomName(event.location) || event.location
        : null);

    if (roomName) {
      window.location.assign(buildMeetingRoomUrl(roomName));
      return;
    }

    if (event.joinUrl) {
      window.location.assign(event.joinUrl);
      return;
    }

    showToast("warning", "Lien de reunion indisponible pour cet evenement");
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
    addParticipantsMutation.reset();
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
    addParticipantsMutation,
    allEvents,
    calendarDate,
    calendarEvents,
    calendarGridClass,
    calendarTimelineMinWidth,
    createSlot,
    deleteEventMutation,
    eventsQuery,
    isCalendarLoading,
    monthDays,
    participantEvent,
    selectedDateKey,
    selectedDayEvents,
    selectedEvent,
    toast,
    view,
    visibleDays,
    weekDays,
    closeParticipantsModal,
    goNext,
    goPrevious,
    goToday,
    handleAddParticipants,
    handleCreateEvent,
    handleDeleteEvent,
    handleJoinMeeting,
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
