import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import Toast from "../../components/app/Toast/Toast";
import {
  useMyPollResponse,
  usePoll,
  usePollResults,
  useSubmitPollResponse,
  useUpdatePollResponse,
  type SubmitPollResponseRequest,
} from "../../shared/api/polls";
import { Icon } from "../../shared/ui";
import { getFriendlyErrorMessage } from "../../shared/feedback";
import { PollDonutKpi } from "./components";
import { PollTakeQuestion } from "./components/widgets/PollTakeQuestion";
import "./poll-take.css";

type AnswerDraft = {
  optionIds: string[];
  textValue: string;
};

export function PollTakePage() {
  const { pollId = "" } = useParams<{ pollId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    intent: "success" | "error" | "info";
  }>({ show: false, message: "", intent: "info" });

  const pollQuery = usePoll(pollId);
  const myResponseQuery = useMyPollResponse(pollId, Boolean(pollId));
  const resultsQuery = usePollResults(pollId, submitted);
  const submitMutation = useSubmitPollResponse();
  const updateMutation = useUpdatePollResponse();

  const poll = pollQuery.data;
  const questions = useMemo(
    () =>
      (poll?.questions ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [poll]
  );

  useEffect(() => {
    if (!myResponseQuery.data) {
      return;
    }

    const next: Record<string, AnswerDraft> = {};
    for (const answer of myResponseQuery.data.answers) {
      next[answer.questionId] = {
        optionIds: answer.optionIds ?? [],
        textValue: answer.textValue ?? "",
      };
    }
    setAnswers(next);
  }, [myResponseQuery.data]);

  const currentQuestion = questions[step];
  const progress =
    questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;
  const hasExistingResponse = Boolean(myResponseQuery.data);
  const canModify =
    !hasExistingResponse || Boolean(poll?.allowResponseModification);

  function showToast(message: string, intent: "success" | "error" | "info") {
    setToast({ show: true, message, intent });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 3200);
  }

  function getAnswer(questionId: string): AnswerDraft {
    return answers[questionId] ?? { optionIds: [], textValue: "" };
  }

  function validateCurrent(): string | null {
    if (!currentQuestion) {
      return "Question introuvable.";
    }

    const answer = getAnswer(currentQuestion.id);

    if (!currentQuestion.required) {
      return null;
    }

    if (currentQuestion.type === "TEXT") {
      return answer.textValue.trim()
        ? null
        : "Une réponse texte est requise.";
    }

    if (currentQuestion.type === "SINGLE_CHOICE") {
      return answer.optionIds.length === 1
        ? null
        : "Sélectionnez une option.";
    }

    return answer.optionIds.length >= 1
      ? null
      : "Sélectionnez au moins une option.";
  }

  async function submitAll() {
    if (!poll) {
      return;
    }

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const answer = getAnswer(question.id);

      if (question.required) {
        if (question.type === "TEXT" && !answer.textValue.trim()) {
          setStep(index);
          showToast(`Répondez à la question ${index + 1}.`, "error");
          return;
        }

        if (
          question.type === "SINGLE_CHOICE" &&
          answer.optionIds.length !== 1
        ) {
          setStep(index);
          showToast(`Sélectionnez une option (question ${index + 1}).`, "error");
          return;
        }

        if (
          question.type === "MULTIPLE_CHOICE" &&
          answer.optionIds.length < 1
        ) {
          setStep(index);
          showToast(
            `Sélectionnez au moins une option (question ${index + 1}).`,
            "error"
          );
          return;
        }
      }
    }

    if (!canModify) {
      showToast("La modification des réponses est désactivée.", "error");
      return;
    }

    const payload: SubmitPollResponseRequest = {
      answers: questions.map((question) => {
        const answer = getAnswer(question.id);
        return {
          questionId: question.id,
          optionIds:
            question.type === "TEXT" ? undefined : answer.optionIds,
          textValue:
            question.type === "TEXT" ? answer.textValue.trim() || null : null,
        };
      }),
    };

    try {
      if (hasExistingResponse) {
        await updateMutation.mutateAsync({ id: poll.id, request: payload });
      } else {
        await submitMutation.mutateAsync({ id: poll.id, request: payload });
      }

      setSubmitted(true);
      showToast("Réponse enregistrée.", "success");
    } catch (error) {
      showToast(
        getFriendlyErrorMessage(error, "Envoi impossible."),
        "error"
      );
    }
  }

  if (pollQuery.isLoading) {
    return (
      <div className="poll-take-page pt-loading">
        <ClipLoader size={28} color="#ffffff" />
      </div>
    );
  }

  if (!poll || poll.status !== "PUBLISHED") {
    return (
      <div className="poll-take-page pt-loading">
        <strong>Ce sondage n’est pas ouvert aux réponses.</strong>
        <button
          className="button ghost"
          type="button"
          onClick={() => navigate(pollId ? `/app/polls/${pollId}` : "/app/polls")}
        >
          Retour
        </button>
      </div>
    );
  }

  if (submitted) {
    const firstChoice = (resultsQuery.data?.questions ?? []).find(
      (question) => question.type !== "TEXT"
    );

    return (
      <div className="poll-take-page">
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}

        <div className="pt-shell pt-done">
          <button
            className="pt-back"
            type="button"
            onClick={() => navigate(`/app/polls/${poll.id}`)}
          >
            <Icon name="arrowLeft" size={14} />
            Voir le détail
          </button>

          <div className="pt-done-panel">
            <span className="pt-kicker">Merci</span>
            <h1>Votre réponse est enregistrée</h1>
            <p>
              {resultsQuery.data
                ? `${resultsQuery.data.totalResponses} réponse(s) au total.`
                : "Les résultats se mettent à jour progressivement."}
            </p>

            {firstChoice ? (
              <PollDonutKpi
                title={firstChoice.title}
                options={firstChoice.options}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting = submitMutation.isPending || updateMutation.isPending;

  return (
    <div className="poll-take-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      <div className="pt-shell">
        <header className="pt-top">
          <button
            className="pt-back"
            type="button"
            onClick={() => navigate(`/app/polls/${poll.id}`)}
          >
            <Icon name="arrowLeft" size={14} />
            Quitter
          </button>
          <div>
            <span className="pt-kicker">{poll.title}</span>
            <strong>
              Question {step + 1} / {questions.length}
            </strong>
          </div>
        </header>

        <div className="pt-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        <AnimatePresence mode="wait">
          {currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="pt-stage"
            >
              <PollTakeQuestion
                question={currentQuestion}
                answer={getAnswer(currentQuestion.id)}
                onChange={(next) =>
                  setAnswers((current) => ({
                    ...current,
                    [currentQuestion.id]: next,
                  }))
                }
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <footer className="pt-nav">
          <button
            type="button"
            className="pt-nav-btn"
            disabled={step === 0 || isSubmitting}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            <Icon name="arrowLeft" size={16} />
          </button>

          {step < questions.length - 1 ? (
            <button
              type="button"
              className="pt-nav-btn pt-nav-btn-primary"
              disabled={isSubmitting}
              onClick={() => {
                const error = validateCurrent();
                if (error) {
                  showToast(error, "error");
                  return;
                }
                setStep((current) =>
                  Math.min(questions.length - 1, current + 1)
                );
              }}
            >
              <Icon name="arrowRight" size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="pt-submit"
              disabled={isSubmitting || !canModify}
              onClick={() => {
                submitAll().catch(() => undefined);
              }}
            >
              {isSubmitting ? (
                <ClipLoader size={16} color="#1f6f5b" />
              ) : hasExistingResponse ? (
                "Mettre à jour"
              ) : (
                "Envoyer"
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
