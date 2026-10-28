/**
 * Municipality names as the two sources write them, brought to the official
 * article-first form ("l'Hospitalet de Llobregat", "la Jonquera").
 *
 *   Ministry: "Hospitalet de Llobregat (L')", "Jonquera (La)"
 *   Idescat:  "Hospitalet de Llobregat, l'", "Jonquera, la", "Bòrdes, Es"
 */

function articleFirst(article: string, name: string, lower: boolean): string {
  const a = lower ? article.toLowerCase() : article;
  return a.endsWith("'") ? `${a}${name}` : `${a} ${name}`;
}

/** Idescat's "Name, article" to "article Name"; other names unchanged. */
export function fromIdescat(name: string): string {
  const m = /^(.*), ([^,]+)$/.exec(name.trim());
  // Only a trailing article, not a list of places ("Saus, Camallera i Llampaies").
  if (!m || !/^(el|la|les|els|l'|es|era|eth|des|sa|s')$/i.test(m[2]!)) return name.trim();
  // Aranese articles keep their capital ("Es Bòrdes", "Era Bòrdes"); Catalan ones go lower case.
  return articleFirst(m[2]!, m[1]!, !/^(es|era|eth)$/i.test(m[2]!));
}

/** The Ministry's "Name (Article)" to "article Name", lower-case article. */
export function fromMinistry(name: string): string {
  const m = /^(.*) \(([^)]+)\)$/.exec(name.trim());
  if (!m) return name.trim();
  return articleFirst(m[2]!, m[1]!, true);
}

/** Matching key: no accents, no punctuation, lower case. */
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/l·l|l\.l/g, "ll")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
