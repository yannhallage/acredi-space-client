import { useEffect, useState } from "react";

import type {
  PollQuestionType,
  PollVisibility,
} from "../../../shared/api/polls";
import {
  createEmptyOption,
  createEmptyQuestion,
  createInitialPollForm,
  pollDetailToForm,
  type PollFormState,
  type PollQuestionDraft,
} from "../pollForm";
import type { PollDetail } from "../../../shared/api/polls";

export function usePollCreateForm(initialPoll?: PollDetail | null) {
  const [form, setForm] = useState<PollFormState>(createInitialPollForm);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialPoll) {
      return;
    }

    if (hydratedId === initialPoll.id) {
      return;
    }

    setForm(pollDetailToForm(initialPoll));
    setHydratedId(initialPoll.id);
  }, [hydratedId, initialPoll]);

  function updateField<K extends keyof PollFormState>(
    key: K,
    value: PollFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setVisibility(visibility: PollVisibility) {
    setForm((current) => ({
      ...current,
      visibility,
      teamId: visibility === "TEAM" ? current.teamId : "",
      channelId: visibility === "CHANNEL" ? current.channelId : "",
    }));
  }

  function updateQuestion(
    key: string,
    updater: (question: PollQuestionDraft) => PollQuestionDraft
  ) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.key === key ? updater(question) : question
      ),
    }));
  }

  function addQuestion() {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion()],
    }));
  }

  function removeQuestion(key: string) {
    setForm((current) => ({
      ...current,
      questions:
        current.questions.length <= 1
          ? current.questions
          : current.questions.filter((question) => question.key !== key),
    }));
  }

  function moveQuestion(key: string, direction: -1 | 1) {
    setForm((current) => {
      const index = current.questions.findIndex((q) => q.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.questions.length) {
        return current;
      }

      const next = current.questions.slice();
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...current, questions: next };
    });
  }

  function setQuestionType(key: string, type: PollQuestionType) {
    updateQuestion(key, (question) => ({
      ...question,
      type,
      options:
        type === "TEXT"
          ? []
          : question.options.length >= 2
            ? question.options
            : [createEmptyOption(), createEmptyOption()],
    }));
  }

  function addOption(questionKey: string) {
    updateQuestion(questionKey, (question) => ({
      ...question,
      options: [...question.options, createEmptyOption()],
    }));
  }

  function updateOption(
    questionKey: string,
    optionKey: string,
    label: string
  ) {
    updateQuestion(questionKey, (question) => ({
      ...question,
      options: question.options.map((option) =>
        option.key === optionKey ? { ...option, label } : option
      ),
    }));
  }

  function removeOption(questionKey: string, optionKey: string) {
    updateQuestion(questionKey, (question) => ({
      ...question,
      options:
        question.options.length <= 2
          ? question.options
          : question.options.filter((option) => option.key !== optionKey),
    }));
  }

  return {
    form,
    updateField,
    setVisibility,
    addQuestion,
    removeQuestion,
    moveQuestion,
    setQuestionType,
    addOption,
    updateOption,
    removeOption,
    updateQuestion,
  };
}
