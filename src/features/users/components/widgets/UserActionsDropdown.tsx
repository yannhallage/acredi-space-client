import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "../../../../shared/api/users";
import type { User } from "../../../../shared/types";
import { getFriendlyErrorMessage } from "../../../../shared/feedback";
import { Icon } from "../../../../shared/ui";

export function UserActionsDropdown({
  isOpen,
  onOpenChange,
  user,
  onChanged,
  onEdit,
  onDelete,
  onToast,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onChanged: () => Promise<unknown>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToast: (toast: {
    intent: "success" | "info" | "warning" | "error";
    message: string;
  }) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const isActive = user.enabled !== false;
  const isPending =
    activateMutation.isPending || deactivateMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  async function handleToggleStatus(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (isPending) return;

    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(user.id);
        onToast({
          intent: "success",
          message: "Utilisateur désactivé avec succès",
        });
      } else {
        await activateMutation.mutateAsync(user.id);
        onToast({
          intent: "success",
          message: "Utilisateur activé avec succès",
        });
      }

      onOpenChange(false);
      await onChanged();
    } catch (error) {
      onToast({
        intent: "error",
        message: getFriendlyErrorMessage(
          error,
          "Impossible de modifier le statut de l'utilisateur",
        ),
      });
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="users-actions-dropdown"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="icon-button users-more"
        type="button"
        aria-label={`Options ${user.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!isOpen);
        }}
      >
        <Icon name="moreH" size={19} />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="users-actions-menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="users-actions-item"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                onOpenChange(false);
                onEdit(user);
              }}
            >
              Modifier les informations
            </button>

            <button
              type="button"
              className={
                isActive
                  ? "users-actions-item danger"
                  : "users-actions-item success"
              }
              role="menuitem"
              disabled={isPending}
              onClick={handleToggleStatus}
            >
              {isPending
                ? "Traitement..."
                : isActive
                  ? "Désactiver utilisateur"
                  : "Activer utilisateur"}
            </button>

            <button
              type="button"
              className="users-actions-item danger"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                onOpenChange(false);
                onDelete(user);
              }}
            >
              Supprimer utilisateur
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
