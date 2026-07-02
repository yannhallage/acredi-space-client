import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useUploadAvatarMutation } from '../api/users';
import {
  useCreateProfileMutation,
  useDeleteProfileMutation,
  useProfilesQuery,
} from '../api/profil_modal/hooks';
import { PresetAvatarPicker, extractPresetAvatarFile } from '../avatars/PresetAvatarPicker';
import type { AvatarPreset } from '../avatars/presets';
import { useAuth } from '../context';
import { Avatar, Icon, type IconName } from '../ui';
import { PERMISSIONS, usePermissions, type PermissionCode } from '../permissions';

type SettingKey =
  | 'account'
  | 'preferences'
  | 'members'
  | 'roles'
  | 'profiles'
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

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function getAvatarErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Impossible de mettre a jour la photo.';
}

function applyAvatarUpdate(
  uploadedAvatar: { avatarUrl?: string | null },
  fallbackAvatarUrl?: string
) {
  const avatarUrl = uploadedAvatar.avatarUrl ?? fallbackAvatarUrl;

  if (!avatarUrl) {
    throw new Error("L'API n'a pas renvoye l'URL de l'image.");
  }

  return {
    ...uploadedAvatar,
    avatarUrl,
  };
}

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
        key: 'account',
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
        key: 'profiles',
        label: 'Profils',
        icon: 'user',
        title: 'Profils',
        subtitle: 'Ajoute et supprime les profils disponibles pour les comptes utilisateurs.',
        sectionTitle: 'Profils enregistres',
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
        rows: [],
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


function ProfilesSettingsTable({ canUpdate }: { canUpdate: boolean }) {
  const { data: profiles = [], isLoading, error } = useProfilesQuery();
  const createProfileMutation = useCreateProfileMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
    };

    if (!payload.name) {
      return;
    }

    createProfileMutation.mutate(payload, {
      onSuccess: () => {
        setName('');
        setDescription('');
      },
    });
  }

  function handleDelete(profileId: string) {
    const confirmed = window.confirm('Supprimer ce profil ?');

    if (!confirmed) {
      return;
    }

    deleteProfileMutation.mutate(profileId);
  }

  return (
    <section className="modal-setting-profiles">
      <form className="modal-setting-profile-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="profile-name">Nom du profil</label>
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Manager, Collaborateur, RH"
            disabled={!canUpdate || createProfileMutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="profile-description">Description</label>
          <input
            id="profile-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Profil responsable d'equipe"
            disabled={!canUpdate || createProfileMutation.isPending}
          />
        </div>

        <button
          className="button primary mini"
          type="submit"
          disabled={!canUpdate || createProfileMutation.isPending}
        >
          {createProfileMutation.isPending ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      {isLoading ? (
        <p className="modal-setting-empty">Chargement des profils...</p>
      ) : error ? (
        <p className="modal-setting-error">
  Impossible de charger les profils :{' '}
  {error instanceof Error ? error.message : 'Erreur inconnue'}
</p>
      ) : profiles.length === 0 ? (
        <p className="modal-setting-empty">Aucun profil enregistre.</p>
      ) : (
        <div className="modal-setting-table-wrapper">
          <table className="modal-setting-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Date creation</th>
                <th aria-label="Actions" />
              </tr>
            </thead>

            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>
                    <strong>{profile.name}</strong>
                  </td>

                  <td>{profile.description || 'Aucune description'}</td>

                  <td>
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>

                  <td className="modal-setting-table-actions">
                    <button
                      className="button ghost mini danger"
                      type="button"
                      disabled={!canUpdate || deleteProfileMutation.isPending}
                      onClick={() => handleDelete(profile.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface ModalSettingProps {
  userEmail: string;
  userName: string;
  workspaceName: string;
  onClose: () => void;
}

export default function ModalSetting({ userEmail, userName, workspaceName, onClose }: ModalSettingProps) {
  const { user, updateUser } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeKey, setActiveKey] = useState<SettingKey>('account');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

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
  const isUploadingAvatar = uploadAvatarMutation.isPending;
  const avatarSrc = avatarPreviewUrl ?? user?.avatarUrl ?? null;

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

  useEffect(() => {
    if (!avatarPreviewUrl?.startsWith('blob:')) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarMessage(null);
    setSelectedPresetId(null);

    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ type: 'error', text: 'Merci de choisir une image valide.' });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarMessage({ type: 'error', text: 'La photo doit faire moins de 5 Mo.' });
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);

    try {
      const uploadedAvatar = await uploadAvatarMutation.mutateAsync(file);
      updateUser(applyAvatarUpdate(uploadedAvatar));
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'success', text: 'Photo de profil mise a jour.' });
    } catch (error) {
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'error', text: getAvatarErrorMessage(error) });
    } finally {
      event.target.value = '';
    }
  }

  async function handlePresetAvatarSelect(preset: AvatarPreset) {
    if (!canUpdateActiveItem || isUploadingAvatar) {
      return;
    }

    setAvatarMessage(null);
    setSelectedPresetId(preset.id);
    setAvatarPreviewUrl(preset.url);

    try {
      const file = await extractPresetAvatarFile(preset);
      const uploadedAvatar = await uploadAvatarMutation.mutateAsync(file);
      updateUser(applyAvatarUpdate(uploadedAvatar, preset.url));
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'success', text: 'Avatar mis a jour.' });
    } catch (error) {
      setAvatarPreviewUrl(null);
      setSelectedPresetId(null);
      setAvatarMessage({ type: 'error', text: getAvatarErrorMessage(error) });
    }
  }

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

              {activeItem.key === 'account' ? (
                <div className="modal-setting-profile">
                  <div className="modal-setting-profile-main">
                    <div className="modal-setting-avatar-control">
                      <Avatar name={userName} size={48} src={avatarSrc} />
                      {canUpdateActiveItem ? (
                        <button
                          className="modal-setting-avatar-button"
                          type="button"
                          aria-label="Changer la photo"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                        >
                          <Icon name={isUploadingAvatar ? 'refresh' : 'camera'} size={14} />
                        </button>
                      ) : null}
                      <input
                        ref={fileInputRef}
                        className="modal-setting-avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={!canUpdateActiveItem || isUploadingAvatar}
                      />
                    </div>
                    <div className="modal-setting-profile-details">
                      <div className="modal-setting-profile-title">
                        <h3>{userName}</h3>
                        {canUpdateActiveItem ? (
                          <button
                            className="modal-setting-photo-action"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                          >
                            <Icon name={isUploadingAvatar ? 'refresh' : 'camera'} size={14} />
                            {isUploadingAvatar ? 'Import...' : 'Changer photo'}
                          </button>
                        ) : null}
                      </div>
                      <p>{userEmail}</p>
                      <small>{workspaceName}</small>
                      {avatarMessage ? (
                        <small className={`modal-setting-avatar-message ${avatarMessage.type}`}>
                          {avatarMessage.text}
                        </small>
                      ) : null}
                    </div>
                  </div>

                  {canUpdateActiveItem ? (
                    <PresetAvatarPicker
                      disabled={isUploadingAvatar}
                      selectedPresetId={selectedPresetId}
                      onSelect={(preset) => {
                        void handlePresetAvatarSelect(preset);
                      }}
                    />
                  ) : null}
                </div>
              ) : null}

              {activeItem.key === 'profiles' ? (
                <ProfilesSettingsTable canUpdate={canUpdateActiveItem} />
              ) : null}

              {activeItem.key !== 'profiles' ? (
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
              ) : null}
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
