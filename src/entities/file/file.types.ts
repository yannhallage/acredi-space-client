export type FileVisibility = 'PRIVATE' | 'TEAM' | 'SPECIFIC'
export type FilePermission = 'READ' | 'EDIT' | 'ADMIN'
export type FileStatus = 'Prive' | 'Equipe' | 'Partage'
export type FileKind = 'PDF' | 'DOCX' | 'XLSX' | 'Image' | 'ZIP'
export type FilePermissionLabel = 'Lecture' | 'Edition' | 'Administration'

export interface FileItem {
  id: string
  name: string
  mimeType: string
  size: number
  ownerId: string
  teamId?: string
  folderId?: string
  visibility: FileVisibility
  permission: FilePermission
  version: number
  createdAt: string
  updatedAt: string
}

export interface FileVersion {
  id: string
  fileId: string
  version: number
  size: number
  createdBy: string
  createdAt: string
}

export interface FileAccessRule {
  id: string
  fileId: string
  userId?: string
  teamId?: string
  permission: FilePermission
}

export interface FileRow {
  id: string
  name: string
  owner: string
  team: string
  kind: FileKind
  size: string
  status: FileStatus
  permission: FilePermissionLabel
  updatedAt: string
}
