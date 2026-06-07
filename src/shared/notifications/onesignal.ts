import type {
  IOneSignalOneSignal,
  NotificationClickEvent,
} from "react-onesignal";
import type { User } from "../types";

const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim() ?? "";
const autoPrompt = import.meta.env.VITE_ONESIGNAL_AUTO_PROMPT !== "false";

let oneSignalPromise: Promise<IOneSignalOneSignal | null> | null = null;
let currentExternalId: string | null = null;

function canUseOneSignal() {
  return Boolean(oneSignalAppId) && typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function isOneSignalConfigured() {
  return Boolean(oneSignalAppId);
}

export async function initOneSignal() {
  if (!canUseOneSignal()) {
    return null;
  }

  if (!oneSignalPromise) {
    oneSignalPromise = import("react-onesignal")
      .then(async ({ default: OneSignal }) => {
        await OneSignal.init({
          appId: oneSignalAppId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          welcomeNotification: {
            disable: true,
            message: "",
          },
        });

        return OneSignal;
      })
      .catch((error: unknown) => {
        oneSignalPromise = null;
        console.warn("OneSignal initialization failed", error);
        return null;
      });
  }

  return oneSignalPromise;
}

export async function syncOneSignalUser(user: User) {
  const OneSignal = await initOneSignal();

  if (!OneSignal || currentExternalId === user.id) {
    return;
  }

  await OneSignal.login(user.id);
  currentExternalId = user.id;

  try {
    OneSignal.User.addEmail(user.email);
  } catch {
    // Email is optional metadata; failed tagging must not block the app session.
  }

  if (
    autoPrompt &&
    OneSignal.Notifications.isPushSupported() &&
    !OneSignal.Notifications.permission
  ) {
    await OneSignal.Slidedown.promptPush();
  }
}

export async function clearOneSignalUser() {
  if (!currentExternalId) {
    return;
  }

  const OneSignal = await initOneSignal();

  if (!OneSignal) {
    currentExternalId = null;
    return;
  }

  await OneSignal.logout();
  currentExternalId = null;
}

export function isFileSharedNotification(event: NotificationClickEvent) {
  const data = event.notification.additionalData;

  return isRecord(data) && data.type === "FILE_SHARED";
}
