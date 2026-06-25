import { editorTools } from "../../utils";

type NotesEditorProps = {
  content: string;
  disabled?: boolean;
  onContentChange: (value: string) => void;
};

export function NotesEditor({
  content,
  disabled = false,
  onContentChange,
}: NotesEditorProps) {
  return (
    <div className="note-editor">
      <div className="note-editor-toolbar" aria-hidden="true">
        {editorTools.map((tool) => (
          <button key={tool} type="button" tabIndex={-1}>
            {tool}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Content"
        disabled={disabled}
      />
    </div>
  );
}
