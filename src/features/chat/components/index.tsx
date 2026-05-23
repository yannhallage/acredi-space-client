import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function ChannelList() {
  return <ScaffoldPanel name="ChannelList" description="Canaux d'equipe et projet." />
}

export function DirectMessageList() {
  return <ScaffoldPanel name="DirectMessageList" description="Conversations directes utilisateur." />
}

export function MessageList() {
  return <ScaffoldPanel name="MessageList" description="Historique pagine et messages temps reel." />
}

export function MessageComposer() {
  return <ScaffoldPanel name="MessageComposer" description="Saisie, mentions, pieces jointes et envoi." />
}

export function ThreadPanel() {
  return <ScaffoldPanel name="ThreadPanel" description="Reponses organisees en fils de discussion." />
}

export function ReactionPicker() {
  return <ScaffoldPanel name="ReactionPicker" description="Reactions emoji sur messages." />
}
