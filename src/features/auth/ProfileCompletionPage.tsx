import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesQuery } from '../../shared/api/profiles';
import { useUpdateProfileMutation } from '../../shared/api/users';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

type ThemePreference = 'LIGHT' | 'DARK';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'LIGHT', label: 'Clair' },
  { value: 'DARK', label: 'Sombre' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeTheme(value: unknown): ThemePreference {
  return value === 'DARK' ? 'DARK' : 'LIGHT';
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

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Impossible de mettre a jour le profil.';
}

export function ProfileCompletionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const profilesQuery = useProfilesQuery({ enabled: Boolean(user) });
  const updateProfileMutation = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileId, setProfileId] = useState('');
  const [profileLabel, setProfileLabel] = useState('');
  const [theme, setTheme] = useState<ThemePreference>('LIGHT');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const [first = '', ...rest] = (user.name ?? '').split(' ');
    setFirstName(first);
    setLastName(rest.join(' '));
    setPhoneNumber(user.phoneNumber ?? '');
    setProfileLabel(profileToString(user.profile));
    setTheme(normalizeTheme(user.appThemePreference));
  }, [user]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhoneNumber = phoneNumber.trim();

    if (!cleanFirstName || !cleanLastName || !cleanPhoneNumber || !profileId) {
      setMessage({ type: 'error', text: 'Merci de renseigner votre prenom, nom, telephone et votre fonction.' });
      return;
    }

    try {
      const updatedUser = await updateProfileMutation.mutateAsync({
        appThemePreference: theme,
        avatarUrl: user.avatarUrl ?? undefined,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phoneNumber: cleanPhoneNumber || undefined,
        profileId,
      });

      const selectedProfileName = selectedProfile?.name ?? profileLabel;

      updateUser({
        ...updatedUser,
        name: `${cleanFirstName} ${cleanLastName}`,
        onboardingStatus: 'COMPLETED',
        phoneNumber: cleanPhoneNumber || undefined,
        profile: selectedProfileName
          ? { id: profileId, name: selectedProfileName }
          : updatedUser.profile,
        appThemePreference: theme,
      });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
      return;
    }

    setMessage({ type: 'success', text: 'Profil complete avec succes. Redirection...' });

    setTimeout(() => {
      navigate('/app/dashboard', { replace: true });
    }, 800);
  }

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>

      <div className="text-[14px]">
        <p className="eyebrow">Completion du profil</p>
        <h1>Completez votre espace</h1>
        <p className="muted">
          Pour retrouver toutes vos fonctionnalites, finalisez votre profil avant d'acceder au tableau de bord.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="text-sm">
          <span>Prenom</span>
          <span className="input-wrap">
            <Icon name="user" size={16} />
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Nom</span>
          <span className="input-wrap">
            <Icon name="user" size={16} />
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Numero de telephone</span>
          <span className="input-wrap">
            <Icon name="phone" size={16} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Fonction / Profil</span>
          <span className="input-wrap">
            <Icon name="building" size={16} />
            <select
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
              disabled={profilesQuery.loading || !profiles.length || updateProfileMutation.isPending}
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

        {profilesQuery.error ? (
          <p className="auth-error text-red-500 text-sm">
            Impossible de charger les profils. Verifiez que le backend repond sur /api/profiles.
          </p>
        ) : null}

        <fieldset className="text-sm">
          <legend>Preference de theme</legend>
          <div className="radio-grid">
            {themeOptions.map((option) => (
              <label key={option.value} className="radio-card">
                <input
                  name="theme"
                  type="radio"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {message ? (
          <p className={message.type === 'error' ? 'auth-error text-red-500 text-sm' : 'text-green-600 text-sm'}>
            {message.text}
          </p>
        ) : null}

        <button className="button primary button-wide" type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer et continuer'}
        </button>
      </form>
    </div>
  );
}
