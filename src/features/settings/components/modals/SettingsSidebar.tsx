import { Icon } from '../../../../shared/ui';
import type { SettingGroup, SettingKey } from '../../types';

type SettingsSidebarProps = {
  activeKey?: SettingKey;
  groups: SettingGroup[];
  onSelect: (key: SettingKey) => void;
};

export function SettingsSidebar({ activeKey, groups, onSelect }: SettingsSidebarProps) {
  return (
    <aside className="modal-setting-sidebar" aria-label="Sections des parametres">
      {groups.map((group) => (
        <section key={group.title} className="modal-setting-group">
          <p>{group.title}</p>
          <div>
            {group.items.map((item) => (
              <button
                key={item.label}
                className={item.key === activeKey ? 'modal-setting-item active' : 'modal-setting-item'}
                type="button"
                onClick={() => onSelect(item.key)}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}
