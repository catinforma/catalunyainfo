/**
 * URL segment for a municipality: the official name, article first, in ASCII.
 *
 *   "l'Hospitalet de Llobregat" -> "l-hospitalet-de-llobregat"
 *   "Sant Feliu de Guíxols"     -> "sant-feliu-de-guixols"
 *   "Palau-solità i Plegamans"  -> "palau-solita-i-plegamans"
 *
 * Stable by construction: it depends on nothing but the name, and the tests pin
 * a known list so a change to this function cannot silently move URLs.
 */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/l·l|l\.l/g, "ll")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
