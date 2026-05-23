import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function TeamCardList() {
  return <ScaffoldPanel name="TeamCardList" description="Vue compacte des equipes accessibles." />
}

export function TeamMembersList() {
  return <ScaffoldPanel name="TeamMembersList" description="Membres, manager et presence." />
}

export function TeamChannelsList() {
  return <ScaffoldPanel name="TeamChannelsList" description="Canaux de discussion rattaches a l'equipe." />
}
