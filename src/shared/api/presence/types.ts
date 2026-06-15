import type { ApiResponse } from "../api";
import type { Presence } from "../../types";

export type PresenceStatusResponse = "ONLINE" | "BUSY" | "AWAY" | "OFFLINE";

export interface PresenceResponse {
  userId: string;
  status: PresenceStatusResponse;
  lastSeenAt?: string | null;
}

export interface UpdatePresenceRequest {
  status: PresenceStatusResponse;
}

export interface PresenceEntry extends PresenceResponse {
  presence: Presence;
}

export type { ApiResponse };
