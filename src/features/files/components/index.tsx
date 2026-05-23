import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function FolderTree() {
  return <ScaffoldPanel name="FolderTree" description="Navigation dossiers et sous-dossiers." />
}

export function FileToolbar() {
  return <ScaffoldPanel name="FileToolbar" description="Actions fichier, filtre, tri, colonnes et upload." />
}

export function FileGrid() {
  return <ScaffoldPanel name="FileGrid" description="Vue grille des documents et dossiers." />
}

export function FileTable() {
  return <ScaffoldPanel name="FileTable" description="Vue liste dense des fichiers autorises." />
}

export function FilePreviewPanel() {
  return <ScaffoldPanel name="FilePreviewPanel" description="Apercu PDF, image et metadata." />
}

export function UploadDropzone() {
  return <ScaffoldPanel name="UploadDropzone" description="Depot drag and drop multi-fichiers." />
}

export function UploadProgressList() {
  return <ScaffoldPanel name="UploadProgressList" description="Progression, erreurs et reprise upload." />
}

export function MoveFileDialog() {
  return <ScaffoldPanel name="MoveFileDialog" description="Deplacement vers un dossier cible." />
}

export function RenameFileDialog() {
  return <ScaffoldPanel name="RenameFileDialog" description="Renommage controle cote API." />
}

export function FileVersionDrawer() {
  return <ScaffoldPanel name="FileVersionDrawer" description="Historique des versions et restauration." />
}

export function FileAccessPanel() {
  return <ScaffoldPanel name="FileAccessPanel" description="Lecture, edition et administration fichier." />
}

export function BatchDownloadButton() {
  return <ScaffoldPanel name="BatchDownloadButton" description="Telechargement ZIP des fichiers selectionnes." />
}
