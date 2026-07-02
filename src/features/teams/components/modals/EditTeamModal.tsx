import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Icon } from "../../../../shared/ui";
import { TEAM_COLORS } from "../../constants";
import type { Team } from "../../types";

export function EditTeamModal({
  error,
  isUpdating,
  onClose,
  onSubmit,
  team,
}: {
  error: string | null;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (request: {
    description: string;
    name: string;
    teamColor: string;
  }) => Promise<void>;
  team: Team;
}) {
  const [description, setDescription] = useState(team.description ?? "");
  const [name, setName] = useState(team.name);
  const [teamColor, setTeamColor] = useState(team.color);

  const canSubmit = name.trim().length >= 2 && !isUpdating;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUpdating) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isUpdating, onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-edit-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={() => {
        if (!isUpdating) {
          onClose();
        }
      }}
    >
      <motion.form
        className="note-modal team-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Modifier equipe"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ description, name, teamColor }).catch(() => undefined);
        }}
      >
        <header>
          <div className="team-details-title">
            <i style={{ background: teamColor }} />
            <div>
              <h2>Modifier l'équipe</h2>
              <small>{team.name}</small>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={isUpdating}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        {error ? (
          <div className="team-form-error">
            <Icon name="alert" size={16} />
            {error}
          </div>
        ) : null}

        <label className="note-field">
          <span>Nom</span>
          <input
            autoFocus
            maxLength={160}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nom de l'équipe"
          />
        </label>

        <label className="note-field">
          <span>Description</span>
          <textarea
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description de l'équipe"
            rows={5}
          />
        </label>

        <div className="note-field">
          <span>Couleur</span>
          <div className="team-color-picker">
            {TEAM_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={teamColor === color ? "selected" : undefined}
                style={{ background: color }}
                aria-label={`Couleur ${color}`}
                onClick={() => setTeamColor(color)}
              />
            ))}
          </div>
        </div>

        <footer>
          <button
            className="button ghost"
            type="button"
            disabled={isUpdating}
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="button primary notes-submit"
            type="submit"
            disabled={!canSubmit}
          >
            {isUpdating ? "Modification..." : "Modifier"}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
}
