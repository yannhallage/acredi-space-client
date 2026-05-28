import type { Presence } from '../types';

interface AvatarProps {
  name?: string | null;
  size?: number;
  presence?: Presence;
  ring?: string;
}

const palette = [
  { bg: '#3B3F8A', fg: '#C7CDFF' },
  { bg: '#7A3B6E', fg: '#FFD0E8' },
  { bg: '#2F5E4E', fg: '#B7F0D7' },
  { bg: '#6E4B2A', fg: '#FFD9A8' },
  { bg: '#4A3B7A', fg: '#D6C9FF' },
  { bg: '#2E5A77', fg: '#B9E4FF' },
  { bg: '#7A402F', fg: '#FFCBB7' },
  { bg: '#3F6B3F', fg: '#C7F0C7' }
];

function normalizeName(name: string | null | undefined) {
  return name?.trim() || 'Utilisateur';
}

function initialsFor(name: string | null | undefined) {
  const safeName = normalizeName(name);

  return safeName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFor(name: string | null | undefined) {
  const safeName = normalizeName(name);
  let hash = 0;
  for (let i = 0; i < safeName.length; i += 1) {
    hash = (hash * 31 + safeName.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export function Avatar({ name, size = 32, presence, ring }: AvatarProps) {
  const color = colorFor(name);
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <span
        className="avatar-face"
        style={{
          width: size,
          height: size,
          background: color.bg,
          color: color.fg,
          fontSize: Math.round(size * 0.38),
          boxShadow: ring ? `0 0 0 2px ${ring}` : undefined
        }}
      >
        {initialsFor(name)}
      </span>
      {presence ? <span className={`presence presence-${presence}`} /> : null}
    </span>
  );
}
