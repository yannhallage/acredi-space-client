import Toast from "../../components/app/Toast/Toast";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { EmptyState, Icon } from "../../shared/ui";

import {
  FilesBreadcrumb,
  FilesPageSkeleton,
  FilesViewToggle,
  FolderFormModal,
  FolderGrid,
  FolderList,
  ShareModal,
} from "./components";
import { useFilesPage } from "./hooks/useFilesPage";
import { useFilesViewMode } from "./hooks/useFilesViewMode";

export function FilesPage() {
  const page = useFilesPage();
  const { setViewMode, viewMode } = useFilesViewMode();

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
    <div className="files-page folders-only">
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
          <div className="files-manager-actions">
            <FilesViewToggle viewMode={viewMode} onChange={setViewMode} />
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
          </div>
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

        {viewMode === "list" ? (
          <FolderList
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
        ) : (
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
        )}
      </section>

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
