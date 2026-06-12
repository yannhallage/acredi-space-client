import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSendMessageMutation } from "../../../shared/api/dm/hooks";
import type { MessageResponse } from "../../../shared/api/dm/types";
import { useAuth } from "../../../shared/context";
import type { Presence } from "../../../shared/types";
import { Avatar, Icon } from "../../../shared/ui";


type LocalMessage = MessageResponse & {
  pending?: boolean;
  failed?: boolean;
};


interface DirectConversationThreadProps {
  channelId: string;
  title: string;
  subtitle?: string;
  presence?: Presence;
  messages: MessageResponse[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

function formatTime(value?: string) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function formatDateSeparator(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "CONVERSATION";
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "AUJOURD’HUI";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "HIER";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .toUpperCase();
}

function groupMessagesByDay(messages: MessageResponse[]) {
  const groups: Array<{
    dateKey: string;
    label: string;
    items: MessageResponse[];
  }> = [];

  messages.forEach((message) => {
    const dateKey = message.createdAt?.slice(0, 10) || "unknown";
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

function getPresenceDotClass(presence?: Presence) {
  switch (presence) {
    case "online":
      return "bg-emerald-500";
    case "busy":
      return "bg-amber-500";
    // case "away":
    //   return "bg-orange-500";
    case "offline":
    default:
      return "bg-slate-400";
  }
}

function ThreadSkeleton() {
  return (
    <section className="grid min-h-0 flex-1 grid-rows-[72px_1fr_auto] bg-[var(--surface)] text-[var(--text)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-7">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-[var(--surface-2)]" />

          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-[var(--surface-2)]" />
            <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-2)]" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="h-5 w-5 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="h-5 w-5 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="h-5 w-5 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
      </header>

      <main className="space-y-6 overflow-hidden px-12 py-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-2)]" />

            <div className="space-y-2">
              <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-2)]" />
              <div className="h-12 w-[420px] max-w-full animate-pulse rounded-xl bg-[var(--surface-2)]" />
            </div>
          </div>
        ))}
      </main>
    </section>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="mb-6 mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <span className="h-px bg-[var(--border)]" />

      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>

      <span className="h-px bg-[var(--border)]" />
    </div>
  );
}

// function DirectMessageRow({
//   message,
//   isMine,
//   senderLabel,
//   presence,
// }: {
//   message: MessageResponse;
//   isMine: boolean;
//   senderLabel: string;
//   presence?: Presence;
// }) {
function DirectMessageRow({
  message,
  isMine,
  senderLabel,
  presence,
}: {
  message: LocalMessage;
  isMine: boolean;
  senderLabel: string;
  presence?: Presence;
}) {
  const time = formatTime(message.createdAt);

  return (
    <article
      className={`mb-6 flex w-full items-start gap-3 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && <Avatar name={senderLabel} presence={presence} size={34} />}

      <div
        className={`flex max-w-[70%] flex-col ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`mb-1.5 flex items-center gap-2 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <strong className="truncate text-sm font-semibold text-[var(--text)]">
            {isMine ? "Vous" : senderLabel}
          </strong>

          <span className="text-xs text-[var(--muted)]">{time}</span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isMine
              ? "rounded-br-md bg-[var(--accent)] text-white shadow-none"
              : "rounded-bl-md border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text)] shadow-none"
          }`}
        >
          {message.content}
        </div>

        {/* <div
          className={`mt-1.5 text-xs text-slate-400 ${
            isMine ? "text-right" : "text-left"
          }`}
        >
          {isMine ? `${time} - envoyé` : `${time} - vu`}
        </div> */}
        <div className={`mt-1.5 text-xs ${
          message.failed
          ? "text-[var(--red)]"
          : message.pending
          ? "text-[var(--muted)]"
          : "text-[var(--muted)]"
          } ${isMine ? "text-right" : "text-left"}`}>
  {isMine
    ? message.failed
      ? `${time} - échec`
      : message.pending
        ? `${time} - envoi...`
        : `${time} - envoyé`
    : `${time} - vu`}
</div>
      </div>

      {isMine && <Avatar name={senderLabel} size={34} />}
    </article>
  );
}

