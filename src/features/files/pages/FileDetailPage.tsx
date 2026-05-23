import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function FileDetailPage() {
  const { fileId } = useParams()

  return (
    <ModulePlaceholder
      title="Detail fichier"
      description={`Apercu, metadata, droits et actions du fichier ${fileId ?? ''}.`}
    />
  )
}
