import type { WidgetComponentProps } from "../../constants";
import { NotesList } from "./NotesList";

export function NotesWidget({ context }: WidgetComponentProps) {
  return <NotesList isLoading={context.isNotesLoading} notes={context.notes} />;
}

export function MyNotesWidget({ context }: WidgetComponentProps) {
  return <NotesList isLoading={context.isNotesLoading} notes={context.notes} />;
}

export function TeamNotesWidget({ context }: WidgetComponentProps) {
  return (
    <NotesList
      isLoading={context.isNotesLoading}
      notes={context.notes.filter((note) => Boolean(note.teamId))}
    />
  );
}
