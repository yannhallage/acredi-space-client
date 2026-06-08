import { useEffect } from "react";

import { useNotificationSocket } from "./useNotificationSocket";
import { unlockNotificationSound } from "./sound";

export function NotificationSocketBridge() {
  useNotificationSocket();

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
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return null;
}
