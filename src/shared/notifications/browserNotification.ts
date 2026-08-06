export async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function showBrowserNotification(options: {
  title: string;
  body: string;
  url?: string | null;
}) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: options.url ?? options.title,
  });

  notification.onclick = () => {
    window.focus();

    if (options.url) {
      window.location.href = options.url;
    }

    notification.close();
  };
}