import { http } from "../http";
import { notesEndpoints } from "./endpoints";
import type { ApiResponse, CreateNoteRequest, NoteResponse } from "./types";

function unwrapApiResponse<T>(response: ApiResponse<T>) {
  return response.data as T;
}

export const notesService = {
  async findMine(archived = false, q?: string) {
    const params = new URLSearchParams();
    if (archived) params.set("archived", "true");
    if (q) params.set("q", q);

    const path = `${notesEndpoints.findMine}${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await http.get<ApiResponse<NoteResponse[]>>(path);
    return unwrapApiResponse(response);
  },

  async create(request: CreateNoteRequest) {
    const response = await http.post<ApiResponse<NoteResponse>>(notesEndpoints.create, request);
    return unwrapApiResponse(response);
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<NoteResponse>>(notesEndpoints.findById(id));
    return unwrapApiResponse(response);
  },

  async update(id: string, request: Partial<CreateNoteRequest>) {
    const response = await http.put<ApiResponse<NoteResponse>>(notesEndpoints.update(id), request);
    return unwrapApiResponse(response);
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(notesEndpoints.delete(id));
  },
};
