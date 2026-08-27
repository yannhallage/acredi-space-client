import type { DashboardNotification } from "../api/dashboard";

const EXACT_APP_PATHS = new Set([
  "/app/dashboard",
  "/app/files",
  "/app/chat",
  "/app/dm",
  "/app/calendar",
  "/app/profile",
  "/app/admin",
  "/app/my-team",
  "/app/teams",
  "/app/teams/create",
  "/app/users",
  "/app/notes",
  "/app/checklists",
  "/app/meeting/meet-daily",
]);

const VALID_APP_ROUTE_PATTERNS = [
  /^\/app\/files\/[^/]+$/,
  /^\/app\/chat\/[^/]+$/,
  /^\/app\/dm\/[^/]+$/,
  /^\/app\/meeting\/[^/]+$/,
  /^\/app\/users\/[^/]+$/,
] as const;

const RESOURCE_PATH_MATCHERS: Array<{
  pattern: RegExp;
  resolve: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /^\/app\/chat\/channels\/([^/]+)$/,
    resolve: ([, channelId]) => `/app/dm/${channelId}`,
  },
  {
    pattern: /^\/app\/teams\/[^/]+\/discussions\/([^/]+)$/,
    resolve: ([, discussionId]) => `/app/chat/${discussionId}`,
  },
  {
    pattern: /^\/dm(?:\/([^/]+))?$/,
    resolve: ([, conversationId]) =>
      conversationId ? `/app/dm/${conversationId}` : "/app/dm",
  },
  {
    pattern: /^\/chat\/channels\/([^/]+)$/,
    resolve: ([, channelId]) => `/app/dm/${channelId}`,
  },
  {
    pattern: /^\/channels\/([^/]+)$/,
    resolve: ([, channelId]) => `/app/dm/${channelId}`,
  },
  {
    pattern: /^\/teams\/[^/]+\/discussions\/([^/]+)$/,
    resolve: ([, discussionId]) => `/app/chat/${discussionId}`,
  },
  {
    pattern: /^\/discussions\/([^/]+)$/,
    resolve: ([, discussionId]) => `/app/chat/${discussionId}`,
  },
  {
    pattern: /^\/chat\/([^/]+)$/,
    resolve: ([, channelId]) => `/app/chat/${channelId}`,
  },
  {
    pattern: /^\/meetings\/([^/]+)$/,
    resolve: ([, meetingId]) => `/app/meeting/${meetingId}`,
  },
  {
    pattern: /^\/meeting\/([^/]+)$/,
    resolve: ([, meetingId]) => `/app/meeting/${meetingId}`,
  },
  {
    pattern: /^\/files\/([^/]+)$/,
    resolve: ([, folderId]) => `/app/files/${folderId}`,
  },
  {
    pattern: /^\/folders\/([^/]+)$/,
    resolve: ([, folderId]) => `/app/files/${folderId}`,
  },
  {
    pattern: /^\/users\/([^/]+)$/,
    resolve: ([, userId]) => `/app/users/${userId}`,
  },
];

function isExactValidAppRoute(path: string) {
  if (EXACT_APP_PATHS.has(path)) {
    return true;
  }

  return VALID_APP_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
}

function mapBackendResourcePath(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] ?? pathname;
  const path =
    pathOnly.replace(/^\/api(?=\/|$)/, "").replace(/\/+$/, "") || "/";

  for (const matcher of RESOURCE_PATH_MATCHERS) {
    const match = path.match(matcher.pattern);

    if (match) {
      return matcher.resolve(match);
    }
  }

  if (isExactValidAppRoute(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    const fallback = `/app${path}`;

    if (isExactValidAppRoute(fallback)) {
      return fallback;
    }
  } else if (path !== "/") {
    const fallback = `/app/${path}`;

    if (isExactValidAppRoute(fallback)) {
      return fallback;
    }
  }

  return null;
}

export function normalizeNotificationLink(linkUrl: string) {
  const trimmed = linkUrl.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);

      return mapBackendResourcePath(
        `${url.pathname}${url.search}${url.hash}`
      );
    } catch {
      return null;
    }
  }

  return mapBackendResourcePath(trimmed);
}

export function getNotificationTarget(notification: DashboardNotification) {
  if (notification.linkUrl) {
    const normalizedLink = normalizeNotificationLink(notification.linkUrl);

    if (normalizedLink) {
      return normalizedLink;
    }
  }

  const type = notification.type.toUpperCase();

  if (type === "CHAT_MESSAGE") {
    return "/app/dm";
  }

  if (type === "GROUP_DISCUSSION_MESSAGE" || type.includes("GROUP_DISCUSSION")) {
    return "/app/chat";
  }

  if (type === "TEAM_INVITE" || type.includes("TEAM_INVITE")) {
    return "/app/my-team";
  }

  if (type.includes("FILE")) {
    return "/app/files";
  }

  if (type.includes("MEETING")) {
    return "/app/meeting/meet-daily";
  }

  if (type.includes("CALENDAR") || type.includes("EVENT")) {
    return "/app/calendar";
  }

  if (type.includes("NOTE")) {
    return "/app/notes";
  }

  if (type.includes("CHECKLIST")) {
    return "/app/checklists";
  }

  if (type.includes("TEAM")) {
    return "/app/teams";
  }

  if (type.includes("USER")) {
    return "/app/users";
  }

  if (
    type.includes("CHAT") ||
    type.includes("CHANNEL") ||
    type.includes("MENTION") ||
    type.includes("DISCUSSION")
  ) {
    return "/app/chat";
  }

  if (type.includes("DM") || type.includes("DIRECT") || type.includes("PRIVATE")) {
    return "/app/dm";
  }

  if (type.includes("MESSAGE")) {
    return "/app/dm";
  }

  return null;
}
