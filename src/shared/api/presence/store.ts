import type { Presence, User } from "../../types";
import type { PresenceEntry, PresenceResponse, PresenceStatusResponse } from "./types";

const STORAGE_KEY = "acredi-presence";
const MAX_ACTIVE_AGE_MS = 2 * 60 * 1000;

export const PRESENCE_EVENT = "acredi:presence";

let cache: Map<string, PresenceEntry> | null = null;

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadCache() {
  if (cache) {
    return cache;
  }

  cache = new Map<string, PresenceEntry>();

  if (!hasLocalStorage()) {
    return cache;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const values = stored ? (JSON.parse(stored) as PresenceEntry[]) : [];

    values.forEach((entry) => {
      if (entry.userId) {
        cache?.set(entry.userId, entry);
      }
    });
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return cache;
}

function persistCache() {
  if (!hasLocalStorage() || !cache) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...cache.values()]));
}

function dispatchPresence(entry: PresenceEntry) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<PresenceEntry>(PRESENCE_EVENT, { detail: entry }));
}

function isFresh(entry: PresenceEntry) {
  if (entry.presence === "offline" || !entry.lastSeenAt) {
    return true;
  }

  const time = Date.parse(entry.lastSeenAt);
  return Number.isNaN(time) || Date.now() - time <= MAX_ACTIVE_AGE_MS;
}

export function toUiPresence(status?: string | null): Presence {
  const value = status?.trim().toUpperCase();

  if (value === "ONLINE") return "online";
  if (value === "BUSY") return "busy";
  if (value === "AWAY") return "away";
  return "offline";
}

export function cachePresence(response: PresenceResponse) {
  if (!response.userId) {
    return null;
  }

  const entry: PresenceEntry = {
    ...response,
    presence: toUiPresence(response.status),
  };

  loadCache().set(entry.userId, entry);
  persistCache();
  dispatchPresence(entry);

  return entry;
}

export function cachePresenceList(responses: PresenceResponse[]) {
  const entries = responses
    .map((response) => {
      if (!response.userId) {
        return null;
      }

      return {
        ...response,
        presence: toUiPresence(response.status),
      } satisfies PresenceEntry;
    })
    .filter((entry): entry is PresenceEntry => Boolean(entry));

  const presenceCache = loadCache();
  entries.forEach((entry) => presenceCache.set(entry.userId, entry));
  persistCache();
  entries.forEach(dispatchPresence);

  return entries;
}

export function readCachedPresence(userId?: string | null): Presence | undefined {
  if (!userId) {
    return undefined;
  }

  const entry = loadCache().get(userId);
  if (!entry) {
    return undefined;
  }

  return isFresh(entry) ? entry.presence : "offline";
}

export function patchUserPresence(user: User, entry: PresenceEntry): User {
  return user.id === entry.userId ? { ...user, presence: entry.presence } : user;
}

export function patchUsersPresence(users: User[], entry: PresenceEntry) {
  return users.map((user) => patchUserPresence(user, entry));
}

export function addPresenceListener(callback: (entry: PresenceEntry) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    callback((event as CustomEvent<PresenceEntry>).detail);
  };

  window.addEventListener(PRESENCE_EVENT, listener);
  return () => window.removeEventListener(PRESENCE_EVENT, listener);
}

export function isActivePresence(presence: Presence) {
  return presence === "online" || presence === "busy" || presence === "away";
}

export function isPresenceStatus(value: string): value is PresenceStatusResponse {
  return value === "ONLINE" || value === "BUSY" || value === "AWAY" || value === "OFFLINE";
}
