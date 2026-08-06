import { useNavigate } from "react-router-dom";
import { MAIL_ACCOUNT } from "../mockData";
import {
  GmailMark,
  IconApps,
  IconHelp,
  IconMenu,
  IconSearch,
  IconSettings,
  IconTune,
} from "./MailIcons";

interface MailHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MailHeader({ searchQuery, onSearchChange }: MailHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="mail-header">
      <div className="mail-header__left">
        <button
          type="button"
          className="mail-icon-btn"
          aria-label="Retour au tableau de bord"
          title="Retour Acredi Space"
          onClick={() => navigate("/app/dashboard")}
        >
          <IconMenu />
        </button>
        <button
          type="button"
          className="mail-logo"
          onClick={() => navigate("/app/dashboard")}
          aria-label="Gmail — retour Acredi Space"
        >
          <GmailMark className="mail-logo__mark" />
          <span className="mail-logo__text">Gmail</span>
        </button>
      </div>

      <div className="mail-search" role="search">
        <span className="mail-search__icon">
          <IconSearch />
        </span>
        <input
          className="mail-search__input"
          type="search"
          placeholder="Search mail"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search mail"
        />
        <button type="button" className="mail-icon-btn" aria-label="Show search options">
          <IconTune />
        </button>
      </div>

      <div className="mail-header__right">
        <button type="button" className="mail-icon-btn" aria-label="Support">
          <IconHelp />
        </button>
        <button type="button" className="mail-icon-btn" aria-label="Settings">
          <IconSettings />
        </button>
        <button type="button" className="mail-upgrade">
          Upgrade
        </button>
        <button type="button" className="mail-icon-btn" aria-label="Google apps">
          <IconApps />
        </button>
        <button
          type="button"
          className="mail-avatar"
          aria-label={MAIL_ACCOUNT.name}
          title={MAIL_ACCOUNT.email}
        >
          {MAIL_ACCOUNT.avatarInitials}
        </button>
      </div>
    </header>
  );
}
