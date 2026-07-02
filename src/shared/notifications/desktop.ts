export type DesktopNotificationPayload = {
  id: string;
  title: string;
  message: string;
};

const DISMISS_STORAGE_KEY = "acredi-desktop-notifications-banner-dismissed";

function isSupported() {
  return typeof window !== "undefined" && "Notification" in window;
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

export function showDesktopNotification(notification: DesktopNotificationPayload) {
  if (!isSupported() || Notification.permission !== "granted") {
    return;
  }

  const desktopNotification = new Notification(notification.title, {
    body: notification.message,
    icon: "/favicon.png",
    tag: notification.id,
  });

  desktopNotification.onclick = () => {
    window.focus();
    desktopNotification.close();
  };
}
