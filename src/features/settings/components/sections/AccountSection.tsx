import type { ChangeEvent, RefObject } from 'react';
import { PresetAvatarPicker } from '../../../../shared/avatars/PresetAvatarPicker';
import type { AvatarPreset } from '../../../../shared/avatars/presets';
import { Avatar, Icon } from '../../../../shared/ui';

type AccountSectionProps = {
  avatarMessage: { type: 'error' | 'success'; text: string } | null;
  avatarSrc: string | null;
  canUpdate: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPresetSelect: (preset: AvatarPreset) => void;
  selectedPresetId: string | null;
  userEmail: string;
  userName: string;
  workspaceName: string;
};

export function AccountSection({
  avatarMessage,
  avatarSrc,
  canUpdate,
  fileInputRef,
  isUploading,
  onAvatarChange,
  onPresetSelect,
  selectedPresetId,
  userEmail,
  userName,
  workspaceName,
}: AccountSectionProps) {
  return (
    <div className="modal-setting-profile">
      <div className="modal-setting-profile-main">
        <div className="modal-setting-avatar-control">
          <Avatar name={userName} size={48} src={avatarSrc} />
          {canUpdate ? (
            <button
              className="modal-setting-avatar-button"
              type="button"
              aria-label="Changer la photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Icon name={isUploading ? 'refresh' : 'camera'} size={14} />
            </button>
          ) : null}
          <input
            ref={fileInputRef}
            className="modal-setting-avatar-input"
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            disabled={!canUpdate || isUploading}
          />
        </div>
        <div className="modal-setting-profile-details">
          <div className="modal-setting-profile-title">
            <h3>{userName}</h3>
            {canUpdate ? (
              <button
                className="modal-setting-photo-action"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Icon name={isUploading ? 'refresh' : 'camera'} size={14} />
                {isUploading ? 'Import...' : 'Changer photo'}
              </button>
            ) : null}
          </div>
          <p>{userEmail}</p>
          <small>{workspaceName}</small>
          {avatarMessage ? (
            <small className={`modal-setting-avatar-message ${avatarMessage.type}`}>
              {avatarMessage.text}
            </small>
          ) : null}
        </div>
      </div>

      {canUpdate ? (
        <PresetAvatarPicker
          disabled={isUploading}
          selectedPresetId={selectedPresetId}
          onSelect={(preset) => {
            void onPresetSelect(preset);
          }}
        />
      ) : null}
    </div>
  );
}
