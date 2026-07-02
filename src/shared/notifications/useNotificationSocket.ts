import { useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import SockJS from "sockjs-client";

import {
  dashboardKeys,
  normalizeNotification,
  type DashboardNotification,
  type NotificationResponse,
} from "../api/dashboard";
import { API_BASE_URL } from "../api/http";
import { authStorageKeys } from "../api/auth";
import { useAuth } from "../context";
import { showDesktopNotification } from "./desktop";
import { playNotificationSound } from "./sound";

interface UseNotificationSocketOptions {
  enabled?: boolean;
  onNotification?: (notification: NotificationResponse) => void;
}

const DEFAULT_RECONNECT_DELAY_MS = 5000;

function defaultSocketUrl() {
  return `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws`;
}

function socketUrl() {
  return defaultSocketUrl();
}

function readNotification(message: IMessage) {
  try {
    return JSON.parse(message.body) as NotificationResponse;
  } catch {
    return null;
  }
}

function upsertNotification(
  current: DashboardNotification[] | undefined,
  notification: DashboardNotification
) {
  const existing = current ?? [];

  return [
    notification,
    ...existing.filter((item) => item.id !== notification.id),
  ];
}

export function useNotificationSocket(options: UseNotificationSocketOptions = {}) {
  const { enabled = true, onNotification } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled || !user) {
      return undefined;
    }

    const token = localStorage.getItem(authStorageKeys.accessToken);
    if (!token) {
      return undefined;
    }

    const client = new Client({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: DEFAULT_RECONNECT_DELAY_MS,
      webSocketFactory: () => new SockJS(socketUrl()),
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (message) => {
          const payload = readNotification(message);
          if (!payload) {
            return;
          }

          const notification = normalizeNotification(payload);
          queryClient.setQueryData<DashboardNotification[]>(
            dashboardKeys.notifications(),
            (current) => upsertNotification(current, notification)
          );
          queryClient.invalidateQueries({ queryKey: dashboardKeys.notifications() });
          onNotificationRef.current?.(payload);
          playNotificationSound();
          showDesktopNotification({
            id: notification.id,
            title: notification.title,
            message: notification.message,
          });
        });
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [enabled, queryClient, user]);
}
