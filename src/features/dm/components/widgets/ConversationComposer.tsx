import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  Suspense,
  lazy,
  useEffect,
  useState,
  type RefObject,
} from "react";
import type { EmojiClickData, Theme } from "emoji-picker-react";

import { Icon } from "../../../../shared/ui";

import { formatAttachmentSize } from "../utils/dmMessageFormat";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function SelectedFileChip({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) {
      setThumbUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setThumbUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, isImage]);

  return (
    <span className={`dm-selected-file${isImage ? " is-image" : ""}`}>
      {thumbUrl ? (
        <span className="dm-selected-file-thumb">
          <img alt="" src={thumbUrl} />
        </span>
      ) : (
        <span className="dm-selected-file-icon">
          <Icon name="file" size={14} />
        </span>
      )}
      <span className="dm-selected-file-copy">
        <strong>{file.name}</strong>
        <small>{formatAttachmentSize(file.size)}</small>
      </span>
      <button type="button" aria-label={`Retirer ${file.name}`} onClick={onRemove}>
        <Icon name="x" size={13} />
      </button>
    </span>
  );
}
interface ConversationComposerProps {
  title: string;
  content: string;
  selectedFiles: File[];
  canSend: boolean;
  isSending: boolean;
  isEditing?: boolean;
  emojiPickerOpen: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  emojiPickerRef: RefObject<HTMLDivElement | null>;
  onContentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedFile: (index: number) => void;
  onToggleEmojiPicker: () => void;
  onEmojiSelect: (emojiData: EmojiClickData) => void;
  onCancelEdit?: () => void;
}

export function ConversationComposer({
  title,
  content,
  selectedFiles,
  canSend,
  isSending,
  isEditing = false,
  emojiPickerOpen,
  textareaRef,
  fileInputRef,
  emojiPickerRef,
  onContentChange,
  onSubmit,
  onFileInputChange,
  onRemoveSelectedFile,
  onToggleEmojiPicker,
  onEmojiSelect,
  onCancelEdit,
}: ConversationComposerProps) {
  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={onSubmit} className="dm-composer">
      {isEditing ? (
        <div className="dm-composer-edit-banner">
          <span>
            <strong>Modification</strong> — editez votre message
          </span>
          <button type="button" onClick={onCancelEdit}>
            Annuler
          </button>
        </div>
      ) : null}

      <div className="dm-composer-shell">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={
            isEditing ? "Modifier le message..." : `Ecrire a ${title}...`
          }
          rows={2}
        />

        <input
          ref={fileInputRef}
          className="dm-file-input"
          type="file"
          multiple
          onChange={onFileInputChange}
        />

        {selectedFiles.length && !isEditing ? (
          <div className="dm-selected-files" aria-live="polite">
            {selectedFiles.map((file, index) => (
              <SelectedFileChip
                key={`${file.name}-${file.size}-${file.lastModified}`}
                file={file}
                onRemove={() => onRemoveSelectedFile(index)}
              />
            ))}
          </div>
        ) : null}

        <div className="dm-composer-footer">
          <div className="dm-composer-tools">
            {!isEditing ? (
              <button
                type="button"
                aria-label="Joindre un fichier"
                disabled={isSending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="paperclip" size={16} />
              </button>
            ) : null}
            <div className="dm-emoji-picker-host" ref={emojiPickerRef}>
              <button
                type="button"
                aria-label="Emoji"
                aria-haspopup="dialog"
                aria-expanded={emojiPickerOpen}
                onClick={onToggleEmojiPicker}
              >
                <Icon name="smile" size={16} />
              </button>

              {emojiPickerOpen ? (
                <div className="dm-emoji-picker-popover" role="dialog">
                  <Suspense
                    fallback={
                      <div className="dm-emoji-picker-loading">
                        Chargement...
                      </div>
                    }
                  >
                    <EmojiPicker
                      height={360}
                      lazyLoadEmojis
                      previewConfig={{ showPreview: false }}
                      searchPlaceHolder="Rechercher un emoji"
                      theme={"auto" as Theme}
                      width={320}
                      onEmojiClick={onEmojiSelect}
                    />
                  </Suspense>
                </div>
              ) : null}
            </div>
          </div>

          <div className="dm-send-area">
            <span>{isEditing ? "Entree pour enregistrer" : "Entree pour envoyer"}</span>
            <button
              type="submit"
              disabled={!canSend}
              aria-label={isEditing ? "Enregistrer" : "Envoyer"}
            >
              <Icon name={isEditing ? "check" : "send"} size={16} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
