import type { WorkspaceFile } from "../../shared/api/files";

export type PreviewState = {
  error: string | null;
  fileId: string | null;
  loading: boolean;
  url: string | null;
};

export type FilePreviewKind =
  | "image"
  | "pdf"
  | "video"
  | "audio"
  | "text"
  | "unsupported";

export function getFileExtension(file: WorkspaceFile) {
  const nameExtension = file.name.includes(".")
    ? file.name.split(".").pop()
    : null;
  const mimeExtension = file.contentType?.split("/").pop();
  const extension = nameExtension || mimeExtension || "file";

  return extension.slice(0, 4).toUpperCase();
}

export function getFileColor(file: WorkspaceFile) {
  const extension = getFileExtension(file).toLowerCase();

  if (extension === "pdf") {
    return "#ff5c75";
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return "#29c36a";
  }

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return "#8b7fff";
  }

  if (["zip", "rar", "7z"].includes(extension)) {
    return "#f3a712";
  }

  return "#6f7bff";
}

export function getPreviewKind(file: WorkspaceFile): FilePreviewKind {
  const contentType = file.contentType?.toLowerCase() ?? "";
  const extension = getFileExtension(file).toLowerCase();

  if (
    contentType.startsWith("image/") ||
    ["gif", "jpeg", "jpg", "png", "webp"].includes(extension)
  ) {
    return "image";
  }

  if (contentType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (contentType.startsWith("video/")) {
    return "video";
  }

  if (contentType.startsWith("audio/")) {
    return "audio";
  }

  if (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    ["csv", "json", "md", "txt", "xml"].includes(extension)
  ) {
    return "text";
  }

  return "unsupported";
}

export function isImageFile(file: WorkspaceFile) {
  return getPreviewKind(file) === "image";
}

export function isVideoFile(file: WorkspaceFile) {
  return getPreviewKind(file) === "video";
}

export function canZoomPreview(file: WorkspaceFile) {
  return getPreviewKind(file) === "image";
}
