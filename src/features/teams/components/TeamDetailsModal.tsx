import { useEffect } from "react";
import { motion } from "framer-motion";

import { Avatar, Icon } from "../../../shared/ui";
import { useTeamMembers } from "../hooks";
import {
  memberDisplayEmail,
  memberDisplayName,
  roleLabels,
} from "../teamMemberDisplay";
import type { Team } from "../types";

interface TeamDetailsModalProps {
  onClose: () => void;
  team: Team;
}

export function TeamDetailsModal({ onClose, team }: TeamDetailsModalProps) {
  const membersQuery = useTeamMembers(team.id);
  const members = membersQuery.data ?? [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-details-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={onClose}
    >
      <motion.section
        className="note-modal team-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-details-title"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="team-details-title">
            <i style={{ background: team.color }} />
            {/* <div>
              <h2 id="team-details-title">{team.name}</h2>
              {team.slug ? <small>#{team.slug}</small> : null}
            </div> */}
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        {/* <section className="team-details-summary">
          <div>
            <span>Description</span>
            <p>{team.description || "Aucune description"}</p>
          </div>
          <div>
            <span>Responsable</span>
            <p>{team.ownerName || "Non renseigne"}</p>
          </div>
          <div>
            <span>Creee le</span>
            <p>{team.createdAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </section> */}

        <section className="team-details-users">
          <div className="team-details-users-head">
            <h3>Membres</h3>
            <span>{members.length} membre(s)</span>
          </div>

          <div className="team-details-table-wrap">
            {membersQuery.isLoading ? (
              <div className="team-details-loading">
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </div>
            ) : null}

            {!membersQuery.isLoading && membersQuery.isError ? (
              <div className="team-user-empty">
                <Icon name="alert" size={18} />
                <strong>Membres indisponibles</strong>
                <span>{membersQuery.error.message}</span>
              </div>
            ) : null}

            {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length > 0 ? (
              <table className="team-details-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ajoute le</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <Avatar
                          name={memberDisplayName(member)}
                          presence={member.user?.presence}
                          size={28}
                          src={member.user?.avatarUrl}
                        />
                        <strong>{memberDisplayName(member)}</strong>
                      </td>
                      <td>{memberDisplayEmail(member)}</td>
                      <td>{roleLabels[member.roleName]}</td>
                      <td>{member.joinedAt.toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {!membersQuery.isLoading &&
            !membersQuery.isError &&
            members.length === 0 ? (
              <div className="team-user-empty">
                <Icon name="users" size={18} />
                <strong>Aucun membre</strong>
                <span>Cette equipe ne contient pas encore de membre.</span>
              </div>
            ) : null}
          </div>
        </section>

        <footer>
          <button
            className="button primary notes-submit"
            type="button"
            onClick={onClose}
          >
            Fermer
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
