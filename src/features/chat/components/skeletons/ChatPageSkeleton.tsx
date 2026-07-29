import { ChatDetailsSkeleton } from "./ChatDetailsSkeleton";
import { ChatSidebarSkeleton } from "./ChatSidebarSkeleton";
import { ChatThreadSkeleton } from "./ChatThreadSkeleton";

export function ChatPageSkeleton() {
  return (
    <div className="chat-page chat-page-skeleton" aria-busy="true">
      <ChatSidebarSkeleton />
      <ChatThreadSkeleton />
      <ChatDetailsSkeleton />
    </div>
  );
}
