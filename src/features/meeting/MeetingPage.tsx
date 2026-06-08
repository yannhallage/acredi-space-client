import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fr';

import { users } from '../../shared/api/mockData';
import type { User } from '../../shared/types';
import { Avatar, Icon } from '../../shared/ui';

dayjs.locale('fr');

type MeetingStatus = 'live' | 'upcoming' | 'done';

type MeetingEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  format: string;
  color: string;
  attendeeIds: string[];
  status: MeetingStatus;
  summary: string;
  hasNotes?: boolean;
  hasRecording?: boolean;
};

type CalendarDay = {
  date: Dayjs;
  isCurrentMonth: boolean;
  meetings: MeetingEvent[];
};

type UpcomingMeetingsCalendarProps = {
  meetings: MeetingEvent[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
};

type MeetingHistoryProps = {
  meetings: MeetingEvent[];
};

type MeetingAvatarStackProps = {
  attendees: User[];
  limit?: number;
  size?: number;
};

type HistoryFilter = 'all' | 'notes' | 'recording';

const referenceDate = dayjs('2026-06-07');

const defaultMeetings: MeetingEvent[] = [
  {
    id: 'meet-direction-live',
    title: 'Point direction hebdo',
    date: '2026-06-07',
    time: '10:30',
    duration: '45 min',
    location: 'Salle Nimba',
    format: 'Hybride',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'live',
    summary: 'Arbitrage budget Q3, priorites produit et dependances commerciales.'
  },
  {
    id: 'meet-product-roadmap',
    title: 'Roadmap produit',
    date: '2026-06-08',
    time: '09:00',
    duration: '1 h',
    location: 'Visio',
    format: 'Visio',
    color: '#22C55E',
    attendeeIds: ['u-yann', 'u-issa', 'u-yeo', 'u-aicha'],
    status: 'upcoming',
    summary: 'Alignement sur les livrables de juin et validation des jalons.'
  },
  {
    id: 'meet-design-review',
    title: 'Revue design system',
    date: '2026-06-09',
    time: '14:00',
    duration: '50 min',
    location: 'Design Studio',
    format: 'Salle',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-yeo'],
    status: 'upcoming',
    summary: 'Validation des composants, densite des ecrans et tokens UI.'
  },
  {
    id: 'meet-client-acme',
    title: 'Sync client ACME',
    date: '2026-06-10',
    time: '16:00',
    duration: '45 min',
    location: 'Salle Baobab',
    format: 'Hybride',
    color: '#F59E0B',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-kouadio'],
    status: 'upcoming',
    summary: 'Point risques, retours du client et prochaine livraison.'
  },
  {
    id: 'meet-mobile-workshop',
    title: 'Atelier UX mobile',
    date: '2026-06-12',
    time: '11:30',
    duration: '1 h 15',
    location: 'Design Studio',
    format: 'Salle',
    color: '#EF4444',
    attendeeIds: ['u-yann', 'u-aicha'],
    status: 'upcoming',
    summary: 'Travail sur les parcours courts et les actions rapides mobile.'
  },
  {
    id: 'meet-demo-board',
    title: 'Demo board direction',
    date: '2026-06-16',
    time: '15:00',
    duration: '40 min',
    location: 'Salle Direction',
    format: 'Hybride',
    color: '#2E90FA',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa', 'u-kouadio'],
    status: 'upcoming',
    summary: 'Presentation des indicateurs, decisions attendues et prochaines etapes.'
  },
  {
    id: 'meet-retro-sprint',
    title: 'Retro sprint #18',
    date: '2026-06-06',
    time: '17:00',
    duration: '50 min',
    location: 'Visio',
    format: 'Replay',
    color: '#5B6CFF',
    attendeeIds: ['u-yann', 'u-issa', 'u-yeo', 'u-aicha'],
    status: 'done',
    summary: 'Synthese des irritants, points forts et actions correctives.',
    hasNotes: true,
    hasRecording: true
  },
  {
    id: 'meet-identity-brief',
    title: 'Brief identite visuelle',
    date: '2026-06-04',
    time: '10:00',
    duration: '45 min',
    location: 'Design Studio',
    format: 'Salle',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-mohamed'],
    status: 'done',
    summary: 'Cadrage des variantes logo, usages et livrables attendus.',
    hasNotes: true
  },
  {
    id: 'meet-kickoff-auth',
    title: 'Kickoff module auth',
    date: '2026-06-02',
    time: '09:30',
    duration: '1 h',
    location: 'Salle Baobab',
    format: 'Hybride',
    color: '#22C55E',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-yeo'],
    status: 'done',
    summary: 'Objectifs techniques, responsabilites et definition of done.',
    hasNotes: true,
    hasRecording: true
  },
  {
    id: 'meet-sales-review',
    title: 'Revue commerciale',
    date: '2026-05-29',
    time: '15:30',
    duration: '35 min',
    location: 'Salle Direction',
    format: 'Salle',
    color: '#F59E0B',
    attendeeIds: ['u-mohamed', 'u-kouadio', 'u-yann'],
    status: 'done',
    summary: 'Opportunites ouvertes, blocages client et priorites de relance.',
    hasNotes: true
  },
  {
    id: 'meet-weekly-tech',
    title: 'Weekly tech',
    date: '2026-05-27',
    time: '11:00',
    duration: '30 min',
    location: 'Visio',
    format: 'Visio',
    color: '#2E90FA',
    attendeeIds: ['u-issa', 'u-yeo'],
    status: 'done',
    summary: 'Dette technique, incidents mineurs et plan de stabilisation.',
    hasRecording: true
  }
];

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const historyFilters: Array<{ label: string; value: HistoryFilter }> = [
  { label: 'Tous', value: 'all' },
  { label: 'PV', value: 'notes' },
  { label: 'Replay', value: 'recording' }
];

function compareMeetings(first: MeetingEvent, second: MeetingEvent) {
  return getMeetingDateTime(first).valueOf() - getMeetingDateTime(second).valueOf();
}

function getMeetingDateTime(meeting: MeetingEvent) {
  return dayjs(`${meeting.date}T${meeting.time}`);
}

function getMeetingAttendees(meeting: MeetingEvent) {
  return meeting.attendeeIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user));
}

