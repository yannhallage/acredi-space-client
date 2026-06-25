import { useState } from "react";

interface InvitePasswordStepProps {
  onNext: (password: string) => void;
}

export function InvitePasswordStep({
  onNext,
}: InvitePasswordStepProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage(
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    onNext(newPassword);
  }

  return (
    <div className="invite-page">
      <div className="invite-steps">
        <span className="active" />
        <span />
        <span />
      </div>

      <form className="invite-card" onSubmit={handleSubmit}>
        <h1>Welcome</h1>

        <label className="invite-field">
          Current password *
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>

        <label className="invite-field">
          New password *
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        <label className="invite-field">
          Confirm password *
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {message && <p className="invite-error">{message}</p>}

        <div className="invite-actions">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
}
