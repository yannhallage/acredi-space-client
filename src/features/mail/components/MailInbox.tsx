import { MAIL_PAGINATION, PROMOTIONS_TAB_PREVIEW } from "../mockData";
import type { MailCategory, MailMessage } from "../types";
import { MailRow } from "./MailRow";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMoreVert,
  IconPrimary,
  IconPromotions,
  IconRefresh,
  IconSocial,
} from "./MailIcons";

interface MailInboxProps {
  messages: MailMessage[];
  activeCategory: MailCategory;
  onCategoryChange: (category: MailCategory) => void;
  promotionsNewCount: number;
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  isStarred: (message: MailMessage) => boolean;
}

export function MailInbox({
  messages,
  activeCategory,
  onCategoryChange,
  promotionsNewCount,
  selectedIds,
  allSelected,
  onToggleSelectAll,
  onToggleSelect,
  onToggleStar,
  isStarred,
}: MailInboxProps) {
  return (
    <section className="mail-inbox" aria-label="Inbox">
      <div className="mail-toolbar">
        <div className="mail-toolbar__left">
          <label className="mail-toolbar__check">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              aria-label="Select all"
            />
          </label>
          <button type="button" className="mail-icon-btn" aria-label="Refresh">
            <IconRefresh />
          </button>
          <button type="button" className="mail-icon-btn" aria-label="More">
            <IconMoreVert />
          </button>
        </div>
        <div className="mail-toolbar__right">
          <span className="mail-pagination">
            {MAIL_PAGINATION.from}–{MAIL_PAGINATION.to} of{" "}
            {MAIL_PAGINATION.total.toLocaleString("en-US")}
          </span>
          <button type="button" className="mail-icon-btn" aria-label="Newer">
            <IconChevronLeft />
          </button>
          <button type="button" className="mail-icon-btn" aria-label="Older">
            <IconChevronRight />
          </button>
        </div>
      </div>

      <div className="mail-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "primary"}
          className={`mail-tab${activeCategory === "primary" ? " is-active" : ""}`}
          onClick={() => onCategoryChange("primary")}
        >
          <div className="mail-tab__row">
            <IconPrimary />
            <span className="mail-tab__label">Primary</span>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "promotions"}
          className={`mail-tab mail-tab--promo${activeCategory === "promotions" ? " is-active" : ""}`}
          onClick={() => onCategoryChange("promotions")}
        >
          <div className="mail-tab__row">
            <IconPromotions />
            <span className="mail-tab__label">Promotions</span>
            {promotionsNewCount > 0 ? (
              <span className="mail-tab__badge">{promotionsNewCount} new</span>
            ) : null}
          </div>
          <span className="mail-tab__preview">{PROMOTIONS_TAB_PREVIEW}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "social"}
          className={`mail-tab${activeCategory === "social" ? " is-active" : ""}`}
          onClick={() => onCategoryChange("social")}
        >
          <div className="mail-tab__row">
            <IconSocial />
            <span className="mail-tab__label">Social</span>
          </div>
        </button>
      </div>

      <div className="mail-list" role="rowgroup">
        {messages.length === 0 ? (
          <div className="mail-empty">No conversations in this category.</div>
        ) : (
          messages.map((message) => (
            <MailRow
              key={message.id}
              message={message}
              selected={selectedIds.has(message.id)}
              starred={isStarred(message)}
              onToggleSelect={() => onToggleSelect(message.id)}
              onToggleStar={() => onToggleStar(message.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
