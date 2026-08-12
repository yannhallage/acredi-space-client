export type PollStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "CLOSED"
  | "ARCHIVED";

export type PollVisibility =
  | "ORGANIZATION"
  | "TEAM"
  | "CHANNEL"
  | "PRIVATE";

export type PollQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TEXT";

export type PollParticipantStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "RESPONDED";

export interface ApiResponse<TData = unknown> {
  success: boolean;
  message: string;
  data: TData;
  timestamp?: string;
}

export interface PollOptionInput {
  label: string;
  sortOrder?: number;
}

export interface PollQuestionInput {
  title: string;
  description?: string | null;
  type: PollQuestionType;
  required?: boolean;
  sortOrder?: number;
  options?: PollOptionInput[];
}

export interface CreatePollRequest {
  title: string;
  description?: string | null;
  visibility?: PollVisibility;
  teamId?: string | null;
  channelId?: string | null;
  anonymousResponses?: boolean;
  allowResponseModification?: boolean;
  commentsEnabled?: boolean;
  closesAt?: string | null;
  questions: PollQuestionInput[];
}

export interface UpdatePollRequest {
  title?: string;
  description?: string | null;
  visibility?: PollVisibility;
  teamId?: string | null;
  channelId?: string | null;
  anonymousResponses?: boolean;
  allowResponseModification?: boolean;
  commentsEnabled?: boolean;
  closesAt?: string | null;
  questions?: PollQuestionInput[];
}

export interface InvitePollParticipantsRequest {
  userIds: string[];
}

export interface UpdateParticipantStatusRequest {
  status: PollParticipantStatus;
}

export interface PollAnswerInput {
  questionId: string;
  optionIds?: string[];
  textValue?: string | null;
}

export interface SubmitPollResponseRequest {
  answers: PollAnswerInput[];
}

export interface PollOptionResponse {
  id: string;
  label: string;
  sortOrder: number;
}

export interface PollQuestionResponse {
  id: string;
  title: string;
  description: string | null;
  type: PollQuestionType;
  required: boolean;
  sortOrder: number;
  options: PollOptionResponse[];
}

export interface PollListItemResponse {
  id: string;
  title: string;
  status: PollStatus;
  visibility: PollVisibility;
  teamId: string | null;
  channelId: string | null;
  closesAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface PollDetailResponse {
  id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  visibility: PollVisibility;
  anonymousResponses: boolean;
  allowResponseModification: boolean;
  commentsEnabled: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  closesAt: string | null;
  archivedAt: string | null;
  createdById: string | null;
  createdByName: string | null;
  organizationId: string | null;
  teamId: string | null;
  channelId: string | null;
  questions: PollQuestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MyPollAnswerDto {
  questionId: string;
  optionIds: string[];
  textValue: string | null;
}

export interface MyPollResponseDto {
  responseId: string;
  submittedAt: string;
  updatedAt: string;
  answers: MyPollAnswerDto[];
}

export interface PollOptionResult {
  optionId: string;
  label: string;
  count: number;
}

export interface PollQuestionResult {
  questionId: string;
  title: string;
  type: PollQuestionType;
  options: PollOptionResult[];
  textAnswers: string[];
}

export interface PollResultsResponse {
  pollId: string;
  totalResponses: number;
  questions: PollQuestionResult[];
}

export interface PollStatsResponse {
  totalViews: number;
  uniqueViewers: number;
}

export interface PollListItem {
  id: string;
  title: string;
  status: PollStatus;
  visibility: PollVisibility;
  teamId: string | null;
  channelId: string | null;
  closesAt: Date | null;
  publishedAt: Date | null;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  label: string;
  sortOrder: number;
}

export interface PollQuestion {
  id: string;
  title: string;
  description: string | null;
  type: PollQuestionType;
  required: boolean;
  sortOrder: number;
  options: PollOption[];
}

export interface PollDetail {
  id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  visibility: PollVisibility;
  anonymousResponses: boolean;
  allowResponseModification: boolean;
  commentsEnabled: boolean;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  closesAt: Date | null;
  archivedAt: Date | null;
  createdById: string | null;
  createdByName: string | null;
  organizationId: string | null;
  teamId: string | null;
  channelId: string | null;
  questions: PollQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MyPollResponse {
  responseId: string;
  submittedAt: Date;
  updatedAt: Date;
  answers: Array<{
    questionId: string;
    optionIds: string[];
    textValue: string | null;
  }>;
}

export interface PollResults {
  pollId: string;
  totalResponses: number;
  questions: Array<{
    questionId: string;
    title: string;
    type: PollQuestionType;
    options: Array<{
      optionId: string;
      label: string;
      count: number;
    }>;
    textAnswers: string[];
  }>;
}

export interface PollStats {
  totalViews: number;
  uniqueViewers: number;
}

export interface PollListParams {
  status?: PollStatus;
  teamId?: string;
}
