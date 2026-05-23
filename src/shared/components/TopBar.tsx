import { Columns3, Filter, List, MoreHorizontal, Plus, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const routeTitles: Array<[string, string]> = [
  ['/admin', 'Administration'],
  ['/app/dashboard', 'Dashboard'],
  ['/app/files', 'Fichiers'],
  ['/app/chat', 'Messages'],
  ['/app/meetings', 'Reunions'],
  ['/app/teams', 'Equipes'],
  ['/app/notifications', 'Notifications'],
  ['/app/profile', 'Profil'],
  ['/app/settings', 'Parametres'],
  ['/app/search', 'Recherche'],
]

export function TopBar() {
  const location = useLocation()
  const title = routeTitles.find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Espace'

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Espace</span>
        <span>/</span>
        <strong>{title}</strong>
        <button className="view-switch" type="button">
          <List size={18} />
          Liste
        </button>
      </div>

      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Actualiser">
          <RefreshCw size={17} />
        </button>
        <button className="soft-button" type="button">
          <Filter size={17} />
          Filtrer
        </button>
        <button className="soft-button" type="button">
          <SlidersHorizontal size={17} />
          Trier
        </button>
        <button className="soft-button" type="button">
          <Columns3 size={17} />
          Colonnes
        </button>
        <button className="icon-button" type="button" aria-label="Plus d'actions">
          <MoreHorizontal size={18} />
        </button>
        <button className="create-button" type="button">
          <Plus size={18} />
          Creer
        </button>
      </div>
    </header>
  )
}
