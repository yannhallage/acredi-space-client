import { useCallback, useState } from 'react';
import Toast, { type ToastIntent } from '../../../../components/app/Toast/Toast';
import {
  useDeleteProfileMutation,
  useProfilesQuery,
  type ProfileResponse,
} from '../../../../shared/api/profiles';
import { useAuth } from '../../../../shared/context';
import { getFriendlyErrorMessage } from '../../../../shared/feedback';
import { Icon } from '../../../../shared/ui';
import { formatProfileDate } from '../../utils';
import { CreateProfileDenied, CreateProfileForm } from '../forms/CreateProfileForm';

type ToastState = {
  show: boolean;
  intent: ToastIntent;
  message: string;
};

export function ProfilesSection() {
  const { user } = useAuth();
  const profilesQuery = useProfilesQuery({ enabled: true });
  const deleteProfileMutation = useDeleteProfileMutation();
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: 'success',
    message: '',
  });
  const canManageProfiles = user?.adminRole === 'admin';
  const profiles: ProfileResponse[] = profilesQuery.data ?? [];

  const showToast = useCallback((intent: ToastIntent, message: string, timeout = 4000) => {
    setToast({ show: true, intent, message });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, timeout);
  }, []);

  async function handleDeleteProfile(profile: ProfileResponse) {
    const confirmed = window.confirm(
      `Supprimer le profil « ${profile.name} » ? Cette action est irreversible.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingProfileId(profile.id);

    try {
      await deleteProfileMutation.mutateAsync(profile.id);
      await profilesQuery.refetch().catch(() => undefined);
      showToast('success', 'Profil supprime avec succes.');
    } catch (error) {
      showToast(
        'error',
        getFriendlyErrorMessage(error, 'Impossible de supprimer le profil.'),
        5000
      );
    } finally {
      setDeletingProfileId(null);
    }
  }

  return (
    <section className="modal-setting-section modal-setting-profiles">
      {toast.show ? <Toast intent={toast.intent} message={toast.message} /> : null}

      <div className="modal-setting-section-heading">
        <div>
          <h4>Profils</h4>
          <p>Profils disponibles pour les utilisateurs de l'espace.</p>
        </div>
        <button
          className="button ghost mini"
          type="button"
          onClick={() => profilesQuery.refetch().catch(() => undefined)}
          disabled={profilesQuery.loading}
        >
          {profilesQuery.loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {profilesQuery.error ? (
        <div className="modal-setting-inline-state error">
          <Icon name="alert" size={16} />
          <span>
            {getFriendlyErrorMessage(
              profilesQuery.error,
              'Nous n’avons pas pu charger les profils.',
            )}
          </span>
        </div>
      ) : null}

      <div
        className={
          canManageProfiles
            ? 'modal-setting-profile-table modal-setting-profile-table-manage'
            : 'modal-setting-profile-table'
        }
        role="table"
        aria-label="Profils"
      >
        <div className="modal-setting-profile-table-head" role="row">
          <span role="columnheader">Profil</span>
          <span role="columnheader">Description</span>
          <span role="columnheader">Creation</span>
          {canManageProfiles ? <span role="columnheader">Actions</span> : null}
        </div>

        {profilesQuery.loading
          ? ['profile-skeleton-1', 'profile-skeleton-2', 'profile-skeleton-3'].map((item) => (
              <div className="modal-setting-profile-row skeleton" key={item} role="row">
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                {canManageProfiles ? <span className="skeleton-line" /> : null}
              </div>
            ))
          : null}

        {!profilesQuery.loading && profiles.length === 0 && !profilesQuery.error ? (
          <div className="modal-setting-profile-empty">
            <Icon name="users" size={16} />
            <strong>Aucun profil</strong>
            <span>Les profils ajoutes apparaitront ici.</span>
          </div>
        ) : null}

        {!profilesQuery.loading
          ? profiles.map((profile) => (
              <div className="modal-setting-profile-row" key={profile.id} role="row">
                <strong role="cell">{profile.name}</strong>
                <span role="cell">{profile.description || 'Aucune description'}</span>
                <small role="cell">{formatProfileDate(profile.createdAt)}</small>
                {canManageProfiles ? (
                  <div className="modal-setting-profile-actions" role="cell">
                    <button
                      className="modal-setting-profile-delete"
                      type="button"
                      aria-label={`Supprimer ${profile.name}`}
                      disabled={deletingProfileId === profile.id || deleteProfileMutation.isPending}
                      onClick={() => {
                        void handleDeleteProfile(profile);
                      }}
                    >
                      <Icon name="trash" size={14} />
                      {deletingProfileId === profile.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          : null}
      </div>

      {canManageProfiles ? (
        <CreateProfileForm
          onCreated={() => profilesQuery.refetch().catch(() => undefined)}
          onToast={showToast}
        />
      ) : (
        <CreateProfileDenied />
      )}
    </section>
  );
}
