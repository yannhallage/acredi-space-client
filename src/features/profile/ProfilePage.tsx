import { useAuth } from '../../shared/context';
import { Avatar, Card, Icon } from '../../shared/ui';

const preferences = [
  ['Langue', 'Francais'],
  ['Fuseau horaire', 'Atlantic/Reykjavik'],
  ['Theme', 'Synchronise avec Acredi Space'],
  ['Notifications', 'Mentions et reunions']
];

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <div className="profile-pattern" />
        <Avatar
          name={user?.name ?? 'Mohamed Doumbia'}
          size={84}
          presence={user?.presence ?? 'online'}
          ring="var(--bg)"
          src={user?.avatarUrl}
        />
        <div>
          <p className="eyebrow">Profil utilisateur</p>
          <h1>{user?.name}</h1>
          <p>{user?.role} - {user?.team}</p>
        </div>
        <button className="button primary" type="button"><Icon name="user" size={15} /> Modifier</button>
      </section>

      <section className="dashboard-grid narrow">
        <Card title="Informations">
          <dl className="details-list">
            <div><dt>Email</dt><dd>{user?.email}</dd></div>
            <div><dt>Equipe</dt><dd>{user?.team}</dd></div>
            <div><dt>Role</dt><dd>{user?.role}</dd></div>
            <div><dt>Statut</dt><dd>{user?.status}</dd></div>
          </dl>
        </Card>
        <Card title="Preferences">
          <dl className="details-list">
            {preferences.map(([key, value]) => (
              <div key={key}><dt>{key}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </Card>
        <Card title="Securite">
          <ul className="settings-list">
            <li><Icon name="shield" size={16} /><span>Double authentification</span><strong>Active</strong></li>
            <li><Icon name="clock" size={16} /><span>Derniere connexion</span><strong>Aujourd hui</strong></li>
            <li><Icon name="lock" size={16} /><span>Session mockee</span><strong>Locale</strong></li>
          </ul>
        </Card>
        <Card title="Raccourcis">
          <ul className="settings-list">
            <li><Icon name="folder" size={16} /><span>Espace fichiers</span><strong>124 docs</strong></li>
            <li><Icon name="message" size={16} /><span>Canaux suivis</span><strong>4</strong></li>
            <li><Icon name="calendar" size={16} /><span>Reunions semaine</span><strong>47</strong></li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
