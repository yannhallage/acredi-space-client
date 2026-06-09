import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../../shared/api/auth/hooks";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => {
    return searchParams.get("token") ?? "";
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const resetPasswordMutation = useResetPasswordMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    if (!token) {
      setLocalError("Le lien de réinitialisation est invalide.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }

    resetPasswordMutation.mutate(
      {
        token,
        newPassword,
      },
      {
        onSuccess: () => {
          navigate("/login", {
            replace: true,
            state: {
              message: "Mot de passe réinitialisé avec succès.",
            },
          });
        },
      }
    );
  }

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-header">
            <h1>Lien invalide</h1>
            <p>
              Le token de réinitialisation est absent. Demandez un nouveau lien.
            </p>
          </div>

          <Link className="auth-link" to="/forgot-password">
            Demander un nouveau lien
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Nouveau mot de passe</span>
            <input
              type="password"
              placeholder="Minimum 8 caractères"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label className="auth-field">
            <span>Confirmer le mot de passe</span>
            <input
              type="password"
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <button
            className="auth-submit"
            type="submit"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Réinitialisation..."
              : "Réinitialiser le mot de passe"}
          </button>
        </form>

        {localError && <p className="auth-error">{localError}</p>}

        {resetPasswordMutation.isError && (
          <p className="auth-error">
            Le lien est invalide, expiré ou déjà utilisé.
          </p>
        )}

        <Link className="auth-link" to="/login">
          Retour à la connexion
        </Link>
      </section>
    </main>
  );
}