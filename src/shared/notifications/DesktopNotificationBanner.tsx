import { useState } from "react";

import { Icon } from "../ui";
import {
  dismissDesktopNotificationBanner,
  getDesktopNotificationPermission,
  isDesktopNotificationBannerDismissed,
  isDesktopNotificationSupported,
  requestDesktopNotificationPermission,
} from "./desktop";

type BannerMode = "prompt" | "denied" | "hidden";

function resolveBannerMode(
  permission: NotificationPermission | "unsupported",
  dismissed: boolean
): BannerMode {
  if (!isDesktopNotificationSupported() || permission === "unsupported") {
    return "hidden";
  }

  if (permission === "granted") {
    return "hidden";
  }

  if (permission === "denied") {
    return dismissed ? "hidden" : "denied";
  }

  return dismissed ? "hidden" : "prompt";
}

export function DesktopNotificationBanner() {
  const [permission, setPermission] = useState(getDesktopNotificationPermission);
  const [dismissed, setDismissed] = useState(isDesktopNotificationBannerDismissed);
  const [isRequesting, setIsRequesting] = useState(false);
  const mode = resolveBannerMode(permission, dismissed);

  if (mode === "hidden") {
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
        <p>
          {mode === "denied"
            ? "Notifications bureau bloquées. Autorisez-les dans les paramètres du navigateur (icône cadenas)."
            : "Restez informé. Activez les notifications de bureau."}
        </p>
      </div>

      <div className="desktop-notification-banner-actions">
        {mode === "prompt" ? (
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
        ) : null}
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
