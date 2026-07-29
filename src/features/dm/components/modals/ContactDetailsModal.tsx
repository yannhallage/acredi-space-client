import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Presence, User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";

import {
  formatSubtitle,
  getPresenceLabel,
} from "../utils/dmMessageFormat";

function resolveRoleLabel(user: User) {
  if (user.adminRole) {
    return formatSubtitle(user.adminRole);
  }

  if (user.role) {
    return formatSubtitle(user.role);
  }

  return "Collaborateur";
}

interface ContactDetailsModalProps {
  open: boolean;
  contact: User | null;
  fallbackName: string;
  fallbackPresence: Presence;
  fallbackAvatarUrl?: string | null;
  fallbackRole?: string;
  onClose: () => void;
}

export function ContactDetailsModal({
  open,
  contact,
  fallbackName,
  fallbackPresence,
  fallbackAvatarUrl,
  fallbackRole = "Collaborateur",
  onClose,
}: ContactDetailsModalProps) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!open) {
      setShowSkeleton(true);
      return undefined;
    }

    setShowSkeleton(true);
    const timer = window.setTimeout(() => {
      setShowSkeleton(false);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [open, contact?.id]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const name = contact?.name ?? fallbackName;
  const presence = contact?.presence ?? fallbackPresence;
  const avatarUrl = contact?.avatarUrl ?? fallbackAvatarUrl;
  const roleLabel = contact
    ? resolveRoleLabel(contact)
    : formatSubtitle(fallbackRole);
  const email = contact?.email?.trim() || null;
  const team = contact?.team?.trim() || null;
  const roleIcon =
    roleLabel.toLowerCase() === "admin" || roleLabel.toLowerCase() === "owner"
      ? "shield"
      : roleLabel.toLowerCase() === "manager"
        ? "star"
        : "user";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="dm-new-conversation-overlay contact-details-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="contact-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-details-title"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="contact-details-header">
              <h2 id="contact-details-title">Infos du contact</h2>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={18} />
              </button>
            </header>

            {showSkeleton ? (
              <div className="contact-details-skeleton" aria-hidden="true">
                <div className="contact-details-hero contact-details-hero-skeleton">
                  <span className="skeleton-avatar contact-details-skeleton-avatar" />
                  <span className="skeleton-line contact-details-skeleton-name" />
                  <div className="contact-details-skeleton-chips">
                    <span className="skeleton-pill" />
                    <span className="skeleton-pill" />
                  </div>
                </div>
                <div className="contact-details-skeleton-meta">
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-short" />
                </div>
                <div className="contact-details-skeleton-bio">
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-short" />
                </div>
              </div>
            ) : (
              <motion.div
                className="contact-details-body"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="contact-details-hero">
                  <div className="contact-details-avatar-wrap">
                    <Avatar
                      name={name}
                      presence={presence}
                      size={96}
                      src={avatarUrl}
                    />
                  </div>

                  <h3>{name}</h3>

                  <div className="contact-details-chips">
                    <span className="contact-details-chip role">
                      <Icon name={roleIcon} size={13} />
                      {roleLabel}
                    </span>
                    {/* <span
                      className={`contact-details-chip presence presence-${presence}`}
                    >
                      <span className={`dm-dot dm-dot-${presence}`} />
                      {getPresenceLabel(presence)}
                    </span> */}
                  </div>
                </div>

                {(email || team) && (
                  <section className="contact-details-meta" aria-label="Informations">
                    {email ? (
                      <div className="contact-details-meta-row">
                        <span className="contact-details-meta-icon">
                          <Icon name="mail" size={15} />
                        </span>
                        <div className="contact-details-meta-text">
                          <small>Email</small>
                          <strong>{email}</strong>
                        </div>
                      </div>
                    ) : null}

                    {team ? (
                      <div className="contact-details-meta-row">
                        <span className="contact-details-meta-icon">
                          <Icon name="users" size={15} />
                        </span>
                        <div className="contact-details-meta-text">
                          <small>Equipe</small>
                          <strong>{team}</strong>
                        </div>
                      </div>
                    ) : null}
                  </section>
                )}

                <section className="contact-details-section">
                  <div className="contact-details-section-head">
                    <Icon name="notes" size={14} />
                    <h4>Bio</h4>
                  </div>
                  <p className="contact-details-bio-placeholder">
                    Aucune bio pour le moment.
                  </p>
                </section>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
