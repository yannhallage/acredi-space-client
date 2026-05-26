import { useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context";

export function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const { isAuthenticated, verifyOtp, loading } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/app/dashboard";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
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
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const code = otp.join("");

      if (code.length !== 6) {
        setMessage("Veuillez saisir les 6 chiffres du code OTP.");
        return;
      }

      await verifyOtp(code);

      navigate("/app/dashboard", { replace: true });
    } catch (error: any) {
      console.error(error);
      setMessage(error?.message || "Code OTP invalide ou expiré.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="theme-root auth-layout">
      <section className="auth-panel">
        <div className="login-card">
          <div>
            <span className="eyebrow">Vérification</span>
            <h1>Entrez le code OTP</h1>
            <p className="muted">
              Un code à 6 chiffres a été envoyé à votre adresse email.
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
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            {message && <p className="auth-error">{message}</p>}

            <button
              className="button primary button-wide"
              type="submit"
              disabled={submitting || loading || otp.some((digit) => !digit)}
            >
              {submitting || loading ? "Vérification..." : "Vérifier le code"}
            </button>

            <div className="login-row">
              <span className="muted">Code non reçu ?</span>
              <button type="button" className="link-button">
                Renvoyer le code
              </button>
            </div>

            <p className="login-footnote">
              Pour votre sécurité, ce code expire après quelques minutes.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}