import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";

import {
  useCreatePoll,
  usePoll,
  usePublishPoll,
  useUpdatePoll,
} from "../../shared/api/polls";
import { useTeams } from "../teams/hooks";
import { Icon } from "../../shared/ui";
import Toast from "../../components/app/Toast/Toast";
import { PollQuestionBuilder } from "./components/widgets/PollQuestionBuilder";
import { usePollCreateForm } from "./hooks/usePollCreateForm";
import { formToCreateRequest, validatePollForm } from "./pollForm";
import "./poll-create.css";

export function PollCreatePage() {
  const navigate = useNavigate();
  const { pollId } = useParams<{ pollId?: string }>();
  const isEdit = Boolean(pollId);

  const pollQuery = usePoll(pollId);
  const teamsQuery = useTeams({ enabled: true });
  const createPollMutation = useCreatePoll();
  const updatePollMutation = useUpdatePoll();
  const publishPollMutation = usePublishPoll();

  const formApi = usePollCreateForm(isEdit ? pollQuery.data : null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    intent: "success" | "error" | "info";
  }>({ show: false, message: "", intent: "info" });
  const [isPublishing, setIsPublishing] = useState(false);

  const isSubmitting =
    createPollMutation.isPending ||
    updatePollMutation.isPending ||
    publishPollMutation.isPending;

  function showToast(message: string, intent: "success" | "error" | "info") {
    setToast({ show: true, message, intent });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 3200);
  }

  async function savePoll(publishAfterSave: boolean) {
    const validationError = validatePollForm(formApi.form);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const payload = formToCreateRequest(formApi.form);

    try {
      setIsPublishing(publishAfterSave);
      let savedId = pollId;

      if (isEdit && pollId) {
        await updatePollMutation.mutateAsync({ id: pollId, request: payload });
      } else {
        const created = await createPollMutation.mutateAsync(payload);
        savedId = created.id;
      }

      if (publishAfterSave && savedId) {
        await publishPollMutation.mutateAsync(savedId);
      }

      showToast(
        publishAfterSave ? "Sondage publié." : "Sondage enregistré.",
        "success"
      );
      navigate(`/app/polls/${savedId}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Impossible d'enregistrer.",
        "error"
      );
    } finally {
      setIsPublishing(false);
    }
  }

  if (isEdit && pollQuery.isLoading) {
    return (
      <div className="poll-create-page pc-loading">
        <ClipLoader size={28} color="var(--accent)" />
      </div>
    );
  }

  if (isEdit && pollQuery.isError) {
    return (
      <div className="poll-create-page">
        <div className="pc-error">
          <Icon name="alert" size={16} />
          <strong>Impossible de charger le sondage</strong>
          <button
            className="button ghost"
            type="button"
            onClick={() => navigate("/app/polls")}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-create-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      <section className="pc-header">
        <button
          className="button ghost"
          type="button"
          onClick={() => navigate(pollId ? `/app/polls/${pollId}` : "/app/polls")}
        >
          <Icon name="arrowLeft" size={14} />
          Retour
        </button>

        <div>
          <span>Sondages</span>
          <h1>{isEdit ? "Modifier le sondage" : "Créer un sondage"}</h1>
          <p>
            Structurez vos questions, définissez l’audience et publiez quand
            vous êtes prêt.
          </p>
        </div>
      </section>

      <form
        className="pc-form"
        onSubmit={(event) => {
          event.preventDefault();
          savePoll(false).catch(() => undefined);
        }}
      >
        <section className="pc-section">
          <header>
            <h2>Identité</h2>
            <p>Titre et contexte visibles par les participants.</p>
          </header>

          <label className="pc-field">
            <span>Titre</span>
            <input
              value={formApi.form.title}
              onChange={(event) =>
                formApi.updateField("title", event.target.value)
              }
              placeholder="Ex. Feedback expérience produit"
              maxLength={180}
              required
            />
          </label>

          <label className="pc-field">
            <span>Description</span>
            <textarea
              rows={3}
              value={formApi.form.description}
              onChange={(event) =>
                formApi.updateField("description", event.target.value)
              }
              placeholder="Expliquez brièvement l’objectif du sondage"
            />
          </label>
        </section>

        <section className="pc-section">
          <header>
            <h2>Audience</h2>
            <p>Qui peut voir et répondre à ce sondage.</p>
          </header>

          <div className="pc-visibility-grid">
            {(
              [
                ["ORGANIZATION", "Organisation"],
                ["TEAM", "Équipe"],
                ["CHANNEL", "Salon"],
                ["PRIVATE", "Privé"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  formApi.form.visibility === value
                    ? "pc-visibility-card pc-visibility-card-active"
                    : "pc-visibility-card"
                }
                onClick={() => formApi.setVisibility(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {formApi.form.visibility === "TEAM" ? (
            <label className="pc-field">
              <span>Équipe</span>
              <select
                value={formApi.form.teamId}
                onChange={(event) =>
                  formApi.updateField("teamId", event.target.value)
                }
              >
                <option value="">Sélectionner une équipe</option>
                {(teamsQuery.data ?? []).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {formApi.form.visibility === "CHANNEL" ? (
            <label className="pc-field">
              <span>Identifiant du salon</span>
              <input
                value={formApi.form.channelId}
                onChange={(event) =>
                  formApi.updateField("channelId", event.target.value)
                }
                placeholder="UUID du canal"
              />
            </label>
          ) : null}
        </section>

        <section className="pc-section">
          <header>
            <h2>Règles</h2>
            <p>Contrôlez l’anonymat, les modifications et la clôture.</p>
          </header>

          <div className="pc-toggles">
            <label className="pc-toggle">
              <input
                type="checkbox"
                checked={formApi.form.anonymousResponses}
                onChange={(event) =>
                  formApi.updateField(
                    "anonymousResponses",
                    event.target.checked
                  )
                }
              />
              <span>Réponses anonymes</span>
            </label>
            <label className="pc-toggle">
              <input
                type="checkbox"
                checked={formApi.form.allowResponseModification}
                onChange={(event) =>
                  formApi.updateField(
                    "allowResponseModification",
                    event.target.checked
                  )
                }
              />
              <span>Autoriser la modification des réponses</span>
            </label>
            <label className="pc-toggle">
              <input
                type="checkbox"
                checked={formApi.form.commentsEnabled}
                onChange={(event) =>
                  formApi.updateField("commentsEnabled", event.target.checked)
                }
              />
              <span>Activer les commentaires</span>
            </label>
          </div>

          <label className="pc-field">
            <span>Date de clôture</span>
            <input
              type="datetime-local"
              value={formApi.form.closesAt}
              onChange={(event) =>
                formApi.updateField("closesAt", event.target.value)
              }
            />
          </label>
        </section>

        <section className="pc-section">
          <header className="pc-section-header-row">
            <div>
              <h2>Questions</h2>
              <p>Ajoutez au moins une question avec des options claires.</p>
            </div>
            <button
              type="button"
              className="button ghost"
              onClick={formApi.addQuestion}
            >
              <Icon name="plus" size={14} />
              Ajouter une question
            </button>
          </header>

          <div className="pc-questions">
            {formApi.form.questions.map((question, index) => (
              <PollQuestionBuilder
                key={question.key}
                question={question}
                index={index}
                canRemove={formApi.form.questions.length > 1}
                onChangeTitle={(value) =>
                  formApi.updateQuestion(question.key, (current) => ({
                    ...current,
                    title: value,
                  }))
                }
                onChangeDescription={(value) =>
                  formApi.updateQuestion(question.key, (current) => ({
                    ...current,
                    description: value,
                  }))
                }
                onChangeType={(type) =>
                  formApi.setQuestionType(question.key, type)
                }
                onToggleRequired={() =>
                  formApi.updateQuestion(question.key, (current) => ({
                    ...current,
                    required: !current.required,
                  }))
                }
                onAddOption={() => formApi.addOption(question.key)}
                onUpdateOption={(optionKey, label) =>
                  formApi.updateOption(question.key, optionKey, label)
                }
                onRemoveOption={(optionKey) =>
                  formApi.removeOption(question.key, optionKey)
                }
                onMoveUp={() => formApi.moveQuestion(question.key, -1)}
                onMoveDown={() => formApi.moveQuestion(question.key, 1)}
                onRemove={() => formApi.removeQuestion(question.key)}
              />
            ))}
          </div>
        </section>

        <footer className="pc-footer">
          <button
            className="button ghost"
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              navigate(pollId ? `/app/polls/${pollId}` : "/app/polls")
            }
          >
            Annuler
          </button>
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting && !isPublishing ? (
              <ClipLoader size={14} color="#fff" />
            ) : (
              "Enregistrer"
            )}
          </button>
          <button
            className="button primary"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              savePoll(true).catch(() => undefined);
            }}
          >
            {isSubmitting && isPublishing ? (
              <ClipLoader size={14} color="#fff" />
            ) : (
              "Enregistrer et publier"
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
