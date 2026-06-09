import { useParams } from 'react-router-dom';
import { JitsiMeeting } from "@jitsi/react-sdk";

export function MeetingRoom() {
  const { roomName } = useParams<{ roomName: string }>();

  if (!roomName) {
    return <div className="p-4">Room not found</div>;
  }

  return (
    <JitsiMeeting
      domain="meet.jit.si"
      roomName={roomName}
      getIFrameRef={(iframe) => {
        iframe.style.height = "100vh";
        iframe.style.width = "100%";
      }}
    />
  );
}
