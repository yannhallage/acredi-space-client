import { useEffect, useRef } from "react";
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

function readChannelMessage(message: IMessage) {
  return parseSocketJson<MessageResponse>(message.body);
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
 * Subscribe to realtime DM messages for one or many channels.
 * Backend publishes to `/topic/channels/{channelId}` after each send.
 */
export function useChannelMessagesSocket(channelIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelIdsKey = channelIds.filter(Boolean).sort().join(",");
  const channelIdsRef = useRef(channelIds);

  useEffect(() => {
    channelIdsRef.current = channelIds.filter(Boolean);
  }, [channelIdsKey, channelIds]);

  useEffect(() => {
    if (!user || !channelIdsKey) {
      return undefined;
    }

    const token = localStorage.getItem(authStorageKeys.accessToken);
    if (!token) {
      return undefined;
    }

    const subscriptions: StompSubscription[] = [];

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
          const subscription = client.subscribe(
            `/topic/channels/${channelId}`,
            (message) => {
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
            },
          );

          subscriptions.push(subscription);
        });
      },
    });

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
    };
  }, [channelIdsKey, queryClient, user]);
}
