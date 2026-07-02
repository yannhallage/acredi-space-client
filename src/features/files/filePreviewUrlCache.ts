import { useEffect, useState } from "react";

import { fileService } from "../../shared/api/files/service";
import { loadAssetUrl } from "../../shared/api/http";

type CacheEntry = {
  revoke?: () => void;
  error?: boolean;
  promise?: Promise<string>;
  url?: string;
};

const cache = new Map<string, CacheEntry>();

async function resolveDownloadUrl(url: string) {
  const loaded = await loadAssetUrl(url);

  if (!loaded) {
    throw new Error("preview-unavailable");
  }

  return loaded;
}

function replaceCacheEntry(fileId: string, entry: CacheEntry) {
  const current = cache.get(fileId);

  if (current?.revoke && current.url !== entry.url) {
    current.revoke();
  }

  cache.set(fileId, entry);
}

async function fetchFilePreviewUrl(fileId: string) {
  const existing = cache.get(fileId);

  if (existing?.url) {
    return existing.url;
  }

  if (existing?.error) {
    throw new Error("preview-unavailable");
  }

  if (!existing?.promise) {
    const promise = fileService
      .downloadUrl(fileId)
      .then(async (url) => {
        const loaded = await resolveDownloadUrl(url);
        replaceCacheEntry(fileId, { revoke: loaded.revoke, url: loaded.url });
        return loaded.url;
      })
      .catch((error) => {
        cache.delete(fileId);
        throw error;
      });

    cache.set(fileId, { promise });
  }

  return cache.get(fileId)!.promise!;
}

export function setCachedFilePreviewUrl(fileId: string, url: string) {
  void cacheFilePreviewUrl(fileId, url);
}

export async function cacheFilePreviewUrl(fileId: string, url: string) {
  const loaded = await resolveDownloadUrl(url);
  replaceCacheEntry(fileId, { revoke: loaded.revoke, url: loaded.url });

  return loaded.url;
}

export function useFilePreviewUrl(fileId: string | null, enabled = true) {
  const [state, setState] = useState<{
    error: boolean;
    loading: boolean;
    url: string | null;
  }>(() => {
    if (!fileId || !enabled) {
      return { error: false, loading: false, url: null };
    }

    const cached = cache.get(fileId);

    if (cached?.url) {
      return { error: false, loading: false, url: cached.url };
    }

    if (cached?.error) {
      return { error: true, loading: false, url: null };
    }

    return { error: false, loading: true, url: null };
  });

  useEffect(() => {
    if (!fileId || !enabled) {
      return;
    }

    const cached = cache.get(fileId);

    if (cached?.url) {
      setState({ error: false, loading: false, url: cached.url });
      return;
    }

    if (cached?.error) {
      setState({ error: true, loading: false, url: null });
      return;
    }

    let cancelled = false;
    setState({ error: false, loading: true, url: null });

    fetchFilePreviewUrl(fileId)
      .then((url) => {
        if (!cancelled) {
          setState({ error: false, loading: false, url });
        }
      })
      .catch(() => {
        cache.set(fileId, { error: true });

        if (!cancelled) {
          setState({ error: true, loading: false, url: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, fileId]);

  return state;
}
