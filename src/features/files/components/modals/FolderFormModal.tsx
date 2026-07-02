import type { FormEvent } from "react";

import type { Folder } from "../../../../shared/api/folders";
import { Icon } from "../../../../shared/ui";

export function FolderFormModal({
  currentFolder,
  errorMessage,
  folderName,
  isOpen,
  isSaving,
  onChangeName,
  onClose,
  onSubmit,
  savingLabel,
  submitLabel,
  title,
}: {
  currentFolder: Folder | null;
  errorMessage: string | null;
  folderName: string;
  isOpen: boolean;
  isSaving: boolean;
  onChangeName: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  savingLabel: string;
  submitLabel: string;
  title: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="files-folder-overlay"
      role="presentation"
      onClick={onClose}
    >
      <form
        className="files-folder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-create-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <header>
          <div>
            <h2 id="folder-create-title">{title}</h2>
            <p>Dans {currentFolder?.name ?? "Acredi Space"}</p>
          </div>
          <button
            className="files-folder-close"
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            disabled={isSaving}
          >
            <Icon name="x" size={15} />
          </button>
        </header>

        <label className="files-folder-field" htmlFor="folder-name">
          <span>Nom du dossier</span>
          <input
            id="folder-name"
            autoFocus
            value={folderName}
            onChange={(event) => onChangeName(event.target.value)}
            placeholder="Ex: Contrats"
            disabled={isSaving}
          />
        </label>

        {errorMessage ? (
          <p className="files-folder-error">{errorMessage}</p>
        ) : null}

        <footer>
          <button
            className="files-modal-secondary"
            type="button"
            onClick={onClose}
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            className="files-modal-primary"
            type="submit"
            disabled={!folderName.trim() || isSaving}
          >
            {isSaving ? savingLabel : submitLabel}
          </button>
        </footer>
      </form>
    </div>
  );
}
