import { FormEvent, useState } from 'react';
import { useChangeMyPasswordMutation } from '../../../shared/api/users';
import {
  feedback,
  resolveActionFeedback,
  validationFeedback,
  type Feedback,
} from '../../../shared/feedback';
import { FeedbackBanner } from '../../../shared/ui';
import { PasswordInput } from '../../auth/components/PasswordInput';

export function ChangePasswordForm() {
  const changePasswordMutation = useChangeMyPasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<Feedback | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage(validationFeedback('Merci de remplir tous les champs.'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(validationFeedback('Les mots de passe ne correspondent pas.'));
      return;
    }

    if (newPassword.length < 8) {
      setMessage(
        validationFeedback('Le nouveau mot de passe doit contenir au moins 8 caractères.'),
      );
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      setMessage(
        resolveActionFeedback(
          error,
          feedback(
            'error',
            'Mise à jour impossible',
            'Nous n’avons pas pu enregistrer le nouveau mot de passe. Réessayez dans un moment.',
          ),
        ),
      );
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

      {message ? <FeedbackBanner feedback={message} /> : null}

      <div className="change-password-actions">
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Mettre a jour'}
        </button>
      </div>
    </form>
  );
}
