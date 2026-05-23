import {
  Bell,
  CalendarDays,
  FileText,
  FolderKanban,
  Gauge,
  MessageSquareText,
  Settings,
  ShieldCheck,
  UsersRound,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Notifications', href: '/app/notifications', icon: Bell },
  { label: 'Dashboard', href: '/app/dashboard', icon: Gauge },
  { label: 'Fichiers', href: '/app/files', icon: FolderKanban },
  { label: 'Messages', href: '/app/chat', icon: MessageSquareText },
  { label: 'Reunions', href: '/app/meetings', icon: Video },
  { label: 'Calendrier', href: '/app/calendar', icon: CalendarDays },
  { label: 'Equipes', href: '/app/teams', icon: UsersRound },
  { label: 'Audit', href: '/admin/audit-logs', icon: FileText },
  { label: 'Administration', href: '/admin', icon: ShieldCheck },
]

export const utilityNavigation: NavigationItem[] = [
  { label: 'Parametres', href: '/app/settings', icon: Settings },
]
