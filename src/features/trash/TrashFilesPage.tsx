import Toast from "../../components/app/Toast/Toast";
import { EmptyState, Icon } from "../../shared/ui";
import {
  FileGrid,
  FileList,
  FilesEmptyIllustration,
  FilesViewToggle,
  FolderFilesPageSkeleton,
} from "../files/components";
import { useTrashFilesPage } from "./hooks/useTrashFilesPage";

export function TrashFilesPage() {
  const page = useTrashFilesPage();

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
            title="Corbeille indisponible"
            body={
              page.trashFilesError instanceof Error
                ? page.trashFilesError.message
                : "Impossible de charger la corbeille."
            }
          />
        </section>
      </div>
    );
  }

  const isEmpty = page.visibleFiles.length === 0 && !page.searchTerm.trim();

  return (
    <div className="files-page folders-only files-folder-detail">
      {page.toast.show ? (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      ) : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <h1>Corbeille</h1>
            <p className="files-page-subtitle">
              {isEmpty
                ? "Les elements deplaces ici seront supprimes definitivement au bout de 30 jours"
                : page.pluralizeFile(page.visibleFiles.length)}
            </p>
          </div>

          {!isEmpty ? (
            <FilesViewToggle
              viewMode={page.viewMode}
              onChange={page.setViewMode}
            />
          ) : null}
        </header>

        {isEmpty ? (
          <div className="files-empty-state files-trash-empty">
            <FilesEmptyIllustration illustration="trash" />
          </div>
        ) : (
          <>
            <label className="files-search" htmlFor="trash-file-search">
              <Icon name="search" size={14} />
              <input
                id="trash-file-search"
                value={page.searchTerm}
                onChange={(event) => page.setSearchTerm(event.target.value)}
                placeholder="Rechercher dans la corbeille"
              />
            </label>

            {page.viewMode === "list" ? (
              <FileList
                deletePending={page.deletePending}
                downloadPending={false}
                emptyDescription="Aucun resultat pour cette recherche."
                emptyTitle="Aucun fichier"
                files={page.visibleFiles}
                getOwnerLabel={() => "moi"}
                onDelete={page.handleDeletePermanently}
                onDownload={() => undefined}
                onOpenPreview={() => undefined}
                onRestore={page.handleRestore}
                onToggleMenu={(fileId) =>
                  page.setOpenMenuFileId((current) =>
                    current === fileId ? null : fileId,
                  )
                }
                openMenuFileId={page.openMenuFileId}
                ownerColumnLabel="Proprietaire"
                restorePending={page.restorePending}
                selectedFileId={null}
                showDelete
                showDownload={false}
                showRestore
              />
            ) : (
              <FileGrid
                deletePending={page.deletePending}
                downloadPending={false}
                emptyDescription="Aucun resultat pour cette recherche."
                emptyTitle="Aucun fichier"
                files={page.visibleFiles}
                onDelete={page.handleDeletePermanently}
                onDownload={() => undefined}
                onOpenPreview={() => undefined}
                onRestore={page.handleRestore}
                onToggleMenu={(fileId) =>
                  page.setOpenMenuFileId((current) =>
                    current === fileId ? null : fileId,
                  )
                }
                openMenuFileId={page.openMenuFileId}
                restorePending={page.restorePending}
                selectedFileId={null}
                showDelete
                showDownload={false}
                showRestore
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
