import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

import type { WorkspaceFile } from "../../../../shared/api/files";
import { resolveAssetUrl } from "../../../../shared/api/http";
import { FileIcon, Icon } from "../../../../shared/ui";

import {
  getFileColor,
  getFileExtension,
  getPreviewKind,
  type PreviewState,
} from "../../filePreview";

function PreviewSpinner({ label = "Chargement de l'apercu" }: { label?: string }) {
  return (
    <div className="files-preview-loading" aria-live="polite" aria-busy="true">
      <ClipLoader color="#ffffff" size={42} />
      <span className="files-preview-loading-label">{label}</span>
    </div>
  );
}

function FileImageViewer({ alt, src }: { alt: string; src: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = resolveAssetUrl(src) ?? src;

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [resolvedSrc]);

  if (failed) {
    return (
      <div className="files-preview-empty">
        <Icon name="alert" size={34} />
        <strong>Apercu indisponible</strong>
        <p>Impossible d&apos;afficher cette image.</p>
      </div>
    );
  }

  return (
    <div className="files-image-viewer">
      {!loaded ? <PreviewSpinner /> : null}
      <img
        alt={alt}
        className="files-image-viewer-image"
        decoding="async"
        src={resolvedSrc}
        style={{ opacity: loaded ? 1 : 0 }}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export function FilePreviewContent({
  file,
  preview,
}: {
  file: WorkspaceFile;
  preview: PreviewState;
}) {
  const kind = getPreviewKind(file);

  if (preview.loading) {
    return <PreviewSpinner />;
  }

  if (preview.error) {
    return (
      <div className="files-preview-empty">
        <Icon name="alert" size={34} />
        <strong>Apercu indisponible</strong>
        <p>{preview.error}</p>
      </div>
    );
  }

  if (!preview.url || kind === "unsupported") {
    return (
      <div className="files-preview-empty">
        <FileIcon
          ext={getFileExtension(file)}
          color={getFileColor(file)}
          size={62}
        />
        <strong>Apercu indisponible</strong>
        <p>Ce format ne peut pas encore etre affiche dans la fenetre.</p>
      </div>
    );
  }

  if (kind === "image") {
    return <FileImageViewer alt={file.name} src={preview.url} />;
  }

  if (kind === "video") {
    return (
      <video
        className="files-preview-media"
        controls
        src={resolveAssetUrl(preview.url) ?? preview.url}
      />
    );
  }

  if (kind === "audio") {
    return (
      <div className="files-preview-audio">
        <FileIcon
          ext={getFileExtension(file)}
          color={getFileColor(file)}
          size={62}
        />
        <audio
          controls
          src={resolveAssetUrl(preview.url) ?? preview.url}
        />
      </div>
    );
  }

  return (
    <iframe
      className="files-preview-frame"
      src={resolveAssetUrl(preview.url) ?? preview.url}
      title={file.name}
    />
  );
}
