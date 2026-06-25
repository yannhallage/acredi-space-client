import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  RefObject,
} from "react";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";

import { Icon } from "../../../../shared/ui";

import {
  MentionSuggestions,
  type MentionMemberOption,
} from "./MentionSuggestions";

interface ChatComposerProps {
  discussionName: string;
  draft: string;
  selectedFile: File | null;
  emojiOpen: boolean;
  uploadingFile: boolean;
  sendError: string | null;
  sendPending: boolean;
  mentionActiveIndex: number;
  filteredMentionMembers: MentionMemberOption[];
  mentionDropdownOpen: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSyncMentionContext: (value: string, cursor: number) => void;
  onMentionHover: (index: number) => void;
  onMentionSelect: (member: MentionMemberOption) => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onToggleEmoji: () => void;
  onPickFile: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedFile: () => void;
}

export function ChatComposer({
  discussionName,
  draft,
  selectedFile,
  emojiOpen,
  uploadingFile,
  sendError,
  sendPending,
  mentionActiveIndex,
  filteredMentionMembers,
  mentionDropdownOpen,
  textareaRef,
  fileInputRef,
  onSubmit,
  onDraftChange,
  onComposerKeyDown,
  onSyncMentionContext,
  onMentionHover,
  onMentionSelect,
  onEmojiClick,
  onToggleEmoji,
  onPickFile,
  onFileChange,
  onRemoveSelectedFile,
}: ChatComposerProps) {
  return (
    <form className="composer" onSubmit={onSubmit}>
      <div className="composer-input-wrapper">
        <MentionSuggestions
          activeIndex={mentionActiveIndex}
          members={filteredMentionMembers}
          open={mentionDropdownOpen}
          onHover={onMentionHover}
          onSelect={onMentionSelect}
        />

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={onDraftChange}
          onKeyDown={onComposerKeyDown}
          onClick={(event) => {
            onSyncMentionContext(
              event.currentTarget.value,
              event.currentTarget.selectionStart,
            );
          }}
          onKeyUp={(event) => {
            onSyncMentionContext(
              event.currentTarget.value,
              event.currentTarget.selectionStart,
            );
          }}
          placeholder={`Ecrire dans ${discussionName}...`}
        />
      </div>

      {selectedFile ? (
        <div className="composer-file-preview">
          <Icon name="paperclip" size={14} />
          <span>{selectedFile.name}</span>

          <button
            className="icon-button"
            type="button"
            aria-label="Retirer le fichier"
            onClick={onRemoveSelectedFile}
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ) : null}

      <div className="composer-actions">
        <div className="emoji-action-wrapper">
          <button
            className="icon-button"
            type="button"
            aria-label="Emoji"
            onClick={onToggleEmoji}
          >
            <Icon name="smile" size={15} />
          </button>

          {emojiOpen ? (
            <div className="emoji-picker-popover">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={340}
                height={360}
                theme={Theme.LIGHT}
                emojiStyle={EmojiStyle.NATIVE}
                lazyLoadEmojis={false}
                searchPlaceholder="Rechercher un emoji..."
                previewConfig={{
                  showPreview: false,
                }}
              />
            </div>
          ) : null}
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Joindre un fichier"
          onClick={onPickFile}
        >
          <Icon name="paperclip" size={15} />
        </button>

        <input ref={fileInputRef} type="file" hidden onChange={onFileChange} />

        <span />

        {sendError ? <small className="chat-send-error">{sendError}</small> : null}

        <small>{uploadingFile ? "Upload..." : "Entree envoyer"}</small>
        <button
          className="button primary"
          type="submit"
          disabled={
            (!draft.trim() && !selectedFile) || sendPending || uploadingFile
          }
          aria-label="Envoyer"
        >
          <Icon name="send" size={14} />
        </button>
      </div>
    </form>
  );
}
