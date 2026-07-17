import { motion } from "framer-motion";

import type { Presence } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";

import { formatSubtitle, getPresenceLabel } from "../utils/dmMessageFormat";

interface ConversationHeaderProps {
  title: string;
  subtitle: string;
  presence: Presence;
  avatarUrl?: string | null;
  canPreviewAvatar: boolean;
  refreshing: boolean;
  showBackButton?: boolean;
  onAvatarPreview: () => void;
  onRefresh?: () => void;
  onContactDetails?: () => void;
  onClose?: () => void;
}

export function ConversationHeader({
  title,
  subtitle,
  presence,
  avatarUrl,
  canPreviewAvatar,
  refreshing,
  showBackButton = false,
  onAvatarPreview,
  onRefresh,
  onContactDetails,
  onClose,
}: ConversationHeaderProps) {
  const subtitleLabel = formatSubtitle(subtitle);

  return (
    <header className="dm-thread-header">
      {showBackButton && onClose ? (
        <button
          type="button"
          className="dm-thread-back-button"
          aria-label="Retour aux conversations"
          title="Retour"
          onClick={onClose}
        >
          <Icon name="arrowLeft" size={18} />
        </button>
      ) : null}

      <div className="dm-thread-user">
        {canPreviewAvatar ? (
          <motion.button
            className="dm-thread-avatar-button"
            type="button"
            aria-label={`Voir la photo de ${title}`}
            whileTap={{ scale: 0.96 }}
            onClick={onAvatarPreview}
          >
            <Avatar
              name={title}
              presence={presence}
              size={46}
              src={avatarUrl}
            />
          </motion.button>
        ) : (
          <Avatar name={title} presence={presence} size={46} src={avatarUrl} />
        )}

        <div>
          <h2>{title}</h2>
          <p>
            <span className={`dm-dot dm-dot-${presence}`} />
            <span>{subtitleLabel}</span>
            <small>{getPresenceLabel(presence)}</small>
          </p>
        </div>
      </div>

      <div className="dm-thread-actions">
        {onContactDetails ? (
          <button
            type="button"
            aria-label="Infos du contact"
            title="Infos du contact"
            onClick={onContactDetails}
          >
            <Icon name="info" size={17} />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Recharger la discussion"
          title="Recharger"
          disabled={refreshing || !onRefresh}
          onClick={() => onRefresh?.()}
        >
          <Icon
            name="refresh"
            size={17}
            className={refreshing ? "dm-spin" : undefined}
          />
        </button>
        {onClose && !showBackButton ? (
          <button
            type="button"
            aria-label="Fermer la discussion"
            title="Fermer"
            onClick={onClose}
          >
            <Icon name="x" size={17} />
          </button>
        ) : null}
      </div>
    </header>
  );
}
