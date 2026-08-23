import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangeMyPasswordMutation } from '../../../../shared/api/users';
import { resolveAuthenticatedRedirect } from '../../../../shared/auth/onboarding';
import { useAuth } from '../../../../shared/context';
import { AcrediLockup } from '../../../../shared/ui';
import { authFeedback, resolvePasswordChangeFeedback, type AuthFeedback } from '../authFeedback';
import { AuthCardBrand } from '../AuthCardBrand';
import { AuthFeedbackBanner } from '../AuthFeedbackBanner';
import { AuthSubmitButton } from '../AuthSubmitButton';
import { PasswordInput } from '../PasswordInput';

export function PasswordChangeForm() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const changePasswordMutation = useChangeMyPasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setFeedback(
        authFeedback(
          'warning',
          'Champs requis',
          'Renseignez le mot de passe actuel, le nouveau mot de passe et sa confirmation.'
        )
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback(
        authFeedback(
          'warning',
          'Confirmation incorrecte',
          'Les deux mots de passe ne correspondent pas. Vérifiez votre saisie, puis réessayez.'
        )
      );
      return;
    }

    if (newPassword.length < 8) {
      setFeedback(
        authFeedback(
          'warning',
          'Mot de passe trop court',
          'Choisissez un mot de passe d’au moins 8 caractères pour sécuriser votre compte.'
        )
      );
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
      setFeedback(
        authFeedback(
          'success',
          'Mot de passe mis à jour',
          'Votre compte est sécurisé. Redirection en cours…'
        )
      );

      setTimeout(() => {
        navigate(resolveAuthenticatedRedirect(authenticatedUser, '/app/dashboard'), { replace: true });
      }, 800);
    } catch (error) {
      console.error(error);
      setFeedback(resolvePasswordChangeFeedback(error));
    }
  }

  const isSubmitting = changePasswordMutation.isPending;

  return (
    <div className="login-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <h1>Changez votre mot de passe pour continuer</h1>
        <p className="muted">
          Avant d'entrer dans Acredi Space, choisissez un nouveau mot de passe pour securiser votre
          compte.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>
            Mot de passe actuel <em aria-hidden="true">*</em>
          </span>
          <PasswordInput
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Saisissez votre mot de passe actuel"
            autoComplete="current-password"
            disabled={isSubmitting}
            required
          />
        </label>

        <label>
          <span>
            Nouveau mot de passe <em aria-hidden="true">*</em>
          </span>
          <PasswordInput
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Minimum 8 caracteres"
            autoComplete="new-password"
            disabled={isSubmitting}
            minLength={8}
            required
          />
        </label>

        <label>
          <span>
            Confirmer le mot de passe <em aria-hidden="true">*</em>
          </span>
          <PasswordInput
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Confirmez le nouveau mot de passe"
            autoComplete="new-password"
            disabled={isSubmitting}
            minLength={8}
            required
          />
        </label>

        {feedback && <AuthFeedbackBanner feedback={feedback} />}

        <AuthSubmitButton loading={isSubmitting}>Continuer</AuthSubmitButton>
      </form>

      <AuthCardBrand />
    </div>
  );
}
