import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function MeetingsPage({ view = 'list' }: { view?: 'list' | 'calendar' | 'new' }) {
  const content = {
    list: ['Reunions', 'Liste des reunions planifiees et invitations recues.'],
    calendar: ['Calendrier', 'Vue calendrier des reunions recurrentes et ponctuelles.'],
    new: ['Nouvelle reunion', 'Creation de reunion immediate ou planifiee avec participants.'],
  } as const

  const [title, description] = content[view]
  return <ModulePlaceholder title={title} description={description} />
}
