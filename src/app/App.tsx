import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AdminPage } from '../features/admin/AdminPage';
import { LoginPage } from '../features/auth/LoginPage';
import { PasswordChangePage } from '../features/auth/PasswordChangePage';
import { ProfileCompletionPage } from '../features/auth/ProfileCompletionPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { ChatPage } from '../features/chat/ChatPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DirectMessagesPage } from '../features/dm/DirectMessagesPage';
import { FolderFilesPage } from '../features/files/FolderFilesPage';
import { FilesPage } from '../features/files/FilesPage';
import { MeetingPage } from '../features/meeting/MeetingPage';
import { NotesPage } from '../features/notes/NotesPage';
import { PreviewPage } from '../features/preview/PreviewPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { MyTeamsPage } from '../features/teams/MyTeamsPage';
import { TeamsPage } from '../features/teams/TeamsPage';
import { UserDetailPage } from '../features/users/UserDetailPage';
import { UsersPage } from '../features/users/UsersPage';
import { OtpPage } from '../features/OtpPage/OtpPage';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthProvider, WorkspaceProvider } from '../shared/context';
import { NotificationSocketBridge } from '../shared/notifications/NotificationSocketBridge';
import { getDefaultAllowedAppPath, usePermissions } from '../shared/permissions';
import { ThemeProvider } from '../shared/theme';
import { ProtectedRoute } from './ProtectedRoute';
import { CreateTeamPage } from "../features/teams/CreateTeamPage";
// import { InviteSetupPage } from './features/users/InviteSetupPage';

function DefaultAppRoute() {
  const { permissionCodes } = usePermissions();
  const defaultAllowedPath = getDefaultAllowedAppPath(permissionCodes);

  return <Navigate to={defaultAllowedPath ?? '/app/dashboard'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Router>
            <NotificationSocketBridge />
            <Routes>
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-otp" element={<OtpPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding/password-change" element={<PasswordChangePage />} />
                  <Route path="/onboarding/profile-completion" element={<ProfileCompletionPage />} />
                </Route>
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DefaultAppRoute />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="files/:folderId" element={<FolderFilesPage />} />
                  <Route path="chat" element={<Navigate to="/app/chat/general" replace />} />
                  <Route path="chat/:channelId" element={<ChatPage />} />
                  <Route path="dm" element={<Navigate to="/app/dm/dm-yann" replace />} />
                  <Route path="dm/:conversationId" element={<DirectMessagesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="meeting" element={<Navigate to="/app/meeting/meet-daily" replace />} />
                  <Route path="meeting/:meetingId" element={<MeetingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="my-team" element={<MyTeamsPage />} />
                  <Route path="teams" element={<TeamsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/:userId" element={<UserDetailPage />} />
                  <Route path="notes" element={<NotesPage />} />
                  <Route path="/app/teams/create" element={<CreateTeamPage />} />
                </Route>
              </Route>
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
