import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  Suspense,
  lazy,
  type RefObject,
} from "react";
import type { EmojiClickData, Theme } from "emoji-picker-react";

import { Icon } from "../../../../shared/ui";

import { formatAttachmentSize } from "../utils/dmMessageFormat";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface ConversationComposerProps {
  title: string;
  content: string;
  selectedFiles: File[];
  canSend: boolean;
  isSending: boolean;
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
}

export function ConversationComposer({
  title,
  content,
  selectedFiles,
  canSend,
  isSending,
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
}: ConversationComposerProps) {
  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={onSubmit} className="dm-composer">
      <div className="dm-composer-shell">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={`Ecrire a ${title}...`}
          rows={2}
        />

        <input
          ref={fileInputRef}
          className="dm-file-input"
          type="file"
          multiple
          onChange={onFileInputChange}
        />

        {selectedFiles.length ? (
          <div className="dm-selected-files" aria-live="polite">
            {selectedFiles.map((file, index) => (
              <span
                className="dm-selected-file"
                key={`${file.name}-${file.size}-${file.lastModified}`}
              >
                <span className="dm-selected-file-icon">
                  <Icon name="file" size={14} />
                </span>
                <span className="dm-selected-file-copy">
                  <strong>{file.name}</strong>
                  <small>{formatAttachmentSize(file.size)}</small>
                </span>
                <button
                  type="button"
                  aria-label={`Retirer ${file.name}`}
                  onClick={() => onRemoveSelectedFile(index)}
                >
                  <Icon name="x" size={13} />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="dm-composer-footer">
          <div className="dm-composer-tools">
            <button
              type="button"
              aria-label="Joindre un fichier"
              disabled={isSending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="paperclip" size={16} />
            </button>
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
            <span>Entree pour envoyer</span>
            <button type="submit" disabled={!canSend} aria-label="Envoyer">
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
