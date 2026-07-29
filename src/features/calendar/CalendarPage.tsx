import { useCallback, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Toast from "../../components/app/Toast/Toast";
import type { CalendarEvent } from "../../shared/api/callendar/types";
import {
  CalendarEventDetailModal,
  CalendarGrid,
  CalendarParticipantsModal,
  CalendarToolbar,
  CreateCalendarEventModal,
} from "./components";
import {
  CalendarEventContextMenu,
  type CalendarEventContextMenuState,
} from "./components/widgets/CalendarEventContextMenu";
import { useCalendarPage } from "./hooks/useCalendarPage";
import { isManagedCalendarEvent } from "./utils";

dayjs.locale("fr");

export function CalendarPage() {
  const {
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
    updateEventMutation,
    view,
    visibleDays,
    weekDays,
    closeParticipantsModal,
    goNext,
    goPrevious,
    goToday,
    handleCreateEvent,
    handleDeleteEvent,
    handleJoinMeeting,
    handleUpdateParticipants,
    openCreateModal,
    openEventDetail,
    openParticipantsModal,
    openDayView,
    selectDay,
    setCreateSlot,
    setSelectedEvent,
    setView,
  } = useCalendarPage();

  const [contextMenu, setContextMenu] =
    useState<CalendarEventContextMenuState | null>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const openEventContextMenu = useCallback(
    (event: CalendarEvent, clientX: number, clientY: number) => {
      if (!isManagedCalendarEvent(event)) return;
      setSelectedEvent(null);
      setContextMenu({ event, x: clientX, y: clientY });
    },
    [setSelectedEvent],
  );

  return (
    <div className="relative flex h-full min-h-[calc(100dvh-132px)] w-full bg-[var(--bg)] p-2 text-[13px] text-[var(--text)] sm:min-h-0 sm:p-4">
      {toast.show ? (
        <div className="calendar-toast-host" aria-live="polite">
          <Toast intent={toast.intent} message={toast.message} />
        </div>
      ) : null}

      <div className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-[var(--shadow)] sm:rounded-[18px] sm:px-6 sm:py-5">
        <CalendarToolbar
          calendarDate={calendarDate}
          eventCount={calendarEvents.length}
          isCalendarLoading={isCalendarLoading}
          view={view}
          onCreateEvent={() => openCreateModal()}
          onGoNext={goNext}
          onGoPrevious={goPrevious}
          onGoToday={goToday}
          onViewChange={setView}
        />

        {eventsQuery.isError ? (
          <div className="mt-4 shrink-0 rounded-[12px] border border-[color-mix(in_srgb,var(--red)_28%,var(--border))] bg-[var(--red-soft)] px-4 py-3 text-[12px] font-medium text-[var(--red)]">
            Impossible de charger le calendrier.
          </div>
        ) : null}

        <CalendarGrid
          allEvents={allEvents}
          calendarDate={calendarDate}
          calendarEvents={calendarEvents}
          calendarGridClass={calendarGridClass}
          calendarTimelineMinWidth={calendarTimelineMinWidth}
          isCalendarLoading={isCalendarLoading}
          monthDays={monthDays}
          selectedDateKey={selectedDateKey}
          selectedDayEvents={selectedDayEvents}
          view={view}
          visibleDays={visibleDays}
          weekDays={weekDays}
          onOpenCreateModal={openCreateModal}
          onOpenDayView={openDayView}
          onOpenEventDetail={openEventDetail}
          onEventContextMenu={openEventContextMenu}
          onSelectDay={selectDay}
        />
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
        isDeleting={deleteEventMutation.isPending}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onJoinMeeting={handleJoinMeeting}
        onManageParticipants={openParticipantsModal}
      />

      <CalendarEventContextMenu
        menu={contextMenu}
        isDeleting={deleteEventMutation.isPending}
        onClose={closeContextMenu}
        onDelete={handleDeleteEvent}
      />

      {participantEvent ? (
        <CalendarParticipantsModal
          event={participantEvent}
          error={updateEventMutation.error}
          isSaving={updateEventMutation.isPending}
          onClose={closeParticipantsModal}
          onSave={(participantIds) =>
            handleUpdateParticipants(participantEvent, participantIds)
          }
        />
      ) : null}
    </div>
  );
}
