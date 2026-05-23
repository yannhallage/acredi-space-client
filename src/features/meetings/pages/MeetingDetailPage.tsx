import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function MeetingDetailPage() {
  const { meetingId } = useParams()
  return <ModulePlaceholder title="Detail reunion" description={`Participants et informations de la reunion ${meetingId ?? ''}.`} />
}
