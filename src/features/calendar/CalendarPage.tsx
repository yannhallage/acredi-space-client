import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Calendar,
  dayjsLocalizer,
  type EventPropGetter,
  type View,
} from "react-big-calendar";
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
import type { User } from "../../shared/types";
import { Avatar, Icon, LoadingState } from "../../shared/ui";
import { CreateCalendarEventModal } from "./CreateCalendarEventModal";
import { AnimatePresence, motion } from "framer-motion";

dayjs.locale("fr");

const localizer = dayjsLocalizer(dayjs);

const calendarViews: Array<{ label: string; value: View }> = [
  { label: "Mois", value: "month" },
  { label: "Semaine", value: "week" },
  { label: "Jour", value: "day" },
  { label: "Agenda", value: "agenda" },
];

const calendars = [
  { name: "Mes evenements", color: "#5B6CFF" },
  { name: "Reunions", color: "#22C55E" },
];

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

export function CalendarPage() {
  const today = new Date();
  const eventsQuery = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  
  const [calendarDate, setCalendarDate] = useState(today);
  const [view, setView] = useState<View>("month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    [eventsQuery.data]
  );

  const agendaEvents = calendarEvents.filter((event) =>
    dayjs(event.start).isSame(calendarDate, "day")
  );

  const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => ({
    style: {
      backgroundColor: `${event.color}22`,
      borderLeft: `3px solid ${event.color}`,
      color: event.color,
    },
  });

  function showToast(intent: ToastIntent, message: string) {
    setToast({ intent, message, show: true });

    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 4000);
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

      setIsCreateOpen(false);
      showToast("success", "Evenement cree avec succes");
    } catch (error) {
      console.error("Erreur creation evenement :", error);
      showToast("error", getErrorMessage(error));
    }
  }

  async function handleUpdateParticipants(
    event: CalendarEvent,
    participantIds: string[]
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

  if (eventsQuery.isLoading) {
    return <LoadingState label="Chargement du calendrier..." />;
  }

  const agendaDate = dayjs(calendarDate);
  const agendaTitle = agendaDate.isSame(today, "day")
    ? "Aujourd'hui"
    : "Jour selectionne";

  return (
    <div className="calendar-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      <section className="calendar-main">
        <header className="calendar-toolbar">
          <div>
            <h1>{dayjs(calendarDate).format("MMMM YYYY")}</h1>
            <p>{calendarEvents.length} evenement(s) dans le calendrier.</p>
          </div>

          <div className="calendar-controls">
            <button
              className="icon-button bordered"
              type="button"
              aria-label="Periode precedente"
              onClick={() =>
                setCalendarDate(
                  dayjs(calendarDate)
                    .subtract(1, view === "month" ? "month" : "week")
                    .toDate()
                )
              }
            >
              <Icon name="arrowLeft" size={14} />
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => setCalendarDate(today)}
            >
              Aujourd'hui
            </button>

            <button
              className="icon-button bordered"
              type="button"
              aria-label="Periode suivante"
              onClick={() =>
                setCalendarDate(
                  dayjs(calendarDate)
                    .add(1, view === "month" ? "month" : "week")
                    .toDate()
                )
              }
            >
              <Icon name="chevRight" size={14} />
            </button>

            <div className="calendar-view-switch">
              {calendarViews.map((calendarView) => (
                <button
                  key={calendarView.value}
                  className={view === calendarView.value ? "active" : ""}
                  type="button"
                  aria-pressed={view === calendarView.value}
                  onClick={() => setView(calendarView.value)}
                >
                  {calendarView.label}
                </button>
              ))}
            </div>

            <button
              className="button primary"
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              <Icon name="plus" size={14} />
              Creer
            </button>
          </div>
        </header>

        {eventsQuery.isError ? (
          <div className="calendar-empty">
            <Icon name="calendar" size={22} />
            <strong>Erreur lors du chargement</strong>
          </div>
        ) : null}

        <div className="calendar-rbc">
          <Calendar<CalendarEvent>
            culture="fr"
            date={calendarDate}
            dayPropGetter={(date) =>
              dayjs(date).isSame(calendarDate, "day")
                ? { className: "calendar-selected-day" }
                : {}
            }
            endAccessor="end"
            eventPropGetter={eventPropGetter}
            events={calendarEvents}
            getNow={() => today}
            localizer={localizer}
            messages={{
              agenda: "Agenda",
              allDay: "Journee",
              date: "Date",
              day: "Jour",
              event: "Evenement",
              month: "Mois",
              next: "Suivant",
              noEventsInRange: "Aucun evenement sur cette periode.",
              previous: "Precedent",
              showMore: (total) => `+${total}`,
              time: "Heure",
              today: "Aujourd'hui",
              week: "Semaine",
            }}
            onNavigate={setCalendarDate}
            onSelectEvent={(event) => setCalendarDate(event.start)}
            onSelectSlot={(slot) => setCalendarDate(slot.start)}
            onView={setView}
            popup
            selectable
            startAccessor="start"
            titleAccessor={(event) =>
              `${dayjs(event.start).format("HH:mm")} ${event.title}`
            }
            toolbar={false}
            view={view}
            views={["month", "week", "day", "agenda"]}
          />
        </div>
      </section>

      <aside className="calendar-side">
        <p className="eyebrow">
          {agendaTitle} - {agendaDate.format("dddd D MMMM")}
        </p>

        <h2>{agendaEvents.length} evenement(s)</h2>

        <div className="today-agenda">
          {agendaEvents.length > 0 ? (
            agendaEvents.slice(0, 3).map((event) => (
              <article
                key={event.id}
                className="agenda-card"
                style={{ borderColor: event.color }}
              >
                <header>
                  <strong>{event.title}</strong>
                  <span>{event.type}</span>
                </header>

                <small>
                  {dayjs(event.start).format("HH:mm")} -{" "}
                  {dayjs(event.end).format("HH:mm")}
                </small>

                <small>
                  {event.participants.length} participant
                  {event.participants.length > 1 ? "s" : ""}
                </small>

                <div className="calendar-event-avatars">
                  {event.participants.slice(0, 3).map((participant) => (
                    <Avatar
                      key={participant.id}
                      name={`${participant.firstName} ${participant.lastName}`}
                      size={24}
                      ring="var(--surface)"
                    />
                  ))}

                  {event.participants.length > 3 ? (
                    <span>+{event.participants.length - 3}</span>
                  ) : null}
                </div>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    updateEventMutation.reset();
                    setParticipantEvent(event);
                  }}
                >
                  Ajouter participant
                </button>
              </article>
            ))
          ) : (
            <div className="calendar-empty">
              <Icon name="calendar" size={22} />
              <strong>Aucun evenement</strong>
            </div>
          )}
        </div>

        <div className="calendar-list">
          <p className="section-label">Calendriers</p>

          {calendars.map((calendar) => (
            <label key={calendar.name}>
              <input type="checkbox" defaultChecked />
              <span style={{ background: calendar.color }} />
              {calendar.name}
            </label>
          ))}
        </div>
      </aside>

      <CreateCalendarEventModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateEvent}
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
          onMouseDown={(event) => event.stopPropagation()}
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
                    Aucun utilisateur trouvé
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
