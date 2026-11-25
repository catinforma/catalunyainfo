/**
 * The inline formatter's grammar, without React: `**bold**`, `_italic_`,
 * `code` and `[label](url)`. `renderInline` (inline.tsx) builds the page's
 * elements from these tokens and `plainInline` gives their text, so the text
 * a crawler reads in a FAQPage's JSON-LD is the text the page shows.
 */

export type Token =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "code"; value: string }
  | { kind: "link"; label: string; href: string };

const PATTERN =
  /(\*\*[^*]+\*\*)|(_[^_]+_)|(`[^`]+`)|(\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\))/g;

export function tokenize(input: string): Token[] {
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

/** The text `renderInline` shows for `input`, with no markup (a link keeps its label). */
export function plainInline(input: string | undefined | null): string {
  if (!input) return "";
  return tokenize(input)
    .map((t) => {
      switch (t.kind) {
        case "bold":
          // The bold text is formatted in turn (a link inside bold).
          return plainInline(t.value);
        case "link":
          return t.label;
        default:
          return t.value;
      }
    })
    .join("");
}
