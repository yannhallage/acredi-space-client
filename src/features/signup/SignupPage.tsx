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
import { AcrediLockup } from '../../shared/ui';
import {
  AuthCardBrand,
  AuthFeedbackBanner,
  AuthSubmitButton,
  PasswordInput,
  authFeedback,
  resolveOtpFeedback,
  resolveSignupStartFeedback,
  type AuthFeedback,
} from '../auth/components';

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
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  if (isAuthenticated) {
    return <Navigate to={resolveAuthenticatedRedirect(user)} replace />;
  }

  function clearFeedback() {
    if (feedback) setFeedback(null);
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (password.length < 8) {
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
      console.error(error);
      setFeedback(resolveSignupStartFeedback(error));
    }
  }

  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    clearFeedback();
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const code = otp.join('');
    if (code.length !== 6) {
      setFeedback(
        authFeedback(
          'warning',
          'Code incomplet',
          'Saisissez les 6 chiffres du code reçu par e-mail pour continuer.'
        )
      );
      return;
    }

    const session = getOtpSession();
    if (!session?.challengeId) {
      setFeedback(
        authFeedback(
          'warning',
          'Session expirée',
          'Votre session de vérification n’est plus valide. Recommencez l’inscription pour recevoir un nouveau code.'
        )
      );
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
      navigate(resolveAuthenticatedRedirect(authenticatedUser, '/signup/plans'), {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      setFeedback(resolveOtpFeedback(error));
    }
  }

  const isSubmitting = startMutation.isPending || verifyMutation.isPending;

  return (
    <div className="login-card">
      {step === 'account' ? (
        <>
          <div className="login-card-header">
            <AcrediLockup size={34} fontSize={24} onLight />
            <h1>Creez votre compte pour continuer</h1>
            <p className="muted">
              Renseignez votre identite pour demarrer l’espace de votre organisation.
            </p>
          </div>

          <form className="login-form" onSubmit={handleAccountSubmit}>
            <div className="signup-name-row">
              <label>
                <span>
                  Prenom <em aria-hidden="true">*</em>
                </span>
                <span className="input-wrap">
                  <input
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="Votre prenom"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    required
                  />
                </span>
              </label>
              <label>
                <span>
                  Nom <em aria-hidden="true">*</em>
                </span>
                <span className="input-wrap">
                  <input
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      clearFeedback();
                    }}
                    placeholder="Votre nom"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    required
                  />
                </span>
              </label>
            </div>
            <label>
              <span>
                E-mail professionnel <em aria-hidden="true">*</em>
              </span>
              <span className="input-wrap">
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFeedback();
                  }}
                  type="email"
                  placeholder="Saisissez votre adresse e-mail"
                  autoComplete="email"
                  disabled={isSubmitting}
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
                  clearFeedback();
                }}
                placeholder="Minimum 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                disabled={isSubmitting}
                required
              />
            </label>
            {feedback && <AuthFeedbackBanner feedback={feedback} />}
            <AuthSubmitButton loading={isSubmitting}>Continuer</AuthSubmitButton>
            <p className="login-footnote">
              Deja un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </form>
        </>
      ) : (
        <>
          <div className="login-card-header">
            <AcrediLockup size={34} fontSize={24} onLight />
            <h1>Entrez le code OTP pour continuer</h1>
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
            {feedback && <AuthFeedbackBanner feedback={feedback} />}
            <AuthSubmitButton
              loading={isSubmitting}
              disabled={otp.some((digit) => !digit)}
            >
              Verifier le code
            </AuthSubmitButton>
            <div className="login-row">
              <span className="muted">Informations incorrectes ?</span>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setStep('account');
                  setFeedback(null);
                }}
              >
                Modifier mes informations
              </button>
            </div>
            <p className="login-footnote">
              Pour votre securite, ce code expire apres quelques minutes.
            </p>
          </form>
        </>
      )}

      <AuthCardBrand />
    </div>
  );
}
