import { PERMISSIONS, type PermissionCode } from '../../shared/permissions';
import type { SettingGroup } from './types';

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

const BILLING_SETTINGS_VIEW_PERMISSIONS = [
  PERMISSIONS.VIEW_BILLING_SETTINGS,
  PERMISSIONS.UPDATE_BILLING_SETTINGS,
  ...GLOBAL_SETTINGS_VIEW_PERMISSIONS,
] as const satisfies readonly PermissionCode[];

const BILLING_SETTINGS_UPDATE_PERMISSIONS = [
  PERMISSIONS.UPDATE_BILLING_SETTINGS,
  ...GLOBAL_SETTINGS_UPDATE_PERMISSIONS,
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

export const SETTINGS_GROUPS: SettingGroup[] = [
  {
    title: 'Configuration utilisateur',
    items: [
      {
        key: 'profile',
        label: 'Compte',
        icon: 'user',
        title: 'Compte',
        subtitle: 'Gere ton compte et tes informations de connexion.',
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
            title: 'Mot de passe',
            description: 'Change ton mot de passe pour proteger ton espace.',
            action: 'Changer',
            href: '/settings/password',
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
    ],
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
        key: 'invitations',
        label: 'Invitations',
        icon: 'mail',
        title: 'Invitations',
        subtitle: 'Consulte les invitations encore en attente.',
        sectionTitle: 'Invitations en attente',
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
        rows: [],
      },
      {
        key: 'profiles',
        label: 'Profil',
        icon: 'user',
        title: 'Profils',
        subtitle: 'Gere les profils disponibles dans l espace.',
        sectionTitle: 'Profils disponibles',
        permissions: [
          PERMISSIONS.VIEW_INVITATIONS_SETTINGS,
          PERMISSIONS.INVITE_COLLABORATORS,
          PERMISSIONS.CREATE_USERS,
          PERMISSIONS.MANAGE_ACCOUNTS,
          ...TEAM_SETTINGS_VIEW_PERMISSIONS,
        ],
        updatePermissions: [
          PERMISSIONS.CREATE_USERS,
          PERMISSIONS.MANAGE_ACCOUNTS,
          ...TEAM_SETTINGS_UPDATE_PERMISSIONS,
        ],
        rows: [],
      },
    ],
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
    ],
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
    ],
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
    ],
  },
  {
    title: 'Facturation',
    items: [
      {
        key: 'subscription',
        label: 'Abonnement',
        icon: 'star',
        title: 'Abonnement',
        subtitle: 'Consulte ton abonnement Acredi Space actuel.',
        sectionTitle: 'Abonnement actuel',
        permissions: BILLING_SETTINGS_VIEW_PERMISSIONS,
        updatePermissions: BILLING_SETTINGS_UPDATE_PERMISSIONS,
        rows: [],
      },
      {
        key: 'invoices',
        label: 'Factures',
        icon: 'file',
        title: 'Factures',
        subtitle: 'Consulte l historique de facturation de ton espace.',
        sectionTitle: 'Historique des factures',
        permissions: BILLING_SETTINGS_VIEW_PERMISSIONS,
        updatePermissions: BILLING_SETTINGS_UPDATE_PERMISSIONS,
        rows: [],
      },
    ],
  },
];
