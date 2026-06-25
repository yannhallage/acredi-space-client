import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import type { User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";
import { roleIcon, roleLabel } from "../../utils";
import { NotUsers } from "../NotUsers";
import { UsersPageSkeleton } from "../skeletons/UsersPageSkeleton";
import { UserActionsDropdown } from "./UserActionsDropdown";

export function UsersTable({
  loading,
  visibleUsers,
  hasFilters,
  canViewUsers,
  errorMessage,
  openActionsUserId,
  onOpenActionsChange,
  onRefetch,
  onEdit,
  onDelete,
  onToast,
}: {
  loading: boolean;
  visibleUsers: User[];
  hasFilters: boolean;
  canViewUsers: boolean;
  errorMessage?: string;
  openActionsUserId: string | null;
  onOpenActionsChange: (userId: string | null) => void;
  onRefetch: () => Promise<unknown>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToast: (toast: {
    intent: "success" | "info" | "warning" | "error";
    message: string;
  }) => void;
}) {
  const navigate = useNavigate();

  return (
    <section
      className={
        !loading && visibleUsers.length === 0
          ? "users-list users-list-empty"
          : "users-list"
      }
      aria-label="Users list"
    >
      {loading ? (
        <UsersPageSkeleton />
      ) : (
        visibleUsers.map((user) => (
          <motion.article
            className="users-row"
            key={user.id}
            role="button"
            tabIndex={0}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() =>
              navigate(`/app/users/${user.id}`, { state: { user } })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/app/users/${user.id}`, { state: { user } });
              }
            }}
          >
            <Avatar
              name={user.name}
              size={42}
              presence={user.presence}
              src={user.avatarUrl}
            />

            <div className="users-person">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

            <span className="users-status">
              {user.enabled === false ? "Désactivé" : "Activé"}
              {user.invitationStatus ? ` • ${user.invitationStatus}` : ""}
            </span>

            <button
              className="users-role"
              type="button"
              onClick={(event) => event.stopPropagation()}
            >
              <Icon name={roleIcon(user)} size={15} />
              {roleLabel(user)}
            </button>

            <UserActionsDropdown
              isOpen={openActionsUserId === user.id}
              onOpenChange={(open) =>
                onOpenActionsChange(open ? user.id : null)
              }
              user={user}
              onChanged={onRefetch}
              onEdit={onEdit}
              onDelete={onDelete}
              onToast={onToast}
            />
          </motion.article>
        ))
      )}

      {!loading && visibleUsers.length === 0 ? (
        <NotUsers
          hasFilters={hasFilters}
          message={
            canViewUsers
              ? errorMessage
              : "Vous n'avez pas les droits necessaires pour afficher les utilisateurs."
          }
        />
      ) : null}
    </section>
  );
}
