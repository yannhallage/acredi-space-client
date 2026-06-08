import { Link } from 'react-router-dom';
import { DCArtboard, DCSection, DesignCanvas } from '../../layouts/PreviewLayout';
import { AcrediLockup, Icon, type IconName } from '../../shared/ui';

const screens: Array<{ label: string; title: string; to: string; icon: IconName; tone: string }> = [
  { label: '01 - Login', title: 'Connexion', to: '/login', icon: 'lock', tone: '#5B6CFF' },
  { label: '02 - Dashboard', title: 'Tableau de bord', to: '/app/dashboard', icon: 'home', tone: '#8B7FFF' },
  { label: '03 - Fichiers', title: 'Explorateur', to: '/app/files', icon: 'folder', tone: '#22C55E' },
  { label: '04 - Chat', title: 'Canal equipe', to: '/app/chat/design-acredi', icon: 'message', tone: '#F59E0B' },
  { label: '05 - DM', title: 'Messages directs', to: '/app/dm/dm-yann', icon: 'user', tone: '#5B6CFF' },
  { label: '06 - Calendrier', title: 'Planning', to: '/app/calendar', icon: 'calendar', tone: '#8B7FFF' },
  { label: '07 - Reunion', title: 'Salle video', to: '/app/meeting/meet-daily', icon: 'video', tone: '#EF4444' },
  { label: '08 - Profil', title: 'Compte', to: '/app/profile', icon: 'user', tone: '#22C55E' },
  { label: '09 - Admin', title: 'Administration', to: '/app/admin', icon: 'settings', tone: '#F59E0B' }
];

function PreviewTile({ title, to, icon, tone }: { title: string; to: string; icon: IconName; tone: string }) {
  return (
    <Link className="preview-tile" to={to}>
      <AcrediLockup size={20} fontSize={15} />
      <span className="preview-glyph" style={{ color: tone, background: `${tone}1f` }}>
        <Icon name={icon} size={28} />
      </span>
      <strong>{title}</strong>
      <small>Ouvrir l ecran</small>
    </Link>
  );
}

export function PreviewPage() {
  return (
    <DesignCanvas>
      <DCSection title="Acredi Space SPA" subtitle="Artboards de controle relies aux routes de l application">
        {screens.map((screen) => (
          <DCArtboard key={screen.label} label={screen.label}>
            <PreviewTile title={screen.title} to={screen.to} icon={screen.icon} tone={screen.tone} />
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}
