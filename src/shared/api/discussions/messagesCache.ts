import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type {
  GroupMessagePageCursor,
  GroupMessagePageResponse,
  GroupMessageResponse,
} from "./types";

export const discussionKeys = {
  all: ["discussions"] as const,
  mine: () => [...discussionKeys.all, "mine"] as const,
  byTeam: (teamId: string) => [...discussionKeys.all, "team", teamId] as const,
  detail: (id: string) => [...discussionKeys.all, "detail", id] as const,
  messages: (discussionId: string) =>
    [...discussionKeys.all, "messages", discussionId] as const,
};

export type GroupMessageInfiniteData = InfiniteData<
  GroupMessagePageResponse,
  GroupMessagePageCursor | undefined
>;

function emptyPage(): GroupMessagePageResponse {
  return {
    messages: [],
    hasMore: false,
    nextBefore: null,
    nextBeforeId: null,
  };
}

export function flattenGroupMessagePages(
  data?: GroupMessageInfiniteData | InfiniteData<GroupMessagePageResponse> | null,
): GroupMessageResponse[] {
  if (!data?.pages?.length) {
    return [];
  }

  return data.pages
    .slice()
    .reverse()
    .flatMap((page) => page.messages ?? []);
}

export function upsertGroupMessageInPages(
  current: GroupMessageInfiniteData | undefined,
  incoming: GroupMessageResponse,
): GroupMessageInfiniteData {
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

export function writeGroupMessageToCache(
  queryClient: QueryClient,
  incoming: GroupMessageResponse,
) {
  if (!incoming.discussionId) {
    return;
  }

  queryClient.setQueryData<GroupMessageInfiniteData>(
    discussionKeys.messages(incoming.discussionId),
    (current) => upsertGroupMessageInPages(current, incoming),
  );
}
