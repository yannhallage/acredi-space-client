import { useRef, useState } from 'react';
import {
  AuthCardBrand,
  AuthFeedbackBanner,
  AuthSubmitButton,
  authFeedback,
  resolveOtpFeedback,
  type AuthFeedback,
} from '../../../auth/components';
import { resolveAuthenticatedRedirect } from '../../../../shared/auth/onboarding';
import { useAuth } from '../../../../shared/context';
import { AcrediLockup } from '../../../../shared/ui';

interface OtpFormProps {
  redirectTo: string;
  authLoading?: boolean;
  onVerified: (redirectPath: string) => void;
}

export function OtpForm({ redirectTo, authLoading = false, onVerified }: OtpFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const { verifyOtp } = useAuth();

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (feedback) setFeedback(null);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
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

      const authenticatedUser = await verifyOtp(code);

      onVerified(resolveAuthenticatedRedirect(authenticatedUser, redirectTo));
    } catch (error) {
      console.error(error);
      setFeedback(resolveOtpFeedback(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-card-header">
        <AcrediLockup size={34} fontSize={24} onLight />
        <h1>Entrez le code OTP pour continuer</h1>
        <p className="muted">Un code a 6 chiffres a ete envoye a votre adresse e-mail.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
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
              disabled={submitting || authLoading}
              onChange={(event) => handleChange(event.target.value, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            />
          ))}
        </div>

        {feedback && <AuthFeedbackBanner feedback={feedback} />}

        <AuthSubmitButton
          loading={submitting || authLoading}
          disabled={otp.some((digit) => !digit)}
        >
          Verifier le code
        </AuthSubmitButton>

        <div className="login-row">
          <span className="muted">Code non recu ?</span>
          <button type="button" className="link-button">
            Renvoyer le code
          </button>
        </div>

        <p className="login-footnote">Pour votre securite, ce code expire apres quelques minutes.</p>
      </form>

      <AuthCardBrand />
    </div>
  );
}
