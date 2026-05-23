import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function MeetingRecordingsPage() {
  const { meetingId } = useParams()
  return <ModulePlaceholder title="Enregistrements" description={`Enregistrements sauvegardes de la reunion ${meetingId ?? ''}.`} />
}
