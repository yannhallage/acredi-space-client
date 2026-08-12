import { useNavigate } from "react-router-dom";

import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";
import type { PollCardModel } from "../../utils";

type PollCardProps = {
  poll: PollCardModel;
};

export function PollCard({ poll }: PollCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className={`pb-card pb-card-status-${poll.status.toLowerCase()}`}
      onDoubleClick={() => navigate(`/app/polls/${poll.id}`)}
    >
      <div aria-hidden="true" className="pb-card-ring">
        <span />
      </div>

      <header className="pb-card-header">
        <span className={`pb-status-badge pb-status-${poll.status.toLowerCase()}`}>
          {poll.statusLabel}
        </span>
        <span className="pb-card-visibility">
          <Icon name="users" size={12} />
          {poll.visibilityLabel}
        </span>
      </header>

      <h3 className="pb-card-title">{poll.title}</h3>

      <div className="pb-card-meta">
        {poll.closesLabel ? (
          <span>
            <Icon name="clock" size={12} />
            {poll.closesLabel}
          </span>
        ) : null}
        {poll.publishedLabel ? (
          <span>Publié {poll.publishedLabel}</span>
        ) : (
          <span>Maj {poll.updatedLabel}</span>
        )}
      </div>

      <footer className="pb-card-footer">
        <button
          className="pb-card-action"
          type="button"
          onClick={() => navigate(`/app/polls/${poll.id}`)}
        >
          <Icon name="eye" size={13} />
          Voir
        </button>

        {poll.canRespond ? (
          <PermissionGate permission={PERMISSIONS.RESPOND_POLLS}>
            <button
              className="pb-card-action pb-card-action-primary"
              type="button"
              onClick={() => navigate(`/app/polls/${poll.id}/take`)}
            >
              Répondre
            </button>
          </PermissionGate>
        ) : null}

        {poll.canEdit ? (
          <PermissionGate permission={PERMISSIONS.UPDATE_POLLS}>
            <button
              className="pb-card-action"
              type="button"
              onClick={() => navigate(`/app/polls/${poll.id}/edit`)}
            >
              <Icon name="edit" size={13} />
              Éditer
            </button>
          </PermissionGate>
        ) : null}
      </footer>
    </article>
  );
}
