import preset01 from "../../assets/avatars/presets/preset-01.png";
import preset02 from "../../assets/avatars/presets/preset-02.png";
import preset03 from "../../assets/avatars/presets/preset-03.png";
import preset04 from "../../assets/avatars/presets/preset-04.png";
import preset05 from "../../assets/avatars/presets/preset-05.png";
import preset06 from "../../assets/avatars/presets/preset-06.png";
import preset07 from "../../assets/avatars/presets/preset-07.png";
import preset08 from "../../assets/avatars/presets/preset-08.png";
import preset09 from "../../assets/avatars/presets/preset-09.png";
import preset10 from "../../assets/avatars/presets/preset-10.png";
import preset11 from "../../assets/avatars/presets/preset-11.png";
import preset12 from "../../assets/avatars/presets/preset-12.png";
import preset13 from "../../assets/avatars/presets/preset-13.png";
import preset14 from "../../assets/avatars/presets/preset-14.png";
import preset15 from "../../assets/avatars/presets/preset-15.png";
import preset16 from "../../assets/avatars/presets/preset-16.png";

export type AvatarPreset = {
  id: string;
  url: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "preset-01", url: preset01 },
  { id: "preset-02", url: preset02 },
  { id: "preset-03", url: preset03 },
  { id: "preset-04", url: preset04 },
  { id: "preset-05", url: preset05 },
  { id: "preset-06", url: preset06 },
  { id: "preset-07", url: preset07 },
  { id: "preset-08", url: preset08 },
  { id: "preset-09", url: preset09 },
  { id: "preset-10", url: preset10 },
  { id: "preset-11", url: preset11 },
  { id: "preset-12", url: preset12 },
  { id: "preset-13", url: preset13 },
  { id: "preset-14", url: preset14 },
  { id: "preset-15", url: preset15 },
  { id: "preset-16", url: preset16 },
];

export async function extractPresetAvatarFile(preset: AvatarPreset) {
  const response = await fetch(preset.url);

  if (!response.ok) {
    throw new Error("Impossible de charger l'avatar selectionne.");
  }

  const blob = await response.blob();

  return new File([blob], `${preset.id}.png`, {
    type: blob.type || "image/png",
  });
}
