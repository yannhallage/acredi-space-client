import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { getPalette, type Palette } from './palette';

interface ThemeContextValue {
  dark: boolean;
  palette: Palette;
  setDark: (dark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function paletteVars(palette: Palette): CSSProperties {
  return {
    '--bg': palette.bg,
    '--surface': palette.surface,
    '--surface-2': palette.surface2,
    '--surface-3': palette.surface3,
    '--border': palette.border,
    '--border-subtle': palette.borderSubtle,
    '--text': palette.text,
    '--muted': palette.muted,
    '--muted-soft': palette.mutedSoft,
    '--accent': palette.accent,
    '--accent-2': palette.accent2,
    '--accent-soft': palette.accentSoft,
    '--accent-2-soft': palette.accent2Soft,
    '--green': palette.green,
    '--green-soft': palette.greenSoft,
    '--amber': palette.amber,
    '--amber-soft': palette.amberSoft,
    '--red': palette.red,
    '--red-soft': palette.redSoft,
    '--slate': palette.slate,
    '--shadow': palette.shadow
  } as CSSProperties;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('acredi-theme') !== 'light');
  const palette = useMemo(() => getPalette(dark), [dark]);
  const value = useMemo(
    () => ({
      dark,
      palette,
      setDark: (nextDark: boolean) => {
        localStorage.setItem('acredi-theme', nextDark ? 'dark' : 'light');
        setDark(nextDark);
      },
      toggleTheme: () => {
        setDark((current) => {
          const next = !current;
          localStorage.setItem('acredi-theme', next ? 'dark' : 'light');
          return next;
        });
      }
    }),
    [dark, palette]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-root" data-theme={palette.mode} style={paletteVars(palette)}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
