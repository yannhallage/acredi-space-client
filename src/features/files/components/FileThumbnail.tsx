import { useEffect, useRef, useState } from "react";

import type { WorkspaceFile } from "../../../shared/api/files";
import { FileIcon } from "../../../shared/ui";

import {
  getFileColor,
  getFileExtension,
  isImageFile,
} from "../filePreview";
import { useFilePreviewUrl } from "../filePreviewUrlCache";

export function FileThumbnail({ file }: { file: WorkspaceFile }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const isImage = isImageFile(file);
  const { error, loading, url } = useFilePreviewUrl(
    file.id,
    isImage && visible,
  );

  useEffect(() => {
    if (!isImage) {
      return;
    }

    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isImage]);

  if (!isImage || error) {
    return (
      <span
        ref={containerRef}
        className="files-file-thumbnail files-file-thumbnail-fallback"
      >
        <FileIcon
          ext={getFileExtension(file)}
          color={getFileColor(file)}
          size={46}
        />
      </span>
    );
  }

  if (loading || !url) {
    return (
      <span
        ref={containerRef}
        className="files-file-thumbnail files-file-thumbnail-loading"
        aria-hidden="true"
      />
    );
  }

  return (
    <span ref={containerRef} className="files-file-thumbnail">
      <img alt="" decoding="async" loading="lazy" src={url} />
      <span className="files-file-thumbnail-badge">
        {getFileExtension(file)}
      </span>
    </span>
  );
}
