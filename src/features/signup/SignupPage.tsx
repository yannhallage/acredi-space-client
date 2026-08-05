import { FormEvent, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  buildOtpSession,
  persistOtpSession,
  useSignupStartMutation,
  useSignupVerifyEmailMutation,
  getOtpSession,
} from '../../shared/api/auth';
import { resolveAuthenticatedRedirect } from '../../shared/auth/onboarding';
import { useAuth } from '../../shared/context';
import { AcrediLockup, Icon } from '../../shared/ui';
import { PasswordInput } from '../auth/components/PasswordInput';

type SignupStep = 'account' | 'otp';

export function SignupPage() {
  const { isAuthenticated, user, completeAuthSession } = useAuth();
  const navigate = useNavigate();
  const startMutation = useSignupStartMutation();
  const verifyMutation = useSignupVerifyEmailMutation();

  const [step, setStep] = useState<SignupStep>('account');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [message, setMessage] = useState('');
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  if (isAuthenticated) {
    return <Navigate to={resolveAuthenticatedRedirect(user)} replace />;
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await startMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      const otpSession = buildOtpSession(response.data, email.trim());
      persistOtpSession(otpSession);
      setStep('otp');
      setOtp(Array(6).fill(''));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Inscription echouee');
    }
  }

  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setMessage('');
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const code = otp.join('');
    if (code.length !== 6) {
      setMessage('Veuillez saisir les 6 chiffres du code.');
      return;
    }

    const session = getOtpSession();
    if (!session?.challengeId) {
      setMessage('Session OTP expiree. Recommencez l’inscription.');
      setStep('account');
      return;
    }

    try {
      const response = await verifyMutation.mutateAsync({
        otpId: session.challengeId,
        code,
        email: session.email,
      });
      const authenticatedUser = completeAuthSession(response.data, {
        persistTrustedDevice: false,
      });
      navigate(resolveAuthenticatedRedirect(authenticatedUser, '/signup/organization'), {
        replace: true,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Code invalide ou expire');
    }
  }

  const isSubmitting = startMutation.isPending || verifyMutation.isPending;

  return (
    <div className="login-card">
      <div className="login-mobile-brand">
        <AcrediLockup size={30} fontSize={22} />
      </div>

      {step === 'account' ? (
        <>
          <div className="text-[14px]">
            <p className="eyebrow">Etape 1 / 4</p>
            <h1>Creez votre compte</h1>
            <p className="muted">
              Renseignez votre identite pour demarrer l’espace de votre organisation.
            </p>
          </div>

          <form className="login-form" onSubmit={handleAccountSubmit}>
            <div className="signup-name-row">
              <label className="text-sm">
                <span>Prenom</span>
                <span className="input-wrap">
                  <Icon name="user" size={16} />
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </span>
              </label>
              <label className="text-sm">
                <span>Nom</span>
                <span className="input-wrap">
                  <Icon name="user" size={16} />
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </span>
              </label>
            </div>
            <label className="text-sm">
              <span>Email professionnel</span>
              <span className="input-wrap">
                <Icon name="mail" size={16} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                />
              </span>
            </label>
            <label className="text-sm">
              <span>Mot de passe</span>
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {message && <p className="auth-error text-red-500 text-sm">{message}</p>}
            <button className="button primary button-wide" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Continuer'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="text-[14px]">
            <p className="eyebrow">Etape 2 / 4</p>
            <h1>Verifiez votre email</h1>
            <p className="muted">
              Un code a 6 chiffres a ete envoye a <strong>{email}</strong>.
            </p>
          </div>

          <form className="login-form" onSubmit={handleOtpSubmit}>
            <div className="otp-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isSubmitting}
                  onChange={(event) => handleOtpChange(event.target.value, index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !otp[index] && index > 0) {
                      inputsRef.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
            {message && <p className="auth-error text-red-500 text-sm">{message}</p>}
            <button
              className="button primary button-wide"
              type="submit"
              disabled={isSubmitting || otp.some((digit) => !digit)}
            >
              {isSubmitting ? 'Verification...' : 'Verifier le code'}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setStep('account');
                setMessage('');
              }}
            >
              Modifier mes informations
            </button>
          </form>
        </>
      )}

      <p className="login-footnote">
        Deja un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
