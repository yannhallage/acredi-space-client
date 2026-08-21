import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type {
  MessagePageCursor,
  MessagePageResponse,
  MessageResponse,
} from "./types";

export const chatKeys = {
  all: ["chat"] as const,
  channels: () => [...chatKeys.all, "channels"] as const,
  messages: (channelId: string) =>
    [...chatKeys.all, "messages", channelId] as const,
  messagePreview: (channelId: string) =>
    [...chatKeys.all, "messagePreview", channelId] as const,
};

export type MessageInfiniteData = InfiniteData<
  MessagePageResponse,
  MessagePageCursor | undefined
>;

function emptyPage(): MessagePageResponse {
  return {
    messages: [],
    hasMore: false,
    nextBefore: null,
    nextBeforeId: null,
  };
}

export function flattenMessagePages(
  data?: MessageInfiniteData | InfiniteData<MessagePageResponse> | null,
): MessageResponse[] {
  if (!data?.pages?.length) {
    return [];
  }

  return data.pages
    .slice()
    .reverse()
    .flatMap((page) => page.messages ?? []);
}

function upsertInList(
  messages: MessageResponse[],
  incoming: MessageResponse,
) {
  const index = messages.findIndex((item) => item.id === incoming.id);

  if (index === -1) {
    return [...messages, incoming];
  }

  return messages.map((item, itemIndex) =>
    itemIndex === index ? incoming : item,
  );
}

export function upsertMessageInPages(
  current: MessageInfiniteData | undefined,
  incoming: MessageResponse,
): MessageInfiniteData {
  const pages = current?.pages?.length ? current.pages : [emptyPage()];
  const pageParams = current?.pageParams?.length
    ? current.pageParams
    : [undefined];

  let found = false;
  const nextPages = pages.map((page) => {
    const index = page.messages.findIndex((item) => item.id === incoming.id);

    if (index === -1) {
      return page;
    }

    found = true;
    const messages = [...page.messages];
    messages[index] = incoming;
    return { ...page, messages };
  });

  if (found) {
    return { pages: nextPages, pageParams };
  }

  const [newest, ...older] = nextPages;

  return {
    pages: [
      {
        ...newest,
        messages: [...newest.messages, incoming],
      },
      ...older,
    ],
    pageParams,
  };
}

export function upsertMessageInPreview(
  current: MessagePageResponse | undefined,
  incoming: MessageResponse,
): MessagePageResponse {
  const page = current ?? emptyPage();
  return {
    ...page,
    messages: upsertInList(page.messages, incoming),
  };
}

export function writeMessageToCaches(
  queryClient: QueryClient,
  incoming: MessageResponse,
) {
  if (!incoming.channelId) {
    return;
  }

  queryClient.setQueryData<MessageInfiniteData>(
    chatKeys.messages(incoming.channelId),
    (current) => upsertMessageInPages(current, incoming),
  );

  queryClient.setQueryData<MessagePageResponse>(
    chatKeys.messagePreview(incoming.channelId),
    (current) => upsertMessageInPreview(current, incoming),
  );
}
