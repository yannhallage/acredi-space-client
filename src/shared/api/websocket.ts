import { API_BASE_URL } from "./http";

const RECONNECT_DELAY_MS = 5000;

export function websocketUrl() {
  return `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws`;
}

export const websocketReconnectDelayMs = RECONNECT_DELAY_MS;

export function parseSocketJson<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}
