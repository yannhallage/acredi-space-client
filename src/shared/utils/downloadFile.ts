import { fileService } from "../api/files/service";
import { API_ORIGIN, resolveAssetUrl } from "../api/http";

function getStoredToken() {
  return localStorage.getItem("accessToken");
}

function triggerAnchorDownload(href: string, filename?: string) {
  const anchor = document.createElement("a");
  anchor.href = href;

  if (filename) {
    anchor.download = filename;
  }

  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function needsAuthHeader(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === API_ORIGIN || parsed.origin === window.location.origin
    );
  } catch {
    return false;
  }
}

export async function downloadFileFromUrl(
  url: string,
  filename?: string,
): Promise<void> {
  const resolvedUrl = resolveAssetUrl(url) ?? url;
  const headers = new Headers();

  if (needsAuthHeader(resolvedUrl)) {
    const token = getStoredToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(resolvedUrl, { headers });

    if (!response.ok) {
      throw new Error("download-failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchorDownload(objectUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return;
  } catch {
    triggerAnchorDownload(resolvedUrl, filename);
  }
}

export async function downloadFileById(
  fileId: string,
  filename?: string,
): Promise<void> {
  const url = await fileService.downloadUrl(fileId);

  if (!url) {
    throw new Error("Lien de telechargement introuvable.");
  }

  await downloadFileFromUrl(url, filename);
}
