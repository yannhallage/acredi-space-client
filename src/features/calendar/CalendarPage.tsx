import { mockApi, useMockQuery } from '../../shared/api';
import { users } from '../../shared/api/mockData';
import { Avatar, Card, Icon, LoadingState } from '../../shared/ui';

const week = [
  { label: 'Lun', day: 18 },
  { label: 'Mar', day: 19 },
  { label: 'Mer', day: 20 },
  { label: 'Jeu', day: 21 },
  { label: 'Ven', day: 22 },
  { label: 'Sam', day: 23 },
  { label: 'Dim', day: 24 }
];

export function CalendarPage() {
  const { data, loading } = useMockQuery(mockApi.getCalendarEvents, 'calendar');

  if (loading || !data) {
    return <LoadingState label="Chargement du calendrier..." />;
  }

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Mai 2026</p>
          <h1>Semaine du 18 au 24 mai</h1>
          <p>{data.length} evenements planifies cette semaine.</p>
        </div>
        <div className="button-row">
          <button className="button ghost" type="button"><Icon name="chevDown" size={14} /> Semaine</button>
          <button className="button primary" type="button"><Icon name="plus" size={14} /> Nouvel evenement</button>
        </div>
      </header>

      <section className="calendar-shell">
        <div className="calendar-grid-head">
          {week.map((item) => (
            <span key={item.label} className={item.day === 23 ? 'active' : ''}>
              <small>{item.label}</small>
              <strong>{item.day}</strong>
            </span>
          ))}
        </div>
        <div className="calendar-grid-body">
          {week.map((day) => (
            <div key={day.label} className={day.day === 23 ? 'calendar-day active' : 'calendar-day'}>
              {day.day === 23 ? data.slice(0, 3).map((event) => (
                <article key={event.id} className="calendar-event" style={{ borderColor: event.color }}>
                  <strong>{event.title}</strong>
                  <small>{event.time} - {event.duration}</small>
                  <span>{event.location}</span>
                </article>
              )) : null}
              {day.day === 24 ? data.slice(3).map((event) => (
                <article key={event.id} className="calendar-event" style={{ borderColor: event.color }}>
                  <strong>{event.title}</strong>
                  <small>{event.time} - {event.duration}</small>
                  <span>{event.location}</span>
                </article>
              )) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-grid narrow">
        <Card title="Aujourd hui">
          <ul className="meeting-list">
            {data.slice(0, 3).map((event) => (
              <li key={event.id}>
                <i style={{ background: event.color }} />
                <span>
                  <strong>{event.title}</strong>
                  <small>{event.time} - {event.location}</small>
                </span>
                <small className={event.status === 'live' ? 'chip chip-red' : 'chip'}>{event.status}</small>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Participants frequents">
          <ul className="people-list">
            {users.slice(0, 5).map((user) => (
              <li key={user.id}>
                <Avatar name={user.name} size={32} presence={user.presence} />
                <span><strong>{user.name}</strong><small>{user.role}</small></span>
                <Icon name="calendar" size={14} />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
