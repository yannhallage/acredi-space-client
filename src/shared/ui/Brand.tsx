import acrediSpaceLogo from '../../assets/acredi-space-logo.png';
// import { useTheme } from '../theme';

interface AcrediMarkProps {
  size?: number;
  top?: string;
  left?: string;
  right?: string;
}

export function AcrediMark({ size = 32, top = '#FFFFFF', left = '#8B7FFF', right = '#5B6CFF' }: AcrediMarkProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 64 64" className="brand-mark">
      <polygon fill={top} points="32,6 54.5,19 32,32 9.5,19" />
      <polygon fill={left} points="9.5,19 32,32 32,58 9.5,45" />
      <polygon fill={right} points="54.5,19 54.5,45 32,58 32,32" />
    </svg>
  );
}

interface AcrediLockupProps {
  size?: number;
  fontSize?: number;
  /** Force colors suited to a light surface (e.g. auth card). */
  onLight?: boolean;
}

export function AcrediLockup({ size = 28, fontSize: _fontSize, onLight: _onLight = false }: AcrediLockupProps) {
  // const { palette } = useTheme();
  // const markTop = onLight ? '#0F0F12' : palette.markTop;

  // return (
  //   <span className="brand-lockup">
  //     <AcrediMark size={size} top={markTop} />
  //     <span className="brand-wordmark" style={{ fontSize: fontSize ?? Math.round(size * 0.78) }}>
  //       <strong>Acredi</strong>
  //       <span>Space</span>
  //     </span>
  //   </span>
  // );

  const logoWidth = Math.round(size * 3.6);

  return (
    <span className="brand-lockup">
      <img
        src={acrediSpaceLogo}
        alt="acredi space"
        className="brand-logo"
        style={{
          height: size,
          width: logoWidth,
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </span>
  );
}
