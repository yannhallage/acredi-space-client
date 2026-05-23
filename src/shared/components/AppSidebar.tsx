import { ChevronDown, CircleHelp, ChevronsRight, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@rtcamp/frappe-ui-react'
import { primaryNavigation, utilityNavigation } from '../../app/config/navigation'
import { LogoMark } from './LogoMark'
import { cn } from '../lib/cn'

export function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <LogoMark />
        <div className="brand-copy">
          <strong>Acredi Space</strong>
          <span>yann hallage</span>
        </div>
        <button className="icon-button ghost ml-auto" type="button" aria-label="Changer d'espace">
          <ChevronDown size={16} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        {primaryNavigation.map((item) => (
          <NavLink
            className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
            key={item.label}
            to={item.href}
          >
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <section className="sidebar-card">
        <div className="sidebar-card-title">
          <CircleHelp size={17} />
          <strong>Initialisation</strong>
        </div>
        <p>5/9 modules prepares pour l'intranet collaboratif</p>
        <Button className="sidebar-card-action" label="Continuer" theme="blue" variant="subtle" size="md" />
      </section>

      <section className="sidebar-card">
        <div className="sidebar-card-title">
          <ChevronsRight size={17} />
          <strong>Prochaine phase</strong>
        </div>
        <p>Brancher les endpoints Spring Boot et WebSocket.</p>
        <Button className="sidebar-card-action" label="Voir le backlog" theme="gray" variant="subtle" size="md" />
      </section>

      <nav className="sidebar-nav compact" aria-label="Navigation secondaire">
        {utilityNavigation.map((item) => (
          <NavLink className="sidebar-link" key={item.label} to={item.href}>
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button className="sidebar-link danger" type="button">
          <LogOut size={18} strokeWidth={1.8} />
          <span>Deconnexion</span>
        </button>
      </nav>
    </aside>
  )
}
