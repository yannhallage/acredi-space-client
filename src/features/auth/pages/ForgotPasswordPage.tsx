import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../../../shared/api/auth/hooks";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    forgotPasswordMutation.mutate(
      {
        email: email.trim().toLowerCase(),
      },
      {
        onSuccess: () => {
          setEmail("");
        },
      }
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Mot de passe oublié</h1>
          <p>
            Entrez votre adresse email. Si un compte existe, vous recevrez un
            lien de réinitialisation.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button
            className="auth-submit"
            type="submit"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending
              ? "Envoi en cours..."
              : "Envoyer le lien"}
          </button>
        </form>

        {forgotPasswordMutation.isSuccess && (
          <p className="auth-success">
            Si cet email existe, un lien de réinitialisation a été envoyé.
          </p>
        )}

        {forgotPasswordMutation.isError && (
          <p className="auth-error">
            Une erreur est survenue. Réessayez plus tard.
          </p>
        )}

        <Link className="auth-link" to="/login">
          Retour à la connexion
        </Link>
      </section>
    </main>
  );
}