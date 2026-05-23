/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { WorkspaceLayout } from '../layouts/WorkspaceLayout'
import { AuthGuard } from './routeGuards'
import { Loader } from '../../shared/components/Loader'

const AdminAuditLogsPage = lazy(() =>
  import('../../features/admin/pages/AdminAuditLogsPage').then((module) => ({ default: module.AdminAuditLogsPage })),
)
const AdminDashboardPage = lazy(() =>
  import('../../features/admin/pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
)
const AdminFilesPage = lazy(() =>
  import('../../features/admin/pages/AdminFilesPage').then((module) => ({ default: module.AdminFilesPage })),
)
const AdminPlatformSettingsPage = lazy(() =>
  import('../../features/admin/pages/AdminPlatformSettingsPage').then((module) => ({
    default: module.AdminPlatformSettingsPage,
  })),
)
const AdminTeamsPage = lazy(() =>
  import('../../features/admin/pages/AdminTeamsPage').then((module) => ({ default: module.AdminTeamsPage })),
)
const AdminUsersPage = lazy(() =>
  import('../../features/admin/pages/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })),
)
const ChatPage = lazy(() => import('../../features/chat/pages/ChatPage').then((module) => ({ default: module.ChatPage })))
const DashboardPage = lazy(() =>
  import('../../features/dashboard/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const FileDetailPage = lazy(() =>
  import('../../features/files/pages/FileDetailPage').then((module) => ({ default: module.FileDetailPage })),
)
const FileScopePage = lazy(() =>
  import('../../features/files/pages/FileScopePage').then((module) => ({ default: module.FileScopePage })),
)
const FileVersionsPage = lazy(() =>
  import('../../features/files/pages/FileVersionsPage').then((module) => ({ default: module.FileVersionsPage })),
)
const FilesListPage = lazy(() =>
  import('../../features/files/pages/FilesListPage').then((module) => ({ default: module.FilesListPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('../../features/auth/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
)
const LoginPage = lazy(() =>
  import('../../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const MeetingDetailPage = lazy(() =>
  import('../../features/meetings/pages/MeetingDetailPage').then((module) => ({ default: module.MeetingDetailPage })),
)
const MeetingRecordingsPage = lazy(() =>
  import('../../features/meetings/pages/MeetingRecordingsPage').then((module) => ({
    default: module.MeetingRecordingsPage,
  })),
)
const MeetingRoomPage = lazy(() =>
  import('../../features/meetings/pages/MeetingRoomPage').then((module) => ({ default: module.MeetingRoomPage })),
)
const MeetingsPage = lazy(() =>
  import('../../features/meetings/pages/MeetingsPage').then((module) => ({ default: module.MeetingsPage })),
)
const NotificationsPage = lazy(() =>
  import('../../features/notifications/pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })),
)
const ProfilePage = lazy(() =>
  import('../../features/profile/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const ResetPasswordPage = lazy(() =>
  import('../../features/auth/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
)
const SearchPage = lazy(() =>
  import('../../features/search/pages/SearchPage').then((module) => ({ default: module.SearchPage })),
)
const SettingsPage = lazy(() =>
  import('../../features/profile/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)
const TeamsPage = lazy(() =>
  import('../../features/teams/pages/TeamsPage').then((module) => ({ default: module.TeamsPage })),
)

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<Loader />}>{page}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/files" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: lazyPage(<LoginPage />),
      },
      {
        path: '/forgot-password',
        element: lazyPage(<ForgotPasswordPage />),
      },
      {
        path: '/reset-password/:token',
        element: lazyPage(<ResetPasswordPage />),
      },
    ],
  },
  {
    path: '/app',
    element: (
      <AuthGuard>
        <WorkspaceLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/files" replace />,
      },
      {
        path: 'dashboard',
        element: lazyPage(<DashboardPage />),
      },
      {
        path: 'files',
        element: lazyPage(<FilesListPage />),
      },
      {
        path: 'files/personal',
        element: lazyPage(<FileScopePage scope="personal" />),
      },
      {
        path: 'files/team/:teamId',
        element: lazyPage(<FileScopePage scope="team" />),
      },
      {
        path: 'files/shared-with-me',
        element: lazyPage(<FileScopePage scope="shared" />),
      },
      {
        path: 'files/recent',
        element: lazyPage(<FileScopePage scope="recent" />),
      },
      {
        path: 'files/trash',
        element: lazyPage(<FileScopePage scope="trash" />),
      },
      {
        path: 'files/:fileId',
        element: lazyPage(<FileDetailPage />),
      },
      {
        path: 'files/:fileId/versions',
        element: lazyPage(<FileVersionsPage />),
      },
      {
        path: 'chat',
        element: lazyPage(<ChatPage />),
      },
      {
        path: 'chat/channels/:channelId',
        element: lazyPage(<ChatPage mode="channel" />),
      },
      {
        path: 'chat/direct/:userId',
        element: lazyPage(<ChatPage mode="direct" />),
      },
      {
        path: 'meetings',
        element: lazyPage(<MeetingsPage />),
      },
      {
        path: 'meetings/calendar',
        element: lazyPage(<MeetingsPage view="calendar" />),
      },
      {
        path: 'meetings/new',
        element: lazyPage(<MeetingsPage view="new" />),
      },
      {
        path: 'meetings/:meetingId',
        element: lazyPage(<MeetingDetailPage />),
      },
      {
        path: 'meetings/:meetingId/room',
        element: lazyPage(<MeetingRoomPage />),
      },
      {
        path: 'meetings/:meetingId/recordings',
        element: lazyPage(<MeetingRecordingsPage />),
      },
      {
        path: 'teams',
        element: lazyPage(<TeamsPage />),
      },
      {
        path: 'teams/:teamId',
        element: lazyPage(<TeamsPage view="detail" />),
      },
      {
        path: 'teams/:teamId/members',
        element: lazyPage(<TeamsPage view="members" />),
      },
      {
        path: 'teams/:teamId/channels',
        element: lazyPage(<TeamsPage view="channels" />),
      },
      {
        path: 'notifications',
        element: lazyPage(<NotificationsPage />),
      },
      {
        path: 'search',
        element: lazyPage(<SearchPage />),
      },
      {
        path: 'profile',
        element: lazyPage(<ProfilePage />),
      },
      {
        path: 'settings',
        element: lazyPage(<SettingsPage />),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: lazyPage(<AdminDashboardPage />),
      },
      {
        path: 'users',
        element: lazyPage(<AdminUsersPage />),
      },
      {
        path: 'users/:userId',
        element: lazyPage(<AdminUsersPage detail />),
      },
      {
        path: 'teams',
        element: lazyPage(<AdminTeamsPage />),
      },
      {
        path: 'files',
        element: lazyPage(<AdminFilesPage />),
      },
      {
        path: 'audit-logs',
        element: lazyPage(<AdminAuditLogsPage />),
      },
      {
        path: 'platform-settings',
        element: lazyPage(<AdminPlatformSettingsPage />),
      },
    ],
  },
])
