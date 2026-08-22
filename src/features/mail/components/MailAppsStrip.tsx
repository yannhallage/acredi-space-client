import {
  IconAdd,
  IconContacts,
  IconKeep,
  IconTasks,
} from "./MailIcons";

export function MailAppsStrip() {
  const day = new Date().getDate();

  return (
    <aside className="mail-apps" aria-label="Google apps">
      <button type="button" className="mail-apps__btn" aria-label="Calendar" title="Calendar">
        <div className="mail-apps__cal">
          <span>Aug</span>
          <span>{day}</span>
        </div>
      </button>
      <button type="button" className="mail-apps__btn" aria-label="Keep" title="Keep">
        <IconKeep />
      </button>
      <button type="button" className="mail-apps__btn" aria-label="Tasks" title="Tasks">
        <IconTasks />
      </button>
      <button type="button" className="mail-apps__btn" aria-label="Contacts" title="Contacts">
        <IconContacts />
      </button>
      <div className="mail-apps__divider" />
      <button type="button" className="mail-apps__btn" aria-label="Get add-ons" title="Get add-ons">
        <IconAdd />
      </button>
    </aside>
  );
}
