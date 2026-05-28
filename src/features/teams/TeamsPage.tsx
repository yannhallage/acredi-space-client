import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channels, users } from '../../shared/api/mockData';
import { useWorkspace } from '../../shared/context';
import { Avatar, Icon } from '../../shared/ui';

const workspaceChannel: Record<string, string> = {
  direction: 'general',
  product: 'sprint-18',
  sales: 'incidents-prod',
  design: 'design-acredi'
};

const teamSkeletons = ['team-skeleton-1', 'team-skeleton-2', 'team-skeleton-3', 'team-skeleton-4'];

function TeamCardSkeleton() {
  return (
    <article className="team-card team-card-skeleton" aria-hidden="true">
      <header>
        <span className="skeleton-line team-skeleton-accent" />
        <div className="skeleton-copy">
          <span className="skeleton-line team-skeleton-title" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-short" />
        </div>
      </header>
      <div className="team-card-meta">
        <span className="skeleton-line team-skeleton-meta" />
        <span className="skeleton-line team-skeleton-meta" />
      </div>
      <div className="team-card-footer">
        <div className="team-avatars">
          <span className="skeleton-avatar" />
          <span className="skeleton-avatar" />
          <span className="skeleton-avatar" />
        </div>
        <span className="skeleton-pill team-skeleton-button" />
      </div>
    </article>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { activeWorkspace, setActiveWorkspaceId, workspaces } = useWorkspace();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="teams-page">
      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Teams</span>
          <Icon name="building" size={14} />
          <strong>Equipes</strong>
        </div>
        <button className="button primary notes-create-button" type="button">
          <Icon name="plus" size={12} />
          Creer
        </button>
      </section>

      <section className="teams-grid" aria-label="Teams">
        {loading ? teamSkeletons.map((item) => <TeamCardSkeleton key={item} />) : workspaces.map((workspace) => {
          const channelId = workspaceChannel[workspace.id] ?? 'general';
          const channel = channels.find((item) => item.id === channelId);
          const members = channel?.memberIds
            .map((memberId) => users.find((user) => user.id === memberId))
            .filter(Boolean)
            .slice(0, 4);

          return (
            <article
              className={
                workspace.id === activeWorkspace.id
                  ? 'team-card active'
                  : 'team-card'
              }
              key={workspace.id}
            >
              <header>
                <span style={{ background: workspace.color }} />
                <div>
                  <h2>{workspace.name}</h2>
                  <p>{channel?.description ?? 'Equipe Acredi Space'}</p>
                </div>
              </header>

              <div className="team-card-meta">
                <span>
                  <Icon name="users" size={14} />
                  {channel?.memberIds.length ?? 0} membres
                </span>
                <span>
                  <Icon name="message" size={14} />
                  #{channel?.name ?? channelId}
                </span>
              </div>

              <div className="team-card-footer">
                <div className="team-avatars" aria-hidden="true">
                  {members?.map((member) =>
                    member ? (
                      <Avatar key={member.id} name={member.name} size={30} presence={member.presence} />
                    ) : null
                  )}
                </div>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(workspace.id);
                    navigate(`/app/chat/${channelId}`);
                  }}
                >
                  Ouvrir
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
