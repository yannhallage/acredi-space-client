import { useParams } from 'react-router-dom';
import { mockApi, useMockQuery } from '../../shared/api';
import { messages, users } from '../../shared/api/mockData';
import { Avatar, Icon, LoadingState } from '../../shared/ui';

export function MeetingPage() {
  const { meetingId = 'meet-daily' } = useParams();
  const { data, loading } = useMockQuery(mockApi.getMeetings, 'meetings');

  if (loading || !data) {
    return <LoadingState label="Ouverture de la salle de reunion..." />;
  }

  const meeting = data.find((item) => item.id === meetingId) ?? data[0];
  const participants = meeting.attendeeIds.map((id) => users.find((user) => user.id === id)).filter(Boolean);
  const chatMessages = messages.filter((message) => message.channelId === 'design-acredi').slice(-3);

  return (
    <div className="meeting-page">
      <section className="meeting-stage">
        <header className="meeting-top">
          <span>
            <strong>{meeting.title}</strong>
            <small>{meeting.time} - {meeting.duration} - {meeting.room}</small>
          </span>
          {meeting.live ? <b>LIVE</b> : <b className="neutral">PRET</b>}
        </header>

        <div className="video-grid">
          {participants.map((participant, index) => participant ? (
            <article key={participant.id} className={index === 0 ? 'video-tile main' : 'video-tile'}>
              <Avatar name={participant.name} size={index === 0 ? 58 : 44} presence={participant.presence} />
              <span>{participant.name}</span>
            </article>
          ) : null)}
          <article className="video-tile muted-tile">
            <Icon name="plus" size={22} />
            <span>Inviter</span>
          </article>
        </div>

        <footer className="meeting-controls">
          <button className="control-button" type="button"><Icon name="mic" size={18} /><span>Micro</span></button>
          <button className="control-button" type="button"><Icon name="camera" size={18} /><span>Camera</span></button>
          <button className="control-button" type="button"><Icon name="screen" size={18} /><span>Partager</span></button>
          <button className="control-button active" type="button"><Icon name="message" size={18} /><span>Chat</span></button>
          <button className="control-button" type="button"><Icon name="hand" size={18} /><span>Main</span></button>
          <button className="control-button danger" type="button"><Icon name="phoneOff" size={18} /><span>Quitter</span></button>
        </footer>
      </section>

      <aside className="meeting-side">
        <section>
          <p className="section-label split"><span>Participants</span><span>{participants.length}</span></p>
          <ul className="people-list compact">
            {participants.map((participant) => participant ? (
              <li key={participant.id}>
                <Avatar name={participant.name} size={28} presence={participant.presence} />
                <span><strong>{participant.name}</strong><small>{participant.role}</small></span>
              </li>
            ) : null)}
          </ul>
        </section>
        <section>
          <p className="section-label">Chat reunion</p>
          <div className="meeting-chat">
            {chatMessages.map((message) => {
              const author = users.find((user) => user.id === message.authorId) ?? users[0];
              return (
                <article key={message.id}>
                  <strong>{author.name}</strong>
                  <p>{message.content}</p>
                </article>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
