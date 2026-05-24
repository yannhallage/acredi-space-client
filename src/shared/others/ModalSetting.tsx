import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Icon, type IconName } from '../ui';

type SettingItem = {
  label: string;
  icon: IconName;
  active?: boolean;
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

const groups: SettingGroup[] = [
  {
    title: 'Configuration utilisateur',
    items: [
      { label: 'Profil', icon: 'user', active: true },
      { label: 'Preferences', icon: 'settings' }
    ]
  },
  {
    title: 'Configuration systeme',
    items: [
      { label: 'General', icon: 'settings' },
      { label: 'Dashboard', icon: 'grid' },
      { label: 'Defaults', icon: 'notes' },
      { label: 'Brand', icon: 'star' }
    ]
  },
  {
    title: 'Email',
    items: [
      { label: 'Comptes', icon: 'mail' },
      { label: 'Templates', icon: 'file' }
    ]
  },
  {
    title: 'Automation & regles',
    items: [
      { label: 'Assignment rules', icon: 'check' },
      { label: 'SLA policies', icon: 'shield' }
    ]
  }
];

interface ModalSettingProps {
  userEmail: string;
  userName: string;
  workspaceName: string;
  onClose: () => void;
}

export default function ModalSetting({ userEmail, userName, workspaceName, onClose }: ModalSettingProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="modal-setting-overlay"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.section
        className="modal-setting-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="modal-setting-close" type="button" aria-label="Fermer les parametres" onClick={onClose}>
          <Icon name="x" size={17} />
        </button>

        <aside className="modal-setting-sidebar" aria-label="Sections des parametres">
          {groups.map((group) => (
            <section key={group.title} className="modal-setting-group">
              <p>{group.title}</p>
              <div>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className={item.active ? 'modal-setting-item active' : 'modal-setting-item'}
                    type="button"
                  >
                    <Icon name={item.icon} size={15} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <main className="modal-setting-content">
          <header>
            <h2 id="settings-modal-title">Profil</h2>
            <p>Gere ton profil et tes informations de connexion.</p>
          </header>

          <div className="modal-setting-profile">
            <Avatar name={userName} size={58} />
            <div>
              <div className="modal-setting-profile-title">
                <h3>{userName}</h3>
                <Icon name="edit" size={15} />
              </div>
              <p>{userEmail}</p>
              <small>{workspaceName}</small>
            </div>
          </div>

          <section className="modal-setting-section">
            <h4>Compte et securite</h4>

            <article className="modal-setting-row">
              <div>
                <strong>Emails et signature</strong>
                <p>Gere les emails de ton compte et ta signature de communication.</p>
              </div>
              <button className="button ghost mini" type="button">
                Configurer
              </button>
            </article>

            <article className="modal-setting-row">
              <div>
                <strong>Mot de passe</strong>
                <p>Change ton mot de passe pour proteger ton espace.</p>
              </div>
              <button className="button ghost mini" type="button">
                Changer
              </button>
            </article>
          </section>
        </main>
      </motion.section>
    </motion.div>
  );
}
