import { http } from "../http";
import { folderEndpoints } from "./endpoints";
import { normalizeFolder, normalizeFolders } from "./normalizers";
import type {
  ApiResponse,
  CreateFolderRequest,
  FolderResponse,
  UpdateFolderRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const folderService = {
  async create(request: CreateFolderRequest) {
    const response = await http.post<ApiResponse<FolderResponse>>(
      folderEndpoints.create,
      request
    );

    return normalizeFolder(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(folderEndpoints.delete(id));
  },

  async findMine() {
    const response = await http.get<ApiResponse<FolderResponse[]>>(
      folderEndpoints.findMine
    );

    return normalizeFolders(unwrapApiResponse(response));
  },

  async update(id: string, request: UpdateFolderRequest) {
    const response = await http.put<ApiResponse<FolderResponse>>(
      folderEndpoints.update(id),
      request
    );

    return normalizeFolder(unwrapApiResponse(response));
  },
};
