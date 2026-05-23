import { Avatar, Badge, TextInput } from '@rtcamp/frappe-ui-react'
import {
  Archive,
  Check,
  Download,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FolderOpen,
  MoreHorizontal,
  Phone,
  UploadCloud,
  UsersRound,
} from 'lucide-react'
import { fileRows } from '../data/files.mock'
import type { FileKind, FileStatus } from '../../../entities/file/file.types'
import { useFilesQuery } from '../hooks/useFilesQuery'

const fileIcons: Record<FileKind, typeof FileText> = {
  PDF: FileText,
  DOCX: FileType,
  XLSX: FileSpreadsheet,
  Image: FileImage,
  ZIP: FileArchive,
}

const statusTheme: Record<FileStatus, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
  Prive: 'gray',
  Equipe: 'blue',
  Partage: 'green',
}

export function FilesListPage() {
  const { data = fileRows } = useFilesQuery()

  return (
    <section className="page-surface">
      <div className="filter-row">
        <TextInput className="filter-input" placeholder="Nom du fichier" size="md" variant="subtle" />
        <TextInput className="filter-input" placeholder="Proprietaire" size="md" variant="subtle" />
        <TextInput className="filter-input" placeholder="Equipe" size="md" variant="subtle" />
        <TextInput className="filter-input small" placeholder="Statut" size="md" variant="subtle" />
        <TextInput className="filter-input small" placeholder="Permission" size="md" variant="subtle" />
      </div>

      <div className="metrics-row">
        <div className="metric-chip">
          <FolderOpen size={17} />
          <strong>128</strong>
          <span>fichiers actifs</span>
        </div>
        <div className="metric-chip">
          <UsersRound size={17} />
          <strong>8</strong>
          <span>equipes</span>
        </div>
        <div className="metric-chip">
          <Archive size={17} />
          <strong>46 GB</strong>
          <span>stockage utilise</span>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input type="checkbox" aria-label="Tout selectionner" />
              </th>
              <th>Nom</th>
              <th>Equipe</th>
              <th>Statut</th>
              <th>Permission</th>
              <th>Type</th>
              <th>Taille</th>
              <th>Proprietaire</th>
              <th>Derniere modification</th>
              <th className="actions-cell" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {data.map((file) => {
              const Icon = fileIcons[file.kind]

              return (
                <tr key={file.id}>
                  <td className="checkbox-cell">
                    <input type="checkbox" aria-label={`Selectionner ${file.name}`} />
                  </td>
                  <td>
                    <div className="file-name">
                      <span className="file-icon">
                        <Icon size={17} />
                      </span>
                      <span>{file.name}</span>
                    </div>
                  </td>
                  <td>{file.team}</td>
                  <td>
                    <Badge label={file.status} theme={statusTheme[file.status]} variant="subtle" size="md" />
                  </td>
                  <td>
                    <span className="permission-pill">
                      <Check size={14} />
                      {file.permission}
                    </span>
                  </td>
                  <td>{file.kind}</td>
                  <td>{file.size}</td>
                  <td>
                    <div className="owner-cell">
                      <Avatar label={file.owner} size="sm" />
                      <span>{file.owner}</span>
                    </div>
                  </td>
                  <td>{file.updatedAt}</td>
                  <td className="actions-cell">
                    <button className="icon-button ghost" type="button" aria-label={`Telecharger ${file.name}`}>
                      <Download size={16} />
                    </button>
                    <button className="icon-button ghost" type="button" aria-label={`Actions ${file.name}`}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="page-footer">
        <div className="page-size">
          <button className="active" type="button">
            20
          </button>
          <button type="button">50</button>
          <button type="button">100</button>
        </div>

        <aside className="floating-panel">
          <div>
            <strong>Getting started</strong>
            <span>Architecture React initialisee</span>
          </div>
          <button className="upload-button" type="button">
            <UploadCloud size={17} />
            Uploader
          </button>
          <button className="icon-button ghost" type="button" aria-label="Support">
            <Phone size={16} />
          </button>
        </aside>
      </div>
    </section>
  )
}
