import { useMemo, useState } from "react";
import {
  Calendar,
  dayjsLocalizer,
  type EventPropGetter,
  type View,
} from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Avatar, Icon, LoadingState } from "../../shared/ui";
import { CreateCalendarEventModal } from "./CreateCalendarEventModal";
import {
  useCalendarEvents,
  useCreateCalendarEvent,
} from "../../shared/api/callendar";
import type { CalendarEvent } from "../../shared/api/callendar/types";

dayjs.locale("fr");

const localizer = dayjsLocalizer(dayjs);

const calendarViews: Array<{ label: string; value: View }> = [
  { label: "Mois", value: "month" },
  { label: "Semaine", value: "week" },
  { label: "Jour", value: "day" },
  { label: "Agenda", value: "agenda" },
];

const calendars = [
  { name: "Mes événements", color: "#5B6CFF" },
  { name: "Réunions", color: "#22C55E" },
];

export function CalendarPage() {
  const today = new Date();
  const eventsQuery = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();

  const [calendarDate, setCalendarDate] = useState(today);
  const [view, setView] = useState<View>("month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

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
      color: event.color,
      borderLeft: `3px solid ${event.color}`,
    },
  });

  async function handleCreateEvent(event: {
    title: string;
    startsAt: string;
    endsAt: string;
    location: string;
    participantIds: string[];
  }) {
    try {
      await createEventMutation.mutateAsync({
        title: event.title,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        location: event.location || null,
        participantIds: event.participantIds,
      });

      setIsCreateOpen(false);
    } catch (error) {
      console.error("Erreur création événement :", error);
    }
  }

  if (eventsQuery.isLoading) {
    return <LoadingState label="Chargement du calendrier..." />;
  }

  const agendaDate = dayjs(calendarDate);
  const agendaTitle = agendaDate.isSame(today, "day")
    ? "Aujourd'hui"
    : "Jour sélectionné";

  return (
    <div className="calendar-page">
      <section className="calendar-main">
        <header className="calendar-toolbar">
          <div>
            <h1>{dayjs(calendarDate).format("MMMM YYYY")}</h1>
            <p>{calendarEvents.length} événement(s) dans le calendrier.</p>
          </div>

          <div className="calendar-controls">
            <button
              className="icon-button bordered"
              type="button"
              aria-label="Période précédente"
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
              aria-label="Période suivante"
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
              Créer
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
            localizer={localizer}
            date={calendarDate}
            events={calendarEvents}
            view={view}
            views={["month", "week", "day", "agenda"]}
            toolbar={false}
            popup
            selectable
            getNow={() => today}
            startAccessor="start"
            endAccessor="end"
            titleAccessor={(event) =>
              `${dayjs(event.start).format("HH:mm")} ${event.title}`
            }
            eventPropGetter={eventPropGetter}
            dayPropGetter={(date) =>
              dayjs(date).isSame(calendarDate, "day")
                ? { className: "calendar-selected-day" }
                : {}
            }
            onNavigate={setCalendarDate}
            onView={setView}
            onSelectEvent={(event) => {
              setCalendarDate(event.start);
              setSelectedEvent(event);
            }}
            onSelectSlot={(slot) => setCalendarDate(slot.start)}
            messages={{
              date: "Date",
              time: "Heure",
              event: "Événement",
              allDay: "Journée",
              previous: "Précédent",
              next: "Suivant",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              noEventsInRange: "Aucun événement sur cette période.",
              showMore: (total) => `+${total}`,
            }}
          />
        </div>
      </section>

      <aside className="calendar-side">
        <p className="eyebrow">
          {agendaTitle} - {agendaDate.format("dddd D MMMM")}
        </p>

        <h2>{agendaEvents.length} événement(s)</h2>

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
                  {event.location ? ` - ${event.location}` : ""}
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

                  {event.participants.length > 3 && (
                    <span>+{event.participants.length - 3}</span>
                  )}
                </div>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                >
                  Voir le détail
                </button>
              </article>
            ))
          ) : (
            <div className="calendar-empty">
              <Icon name="calendar" size={22} />
              <strong>Aucun événement</strong>
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

      {selectedEvent && (
        <CalendarEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

type CalendarEventDetailModalProps = {
  event: CalendarEvent;
  onClose: () => void;
};

function CalendarEventDetailModal({
  event,
  onClose,
}: CalendarEventDetailModalProps) {
  return (
    <div className="calendar-modal-backdrop" onClick={onClose}>
      <section
        className="calendar-event-modal"
        role="dialog"
        aria-modal="true"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <header className="calendar-event-modal-header">
          <div>
            <span>{event.type}</span>
            <h2>{event.title}</h2>
            <p>
              {dayjs(event.start).format("dddd D MMMM YYYY")} ·{" "}
              {dayjs(event.start).format("HH:mm")} -{" "}
              {dayjs(event.end).format("HH:mm")}
            </p>
          </div>

          <button className="icon-button" type="button" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </header>

        <div className="calendar-detail-content">
          <div className="calendar-detail-row">
            <Icon name="pin" size={16} />
            <div>
              <strong>Lieu</strong>
              <p>{event.location || "Aucun lieu renseigné"}</p>
            </div>
          </div>

          <div className="calendar-detail-row">
            <Icon name="users" size={16} />
            <div>
              <strong>Participants · {event.participants.length}</strong>

              {event.participants.length > 0 ? (
                <div className="calendar-detail-participants">
                  {event.participants.map((participant) => (
                    <div
                      className="calendar-detail-participant"
                      key={participant.id}
                    >
                      <Avatar
                        name={`${participant.firstName} ${participant.lastName}`}
                        size={34}
                      />

                      <span>
                        <strong>
                          {participant.firstName} {participant.lastName}
                        </strong>
                        <small>{participant.email}</small>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucun participant ajouté.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}