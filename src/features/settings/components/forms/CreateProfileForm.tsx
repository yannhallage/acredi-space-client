import { useState, type FormEvent } from 'react';
import type { ToastIntent } from '../../../../components/app/Toast/Toast';
import { useCreateProfileMutation } from '../../../../shared/api/profiles';
import { Icon } from '../../../../shared/ui';

type CreateProfileFormProps = {
  onCreated: () => void;
  onToast: (intent: ToastIntent, message: string, timeout?: number) => void;
};

export function CreateProfileForm({ onCreated, onToast }: CreateProfileFormProps) {
  const createProfileMutation = useCreateProfileMutation();
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = profileName.trim();
    const description = profileDescription.trim();

    if (!name) {
      onToast('warning', 'Le nom du profil est obligatoire.');
      return;
    }

    try {
      await createProfileMutation.mutateAsync({
        name,
        description: description || null,
      });
      setProfileName('');
      setProfileDescription('');
      onCreated();
      onToast('success', 'Profil ajoute avec succes.');
    } catch (error) {
      onToast(
        'error',
        error instanceof Error ? error.message : 'Impossible de creer le profil.',
        5000
      );
    }
  }

  return (
    <form className="modal-setting-profile-form" onSubmit={handleCreateProfile}>
      <div className="modal-setting-profile-form-fields">
        <label className="modal-setting-profile-field">
          <span>Nom du profil</span>
          <input
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
            placeholder="Developpeur frontend"
            maxLength={160}
          />
        </label>
        <label className="modal-setting-profile-field">
          <span>Description</span>
          <textarea
            value={profileDescription}
            onChange={(event) => setProfileDescription(event.target.value)}
            placeholder="Responsabilites, perimetre ou contexte du profil"
            maxLength={1000}
            rows={3}
          />
        </label>
      </div>
      <div className="modal-setting-profile-form-actions">
        <button className="button primary" type="submit" disabled={createProfileMutation.isPending}>
          {createProfileMutation.isPending ? 'Ajout...' : 'Ajouter le profil'}
        </button>
      </div>
    </form>
  );
}

type CreateProfileDeniedProps = {
  message?: string;
};

export function CreateProfileDenied({
  message = 'Seuls les administrateurs peuvent creer des profils.',
}: CreateProfileDeniedProps) {
  return (
    <div className="modal-setting-inline-state">
      <Icon name="shield" size={16} />
      <span>{message}</span>
    </div>
  );
}
