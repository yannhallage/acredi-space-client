import { createBrowserRouter, Navigate } from 'react-router-dom'
import { WorkspaceLayout } from '../layouts/WorkspaceLayout'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { FilesListPage } from '../../features/files/pages/FilesListPage'
import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/files" replace />,
  },
  {
    path: '/app',
    element: <WorkspaceLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/files" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'files',
        element: <FilesListPage />,
      },
      {
        path: 'notifications',
        element: (
          <ModulePlaceholder
            title="Notifications"
            description="Centre temps reel pour fichiers, mentions, invitations et rappels."
          />
        ),
      },
      {
        path: 'chat',
        element: <ModulePlaceholder title="Messages" description="Canaux, messages directs et chat de reunion." />,
      },
      {
        path: 'meetings',
        element: (
          <ModulePlaceholder
            title="Reunions"
            description="Creation, planification, Jitsi Meet, participants et enregistrements."
          />
        ),
      },
      {
        path: 'calendar',
        element: <ModulePlaceholder title="Calendrier" description="Vue planning des reunions et rappels." />,
      },
      {
        path: 'teams',
        element: <ModulePlaceholder title="Equipes" description="Membres, dossiers partages et canaux par equipe." />,
      },
      {
        path: 'settings',
        element: <ModulePlaceholder title="Parametres" description="Profil, preferences et securite du compte." />,
      },
    ],
  },
  {
    path: '/admin',
    element: <WorkspaceLayout />,
    children: [
      {
        index: true,
        element: (
          <ModulePlaceholder
            title="Administration"
            description="Gestion des utilisateurs, roles, equipes et configuration plateforme."
          />
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ModulePlaceholder
            title="Audit"
            description="Journalisation des acces fichiers, partages, connexions et actions sensibles."
          />
        ),
      },
    ],
  },
])
