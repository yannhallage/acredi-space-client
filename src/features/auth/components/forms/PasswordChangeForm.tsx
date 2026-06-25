import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangeMyPasswordMutation } from '../../../../shared/api/users';
import { resolveAuthenticatedRedirect } from '../../../../shared/auth/onboarding';
import { useAuth } from '../../../../shared/context';
import { AcrediLockup } from '../../../../shared/ui';
import { PasswordInput } from '../PasswordInput';

export function PasswordChangeForm() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const changePasswordMutation = useChangeMyPasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage({ type: 'error', text: 'Merci de remplir tous les champs.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caracteres.' });
      return;
    }

    try {
      const updatedUser = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      const onboardingStatus = updatedUser.onboardingStatus ?? 'COMPLETED';
      const authenticatedUser =
        updateUser({ ...updatedUser, onboardingStatus }) ?? {
          ...user,
          ...updatedUser,
          onboardingStatus,
        };

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Mot de passe mis a jour. Redirection en cours...' });

      setTimeout(() => {
        navigate(resolveAuthenticatedRedirect(authenticatedUser, '/app/dashboard'), { replace: true });
      }, 800);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Le changement de mot de passe a echoue.',
      });
    }
  }

  const isSubmitting = changePasswordMutation.isPending;

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
          <PasswordInput
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />
        </label>

        <label className="text-sm">
          <span>Nouveau mot de passe</span>
          <PasswordInput
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
              minLength={8}
              required
            />
        </label>

        <label className="text-sm">
          <span>Confirmer le nouveau mot de passe</span>
          <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
              minLength={8}
              required
            />
        </label>

        {message ? (
          <p className={message.type === 'error' ? 'auth-error text-red-500 text-sm' : 'text-green-600 text-sm'}>
            {message.text}
          </p>
        ) : null}

        <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Valider'}
        </button>
      </form>
    </div>
  );
}
