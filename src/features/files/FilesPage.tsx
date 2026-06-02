import { useMemo, useState } from 'react';
import { mockApi, }from '../../shared/api/mockApi';
  import {useMockQuery } from '../../shared/api/useMockQuery';
import { users } from '../../shared/api/mockData';
import { PERMISSIONS, PermissionGate } from '../../shared/permissions';
import type { FileItem } from '../../shared/types';
import { Avatar, EmptyState, FileIcon, Icon, LoadingState } from '../../shared/ui';

type ViewMode = 'grid' | 'list';

function fileAuthor(file: FileItem) {
  return users.find((user) => user.id === file.authorId) ?? users[0];
}

export function FilesPage() {
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedId, setSelectedId] = useState('f-brief');
  const { data, loading } = useMockQuery(mockApi.getFiles, 'files');

  const selected = useMemo(() => data?.files.find((file) => file.id === selectedId) ?? data?.files[0], [data, selectedId]);

  if (loading || !data) {
    return <LoadingState label="Chargement des fichiers..." />;
  }

  if (data.files.length === 0) {
    return <EmptyState title="Aucun fichier" body="Importez un document pour commencer cet espace." />;
  }

  return (
    <div className="files-page">
      <section className="files-explorer">
        <div className="breadcrumb">
          <span>Mes fichiers</span>
          <Icon name="chevRight" size={12} />
          <span>Acredi Space</span>
          <Icon name="chevRight" size={12} />
          <strong>01 - Identite visuelle</strong>
        </div>

        <header className="page-header compact">
          <div>
            <h1>01 - Identite visuelle</h1>
            <p>{data.files.length} fichiers - {data.folders.length} dossiers - partage avec 8 personnes</p>
          </div>
          <div className="button-row">
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
          </div>
        </header>

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

        <p className="section-label">Dossiers</p>
        <div className="folder-grid">
          {data.folders.map((folder) => (
            <article key={folder.id} className="folder-card">
              <span style={{ color: folder.color, background: `${folder.color}22` }}>
                <Icon name="folder" size={18} />
              </span>
              <div>
                <strong>{folder.name}</strong>
                <small>{folder.count} fichiers</small>
              </div>
            </article>
          ))}
        </div>

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
      </section>

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
    </div>
  );
}
