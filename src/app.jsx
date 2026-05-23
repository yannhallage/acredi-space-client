import { ThemeProvider, useTheme, getPalette } from './components/theme.jsx';
import { DesignCanvas, DCSection, DCArtboard } from './components/design-canvas.jsx';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './components/mark.jsx';
import './components/app-shell.jsx';
import './components/screen-login.jsx';
import './components/screen-dashboard.jsx';
import './components/screen-chat.jsx';
import './components/screen-meeting.jsx';
import './components/screen-files.jsx';
import './components/screen-dm.jsx';
import './components/screen-calendar.jsx';
import './components/screen-profile.jsx';
import './components/screen-admin.jsx';
import './components/screen-notifications.jsx';

const ScreenLogin = window.ScreenLogin;
const ScreenDashboard = window.ScreenDashboard;
const ScreenChat = window.ScreenChat;
const ScreenMeeting = window.ScreenMeeting;
const ScreenFiles = window.ScreenFiles;
const ScreenDM = window.ScreenDM;
const ScreenCalendar = window.ScreenCalendar;
const ScreenProfile = window.ScreenProfile;
const ScreenAdmin = window.ScreenAdmin;
const ScreenNotifications = window.ScreenNotifications;

// Main composition — 10 UI screens inside a DesignCanvas + global theme toggle.

function ThemeToolbar() {
  const { dark, setDark } = useTheme();
  const P = getPalette(dark);
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100,
      background: '#1a1815', color: '#eee5d5',
      border: '1px solid #2a2620',
      borderRadius: 99, padding: 6,
      display: 'flex', alignItems: 'center', gap: 4,
      boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 12, letterSpacing: '-0.005em',
    }}>
      <span style={{ padding: '0 12px 0 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a39a8a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>thème</span>
      <button onClick={() => setDark(true)} style={{
        background: dark ? '#5B6CFF' : 'transparent',
        color: dark ? '#fff' : '#eee5d5',
        border: 'none', borderRadius: 99,
        padding: '6px 14px', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        Sombre
      </button>
      <button onClick={() => setDark(false)} style={{
        background: !dark ? '#5B6CFF' : 'transparent',
        color: !dark ? '#fff' : '#eee5d5',
        border: 'none', borderRadius: 99,
        padding: '6px 14px', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        Clair
      </button>
    </div>
  );
}

function PreviewCanvas() {
  return (
    <DesignCanvas>
      <DCSection
        id="core"
        title="Écrans principaux"
        subtitle="Login · Dashboard · Chat de canal · Salle de réunion"
      >
        <DCArtboard id="login"     label="01 · Login"                  width={1200} height={800}><ScreenLogin /></DCArtboard>
        <DCArtboard id="dashboard" label="02 · Dashboard"              width={1440} height={900}><ScreenDashboard /></DCArtboard>
        <DCArtboard id="chat"      label="04 · Chat / canal d'équipe"  width={1440} height={900}><ScreenChat /></DCArtboard>
        <DCArtboard id="meeting"   label="07 · Salle de réunion vidéo" width={1440} height={900}><ScreenMeeting /></DCArtboard>
      </DCSection>

      <DCSection
        id="collab"
        title="Collaboration & contenu"
        subtitle="Explorateur de fichiers · Messagerie directe · Calendrier"
      >
        <DCArtboard id="files"     label="03 · Explorateur de fichiers" width={1440} height={900}><ScreenFiles /></DCArtboard>
        <DCArtboard id="dm"        label="05 · Messagerie directe"      width={1440} height={900}><ScreenDM /></DCArtboard>
        <DCArtboard id="calendar"  label="06 · Calendrier"              width={1440} height={900}><ScreenCalendar /></DCArtboard>
      </DCSection>

      <DCSection
        id="account"
        title="Compte & administration"
        subtitle="Profil · Administration · Centre de notifications"
      >
        <DCArtboard id="profile"        label="08 · Profil utilisateur"        width={1440} height={900}><ScreenProfile /></DCArtboard>
        <DCArtboard id="admin"          label="09 · Paramètres administrateur" width={1440} height={900}><ScreenAdmin /></DCArtboard>
        <DCArtboard id="notifications"  label="10 · Centre de notifications"   width={1440} height={900}><ScreenNotifications /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeToolbar />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/preview" replace />} />
          <Route path="/preview" element={<PreviewCanvas />} />
          <Route path="/login" element={<ScreenLogin />} />
          <Route path="/dashboard" element={<ScreenDashboard />} />
          <Route path="/chat" element={<ScreenChat />} />
          <Route path="/meeting" element={<ScreenMeeting />} />
          <Route path="/files" element={<ScreenFiles />} />
          <Route path="/dm" element={<ScreenDM />} />
          <Route path="/calendar" element={<ScreenCalendar />} />
          <Route path="/profile" element={<ScreenProfile />} />
          <Route path="/admin" element={<ScreenAdmin />} />
          <Route path="/notifications" element={<ScreenNotifications />} />
          <Route path="*" element={<Navigate to="/preview" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
