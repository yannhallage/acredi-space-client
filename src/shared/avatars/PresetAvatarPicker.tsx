import {
  AVATAR_PRESETS,
  extractPresetAvatarFile,
  type AvatarPreset,
} from "./presets";

interface PresetAvatarPickerProps {
  disabled?: boolean;
  selectedPresetId?: string | null;
  onSelect: (preset: AvatarPreset) => void;
}

export function PresetAvatarPicker({
  disabled = false,
  selectedPresetId = null,
  onSelect,
}: PresetAvatarPickerProps) {
  return (
    <div className="preset-avatar-picker" aria-label="Choisir un avatar">
      <p className="preset-avatar-picker-title">Avatars</p>
      <div className="preset-avatar-picker-grid">
        {AVATAR_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              className={
                isSelected
                  ? "preset-avatar-picker-item selected"
                  : "preset-avatar-picker-item"
              }
              type="button"
              aria-label={`Avatar ${preset.id}`}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onSelect(preset);
                }
              }}
            >
              <img
                className="preset-avatar-picker-image"
                src={preset.url}
                alt=""
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { extractPresetAvatarFile };
