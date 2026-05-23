import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function CreateMeetingDialog() {
  return <ScaffoldPanel name="CreateMeetingDialog" description="Creation reunion immediate, planifiee ou recurrente." />
}

export function MeetingParticipantsPanel() {
  return <ScaffoldPanel name="MeetingParticipantsPanel" description="Participants, invitation et presence." />
}

export function MeetingChatPanel() {
  return <ScaffoldPanel name="MeetingChatPanel" description="Chat temps reel rattache a la reunion." />
}

export function RecordingList() {
  return <ScaffoldPanel name="RecordingList" description="Enregistrements sauvegardes dans MinIO." />
}
