import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesQuery } from '../../../../shared/api/profiles';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '../../../../shared/api/users';
import { useAuth } from '../../../../shared/context';
import { useTheme } from '../../../../shared/theme';
import { AcrediLockup, Avatar, Icon, type IconName } from '../../../../shared/ui';
import {
  authFeedback,
  resolveProfileCompletionFeedback,
  type AuthFeedback,
} from '../authFeedback';
import { AuthCardBrand } from '../AuthCardBrand';
import { AuthFeedbackBanner } from '../AuthFeedbackBanner';
import { AuthSubmitButton } from '../AuthSubmitButton';

type ThemePreference = 'LIGHT' | 'DARK';
type PhoneKind = 'mobile' | 'work' | 'whatsapp';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const themeOptions: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'LIGHT', label: 'Clair', icon: 'sun' },
  { value: 'DARK', label: 'Sombre', icon: 'moon' },
];

const phoneKindOptions: { value: PhoneKind; label: string }[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'work', label: 'Bureau' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNullableString(value: unknown) {
  const text = readString(value);

  if (!text || text === 'null' || text === 'undefined') {
    return null;
  }

  return text;
}

function normalizeTheme(value: unknown, fallback: ThemePreference = 'LIGHT'): ThemePreference {
  if (value === 'DARK' || value === 'LIGHT') {
    return value;
  }

  return fallback;
}

function profileToId(profile: unknown) {
  return isRecord(profile) ? readString(profile.id) : undefined;
}

function profileToString(profile: unknown) {
  if (!profile) {
    return '';
  }

  if (typeof profile === 'string') {
    return profile;
  }

  if (isRecord(profile)) {
    return readString(profile.name) ?? readString(profile.role) ?? readString(profile.team) ?? '';
  }

  return String(profile);
}

export function ProfileCompletionForm() {
  const { user, updateUser } = useAuth();
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();
  const profilesQuery = useProfilesQuery({ enabled: Boolean(user) });
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initializedUserIdRef = useRef<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneKind, setPhoneKind] = useState<PhoneKind>('mobile');
  const [profileId, setProfileId] = useState('');
  const [profileLabel, setProfileLabel] = useState('');
  const [theme, setTheme] = useState<ThemePreference>('LIGHT');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data]);

  useEffect(() => {
    if (!user) {
      initializedUserIdRef.current = null;
      return;
    }

    // N'initialiser le formulaire qu'une fois par utilisateur : les mises a jour
    // de presence en arriere-plan (usePresenceSocket -> updateUser) recreent
    // l'objet `user`, ce qui sinon effacerait la selection de profil et l'image.
    if (initializedUserIdRef.current === user.id) {
      return;
    }

    initializedUserIdRef.current = user.id;

    const [first = '', ...rest] = (user.name ?? '').split(' ');
    setFirstName(first);
    setLastName(rest.join(' '));
    setPhoneNumber(user.phoneNumber ?? '');
    setProfileId(profileToId(user.profile) ?? '');
    setProfileLabel(profileToString(user.profile));
    setTheme(normalizeTheme(user.appThemePreference, dark ? 'DARK' : 'LIGHT'));
    setAvatarUrl(readNullableString(user.avatarUrl));
    setAvatarFile(null);
    setAvatarFileName('');
    setAvatarPreviewUrl(null);
  }, [dark, user]);

  useEffect(() => {
    if (!avatarPreviewUrl?.startsWith('blob:')) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (profileId || !profileLabel || !profiles.length) {
      return;
    }

    const matchingProfile = profiles.find(
      (item) => item.id === profileLabel || item.name === profileLabel
    );

    if (matchingProfile) {
      setProfileId(matchingProfile.id);
    }
  }, [profileId, profileLabel, profiles]);

  if (!user) {
    return null;
  }

  const selectedProfile = profiles.find((item) => item.id === profileId);
  const profilePlaceholder = profilesQuery.loading
    ? 'Chargement des profils...'
    : profilesQuery.error
      ? 'Profils indisponibles'
      : profiles.length
        ? 'Choisir un profil'
        : 'Aucun profil disponible';
  const displayName = [firstName, lastName].map((value) => value.trim()).filter(Boolean).join(' ') || user.name;
  const currentAvatarSrc = avatarPreviewUrl ?? avatarUrl;
  const isSubmitting = updateProfileMutation.isPending || uploadAvatarMutation.isPending;

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFeedback(null);

    if (!file.type.startsWith('image/')) {
      setFeedback(
        authFeedback(
          'warning',
          'Fichier non pris en charge',
          'Choisissez une image valide (JPG, PNG ou WebP) pour votre photo de profil.'
        )
      );
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setFeedback(
        authFeedback(
          'warning',
          'Image trop volumineuse',
          'La photo de profil doit faire moins de 5 Mo.'
        )
      );
      event.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarFileName(file.name);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarFileName('');
    setAvatarPreviewUrl(null);
    setAvatarUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhoneNumber = phoneNumber.trim();

    if (!avatarFile && !avatarUrl) {
      setFeedback(
        authFeedback(
          'warning',
          'Photo de profil requise',
          'Ajoutez une photo de profil avant de finaliser votre espace.'
        )
      );
      return;
    }

    if (!cleanFirstName || !cleanLastName || !cleanPhoneNumber || !profileId) {
      setFeedback(
        authFeedback(
          'warning',
          'Informations incomplètes',
          'Renseignez votre prénom, nom, téléphone et votre fonction pour continuer.'
        )
      );
      return;
    }

    try {
      let nextAvatarUrl = avatarUrl;
      let uploadedUserAvatarUrl: string | null | undefined;

      if (avatarFile) {
        const uploadedUser = await uploadAvatarMutation.mutateAsync(avatarFile);
        uploadedUserAvatarUrl = uploadedUser.avatarUrl;
        nextAvatarUrl = uploadedUserAvatarUrl ?? avatarUrl;

        if (!nextAvatarUrl) {
          throw new Error("L'API n'a pas renvoye l'URL de la photo.");
        }
      }

      const updatedUser = await updateProfileMutation.mutateAsync({
        appThemePreference: theme,
        avatarUrl: nextAvatarUrl,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phoneNumber: cleanPhoneNumber,
        profileId,
      });

      const selectedProfileName = selectedProfile?.name ?? profileLabel;
      const savedAvatarUrl = updatedUser.avatarUrl ?? uploadedUserAvatarUrl ?? nextAvatarUrl ?? null;

      setDark(theme === 'DARK');
      updateUser({
        ...updatedUser,
        name: `${cleanFirstName} ${cleanLastName}`,
        onboardingStatus: 'COMPLETED',
        phoneNumber: cleanPhoneNumber,
        profile: selectedProfileName
          ? { id: profileId, name: selectedProfileName }
          : updatedUser.profile,
        appThemePreference: theme,
        avatarUrl: savedAvatarUrl,
      });
    } catch (error) {
      console.error(error);
      setFeedback(resolveProfileCompletionFeedback(error));
      return;
    }

    setFeedback(
      authFeedback(
        'success',
        'Profil complété',
        'Vos informations ont été enregistrées. Redirection en cours…'
      )
    );

    setTimeout(() => {
      navigate('/app/dashboard', { replace: true });
    }, 800);
  }

  return (
    <div className="login-card profile-completion-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <div className="profile-completion-heading">
          <h1>Completez votre profil pour continuer</h1>
          <p className="muted">
            Finalisez vos informations pour personnaliser votre espace de travail Acredi Space.
          </p>
        </div>
      </div>

      <form className="login-form profile-completion-form" onSubmit={handleSubmit}>
        <div className="profile-completion-row profile-photo-row">
          <span className="profile-completion-label">Photo de profil</span>
          <div className="profile-photo-control">
            <Avatar name={displayName} size={58} src={currentAvatarSrc} />
            <div className="profile-photo-actions">
              <button
                className="button ghost profile-upload-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Icon name="upload" size={15} />
                Importer
              </button>
              {Boolean(currentAvatarSrc) && (
                <button
                  className="button ghost mini profile-remove-photo"
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isSubmitting}
                >
                  <Icon name="x" size={15} />
                  Retirer
                </button>
              )}
              <input
                ref={fileInputRef}
                className="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarFileName && <small>{avatarFileName}</small>}
            </div>
          </div>
        </div>

        <label className="profile-completion-row">
          <span className="profile-completion-label">
            Nom complet <em aria-hidden="true">*</em>
          </span>
          <span className="profile-completion-name-grid">
            <span className="profile-input-wrap">
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Prenom"
                disabled={isSubmitting}
                required
              />
            </span>
            <span className="profile-input-wrap">
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Nom"
                disabled={isSubmitting}
                required
              />
            </span>
          </span>
        </label>

        <label className="profile-completion-row">
          <span className="profile-completion-label">E-mail</span>
          <span className="profile-input-wrap profile-input-readonly">
            <input type="email" value={user.email} readOnly aria-readonly="true" />
          </span>
        </label>

        <label className="profile-completion-row">
          <span className="profile-completion-label">
            Telephone <em aria-hidden="true">*</em>
          </span>
          <span className="profile-phone-control">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+225 07 00 00 00 00"
              disabled={isSubmitting}
              required
            />
            <select
              value={phoneKind}
              onChange={(event) => setPhoneKind(event.target.value as PhoneKind)}
              disabled={isSubmitting}
              aria-label="Type de telephone"
              required
            >
              {phoneKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="profile-completion-row">
          <span className="profile-completion-label">
            Fonction / Profil <em aria-hidden="true">*</em>
          </span>
          <span className="profile-input-wrap">
            <select
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
              disabled={profilesQuery.loading || !profiles.length || isSubmitting}
              required
            >
              <option value="" disabled>
                {profilePlaceholder}
              </option>
              {profiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        <div className="profile-completion-row profile-theme-row">
          <span className="profile-completion-label">Preference de theme</span>
          <div className="theme-preference-grid" role="radiogroup" aria-label="Preference de theme">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={theme === option.value ? 'theme-preference-card active' : 'theme-preference-card'}
              >
                <input
                  name="theme"
                  type="radio"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  disabled={isSubmitting}
                />
                <Icon name={option.icon} size={16} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {profilesQuery.error && (
          <AuthFeedbackBanner
            feedback={authFeedback(
              'error',
              'Profils indisponibles',
              'Impossible de charger la liste des fonctions. Vérifiez la connexion au serveur, puis réessayez.'
            )}
          />
        )}

        {feedback && <AuthFeedbackBanner feedback={feedback} />}

        <AuthSubmitButton loading={isSubmitting}>Continuer</AuthSubmitButton>
      </form>

      <AuthCardBrand />
    </div>
  );
}
