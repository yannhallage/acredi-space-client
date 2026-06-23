const MEETING_ROOM_ROUTE_SEGMENT = "meeting-room";
const MEETING_ROOM_BASE_URL = "https://meet.acredigroup.com";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).map(safeDecode);
  const routeIndex = parts.findIndex((part) => part === MEETING_ROOM_ROUTE_SEGMENT);

  if (routeIndex >= 0) {
    return parts[routeIndex + 1] ?? null;
  }

  return parts.at(-1) ?? null;
}

export function extractMeetingRoomName(joinUrl?: string | null) {
  const value = joinUrl?.trim();

  if (!value) {
    return null;
  }

  try {
    return extractFromPath(new URL(value, "https://acredispace.local").pathname);
  } catch {
    return extractFromPath(value.split(/[?#]/, 1)[0]);
  }
}

export function buildMeetingRoomUrl(roomName: string) {
  return `${MEETING_ROOM_BASE_URL}/${encodeURIComponent(roomName)}`;
}
