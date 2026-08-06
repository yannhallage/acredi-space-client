import {
  MailAppsStrip,
  MailHeader,
  MailInbox,
  MailSidebar,
} from "./components";
import { useMailPage } from "./hooks/useMailPage";
import {
  FEATURE_PERMISSION_REQUIREMENTS,
  usePermissions,
} from "../../shared/permissions";
import { AccessDeniedState, LoadingState } from "../../shared/ui";
import "./style.css";

export function MailPage() {
  const { hasAnyPermission, loading } = usePermissions();
  const mail = useMailPage();

  if (loading) {
    return (
      <div className="mail-page mail-page--state">
        <LoadingState label="Verification des droits..." />
      </div>
    );
  }

  if (!hasAnyPermission(FEATURE_PERMISSION_REQUIREMENTS.chat)) {
    return (
      <div className="mail-page mail-page--state">
        <AccessDeniedState body="Vous n'avez pas les droits necessaires pour acceder a la messagerie." />
      </div>
    );
  }

  return (
    <div className="mail-page" aria-label="Gmail">
      <MailHeader
        searchQuery={mail.searchQuery}
        onSearchChange={mail.setSearchQuery}
      />

      <div className="mail-body">
        <MailSidebar
          activeFolder={mail.activeFolder}
          onFolderChange={mail.setActiveFolder}
          onCompose={() => mail.setComposeOpen(true)}
        />

        <MailInbox
          messages={mail.messages}
          activeCategory={mail.activeCategory}
          onCategoryChange={mail.setActiveCategory}
          promotionsNewCount={mail.promotionsNewCount}
          selectedIds={mail.selectedIds}
          allSelected={mail.allSelected}
          onToggleSelectAll={mail.toggleSelectAll}
          onToggleSelect={mail.toggleSelect}
          onToggleStar={mail.toggleStar}
          isStarred={mail.isStarred}
        />

        <MailAppsStrip />
      </div>

      {mail.composeOpen ? (
        <div className="mail-compose-stub" role="dialog" aria-label="New Message">
          <div className="mail-compose-stub__bar">
            <span>New Message</span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => mail.setComposeOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="mail-compose-stub__body">
            Compose is a visual stub — no API connected yet.
          </div>
        </div>
      ) : null}
    </div>
  );
}
