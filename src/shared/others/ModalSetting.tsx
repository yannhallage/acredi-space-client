import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Icon, type IconName } from '../ui';
import { PERMISSIONS, usePermissions, type PermissionCode } from '../permissions';

type SettingKey =
  | 'profile'
  | 'preferences'
  | 'members'
  | 'roles'
  | 'invitations'
  | 'general'
  | 'dashboard'
  | 'defaults'
  | 'brand'
  | 'emailAccounts'
  | 'emailTemplates'
  | 'assignmentRules'
  | 'slaPolicies';

type SettingRow = {
  action: string;
  description: string;
  title: string;
};

type SettingItem = {
  icon: IconName;
  key: SettingKey;
  label: string;
  permissions: readonly PermissionCode[];
  rows: SettingRow[];
  sectionTitle: string;
  subtitle: string;
  title: string;
  updatePermissions: readonly PermissionCode[];
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

// settings.view opens the settings modal; section visibility needs a
// section/scope permission or an elevated global settings permission.
const GLOBAL_SETTINGS_VIEW_PERMISSIONS = [
  PERMISSIONS.UPDATE_SETTINGS,
  PERMISSIONS.MANAGE_SETTINGS,
] as const satisfies readonly PermissionCode[];

const GLOBAL_SETTINGS_UPDATE_PERMISSIONS = [
  PERMISSIONS.UPDATE_SETTINGS,
  PERMISSIONS.MANAGE_SETTINGS,
] as const satisfies readonly PermissionCode[];

const TEAM_SETTINGS_VIEW_PERMISSIONS = [
  PERMISSIONS.VIEW_TEAM_SETTINGS,
  PERMISSIONS.UPDATE_TEAM_SETTINGS,
  ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
] as const satisfies readonly PermissionCode[];

const TEAM_SETTINGS_UPDATE_PERMISSIONS = [
  PERMISSIONS.UPDATE_TEAM_SETTINGS,
  ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
] as const satisfies readonly PermissionCode[];

const COMPANY_SETTINGS_VIEW_PERMISSIONS = [
  PERMISSIONS.VIEW_COMPANY_SETTINGS,
  PERMISSIONS.UPDATE_COMPANY_SETTINGS,
  ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
] as const satisfies readonly PermissionCode[];

const COMPANY_SETTINGS_UPDATE_PERMISSIONS = [
  PERMISSIONS.UPDATE_COMPANY_SETTINGS,
  ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
] as const satisfies readonly PermissionCode[];

const groups: SettingGroup[] = [
  {
    title: 'Configuration utilisateur',
    items: [
      {
        key: 'profile',
        label: 'Profil',
        icon: 'user',
        title: 'Profil',
        subtitle: 'Gere ton profil et tes informations de connexion.',
        sectionTitle: 'Compte et securite',
        permissions: [
          PERMISSIONS.VIEW_PROFILE_SETTINGS,
          PERMISSIONS.UPDATE_PROFILE_SETTINGS,
          PERMISSIONS.EDIT_OWN_ACCOUNT,
          PERMISSIONS.VIEW_OWN_ROLE_PERMISSIONS,
          ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_PROFILE_SETTINGS,
          PERMISSIONS.EDIT_OWN_ACCOUNT,
          ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Emails et signature',
            description: 'Gere les emails de ton compte et ta signature de communication.',
            action: 'Configurer',
          },
          {
            title: 'Mot de passe',
            description: 'Change ton mot de passe pour proteger ton espace.',
            action: 'Changer',
          },
        ],
      },
      {
        key: 'preferences',
        label: 'Preferences',
        icon: 'settings',
        title: 'Preferences',
        subtitle: 'Ajuste les preferences personnelles de ton espace.',
        sectionTitle: 'Experience utilisateur',
        permissions: [
          PERMISSIONS.VIEW_PREFERENCES_SETTINGS,
          PERMISSIONS.UPDATE_PREFERENCES_SETTINGS,
          ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_PREFERENCES_SETTINGS,
          ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Langue et format',
            description: 'Configure la langue, les formats et les options regionales.',
            action: 'Configurer',
          },
          {
            title: 'Notifications personnelles',
            description: 'Choisis les alertes et rappels visibles dans ton espace.',
            action: 'Modifier',
          },
        ],
      },
    ]
  },
  {
    title: 'Equipe',
    items: [
      {
        key: 'members',
        label: 'Membres',
        icon: 'users',
        title: 'Membres',
        subtitle: 'Consulte et administre les membres de ton equipe.',
        sectionTitle: 'Gestion des membres',
        permissions: [
          PERMISSIONS.VIEW_TEAM_MEMBERS_SETTINGS,
          PERMISSIONS.UPDATE_TEAM_MEMBERS_SETTINGS,
          ...TEAM_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_TEAM_MEMBERS_SETTINGS,
          ...TEAM_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Liste des membres',
            description: 'Controle les profils, equipes et statuts des collaborateurs.',
            action: 'Gerer',
          },
          {
            title: 'Acces equipe',
            description: 'Ajuste les acces rattaches aux membres de cette equipe.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'roles',
        label: 'Roles',
        icon: 'shield',
        title: 'Roles',
        subtitle: 'Gere les roles et les permissions disponibles.',
        sectionTitle: 'Roles et permissions',
        permissions: [
          PERMISSIONS.VIEW_ROLES_SETTINGS,
          PERMISSIONS.UPDATE_ROLES_SETTINGS,
          PERMISSIONS.MANAGE_ROLES_PERMISSIONS,
          ...TEAM_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_ROLES_SETTINGS,
          PERMISSIONS.MANAGE_ROLES_PERMISSIONS,
          ...TEAM_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Roles',
            description: 'Consulte les roles et leur couverture de permissions.',
            action: 'Configurer',
          },
          {
            title: 'Permissions',
            description: 'Ajuste les permissions rattachees aux roles de l espace.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'invitations',
        label: 'Invitations',
        icon: 'mail',
        title: 'Invitations',
        subtitle: 'Pilote les invitations envoyees aux futurs collaborateurs.',
        sectionTitle: 'Invitations equipe',
        permissions: [
          PERMISSIONS.VIEW_INVITATIONS_SETTINGS,
          PERMISSIONS.UPDATE_INVITATIONS_SETTINGS,
          PERMISSIONS.INVITE_COLLABORATORS,
          ...TEAM_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_INVITATIONS_SETTINGS,
          PERMISSIONS.INVITE_COLLABORATORS,
          ...TEAM_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Invitations en attente',
            description: 'Suis les invitations ouvertes et leur statut.',
            action: 'Voir',
          },
          {
            title: 'Nouvelle invitation',
            description: 'Invite un collaborateur dans l espace de travail.',
            action: 'Inviter',
          },
        ],
      },
    ]
  },
  {
    title: 'Configuration systeme',
    items: [
      {
        key: 'general',
        label: 'General',
        icon: 'settings',
        title: 'General',
        subtitle: 'Configure les informations generales de l espace.',
        sectionTitle: 'Parametres generaux',
        permissions: [
          PERMISSIONS.VIEW_GENERAL_SETTINGS,
          PERMISSIONS.UPDATE_GENERAL_SETTINGS,
          ...COMPANY_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_GENERAL_SETTINGS,
          ...COMPANY_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Informations de l organisation',
            description: 'Mets a jour le nom, les details et les options principales.',
            action: 'Configurer',
          },
          {
            title: 'Securite globale',
            description: 'Consulte les reglages de securite appliques a l espace.',
            action: 'Ouvrir',
          },
        ],
      },
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'grid',
        title: 'Dashboard',
        subtitle: 'Controle les options du tableau de bord.',
        sectionTitle: 'Tableau de bord',
        permissions: [
          PERMISSIONS.VIEW_DASHBOARD_SETTINGS,
          PERMISSIONS.UPDATE_DASHBOARD_SETTINGS,
          ...COMPANY_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_DASHBOARD_SETTINGS,
          ...COMPANY_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Widgets',
            description: 'Choisis les donnees visibles dans le tableau de bord.',
            action: 'Configurer',
          },
          {
            title: 'Vue par defaut',
            description: 'Definis l affichage initial des utilisateurs.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'defaults',
        label: 'Defaults',
        icon: 'notes',
        title: 'Defaults',
        subtitle: 'Definis les valeurs par defaut de l espace.',
        sectionTitle: 'Valeurs par defaut',
        permissions: [
          PERMISSIONS.VIEW_DEFAULTS_SETTINGS,
          PERMISSIONS.UPDATE_DEFAULTS_SETTINGS,
          ...COMPANY_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_DEFAULTS_SETTINGS,
          ...COMPANY_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Parametres par defaut',
            description: 'Regle les valeurs utilisees lors de la creation de nouveaux objets.',
            action: 'Configurer',
          },
          {
            title: 'Modeles initiaux',
            description: 'Controle les modeles appliques par defaut.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'brand',
        label: 'Brand',
        icon: 'star',
        title: 'Brand',
        subtitle: 'Personnalise l identite visuelle de l espace.',
        sectionTitle: 'Identite',
        permissions: [
          PERMISSIONS.VIEW_BRAND_SETTINGS,
          PERMISSIONS.UPDATE_BRAND_SETTINGS,
          ...COMPANY_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_BRAND_SETTINGS,
          ...COMPANY_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Logo et couleurs',
            description: 'Ajuste les elements visuels partages par l equipe.',
            action: 'Configurer',
          },
          {
            title: 'Nom public',
            description: 'Controle la denomination affichee dans les interfaces.',
            action: 'Modifier',
          },
        ],
      },
    ]
  },
  {
    title: 'Email',
    items: [
      {
        key: 'emailAccounts',
        label: 'Comptes',
        icon: 'mail',
        title: 'Comptes email',
        subtitle: 'Gere les comptes email connectes a l espace.',
        sectionTitle: 'Comptes',
        permissions: [
          PERMISSIONS.VIEW_EMAIL_ACCOUNTS_SETTINGS,
          PERMISSIONS.UPDATE_EMAIL_ACCOUNTS_SETTINGS,
          ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_EMAIL_ACCOUNTS_SETTINGS,
          ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Comptes connectes',
            description: 'Consulte les boites email synchronisees avec l espace.',
            action: 'Configurer',
          },
          {
            title: 'Signature par defaut',
            description: 'Controle les signatures appliquees aux communications.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'emailTemplates',
        label: 'Templates',
        icon: 'file',
        title: 'Templates email',
        subtitle: 'Configure les templates utilises pour les emails.',
        sectionTitle: 'Templates',
        permissions: [
          PERMISSIONS.VIEW_EMAIL_TEMPLATES_SETTINGS,
          PERMISSIONS.UPDATE_EMAIL_TEMPLATES_SETTINGS,
          ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_EMAIL_TEMPLATES_SETTINGS,
          ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Templates disponibles',
            description: 'Consulte les modeles email actifs dans l espace.',
            action: 'Voir',
          },
          {
            title: 'Edition des templates',
            description: 'Modifie les contenus envoyes par email.',
            action: 'Modifier',
          },
        ],
      },
    ]
  },
  {
    title: 'Automation & regles',
    items: [
      {
        key: 'assignmentRules',
        label: 'Assignment rules',
        icon: 'check',
        title: 'Assignment rules',
        subtitle: 'Controle les regles d assignation automatiques.',
        sectionTitle: 'Regles',
        permissions: [
          PERMISSIONS.VIEW_ASSIGNMENT_RULES_SETTINGS,
          PERMISSIONS.UPDATE_ASSIGNMENT_RULES_SETTINGS,
          ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.UPDATE_ASSIGNMENT_RULES_SETTINGS,
          ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [
          {
            title: 'Regles actives',
            description: 'Consulte les regles qui assignent automatiquement le travail.',
            action: 'Configurer',
          },
          {
            title: 'Priorites',
            description: 'Ajuste l ordre et les conditions des automatisations.',
            action: 'Modifier',
          },
        ],
      },
      {
        key: 'slaPolicies',
        label: 'SLA policies',
        icon: 'shield',
        title: 'SLA policies',
        subtitle: 'Gere les politiques de delai et de suivi.',
        sectionTitle: 'SLA',
        permissions: GLOBAL_SETTINGS_VIEW_PERMISSIONS,
        updatePermissions: GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
        rows: [
          {
            title: 'Politiques SLA',
            description: 'Consulte les politiques de delai configurees pour l equipe.',
            action: 'Voir',
          },
          {
            title: 'Regles de suivi',
            description: 'Ajuste les seuils et conditions de suivi.',
            action: 'Modifier',
          },
        ],
      },
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
  const { hasAnyPermission } = usePermissions();
  const [activeKey, setActiveKey] = useState<SettingKey>('profile');

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => hasAnyPermission(item.permissions)),
        }))
        .filter((group) => group.items.length > 0),
    [hasAnyPermission]
  );

  const visibleItems = useMemo(
    () => visibleGroups.flatMap((group) => group.items),
    [visibleGroups]
  );

  const activeItem = visibleItems.find((item) => item.key === activeKey) ?? visibleItems[0];
  const canUpdateActiveItem = activeItem ? hasAnyPermission(activeItem.updatePermissions) : false;

  useEffect(() => {
    if (activeItem && activeItem.key !== activeKey) {
      setActiveKey(activeItem.key);
    }
  }, [activeItem, activeKey]);

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
          {visibleGroups.map((group) => (
            <section key={group.title} className="modal-setting-group">
              <p>{group.title}</p>
              <div>
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className={item.key === activeItem?.key ? 'modal-setting-item active' : 'modal-setting-item'}
                    type="button"
                    onClick={() => setActiveKey(item.key)}
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
          {activeItem ? (
            <>
              <header>
                <h2 id="settings-modal-title">{activeItem.title}</h2>
                <p>{activeItem.subtitle}</p>
              </header>

              {activeItem.key === 'profile' ? (
                <div className="modal-setting-profile">
                  <Avatar name={userName} size={58} />
                  <div>
                    <div className="modal-setting-profile-title">
                      <h3>{userName}</h3>
                      {canUpdateActiveItem ? <Icon name="edit" size={15} /> : null}
                    </div>
                    <p>{userEmail}</p>
                    <small>{workspaceName}</small>
                  </div>
                </div>
              ) : null}

              <section className="modal-setting-section">
                <h4>{activeItem.sectionTitle}</h4>

                {activeItem.rows.map((row) => (
                  <article className="modal-setting-row" key={row.title}>
                    <div>
                      <strong>{row.title}</strong>
                      <p>{row.description}</p>
                    </div>
                    <button className="button ghost mini" type="button" disabled={!canUpdateActiveItem}>
                      {canUpdateActiveItem ? row.action : 'Lecture seule'}
                    </button>
                  </article>
                ))}
              </section>
            </>
          ) : (
            <header>
              <h2 id="settings-modal-title">Parametres</h2>
              <p>Aucune section disponible avec tes permissions actuelles.</p>
            </header>
          )}
        </main>
      </motion.section>
    </motion.div>
  );
}
