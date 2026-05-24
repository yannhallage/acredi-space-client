import { mockApi, useMockQuery } from '../../shared/api';
import { users } from '../../shared/api/mockData';
import { Avatar, Icon, LoadingState } from '../../shared/ui';

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const monthCells = [
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3, events: [{ title: '10:00 Brief identite', color: '#8B7FFF', soft: '#8B7FFF22' }] },
  { day: 4, events: [{ title: '09:00 Sprint #18 kickoff', color: '#22C55E', soft: '#22C55E22' }] },
  { day: 5, events: [{ title: '10:30 Daily Direction', color: '#5B6CFF', soft: '#5B6CFF22' }, { title: '15:30 Sync clients ACME', color: '#22C55E', soft: '#22C55E22' }] },
  { day: 6 },
  { day: 7, events: [{ title: '14:00 Revue design', color: '#8B7FFF', soft: '#8B7FFF22' }] },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11, events: [{ title: '09:30 Soutenance v1', color: '#F59E0B', soft: '#F59E0B22' }] },
  { day: 12, events: [{ title: '10:30 Daily Direction', color: '#5B6CFF', soft: '#5B6CFF22' }, { title: '11:00 1:1 Yann', color: '#8B7FFF', soft: '#8B7FFF22' }] },
  { day: 13 },
  { day: 14, events: [{ title: '14:00 Workshop logo', color: '#8B7FFF', soft: '#8B7FFF22' }] },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18, events: [{ title: '16:00 Comite direction', color: '#EF4444', soft: '#EF444422' }] },
  { day: 19, events: [{ title: '10:30 Daily Direction', color: '#5B6CFF', soft: '#5B6CFF22' }] },
  { day: 20, events: [{ title: '11:00 Revue design v2', color: '#8B7FFF', soft: '#8B7FFF22' }] },
  { day: 21, today: true, events: [{ title: '10:30 Daily Direction', color: '#5B6CFF', soft: '#5B6CFF22' }, { title: '14:00 Revue design Acredi Space', color: '#8B7FFF', soft: '#8B7FFF22' }, { title: '16:30 Sync clients ACME', color: '#22C55E', soft: '#22C55E22' }] },
  { day: 22, events: [{ title: '09:00 Atelier UX mobile', color: '#F59E0B', soft: '#F59E0B22' }] },
  { day: 23 },
  { day: 24 },
  { day: 25, events: [{ title: '11:00 Pres. soutenance', color: '#F59E0B', soft: '#F59E0B22' }] },
  { day: 26, events: [{ title: '10:30 Daily Direction', color: '#5B6CFF', soft: '#5B6CFF22' }] },
  { day: 27 },
  { day: 28, events: [{ title: '15:00 Demo client ACME', color: '#22C55E', soft: '#22C55E22' }] },
  { day: 29 },
  { day: 30 },
  { day: 31 }
];

const calendars = [
  { name: 'Mon agenda', color: '#5B6CFF' },
  { name: 'Equipe Direction', color: '#8B7FFF' },
  { name: 'Sprint Produit', color: '#22C55E' },
  { name: 'Clients', color: '#F59E0B' }
];

export function CalendarPage() {
  const { data, loading } = useMockQuery(mockApi.getCalendarEvents, 'calendar');

  if (loading || !data) {
    return <LoadingState label="Chargement du calendrier..." />;
  }

  const todayEvents = data.slice(0, 3);

  return (
    <div className="calendar-page">
      <section className="calendar-main">
        <header className="calendar-toolbar">
          <div>
            <h1>Mai 2026</h1>
            <p>Semaines 21 - 38 evenements ce mois.</p>
          </div>
          <div className="calendar-controls">
            <button className="icon-button bordered" type="button" aria-label="Mois precedent">
              <Icon name="arrowLeft" size={14} />
            </button>
            <button className="button ghost" type="button">Aujourd'hui</button>
            <button className="icon-button bordered" type="button" aria-label="Mois suivant">
              <Icon name="chevRight" size={14} />
            </button>
            <div className="calendar-view-switch">
              {['Mois', 'Semaine', 'Jour', 'Agenda'].map((view, index) => (
                <button key={view} className={index === 0 ? 'active' : ''} type="button">{view}</button>
              ))}
            </div>
            <button className="button primary" type="button">
              <Icon name="plus" size={14} />
              Creer
            </button>
          </div>
        </header>

        <div className="month-grid">
          {weekDays.map((day) => (
            <div key={day} className="month-weekday">{day}</div>
          ))}
          {monthCells.map((cell, index) => (
            <article key={`${cell.day}-${index}`} className={cell.muted ? 'month-cell muted' : cell.today ? 'month-cell today' : 'month-cell'}>
              <time>{cell.day}</time>
              <div>
                {(cell.events ?? []).map((event) => (
                  <span key={`${cell.day}-${event.title}`} className="month-event" style={{ color: event.color, background: event.soft }}>
                    {event.title}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="calendar-side">
        <p className="eyebrow">Aujourd'hui - samedi 23 mai</p>
        <h2>3 evenements</h2>
        <div className="today-agenda">
          {todayEvents.map((event) => (
            <article key={event.id} className={event.status === 'live' ? 'agenda-card live' : 'agenda-card'} style={{ borderColor: event.color }}>
              <header>
                <strong>{event.title}</strong>
                {event.status === 'live' ? <span>Live</span> : null}
              </header>
              <small>{event.time} - {event.duration}</small>
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
          ))}
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
