import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationClickEvent } from "react-onesignal";
import { useAuth } from "../context";
import {
  clearOneSignalUser,
  initOneSignal,
  isFileSharedNotification,
  isOneSignalConfigured,
  syncOneSignalUser,
} from "./onesignal";

export function OneSignalSessionBridge() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOneSignalConfigured()) {
      return;
    }

    if (!user) {
      void clearOneSignalUser();
      return;
    }

    void syncOneSignalUser(user).catch((error: unknown) => {
      console.warn("Unable to sync OneSignal user", error);
    });
  }, [user]);

  useEffect(() => {
    if (!isOneSignalConfigured()) {
      return undefined;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void initOneSignal().then((OneSignal) => {
      if (!OneSignal || cancelled) {
        return;
      }

      const handleClick = (event: NotificationClickEvent) => {
        if (isFileSharedNotification(event)) {
          navigate("/app/files");
        }
      };

      OneSignal.Notifications.addEventListener("click", handleClick);
      cleanup = () => {
        OneSignal.Notifications.removeEventListener("click", handleClick);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [navigate]);

  return null;
}
