import { http } from "../http";
import { meetingEndpoints } from "./endpoints";
import type {
  CreateMeetingRequest,
  InviteParticipantRequest,
  MeetingResponse,
  UpdateMeetingRequest,
} from "./types";

function unwrapApiResponse<TData>(response: any): TData {
  return response?.data?.data ?? response?.data;
}

export const meetingService = {
  async findMine() {
    const response = await http.get(meetingEndpoints.meetings);
    return unwrapApiResponse<MeetingResponse[]>(response);
  },

  async create(request: CreateMeetingRequest) {
    const response = await http.post(meetingEndpoints.meetings, request);
    return unwrapApiResponse<MeetingResponse>(response);
  },

  async inviteParticipant(id: string, request: InviteParticipantRequest) {
    const response = await http.post(
      meetingEndpoints.participants(id),
      request,
    );
    return unwrapApiResponse<MeetingResponse>(response);
  },

  async update(id: string, request: UpdateMeetingRequest) {
    const response = await http.put(meetingEndpoints.meeting(id), request);
    return unwrapApiResponse<MeetingResponse>(response);
  },

  async start(id: string) {
    const response = await http.post(meetingEndpoints.start(id));
    return unwrapApiResponse<MeetingResponse>(response);
  },

  async end(id: string) {
    const response = await http.post(meetingEndpoints.end(id));
    return unwrapApiResponse<MeetingResponse>(response);
  },
};
