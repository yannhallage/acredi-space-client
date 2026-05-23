import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function MeetingRoomPage() {
  const { meetingId } = useParams()
  return <ModulePlaceholder title="Salle Jitsi" description={`Integration Jitsi securisee pour la reunion ${meetingId ?? ''}.`} />
}
