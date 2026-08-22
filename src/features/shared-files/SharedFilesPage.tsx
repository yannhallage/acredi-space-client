import Toast from "../../components/app/Toast/Toast";
import { EmptyState, Icon } from "../../shared/ui";
import {
  FileGrid,
  FileList,
  FilePreviewDrawer,
  FilesViewToggle,
  FolderFilesPageSkeleton,
} from "../files/components";
import { useSharedFilesPage } from "./hooks/useSharedFilesPage";

export function SharedFilesPage() {
  const page = useSharedFilesPage();

  if (page.isInitialLoading) {
    return (
      <>
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <FolderFilesPageSkeleton />
      </>
    );
  }

  if (page.isError) {
    return (
      <div className="files-page folders-only files-folder-detail">
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Fichiers partages indisponibles"
            body={
              page.sharedFilesError instanceof Error
                ? page.sharedFilesError.message
                : "Impossible de charger les fichiers partages."
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div className="files-page folders-only files-folder-detail">
      {page.toast.show ? (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      ) : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <h1>Fichiers partages</h1>
            <p className="files-page-subtitle">
              {page.pluralizeFile(page.visibleFiles.length)} partages avec vous
            </p>
          </div>

          <FilesViewToggle
            viewMode={page.viewMode}
            onChange={page.setViewMode}
          />
        </header>

        <label className="files-search" htmlFor="shared-file-search">
          <Icon name="search" size={14} />
          <input
            id="shared-file-search"
            value={page.searchTerm}
            onChange={(event) => page.setSearchTerm(event.target.value)}
            placeholder="Rechercher un fichier partage"
          />
        </label>

        {page.viewMode === "list" ? (
          <FileList
            downloadPending={page.downloadPending}
            emptyDescription="Les fichiers que l'on vous partage apparaitront ici."
            emptyTitle="Aucun fichier partage"
            files={page.visibleFiles}
            getOwnerLabel={page.getOwnerLabel}
            getOwnerUser={page.getOwnerUser}
            onDownload={page.handleDownload}
            onOpenPreview={page.handleOpenPreview}
            onToggleMenu={(fileId) =>
              page.setOpenMenuFileId((current) =>
                current === fileId ? null : fileId,
              )
            }
            openMenuFileId={page.openMenuFileId}
            ownerColumnLabel="Partage par"
            selectedFileId={page.selectedFile?.id ?? null}
            showInlineDownload
          />
        ) : (
          <FileGrid
            downloadPending={page.downloadPending}
            emptyDescription="Les fichiers que l'on vous partage apparaitront ici."
            emptyTitle="Aucun fichier partage"
            files={page.visibleFiles}
            getOwnerLabel={page.getOwnerLabel}
            getOwnerUser={page.getOwnerUser}
            onDownload={page.handleDownload}
            onOpenPreview={page.handleOpenPreview}
            onToggleMenu={(fileId) =>
              page.setOpenMenuFileId((current) =>
                current === fileId ? null : fileId,
              )
            }
            openMenuFileId={page.openMenuFileId}
            selectedFileId={page.selectedFile?.id ?? null}
          />
        )}
      </section>

      <FilePreviewDrawer
        actions={
          <button
            className="button primary"
            type="button"
            disabled={page.downloadPending}
            onClick={() => {
              if (page.selectedFile) {
                void page.handleDownload(page.selectedFile);
              }
            }}
          >
            <Icon name="download" size={13} />
            Telecharger
          </button>
        }
        file={page.selectedFile}
        files={page.visibleFiles}
        onClose={() => page.setSelectedFileId(null)}
        onNavigate={page.handleOpenPreview}
        path="/Acredi Space/Fichiers partages"
        preview={page.preview}
        subtitle="Fichier partage"
      />
    </div>
  );
}
