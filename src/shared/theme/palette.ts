export interface Palette {
  mode: 'dark' | 'light';
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderSubtle: string;
  text: string;
  muted: string;
  mutedSoft: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  accent2Soft: string;
  markTop: string;
  green: string;
  greenSoft: string;
  amber: string;
  amberSoft: string;
  red: string;
  redSoft: string;
  slate: string;
  shadow: string;
}

export function getPalette(dark: boolean): Palette {
  if (dark) {
    return {
      mode: 'dark',
      bg: '#0F0F12',
      surface: '#18181B',
      surface2: '#1F1F23',
      surface3: '#27272A',
      border: '#27272A',
      borderSubtle: '#1F1F23',
      text: '#FAFAFA',
      muted: '#71717A',
      mutedSoft: '#A1A1AA',
      accent: '#5B6CFF',
      accent2: '#8B7FFF',
      accentSoft: 'rgba(91,108,255,0.14)',
      accent2Soft: 'rgba(139,127,255,0.14)',
      markTop: '#FFFFFF',
      green: '#22C55E',
      greenSoft: 'rgba(34,197,94,0.14)',
      amber: '#F59E0B',
      amberSoft: 'rgba(245,158,11,0.14)',
      red: '#EF4444',
      redSoft: 'rgba(239,68,68,0.14)',
      slate: '#94A3B8',
      shadow: '0 8px 24px rgba(0,0,0,0.4)'
    };
  }

  return {
    mode: 'light',
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    surface2: '#F4F4F5',
    surface3: '#E4E4E7',
    border: '#E4E4E7',
    borderSubtle: '#F4F4F5',
    text: '#0F0F12',
    muted: '#71717A',
    mutedSoft: '#52525B',
    accent: '#5B6CFF',
    accent2: '#8B7FFF',
    accentSoft: 'rgba(91,108,255,0.10)',
    accent2Soft: 'rgba(139,127,255,0.10)',
    markTop: '#0F0F12',
    green: '#16A34A',
    greenSoft: 'rgba(22,163,74,0.10)',
    amber: '#D97706',
    amberSoft: 'rgba(217,119,6,0.10)',
    red: '#DC2626',
    redSoft: 'rgba(220,38,38,0.08)',
    slate: '#64748B',
    shadow: '0 4px 16px rgba(0,0,0,0.04)'
  };
}
