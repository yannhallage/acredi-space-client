import { useState } from "react";

import { validationFeedback, type Feedback } from "../../../../shared/feedback";
import { FeedbackBanner } from "../../../../shared/ui";

interface InvitePasswordStepProps {
  onNext: (password: string) => void;
}

export function InvitePasswordStep({
  onNext,
}: InvitePasswordStepProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<Feedback | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage(validationFeedback("Veuillez remplir tous les champs."));
      return;
    }

    if (newPassword.length < 8) {
      setMessage(
        validationFeedback(
          "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        ),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(validationFeedback("Les mots de passe ne correspondent pas."));
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

        {message ? <FeedbackBanner feedback={message} /> : null}

        <div className="invite-actions">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
}
