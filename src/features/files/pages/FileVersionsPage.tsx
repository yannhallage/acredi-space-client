import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function FileVersionsPage() {
  const { fileId } = useParams()

  return (
    <ModulePlaceholder
      title="Versions fichier"
      description={`Historique des versions, restauration et remplacement du fichier ${fileId ?? ''}.`}
    />
  )
}
