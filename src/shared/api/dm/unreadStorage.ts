const storageKeyFor = (userId: string) => `acredi-dm-last-read:v2:${userId}`;

export type DmLastReadMap = Record<string, string>;

export function readDmLastReadMap(userId: string): DmLastReadMap {
  try {
    const raw = localStorage.getItem(storageKeyFor(userId));
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as DmLastReadMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDmLastReadMap(userId: string, map: DmLastReadMap) {
  try {
    localStorage.setItem(storageKeyFor(userId), JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export function markDmChannelRead(
  userId: string,
  channelId: string,
  readAt = new Date().toISOString()
) {
  const map = readDmLastReadMap(userId);
  map[channelId] = readAt;
  writeDmLastReadMap(userId, map);
  return map;
}

export function getDmChannelLastRead(
  userId: string,
  channelId: string
): string | null {
  return readDmLastReadMap(userId)[channelId] ?? null;
}
