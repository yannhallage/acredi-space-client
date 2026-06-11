import { http } from "../http";
import { noteEndpoints } from "./endpoints";
import {
  normalizeNote,
  normalizeNotes,
  normalizeNoteVersions,
} from "./normalizers";

import type {
  ApiResponse,
  CreateNoteRequest,
  NoteResponse,
  NoteVersionResponse,
  ShareNoteRequest,
  UpdateNoteRequest,
} from "./type";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const noteService = {
  async archive(id: string) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.archive(id)
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async create(request: CreateNoteRequest) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.create,
      request
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(noteEndpoints.delete(id));
  },

  async findAll(params?: { archived?: boolean; q?: string }) {
    const response = await http.get<ApiResponse<NoteResponse[]>>(
      noteEndpoints.findAll,
      {
        params,
      }
    );

    return normalizeNotes(unwrapApiResponse(response));
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<NoteResponse>>(
      noteEndpoints.findById(id)
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async findVersions(id: string) {
    const response = await http.get<ApiResponse<NoteVersionResponse[]>>(
      noteEndpoints.findVersions(id)
    );

    return normalizeNoteVersions(unwrapApiResponse(response));
  },

  async pin(id: string) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.pin(id)
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async restore(id: string) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.restore(id)
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async share(id: string, request: ShareNoteRequest) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.share(id),
      request
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async unpin(id: string) {
    const response = await http.post<ApiResponse<NoteResponse>>(
      noteEndpoints.unpin(id)
    );

    return normalizeNote(unwrapApiResponse(response));
  },

  async update(id: string, request: UpdateNoteRequest) {
    const response = await http.put<ApiResponse<NoteResponse>>(
      noteEndpoints.update(id),
      request
    );

    return normalizeNote(unwrapApiResponse(response));
  },
};