import { HttpError, http } from "../http";
import { pollEndpoints } from "./endpoints";
import {
  normalizeMyPollResponse,
  normalizePollDetail,
  normalizePollListItems,
  normalizePollResults,
  normalizePollStats,
} from "./normalizers";
import type {
  ApiResponse,
  CreatePollRequest,
  InvitePollParticipantsRequest,
  MyPollResponseDto,
  PollDetailResponse,
  PollListItemResponse,
  PollListParams,
  PollResultsResponse,
  PollStatsResponse,
  SubmitPollResponseRequest,
  UpdateParticipantStatusRequest,
  UpdatePollRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const pollService = {
  async findAll(params?: PollListParams) {
    const response = await http.get<ApiResponse<PollListItemResponse[]>>(
      pollEndpoints.findAll,
      {
        params: params as Record<string, string | undefined> | undefined,
      }
    );

    return normalizePollListItems(unwrapApiResponse(response) ?? []);
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<PollDetailResponse>>(
      pollEndpoints.findById(id)
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async create(request: CreatePollRequest) {
    const response = await http.post<ApiResponse<PollDetailResponse>>(
      pollEndpoints.create,
      request
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async update(id: string, request: UpdatePollRequest) {
    const response = await http.put<ApiResponse<PollDetailResponse>>(
      pollEndpoints.update(id),
      request
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(pollEndpoints.delete(id));
  },

  async publish(id: string) {
    const response = await http.post<ApiResponse<PollDetailResponse>>(
      pollEndpoints.publish(id)
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async close(id: string) {
    const response = await http.post<ApiResponse<PollDetailResponse>>(
      pollEndpoints.close(id)
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async archive(id: string) {
    const response = await http.post<ApiResponse<PollDetailResponse>>(
      pollEndpoints.archive(id)
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async inviteParticipants(id: string, request: InvitePollParticipantsRequest) {
    const response = await http.post<ApiResponse<PollDetailResponse>>(
      pollEndpoints.participants(id),
      request
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async updateParticipantStatus(
    id: string,
    userId: string,
    request: UpdateParticipantStatusRequest
  ) {
    const response = await http.put<ApiResponse<PollDetailResponse>>(
      pollEndpoints.participant(id, userId),
      request
    );

    return normalizePollDetail(unwrapApiResponse(response));
  },

  async submitResponse(id: string, request: SubmitPollResponseRequest) {
    const response = await http.post<ApiResponse<MyPollResponseDto>>(
      pollEndpoints.responses(id),
      request
    );

    return normalizeMyPollResponse(unwrapApiResponse(response));
  },

  async updateResponse(id: string, request: SubmitPollResponseRequest) {
    const response = await http.put<ApiResponse<MyPollResponseDto>>(
      pollEndpoints.responses(id),
      request
    );

    return normalizeMyPollResponse(unwrapApiResponse(response));
  },

  async getMyResponse(id: string) {
    try {
      const response = await http.get<ApiResponse<MyPollResponseDto>>(
        pollEndpoints.myResponse(id)
      );

      return normalizeMyPollResponse(unwrapApiResponse(response));
    } catch (error) {
      if (error instanceof HttpError && (error.status === 404 || error.status === 204)) {
        return null;
      }
      throw error;
    }
  },

  async getResults(id: string) {
    const response = await http.get<ApiResponse<PollResultsResponse>>(
      pollEndpoints.results(id)
    );

    return normalizePollResults(unwrapApiResponse(response));
  },

  async getStats(id: string) {
    const response = await http.get<ApiResponse<PollStatsResponse>>(
      pollEndpoints.stats(id)
    );

    return normalizePollStats(unwrapApiResponse(response));
  },
};
