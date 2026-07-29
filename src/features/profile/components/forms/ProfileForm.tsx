import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useUploadAvatarMutation } from '../../../../shared/api/users';
import { useAuth } from '../../../../shared/context';
import { Avatar, Card, Icon } from '../../../../shared/ui';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const preferences = [
  ['Langue', 'Francais'],
  ['Fuseau horaire', 'Atlantic/Reykjavik'],
  ['Theme', 'Synchronise avec Acredi Space'],
  ['Notifications', 'Mentions et reunions']
];

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Impossible de mettre a jour la photo.";
}

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const avatarSrc = avatarPreviewUrl ?? user?.avatarUrl;
  const isUploadingAvatar = uploadAvatarMutation.isPending;

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

    setMessage(null);

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Merci de choisir une image valide.' });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setMessage({ type: 'error', text: 'La photo doit faire moins de 5 Mo.' });
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);

    try {
      const updatedUser = await uploadAvatarMutation.mutateAsync(file);
      updateUser(updatedUser);
      setAvatarPreviewUrl(null);
      setMessage({ type: 'success', text: 'Photo de profil mise a jour.' });
    } catch (error) {
      setAvatarPreviewUrl(null);
      setMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      event.target.value = '';
    }
  }

  return (
    <>
      <section className="profile-hero">
        <div className="profile-pattern" />
        <div className="profile-avatar-control">
          <Avatar
            name={user?.name ?? 'Mohamed Doumbia'}
            size={84}
            presence={user?.presence ?? 'online'}
            ring="var(--bg)"
            src={avatarSrc}
          />
          <button
            className="profile-avatar-edit"
            type="button"
            aria-label="Changer la photo"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            <Icon name={isUploadingAvatar ? 'refresh' : 'camera'} size={15} />
          </button>
          <input
            ref={fileInputRef}
            className="profile-avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="profile-hero-main">
          <p className="eyebrow">Profil utilisateur</p>
          <h1>{user?.name}</h1>
          <p>{user?.role} - {user?.team}</p>
          {message ? (
            <small className={`profile-avatar-message ${message.type}`}>
              {message.text}
            </small>
          ) : null}
        </div>
        <button
          className="button primary"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
        >
          <Icon name={isUploadingAvatar ? 'refresh' : 'camera'} size={15} />
          {isUploadingAvatar ? 'Import...' : 'Changer photo'}
        </button>
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
    </>
  );
}
