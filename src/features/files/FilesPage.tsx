import Toast from "../../components/app/Toast/Toast";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { EmptyState, Icon } from "../../shared/ui";

import {
  FilePreviewDrawer,
  FilesBreadcrumb,
  FilesPageSkeleton,
  FolderFormModal,
  FolderGrid,
  ShareModal,
  SharedFilesSection,
} from "./components";
import { useFilesPage } from "./hooks/useFilesPage";

export function FilesPage() {
  const page = useFilesPage();

  if (page.isFoldersInitialLoading) {
    return (
      <>
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <FilesPageSkeleton />
      </>
    );
  }

  if (page.isError) {
    return (
      <div className="files-page folders-only">
        {page.toast.show ? (
          <Toast intent={page.toast.intent} message={page.toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Dossiers indisponibles"
            body={
              page.error instanceof Error
                ? page.error.message
                : "Impossible de charger les dossiers."
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={
        page.selectedSharedFile
          ? "files-page folders-only files-folder-detail preview-open"
          : "files-page folders-only"
      }
    >
      {page.toast.show ? (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      ) : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <h1>Fichiers</h1>
            <FilesBreadcrumb
              breadcrumbs={page.breadcrumbs}
              countLabel={page.pluralizeFolder(page.visibleFolders.length)}
              onNavigateFolder={(folderId) => page.setCurrentFolderId(folderId)}
              onNavigateRoot={() => page.setCurrentFolderId(null)}
            />
          </div>
          <PermissionGate
            permissions={[
              PERMISSIONS.CREATE_FOLDER,
              PERMISSIONS.MANAGE_FOLDERS,
            ]}
          >
            <button
              className="button primary notes-create-button"
              type="button"
              onClick={page.openCreateModal}
            >
              <Icon name="plus" size={13} />
              Nouveau dossier
            </button>
          </PermissionGate>
        </header>

        <label className="files-search" htmlFor="files-folder-search">
          <Icon name="search" size={14} />
          <input
            id="files-folder-search"
            value={page.searchTerm}
            onChange={(event) => page.setSearchTerm(event.target.value)}
            placeholder="Rechercher un dossier"
          />
        </label>

        <FolderGrid
          deletePending={page.deleteFolderMutation.isPending}
          folders={page.visibleFolders}
          onDelete={page.handleDeleteFolder}
          onEdit={page.openEditModal}
          onOpen={(folder) => page.navigate(`/app/files/${folder.id}`)}
          onShare={page.handleShareFolder}
          onToggleMenu={(folderId) =>
            page.setOpenMenuFolderId((current) =>
              current === folderId ? null : folderId,
            )
          }
          openMenuFolderId={page.openMenuFolderId}
        />

        <SharedFilesSection
          downloadPending={page.downloadSharedFileUrlMutation.isPending}
          error={page.sharedFilesError}
          isError={page.isSharedFilesError}
          isLoading={page.isSharedFilesInitialLoading}
          onDownload={page.handleDownloadSharedFile}
          onOpenPreview={page.handleOpenSharedFilePreview}
          onToggleMenu={(fileId) =>
            page.setOpenSharedFileMenuId((current) =>
              current === fileId ? null : fileId,
            )
          }
          openMenuFileId={page.openSharedFileMenuId}
          selectedFileId={page.selectedSharedFileId}
          sharedFiles={page.sharedFiles}
        />
      </section>

      <FilePreviewDrawer
        actions={
          <button
            className="button primary"
            type="button"
            disabled={page.downloadSharedFileUrlMutation.isPending}
            onClick={() => {
              if (page.selectedSharedFile) {
                void page.handleDownloadSharedFile(page.selectedSharedFile);
              }
            }}
          >
            <Icon name="download" size={13} />
            Telecharger
          </button>
        }
        details={[{ label: "Chemin", value: "/Acredi Space/Fichiers partages" }]}
        file={page.selectedSharedFile}
        onClose={() => page.setSelectedSharedFileId(null)}
        preview={page.preview}
        subtitle="Fichier partage"
      />

      <FolderFormModal
        currentFolder={page.currentFolder}
        errorMessage={page.folderFormError}
        folderName={page.folderName}
        isOpen={page.isFolderModalOpen}
        isSaving={page.isFolderSaving}
        onChangeName={page.setFolderName}
        onClose={page.closeFolderModal}
        onSubmit={page.handleSaveFolder}
        savingLabel={page.folderSavingLabel}
        submitLabel={page.folderSubmitLabel}
        title={page.folderModalTitle}
      />

      <ShareModal
        variant="folder"
        error={page.usersQuery.error}
        fileCount={page.shareTargetFiles.length}
        filesLoading={page.isFilesInitialLoading}
        folder={page.shareTargetFolder}
        isOpen={Boolean(page.shareTargetFolder)}
        isSharing={Boolean(page.sharingUserId)}
        level={page.shareLevel}
        loading={page.usersQuery.loading}
        onClose={page.closeFolderShareModal}
        onLevelChange={page.setShareLevel}
        onRetry={page.usersQuery.refetch}
        onSelect={(user) => {
          void page.shareFolderWithUser(user);
        }}
        selectedUserId={page.sharingUserId}
        users={page.usersQuery.data ?? []}
      />
    </div>
  );
}
