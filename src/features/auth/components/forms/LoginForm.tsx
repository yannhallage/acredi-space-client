import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  buildOtpSession,
  getLoginAuthResponse,
  persistOtpSession,
  useLoginMutation,
} from '../../../../shared/api/auth';
import { resolveAuthenticatedRedirect } from '../../../../shared/auth/onboarding';
import { useAuth } from '../../../../shared/context';
import { AcrediLockup } from '../../../../shared/ui';
import { authFeedback, resolveLoginFeedback, type AuthFeedback } from '../authFeedback';
import { AuthCardBrand } from '../AuthCardBrand';
import { AuthFeedbackBanner } from '../AuthFeedbackBanner';
import { AuthSubmitButton } from '../AuthSubmitButton';
import { PasswordInput } from '../PasswordInput';

interface LoginFormProps {
  redirectTo: string;
  authLoading?: boolean;
}

export function LoginForm({ redirectTo, authLoading = false }: LoginFormProps) {
  const { completeAuthSession } = useAuth();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
        useTrustedDevice: trustDevice,
      });
      const loginData = response.data;
      const authData = getLoginAuthResponse(loginData);

      if (authData) {
        if (authData.user?.enabled === false) {
          setFeedback(
            authFeedback(
              'warning',
              'Compte désactivé',
              'Cet accès a été suspendu. Contactez votre administrateur pour le réactiver.'
            )
          );
          return;
        }

        const authenticatedUser = completeAuthSession(authData, {
          persistTrustedDevice: trustDevice,
          trustedDeviceEmail: email,
        });

        navigate(resolveAuthenticatedRedirect(authenticatedUser, redirectTo), { replace: true });
        return;
      }

      const otpSession = { ...buildOtpSession(loginData, email), trustDevice };
      persistOtpSession(otpSession);
      navigate('/verify-otp', {
        state: {
          email: otpSession.email,
          from: { pathname: redirectTo },
        },
      });
    } catch (error) {
      console.error(error);
      setFeedback(resolveLoginFeedback(error));
    }
  }

  const isSubmitting = loginMutation.isPending || authLoading;

  return (
    <div className="login-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <h1>Connectez-vous pour continuer</h1>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <span>
            E-mail <em aria-hidden="true">*</em>
          </span>
          <span className="input-wrap">
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (feedback) setFeedback(null);
              }}
              type="email"
              placeholder="Saisissez votre adresse e-mail"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label>
          <span>
            Mot de passe <em aria-hidden="true">*</em>
          </span>
          <PasswordInput
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Saisissez votre mot de passe"
            autoComplete="current-password"
            required
          />
        </label>
        <div className="login-row text-[11px]">
          <label className="check-row">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(event) => setTrustDevice(event.target.checked)}
            />
            Faire confiance a cet appareil
          </label>
         <button
  type="button"
  className="forgot-password-link"
  onClick={() => navigate("/forgot-password")}
>
  Mot de passe oublié ?
</button>
        </div>
        {feedback && <AuthFeedbackBanner feedback={feedback} />}
        <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Entrer dans Acredi Space'}
        </button>
        <p className="login-footnote">
          Pas encore de compte ? <Link to="/signup">Creer un compte</Link>
        </p>
      </form>

      <div className="login-card-footer">
        <button
          type="button"
          className="forgot-password-link"
          onClick={() => window.location.href= "/forgot-password"}
        >
          Vous ne pouvez pas vous connecter ?
        </button>
      </div>

      <AuthCardBrand />
    </div>
  );
}
