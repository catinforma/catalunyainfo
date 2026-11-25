import { Fragment, type ReactNode } from "react";

import { isExternalHref, safeHref } from "./links";
import { tokenize } from "./inline-text";

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

export function renderInline(input: string | undefined | null): ReactNode {
  if (!input) return null;
  const tokens = tokenize(input);

  return tokens.map((token, i) => {
    switch (token.kind) {
      case "bold":
        // A link inside bold (`**[Blanes](/ca/festius/blanes/)**`) used to show
        // its raw markdown: the bold text is formatted in turn. It cannot
        // recurse for ever: the inner text has lost its own `**`.
        return <strong key={i}>{renderInline(token.value)}</strong>;
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
