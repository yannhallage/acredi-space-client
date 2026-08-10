import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyDiscussions } from "../shared/api/discussions";
import { useChannelsQuery } from "../shared/api/dm";
import { Icon } from "../shared/ui";

const DOCK_STATE_KEY = "acredi-discussions-dock";

type DockState = "expanded" | "minimized" | "closed";

interface DiscussionsDockProps {
  newDiscussionsCount?: number;
  unreadByChannelId?: Record<string, number>;
}

const dockMotion = {
  initial: { y: 28, opacity: 0, scale: 0.98 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 28, opacity: 0, scale: 0.98 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

const bodyMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

function readDockState(): DockState {
  try {
    const stored = localStorage.getItem(DOCK_STATE_KEY);
    if (stored === "expanded" || stored === "minimized" || stored === "closed") {
      return stored;
    }
  } catch {
    // ignore
  }

  return "minimized";
}

function writeDockState(state: DockState) {
  try {
    localStorage.setItem(DOCK_STATE_KEY, state);
  } catch {
    // ignore
  }
}

function getPrivateName(channel: {
  displayName?: string;
  name?: string;
}) {
  return channel.displayName || channel.name || "Discussion privée";
}

function formatCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function DockCountBadge({ count }: { count?: number | null }) {
  if (!count || count <= 0) {
    return null;
  }

  return <span className="discussions-dock-count">{formatCount(count)}</span>;
}

export function DiscussionsDock({
  newDiscussionsCount = 0,
  unreadByChannelId = {},
}: DiscussionsDockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dockState, setDockState] = useState<DockState>(() => readDockState());
  const discussionsQuery = useMyDiscussions();
  const channelsQuery = useChannelsQuery();

  const teamDiscussions = useMemo(
    () => (discussionsQuery.data ?? []).slice(0, 8),
    [discussionsQuery.data]
  );

  const privateDiscussions = useMemo(
    () =>
      (channelsQuery.data ?? [])
        .filter((channel) => channel.privateChannel)
        .slice(0, 8),
    [channelsQuery.data]
  );

  const isLoading = discussionsQuery.isLoading || channelsQuery.isLoading;
  const hasError = discussionsQuery.isError && channelsQuery.isError;
  const isEmpty = !teamDiscussions.length && !privateDiscussions.length;
  const isExpanded = dockState === "expanded";
  const isClosed = dockState === "closed";

  useEffect(() => {
    writeDockState(dockState);
  }, [dockState]);

  function openTeamDiscussion(id: string) {
    navigate(`/app/chat/${id}`);
    setDockState("minimized");
  }

  function openPrivateDiscussion(id: string) {
    navigate(`/app/dm/${id}`);
    setDockState("minimized");
  }

  function toggleExpanded() {
    setDockState((current) =>
      current === "minimized" ? "expanded" : "minimized"
    );
  }

  return (
    <div className="discussions-dock-root">
      <AnimatePresence mode="wait" initial={false}>
        {isClosed ? (
          <motion.button
            key="launcher"
            className="discussions-dock-launcher"
            type="button"
            aria-label="Ouvrir les discussions"
            onClick={() => setDockState("expanded")}
            {...dockMotion}
          >
            <Icon name="message" size={16} />
            <span>Discussions</span>
            <DockCountBadge count={newDiscussionsCount} />
          </motion.button>
        ) : (
          <motion.div
            key="dock"
            className={
              isExpanded ? "discussions-dock" : "discussions-dock is-minimized"
            }
            role="complementary"
            aria-label="Discussions rapides"
            {...dockMotion}
          >
            <div className="discussions-dock-header">
              <button
                className="discussions-dock-title"
                type="button"
                onClick={toggleExpanded}
              >
                <Icon name="message" size={15} />
                <strong>Discussions</strong>
                <DockCountBadge count={newDiscussionsCount} />
              </button>
              <div className="discussions-dock-actions">
                <button
                  className="discussions-dock-icon"
                  type="button"
                  aria-label={isExpanded ? "Réduire" : "Agrandir"}
                  title={isExpanded ? "Réduire" : "Agrandir"}
                  onClick={toggleExpanded}
                >
                  <Icon
                    name="chevDown"
                    size={14}
                    className={
                      isExpanded
                        ? "discussions-dock-chev"
                        : "discussions-dock-chev is-up"
                    }
                  />
                </button>
                <button
                  className="discussions-dock-icon"
                  type="button"
                  aria-label="Fermer"
                  title="Fermer"
                  onClick={() => setDockState("closed")}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded ? (
                <motion.div
                  key="dock-body"
                  className="discussions-dock-body-wrap"
                  {...bodyMotion}
                >
                  <div className="discussions-dock-body">
                    {isLoading ? (
                      <div className="discussions-dock-empty">Chargement…</div>
                    ) : hasError ? (
                      <div className="discussions-dock-empty">
                        Impossible de charger les discussions
                      </div>
                    ) : isEmpty ? (
                      <div className="discussions-dock-empty">
                        Aucune discussion
                      </div>
                    ) : (
                      <>
                        {teamDiscussions.length ? (
                          <section className="discussions-dock-section">
                            <p className="discussions-dock-label">Équipes</p>
                            <ul className="discussions-dock-list">
                              {teamDiscussions.map((discussion) => {
                                const active = location.pathname.startsWith(
                                  `/app/chat/${discussion.id}`
                                );

                                return (
                                  <li key={discussion.id}>
                                    <button
                                      className={
                                        active
                                          ? "discussions-dock-item active"
                                          : "discussions-dock-item"
                                      }
                                      type="button"
                                      onClick={() =>
                                        openTeamDiscussion(discussion.id)
                                      }
                                    >
                                      <span
                                        className="discussions-dock-dot"
                                        style={{
                                          background:
                                            discussion.teamColor ??
                                            "var(--accent)",
                                        }}
                                      />
                                      <span className="discussions-dock-item-text">
                                        <strong>{discussion.name}</strong>
                                        {discussion.teamName ? (
                                          <small>{discussion.teamName}</small>
                                        ) : null}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </section>
                        ) : null}

                        {privateDiscussions.length ? (
                          <section className="discussions-dock-section">
                            <p className="discussions-dock-label">Privées</p>
                            <ul className="discussions-dock-list">
                              {privateDiscussions.map((channel) => {
                                const active = location.pathname.startsWith(
                                  `/app/dm/${channel.id}`
                                );
                                const unread =
                                  unreadByChannelId[channel.id] ??
                                  channel.unreadCount ??
                                  0;

                                return (
                                  <li key={channel.id}>
                                    <button
                                      className={
                                        active
                                          ? "discussions-dock-item active"
                                          : "discussions-dock-item"
                                      }
                                      type="button"
                                      onClick={() =>
                                        openPrivateDiscussion(channel.id)
                                      }
                                    >
                                      <span className="discussions-dock-avatar">
                                        <Icon name="user" size={12} />
                                      </span>
                                      <span className="discussions-dock-item-text">
                                        <strong>
                                          {getPrivateName(channel)}
                                        </strong>
                                        {channel.lastMessage ? (
                                          <small>{channel.lastMessage}</small>
                                        ) : (
                                          <small>Message privé</small>
                                        )}
                                      </span>
                                      <DockCountBadge count={unread} />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </section>
                        ) : null}
                      </>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
