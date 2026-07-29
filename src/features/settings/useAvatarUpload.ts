import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useUploadAvatarMutation } from '../../shared/api/users';
import { extractPresetAvatarFile } from '../../shared/avatars/PresetAvatarPicker';
import type { AvatarPreset } from '../../shared/avatars/presets';
import { useAuth } from '../../shared/context';
import { getAvatarErrorMessage, MAX_AVATAR_SIZE } from './utils';

export function useAvatarUpload() {
  const { user, updateUser } = useAuth();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const isUploadingAvatar = uploadAvatarMutation.isPending;
  const avatarSrc = avatarPreviewUrl ?? user?.avatarUrl ?? null;

  useEffect(() => {
    if (!avatarPreviewUrl?.startsWith('blob:')) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarMessage(null);
    setSelectedPresetId(null);

    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ type: 'error', text: 'Merci de choisir une image valide.' });
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarMessage({ type: 'error', text: 'La photo doit faire moins de 5 Mo.' });
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);

    try {
      const uploadedAvatar = await uploadAvatarMutation.mutateAsync(file);
      updateUser(uploadedAvatar);
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'success', text: 'Photo de profil mise a jour.' });
    } catch (error) {
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'error', text: getAvatarErrorMessage(error) });
    } finally {
      event.target.value = '';
    }
  }

  async function handlePresetAvatarSelect(preset: AvatarPreset) {
    setAvatarMessage(null);
    setSelectedPresetId(preset.id);
    setAvatarPreviewUrl(preset.url);

    try {
      const file = await extractPresetAvatarFile(preset);

      if (file.size > MAX_AVATAR_SIZE) {
        setSelectedPresetId(null);
        setAvatarPreviewUrl(null);
        setAvatarMessage({ type: 'error', text: 'La photo doit faire moins de 5 Mo.' });
        return;
      }

      const uploadedAvatar = await uploadAvatarMutation.mutateAsync(file);
      updateUser(uploadedAvatar);
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'success', text: 'Photo de profil mise a jour.' });
    } catch (error) {
      setSelectedPresetId(null);
      setAvatarPreviewUrl(null);
      setAvatarMessage({ type: 'error', text: getAvatarErrorMessage(error) });
    }
  }

  return {
    avatarMessage,
    avatarSrc,
    fileInputRef,
    handleAvatarChange,
    handlePresetAvatarSelect,
    isUploadingAvatar,
    selectedPresetId,
  };
}
