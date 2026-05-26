import { Link } from 'react-router-dom';
import { mockApi } from '../../shared/api/mockApi';
import { useMockQuery } from '../../shared/api/useMockQuery';
import { files, users } from '../../shared/api/mockData';
import { useAuth } from '../../shared/context';
import type { DashboardKpi } from '../../shared/types';
import { Avatar, Card, FileIcon, Icon, LoadingState } from '../../shared/ui';

function sparkline(values: number[], width = 200, height = 48) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 4 - ((value - min) / range) * (height - 8);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function KpiCard({ kpi, index }: { kpi: DashboardKpi; index: number }) {
  const path = sparkline(kpi.data);
  return (
    <article className="metric-card">
      <span>{kpi.label}</span>
      <div>
        <strong>{kpi.value}</strong>
        <small className={kpi.trend === 'up' ? 'chip chip-green' : 'chip chip-red'}>{kpi.delta}</small>
      </div>
      <svg viewBox="0 0 200 48" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kpi.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={kpi.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 200 48 L 0 48 Z`} fill={`url(#spark-${index})`} />
        <path d={path} fill="none" stroke={kpi.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </article>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useMockQuery(mockApi.getDashboard, 'dashboard');

  if (loading || !data) {
    return <LoadingState label="Chargement du tableau de bord..." />;
  }

  const maxMessages = Math.max(...data.activity.map((day) => day.messages));
  const visibleFiles = files.slice(0, 5);
  const onlineUsers = users.filter((item) => item.presence !== 'offline');

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Samedi 23 mai - 09:42</p>
          <h1>Bonjour {user?.name.split(' ')[0] ?? 'Mohamed'}.</h1>
          <p>Vous avez {data.upcomingMeetings.length} reunions et 8 nouveaux messages aujourd hui.</p>
        </div>
        <Link className="button ghost" to="/app/meeting/meet-daily">
          <Icon name="video" size={15} />
          Demarrer une reunion
        </Link>
      </header>

      <section className="metric-grid">
        {data.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} kpi={kpi} index={index} />
        ))}
      </section>

      <Card title="Activite de l equipe">
        <div className="chart-legend">
          <span><i style={{ background: 'var(--accent)' }} />messages</span>
          <span><i style={{ background: 'var(--accent-2)' }} />reunions</span>
          <span><i style={{ background: 'var(--amber)' }} />fichiers</span>
        </div>
        <div className="bar-chart">
          {data.activity.map((day) => (
            <div key={day.day}>
              <span className="bar-stack">
                <i style={{ height: `${(day.messages / maxMessages) * 100}%`, background: 'var(--accent)' }} />
                <i style={{ height: `${(day.meetings / 12) * 70}%`, background: 'var(--accent-2)' }} />
                <i style={{ height: `${(day.files / 35) * 45}%`, background: 'var(--amber)' }} />
              </span>
              <small>{day.day}</small>
            </div>
          ))}
        </div>
      </Card>

      <section className="dashboard-grid">
        <Card title="Activite recente">
          <ul className="feed-list">
            {data.recentActivity.map((activity) => {
              const actor = users.find((item) => item.id === activity.actorId) ?? users[0];
              return (
                <li key={activity.id}>
                  <Avatar name={actor.name} size={30} presence={actor.presence} />
                  <span>
                    <strong>{actor.name}</strong> {activity.verb} <b>{activity.target}</b>
                  </span>
                  <small>{activity.when}</small>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Prochaines reunions">
          <ul className="meeting-list">
            {data.upcomingMeetings.slice(0, 3).map((meeting) => (
              <li key={meeting.id}>
                <i />
                <span>
                  <strong>{meeting.title}</strong>
                  <small>{meeting.time} - {meeting.duration} - {meeting.room}</small>
                </span>
                <Link className={meeting.live ? 'button mini primary' : 'button mini ghost'} to={`/app/meeting/${meeting.id}`}>
                  {meeting.live ? 'Rejoindre' : 'Voir'}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Mes fichiers"
          action={
            <Link className="card-action" to="/app/files">
              Voir tout <Icon name="chevRight" size={12} />
            </Link>
          }
        >
          <ul className="file-row-list">
            {visibleFiles.map((file) => (
              <li key={file.id}>
                <FileIcon ext={file.ext} color={file.color} size={30} />
                <span>{file.name}</span>
                <small>{file.size}</small>
                <small>{file.modifiedLabel}</small>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Equipe en ligne" action={<span className="mono-muted">{onlineUsers.length} / {users.length}</span>}>
          <ul className="people-list">
            {users.slice(1).map((person) => (
              <li key={person.id}>
                <Avatar name={person.name} size={32} presence={person.presence} />
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.status}</small>
                </span>
                <Link className="icon-button" to={`/app/dm/dm-${person.name.split(' ')[0].toLowerCase()}`} aria-label={`Message ${person.name}`}>
                  <Icon name="message" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
