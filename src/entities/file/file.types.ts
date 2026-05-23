export type FileStatus = 'Prive' | 'Equipe' | 'Partage'
export type FileKind = 'PDF' | 'DOCX' | 'XLSX' | 'Image' | 'ZIP'
export type FilePermission = 'Lecture' | 'Edition' | 'Administration'

export interface FileRow {
  id: string
  name: string
  owner: string
  team: string
  kind: FileKind
  size: string
  status: FileStatus
  permission: FilePermission
  updatedAt: string
}
