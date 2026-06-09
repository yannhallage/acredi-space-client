const DEFAULT_SMALL_FILE_UPLOAD_MAX_SIZE_BYTES = 100 * 1024 * 1024;

function readSmallFileUploadMaxSize() {
  const configured = Number(import.meta.env.VITE_FILE_UPLOAD_MAX_SIZE_BYTES);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_SMALL_FILE_UPLOAD_MAX_SIZE_BYTES;
}

export const SMALL_FILE_UPLOAD_MAX_SIZE_BYTES = readSmallFileUploadMaxSize();

export function formatUploadSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  const units = ["Ko", "Mo", "Go", "To"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export const SMALL_FILE_UPLOAD_MAX_SIZE_LABEL = formatUploadSize(
  SMALL_FILE_UPLOAD_MAX_SIZE_BYTES,
);

export function isSmallFileUpload(file: globalThis.File) {
  return file.size <= SMALL_FILE_UPLOAD_MAX_SIZE_BYTES;
}
