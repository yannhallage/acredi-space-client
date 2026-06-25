import { ClipLoader } from "react-spinners";

import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

const NOTES_EMPTY_ILLUSTRATION = "/custom/notes-empty-full.png";

type NotesEmptyStateProps = {
  isSaving?: boolean;
  onCreate: () => void;
};

export function NotesEmptyState({ isSaving = false, onCreate }: NotesEmptyStateProps) {
  return (
    <div className="nb-empty-page">
      <div className="nb-empty-layout">
        <div aria-hidden="true" className="nb-empty-scene">
          <span className="nb-empty-orb nb-empty-orb-a" />
          <span className="nb-empty-orb nb-empty-orb-b" />
          <span className="nb-empty-orb nb-empty-orb-c" />
          <span className="nb-empty-spark nb-empty-spark-1" />
          <span className="nb-empty-spark nb-empty-spark-2" />
          <span className="nb-empty-spark nb-empty-spark-3" />

          <figure className="nb-empty-art">
            <img
              alt=""
              className="nb-empty-illustration"
              loading="lazy"
              src={NOTES_EMPTY_ILLUSTRATION}
            />
          </figure>

          <span className="nb-empty-glow" />
        </div>

        <div className="nb-empty-panel">
          <span className="nb-empty-kicker">Votre carnet numérique</span>
          <h2 className="nb-empty-title">Bienvenue dans vos notes</h2>
          <p className="nb-empty-body">
            Capturez vos idées, tâches et rappels au même endroit.
          </p>

          <ul aria-hidden="true" className="nb-empty-chips">
            <li className="nb-empty-chip">Idées</li>
            <li className="nb-empty-chip">Tâches</li>
            <li className="nb-empty-chip">Rappels</li>
          </ul>

          <PermissionGate permission={PERMISSIONS.CREATE_NOTES}>
            <button
              className="nb-empty-create"
              disabled={isSaving}
              type="button"
              onClick={onCreate}
            >
              {isSaving ? (
                <ClipLoader color="#ffffff" size={16} />
              ) : (
                <>
                  <span aria-hidden="true" className="nb-empty-create-icon" />
                  <span className="nb-empty-create-label">Créer une première note</span>
                </>
              )}
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}

type NotesFilteredEmptyProps = {
  message?: string;
  title?: string;
};

export function NotesFilteredEmpty({
  message = "Essayez un autre filtre de titre ou de contenu.",
  title = "Aucune note trouvée",
}: NotesFilteredEmptyProps) {
  return (
    <div className="notes-empty nb-filtered-empty">
      <Icon name="notes" size={14} />
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
