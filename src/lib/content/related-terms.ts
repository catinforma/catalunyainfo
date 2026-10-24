/**
 * The words an article's related cards are matched on.
 *
 * Category alone put election pages under the metro guide: both are "guides".
 * Matching the candidates' text against the article's own title and excerpt
 * keeps the cards on the same subject. Words every page shares (the place
 * names, the years, "guide") would match everything, so they are dropped, as
 * are short words, which in three languages are mostly articles and
 * prepositions.
 */

const COMMON = new Set([
  "barcelona",
  "catalunya",
  "cataluna",
  "cataluña",
  "catalonia",
  "catalan",
  "catalana",
  "catalán",
  "guia",
  "guía",
  "guide",
  "guies",
  "guias",
  "guías",
  "guides",
  "2025",
  "2026",
  "2027",
  "avui",
  "today",
  "desde",
  "from",
  "with",
  "sense",
  "without",
  "what",
  "where",
  "when",
  "quan",
  "cuando",
  "dónde",
  "donde",
  "como",
  "cómo",
  "quin",
  "quins",
  "quina",
  "quines",
  "your",
  "this",
  "that",
  "para",
  "amb",
  "dels",
  "les",
  "los",
  "las",
  "una",
  "uns",
  "unes",
  "the",
  "and",
]);

/** At most this many words go into the query; the title's come first. */
const MAX_TERMS = 12;

export function relatedTerms(...texts: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const text of texts) {
    for (const word of (text ?? "").toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (word.length < 4 || COMMON.has(word) || seen.has(word)) continue;
      seen.add(word);
      if (seen.size === MAX_TERMS) return [...seen];
    }
  }
  return [...seen];
}
