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
    await http.delete<ApiResponse<void>>(fileEndpoints.delete(id));
  },

  async downloadUrl(id: string) {
    const response = await http.get<ApiResponse<{ url: string }>>(
      fileEndpoints.downloadUrl(id),
    );

    return unwrapApiResponse(response).url;
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
