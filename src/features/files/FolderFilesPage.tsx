import { Navigate, useParams } from "react-router-dom";

import Toast from "../../components/app/Toast/Toast";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { EmptyState, Icon } from "../../shared/ui";

import {
  FileGrid,
  FilePreviewDrawer,
  FilesBreadcrumb,
  FolderFilesPageSkeleton,
  ShareModal,
} from "./components";
import { useFolderFilesPage } from "./hooks/useFolderFilesPage";

export function FolderFilesPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const page = useFolderFilesPage(folderId);

  if (!folderId) {
    return <Navigate to="/app/files" replace />;
  }

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

  if (page.isFoldersError || page.isFilesError) {
    const error = page.foldersError ?? page.filesError;

    return (
      <div className="files-page folders-only files-folder-detail">
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Fichiers indisponibles"
            body={
              error instanceof Error
                ? error.message
                : "Impossible de charger les fichiers."
            }
          />
        </section>
      </div>
    );
  }

  if (!page.currentFolder) {
    return (
      <div className="files-page folders-only files-folder-detail">
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <section className="files-explorer">
          <button
            className="files-back-button"
            type="button"
            onClick={() => page.navigate("/app/files")}
          >
            <Icon name="arrowLeft" size={13} />
            Retour aux dossiers
          </button>
          <EmptyState
            title="Dossier introuvable"
            body="Ce dossier n'existe plus ou vous n'y avez plus acces."
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={
        page.selectedFile
          ? "files-page folders-only files-folder-detail preview-open"
          : "files-page folders-only files-folder-detail"
      }
    >
      {page.toast.show ? (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      ) : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <button
              className="files-back-button"
              type="button"
              onClick={() => page.navigate("/app/files")}
            >
              <Icon name="arrowLeft" size={13} />
              Dossiers
            </button>
            <h1>{page.currentFolder.name}</h1>
            <FilesBreadcrumb
              breadcrumbs={page.breadcrumbs}
              countLabel={page.pluralizeFile(page.visibleFiles.length)}
              onNavigateFolder={(id) => page.navigate(`/app/files/${id}`)}
              onNavigateRoot={() => page.navigate("/app/files")}
            />
          </div>

          <PermissionGate permission={PERMISSIONS.UPLOAD_OWN_FILES}>
            <label
              className={
                page.uploadFileMutation.isPending
                  ? "files-upload-button busy"
                  : "files-upload-button"
              }
            >
              <Icon name="upload" size={13} />
              {page.uploadFileMutation.isPending ? "Import..." : "Importer"}
              <input
                type="file"
                disabled={page.uploadFileMutation.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";

                  if (file) {
                    void page.handleUploadFile(file);
                  }
                }}
              />
            </label>
          </PermissionGate>
        </header>

        <label className="files-search" htmlFor="folder-file-search">
          <Icon name="search" size={14} />
          <input
            id="folder-file-search"
            value={page.searchTerm}
            onChange={(event) => page.setSearchTerm(event.target.value)}
            placeholder="Rechercher un fichier"
          />
        </label>

        <FileGrid
          deletePending={page.deleteFileMutation.isPending}
          downloadPending={page.downloadFileUrlMutation.isPending}
          emptyDescription="Importez un fichier dans ce dossier."
          emptyTitle="Aucun fichier"
          files={page.visibleFiles}
          onDelete={page.handleDeleteFile}
          onDownload={page.handleDownloadFile}
          onOpenPreview={page.handleOpenPreview}
          onShare={page.handleShareFile}
          onToggleMenu={(fileId) =>
            page.setOpenMenuFileId((current) =>
              current === fileId ? null : fileId,
            )
          }
          openMenuFileId={page.openMenuFileId}
          selectedFileId={page.selectedFile?.id ?? null}
          showDelete
          showShare
        />
      </section>

      <FilePreviewDrawer
        actions={
          <>
            <button
              className="button primary"
              type="button"
              disabled={page.downloadFileUrlMutation.isPending}
              onClick={() => {
                if (page.selectedFile) {
                  void page.handleDownloadFile(page.selectedFile);
                }
              }}
            >
              <Icon name="download" size={13} />
              Telecharger
            </button>

            <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
              <button
                className="icon-button bordered"
                type="button"
                aria-label="Partager"
                onClick={() => {
                  if (page.selectedFile) {
                    page.handleShareFile(page.selectedFile);
                  }
                }}
              >
                <Icon name="users" size={14} />
              </button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.DELETE_FILES}>
              <button
                className="icon-button bordered danger"
                type="button"
                aria-label="Supprimer"
                disabled={page.deleteFileMutation.isPending}
                onClick={() => {
                  if (page.selectedFile) {
                    void page.handleDeleteFile(page.selectedFile);
                  }
                }}
              >
                <Icon name="trash" size={14} />
              </button>
            </PermissionGate>
          </>
        }
        details={[{ label: "Chemin", value: `/Acredi Space/${page.currentPath}` }]}
        file={page.selectedFile}
        onClose={() => page.setSelectedFileId(null)}
        preview={page.preview}
        subtitle="Apercu fichier"
      />

      <ShareModal
        variant="file"
        error={page.usersQuery.error}
        file={page.shareTargetFile}
        isOpen={Boolean(page.shareTargetFile)}
        isSharing={Boolean(page.sharingUserId)}
        level={page.shareLevel}
        loading={page.usersQuery.loading}
        onClose={page.closeFileShareModal}
        onLevelChange={page.setShareLevel}
        onRetry={page.usersQuery.refetch}
        onSelect={(user) => {
          void page.shareFileWithUser(user);
        }}
        selectedUserId={page.sharingUserId}
        users={page.usersQuery.data ?? []}
      />
    </div>
  );
}
