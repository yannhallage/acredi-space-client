import { useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { authStorageKeys } from "../auth";
import { API_BASE_URL } from "../http";
import { useAuth } from "../../context";
import {
  cachePresence,
  cachePresenceList,
  isPresenceStatus,
  toUiPresence,
} from "./store";
import { presenceService } from "./service";
import type { PresenceResponse, PresenceStatusResponse } from "./types";

const HEARTBEAT_INTERVAL_MS = 30000;
const AWAY_AFTER_MS = 60000;
const RECONNECT_DELAY_MS = 5000;

function defaultSocketUrl() {
  return `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws`;
}

function socketUrl() {
  return defaultSocketUrl();
}

function readPresenceMessage(message: IMessage) {
  try {
    return JSON.parse(message.body) as PresenceResponse;
  } catch {
    return null;
  }
}

function statusForActivity(lastActivityAt: number) {
  if (document.visibilityState === "hidden") {
    return "AWAY" satisfies PresenceStatusResponse;
  }

  return Date.now() - lastActivityAt > AWAY_AFTER_MS ? "AWAY" : "ONLINE";
}

export function usePresenceSocket() {
  const { updateUser, user } = useAuth();
  const userId = user?.id ?? null;
  const userIdRef = useRef<string | null>(user?.id ?? null);
  const lastActivityAtRef = useRef(Date.now());
  const lastStatusRef = useRef<PresenceStatusResponse | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    presenceService
      .findAll()
      .then(cachePresenceList)
      .catch(() => undefined);

    const token = localStorage.getItem(authStorageKeys.accessToken);
    if (!token) {
      return undefined;
    }

    const publish = (status: PresenceStatusResponse, force = false) => {
      const client = clientRef.current;
      const currentUserId = userIdRef.current;

      if (!isPresenceStatus(status) || (!force && lastStatusRef.current === status)) {
        return;
      }

      lastStatusRef.current = status;

      if (currentUserId) {
        const entry = cachePresence({
          userId: currentUserId,
          status,
          lastSeenAt: new Date().toISOString(),
        });

        if (entry) {
          updateUser({
            presence: entry.presence,
            status: entry.presence === "offline" ? "Hors ligne" : "Disponible",
          });
        }
      }

      if (!client?.connected) {
        return;
      }

      client.publish({
        destination: "/app/presence.update",
        body: JSON.stringify(status),
        headers: { "content-type": "application/json" },
      });
    };

    const publishCurrentStatus = (force = false) => {
      publish(statusForActivity(lastActivityAtRef.current), force);
    };

    const client = new Client({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: RECONNECT_DELAY_MS,
      webSocketFactory: () => new SockJS(socketUrl()),
      onConnect: () => {
        client.subscribe("/topic/presence", (message) => {
          const payload = readPresenceMessage(message);
          if (!payload) {
            return;
          }

          const entry = cachePresence(payload);
          if (entry && entry.userId === userIdRef.current) {
            updateUser({
              presence: entry.presence,
              status: entry.presence === "offline" ? "Hors ligne" : "Disponible",
            });
          }
        });

        publish("ONLINE", true);
      },
    });

    clientRef.current = client;
    client.activate();

    const heartbeatId = window.setInterval(
      () => publishCurrentStatus(true),
      HEARTBEAT_INTERVAL_MS
    );
    const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

    const handleActivity = () => {
      lastActivityAtRef.current = Date.now();
      publish("ONLINE");
    };

    const handleVisibilityChange = () => {
      publishCurrentStatus(true);
    };

    const handleBeforeUnload = () => {
      publish("OFFLINE", true);
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(heartbeatId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      publish("OFFLINE", true);
      void client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [updateUser, userId]);
}

export function presenceStatusToUi(status: PresenceStatusResponse) {
  return toUiPresence(status);
}
