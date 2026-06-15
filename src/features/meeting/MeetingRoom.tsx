import { useParams } from 'react-router-dom';
import { JitsiMeeting } from "@jitsi/react-sdk";
import { PERMISSIONS, usePermissions, type PermissionCode } from '../../shared/permissions';
import { AccessDeniedState, LoadingState } from '../../shared/ui';

const MEETING_ROOM_PERMISSIONS = [
  PERMISSIONS.JOIN_MEETING,
  PERMISSIONS.USE_VIDEOCONFERENCE,
] as const satisfies readonly PermissionCode[];

export function MeetingRoom() {
  const { roomName } = useParams<{ roomName: string }>();
  const { hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return (
      <div className="meeting-room-page meeting-room-state">
        <LoadingState label="Verification des droits..." />
      </div>
    );
  }

  if (!hasAnyPermission(MEETING_ROOM_PERMISSIONS)) {
    return (
      <div className="meeting-room-page meeting-room-state">
        <AccessDeniedState body="Vous n'avez pas les droits necessaires pour rejoindre cette reunion." />
      </div>
    );
  }

  if (!roomName) {
    return (
      <div className="meeting-room-page meeting-room-state">
        <AccessDeniedState title="Salle introuvable" body="Le lien de reunion est invalide." />
      </div>
    );
  }

  return (
    <main className="meeting-room-page" aria-label="Salle de reunion">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        getIFrameRef={(iframe) => {
          iframe.style.height = "100%";
          iframe.style.width = "100%";
          iframe.style.border = "0";
        }}
      />
    </main>
  );
}
