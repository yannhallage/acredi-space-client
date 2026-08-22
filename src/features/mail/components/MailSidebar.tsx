import { MAIL_FOLDERS, MAIL_LABELS } from "../mockData";
import type { MailFolderId } from "../types";
import { IconPencil, NavIcon } from "./MailIcons";

interface MailSidebarProps {
  activeFolder: MailFolderId;
  onFolderChange: (folder: MailFolderId) => void;
  onCompose: () => void;
}

export function MailSidebar({
  activeFolder,
  onFolderChange,
  onCompose,
}: MailSidebarProps) {
  return (
    <aside className="mail-sidebar" aria-label="Mail folders">
      <button type="button" className="mail-compose" onClick={onCompose}>
        <IconPencil />
        <span>Compose</span>
      </button>

      <nav className="mail-nav">
        {MAIL_FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            className={`mail-nav__item${activeFolder === folder.id ? " is-active" : ""}`}
            onClick={() => onFolderChange(folder.id)}
          >
            <NavIcon name={folder.icon} />
            <span>{folder.label}</span>
            {folder.count != null ? (
              <span className="mail-nav__count">{folder.count}</span>
            ) : (
              <span />
            )}
          </button>
        ))}
      </nav>

      <div className="mail-labels">
        <div className="mail-labels__head">
          <span>Labels</span>
          <button type="button" className="mail-labels__add" aria-label="Create new label">
            +
          </button>
        </div>
        {MAIL_LABELS.map((label) => (
          <button
            key={label.id}
            type="button"
            className={`mail-nav__item${activeFolder === label.id ? " is-active" : ""}`}
            onClick={() => onFolderChange(label.id)}
          >
            <NavIcon name={label.icon} />
            <span>{label.label}</span>
            <span />
          </button>
        ))}
      </div>
    </aside>
  );
}
