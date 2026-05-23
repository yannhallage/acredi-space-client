import { filesApi } from '../api/filesApi'

export interface UploadFileOptions {
  file: File
  folderId?: string
  teamId?: string
  onProgress?: (progress: number) => void
}

export async function uploadFile({ file, folderId, teamId, onProgress }: UploadFileOptions) {
  const intent = await filesApi.createUploadIntent({
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    folderId,
    teamId,
  })

  await fetch(intent.uploadUrl, {
    method: 'PUT',
    body: file,
  })

  onProgress?.(100)

  return filesApi.completeUpload(intent.uploadId, intent.uploadId)
}
