import { filesApi } from '../api/filesApi'

export async function resolveDownloadUrl(fileId: string) {
  const response = await filesApi.download(fileId)
  return response.url
}

export async function resolveBatchDownloadUrl(fileIds: string[]) {
  const response = await filesApi.batchDownload(fileIds)
  return response.url
}