export function DirectConversationThread({
  channelId,
  title,
  subtitle = "Message direct",
  presence = "offline",
  messages,
  loading = false,
  refreshing = false,
  onRefresh,
}: DirectConversationThreadProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const sendMessageMutation = useSendMessageMutation();
  const messageListRef = useRef<HTMLElement>(null);

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);

  // const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);
  const messageGroups = useMemo(
  () => groupMessagesByDay(localMessages),
  [localMessages],
);


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



  // useEffect(() => {
  //   const list = messageListRef.current;

  //   if (!list) return;

  //   list.scrollTop = list.scrollHeight;
  // }, [messages, channelId]);

  useEffect(() => {
  const list = messageListRef.current;

  if (!list) return;

  list.scrollTop = list.scrollHeight;
}, [localMessages, channelId]);




  // function handleSubmit(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();

  //   const value = content.trim();

  //   if (!value || sendMessageMutation.isPending) return;

  //   sendMessageMutation.mutate(
  //     {
  //       channelId,
  //       content: value,
  //     },
  //     {
  //       onSuccess: () => {
  //         setContent("");
  //       },
  //     },
  //   );
  // }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const value = content.trim();

  if (!value || !user?.id) return;

  const temporaryId = `temp-${channelId}-${Date.now()}`;

  const temporaryMessage: LocalMessage = {
    id: temporaryId,
    channelId,
    senderId: user.id,
    senderName: user.name || "Vous",
    content: value,
    createdAt: new Date().toISOString(),
    pending: true,
  };

  setLocalMessages((currentMessages) => [...currentMessages, temporaryMessage]);
  setContent("");

  sendMessageMutation.mutate(
    {
      channelId,
      content: value,
    },
    {
      onSuccess: (savedMessage) => {
        setLocalMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === temporaryId ? savedMessage : message,
          ),
        );
      },
      onError: () => {
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
      },
    },
  );
}




  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  if (loading) {
    return <ThreadSkeleton />;
  }

  return (
    <section className="grid min-h-0 flex-1 grid-rows-[72px_1fr_auto] bg-[var(--surface)] text-[var(--text)]">
      <header className="flex min-w-0 items-center justify-between border-b border-[var(--border)] px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={title} presence={presence} size={44} />

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-[var(--text)]">
              {title}
            </h2>

            {/* <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${getPresenceDotClass(
                  presence,
                )}`}
              />
              <span className="truncate">{subtitle}</span>
            </p> */}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Recharger la discussion"
            disabled={refreshing || !onRefresh}
            onClick={() => onRefresh?.()}
            className="cursor-pointer rounded-lg p-2 text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name="refresh"
              size={17}
              className={refreshing ? "animate-spin" : undefined}
            />
          </button>

          {/* <button
            type="button"
            aria-label="Plus d’options"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <Icon name="moreH" size={17} />
          </button> */}
        </div>
      </header>

      <main
        ref={messageListRef}
        className="min-h-0 overflow-y-auto bg-[color-mix(in_srgb,var(--bg)_92%,var(--surface))] px-6 py-7 sm:px-10 lg:px-14"
      >
        {messageGroups.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name="message" size={22} />
              </div>

              <h3 className="text-sm font-semibold text-[var(--text)]">
                Aucun message pour le moment
              </h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Envoyez le premier message pour démarrer la discussion.
              </p>
            </div>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.dateKey}>
              <DateSeparator label={group.label} />

              {group.items.map((message) => {
                const isMine = user?.id === message.senderId;

                const senderLabel = isMine
                  ? user?.name || message.senderName || "Vous"
                  : message.senderName || title;

                return (
                  <DirectMessageRow
                    key={message.id}
                    message={message}
                    isMine={isMine}
                    senderLabel={senderLabel}
                    presence={presence}
                  />
                );
              })}
            </div>
          ))
        )}
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3 sm:px-7"
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={`Écrire à ${title}...`}
          rows={2}
          // disabled={sendMessageMutation.isPending}
          className="min-h-[70px] w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[color-mix(in_srgb,var(--accent)_58%,var(--border))] focus:ring-4 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Joindre un fichier"
              className="rounded-lg p-2 text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <Icon name="paperclip" size={16} />
            </button>

            <button
              type="button"
              aria-label="Emoji"
              className="rounded-lg p-2 text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <Icon name="smile" size={16} />
            </button>

            <button
              type="button"
              aria-label="Réunion vidéo"
              className="rounded-lg p-2 text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <Icon name="video" size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium tracking-wide text-[var(--muted)] sm:inline">
              Entrée pour envoyer
            </span>

            <button
              type="submit"
              // disabled={!content.trim() || sendMessageMutation.isPending}
              disabled={!content.trim()}
              aria-label="Envoyer"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
