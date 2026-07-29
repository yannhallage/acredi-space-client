export type DesktopNotificationPayload = {
  id: string;
  title: string;
  message: string;
  path?: string | null;
};

const DISMISS_STORAGE_KEY = "acredi-desktop-notifications-banner-dismissed";
const NOTIFICATION_ICON_PATH = "/notification-icon.png";
export const DESKTOP_NOTIFICATION_CLICK_EVENT = "acredi:desktop-notification-click";

function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function notificationIconUrl() {
  return new URL(NOTIFICATION_ICON_PATH, window.location.origin).href;
}

export function isDesktopNotificationSupported() {
  return isSupported();
}

export function getDesktopNotificationPermission() {
  if (!isSupported()) {
    return "unsupported" as const;
  }

  return Notification.permission;
}

export function isDesktopNotificationBannerDismissed() {
  try {
    return localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDesktopNotificationBanner() {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, "1");
  } catch {
    // ignore storage errors
  }
}

export async function requestDesktopNotificationPermission() {
  if (!isSupported()) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  if (Notification.permission === "denied") {
    return "denied" as const;
  }

  return Notification.requestPermission();
}

function attachClickHandler(
  desktopNotification: Notification,
  path?: string | null
) {
  desktopNotification.onclick = () => {
    window.focus();

    if (path) {
      window.dispatchEvent(
        new CustomEvent(DESKTOP_NOTIFICATION_CLICK_EVENT, {
          detail: { path },
        })
      );
    }

    desktopNotification.close();
  };
}

function createDesktopNotification(
  notification: DesktopNotificationPayload,
  options: NotificationOptions
) {
  const desktopNotification = new Notification(notification.title, options);
  attachClickHandler(desktopNotification, notification.path);
  return desktopNotification;
}

export function showDesktopNotification(notification: DesktopNotificationPayload) {
  if (!isSupported() || Notification.permission !== "granted") {
    return;
  }

  const tag = notification.id ? String(notification.id) : undefined;
  const baseOptions: NotificationOptions = {
    body: notification.message,
    ...(tag ? { tag } : {}),
  };

  try {
    createDesktopNotification(notification, {
      ...baseOptions,
      icon: notificationIconUrl(),
    });
  } catch {
    // Windows Action Center can fail on icon fetch/decode; retry without icon.
    try {
      createDesktopNotification(notification, baseOptions);
    } catch {
      // ignore notification failures
    }
  }
}
