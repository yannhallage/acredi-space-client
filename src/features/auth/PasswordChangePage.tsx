import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';

export function PasswordChangePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!user) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Merci de remplir tous les champs.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    updateUser?.({ onboardingStatus: 'COMPLETED' });
    setMessage({ type: 'success', text: 'Mot de passe mis à jour. Redirection en cours…' });

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
        <p className="eyebrow">Action requise</p>
        <h1>Changer votre mot de passe</h1>
        <p className="muted">
          Avant d'entrer dans Acredi Space, terminez la verification de votre compte en choisissant un nouveau mot de passe.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="text-sm">
          <span>Mot de passe actuel</span>
          <span className="input-wrap">
            <Icon name="lock" size={16} />
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Nouveau mot de passe</span>
          <span className="input-wrap">
            <Icon name="lock" size={16} />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </span>
        </label>

        <label className="text-sm">
          <span>Confirmer le nouveau mot de passe</span>
          <span className="input-wrap">
            <Icon name="lock" size={16} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </span>
        </label>

        {message ? (
          <p className={message.type === 'error' ? 'auth-error text-red-500 text-sm' : 'text-green-600 text-sm'}>
            {message.text}
          </p>
        ) : null}

        <button className="button primary button-wide" type="submit">
          Valider
        </button>
      </form>
    </div>
  );
}
