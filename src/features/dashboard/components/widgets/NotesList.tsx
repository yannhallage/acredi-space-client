import type { Note } from "../../../../shared/api/notes/type";
import { recentNotes } from "../../utils";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

type NotesListProps = {
  isLoading: boolean;
  notes: Note[];
};

export function NotesList({ isLoading, notes }: NotesListProps) {
  if (isLoading) return <ListSkeleton />;

  const items = recentNotes(notes);

  if (!items.length) {
    return (
      <EmptyBlock
        illustration="note"
        title="Aucune note"
        body="Les notes recentes apparaitront ici."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((note) => (
        <li className="flex min-w-0 items-center gap-2.5" key={note.id}>
          <span
            className="h-9 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: note.color ?? "#EF4444" }}
          />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-medium text-[var(--text)]">{note.title}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">Note recente</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
