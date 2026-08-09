import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../../../shared/api/auth/hooks';
import { AcrediLockup, Icon } from '../../../../shared/ui';
import { authFeedback, resolveForgotPasswordFeedback, type AuthFeedback } from '../authFeedback';
import { AuthCardBrand } from '../AuthCardBrand';
import { AuthFeedbackBanner } from '../AuthFeedbackBanner';
import { AuthSubmitButton } from '../AuthSubmitButton';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    try {
      await forgotPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
      });

      setEmail('');
      setFeedback(
        authFeedback(
          'success',
          'Vérifiez votre boîte mail',
          'Si un compte est associé à cette adresse, un lien de réinitialisation vient de vous être envoyé.'
        )
      );
    } catch (error) {
      console.error(error);
      setFeedback(resolveForgotPasswordFeedback(error));
    }
  }

  const isSubmitting = forgotPasswordMutation.isPending;

  return (
    <div className="login-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <h1>Retrouver votre acces</h1>
        <p className="muted">
          Entrez votre e-mail. Si un compte existe, vous recevrez un lien pour choisir un nouveau mot
          de passe.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>
            E-mail <em aria-hidden="true">*</em>
          </span>
          <span className="input-wrap">
            <input
              type="email"
              placeholder="Saisissez votre adresse e-mail"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (feedback) setFeedback(null);
              }}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </span>
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
