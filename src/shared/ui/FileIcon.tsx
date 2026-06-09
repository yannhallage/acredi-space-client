interface FileIconProps {
  ext: string;
  color: string;
  size?: number;
}

export function FileIcon({ ext, color, size = 32 }: FileIconProps) {
  return (
    <span className="file-icon" style={{ width: size, height: size, color, background: `${color}22` }}>
      {ext}
    </span>
  );
}
