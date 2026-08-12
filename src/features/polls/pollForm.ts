import type {
  CreatePollRequest,
  PollDetail,
  PollQuestionType,
  PollVisibility,
} from "../../shared/api/polls";

export type PollOptionDraft = {
  key: string;
  label: string;
};

export type PollQuestionDraft = {
  key: string;
  title: string;
  description: string;
  type: PollQuestionType;
  required: boolean;
  options: PollOptionDraft[];
};

export type PollFormState = {
  title: string;
  description: string;
  visibility: PollVisibility;
  teamId: string;
  channelId: string;
  anonymousResponses: boolean;
  allowResponseModification: boolean;
  commentsEnabled: boolean;
  closesAt: string;
  questions: PollQuestionDraft[];
};

function createKey(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyOption(): PollOptionDraft {
  return { key: createKey("opt"), label: "" };
}

export function createEmptyQuestion(
  type: PollQuestionType = "SINGLE_CHOICE"
): PollQuestionDraft {
  return {
    key: createKey("q"),
    title: "",
    description: "",
    type,
    required: true,
    options:
      type === "TEXT"
        ? []
        : [createEmptyOption(), createEmptyOption()],
  };
}

export function createInitialPollForm(): PollFormState {
  return {
    title: "",
    description: "",
    visibility: "ORGANIZATION",
    teamId: "",
    channelId: "",
    anonymousResponses: false,
    allowResponseModification: true,
    commentsEnabled: true,
    closesAt: "",
    questions: [createEmptyQuestion()],
  };
}

export function pollDetailToForm(poll: PollDetail): PollFormState {
  return {
    title: poll.title,
    description: poll.description ?? "",
    visibility: poll.visibility,
    teamId: poll.teamId ?? "",
    channelId: poll.channelId ?? "",
    anonymousResponses: poll.anonymousResponses,
    allowResponseModification: poll.allowResponseModification,
    commentsEnabled: poll.commentsEnabled,
    closesAt: poll.closesAt
      ? new Date(poll.closesAt.getTime() - poll.closesAt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "",
    questions: poll.questions.map((question) => ({
      key: question.id,
      title: question.title,
      description: question.description ?? "",
      type: question.type,
      required: question.required,
      options:
        question.type === "TEXT"
          ? []
          : question.options.map((option) => ({
              key: option.id,
              label: option.label,
            })),
    })),
  };
}

export function validatePollForm(form: PollFormState): string | null {
  if (!form.title.trim()) {
    return "Le titre est obligatoire.";
  }

  if (form.visibility === "TEAM" && !form.teamId) {
    return "Sélectionnez une équipe.";
  }

  if (form.visibility === "CHANNEL" && !form.channelId) {
    return "Indiquez l'identifiant du salon.";
  }

  if (form.questions.length === 0) {
    return "Ajoutez au moins une question.";
  }

  for (const [index, question] of form.questions.entries()) {
    if (!question.title.trim()) {
      return `La question ${index + 1} doit avoir un titre.`;
    }

    if (question.type !== "TEXT") {
      const filledOptions = question.options.filter((option) =>
        option.label.trim()
      );
      if (filledOptions.length < 2) {
        return `La question ${index + 1} doit avoir au moins 2 options.`;
      }
    }
  }

  return null;
}

export function formToCreateRequest(form: PollFormState): CreatePollRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    visibility: form.visibility,
    teamId: form.visibility === "TEAM" ? form.teamId || null : null,
    channelId: form.visibility === "CHANNEL" ? form.channelId || null : null,
    anonymousResponses: form.anonymousResponses,
    allowResponseModification: form.allowResponseModification,
    commentsEnabled: form.commentsEnabled,
    closesAt: form.closesAt
      ? `${form.closesAt.length === 16 ? `${form.closesAt}:00` : form.closesAt}`
      : null,

    questions: form.questions.map((question, questionIndex) => ({
      title: question.title.trim(),
      description: question.description.trim() || null,
      type: question.type,
      required: question.required,
      sortOrder: questionIndex,
      options:
        question.type === "TEXT"
          ? undefined
          : question.options
              .filter((option) => option.label.trim())
              .map((option, optionIndex) => ({
                label: option.label.trim(),
                sortOrder: optionIndex,
              })),
    })),
  };
}
