import { FormEvent, useState } from 'react';
import { useChangeMyPasswordMutation } from '../../../shared/api/users';
import { PasswordInput } from '../../auth/components/PasswordInput';

export function ChangePasswordForm() {
  const changePasswordMutation = useChangeMyPasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

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
      setMessage({
        type: 'error',
        text: 'Le nouveau mot de passe doit contenir au moins 8 caracteres.',
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Mot de passe mis a jour.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Le changement de mot de passe a echoue.',
      });
    }
  }

  const isSubmitting = changePasswordMutation.isPending;

  return (
    <form className="change-password-form" onSubmit={handleSubmit}>
      <label>
        <span>Mot de passe actuel</span>
        <PasswordInput
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isSubmitting}
          autoComplete="current-password"
          required
        />
      </label>

      <label>
        <span>Nouveau mot de passe</span>
        <PasswordInput
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={isSubmitting}
          minLength={8}
          autoComplete="new-password"
          required
        />
      </label>

      <label>
        <span>Confirmer le nouveau mot de passe</span>
        <PasswordInput
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          minLength={8}
          autoComplete="new-password"
          required
        />
      </label>

      {message ? (
        <p className={`change-password-message ${message.type}`}>{message.text}</p>
      ) : null}

      <div className="change-password-actions">
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Mettre a jour'}
        </button>
      </div>
    </form>
  );
}