function groupMeetingsByDate(meetings: MeetingEvent[]) {
  return meetings.reduce((groupedMeetings, meeting) => {
    const dayMeetings = groupedMeetings.get(meeting.date) ?? [];
    groupedMeetings.set(meeting.date, [...dayMeetings, meeting]);
    return groupedMeetings;
  }, new Map<string, MeetingEvent[]>());
}

function buildCalendarDays(month: Dayjs, meetingsByDate: Map<string, MeetingEvent[]>): CalendarDay[] {
  const monthStart = month.startOf('month');
  const firstWeekdayIndex = (monthStart.day() + 6) % 7;
  const gridStart = monthStart.subtract(firstWeekdayIndex, 'day');

  return Array.from({ length: 42 }, (_, index) => {
    const date = gridStart.add(index, 'day');
    const dateKey = date.format('YYYY-MM-DD');

    return {
      date,
      isCurrentMonth: date.month() === month.month(),
      meetings: (meetingsByDate.get(dateKey) ?? []).slice().sort(compareMeetings)
    };
  });
}

function formatMeetingDate(meeting: MeetingEvent) {
  return getMeetingDateTime(meeting).format('dddd D MMMM YYYY');
}

function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const labels: Record<MeetingStatus, string> = {
    done: 'Terminee',
    live: 'Live',
    upcoming: 'A venir'
  };

  return <span className={`meeting-status-badge ${status}`}>{labels[status]}</span>;
}

function MeetingAvatarStack({ attendees, limit = 4, size = 28 }: MeetingAvatarStackProps) {
  const visibleAttendees = attendees.slice(0, limit);
  const remaining = attendees.length - visibleAttendees.length;

  return (
    <div className="meeting-avatar-stack" aria-label={`${attendees.length} participant(s)`}>
      {visibleAttendees.map((attendee) => (
        <Avatar
          key={attendee.id}
          name={attendee.name}
          presence={attendee.presence}
          ring="var(--surface)"
          size={size}
        />
      ))}

      {remaining > 0 ? <span>+{remaining}</span> : null}
    </div>
  );
}

