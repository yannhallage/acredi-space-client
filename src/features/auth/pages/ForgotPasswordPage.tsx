import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../../shared/api/auth/hooks';
import { AcrediLockup, Icon } from '../../../shared/ui';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPasswordMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    forgotPasswordMutation.mutate(
      {
        email: email.trim().toLowerCase(),
      },
      {
        onSuccess: () => {
          setEmail('');
        },
      }
    );
  }

  const isSubmitting = forgotPasswordMutation.isPending;

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>

      <div>
        <p className="eyebrow">Recuperation</p>
        <h1>Retrouver votre acces</h1>
        <p className="muted">
          Entrez votre email professionnel. Si un compte existe, vous recevrez
          un lien pour choisir un nouveau mot de passe.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>Email professionnel</span>
          <span className="input-wrap">
            <Icon name="mail" size={16} />
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </span>
        </label>

        {forgotPasswordMutation.isSuccess && (
          <p className="auth-success">
            Si cet email existe, un lien de reinitialisation a ete envoye.
          </p>
        )}

        {forgotPasswordMutation.isError && (
          <p className="auth-error">
            Une erreur est survenue. Reessayez dans quelques instants.
          </p>
        )}

        <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
        </button>
      </form>

      <Link className="auth-back-link" to="/login">
        <Icon name="arrowLeft" size={15} />
        Retour a la connexion
      </Link>
    </div>
  );
}
