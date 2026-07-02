import type { WorkspaceFile } from "../../../../shared/api/files/types";
import { fileExtension, recentFiles } from "../../utils";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

type FilesListProps = {
  files: WorkspaceFile[];
  isLoading: boolean;
};

export function FilesList({ files, isLoading }: FilesListProps) {
  if (isLoading) return <ListSkeleton />;

  const items = recentFiles(files);

  if (!items.length) {
    return (
      <EmptyBlock
        illustration="file"
        title="Aucun fichier recent"
        body="Les derniers fichiers apparaitront ici."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((file) => (
        <li className="flex min-w-0 items-center gap-2.5" key={file.id}>
          <span className="grid h-8 w-10 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-[9px] font-semibold uppercase text-emerald-500">
            {fileExtension(file)}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-medium text-[var(--text)]">{file.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">Fichier recent</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