function MeetingAgendaCard({ meeting }: { meeting: MeetingEvent }) {
  const attendees = getMeetingAttendees(meeting);

  return (
    <article className="meeting-agenda-card" style={{ borderColor: meeting.color }}>
      <header>
        <MeetingStatusBadge status={meeting.status} />
        <time dateTime={`${meeting.date}T${meeting.time}`}>{meeting.time}</time>
      </header>

      <h3>{meeting.title}</h3>
      <p>{meeting.summary}</p>

      <div className="meeting-meta-grid">
        <span>
          <Icon name="clock" size={14} />
          {meeting.duration}
        </span>
        <span>
          <Icon name="pin" size={14} />
          {meeting.location}
        </span>
        <span>
          <Icon name="video" size={14} />
          {meeting.format}
        </span>
      </div>

      <footer>
        <MeetingAvatarStack attendees={attendees} />
        <button className={meeting.status === 'live' ? 'button primary' : 'button ghost'} type="button">
          <Icon name={meeting.status === 'live' ? 'video' : 'calendar'} size={14} />
          {meeting.status === 'live' ? 'Rejoindre' : 'Voir'}
        </button>
      </footer>
    </article>
  );
}

function UpcomingMeetingsCalendar({
  meetings,
  onSelectDate,
  selectedDate
}: UpcomingMeetingsCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs(selectedDate).startOf('month'));

  const meetingsByDate = useMemo(() => groupMeetingsByDate(meetings), [meetings]);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, meetingsByDate),
    [meetingsByDate, visibleMonth]
  );
  const selectedMeetings = meetingsByDate.get(selectedDate) ?? [];
  const selectedDateLabel = dayjs(selectedDate).format('dddd D MMMM');

  function handleGoToToday() {
    setVisibleMonth(referenceDate.startOf('month'));
    onSelectDate(referenceDate.format('YYYY-MM-DD'));
  }

  return (
    <section className="meeting-calendar-card">
      <header className="meeting-section-header">
        <div>
          <p className="eyebrow">Calendrier</p>
          <h2>Reunions a venir</h2>
          <span>{meetings.length} reunion(s) planifiee(s)</span>
        </div>

        <div className="meeting-calendar-controls">
          <button
            className="icon-button bordered"
            type="button"
            aria-label="Mois precedent"
            onClick={() => setVisibleMonth((month) => month.subtract(1, 'month'))}
          >
            <Icon name="arrowLeft" size={14} />
          </button>
          <button className="button ghost" type="button" onClick={handleGoToToday}>
            Aujourd'hui
          </button>
          <button
            className="icon-button bordered"
            type="button"
            aria-label="Mois suivant"
            onClick={() => setVisibleMonth((month) => month.add(1, 'month'))}
          >
            <Icon name="chevRight" size={14} />
          </button>
        </div>
      </header>

      <div className="meeting-calendar-month">
        <strong>{visibleMonth.format('MMMM YYYY')}</strong>
        <span>Selectionne un jour pour voir les meetings.</span>
      </div>

      <div className="meeting-calendar-layout">
        <div className="meeting-calendar-board" role="grid" aria-label="Calendrier des reunions">
          <div className="meeting-calendar-weekdays" role="row">
            {weekdayLabels.map((weekday) => (
              <span key={weekday} role="columnheader">
                {weekday}
              </span>
            ))}
          </div>

          <div className="meeting-calendar-days">
            {calendarDays.map((day) => {
              const dateKey = day.date.format('YYYY-MM-DD');
              const isSelected = dateKey === selectedDate;
              const isToday = day.date.isSame(referenceDate, 'day');
              const dayClassName = [
                'meeting-calendar-day',
                day.isCurrentMonth ? '' : 'outside',
                day.meetings.length > 0 ? 'has-meetings' : '',
                day.meetings.some((meeting) => meeting.status === 'live') ? 'has-live' : '',
                isSelected ? 'selected' : '',
                isToday ? 'today' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={dateKey}
                  className={dayClassName}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${day.date.format('dddd D MMMM')}, ${day.meetings.length} reunion(s)`}
                  onClick={() => onSelectDate(dateKey)}
                >
                  <span className="meeting-day-number">{day.date.date()}</span>

                  {day.meetings.length > 0 ? (
                    <span className="meeting-day-events">
                      {day.meetings.slice(0, 2).map((meeting) => (
                        <i key={meeting.id} style={{ background: meeting.color }} />
                      ))}
                      <small>{day.meetings.length}</small>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="meeting-day-panel">
          <header>
            <span>Agenda</span>
            <strong>{selectedDateLabel}</strong>
          </header>

          <div className="meeting-day-list">
            {selectedMeetings.length > 0 ? (
              selectedMeetings.map((meeting) => <MeetingAgendaCard key={meeting.id} meeting={meeting} />)
            ) : (
              <div className="meeting-empty-state">
                <Icon name="calendar" size={20} />
                <strong>Aucune reunion</strong>
                <p>Choisis une date marquee pour afficher les prochains meetings.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function MeetingHistory({ meetings }: MeetingHistoryProps) {
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => {
        if (filter === 'notes') return Boolean(meeting.hasNotes);
        if (filter === 'recording') return Boolean(meeting.hasRecording);
        return true;
      })
      .slice()
      .sort((first, second) => compareMeetings(second, first));
  }, [filter, meetings]);

  return (
    <aside className="meeting-history-panel">
      <header className="meeting-history-header">
        <div>
          <p className="eyebrow">Historique</p>
          <h2>Tout l'historique meet</h2>
        </div>
        <span>{meetings.length}</span>
      </header>

      <div className="meeting-history-filters" role="group" aria-label="Filtrer l'historique">
        {historyFilters.map((historyFilter) => (
          <button
            key={historyFilter.value}
            className={filter === historyFilter.value ? 'active' : ''}
            type="button"
            aria-pressed={filter === historyFilter.value}
            onClick={() => setFilter(historyFilter.value)}
          >
            {historyFilter.label}
          </button>
        ))}
      </div>

      <div className="meeting-history-list">
        {filteredMeetings.map((meeting) => {
          const attendees = getMeetingAttendees(meeting);

          return (
            <article key={meeting.id} className="meeting-history-item" style={{ borderColor: meeting.color }}>
              <time dateTime={`${meeting.date}T${meeting.time}`}>
                <strong>{dayjs(meeting.date).format('D MMM')}</strong>
                <span>{meeting.time}</span>
              </time>

              <div className="meeting-history-content">
                <header>
                  <h3>{meeting.title}</h3>
                  <MeetingStatusBadge status={meeting.status} />
                </header>

                <p>{meeting.summary}</p>

                <div className="meeting-history-tags">
                  <span>
                    <Icon name="pin" size={13} />
                    {meeting.location}
                  </span>
                  {meeting.hasNotes ? <span>PV</span> : null}
                  {meeting.hasRecording ? <span>Replay</span> : null}
                </div>

                <footer>
                  <MeetingAvatarStack attendees={attendees} limit={3} size={24} />
                  <small>{formatMeetingDate(meeting)}</small>
                </footer>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}

export function MeetingPage() {
  const upcomingMeetings = useMemo(
    () => defaultMeetings.filter((meeting) => meeting.status !== 'done').slice().sort(compareMeetings),
    []
  );
  const historyMeetings = useMemo(
    () => defaultMeetings.filter((meeting) => meeting.status === 'done').slice().sort((first, second) => compareMeetings(second, first)),
    []
  );
  const [selectedDate, setSelectedDate] = useState(referenceDate.format('YYYY-MM-DD'));

  const liveMeetings = upcomingMeetings.filter((meeting) => meeting.status === 'live');
  const nextMeeting = upcomingMeetings.find((meeting) => meeting.status !== 'live') ?? upcomingMeetings[0];
  const totalAttendeeSlots = upcomingMeetings.reduce((total, meeting) => total + meeting.attendeeIds.length, 0);

  return (
    <div className="meeting-page meeting-planner-page">
      <main className="meeting-planner-main">
        <header className="meeting-hero">
          <div className="meeting-hero-copy">
            <p className="eyebrow">Meeting hub</p>
            <h1>Planning des reunions</h1>
            <p>
              Une vue calendrier pour suivre les prochains meetings, ouvrir le detail d'un jour
              et garder l'historique complet a portee de main.
            </p>
          </div>

          <div className="meeting-overview">
            <article>
              <span>A venir</span>
              <strong>{upcomingMeetings.length}</strong>
              <small>{referenceDate.format('MMMM YYYY')}</small>
            </article>
            <article>
              <span>En live</span>
              <strong>{liveMeetings.length}</strong>
              <small>{liveMeetings[0]?.title ?? 'Aucun live'}</small>
            </article>
            <article>
              <span>Participants</span>
              <strong>{totalAttendeeSlots}</strong>
              <small>places invitees</small>
            </article>
            <article>
              <span>Prochain meet</span>
              <strong>{nextMeeting?.time ?? '--:--'}</strong>
              <small>{nextMeeting?.title ?? 'Aucun planning'}</small>
            </article>
          </div>
        </header>

        <UpcomingMeetingsCalendar
          meetings={upcomingMeetings}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </main>

      <MeetingHistory meetings={historyMeetings} />
    </div>
  );
}
