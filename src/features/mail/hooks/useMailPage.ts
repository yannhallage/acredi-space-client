import { useMemo, useState } from "react";
import { MOCK_MESSAGES } from "../mockData";
import type { MailCategory, MailFolderId, MailMessage } from "../types";

export function useMailPage() {
  const [activeFolder, setActiveFolder] = useState<MailFolderId>("inbox");
  const [activeCategory, setActiveCategory] = useState<MailCategory>("primary");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(
    () => new Set(MOCK_MESSAGES.filter((m) => m.starred).map((m) => m.id))
  );
  const [composeOpen, setComposeOpen] = useState(false);

  const messages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MOCK_MESSAGES.filter((message) => {
      if (activeFolder === "starred") {
        if (!starredIds.has(message.id)) return false;
      } else if (activeFolder === "more") {
        return false;
      } else if (message.folder !== activeFolder && activeFolder !== "inbox") {
        return false;
      } else if (activeFolder === "inbox" && message.folder !== "inbox") {
        return false;
      }

      if (activeFolder === "inbox" && message.category !== activeCategory) {
        return false;
      }

      if (!query) return true;

      return (
        message.sender.toLowerCase().includes(query) ||
        message.subject.toLowerCase().includes(query) ||
        message.snippet.toLowerCase().includes(query)
      );
    });
  }, [activeFolder, activeCategory, searchQuery, starredIds]);

  const promotionsNewCount = useMemo(
    () =>
      MOCK_MESSAGES.filter(
        (m) => m.folder === "inbox" && m.category === "promotions" && m.unread
      ).length,
    []
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (prev.size === messages.length && messages.length > 0) {
        return new Set();
      }
      return new Set(messages.map((m) => m.id));
    });
  }

  function toggleStar(id: string) {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isStarred(message: MailMessage) {
    return starredIds.has(message.id);
  }

  return {
    activeFolder,
    setActiveFolder,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedIds,
    messages,
    promotionsNewCount,
    composeOpen,
    setComposeOpen,
    toggleSelect,
    toggleSelectAll,
    toggleStar,
    isStarred,
    allSelected:
      messages.length > 0 && selectedIds.size === messages.length,
  };
}
