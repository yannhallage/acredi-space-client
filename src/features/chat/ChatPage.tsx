import {

  FormEvent,

  KeyboardEvent,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import {

  formatDiscussionMemberName,

  useDiscussion,

  useDiscussionMessages,

  useMyDiscussions,

  useSendDiscussionMessage,

} from "../../shared/api/discussions";

import type { GroupMessageResponse } from "../../shared/api/discussions";

type LocalGroupMessage = GroupMessageResponse & {
  pending?: boolean;
  failed?: boolean;
};

import { useAuth } from "../../shared/context";

import { Avatar, EmptyState, Icon } from "../../shared/ui";



const sidebarSkeletons = [

  "chat-sidebar-1",

  "chat-sidebar-2",

  "chat-sidebar-3",

  "chat-sidebar-4",

  "chat-sidebar-5",

];



const messageSkeletons = [

  "chat-message-1",

  "chat-message-2",

  "chat-message-3",

  "chat-message-4",

  "chat-message-5",

];



function formatMessageTime(value: string) {

  const date = new Date(value);



  if (Number.isNaN(date.getTime())) {

    return value;

  }



  return new Intl.DateTimeFormat("fr-FR", {

    hour: "2-digit",

    minute: "2-digit",

  }).format(date);

}



function formatDateSeparator(value: string) {

  const date = new Date(value);



  if (Number.isNaN(date.getTime())) {

    return "CONVERSATION";

  }



  return new Intl.DateTimeFormat("fr-FR", {

    weekday: "long",

    day: "numeric",

    month: "long",

  })

    .format(date)

    .toUpperCase();

}



// function groupMessagesByDay(messages: GroupMessageResponse[]) {

//   const groups: Array<{ dateKey: string; label: string; items: GroupMessageResponse[] }> = [];
function groupMessagesByDay(messages: LocalGroupMessage[]) {
  const groups: Array<{
    dateKey: string;
    label: string;
    items: LocalGroupMessage[];
  }> = [];


  messages.forEach((message) => {

    const dateKey = message.createdAt.slice(0, 10);

    const lastGroup = groups[groups.length - 1];



    if (!lastGroup || lastGroup.dateKey !== dateKey) {

      groups.push({

        dateKey,

        label: formatDateSeparator(message.createdAt),

        items: [message],

      });

      return;

    }



    lastGroup.items.push(message);

  });



  return groups;

}



function ChatSidebarSkeleton() {

  return (

    <aside className="chat-sidebar chat-sidebar-skeleton" aria-hidden="true">

      <span className="chat-skeleton-search" />

      <span className="skeleton-line chat-skeleton-section-label" />

      {sidebarSkeletons.map((item) => (

        <div className="chat-nav-item-skeleton" key={item}>

          <span className="skeleton-avatar" />

          <span className="skeleton-line chat-skeleton-nav-name" />

        </div>

      ))}

    </aside>

  );

}



function ChatThreadSkeleton() {

  return (

    <section className="thread-panel chat-thread-skeleton" aria-hidden="true">

      <header className="thread-header">

        <span className="skeleton-avatar" />

        <span className="skeleton-copy">

          <span className="skeleton-line chat-skeleton-header-title" />

          <span className="skeleton-line chat-skeleton-header-subtitle" />

        </span>

      </header>



      <div className="message-list">

        {messageSkeletons.map((item, index) => (

          <article

            className={

              index % 2 === 0

                ? "message-bubble chat-message-skeleton"

                : "message-bubble mine chat-message-skeleton"

            }

            key={item}

          >

            {index % 2 === 0 ? <span className="skeleton-avatar" /> : null}

            <div className="skeleton-copy">

              <span className="skeleton-line chat-skeleton-message-meta" />

              <span className="skeleton-line" />

              <span className="skeleton-line chat-skeleton-message-short" />

            </div>

          </article>

        ))}

      </div>



      <div className="composer chat-composer-skeleton">

        <span className="chat-skeleton-composer-input" />

        <span className="skeleton-pill chat-skeleton-composer-button" />

      </div>

    </section>

  );

}



function ChatDetailsSkeleton() {

  return (

    <aside className="details-panel chat-details-skeleton" aria-hidden="true">

      <span className="skeleton-line chat-skeleton-details-title" />

      <span className="skeleton-line" />

      <span className="skeleton-line" />

      <span className="skeleton-line skeleton-short" />

    </aside>

  );

}



function ChatPageSkeleton() {

  return (

    <div className="chat-page chat-page-skeleton" aria-busy="true">

      <ChatSidebarSkeleton />

      <ChatThreadSkeleton />

      <ChatDetailsSkeleton />

    </div>

  );

}



function MessageBubble({ message }: { message: LocalGroupMessage }) {

  const { user } = useAuth();

  const mine = user?.id === message.senderId;

  const statusLabel = message.failed
  ? "échec"
  : message.pending
    ? "envoi..."
    : null;


  return (

    <article className={mine ? "message-bubble mine" : "message-bubble"}>

      {!mine ? <Avatar name={message.senderName} size={28} /> : null}

      <div>

        {/* <header>

          <strong>{mine ? "Vous" : message.senderName}</strong>

          <small>{formatMessageTime(message.createdAt)}</small>

        </header> */}


        <header>
          <strong>{mine ? "Vous" : message.senderName}</strong>
          <small>
          {formatMessageTime(message.createdAt)}
          {statusLabel ? ` · ${statusLabel}` : ""}
          </small>
        </header>

        <p>{message.content}</p>

      </div>

    </article>

  );

}



export function ChatPage() {

  const { channelId: discussionId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const messageListRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState("");

  const [emojiOpen, setEmojiOpen] = useState(false);

  const [localMessages, setLocalMessages] = useState<LocalGroupMessage[]>([]);



  const {

    data: discussions = [],

    isLoading: discussionsLoading,

    isError: discussionsError,

    error: discussionsErrorDetails,

  } = useMyDiscussions();

const activeDiscussion = useMemo(() => {
    

    if (!discussions.length) {

      return null;

    }



    return (

      discussions.find((discussion) => discussion.id === discussionId) ??

      discussions[0]

    );

  }, [discussionId, discussions]);



  const {

    data: discussionDetail,

    isLoading: discussionDetailLoading,

  } = useDiscussion(activeDiscussion?.id, {

    enabled: Boolean(activeDiscussion?.id),

  });


const members = discussionDetail?.members ?? activeDiscussion?.members ?? [];
  

  const {

    data: messages = [],

    isLoading: messagesLoading,

    isFetching: messagesFetching,

    isError: messagesError,

    error: messagesErrorDetails,

  } = useDiscussionMessages(activeDiscussion?.id, {

    enabled: Boolean(activeDiscussion?.id),

  });



  const sendMessage = useSendDiscussionMessage();


  useEffect(() => {
  setLocalMessages((currentMessages) => {
    const pendingMessages = currentMessages.filter(
      (message) => message.pending || message.failed,
    );

    const pendingWithoutDuplicate = pendingMessages.filter(
      (pendingMessage) =>
        !messages.some(
          (message) =>
            message.content === pendingMessage.content &&
            message.senderId === pendingMessage.senderId &&
            Math.abs(
              new Date(message.createdAt).getTime() -
                new Date(pendingMessage.createdAt).getTime(),
            ) < 10000,
        ),
    );

    return [...messages, ...pendingWithoutDuplicate];
  });
}, [messages]);



  useEffect(() => {

    if (

      !discussionsLoading &&

      activeDiscussion &&

      discussionId !== activeDiscussion.id

    ) {

      navigate(`/app/chat/${activeDiscussion.id}`, { replace: true });

    }

  }, [activeDiscussion, discussionId, discussionsLoading, navigate]);



  // useEffect(() => {

  //   const list = messageListRef.current;



  //   if (!list) {

  //     return;

  //   }



  //   list.scrollTop = list.scrollHeight;

  // }, [messages, activeDiscussion?.id]);
  useEffect(() => {
  const list = messageListRef.current;

  if (!list) {
    return;
  }

  list.scrollTop = list.scrollHeight;
}, [localMessages, activeDiscussion?.id]);




  const messageGroups = useMemo(() => groupMessagesByDay(localMessages), [localMessages]);



  // async function handleSubmit(event: FormEvent<HTMLFormElement>) {

  //   event.preventDefault();



  //   const content = draft.trim();



  //   if (!content || !activeDiscussion || sendMessage.isPending) {

  //     return;

  //   }



  //   try {

  //     await sendMessage.mutateAsync({

  //       discussionId: activeDiscussion.id,

  //       request: { content },

  //     });

  //     setDraft("");

  //   } catch {

  //     // L'erreur est exposee via sendMessage.error.

  //   }

  // }


  function handleEmojiClick(emojiData: EmojiClickData) {
  setDraft((currentDraft) => currentDraft + emojiData.emoji);
  setEmojiOpen(false);
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const content = draft.trim();

  if (!content || !activeDiscussion || !user?.id) {
    return;
  }

  const temporaryId = `temp-${activeDiscussion.id}-${Date.now()}`;

  const temporaryMessage: LocalGroupMessage = {
    id: temporaryId,
    discussionId: activeDiscussion.id,
    senderId: user.id,
    senderName: user.name || "Vous",
    content,
    createdAt: new Date().toISOString(),
    pending: true,
  };

  setLocalMessages((currentMessages) => [
    ...currentMessages,
    temporaryMessage,
  ]);

  setDraft("");

  try {
    const savedMessage = await sendMessage.mutateAsync({
      discussionId: activeDiscussion.id,
      request: { content },
    });

    setLocalMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === temporaryId ? savedMessage : message,
      ),
    );
  } catch {
    setLocalMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === temporaryId
          ? {
              ...message,
              pending: false,
              failed: true,
            }
          : message,
      ),
    );
  }
}


  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {

    if (event.key === "Enter" && !event.shiftKey) {

      event.preventDefault();

      event.currentTarget.form?.requestSubmit();

    }

  }



  if (discussionsLoading) {

    return <ChatPageSkeleton />;

  }



  if (discussionsError) {

    return (

      <EmptyState

        title="Impossible de charger les discussions"

        body={

          discussionsErrorDetails instanceof Error

            ? discussionsErrorDetails.message

            : "Une erreur est survenue."

        }

      />

    );

  }



  if (!discussions.length) {

    return (

      <EmptyState

        title="Aucune discussion de groupe"

        body="Aucune discussion n'est disponible pour le moment."

      />

    );

  }



  if (!activeDiscussion) {

    return <ChatPageSkeleton />;

  }



  const sendError =

    sendMessage.error instanceof Error ? sendMessage.error.message : null;



  const discussionName = discussionDetail?.name ?? activeDiscussion.name;

  const teamName = discussionDetail?.teamName ?? activeDiscussion.teamName;



  return (

    <div className="chat-page">

      <aside className="chat-sidebar">

        <label className="mini-search">

          <Icon name="search" size={14} />

          <input placeholder="Rechercher..." />

        </label>



        <p className="section-label split dm-section-label">

          <span>Membres du groupe</span>

        </p>



        <nav className="chat-nav dm-nav">

          {discussionDetailLoading && !members.length ? (

            sidebarSkeletons.slice(0, 3).map((item) => (

              <div className="chat-nav-item-skeleton" key={item}>

                <span className="skeleton-avatar" />

                <span className="skeleton-line chat-skeleton-nav-name" />

              </div>

            ))

          ) : members.length ? (

            members.map((member) => {

              const memberName = formatDiscussionMemberName(member);

              const isCurrentUser = user?.id === member.userId;



              return (

                <div className="chat-nav-item static" key={member.userId}>

                  <Avatar name={memberName} size={20} />

                  <span>{isCurrentUser ? `${memberName} (Vous)` : memberName}</span>

                  <span className="dm-presence presence-offline" />

                </div>

              );

            })

          ) : (

            <p className="muted chat-sidebar-empty">Aucun membre charge.</p>

          )}

        </nav>



        <p className="section-label split dm-section-label">

          <span>Discussions</span>

        </p>



        <nav className="chat-nav dm-nav">

          {discussions.map((discussion) => (

            <NavLink key={discussion.id} to={`/app/chat/${discussion.id}`}>

              <span

                className="discussion-dot"

                style={{

                  background: discussion.teamColor ?? "#6366F1",

                }}

              />

              <span>{discussion.name}</span>

            </NavLink>

          ))}

        </nav>

      </aside>



      <section className="thread-panel">

        <header className="thread-header dm-thread-header">

          <Avatar name={discussionName} size={36} />

          <span>

            <strong>{discussionName}</strong>

            <small>{teamName ? `Equipe ${teamName}` : "Discussion de groupe"}</small>

          </span>

          {/* <button className="icon-button" type="button" aria-label="Lancer une reunion">

            <Icon name="video" size={16} />

          </button> */}

          <button className="icon-button" type="button" aria-label="Rechercher">

            <Icon name="search" size={16} />

          </button>

          <button className="icon-button" type="button" aria-label="Options">

            <Icon name="moreH" size={16} />

          </button>

        </header>



        <div className="message-list" ref={messageListRef}>

          {messagesLoading ? (

            messageSkeletons.map((item, index) => (

              <article

                className={

                  index % 2 === 0

                    ? "message-bubble chat-message-skeleton"

                    : "message-bubble mine chat-message-skeleton"

                }

                key={item}

                aria-hidden="true"

              >

                {index % 2 === 0 ? <span className="skeleton-avatar" /> : null}

                <div className="skeleton-copy">

                  <span className="skeleton-line chat-skeleton-message-meta" />

                  <span className="skeleton-line" />

                  <span className="skeleton-line chat-skeleton-message-short" />

                </div>

              </article>

            ))

          ) : messagesError ? (

            <EmptyState

              title="Impossible de charger les messages"

              body={

                messagesErrorDetails instanceof Error

                  ? messagesErrorDetails.message

                  : "Une erreur est survenue."

              }

            />

          ) : messageGroups.length ? (

            messageGroups.map((group) => (

              <div key={group.dateKey}>

                <div className="date-separator">

                  <span />

                  {group.label}

                  <span />

                </div>

                {group.items.map((message) => (

                  <MessageBubble key={message.id} message={message} />

                ))}

              </div>

            ))

          ) : (

            <EmptyState

              title="Discussion vide"

              body={`Envoyez le premier message dans ${discussionName}.`}

            />

          )}



          {messagesFetching && !messagesLoading ? (

            <p className="chat-refresh-hint">Actualisation...</p>

          ) : null}

        </div>



        <form className="composer" onSubmit={handleSubmit}>

          <textarea

            value={draft}

            onChange={(event) => setDraft(event.target.value)}

            onKeyDown={handleComposerKeyDown}

            placeholder={`Ecrire dans ${discussionName}...`}

            // disabled={sendMessage.isPending}

          />

          {/* <div>

            <button className="icon-button" type="button" aria-label="Joindre">

              <Icon name="paperclip" size={15} />

            </button>

            <button className="icon-button" type="button" aria-label="Emoji">

              <Icon name="smile" size={15} />

            </button>

            <button className="icon-button" type="button" aria-label="Video">

              <Icon name="video" size={15} />

            </button>

            <span />

            {sendError ? <small className="chat-send-error">{sendError}</small> : null}

            <small>Entree envoyer</small>

            <button

              className="button primary"

              type="submit"

              disabled={!draft.trim()}

              aria-label="Envoyer"

            >

              <Icon name="send" size={14} />

            </button>

          </div> */}




          <div className="composer-actions">
  <div className="emoji-action-wrapper">
    <button
      className="icon-button"
      type="button"
      aria-label="Emoji"
      onClick={() => setEmojiOpen((value) => !value)}
    >
      <Icon name="smile" size={15} />
    </button>

    {emojiOpen ? (
      <div className="emoji-picker-popover">
      <EmojiPicker
  onEmojiClick={handleEmojiClick}
  width={340}
  height={360}
  theme={Theme.LIGHT}
  emojiStyle={EmojiStyle.NATIVE}
  lazyLoadEmojis={false}
  searchPlaceholder="Rechercher un emoji..."
  previewConfig={{
    showPreview: false,
  }}
/>
      </div>
    ) : null}
  </div>

  <span />

  {sendError ? <small className="chat-send-error">{sendError}</small> : null}

  <small>Entree envoyer</small>

  <button
    className="button primary"
    type="submit"
    disabled={!draft.trim()}
    aria-label="Envoyer"
  >
    <Icon name="send" size={14} />
  </button>
</div>


        </form>

      </section>



      <aside className="details-panel">

        <header>

          <strong>Details de la discussion</strong>

          <Icon name="moreH" size={16} />

        </header>

        <section>

          <p className="section-label">Participants</p>

          <ul className="people-list compact">

            {members.length ? (

              members.map((member) => {

                const memberName = formatDiscussionMemberName(member);

                const isCurrentUser = user?.id === member.userId;



                return (

                  <li key={member.userId}>

                    <Avatar name={memberName} size={24} />

                    <span>

                      <strong>{memberName}</strong>

                      {/* <small>{isCurrentUser ? "Vous" : member.roleName ?? "Collaborateur"}</small> */}
                      <small>
                        {isCurrentUser ? "Vous" : member.roleName || member.email || "Collaborateur"}
                      </small>
                    </span>

                  </li>

                );

              })

            ) : (

              <li>

                <span className="muted">Aucun participant charge.</span>

              </li>

            )}

          </ul>

        </section>

        <section>

          <p className="section-label">Informations</p>

          <p className="muted">

            Discussion de groupe

            {discussionDetail?.createdAt || activeDiscussion.createdAt

              ? ` creee le ${formatMessageTime(

                  discussionDetail?.createdAt ?? activeDiscussion.createdAt

                )}.`

              : "."}

          </p>

          {discussionDetail?.description || activeDiscussion.description ? (

            <p className="muted">{discussionDetail?.description ?? activeDiscussion.description}</p>

          ) : null}

        </section>

      </aside>

    </div>

  );

}


