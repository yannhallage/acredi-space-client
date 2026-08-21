import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import SockJS from "sockjs-client";

import { authStorageKeys } from "../auth";
import { useAuth } from "../../context";
import {
  parseSocketJson,
  websocketReconnectDelayMs,
  websocketUrl,
} from "../websocket";
import { discussionKeys, writeGroupMessageToCache } from "./messagesCache";
import type { GroupMessageResponse } from "./types";

export type DiscussionTypingUser = {
  userId: string;
  userName: string;
};

type GroupTypingEvent = {
  discussionId: string;
  userId: string;
  userName: string;
  typing: boolean;
};

const TYPING_TTL_MS = 3500;

function readGroupMessage(message: IMessage) {
  return parseSocketJson<GroupMessageResponse>(message.body);
}

function readTypingEvent(message: IMessage) {
  return parseSocketJson<GroupTypingEvent>(message.body);
}

/**
 * Realtime group discussion: messages + typing indicators.
 */
export function useDiscussionMessagesSocket(discussionId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const discussionIdRef = useRef(discussionId);
  const clientRef = useRef<Client | null>(null);
  const typingTimeoutsRef = useRef(new Map<string, number>());
  const [typingUsers, setTypingUsers] = useState<DiscussionTypingUser[]>([]);

  useEffect(() => {
    discussionIdRef.current = discussionId;
  }, [discussionId]);

  const clearTypingUser = useCallback((userId: string) => {
    const timeoutId = typingTimeoutsRef.current.get(userId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      typingTimeoutsRef.current.delete(userId);
    }

    setTypingUsers((current) =>
      current.filter((item) => item.userId !== userId),
    );
  }, []);

  const upsertTypingUser = useCallback(
    (entry: DiscussionTypingUser) => {
      setTypingUsers((current) => {
        const without = current.filter((item) => item.userId !== entry.userId);
        return [...without, entry];
      });

      const existingTimeout = typingTimeoutsRef.current.get(entry.userId);
      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
      }

      const timeoutId = window.setTimeout(() => {
        clearTypingUser(entry.userId);
      }, TYPING_TTL_MS);

      typingTimeoutsRef.current.set(entry.userId, timeoutId);
    },
    [clearTypingUser],
  );

  useEffect(() => {
    setTypingUsers([]);
    typingTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    typingTimeoutsRef.current.clear();
  }, [discussionId]);

  useEffect(() => {
    if (!user || !discussionId) {
      return undefined;
    }

    const token = localStorage.getItem(authStorageKeys.accessToken);
    if (!token) {
      return undefined;
    }

    const subscriptions: StompSubscription[] = [];
    const currentUserId = user.id;

    const client = new Client({
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: websocketReconnectDelayMs,
      webSocketFactory: () => new SockJS(websocketUrl()),
      onConnect: () => {
        const activeId = discussionIdRef.current;
        if (!activeId) {
          return;
        }

        subscriptions.push(
          client.subscribe(`/topic/discussions/${activeId}`, (message) => {
            const payload = readGroupMessage(message);
            if (!payload?.id || !payload.discussionId) {
              return;
            }

            writeGroupMessageToCache(queryClient, payload);

            queryClient.invalidateQueries({
              queryKey: discussionKeys.mine(),
            });

            if (payload.senderId) {
              clearTypingUser(payload.senderId);
            }
          }),
        );

        subscriptions.push(
          client.subscribe(
            `/topic/discussions/${activeId}/typing`,
            (message) => {
              const payload = readTypingEvent(message);
              if (!payload?.userId || !payload.discussionId) {
                return;
              }

              if (payload.userId === currentUserId) {
                return;
              }

              if (!payload.typing) {
                clearTypingUser(payload.userId);
                return;
              }

              upsertTypingUser({
                userId: payload.userId,
                userName: payload.userName || "Quelqu'un",
              });
            },
          ),
        );
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch {
          // ignore
        }
      });
      void client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
      typingTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      typingTimeoutsRef.current.clear();
    };
  }, [clearTypingUser, discussionId, queryClient, upsertTypingUser, user]);

  const publishTyping = useCallback(
    (typing: boolean) => {
      const activeId = discussionIdRef.current;
      const client = clientRef.current;

      if (!activeId || !client?.connected) {
        return;
      }

      client.publish({
        destination: "/app/group.typing",
        body: JSON.stringify({
          discussionId: activeId,
          typing,
        }),
        headers: { "content-type": "application/json" },
      });
    },
    [],
  );

  return {
    typingUsers,
    publishTyping,
  };
}
