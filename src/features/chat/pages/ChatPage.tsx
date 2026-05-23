import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function ChatPage({ mode = 'home' }: { mode?: 'home' | 'channel' | 'direct' }) {
  const params = useParams()

  if (mode === 'channel') {
    return <ModulePlaceholder title="Canal" description={`Messages temps reel du canal ${params.channelId ?? ''}.`} />
  }

  if (mode === 'direct') {
    return <ModulePlaceholder title="Message direct" description={`Conversation privee avec ${params.userId ?? ''}.`} />
  }

  return <ModulePlaceholder title="Messages" description="Canaux, messages directs, mentions et fichiers partages." />
}
