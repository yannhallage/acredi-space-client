import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePermissions } from '../../../../shared/permissions';
import { Icon } from '../../../../shared/ui';
import { SETTINGS_GROUPS } from '../../constants';
import type { ModalSettingProps, SettingKey } from '../../types';
import { useAvatarUpload } from '../../useAvatarUpload';
import { AccountSection } from '../sections/AccountSection';
import { GenericSettingsRows } from '../sections/GenericSettingsRows';
import { InvitationsSection } from '../sections/InvitationsSection';
import { InvoicesSection } from '../sections/InvoicesSection';
import { OrganizationSection } from '../sections/OrganizationSection';
import { ProfilesSection } from '../sections/ProfilesSection';
import { SubscriptionSection } from '../sections/SubscriptionSection';
import { SettingsSidebar } from './SettingsSidebar';

export function ModalSetting({ userEmail, userName, workspaceName, onClose }: ModalSettingProps) {
  const { hasAnyPermission } = usePermissions();
  const [activeKey, setActiveKey] = useState<SettingKey>('profile');
  const avatarUpload = useAvatarUpload();

  const visibleGroups = useMemo(
    () =>
      SETTINGS_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => hasAnyPermission(item.permissions)),
      })).filter((group) => group.items.length > 0),
    [hasAnyPermission]
  );

  const visibleItems = useMemo(
    () => visibleGroups.flatMap((group) => group.items),
    [visibleGroups]
  );

  const activeItem = visibleItems.find((item) => item.key === activeKey) ?? visibleItems[0];
  const canUpdateActiveItem = activeItem ? hasAnyPermission(activeItem.updatePermissions) : false;

  useEffect(() => {
    if (activeItem && activeItem.key !== activeKey) {
      setActiveKey(activeItem.key);
    }
  }, [activeItem, activeKey]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function renderActiveSection() {
    if (!activeItem) {
      return null;
    }

    switch (activeItem.key) {
      case 'profile':
        return (
          <>
            <AccountSection
              avatarMessage={avatarUpload.avatarMessage}
              avatarSrc={avatarUpload.avatarSrc}
              canUpdate={canUpdateActiveItem}
              fileInputRef={avatarUpload.fileInputRef}
              isUploading={avatarUpload.isUploadingAvatar}
              onAvatarChange={avatarUpload.handleAvatarChange}
              onPresetSelect={avatarUpload.handlePresetAvatarSelect}
              selectedPresetId={avatarUpload.selectedPresetId}
              userEmail={userEmail}
              userName={userName}
              workspaceName={workspaceName}
            />
            <GenericSettingsRows
              canUpdate={canUpdateActiveItem}
              onClose={onClose}
              rows={activeItem.rows}
              sectionTitle={activeItem.sectionTitle}
            />
          </>
        );
      case 'profiles':
        return <ProfilesSection />;
      case 'invitations':
        return <InvitationsSection />;
      case 'general':
        return (
          <OrganizationSection canUpdate={canUpdateActiveItem} />
        );
      case 'subscription':
        return <SubscriptionSection onClose={onClose} />;
      case 'invoices':
        return <InvoicesSection />;
      default:
        return (
          <GenericSettingsRows
            canUpdate={canUpdateActiveItem}
            onClose={onClose}
            rows={activeItem.rows}
            sectionTitle={activeItem.sectionTitle}
          />
        );
    }
  }

  return (
    <motion.div
      className="modal-setting-overlay"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.section
        className="modal-setting-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          className="modal-setting-close"
          type="button"
          aria-label="Fermer les parametres"
          onClick={onClose}
        >
          <Icon name="x" size={17} />
        </button>

        <SettingsSidebar
          activeKey={activeItem?.key}
          groups={visibleGroups}
          onSelect={setActiveKey}
        />

        <main className="modal-setting-content">
          {activeItem ? (
            <>
              <header>
                <h2 id="settings-modal-title">{activeItem.title}</h2>
                <p>{activeItem.subtitle}</p>
              </header>
              {renderActiveSection()}
            </>
          ) : (
            <header>
              <h2 id="settings-modal-title">Parametres</h2>
              <p>Aucune section disponible avec tes permissions actuelles.</p>
            </header>
          )}
        </main>
      </motion.section>
    </motion.div>
  );
}
