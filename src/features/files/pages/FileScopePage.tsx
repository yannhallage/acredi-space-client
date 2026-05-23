import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

const labels = {
  personal: ['Fichiers personnels', 'Documents prives et brouillons rattaches a votre compte.'],
  team: ['Fichiers equipe', 'Dossier partage automatiquement avec les membres de cette equipe.'],
  shared: ['Partages avec moi', 'Fichiers partages manuellement avec votre compte.'],
  recent: ['Fichiers recents', 'Derniers documents consultes, modifies ou ajoutes.'],
  trash: ['Corbeille', 'Fichiers supprimes en attente de restauration ou suppression definitive.'],
} as const

export function FileScopePage({ scope }: { scope: keyof typeof labels }) {
  const [title, description] = labels[scope]
  return <ModulePlaceholder title={title} description={description} />
}
