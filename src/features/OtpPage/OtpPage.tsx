import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { resolveAuthenticatedRedirect } from "../../shared/auth/onboarding";
import { useAuth } from "../../shared/context";

export function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const { isAuthenticated, verifyOtp, loading, user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/app/dashboard";

  if (isAuthenticated) {
    return <Navigate to={resolveAuthenticatedRedirect(user, redirectTo)} replace />;
  }

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setMessage("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const code = otp.join("");

      if (code.length !== 6) {
        setMessage("Veuillez saisir les 6 chiffres du code OTP.");
        return;
      }

      const authenticatedUser = await verifyOtp(code);

      navigate(resolveAuthenticatedRedirect(authenticatedUser, redirectTo), { replace: true });
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Code OTP invalide ou expire.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="theme-root auth-layout">
      <section className="auth-panel">
        <div className="login-card">
          <div>
            <span className="eyebrow">Verification</span>
            <h1>Entrez le code OTP</h1>
            <p className="muted">
              Un code a 6 chiffres a ete envoye a votre adresse email.
            </p>
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
                  disabled={submitting || loading}
                  onChange={(event) => handleChange(event.target.value, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                />
              ))}
            </div>

            {message && <p className="auth-error text-red-500 text-sm">{message}</p>}

            <button
              className="button primary button-wide"
              type="submit"
              disabled={submitting || loading || otp.some((digit) => !digit)}
            >
              {submitting || loading ? "Verification..." : "Verifier le code"}
            </button>

            <div className="login-row">
              <span className="muted">Code non recu ?</span>
              <button type="button" className="link-button">
                Renvoyer le code
              </button>
            </div>

            <p className="login-footnote">
              Pour votre securite, ce code expire apres quelques minutes.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
