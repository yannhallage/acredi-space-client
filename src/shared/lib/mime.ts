export function isPreviewableMimeType(mimeType: string) {
  return mimeType.startsWith('image/') || mimeType === 'application/pdf'
}

export function getFileExtension(name: string) {
  const extension = name.split('.').pop()
  return extension ? extension.toLowerCase() : ''
}
