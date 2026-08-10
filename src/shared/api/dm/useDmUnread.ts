import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context";
import { chatKeys, useChannelsQuery, useMessagesQueries } from "./hooks";
import type { ChannelResponse, MessageResponse } from "./types";
import {
  markDmChannelRead,
  readDmLastReadMap,
  type DmLastReadMap,
} from "./unreadStorage";

function messageTime(value?: string | null) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sameUserId(left?: string | null, right?: string | null) {
  if (!left || !right) {
    return false;
  }

  return String(left).toLowerCase() === String(right).toLowerCase();
}

export function countUnreadMessages(
  messages: MessageResponse[] | undefined,
  currentUserId: string | undefined,
  lastReadAt: string | null
) {
  if (!messages?.length || !currentUserId) {
    return 0;
  }

  const lastReadTime = lastReadAt ? messageTime(lastReadAt) : 0;

  return messages.filter((message) => {
    if (message.deletedAt) {
      return false;
    }

    if (sameUserId(message.senderId, currentUserId)) {
      return false;
    }

    // Jamais ouverte : tous les messages des autres comptent.
    if (!lastReadAt) {
      return true;
    }

    const created = messageTime(message.createdAt);
    if (!created) {
      return true;
    }

    return created > lastReadTime;
  }).length;
}

export function useDmUnread(
  enabled = true,
  activeChannelId?: string | null
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelsQuery = useChannelsQuery(enabled && Boolean(user));
  const [lastReadMap, setLastReadMap] = useState<DmLastReadMap>({});

  useEffect(() => {
    if (!user?.id) {
      setLastReadMap({});
      return;
    }

    setLastReadMap(readDmLastReadMap(user.id));
  }, [user?.id]);

  const privateChannels = useMemo(
    () =>
      (channelsQuery.data ?? []).filter((channel) => channel.privateChannel),
    [channelsQuery.data]
  );

  const privateChannelIds = useMemo(
    () => privateChannels.map((channel) => channel.id),
    [privateChannels]
  );

  const messageQueries = useMessagesQueries(
    enabled ? privateChannelIds : []
  );

  const unreadByChannelId = useMemo(() => {
    const counts: Record<string, number> = {};

    privateChannels.forEach((channel, index) => {
      if (activeChannelId && channel.id === activeChannelId) {
        return;
      }

      const messages = messageQueries[index]?.data as
        | MessageResponse[]
        | undefined;
      const count = countUnreadMessages(
        messages,
        user?.id,
        lastReadMap[channel.id] ?? null
      );

      if (count > 0) {
        counts[channel.id] = count;
      }
    });

    return counts;
  }, [
    activeChannelId,
    lastReadMap,
    messageQueries,
    privateChannels,
    user?.id,
  ]);

  const newDiscussionsCount = useMemo(
    () => Object.keys(unreadByChannelId).length,
    [unreadByChannelId]
  );

  const totalUnreadMessages = useMemo(
    () =>
      Object.values(unreadByChannelId).reduce((sum, count) => sum + count, 0),
    [unreadByChannelId]
  );

  useEffect(() => {
    if (!enabled || !privateChannels.length) {
      return;
    }

    queryClient.setQueryData<ChannelResponse[]>(
      chatKeys.channels(),
      (current) => {
        if (!current?.length) {
          return current;
        }

        let changed = false;
        const next = current.map((channel) => {
          if (!channel.privateChannel) {
            return channel;
          }

          const unreadCount =
            activeChannelId && channel.id === activeChannelId
              ? 0
              : unreadByChannelId[channel.id] ?? 0;

          if ((channel.unreadCount ?? 0) === unreadCount) {
            return channel;
          }

          changed = true;
          return { ...channel, unreadCount };
        });

        return changed ? next : current;
      }
    );
  }, [
    activeChannelId,
    enabled,
    privateChannels.length,
    queryClient,
    unreadByChannelId,
  ]);

  const markChannelAsRead = useCallback(
    (channelId: string, readAt?: string) => {
      if (!user?.id || !channelId) {
        return;
      }

      const nextMap = markDmChannelRead(user.id, channelId, readAt);
      setLastReadMap(nextMap);

      queryClient.setQueryData<ChannelResponse[]>(
        chatKeys.channels(),
        (current) =>
          current?.map((channel) =>
            channel.id === channelId ? { ...channel, unreadCount: 0 } : channel
          ) ?? current
      );
    },
    [queryClient, user?.id]
  );

  useEffect(() => {
    if (!activeChannelId) {
      return;
    }

    markChannelAsRead(activeChannelId);
  }, [activeChannelId, markChannelAsRead]);

  return {
    privateChannels,
    privateChannelIds,
    unreadByChannelId,
    newDiscussionsCount,
    totalUnreadMessages,
    markChannelAsRead,
    channelsQuery,
  };
}
