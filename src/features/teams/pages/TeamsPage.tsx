import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function TeamsPage({ view = 'list' }: { view?: 'list' | 'detail' | 'members' | 'channels' }) {
  const params = useParams()
  const teamLabel = params.teamId ? ` ${params.teamId}` : ''

  const content = {
    list: ['Equipes', 'Gestion des equipes, membres et managers.'],
    detail: ['Detail equipe', `Dossiers, membres et activite de l'equipe${teamLabel}.`],
    members: ['Membres equipe', `Gestion des membres de l'equipe${teamLabel}.`],
    channels: ['Canaux equipe', `Canaux de discussion de l'equipe${teamLabel}.`],
  } as const

  const [title, description] = content[view]
  return <ModulePlaceholder title={title} description={description} />
}
