import type { FileAccessRule, FileItem, FileVersion } from '../../entities/file/file.types'
import type { ApiCollection } from '../../shared/types/api'
import type { SearchParams } from '../../shared/types/pagination'
import { apiRequest } from './httpClient'

export interface UploadIntentRequest {
  name: string
  mimeType: string
  size: number
  folderId?: string
  teamId?: string
}

export interface UploadIntentResponse {
  uploadId: string
  uploadUrl: string
}

export const filesApi = {
  list: (params: SearchParams = {}) => apiRequest<ApiCollection<FileItem>>(`/files?${new URLSearchParams(params as Record<string, string>)}`),
  get: (id: string) => apiRequest<FileItem>(`/files/${id}`),
  createUploadIntent: (payload: UploadIntentRequest) =>
    apiRequest<UploadIntentResponse>('/files/upload-intent', { method: 'POST', body: payload }),
  completeUpload: (fileId: string, uploadId: string) =>
    apiRequest<FileItem>(`/files/${fileId}/complete-upload`, { method: 'POST', body: { uploadId } }),
  download: (id: string) => apiRequest<{ url: string }>(`/files/${id}/download`),
  batchDownload: (ids: string[]) => apiRequest<{ url: string }>('/files/batch-download', { method: 'POST', body: { ids } }),
  update: (id: string, payload: Partial<FileItem>) => apiRequest<FileItem>(`/files/${id}`, { method: 'PATCH', body: payload }),
  remove: (id: string) => apiRequest<void>(`/files/${id}`, { method: 'DELETE' }),
  versions: (id: string) => apiRequest<FileVersion[]>(`/files/${id}/versions`),
  permissions: (id: string) => apiRequest<FileAccessRule[]>(`/files/${id}/permissions`),
}
