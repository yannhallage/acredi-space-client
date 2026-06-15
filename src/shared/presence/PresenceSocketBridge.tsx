import { usePresenceSocket } from "../api/presence/hooks";

export function PresenceSocketBridge() {
  usePresenceSocket();

  return null;
}
