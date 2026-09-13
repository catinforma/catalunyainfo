import { Fragment, type ReactNode } from "react";

import { isExternalHref, safeHref } from "./links";

/**
 * A minimal, safe inline formatter.
 *
 * It parses `**bold**`, `_italic_`, `` `code` `` and `[label](url)` into React
 * elements. It never produces HTML strings, so `dangerouslySetInnerHTML` is not
 * used anywhere in the rendering path and stored content cannot inject script.
 *
 * Links are validated: only http(s) and mailto survive, and anything pointing
 * off-site gets `rel="noopener"` plus an external marker.
 */

type Token =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; label: string; href: string };

const PATTERN =
  /(\*\*[^*]+\*\*)|(_[^_]+_)|(`[^`]+`)|(\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\))/g;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ kind: "text", value: input.slice(lastIndex, index) });
    }
    const raw = match[0];

    if (raw.startsWith("**")) {
      tokens.push({ kind: "bold", value: raw.slice(2, -2) });
    } else if (raw.startsWith("_")) {
      tokens.push({ kind: "italic", value: raw.slice(1, -1) });
    } else if (raw.startsWith("`")) {
      tokens.push({ kind: "code", value: raw.slice(1, -1) });
    } else {
      const split = raw.indexOf("](");
      const label = raw.slice(1, split);
      const href = raw.slice(split + 2, -1);
      tokens.push({ kind: "link", label, href });
    }
    lastIndex = index + raw.length;
  }

  if (lastIndex < input.length) {
    tokens.push({ kind: "text", value: input.slice(lastIndex) });
  }
  return tokens;
}

export function renderInline(input: string | undefined | null): ReactNode {
  if (!input) return null;
  const tokens = tokenize(input);

  return tokens.map((token, i) => {
    switch (token.kind) {
      case "bold":
        return <strong key={i}>{token.value}</strong>;
      case "italic":
        return <em key={i}>{token.value}</em>;
      case "code":
        return (
          <code key={i} className="ci-inline-code">
            {token.value}
          </code>
        );
      case "link": {
        const href = safeHref(token.href);
        if (!href) return <Fragment key={i}>{token.label}</Fragment>;
        const external = isExternalHref(href);
        return (
          <a
            key={i}
            href={href}
            {...(external
              ? {
                  rel: "noopener",
                  target: "_blank",
                  "data-external": "true",
                }
              : {})}
          >
            {token.label}
          </a>
        );
      }
      default:
        return <Fragment key={i}>{token.value}</Fragment>;
    }
  });
}

export { isExternalHref, safeHref };
