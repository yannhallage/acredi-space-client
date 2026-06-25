import Toast from "../../components/app/Toast/Toast";
import {
  MeetingDayView,
  MeetingFormModal,
  MeetingListView,
  MeetingMonthView,
  MeetingOptionsMenu,
  MeetingParticipantsModal,
  MeetingToolbar,
  MeetingWeekView,
} from "./components";
import { useMeetingPage } from "./hooks/useMeetingPage";

export default function MeetingPage() {
  const {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    openModal,
    setOpenModal,
    editingMeeting,
    form,
    setForm,
    formError,
    toast,
    meetings,
    isMeetingsLoading,
    isSaving,
    menuPosition,
    addParticipantsOpen,
    selectedMeetingForParticipants,
    participantSearch,
    setParticipantSearch,
    invitingUserId,
    usersLoading,
    usersError,
    weekDays,
    selectedDateKey,
    currentMeetingForMenu,
    visibleUsers,
    showToast,
    openCreateModal,
    openEditModal,
    saveMeeting,
    endMeeting,
    handleAddParticipants,
    handleInviteParticipant,
    openMeetingRoom,
    toggleMeetingMenu,
    isMeetingActionLoading,
    goToday,
    goPrevious,
    goNext,
    closeParticipantsModal,
    refetchUsers,
  } = useMeetingPage();

  return (
    <div className="flex h-full min-h-0 w-full bg-[var(--bg)] p-3 text-[13px] text-[var(--text)] sm:p-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow)] sm:px-6 sm:py-5">
        <MeetingToolbar
          view={view}
          selectedDate={selectedDate}
          selectedDateKey={selectedDateKey}
          onGoToday={goToday}
          onGoPrevious={goPrevious}
          onGoNext={goNext}
          onViewChange={setView}
          onCreateMeeting={() => openCreateModal()}
          onPastDateWarning={(message) => showToast("warning", message)}
        />

        {view === "month" ? (
          <MeetingMonthView
            selectedDate={selectedDate}
            selectedDateKey={selectedDateKey}
            meetings={meetings}
            isLoading={isMeetingsLoading}
            weekDays={weekDays}
            onSelectDay={(day) => {
              setSelectedDate(day);
              setView("day");
            }}
            onOpenMeeting={openMeetingRoom}
          />
        ) : view === "list" ? (
          <MeetingListView
            meetings={meetings}
            isLoading={isMeetingsLoading}
            onOpenMeeting={openMeetingRoom}
            onToggleMenu={toggleMeetingMenu}
          />
        ) : view === "day" ? (
          <MeetingDayView
            selectedDate={selectedDate}
            selectedDateKey={selectedDateKey}
            meetings={meetings}
            isLoading={isMeetingsLoading}
            onSelectDay={setSelectedDate}
            onCreateAtSlot={openCreateModal}
            onPastDateWarning={(message) => showToast("warning", message)}
            onOpenMeeting={openMeetingRoom}
            onToggleMenu={toggleMeetingMenu}
          />
        ) : (
          <MeetingWeekView
            view={view}
            visibleDays={weekDays}
            selectedDateKey={selectedDateKey}
            calendarGridClass="grid-cols-[74px_repeat(7,minmax(132px,1fr))]"
            meetings={meetings}
            isLoading={isMeetingsLoading}
            onSelectDay={setSelectedDate}
            onCreateAtSlot={openCreateModal}
            onPastDateWarning={(message) => showToast("warning", message)}
            onOpenMeeting={openMeetingRoom}
            onToggleMenu={toggleMeetingMenu}
          />
        )}
      </div>

      {currentMeetingForMenu && menuPosition && (
        <MeetingOptionsMenu
          meeting={currentMeetingForMenu}
          position={menuPosition}
          onOpenMeeting={openMeetingRoom}
          onAddParticipants={handleAddParticipants}
          onEdit={openEditModal}
        />
      )}

      {openModal && (
        <MeetingFormModal
          editingMeeting={editingMeeting}
          form={form}
          formError={formError}
          isSaving={isSaving}
          isEnding={
            editingMeeting
              ? isMeetingActionLoading("end", editingMeeting.id)
              : false
          }
          onClose={() => setOpenModal(false)}
          onFormChange={setForm}
          onSave={() => void saveMeeting()}
          onEnd={() =>
            editingMeeting && void endMeeting(editingMeeting.id)
          }
        />
      )}

      {addParticipantsOpen && selectedMeetingForParticipants && (
        <MeetingParticipantsModal
          meeting={selectedMeetingForParticipants}
          participantSearch={participantSearch}
          invitingUserId={invitingUserId}
          usersLoading={usersLoading}
          usersError={usersError}
          visibleUsers={visibleUsers}
          onClose={closeParticipantsModal}
          onSearchChange={setParticipantSearch}
          onRetryUsers={refetchUsers}
          onInvite={handleInviteParticipant}
        />
      )}

      {toast.show && (
        <Toast intent={toast.intent} message={toast.message} />
      )}
    </div>
  );
}
