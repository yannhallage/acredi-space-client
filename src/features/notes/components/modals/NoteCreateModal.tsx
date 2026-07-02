import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { Icon } from "../../../../shared/ui";
import { noteColors } from "../../utils";
import { NotesEditor } from "../widgets/NotesEditor";

type NoteCreateModalProps = {
  content: string;
  color: string;
  isEditing: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onTitleChange: (value: string) => void;
  title: string;
};

export function NoteCreateModal({
  content,
  color,
  isEditing,
  isOpen,
  isSaving,
  onClose,
  onColorChange,
  onContentChange,
  onSave,
  onTitleChange,
  title,
}: NoteCreateModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="note-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
        >
          <motion.form
            className="note-modal"
            aria-label={isEditing ? "Edit Note" : "Create Note"}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            <header>
              <h2>{isEditing ? "Edit Note" : "Create Note"}</h2>

              <div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Open expanded editor"
                  disabled={isSaving}
                >
                  <Icon name="edit" size={16} />
                </button>

                <button
                  className="icon-button"
                  type="button"
                  aria-label={
                    isEditing ? "Close edit note" : "Close create note"
                  }
                  onClick={onClose}
                  disabled={isSaving}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </header>

            <label className="note-field">
              <span>
                Title <b>*</b>
              </span>
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Title"
                autoFocus
                disabled={isSaving}
              />
            </label>

            <label className="note-field">
              <span>Content</span>
              <NotesEditor
                content={content}
                disabled={isSaving}
                onContentChange={onContentChange}
              />
            </label>

            <label className="note-field">
              <span>Color</span>
              <div className="note-color-picker">
                {noteColors.map((noteColor) => (
                  <button
                    key={noteColor}
                    type="button"
                    className={`note-color${color === noteColor ? " active" : ""}`}
                    style={{ background: noteColor }}
                    onClick={() => onColorChange(noteColor)}
                    aria-label={`Choose color ${noteColor}`}
                    disabled={isSaving}
                  />
                ))}
              </div>
            </label>

            <footer>
              <button
                className="button primary notes-submit"
                type="submit"
                disabled={!title.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <ClipLoader size={12} color="#fff" />
                    {isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Save"
                ) : (
                  "Create"
                )}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
