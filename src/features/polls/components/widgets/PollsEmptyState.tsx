import { ClipLoader } from "react-spinners";

import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

type PollsEmptyStateProps = {
  isCreating?: boolean;
  onCreate: () => void;
};

export function PollsEmptyState({
  isCreating = false,
  onCreate,
}: PollsEmptyStateProps) {
  return (
    <div className="pb-empty-page">
      <div className="pb-empty-layout">
        <div aria-hidden="true" className="pb-empty-scene">
          <span className="pb-empty-orb pb-empty-orb-a" />
          <span className="pb-empty-orb pb-empty-orb-b" />
          <span className="pb-empty-orb pb-empty-orb-c" />
          <span className="pb-empty-spark pb-empty-spark-1" />
          <span className="pb-empty-spark pb-empty-spark-2" />
          <span className="pb-empty-spark pb-empty-spark-3" />

          <figure className="pb-empty-art">
            <div className="pb-empty-illustration">
              <span className="pb-empty-bar pb-empty-bar-a" />
              <span className="pb-empty-bar pb-empty-bar-b" />
              <span className="pb-empty-bar pb-empty-bar-c" />
              <span className="pb-empty-ring" />
            </div>
          </figure>

          <span className="pb-empty-glow" />
        </div>

        <div className="pb-empty-panel">
          <span className="pb-empty-kicker">Collectez des avis</span>
          <h2 className="pb-empty-title">Bienvenue dans vos sondages</h2>
          <p className="pb-empty-body">
            Créez des questions, invitez votre équipe et suivez les résultats en
            direct.
          </p>

          <ul aria-hidden="true" className="pb-empty-chips">
            <li className="pb-empty-chip">Choix unique</li>
            <li className="pb-empty-chip">Multi-réponses</li>
            <li className="pb-empty-chip">Texte libre</li>
          </ul>

          <PermissionGate permission={PERMISSIONS.CREATE_POLLS}>
            <button
              className="pb-empty-create"
              disabled={isCreating}
              type="button"
              onClick={onCreate}
            >
              {isCreating ? (
                <ClipLoader color="#ffffff" size={16} />
              ) : (
                <>
                  <span aria-hidden="true" className="pb-empty-create-icon" />
                  <span className="pb-empty-create-label">
                    Créer un premier sondage
                  </span>
                </>
              )}
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}

type PollsFilteredEmptyProps = {
  message?: string;
  title?: string;
};

export function PollsFilteredEmpty({
  message = "Essayez un autre filtre de statut.",
  title = "Aucun sondage trouvé",
}: PollsFilteredEmptyProps) {
  return (
    <div className="pb-filtered-empty">
      <Icon name="poll" size={14} />
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
