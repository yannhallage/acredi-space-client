import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  feedback,
  resolveActionFeedback,
  type Feedback,
} from "../../shared/feedback";
import { FeedbackBanner, Icon } from "../../shared/ui";
import { CreateTeamForm } from "./components";
import { useAddTeamMember, useCreateTeam } from "./hooks";
import "./create-team-page.css";

export function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const [formFeedback, setFormFeedback] = useState<Feedback | null>(null);

  const isSubmitting =
    createTeamMutation.isPending || addMemberMutation.isPending;

  async function handleCreate(form: {
    name: string;
    description: string;
    teamColor: string;
  }) {
    setFormFeedback(null);

    try {
      await createTeamMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        teamColor: form.teamColor,
        avatarUrl: null,
      });

      navigate("/app/teams");
    } catch (error) {
      setFormFeedback(
        resolveActionFeedback(
          error,
          feedback(
            "error",
            "Création impossible",
            "Nous n’avons pas pu créer cette équipe. Réessayez dans un moment.",
          ),
        ),
      );
    }
  }

  return (
    <div className="create-team-page">
      <section className="create-team-header">
        <button
          className="button ghost"
          type="button"
          onClick={() => navigate("/app/teams")}
        >
          <Icon name="arrowLeft" size={14} />
          Retour
        </button>

        <div>
          <span>Teams</span>
          <h1>Créer une équipe</h1>
          <p>
            Configure une équipe, choisis sa couleur et ajoute les membres qui
            doivent y accéder.
          </p>
        </div>
      </section>

      {formFeedback ? <FeedbackBanner feedback={formFeedback} /> : null}

      <CreateTeamForm
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/app/teams")}
        onSubmit={handleCreate}
      />
    </div>
  );
}
