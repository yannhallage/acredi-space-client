import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type {
  NotificationClickEvent,
  NotificationForegroundWillDisplayEvent,
} from "react-onesignal";
import { dashboardKeys } from "../api/dashboard";
import { useAuth } from "../context";
import {
  clearOneSignalUser,
  initOneSignal,
  isFileSharedNotification,
  isOneSignalConfigured,
  syncOneSignalUser,
} from "./onesignal";
import { unlockNotificationSound } from "./sound";

export function OneSignalSessionBridge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    let unlocked = false;

    const unlock = () => {
      if (unlocked) {
        return;
      }

      unlocked = true;
      void unlockNotificationSound().catch(() => undefined);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

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

      const refreshNotifications = () => {
        void queryClient.invalidateQueries({
          queryKey: dashboardKeys.notifications(),
        });
      };

      const handleForegroundWillDisplay = (
        _event: NotificationForegroundWillDisplayEvent
      ) => {
        refreshNotifications();
      };

      const handleClick = (event: NotificationClickEvent) => {
        refreshNotifications();

        if (isFileSharedNotification(event)) {
          navigate("/app/files");
        }
      };

      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        handleForegroundWillDisplay
      );
      OneSignal.Notifications.addEventListener("click", handleClick);
      cleanup = () => {
        OneSignal.Notifications.removeEventListener(
          "foregroundWillDisplay",
          handleForegroundWillDisplay
        );
        OneSignal.Notifications.removeEventListener("click", handleClick);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [navigate, queryClient]);

  return null;
}
