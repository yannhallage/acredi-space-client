import { http } from "../http";
import { fileEndpoints } from "./endpoints";
import { normalizeFile, normalizeFiles } from "./normalizers";
import type {
  ApiResponse,
  FileResponse,
  ShareFileRequest,
  UploadFileRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

function unwrapMaybeApiResponse<TData>(response: ApiResponse<TData> | TData) {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<TData>).data;
  }

  return response as TData;
}

function readDownloadUrl(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;

    for (const key of ["url", "downloadUrl", "fileUrl", "previewUrl", "signedUrl"]) {
      const url = source[key];

      if (typeof url === "string" && url.trim()) {
        return url.trim();
      }
    }
  }

  throw new Error("Lien de telechargement introuvable.");
}

function buildUploadFormData(request: UploadFileRequest) {
  const formData = new FormData();

  formData.append("file", request.file);

  if (request.folderId) {
    formData.append("folderId", request.folderId);
  }

  if (request.teamId) {
    formData.append("teamId", request.teamId);
  }

  if (request.visibility) {
    formData.append("visibility", request.visibility);
  }

  return formData;
}

export const fileService = {
  async delete(id: string) {
    const response = await http.delete<ApiResponse<FileResponse>>(
      fileEndpoints.delete(id),
    );

    return normalizeFile(unwrapApiResponse(response));
  },

  async deletePermanently(id: string) {
    await http.delete<ApiResponse<void>>(fileEndpoints.deletePermanently(id));
  },

  async downloadUrl(id: string) {
    const response = await http.get<
      ApiResponse<{ url?: string } | string> | { url?: string } | string
    >(
      fileEndpoints.downloadUrl(id),
    );

    return readDownloadUrl(unwrapMaybeApiResponse(response));
  },

  async findMine() {
    const response = await http.get<ApiResponse<FileResponse[]>>(
      fileEndpoints.findMine,
    );

    return normalizeFiles(unwrapApiResponse(response));
  },

  async findSharedWithMe() {
    const response = await http.get<ApiResponse<FileResponse[]>>(
      fileEndpoints.findSharedWithMe,
    );

    return normalizeFiles(unwrapApiResponse(response));
  },

  async findTrash() {
    const response = await http.get<ApiResponse<FileResponse[]>>(
      fileEndpoints.findTrash,
    );

    return normalizeFiles(unwrapApiResponse(response));
  },

  async restore(id: string) {
    const response = await http.post<ApiResponse<FileResponse>>(
      fileEndpoints.restore(id),
    );

    return normalizeFile(unwrapApiResponse(response));
  },

  async share(id: string, request: ShareFileRequest) {
    const response = await http.post<ApiResponse<FileResponse>>(
      fileEndpoints.share(id),
      request,
    );

    return normalizeFile(unwrapApiResponse(response));
  },

  async upload(request: UploadFileRequest) {
    const response = await http.post<ApiResponse<FileResponse>>(
      fileEndpoints.upload,
      buildUploadFormData(request),
    );

    return normalizeFile(unwrapApiResponse(response));
  },
};
