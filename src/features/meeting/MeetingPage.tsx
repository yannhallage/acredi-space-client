import { motion } from "framer-motion";
import Toast from "../../components/app/Toast/Toast";
import { Icon } from "../../shared/ui";
import {
  MeetingFormModal,
  MeetingNewMeetingMenu,
  MeetingOptionsMenu,
  MeetingParticipantsModal,
  MeetingStageVisual,
} from "./components";
import { useMeetingPage } from "./hooks/useMeetingPage";

export default function MeetingPage() {
  const {
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
    isStartingInstant,
    newMeetingMenuOpen,
    setNewMeetingMenuOpen,
    menuPosition,
    addParticipantsOpen,
    selectedMeetingForParticipants,
    participantSearch,
    setParticipantSearch,
    invitingUserId,
    usersLoading,
    usersError,
    currentMeetingForMenu,
    visibleUsers,
    openCreateModal,
    openEditModal,
    saveMeeting,
    startInstantMeeting,
    scheduleInCalendar,
    endMeeting,
    handleAddParticipants,
    handleInviteParticipant,
    openMeetingRoom,
    isMeetingActionLoading,
    closeParticipantsModal,
    refetchUsers,
  } = useMeetingPage();

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden text-[var(--text)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 0% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%), radial-gradient(ellipse 50% 40% at 100% 20%, color-mix(in srgb, var(--accent-2) 10%, transparent), transparent 55%), var(--bg)",
        }}
      />

      <div className="relative mx-auto grid h-full min-h-0 w-full max-w-[1120px] grid-cols-1 items-center gap-6 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:py-6">
        <motion.div
          className="flex min-h-0 flex-col justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
            Visio
          </p>

          <h1 className="mt-3 text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text)] sm:text-[48px]">
            Acredi Meet
          </h1>

          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-[var(--muted-soft)] sm:text-[15px]">
            Lancez une salle, invitez votre équipe, et restez focus sur
            l&apos;échange — sans friction.
          </p>

          <div className="relative mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setNewMeetingMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2.5 rounded-[12px] bg-[var(--text)] px-5 py-3 text-[13px] font-semibold text-[var(--bg)] transition hover:opacity-90"
            >
              <Icon name="video" size={16} />
              Nouvelle réunion
              <Icon
                name="chevDown"
                size={14}
                className={`transition ${newMeetingMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => void startInstantMeeting()}
              disabled={isStartingInstant}
              className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              {isStartingInstant ? "Connexion..." : "Démarrer"}
            </button>

            <MeetingNewMeetingMenu
              open={newMeetingMenuOpen}
              onClose={() => setNewMeetingMenuOpen(false)}
              onCreateForLater={openCreateModal}
              onStartInstant={() => void startInstantMeeting()}
              onSchedule={scheduleInCalendar}
              isStartingInstant={isStartingInstant}
            />
          </div>

          <p className="mt-4 flex items-center gap-2 text-[12px] text-[var(--muted)]">
            <Icon name="lock" size={13} />
            Accès sur invitation uniquement
          </p>
        </motion.div>

        <motion.div
          className="h-full min-h-0 max-h-[min(100%,520px)] w-full lg:max-h-none"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <MeetingStageVisual
            meetings={meetings}
            isLoading={isMeetingsLoading}
            onOpenMeeting={openMeetingRoom}
          />
        </motion.div>
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
          onEnd={() => editingMeeting && void endMeeting(editingMeeting.id)}
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
