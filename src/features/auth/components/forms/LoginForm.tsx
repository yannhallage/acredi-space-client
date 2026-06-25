import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildOtpSession,
  getLoginAuthResponse,
  persistOtpSession,
  useLoginMutation,
} from '../../../../shared/api/auth';
import { resolveAuthenticatedRedirect } from '../../../../shared/auth/onboarding';
import { useAuth } from '../../../../shared/context';
import { AcrediLockup, Icon } from '../../../../shared/ui';
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
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
        useTrustedDevice: trustDevice,
      });
      const loginData = response.data;
      const authData = getLoginAuthResponse(loginData);

      if (authData) {
        const userStatus = authData.user?.enabled === false ? 'disabled' : 'active';

        if (userStatus === 'disabled') {
          setMessage(
            "Ce compte est desactive. Contactez votre administrateur pour reactiver l'accès."
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
      setMessage(error instanceof Error ? error.message : 'Connexion echouee');
    }
  }

  const isSubmitting = loginMutation.isPending || authLoading;

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>
      <div className="text-[14px]">
        <p className="eyebrow">Connexion securisee</p>
        <h1>Ravi de vous revoir.</h1>
        <p className="muted">Connectez-vous a votre espace pour retrouver fichiers, messages et reunions.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="text-sm">
          <span>Email professionnel</span>
          <span className="input-wrap">
            <Icon name="mail" size={16} />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </span>
        </label>
        <label className="text-sm">
          <span>Mot de passe</span>
          <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} required />
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
        {message && <p className="auth-error text-red-500 text-sm">{message}</p>}
        <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Entrer dans Acredi Space'}
        </button>
      </form>
    </div>
  );
}
