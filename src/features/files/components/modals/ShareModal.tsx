import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import type { FilePermissionLevel, WorkspaceFile } from "../../../../shared/api/files";
import type { Folder } from "../../../../shared/api/folders";
import { useAuth } from "../../../../shared/context";
import { getFriendlyErrorMessage } from "../../../../shared/feedback";
import type { User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";

import { normalizeSearch, pluralizeFile } from "../../utils";

const shareLevels: Array<{
  description: string;
  label: string;
  value: FilePermissionLevel;
}> = [
  {
    description: "Lecture et telechargement",
    label: "Lecture",
    value: "READ",
  },
  {
    description: "Acces avec modification",
    label: "Ecriture",
    value: "WRITE",
  },
];

type ShareModalBaseProps = {
  error: Error | null;
  isOpen: boolean;
  isSharing: boolean;
  level: FilePermissionLevel;
  loading: boolean;
  onClose: () => void;
  onLevelChange: (level: FilePermissionLevel) => void;
  onRetry: () => Promise<User[]>;
  onSelect: (user: User) => void;
  selectedUserId: string | null;
  users: User[];
};

type FolderShareModalProps = ShareModalBaseProps & {
  variant: "folder";
  fileCount: number;
  filesLoading: boolean;
  folder: Folder | null;
};

type FileShareModalProps = ShareModalBaseProps & {
  variant: "file";
  file: WorkspaceFile | null;
};

export type ShareModalProps = FolderShareModalProps | FileShareModalProps;

export function ShareModal(props: ShareModalProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const {
    error,
    isOpen,
    isSharing,
    level,
    loading,
    onClose,
    onLevelChange,
    onRetry,
    onSelect,
    selectedUserId,
    users,
    variant,
  } = props;

  const isFolder = variant === "folder";
  const overlayClass = isFolder
    ? "dm-new-conversation-overlay folder-share-overlay"
    : "dm-new-conversation-overlay file-share-overlay";
  const modalClass = isFolder
    ? "dm-new-conversation-modal folder-share-modal"
    : "dm-new-conversation-modal file-share-modal";
  const titleId = isFolder ? "folder-share-title" : "file-share-title";
  const title = isFolder ? "Partager le dossier" : "Partager le fichier";
  const subtitle = isFolder
    ? props.folder
      ? props.folder.name
      : "Selectionnez un utilisateur"
    : props.file
      ? props.file.name
      : "Selectionnez un utilisateur";
  const userButtonClass = isFolder
    ? "dm-new-conversation-user folder-share-user"
    : "dm-new-conversation-user file-share-user";
  const loadingKeys = isFolder
    ? ["folder-share-loading-1", "folder-share-loading-2"]
    : ["file-share-loading-1", "file-share-loading-2"];
  const selectDisabled = isFolder
    ? isSharing || props.filesLoading
    : isSharing;

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status]
            .filter(Boolean)
            .join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [currentUser?.id, query, users]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSharing) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSharing, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={overlayClass}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isSharing) onClose();
          }}
        >
          <motion.section
            className={modalClass}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id={titleId}>{title}</h2>
                <small>{subtitle}</small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isSharing}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="dm-new-conversation-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur..."
                disabled={isSharing}
              />
            </label>

            <div className="folder-share-access" aria-label="Niveau d'acces">
              {shareLevels.map((option) => (
                <button
                  key={option.value}
                  className={level === option.value ? "active" : ""}
                  type="button"
                  onClick={() => onLevelChange(option.value)}
                  disabled={isSharing}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? loadingKeys.map((item) => (
                    <div
                      className="dm-new-conversation-user team-picker-row-skeleton"
                      key={item}
                    >
                      <span className="skeleton-dot" />
                      <span className="skeleton-avatar" />
                      <span>
                        <span className="skeleton-line" />
                        <span className="skeleton-line skeleton-short" />
                      </span>
                      <span className="skeleton-pill" />
                    </div>
                  ))
                : error ? (
                    <div className="dm-new-conversation-empty">
                      <Icon name="alert" size={18} />
                      <strong>Chargement impossible</strong>
                      <span>
                        {getFriendlyErrorMessage(
                          error,
                          "Nous n’avons pas pu charger les utilisateurs.",
                        )}
                      </span>
                      <button
                        className="button ghost mini"
                        type="button"
                        onClick={() => {
                          onRetry().catch(() => undefined);
                        }}
                        disabled={isSharing}
                      >
                        Reessayer
                      </button>
                    </div>
                  )
                : visibleUsers.map((person) => {
                    const isSelected = selectedUserId === person.id;

                    return (
                      <button
                        key={person.id}
                        className={userButtonClass}
                        type="button"
                        disabled={selectDisabled}
                        onClick={() => onSelect(person)}
                      >
                        {isSelected ? (
                          <ClipLoader size={14} color="currentColor" />
                        ) : (
                          <Icon name="send" size={16} />
                        )}
                        <Avatar
                          name={person.name}
                          presence={person.presence}
                          size={34}
                        />
                        <span>
                          <strong>{person.name}</strong>
                          <small>
                            {person.role} - {person.team}
                          </small>
                        </span>
                        <em
                          className={`dm-new-conversation-status presence-${person.presence}`}
                        >
                          {person.status}
                        </em>
                      </button>
                    );
                  })}

              {!loading && !error && visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouve</strong>
                  <span>Essayez un autre nom, email ou role.</span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              {isFolder ? (
                <>
                  <span>
                    <Icon name="folder" size={14} />
                    Dossier partage
                  </span>
                  <small>
                    {props.filesLoading
                      ? "Chargement des fichiers"
                      : pluralizeFile(props.fileCount)}
                  </small>
                </>
              ) : (
                <>
                  <span>
                    <Icon name="file" size={14} />
                    Fichier partage
                  </span>
                  <small>{visibleUsers.length} utilisateur(s)</small>
                </>
              )}
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
