/**
 * Words of a query as a `to_tsquery` OR-expression ("fgc | horaris"), for the
 * fallback when every word together finds nothing. Letters and digits only,
 * so the expression is always valid; null when no word is left.
 */
export function anyWordTsQuery(query: string): string | null {
  const words = query
    .normalize("NFC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 2)
    .slice(0, 8);
  return words.length ? [...new Set(words)].join(" | ") : null;
}
