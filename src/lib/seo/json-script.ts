/**
 * JSON for an inline `<script type="application/ld+json">`.
 *
 * JSON.stringify leaves `<` as is, so a string value containing `</script>`
 * (a CMS title, an FAQ answer quoting markup) would close the element early
 * and print the rest of the structured data as page text. Every `<` becomes
 * the JSON escape `\u003c`, which JSON.parse reads back as `<`; U+2028 and
 * U+2029 are escaped too, as older script parsers treat them as line ends.
 *
 * The literal backslash matters: `"\u003c"` in TypeScript source is the
 * character `<` itself, which made the previous `replace` a no-op.
 */
export function jsonForScript(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
