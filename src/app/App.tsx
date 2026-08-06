import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AdminPage } from '../features/admin/AdminPage';
import { LoginPage } from '../features/auth/LoginPage';
import { PasswordChangePage } from '../features/auth/PasswordChangePage';
import { ProfileCompletionPage } from '../features/auth/ProfileCompletionPage';
import { ForgotPasswordPage } from "../features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/ResetPasswordPage";
import { CalendarPage } from '../features/calendar/CalendarPage';
import { ChatPage } from '../features/chat/ChatPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DirectMessagesPage } from '../features/dm/DirectMessagesPage';
import { FolderFilesPage } from '../features/files/FolderFilesPage';
import { FilesPage } from '../features/files/FilesPage';
import { SharedFilesPage } from '../features/shared-files/SharedFilesPage';
import { TrashFilesPage } from '../features/trash/TrashFilesPage';
import MeetingPage from '../features/meeting/MeetingPage';
import { MeetingRoom } from '../features/meeting/MeetingRoom';
import { MailPage } from '../features/mail/MailPage';
import { NotesPage } from '../features/notes/NotesPage';
import { PreviewPage } from '../features/preview/PreviewPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { ChangePasswordPage } from '../features/settings/ChangePasswordPage';
import { PlansPage } from '../features/settings/PlansPage';
import { MyTeamsPage } from '../features/teams/MyTeamsPage';
import { TeamsPage } from '../features/teams/TeamsPage';
import { CreateTeamPage } from "../features/teams/CreateTeamPage";
import { UserDetailPage } from '../features/users/UserDetailPage';
import { UsersPage } from '../features/users/UsersPage';
import { OtpPage } from '../features/otp/OtpPage';
import { SignupOrganizationPage } from '../features/signup/SignupOrganizationPage';
import { SignupPage } from '../features/signup/SignupPage';
import { SignupSuccessPage } from '../features/signup/SignupSuccessPage';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthProvider, WorkspaceProvider } from '../shared/context';
import { NotificationSocketBridge } from '../shared/notifications/NotificationSocketBridge';
import { PresenceSocketBridge } from '../shared/presence/PresenceSocketBridge';
import { getDefaultAllowedAppPath, usePermissions } from '../shared/permissions';
import { ThemeProvider } from '../shared/theme';
import { ProtectedRoute } from './ProtectedRoute';

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
            <PresenceSocketBridge />

            <Routes>
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-otp" element={<OtpPage />} />

                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding/password-change" element={<PasswordChangePage />} />
                  <Route path="/onboarding/profile-completion" element={<ProfileCompletionPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/signup/organization" element={<SignupOrganizationPage />} />
                <Route path="/signup/success" element={<SignupSuccessPage />} />
                <Route path="/settings/password" element={<ChangePasswordPage />} />
                <Route path="/settings/plans" element={<PlansPage />} />
                <Route path="/app/meeting-room/:roomName" element={<MeetingRoom />} />
                <Route path="/app/mail" element={<MailPage />} />

                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DefaultAppRoute />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="files" element={<FilesPage />} />
                  <Route path="files/shared" element={<Navigate to="/app/shared-files" replace />} />
                  <Route path="files/trash" element={<Navigate to="/app/trash" replace />} />
                  <Route path="files/:folderId" element={<FolderFilesPage />} />
                  <Route path="shared-files" element={<SharedFilesPage />} />
                  <Route path="trash" element={<TrashFilesPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="chat/:channelId" element={<ChatPage />} />
                  <Route path="dm" element={<DirectMessagesPage />} />
                  <Route path="dm/:conversationId" element={<DirectMessagesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="meeting" element={<Navigate to="/app/meeting/meet-daily" replace />} />
                  <Route path="meeting/:meetingId" element={<MeetingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="admin" element={<AdminPage />} />
                  <Route path="my-team" element={<MyTeamsPage />} />
                  <Route path="teams/create" element={<CreateTeamPage />} />
                  <Route path="teams" element={<TeamsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/:userId" element={<UserDetailPage />} />
                  <Route path="notes" element={<NotesPage />} />
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
