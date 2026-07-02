import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 900px)";

function subscribe(onStoreChange: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);

  return () => mediaQueryList.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useDmMobileLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
