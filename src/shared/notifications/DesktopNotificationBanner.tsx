import { useState } from "react";

import { Icon } from "../ui";
import {
  dismissDesktopNotificationBanner,
  getDesktopNotificationPermission,
  isDesktopNotificationBannerDismissed,
  isDesktopNotificationSupported,
  requestDesktopNotificationPermission,
} from "./desktop";

function shouldShowBanner(
  permission: NotificationPermission | "unsupported",
  dismissed: boolean
) {
  return (
    isDesktopNotificationSupported() &&
    permission === "default" &&
    !dismissed
  );
}

export function DesktopNotificationBanner() {
  const [permission, setPermission] = useState(getDesktopNotificationPermission);
  const [dismissed, setDismissed] = useState(isDesktopNotificationBannerDismissed);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!shouldShowBanner(permission, dismissed)) {
    return null;
  }

  async function handleActivate() {
    setIsRequesting(true);

    try {
      const result = await requestDesktopNotificationPermission();
      setPermission(result === "unsupported" ? "unsupported" : result);
    } finally {
      setIsRequesting(false);
    }
  }

  function handleDismiss() {
    dismissDesktopNotificationBanner();
    setDismissed(true);
  }

  return (
    <div className="desktop-notification-banner" role="status">
      <div className="desktop-notification-banner-content">
        <Icon name="alert" size={16} />
        <p>Restez informé. Activez les notifications de bureau.</p>
      </div>

      <div className="desktop-notification-banner-actions">
        <button
          className="desktop-notification-banner-button"
          type="button"
          disabled={isRequesting}
          onClick={() => {
            void handleActivate();
          }}
        >
          Activer
        </button>
        <button
          className="desktop-notification-banner-close"
          type="button"
          aria-label="Fermer"
          onClick={handleDismiss}
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}
