import type {
  MyPollResponse,
  MyPollResponseDto,
  PollDetail,
  PollDetailResponse,
  PollListItem,
  PollListItemResponse,
  PollResults,
  PollResultsResponse,
  PollStats,
  PollStatsResponse,
} from "./types";

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toRequiredDate(value: string): Date {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export function normalizePollListItem(
  item: PollListItemResponse
): PollListItem {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    visibility: item.visibility,
    teamId: item.teamId ?? null,
    channelId: item.channelId ?? null,
    closesAt: toDate(item.closesAt),
    publishedAt: toDate(item.publishedAt),
    updatedAt: toRequiredDate(item.updatedAt),
  };
}

export function normalizePollListItems(
  items: PollListItemResponse[]
): PollListItem[] {
  return (items ?? []).map(normalizePollListItem);
}

export function normalizePollDetail(poll: PollDetailResponse): PollDetail {
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description ?? null,
    status: poll.status,
    visibility: poll.visibility,
    anonymousResponses: Boolean(poll.anonymousResponses),
    allowResponseModification: Boolean(poll.allowResponseModification),
    commentsEnabled: Boolean(poll.commentsEnabled),
    scheduledAt: toDate(poll.scheduledAt),
    publishedAt: toDate(poll.publishedAt),
    closesAt: toDate(poll.closesAt),
    archivedAt: toDate(poll.archivedAt),
    createdById: poll.createdById ?? null,
    createdByName: poll.createdByName ?? null,
    organizationId: poll.organizationId ?? null,
    teamId: poll.teamId ?? null,
    channelId: poll.channelId ?? null,
    questions: (poll.questions ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((question) => ({
        id: question.id,
        title: question.title,
        description: question.description ?? null,
        type: question.type,
        required: Boolean(question.required),
        sortOrder: question.sortOrder,
        options: (question.options ?? [])
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((option) => ({
            id: option.id,
            label: option.label,
            sortOrder: option.sortOrder,
          })),
      })),
    createdAt: toRequiredDate(poll.createdAt),
    updatedAt: toRequiredDate(poll.updatedAt),
  };
}

export function normalizeMyPollResponse(
  response: MyPollResponseDto
): MyPollResponse {
  return {
    responseId: response.responseId,
    submittedAt: toRequiredDate(response.submittedAt),
    updatedAt: toRequiredDate(response.updatedAt),
    answers: (response.answers ?? []).map((answer) => ({
      questionId: answer.questionId,
      optionIds: answer.optionIds ?? [],
      textValue: answer.textValue ?? null,
    })),
  };
}

export function normalizePollResults(
  results: PollResultsResponse
): PollResults {
  return {
    pollId: results.pollId,
    totalResponses: results.totalResponses ?? 0,
    questions: (results.questions ?? []).map((question) => ({
      questionId: question.questionId,
      title: question.title,
      type: question.type,
      options: (question.options ?? []).map((option) => ({
        optionId: option.optionId,
        label: option.label,
        count: option.count ?? 0,
      })),
      textAnswers: question.textAnswers ?? [],
    })),
  };
}

export function normalizePollStats(stats: PollStatsResponse): PollStats {
  return {
    totalViews: stats.totalViews ?? 0,
    uniqueViewers: stats.uniqueViewers ?? 0,
  };
}
