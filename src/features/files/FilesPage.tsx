import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useUpdateFolder,
  type Folder,
} from "../../shared/api/folders";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import Toast from "../../components/app/Toast/Toast";
import { EmptyState, Icon } from "../../shared/ui";

const folderSkeletons = [
  "folder-skeleton-1",
  "folder-skeleton-2",
  "folder-skeleton-3",
  "folder-skeleton-4",
  "folder-skeleton-5",
  "folder-skeleton-6",
  "folder-skeleton-7",
  "folder-skeleton-8",
  "folder-skeleton-9",
  "folder-skeleton-10",
];

const emptyFolders: Folder[] = [];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};
function pluralizeFolder(count: number) {
  return `${count} dossier${count > 1 ? "s" : ""}`;
}

function buildFolderTrail(
  folder: Folder | null,
  folderById: Map<string, Folder>,
) {
  const trail: Folder[] = [];
  const visited = new Set<string>();
  let cursor = folder;

  while (cursor && !visited.has(cursor.id)) {
    trail.unshift(cursor);
    visited.add(cursor.id);
    cursor = cursor.parentId ? (folderById.get(cursor.parentId) ?? null) : null;
  }

  return trail;
}

function FilesPageSkeleton() {
  return (
    <div className="files-page folders-only" aria-busy="true">
      <section className="files-explorer">
        <header className="files-manager-header" aria-hidden="true">
          <div className="files-skeleton-heading">
            <span className="skeleton-line files-skeleton-title" />
            <span className="skeleton-line files-skeleton-breadcrumb" />
          </div>
          <span className="skeleton-pill files-skeleton-button" />
        </header>

        <span className="files-skeleton-search" aria-hidden="true" />

        <div className="files-filter-row" aria-hidden="true">
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
        </div>

        <div className="files-folder-grid" aria-hidden="true">
          {folderSkeletons.map((item) => (
            <article
              className="files-folder-tile files-folder-tile-skeleton"
              key={item}
            >
              <span className="files-folder-art files-folder-skeleton-art" />
              <span className="skeleton-line files-folder-skeleton-name" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FilesPage() {
  const navigate = useNavigate();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState("");
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const {
    data: foldersData,
    error,
    isError,
    isFetching,
    isLoading,
    isPending,
  } = useFolders();
  const folders = foldersData ?? emptyFolders;
  const isFoldersInitialLoading =
    isPending || isLoading || (isFetching && !foldersData && !isError);

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );

  const currentFolder = currentFolderId
    ? (folderById.get(currentFolderId) ?? null)
    : null;

  const breadcrumbs = useMemo(
    () => buildFolderTrail(currentFolder, folderById),
    [currentFolder, folderById],
  );

  const visibleFolders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return folders.filter((folder) => {
      const isInCurrentFolder =
        (folder.parentId ?? null) === (currentFolder?.id ?? null);
      const matchesSearch = !query || folder.name.toLowerCase().includes(query);

      return isInCurrentFolder && matchesSearch;
    });
  }, [currentFolder, folders, searchTerm]);

  useEffect(() => {
    if (currentFolderId && !folderById.has(currentFolderId)) {
      setCurrentFolderId(null);
    }
  }, [currentFolderId, folderById]);

  useEffect(() => {
    if (!openMenuFolderId) {
      return undefined;
    }

    function closeMenu() {
      setOpenMenuFolderId(null);
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [openMenuFolderId]);

  const isFolderSaving =
    createFolderMutation.isPending || updateFolderMutation.isPending;
  const isFolderModalOpen = createModalOpen || Boolean(editingFolder);
  const folderModalTitle = editingFolder ? "Modifier le dossier" : "Creer un dossier";
  const folderSubmitLabel = editingFolder ? "Modifier" : "Creer";
  const folderSavingLabel = editingFolder ? "Modification..." : "Creation...";

  function openCreateModal() {
    setEditingFolder(null);
    setFolderName("");
    createFolderMutation.reset();
    updateFolderMutation.reset();
    setCreateModalOpen(true);
  }

  function openEditModal(folder: Folder) {
    setOpenMenuFolderId(null);
    setCreateModalOpen(false);
    setEditingFolder(folder);
    setFolderName(folder.name);
    createFolderMutation.reset();
    updateFolderMutation.reset();
  }

  function closeFolderModal() {
    if (isFolderSaving) {
      return;
    }

    setCreateModalOpen(false);
    setEditingFolder(null);
    setFolderName("");
    createFolderMutation.reset();
    updateFolderMutation.reset();
  }

  const showToast = useCallback((
    intent: ToastState["intent"],
    message: string,
    timeout = 4000,
  ) => {
    setToast({ show: true, intent, message });

    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, timeout);
  }, []);

  useEffect(() => {
    if (!isError) {
      return;
    }

    showToast(
      "error",
      error instanceof Error
        ? error.message
        : "Impossible de charger les dossiers.",
      5000,
    );
  }, [error, isError, showToast]);

  function handleShareFolder(folder: Folder) {
    setOpenMenuFolderId(null);
    showToast(
      "info",
      `Partage du dossier "${folder.name}" pas encore disponible cote API.`,
      5000,
    );
  }

  async function handleDeleteFolder(folder: Folder) {
    setOpenMenuFolderId(null);

    if (!window.confirm(`Supprimer le dossier "${folder.name}" ?`)) {
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folder.id);

      if (currentFolderId === folder.id) {
        setCurrentFolderId(null);
      }

      showToast("success", "Dossier supprime avec succes.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer le dossier.",
        5000,
      );
    }
  }

  async function handleSaveFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = folderName.trim();

    if (!name) {
      return;
    }

    try {
      if (editingFolder) {
        await updateFolderMutation.mutateAsync({
          id: editingFolder.id,
          request: { name },
        });
        showToast("success", "Dossier modifie avec succes.");
      } else {
        await createFolderMutation.mutateAsync({
          name,
          parentId: currentFolder?.id ?? null,
          teamId: null,
        });
        showToast("success", "Dossier cree avec succes.");
      }

      closeFolderModal();
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : editingFolder
            ? "Impossible de modifier le dossier."
            : "Impossible de creer le dossier.",
        5000,
      );
    }
  }

  if (isFoldersInitialLoading) {
    return (
      <>
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <FilesPageSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <div className="files-page folders-only">
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Dossiers indisponibles"
            body={
              error instanceof Error
                ? error.message
                : "Impossible de charger les dossiers."
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div className="files-page folders-only">
      {toast.show ? <Toast intent={toast.intent} message={toast.message} /> : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <h1>Fichiers</h1>
            <div className="files-breadcrumb">
              <button type="button" onClick={() => setCurrentFolderId(null)}>
                Acredi Space
              </button>
              {breadcrumbs.map((folder, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <span key={folder.id}>
                    <Icon name="chevRight" size={11} />
                    {isLast ? (
                      <strong>{folder.name}</strong>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(folder.id)}
                      >
                        {folder.name}
                      </button>
                    )}
                  </span>
                );
              })}
              <small>{pluralizeFolder(visibleFolders.length)}</small>
            </div>
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
              onClick={openCreateModal}
            >
              <Icon name="plus" size={13} />
              Nouveau dossier
            </button>
          </PermissionGate>

          {/* Actions fichiers masquees pendant la vue dossiers uniquement.
          <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
            <button className="button ghost" type="button">
              <Icon name="users" size={14} />
              Inviter
            </button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.UPLOAD_OWN_FILES}>
            <button className="button primary" type="button">
              <Icon name="plus" size={14} />
              Importer
            </button>
          </PermissionGate>
          */}
        </header>

        <label className="files-search" htmlFor="files-folder-search">
          <Icon name="search" size={14} />
          <input
            id="files-folder-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un dossier"
          />
        </label>

        <div className="files-filter-row">
          <button type="button">
            Type <Icon name="chevDown" size={11} />
          </button>
          <button type="button">
            Emplacement <Icon name="chevDown" size={11} />
          </button>
          <button type="button">
            Equipe <Icon name="chevDown" size={11} />
          </button>
        </div>

        {/* Filtres fichiers masques pendant la vue dossiers uniquement.
        <div className="toolbar-row">
          <div className="segmented">
            {['Tous', 'Documents', 'Images', 'Videos', 'Archives'].map((filter, index) => (
              <button key={filter} className={index === 0 ? 'active' : ''} type="button">
                {filter}
              </button>
            ))}
          </div>
          <div className="toolbar-spacer" />
          <button className="button ghost" type="button">
            Trier - Recents <Icon name="chevDown" size={12} />
          </button>
          <div className="segmented icon-segmented">
            <button className={view === 'grid' ? 'active' : ''} type="button" onClick={() => setView('grid')} aria-label="Vue grille">
              <Icon name="grid" size={15} />
            </button>
            <button className={view === 'list' ? 'active' : ''} type="button" onClick={() => setView('list')} aria-label="Vue liste">
              <Icon name="list" size={15} />
            </button>
          </div>
        </div>
        */}

        {visibleFolders.length > 0 ? (
          <div className="files-folder-grid">
            {visibleFolders.map((folder) => (
              <article
                key={folder.id}
                className={
                  openMenuFolderId === folder.id
                    ? "files-folder-tile menu-open"
                    : "files-folder-tile"
                }
              >
                <button
                  className="files-folder-open"
                  type="button"
                  onClick={() => navigate(`/app/files/${folder.id}`)}
                >
                  <span className="files-folder-art">
                    <span className="files-folder-shape" aria-hidden="true" />
                  </span>
                  <strong>{folder.name}</strong>
                </button>

                <button
                  className="files-folder-menu-button"
                  type="button"
                  aria-label={`Actions ${folder.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuFolderId === folder.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuFolderId((current) =>
                      current === folder.id ? null : folder.id,
                    );
                  }}
                >
                  <Icon name="moreH" size={14} />
                </button>

                {openMenuFolderId === folder.id ? (
                  <div
                    className="files-folder-dropdown"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <PermissionGate
                      permissions={[
                        PERMISSIONS.UPDATE_FOLDERS,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => openEditModal(folder)}
                      >
                        <Icon name="edit" size={13} />
                        Modifier
                      </button>
                    </PermissionGate>

                    <PermissionGate
                      permissions={[
                        PERMISSIONS.SHARE_FILES,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleShareFolder(folder)}
                      >
                        <Icon name="users" size={13} />
                        Partager
                      </button>
                    </PermissionGate>

                    <PermissionGate
                      permissions={[
                        PERMISSIONS.DELETE_FOLDERS,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        className="danger"
                        type="button"
                        role="menuitem"
                        disabled={deleteFolderMutation.isPending}
                        onClick={() => {
                          void handleDeleteFolder(folder);
                        }}
                      >
                        <Icon name="trash" size={13} />
                        Supprimer
                      </button>
                    </PermissionGate>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="files-empty-state">
            <Icon name="folder" size={38} />
            <strong>Aucun dossier</strong>
            <p>Creez un dossier pour organiser cet espace.</p>
          </div>
        )}

        {/* Section fichiers masquee pendant la vue dossiers uniquement.
        <p className="section-label split">
          <span>Fichiers</span>
          <span>{data.files.length} sur 124</span>
        </p>

        {view === 'list' ? (
          <div className="file-table">
            <div className="file-table-head">
              <span />
              <span>Nom</span>
              <span>Taille</span>
              <span>Modifie</span>
              <span>Par</span>
              <span />
            </div>
            {data.files.map((file) => {
              const author = fileAuthor(file);
              return (
                <button
                  key={file.id}
                  className={selected?.id === file.id ? 'file-table-row active' : 'file-table-row'}
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                >
                  <FileIcon ext={file.ext} color={file.color} size={26} />
                  <span>{file.name}</span>
                  <small>{file.size}</small>
                  <small>{file.modifiedLabel}</small>
                  <small className="author-cell"><Avatar name={author.name} size={20} />{author.name}</small>
                  <Icon name="moreH" size={14} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="file-grid">
            {data.files.map((file) => (
              <button
                key={file.id}
                className={selected?.id === file.id ? 'file-card active' : 'file-card'}
                type="button"
                onClick={() => setSelectedId(file.id)}
              >
                <span className="file-card-preview">
                  <FileIcon ext={file.ext} color={file.color} size={48} />
                </span>
                <strong>{file.name}</strong>
                <small><span>{file.size}</span><span>{file.modifiedLabel}</span></small>
              </button>
            ))}
          </div>
        )}
        */}
      </section>

      {/* Panneau d'apercu fichier masque pendant la vue dossiers uniquement.
      <aside className="file-preview">
        {selected ? (
          <>
            <div className="file-preview-art">
              <FileIcon ext={selected.ext} color={selected.color} size={72} />
              <small>Apercu indisponible</small>
            </div>
            <h2>{selected.name}</h2>
            <p>{selected.ext.toUpperCase()} - {selected.size}</p>
            <div className="button-row">
              <button className="button primary" type="button">Ouvrir</button>
              <button className="icon-button bordered" type="button" aria-label="Telecharger"><Icon name="download" size={14} /></button>
              <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
                <button className="icon-button bordered" type="button" aria-label="Partager"><Icon name="users" size={14} /></button>
              </PermissionGate>
              <button className="icon-button bordered" type="button" aria-label="Plus"><Icon name="moreH" size={14} /></button>
            </div>
            <dl className="details-list">
              <div><dt>Type</dt><dd>{selected.ext.toUpperCase()}</dd></div>
              <div><dt>Modifie</dt><dd>{selected.modifiedLabel}</dd></div>
              <div><dt>Auteur</dt><dd>{fileAuthor(selected).name}</dd></div>
              <div><dt>Chemin</dt><dd>/Acredi Space/Identite</dd></div>
            </dl>
            <div>
              <p className="section-label split"><span>Partage avec</span><span>{selected.sharedWith.length}</span></p>
              <div className="avatar-stack">
                {selected.sharedWith.map((userId) => {
                  const person = users.find((user) => user.id === userId) ?? users[0];
                  return <Avatar key={userId} name={person.name} size={28} ring="var(--bg)" />;
                })}
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="Selection vide" body="Selectionnez un fichier pour voir le detail." />
        )}
      </aside>
      */}

      {isFolderModalOpen ? (
        <div
          className="files-folder-overlay"
          role="presentation"
          onClick={closeFolderModal}
        >
          <form
            className="files-folder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-create-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveFolder}
          >
            <header>
              <div>
                <h2 id="folder-create-title">{folderModalTitle}</h2>
                <p>Dans {currentFolder?.name ?? "Acredi Space"}</p>
              </div>
              <button
                className="files-folder-close"
                type="button"
                aria-label="Fermer"
                onClick={closeFolderModal}
                disabled={isFolderSaving}
              >
                <Icon name="x" size={15} />
              </button>
            </header>

            <label className="files-folder-field" htmlFor="folder-name">
              <span>Nom du dossier</span>
              <input
                id="folder-name"
                autoFocus
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="Ex: Contrats"
                disabled={isFolderSaving}
              />
            </label>

            {createFolderMutation.isError || updateFolderMutation.isError ? (
              <p className="files-folder-error">
                {createFolderMutation.error instanceof Error
                  ? createFolderMutation.error.message
                  : updateFolderMutation.error instanceof Error
                    ? updateFolderMutation.error.message
                    : editingFolder
                      ? "Impossible de modifier le dossier."
                      : "Impossible de creer le dossier."}
              </p>
            ) : null}

            <footer>
              <button
                className="files-modal-secondary"
                type="button"
                onClick={closeFolderModal}
                disabled={isFolderSaving}
              >
                Annuler
              </button>
              <button
                className="files-modal-primary"
                type="submit"
                disabled={!folderName.trim() || isFolderSaving}
              >
                {isFolderSaving ? folderSavingLabel : folderSubmitLabel}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}
