// import React from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const styles = {
  overlay: `
    fixed inset-0 z-50
    flex items-center justify-center
    bg-black/35
    font-sans
  `,

  modal: `
    flex
    h-[640px]
    w-[1060px]
    overflow-hidden
    rounded-2xl
    bg-white
    shadow-2xl
  `,

  sidebar: `
    w-[230px]
    border-r
    border-gray-100
    bg-[#f9f9f9]
  `,

  sidebarContent: `
    h-full
    overflow-y-auto
    px-1
    py-4
    [&::-webkit-scrollbar]:w-[12px]
    [&::-webkit-scrollbar-track]:bg-[#f7f7f7]
    [&::-webkit-scrollbar-thumb]:bg-[#777]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:border-[3px]
    [&::-webkit-scrollbar-thumb]:border-[#f7f7f7]
  `,

  section: `
    mb-5
  `,

  sectionTitle: `
    mb-2
    px-1
    text-[13px]
    font-medium
    text-gray-500
  `,

  item: `
    flex
    h-[30px]
    w-full
    items-center
    gap-3
    rounded-lg
    px-3
    text-left
    text-[14px]
    text-gray-800
    transition
    hover:bg-gray-100
  `,

  itemActive: `
    border
    border-gray-300
    bg-white
    text-gray-900
    shadow-[0_0_0_1px_rgba(0,0,0,0.03)]
  `,

  icon: `
    text-gray-700
  `,

  content: `
    flex-1
    px-10
    py-9
  `,

  title: `
    text-[19px]
    font-semibold
    leading-none
    text-gray-900
  `,

  subtitle: `
    mt-3
    text-[13px]
    text-gray-600
  `,

  profileRow: `
    mt-11
    flex
    items-center
    gap-3
  `,

  avatar: `
    flex
    h-[62px]
    w-[62px]
    items-center
    justify-center
    rounded-full
    bg-gray-100
    text-[14px]
    text-gray-600
  `,

  profileNameRow: `
    flex
    items-center
    gap-2
  `,

  profileName: `
    text-[17px]
    font-semibold
    text-gray-900
  `,

  profileEmail: `
    mt-1
    text-[14px]
    text-gray-600
  `,

  sectionContent: `
    mt-9
  `,

  sectionContentTitle: `
    text-[14px]
    font-semibold
    text-gray-950
  `,

  settingRow: `
    mt-7
    flex
    items-start
    justify-between
  `,

  settingInfoTitle: `
    text-[14px]
    font-medium
    text-gray-900
  `,

  settingInfoDescription: `
    mt-1
    max-w-[520px]
    text-[14.5px]
    leading-[22px]
    text-gray-600
  `,

  button: `
    rounded-lg
    cursor-pointer
    bg-gray-100
    px-3
    py-1.5
    text-[1px]
    text-gray-700
    transition
    hover:bg-gray-200
  `,
};

const ICON_PATHS = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18",

  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  brand: "M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.4 6.4 19.5l2.1-6.7L3 8.8h6.8z",
  template: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
  refresh: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
} as const;

type IconName = keyof typeof ICON_PATHS;

function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const groups = [
  {
    title: "User Configuration",
    items: [
      { label: "Profile", icon: "user", active: true },
      { label: "Preferences", icon: "settings" },
    ],
  },

  {
    title: "System Configuration",
    items: [
      { label: "General", icon: "settings" },
      { label: "Dashboard", icon: "grid" },
      { label: "Defaults", icon: "template" },
      { label: "Brand", icon: "brand" },
    ],
  },

//   {
//     title: "User Management",
//     items: [
//       { label: "Users", icon: "user" },
//       { label: "Invite User", icon: "user" },
//     ],
//   },

  {
    title: "Email",
    items: [
      { label: "Accounts", icon: "mail" },
      { label: "Templates", icon: "template" },
    ],
  },

  {
    title: "Automation & Rules",
    items: [
      { label: "Assignment Rules", icon: "settings" },
      { label: "SLA Policies", icon: "shield" },
    ],
  },

//   {
//     title: "Customization",
//     items: [{ label: "Home Actions", icon: "home" }],
//   },

//   {
//     title: "Integrations",
//     items: [
//       { label: "Telephony", icon: "phone" },
//       { label: "ERPNext", icon: "template" },
//       { label: "Lead Syncing", icon: "refresh" },
//     ],
//   },
] as const;

type ModalSettingProps = {
  onClose: () => void;
};
export default function ModalSetting({ onClose }: ModalSettingProps) {
  return (
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* <div className={styles.modal} onClick={(e) => e.stopPropagation()}> */}
      <motion.div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-xl text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            {groups.map((group) => (
              <div key={group.title} className={styles.section}>
                <p className={styles.sectionTitle}>{group.title}</p>

                <div className="space-y-1 ">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      className={`${styles.item} ${
                        "active" in item && item.active ? styles.itemActive : ""
                      }`}
                    >
                      <span className={styles.icon}>
                        <Icon name={item.icon} />
                      </span>

                      <span className="text-[14px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className={styles.content}>
          <h2 className={styles.title}>Profile</h2>

          <p className={styles.subtitle}>
            Manage your profile & login information.
          </p>

          <div className={styles.profileRow}>
            <div className={styles.avatar}>A</div>

            <div>
              <div className={styles.profileNameRow}>
                <h3 className={styles.profileName}>Administrator</h3>

                <Icon name="edit" size={16} />
              </div>

              <p className={styles.profileEmail}>admin@example.com</p>
            </div>
          </div>

          <section className={styles.sectionContent}>
            <h4 className={styles.sectionContentTitle}>
              Account Info & Security
            </h4>

            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingInfoTitle}>Emails & Signature</p>

                <p className={styles.settingInfoDescription}>
                  Manage your account emails and email signature for
                  communication.
                </p>
              </div>

              <button className={styles.button}>Configure</button>
            </div>

            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingInfoTitle}>Password</p>

                <p className={styles.settingInfoDescription}>
                  Change your account password for security.
                </p>
              </div>

              <button className={styles.button}>Change Password</button>
            </div>
          </section>
        </main>
      </motion.div>
    </motion.div>
  );
}
