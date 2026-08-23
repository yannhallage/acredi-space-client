import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../../../shared/api/auth/hooks';
import { AcrediLockup, Icon } from '../../../../shared/ui';
import { authFeedback, resolveResetPasswordFeedback, type AuthFeedback } from '../authFeedback';
import { AuthCardBrand } from '../AuthCardBrand';
import { AuthFeedbackBanner } from '../AuthFeedbackBanner';
import { AuthSubmitButton } from '../AuthSubmitButton';
import { PasswordInput } from '../PasswordInput';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => {
    return searchParams.get('token') ?? '';
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  const resetPasswordMutation = useResetPasswordMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!token) {
      setFeedback(
        authFeedback(
          'warning',
          'Lien invalide',
          'Ce lien de réinitialisation est incomplet. Demandez un nouveau lien pour continuer.'
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

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      navigate('/login', {
        replace: true,
        state: {
          message: 'Mot de passe reinitialise avec succes.',
        },
      });
    } catch (error) {
      console.error(error);
      setFeedback(resolveResetPasswordFeedback(error));
    }
  }

  const isSubmitting = resetPasswordMutation.isPending;

  if (!token) {
    return (
      <div className="login-card">
        <div className="login-card-header">
          <AcrediLockup size={34} fontSize={24} onLight />
          <h1>Demander un nouveau lien</h1>
          <p className="muted">
            Le lien de reinitialisation est absent ou incomplet. Lancez une nouvelle demande pour
            securiser l'acces au compte.
          </p>
        </div>

        <AuthFeedbackBanner
          feedback={authFeedback(
            'warning',
            'Lien invalide',
            'Ce lien de réinitialisation ne peut pas être utilisé. Demandez un nouveau lien pour continuer.'
          )}
        />

        <Link className="button primary button-wide auth-submit-btn" to="/forgot-password">
          Continuer
        </Link>

        <div className="login-card-footer">
          <Link className="auth-back-link" to="/login">
            <Icon name="arrowLeft" size={15} />
            Retour a la connexion
          </Link>
        </div>

        <AuthCardBrand />
      </div>
    );
  }

  return (
    <div className="login-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <h1>Choisissez un nouveau mot de passe</h1>
        <p className="muted">
          Utilisez au moins 8 caracteres pour proteger votre espace Acredi Space.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>
            Nouveau mot de passe <em aria-hidden="true">*</em>
          </span>
          <PasswordInput
            placeholder="Minimum 8 caracteres"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
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
            placeholder="Confirmez le mot de passe"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
            autoComplete="new-password"
            disabled={isSubmitting}
            minLength={8}
            required
          />
        </label>

        {feedback && <AuthFeedbackBanner feedback={feedback} />}

        <AuthSubmitButton loading={isSubmitting}>Continuer</AuthSubmitButton>
      </form>

      <div className="login-card-footer">
        <Link className="auth-back-link" to="/login">
          <Icon name="arrowLeft" size={15} />
          Retour a la connexion
        </Link>
      </div>

      <AuthCardBrand />
    </div>
  );
}
