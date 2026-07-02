import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../../../shared/api/auth/hooks';
import { AcrediLockup, Icon } from '../../../../shared/ui';
import { PasswordInput } from '../PasswordInput';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => {
    return searchParams.get('token') ?? '';
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const resetPasswordMutation = useResetPasswordMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError('');

    if (!token) {
      setLocalError('Le lien de reinitialisation est invalide.');
      return;
    }

    if (newPassword.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    resetPasswordMutation.mutate(
      {
        token,
        newPassword,
      },
      {
        onSuccess: () => {
          navigate('/login', {
            replace: true,
            state: {
              message: 'Mot de passe reinitialise avec succes.',
            },
          });
        },
      }
    );
  }

  const isSubmitting = resetPasswordMutation.isPending;

  if (!token) {
    return (
      <div className="login-card">
        <div className="login-mobile-brand">
          <AcrediLockup size={30} fontSize={22} />
        </div>

        <div className="auth-state-badge warning" aria-hidden="true">
          <Icon name="alert" size={20} />
        </div>

        <div>
          <p className="eyebrow">Lien invalide</p>
          <h1>Demander un nouveau lien</h1>
          <p className="muted">
            Le token de reinitialisation est absent ou incomplet. Lancez une
            nouvelle demande pour securiser l'acces au compte.
          </p>
        </div>

        <Link className="button primary button-wide" to="/forgot-password">
          Demander un nouveau lien
        </Link>

        <Link className="auth-back-link" to="/login">
          <Icon name="arrowLeft" size={15} />
          Retour a la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>

      <div className="auth-state-badge" aria-hidden="true">
        <Icon name="shield" size={20} />
      </div>

      <div>
        <p className="eyebrow">Securite</p>
        <h1>Choisir un nouveau mot de passe</h1>
        <p className="muted">
          Utilisez au moins 8 caracteres pour proteger votre espace Acredi Space.
        </p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>Nouveau mot de passe</span>
          <PasswordInput
              placeholder="Minimum 8 caracteres"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
              minLength={8}
              required
            />
        </label>

        <label>
          <span>Confirmer le mot de passe</span>
          <PasswordInput
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
              minLength={8}
              required
            />
        </label>

        {localError && <p className="auth-error">{localError}</p>}

        {resetPasswordMutation.isError && (
          <p className="auth-error">
            Le lien est invalide, expire ou deja utilise.
          </p>
        )}

        <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Reinitialisation...' : 'Reinitialiser le mot de passe'}
        </button>
      </form>

      <Link className="auth-back-link" to="/login">
        <Icon name="arrowLeft" size={15} />
        Retour a la connexion
      </Link>
    </div>
  );
}
