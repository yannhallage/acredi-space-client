import type { ReactNode } from "react";

const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,:;)\]}!?]/gi;

function stripTrailingPunctuation(value: string) {
  let url = value;
  let trailing = "";

  while (/[.,!?)\]}]$/.test(url)) {
    const char = url.at(-1);

    if (
      char === ")" &&
      (url.match(/\(/g)?.length ?? 0) >= (url.match(/\)/g)?.length ?? 0)
    ) {
      break;
    }

    trailing = `${char}${trailing}`;
    url = url.slice(0, -1);
  }

  return { url, trailing };
}

function toHref(url: string) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

type LinkifiedTextProps = {
  className?: string;
  linkClassName?: string;
  text: string;
};

export function LinkifiedText({
  text,
  className,
  linkClassName = "message-link",
}: LinkifiedTextProps) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX.source, URL_REGEX.flags);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawUrl = match[0];
    const { url, trailing } = stripTrailingPunctuation(rawUrl);

    if (!url) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <a
        key={`link-${match.index}-${url}`}
        href={toHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {url}
      </a>
    );

    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (!nodes.length) {
    return className ? <span className={className}>{text}</span> : text;
  }

  return className ? <span className={className}>{nodes}</span> : nodes;
}
