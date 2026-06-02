import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

const themeOptions = [
  { value: 'LIGHT', label: 'Clair' },
  { value: 'DARK', label: 'Sombre' },
];

function profileToString(profile: unknown) {
  if (!profile) return '';
  if (typeof profile === 'string') return profile;
  if (typeof profile === 'object') {
    // prefer a role or team if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = profile as any;
    return (p.role ?? p.team ?? JSON.stringify(p)) as string;
  }
  return String(profile);
}

export function ProfileCompletionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profile, setProfile] = useState('');
  const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const [first = '', ...rest] = (user.name ?? '').split(' ');
    setFirstName(first);
    setLastName(rest.join(' '));
    setPhoneNumber(user.phoneNumber ?? '');
    setProfile(profileToString(user.profile));
    setTheme((user.appThemePreference as 'LIGHT' | 'DARK') ?? 'LIGHT');
  }, [user]);

  if (!user) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!firstName.trim() || !lastName.trim() || !profile.trim()) {
      setMessage({ type: 'error', text: "Merci de renseigner votre prénom, nom et votre fonction." });
      return;
    }

    try {
      updateUser?.({
        name: `${firstName.trim()} ${lastName.trim()}`,
        onboardingStatus: 'COMPLETED',
        phoneNumber: phoneNumber.trim() || undefined,
        profile: profile.trim(),
        appThemePreference: theme,
      });

      setMessage({ type: 'success', text: 'Profil complété avec succès. Redirection...' });

      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 800);
    } catch (err) {
      setMessage({ type: 'error', text: 'Impossible de mettre à jour le profil.' });
    }
  }

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>

      <div className="text-[14px]">
        <p className="eyebrow">Completion du profil</p>
        <h1>Complétez votre espace</h1>
        <p className="muted">
          Pour retrouver toutes vos fonctionnalités, finalisez votre profil avant d'accéder au tableau de bord.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="text-sm">
          <span>Prénom</span>
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
          <span>Numéro de téléphone</span>
          <span className="input-wrap">
            <Icon name="phone" size={16} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Fonction / Profil</span>
          <span className="input-wrap">
            <Icon name="briefcase" size={16} />
            <input
              type="text"
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
              required
            />
          </span>
        </label>

        <fieldset className="text-sm">
          <legend>Préférence de thème</legend>
          <div className="radio-grid">
            {themeOptions.map((option) => (
              <label key={option.value} className="radio-card">
                <input
                  name="theme"
                  type="radio"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value as 'LIGHT' | 'DARK')}
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

        <button className="button primary button-wide" type="submit">
          Enregistrer et continuer
        </button>
      </form>
    </div>
  );
}
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

const themeOptions = [
  { value: 'LIGHT', label: 'Clair' },
  { value: 'DARK', label: 'Sombre' },
];

export function ProfileCompletionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(
    user?.name?.split(' ').slice(1).join(' ') ?? ''
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [profile, setProfile] = useState(user?.profile ?? '');
  const [theme, setTheme] = useState(user?.appThemePreference ?? 'LIGHT');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const [first = '', ...rest] = (user.name ?? '').split(' ');
    setFirstName(first);
    setLastName(rest.join(' '));
    setPhoneNumber(user.phoneNumber ?? '');
    setProfile(user.profile ?? '');
    setTheme(user.appThemePreference ?? 'LIGHT');
  }, [user]);

  if (!user) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    import { FormEvent, useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../../shared/context';
    import { AcrediLockup, Icon } from '../../shared/ui';

    const themeOptions = [
      { value: 'LIGHT', label: 'Clair' },
      { value: 'DARK', label: 'Sombre' },
    ];

    function profileToString(profile: unknown) {
      if (!profile) return '';
      if (typeof profile === 'string') return profile;
      if (typeof profile === 'object') {
        // prefer a role or team if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profile as any;
        return (p.role ?? p.team ?? JSON.stringify(p)) as string;
      }
      return String(profile);
    }

    export function ProfileCompletionPage() {
      const { user, updateUser } = useAuth();
      const navigate = useNavigate();

      const [firstName, setFirstName] = useState('');
      const [lastName, setLastName] = useState('');
      const [phoneNumber, setPhoneNumber] = useState('');
      const [profile, setProfile] = useState('');
      const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');
      const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

      useEffect(() => {
        if (!user) return;

        const [first = '', ...rest] = (user.name ?? '').split(' ');
        setFirstName(first);
        setLastName(rest.join(' '));
        setPhoneNumber(user.phoneNumber ?? '');
        setProfile(profileToString(user.profile));
        setTheme((user.appThemePreference as 'LIGHT' | 'DARK') ?? 'LIGHT');
      }, [user]);

      if (!user) return null;

      function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        if (!firstName.trim() || !lastName.trim() || !profile.trim()) {
          setMessage({ type: 'error', text: "Merci de renseigner votre prénom, nom et votre fonction." });
          return;
        }

        try {
          updateUser?.({
            name: `${firstName.trim()} ${lastName.trim()}`,
            onboardingStatus: 'COMPLETED',
            phoneNumber: phoneNumber.trim() || undefined,
            profile: profile.trim(),
            appThemePreference: theme,
          });

          setMessage({ type: 'success', text: 'Profil complété avec succès. Redirection...' });

          setTimeout(() => {
            navigate('/app/dashboard', { replace: true });
          }, 800);
        } catch (err) {
          setMessage({ type: 'error', text: 'Impossible de mettre à jour le profil.' });
        }
      }

      return (
        <div className="login-card">
          <div className="login-mobile-brand">
            <AcrediLockup size={30} fontSize={22} />
          </div>

          <div className="text-[14px]">
            <p className="eyebrow">Completion du profil</p>
            <h1>Complétez votre espace</h1>
            <p className="muted">
              Pour retrouver toutes vos fonctionnalités, finalisez votre profil avant d'accéder au tableau de bord.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="text-sm">
              <span>Prénom</span>
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
              <span>Numéro de téléphone</span>
              <span className="input-wrap">
                <Icon name="phone" size={16} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </span>
            </label>

            <label className="text-sm">
              <span>Fonction / Profil</span>
              <span className="input-wrap">
                <Icon name="briefcase" size={16} />
                <input
                  type="text"
                  value={profile}
                  onChange={(event) => setProfile(event.target.value)}
                  required
                />
              </span>
            </label>

            <fieldset className="text-sm">
              <legend>Préférence de thème</legend>
              <div className="radio-grid">
                {themeOptions.map((option) => (
                  <label key={option.value} className="radio-card">
                    <input
                      name="theme"
                      type="radio"
                      value={option.value}
                      checked={theme === option.value}
                      onChange={() => setTheme(option.value as 'LIGHT' | 'DARK')}
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

            <button className="button primary button-wide" type="submit">
              Enregistrer et continuer
            </button>
          </form>
        </div>
      );
    }
