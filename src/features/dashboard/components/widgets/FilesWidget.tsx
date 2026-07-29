import type { WidgetComponentProps } from "../../constants";
import { FilesList } from "./FilesList";

export function FilesWidget({ context }: WidgetComponentProps) {
  return <FilesList files={context.files} isLoading={context.isFilesLoading} />;
}

export function MyFilesWidget({ context }: WidgetComponentProps) {
  return <FilesList files={context.files} isLoading={context.isFilesLoading} />;
}

export function TeamFilesWidget({ context }: WidgetComponentProps) {
  return (
    <FilesList
      files={context.files.filter((file) => Boolean(file.teamId))}
      isLoading={context.isFilesLoading}
    />
  );
}
