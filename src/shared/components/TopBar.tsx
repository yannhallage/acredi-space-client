import { Columns3, Filter, List, MoreHorizontal, Plus, RefreshCw, SlidersHorizontal } from 'lucide-react'

export function TopBar() {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Espace</span>
        <span>/</span>
        <strong>Fichiers</strong>
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
