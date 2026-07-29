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
import { chatKeys } from "./hooks";
import type { ChannelResponse, MessageResponse } from "./types";

export type ChannelTypingUser = {
  userId: string;
  userName: string;
};

type ChannelTypingEvent = {
  channelId: string;
  userId: string;
  userName: string;
  typing: boolean;
};

const TYPING_TTL_MS = 3500;

function readChannelMessage(message: IMessage) {
  return parseSocketJson<MessageResponse>(message.body);
}

function readTypingEvent(message: IMessage) {
  return parseSocketJson<ChannelTypingEvent>(message.body);
}

function upsertMessage(
  current: MessageResponse[] | undefined,
  incoming: MessageResponse,
) {
  const existing = current ?? [];
  const index = existing.findIndex((item) => item.id === incoming.id);

  if (index === -1) {
    return [...existing, incoming];
  }

  return existing.map((item, itemIndex) =>
    itemIndex === index ? incoming : item,
  );
}

function patchChannelPreview(
  channels: ChannelResponse[] | undefined,
  message: MessageResponse,
) {
  if (!channels?.length) {
    return channels;
  }

  return channels.map((channel) => {
    if (channel.id !== message.channelId) {
      return channel;
    }

    return {
      ...channel,
      lastMessage: message.deletedAt
        ? "Message supprimé"
        : message.content,
      lastMessageAt: message.createdAt,
    };
  });
}

/**
 * Subscribe to realtime DM messages (+ typing for the active channel).
 * Backend publishes to `/topic/channels/{channelId}` after each send
 * and `/topic/channels/{channelId}/typing` for typing indicators.
 */
export function useChannelMessagesSocket(
  channelIds: string[],
  activeChannelId?: string | null,
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelIdsKey = channelIds.filter(Boolean).sort().join(",");
  const channelIdsRef = useRef(channelIds);
  const activeChannelIdRef = useRef(activeChannelId);
  const clientRef = useRef<Client | null>(null);
  const typingTimeoutsRef = useRef(new Map<string, number>());
  const [typingUsers, setTypingUsers] = useState<ChannelTypingUser[]>([]);

  useEffect(() => {
    channelIdsRef.current = channelIds.filter(Boolean);
  }, [channelIdsKey, channelIds]);

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

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
    (entry: ChannelTypingUser) => {
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
  }, [activeChannelId]);

  useEffect(() => {
    if (!user || !channelIdsKey) {
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
        channelIdsRef.current.forEach((channelId) => {
          subscriptions.push(
            client.subscribe(`/topic/channels/${channelId}`, (message) => {
              const payload = readChannelMessage(message);
              if (!payload?.id || !payload.channelId) {
                return;
              }

              queryClient.setQueryData<MessageResponse[]>(
                chatKeys.messages(payload.channelId),
                (current) => upsertMessage(current, payload),
              );

              queryClient.setQueryData<ChannelResponse[]>(
                chatKeys.channels(),
                (current) => patchChannelPreview(current, payload),
              );

              if (
                payload.senderId &&
                payload.channelId === activeChannelIdRef.current
              ) {
                clearTypingUser(payload.senderId);
              }
            }),
          );

          subscriptions.push(
            client.subscribe(
              `/topic/channels/${channelId}/typing`,
              (message) => {
                const payload = readTypingEvent(message);
                if (!payload?.userId || !payload.channelId) {
                  return;
                }

                if (payload.channelId !== activeChannelIdRef.current) {
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
        });
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
  }, [channelIdsKey, clearTypingUser, queryClient, upsertTypingUser, user]);

  const publishTyping = useCallback((typing: boolean) => {
    const channelId = activeChannelIdRef.current;
    const client = clientRef.current;

    if (!channelId || !client?.connected) {
      return;
    }

    client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        channelId,
        typing,
      }),
      headers: { "content-type": "application/json" },
    });
  }, []);

  return {
    typingUsers,
    publishTyping,
  };
}
