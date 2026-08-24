import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";

import Toast from "../../components/app/Toast/Toast";
import {
  useArchivePoll,
  useClosePoll,
  useDeletePoll,
  useInvitePollParticipants,
  usePoll,
  usePollResults,
  usePollStats,
  usePublishPoll,
} from "../../shared/api/polls";
import { PERMISSIONS, PermissionGate, usePermissions } from "../../shared/permissions";
import { Icon } from "../../shared/ui";
import { getFriendlyErrorMessage } from "../../shared/feedback";
import {
  PollDonutKpi,
  PollParticipantsPanel,
  PollResultsBreakdown,
} from "./components";
import {
  formatClosesLabel,
  formatPollDate,
  getPollStatusLabel,
  getPollVisibilityLabel,
} from "./utils";
import "./poll-detail.css";

export function PollDetailPage() {
  const { pollId = "" } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const pollQuery = usePoll(pollId);
  const poll = pollQuery.data;
  const canLoadResults =
    Boolean(pollId) &&
    Boolean(poll) &&
    poll!.status !== "DRAFT" &&
    poll!.status !== "SCHEDULED";

  const resultsQuery = usePollResults(pollId, canLoadResults);
  const statsQuery = usePollStats(pollId, Boolean(pollId));

  const publishMutation = usePublishPoll();
  const closeMutation = useClosePoll();
  const archiveMutation = useArchivePoll();
  const deleteMutation = useDeletePoll();
  const inviteMutation = useInvitePollParticipants();

  const results = resultsQuery.data;
  const stats = statsQuery.data;

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    intent: "success" | "error" | "info";
  }>({ show: false, message: "", intent: "info" });

  const resolvedQuestionId =
    activeQuestionId ??
    results?.questions.find((q) => q.type !== "TEXT")?.questionId ??
    results?.questions[0]?.questionId ??
    null;

  const activeQuestion = useMemo(
    () =>
      results?.questions.find((q) => q.questionId === resolvedQuestionId) ??
      null,
    [resolvedQuestionId, results]
  );

  const textStream = useMemo(() => {
    if (!results) {
      return [] as string[];
    }

    return results.questions.flatMap((question) => question.textAnswers ?? []);
  }, [results]);

  function showToast(message: string, intent: "success" | "error" | "info") {
    setToast({ show: true, message, intent });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 3200);
  }

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: string
  ) {
    try {
      await action();
      showToast(successMessage, "success");
    } catch (error) {
      showToast(
        getFriendlyErrorMessage(error, "Action impossible."),
        "error"
      );
    }
  }

  if (pollQuery.isLoading) {
    return (
      <div className="poll-detail-page pd-loading">
        <ClipLoader size={28} color="var(--accent)" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-detail-page pd-loading">
        <Icon name="alert" size={16} />
        <strong>Sondage introuvable</strong>
        <button
          className="button ghost"
          type="button"
          onClick={() => navigate("/app/polls")}
        >
          Retour
        </button>
      </div>
    );
  }

  const canManage =
    hasPermission(PERMISSIONS.UPDATE_POLLS) ||
    hasPermission(PERMISSIONS.MANAGE_POLL_PARTICIPANTS);
  const canEdit = poll.status === "DRAFT" || poll.status === "SCHEDULED";
  const canPublish = canEdit;
  const canClose = poll.status === "PUBLISHED";
  const canRespond = poll.status === "PUBLISHED";
  const isBusy =
    publishMutation.isPending ||
    closeMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="poll-detail-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      <header className="pd-header">
        <div className="pd-header-main">
          <button
            className="button ghost"
            type="button"
            onClick={() => navigate("/app/polls")}
          >
            <Icon name="arrowLeft" size={14} />
            Sondages
          </button>

          <div className="pd-title-block">
            <div className="pd-badges">
              <span
                className={`pb-status-badge pb-status-${poll.status.toLowerCase()}`}
              >
                {getPollStatusLabel(poll.status)}
              </span>
              <span className="pd-meta-chip">
                <Icon name="users" size={12} />
                {getPollVisibilityLabel(poll.visibility)}
              </span>
              {formatClosesLabel(poll.closesAt) ? (
                <span className="pd-meta-chip">
                  <Icon name="clock" size={12} />
                  {formatClosesLabel(poll.closesAt)}
                </span>
              ) : null}
            </div>
            <h1>{poll.title}</h1>
            {poll.description ? <p>{poll.description}</p> : null}
            <div className="pd-subtitle">
              {poll.createdByName ? (
                <span>Par {poll.createdByName}</span>
              ) : null}
              {poll.publishedAt ? (
                <span>Publié {formatPollDate(poll.publishedAt)}</span>
              ) : (
                <span>Créé {formatPollDate(poll.createdAt)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="pd-header-actions">
          {canRespond ? (
            <PermissionGate permission={PERMISSIONS.RESPOND_POLLS}>
              <button
                className="button primary"
                type="button"
                onClick={() => navigate(`/app/polls/${poll.id}/take`)}
              >
                Passer le sondage
              </button>
            </PermissionGate>
          ) : null}

          {canEdit ? (
            <PermissionGate permission={PERMISSIONS.UPDATE_POLLS}>
              <button
                className="button"
                type="button"
                onClick={() => navigate(`/app/polls/${poll.id}/edit`)}
              >
                <Icon name="edit" size={14} />
                Modifier
              </button>
            </PermissionGate>
          ) : null}

          {canPublish ? (
            <PermissionGate permission={PERMISSIONS.UPDATE_POLLS}>
              <button
                className="button"
                type="button"
                disabled={isBusy}
                onClick={() => {
                  runAction(
                    () => publishMutation.mutateAsync(poll.id),
                    "Sondage publié."
                  ).catch(() => undefined);
                }}
              >
                Publier
              </button>
            </PermissionGate>
          ) : null}

          {canClose ? (
            <PermissionGate permission={PERMISSIONS.UPDATE_POLLS}>
              <button
                className="button"
                type="button"
                disabled={isBusy}
                onClick={() => {
                  runAction(
                    () => closeMutation.mutateAsync(poll.id),
                    "Sondage fermé."
                  ).catch(() => undefined);
                }}
              >
                Fermer
              </button>
            </PermissionGate>
          ) : null}

          <PermissionGate permission={PERMISSIONS.UPDATE_POLLS}>
            <button
              className="button ghost"
              type="button"
              disabled={isBusy}
              onClick={() => {
                runAction(
                  () => archiveMutation.mutateAsync(poll.id),
                  "Sondage archivé."
                ).catch(() => undefined);
              }}
            >
              Archiver
            </button>
          </PermissionGate>

          <PermissionGate permission={PERMISSIONS.DELETE_POLLS}>
            <button
              className="button ghost"
              type="button"
              disabled={isBusy}
              onClick={() => {
                runAction(async () => {
                  await deleteMutation.mutateAsync(poll.id);
                  navigate("/app/polls");
                }, "Sondage supprimé.").catch(() => undefined);
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </PermissionGate>
        </div>
      </header>

      <section className="pd-kpi-row">
        <article className="pd-kpi">
          <span>Réponses</span>
          <strong>{results?.totalResponses ?? 0}</strong>
        </article>
        <article className="pd-kpi">
          <span>Vues</span>
          <strong>{stats?.totalViews ?? 0}</strong>
        </article>
        <article className="pd-kpi">
          <span>Visiteurs uniques</span>
          <strong>{stats?.uniqueViewers ?? 0}</strong>
        </article>
        <article className="pd-kpi">
          <span>Questions</span>
          <strong>{poll.questions.length}</strong>
        </article>
      </section>

      <section className="pd-grid">
        <div className="pd-main-col">
          {activeQuestion && activeQuestion.type !== "TEXT" ? (
            <PollDonutKpi
              title={activeQuestion.title}
              options={activeQuestion.options}
            />
          ) : (
            <div className="pd-donut-card">
              <header className="pd-donut-header">
                <h3>Répartition des votes</h3>
              </header>
              <p className="pd-muted">
                Sélectionnez une question à choix pour afficher le donut.
              </p>
            </div>
          )}

          <PollResultsBreakdown
            results={results}
            activeQuestionId={resolvedQuestionId}
            onSelectQuestion={setActiveQuestionId}
          />

          <div className="pd-panel">
            <h3>Flux de réponses texte</h3>
            {textStream.length === 0 ? (
              <p className="pd-muted">Aucune réponse texte pour l’instant.</p>
            ) : (
              <ul className="pd-stream">
                {textStream.map((answer, index) => (
                  <li key={`text-answer-${index}`}>
                    <p>{answer}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="pd-side-col">
          <div className="pd-panel">
            <h3>Paramètres</h3>
            <ul className="pd-settings-list">
              <li>
                <span>Anonyme</span>
                <strong>{poll.anonymousResponses ? "Oui" : "Non"}</strong>
              </li>
              <li>
                <span>Modification</span>
                <strong>
                  {poll.allowResponseModification ? "Autorisée" : "Bloquée"}
                </strong>
              </li>
              <li>
                <span>Commentaires</span>
                <strong>{poll.commentsEnabled ? "Activés" : "Désactivés"}</strong>
              </li>
            </ul>
          </div>

          <PollParticipantsPanel
            canManage={canManage}
            isInviting={inviteMutation.isPending}
            responseCount={results?.totalResponses ?? 0}
            onInvite={async (userIds) => {
              await runAction(
                () =>
                  inviteMutation.mutateAsync({
                    id: poll.id,
                    request: { userIds },
                  }),
                "Participants invités."
              );
            }}
          />
        </aside>
      </section>
    </div>
  );
}
