import { useMemo, useState } from 'react';
import { Calendar, dayjsLocalizer, type EventPropGetter, type View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
// import { mockApi, useMockQuery } from '../../shared/api';
import {mockApi} from '../../shared/api/mockApi';
import { useMockQuery } from '../../shared/api/useMockQuery';
import { users } from '../../shared/api/mockData';
import type { CalendarEvent as ApiCalendarEvent } from '../../shared/types';
import { Avatar, Icon, LoadingState } from '../../shared/ui';

dayjs.locale('fr');

const localizer = dayjsLocalizer(dayjs);
const mockToday = new Date(2026, 4, 23);

const calendarViews: Array<{ label: string; value: View }> = [
  { label: 'Mois', value: 'month' },
  { label: 'Semaine', value: 'week' },
  { label: 'Jour', value: 'day' },
  { label: 'Agenda', value: 'agenda' }
];

const calendars = [
  { name: 'Mon agenda', color: '#5B6CFF' },
  { name: 'Equipe Direction', color: '#8B7FFF' },
  { name: 'Sprint Produit', color: '#22C55E' },
  { name: 'Clients', color: '#F59E0B' }
];

interface AcrediCalendarEvent extends ApiCalendarEvent {
  start: Date;
  end: Date;
}

function durationToMinutes(duration: string) {
  const hours = duration.match(/(\d+)\s*h/);
  const minutes = duration.match(/(\d+)\s*min/);

  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0) || 30;
}

function toCalendarEvent(event: ApiCalendarEvent): AcrediCalendarEvent {
  const start = dayjs(`${event.date}T${event.time}`);

  return {
    ...event,
    start: start.toDate(),
    end: start.add(durationToMinutes(event.duration), 'minute').toDate()
  };
}

export function CalendarPage() {
  const { data, loading } = useMockQuery(mockApi.getCalendarEvents, 'calendar');
  const [calendarDate, setCalendarDate] = useState(mockToday);
  const [view, setView] = useState<View>('month');

  const calendarEvents = useMemo(() => (data ?? []).map(toCalendarEvent), [data]);
  const agendaEvents = calendarEvents.filter((event) => dayjs(event.start).isSame(calendarDate, 'day'));

  const eventPropGetter: EventPropGetter<AcrediCalendarEvent> = (event) => ({
    style: {
      backgroundColor: `${event.color}22`,
      color: event.color,
      borderLeft: `3px solid ${event.color}`
    }
  });

  if (loading || !data) {
    return <LoadingState label="Chargement du calendrier..." />;
  }

  const agendaDate = dayjs(calendarDate);
  const agendaTitle = agendaDate.isSame(mockToday, 'day') ? "Aujourd'hui" : 'Jour selectionne';

  return (
    <div className="calendar-page">
      <section className="calendar-main">
        <header className="calendar-toolbar">
          <div>
            <h1>{dayjs(calendarDate).format('MMMM YYYY')}</h1>
            <p>Semaine 21 - {calendarEvents.length} evenements ce mois.</p>
          </div>
          <div className="calendar-controls">
            <button
              className="icon-button bordered"
              type="button"
              aria-label="Periode precedente"
              onClick={() => setCalendarDate(dayjs(calendarDate).subtract(1, view === 'month' ? 'month' : 'week').toDate())}
            >
              <Icon name="arrowLeft" size={14} />
            </button>
            <button className="button ghost" type="button" onClick={() => setCalendarDate(mockToday)}>
              Aujourd'hui
            </button>
            <button
              className="icon-button bordered"
              type="button"
              aria-label="Periode suivante"
              onClick={() => setCalendarDate(dayjs(calendarDate).add(1, view === 'month' ? 'month' : 'week').toDate())}
            >
              <Icon name="chevRight" size={14} />
            </button>
            <div className="calendar-view-switch">
              {calendarViews.map((calendarView) => (
                <button
                  key={calendarView.value}
                  className={view === calendarView.value ? 'active' : ''}
                  type="button"
                  aria-pressed={view === calendarView.value}
                  onClick={() => setView(calendarView.value)}
                >
                  {calendarView.label}
                </button>
              ))}
            </div>
            <button className="button primary" type="button">
              <Icon name="plus" size={14} />
              Creer
            </button>
          </div>
        </header>

        <div className="calendar-rbc">
          <Calendar<AcrediCalendarEvent>
            culture="fr"
            localizer={localizer}
            date={calendarDate}
            events={calendarEvents}
            view={view}
            views={['month', 'week', 'day', 'agenda']}
            toolbar={false}
            popup
            selectable
            getNow={() => mockToday}
            startAccessor="start"
            endAccessor="end"
            titleAccessor={(event) => `${dayjs(event.start).format('HH:mm')} ${event.title}`}
            eventPropGetter={eventPropGetter}
            dayPropGetter={(date) =>
              dayjs(date).isSame(calendarDate, 'day') ? { className: 'calendar-selected-day' } : {}
            }
            onNavigate={setCalendarDate}
            onView={setView}
            onSelectEvent={(event) => setCalendarDate(event.start)}
            onSelectSlot={(slot) => setCalendarDate(slot.start)}
            messages={{
              date: 'Date',
              time: 'Heure',
              event: 'Evenement',
              allDay: 'Journee',
              previous: 'Precedent',
              next: 'Suivant',
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              agenda: 'Agenda',
              noEventsInRange: 'Aucun evenement sur cette periode.',
              showMore: (total) => `+${total}`
            }}
          />
        </div>
      </section>

      <aside className="calendar-side">
        <p className="eyebrow">{agendaTitle} - {agendaDate.format('dddd D MMMM')}</p>
        <h2>{agendaEvents.length} evenements</h2>
        <div className="today-agenda">
          {agendaEvents.length > 0 ? (
            agendaEvents.slice(0, 3).map((event) => (
              <article
                key={event.id}
                className={event.status === 'live' ? 'agenda-card live' : 'agenda-card'}
                style={{ borderColor: event.color }}
              >
                <header>
                  <strong>{event.title}</strong>
                  {event.status === 'live' ? <span>Live</span> : null}
                </header>
                <small>
                  {event.time} - {event.duration} - {event.location}
                </small>
                <div className="avatar-stack">
                  {event.attendeeIds.slice(0, 3).map((id) => {
                    const person = users.find((user) => user.id === id) ?? users[0];
                    return <Avatar key={id} name={person.name} size={22} ring="var(--surface)" />;
                  })}
                </div>
                <button className={event.status === 'live' ? 'button primary' : 'button ghost'} type="button">
                  {event.status === 'live' ? 'Rejoindre la reunion' : 'Voir le detail'}
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
    </div>
  );
}
