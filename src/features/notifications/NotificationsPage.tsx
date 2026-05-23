import { Link } from 'react-router-dom';
import { mockApi, useMockQuery } from '../../shared/api';
import { users } from '../../shared/api/mockData';
import type { AppNotification } from '../../shared/types';
import { Avatar, Card, Icon, type IconName, LoadingState } from '../../shared/ui';

const typeIcon: Record<AppNotification['type'], IconName> = {
  file: 'file',
  message: 'message',
  meeting: 'video',
  system: 'settings'
};

function targetFor(notification: AppNotification) {
  if (notification.type === 'message') return '/app/chat/design-acredi';
  if (notification.type === 'meeting') return '/app/meeting/meet-daily';
  if (notification.type === 'file') return '/app/files';
  return '/app/admin';
}

export function NotificationsPage() {
  const { data, loading } = useMockQuery(mockApi.getNotifications, 'notifications');

  if (loading || !data) {
    return <LoadingState label="Chargement des notifications..." />;
  }

  const unread = data.filter((notification) => notification.unread);

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Activite</p>
          <h1>Centre de notifications</h1>
          <p>{unread.length} notifications non lues sur {data.length}.</p>
        </div>
        <div className="button-row">
          <button className="button ghost" type="button"><Icon name="check" size={14} /> Tout marquer lu</button>
          <button className="button primary" type="button"><Icon name="settings" size={14} /> Preferences</button>
        </div>
      </header>

      <section className="notifications-layout">
        <Card title="Inbox">
          <div className="notification-list">
            {data.map((notification) => {
              const actor = notification.actorId ? users.find((user) => user.id === notification.actorId) : undefined;
              return (
                <Link key={notification.id} className={notification.unread ? 'notification-item unread' : 'notification-item'} to={targetFor(notification)}>
                  <span className="notification-icon"><Icon name={typeIcon[notification.type]} size={16} /></span>
                  {actor ? <Avatar name={actor.name} size={32} presence={actor.presence} /> : null}
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{notification.body}</small>
                  </span>
                  <time>{notification.createdAt}</time>
                </Link>
              );
            })}
          </div>
        </Card>

        <aside className="notification-side">
          <Card title="Filtres">
            <div className="filter-list">
              {['Toutes', 'Non lues', 'Fichiers', 'Messages', 'Reunions'].map((filter, index) => (
                <button key={filter} className={index === 0 ? 'active' : ''} type="button">{filter}</button>
              ))}
            </div>
          </Card>
          <Card title="Resume">
            <dl className="details-list">
              <div><dt>Non lues</dt><dd>{unread.length}</dd></div>
              <div><dt>Fichiers</dt><dd>{data.filter((item) => item.type === 'file').length}</dd></div>
              <div><dt>Messages</dt><dd>{data.filter((item) => item.type === 'message').length}</dd></div>
              <div><dt>Reunions</dt><dd>{data.filter((item) => item.type === 'meeting').length}</dd></div>
            </dl>
          </Card>
        </aside>
      </section>
    </div>
  );
}
