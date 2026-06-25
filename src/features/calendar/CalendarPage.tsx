import dayjs from "dayjs";
import "dayjs/locale/fr";
import Toast from "../../components/app/Toast/Toast";
import {
  CalendarEventDetailModal,
  CalendarGrid,
  CalendarParticipantsModal,
  CalendarToolbar,
  CreateCalendarEventModal,
} from "./components";
import { useCalendarPage } from "./hooks/useCalendarPage";

dayjs.locale("fr");

export function CalendarPage() {
  const {
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
  } = useCalendarPage();

  return (
    <div className="flex h-full min-h-[calc(100dvh-132px)] w-full bg-[var(--bg)] p-2 text-[13px] text-[var(--text)] sm:min-h-0 sm:p-4">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
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
        onClose={() => setSelectedEvent(null)}
        onManageParticipants={openParticipantsModal}
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
