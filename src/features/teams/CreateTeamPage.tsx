import { useNavigate } from "react-router-dom";

import { Icon } from "../../shared/ui";
import { CreateTeamForm } from "./components";
import { useAddTeamMember, useCreateTeam } from "./hooks";
import "./create-team-page.css";

export function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();

  const isSubmitting =
    createTeamMutation.isPending || addMemberMutation.isPending;

  async function handleCreate(form: {
    name: string;
    description: string;
    teamColor: string;
  }) {
    try {
      await createTeamMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        teamColor: form.teamColor,
        avatarUrl: null,
      });

      navigate("/app/teams");
    } catch (error) {
      console.error("Erreur création équipe :", error);
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

      <CreateTeamForm
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/app/teams")}
        onSubmit={handleCreate}
      />
    </div>
  );
}
