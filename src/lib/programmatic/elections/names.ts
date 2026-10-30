/**
 * Municipality names and URL slugs. Pure, shared by the snapshot script and
 * the pages, so a slug can never be computed two different ways.
 */

/**
 * Idescat lists names in sorting order ("Hospitalet de Llobregat, l'");
 * the official name in running text puts the article first, lower case.
 * Aranese "es" too ("Bòrdes, Es" -> "es Bòrdes"), as the holiday family does
 * (`articleFirst` in holidays/dogc.ts), so both families share the slug.
 */
export function displayName(sortName: string): string {
  const match = /^(.*), (l'|el|la|els|les|es)$/i.exec(sortName.trim());
  if (!match) return sortName.trim();
  const [, rest, found] = match;
  const article = found!.toLowerCase();
  return article === "l'" ? `l'${rest}` : `${article} ${rest}`;
}

/** "l'Hospitalet de Llobregat" -> "L'Hospitalet de Llobregat", for the start of a sentence or a title. */
export function capitalised(name: string): string {
  return name.charAt(0).toLocaleUpperCase("ca") + name.slice(1);
}

/** "l'Hospitalet de Llobregat" -> "l-hospitalet-de-llobregat"; "Palau-solità i Plegamans" -> "palau-solita-i-plegamans". */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/l·l/g, "ll")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
