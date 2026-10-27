/**
 * Place names inside sentences.
 *
 * Catalan contracts and elides: "del Vendrell", "d'Igualada", "al Prat",
 * "a l'Hospitalet". Spanish keeps the article of an official name and
 * capitalises it, as the RAE recommends for names that include it: "de El
 * Vendrell", "en L'Hospitalet de Llobregat".
 */

const VOWEL = /^[aeiouàèéíïòóúüh]/i;

/** "el Vendrell" -> "del Vendrell"; "Igualada" -> "d'Igualada"; "la Garriga" -> "de la Garriga". */
export function caDe(name: string): string {
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(la|les) /.test(name) || name.startsWith("l'")) return `de ${name}`;
  return VOWEL.test(name) ? `d'${name}` : `de ${name}`;
}

/** "el Vendrell" -> "al Vendrell"; "la Garriga" -> "a la Garriga". */
export function caA(name: string): string {
  if (name.startsWith("el ")) return `al ${name.slice(3)}`;
  if (name.startsWith("els ")) return `als ${name.slice(4)}`;
  return `a ${name}`;
}

/** Spanish display: "El Vendrell", "L'Hospitalet de Llobregat", "Les Franqueses del Vallès". */
export function esName(name: string): string {
  // Only the article-first names start in lower case.
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Sentence start in Catalan: "El Vendrell", "L'Hospitalet". */
export function caStart(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Catalan comarques with their article, for "del Baix Llobregat", "de la
 * Selva", "d'Osona". Osona takes none.
 */
const COMARCA_ARTICLE: Record<string, "el" | "la" | "les" | "l'" | ""> = {
  "Alt Camp": "l'",
  "Alt Empordà": "l'",
  "Alt Penedès": "l'",
  "Alt Urgell": "l'",
  "Alta Ribagorça": "l'",
  Anoia: "l'",
  Aran: "l'",
  Bages: "el",
  "Baix Camp": "el",
  "Baix Ebre": "el",
  "Baix Empordà": "el",
  "Baix Llobregat": "el",
  "Baix Penedès": "el",
  Barcelonès: "el",
  Berguedà: "el",
  Cerdanya: "la",
  "Conca de Barberà": "la",
  Garraf: "el",
  Garrigues: "les",
  Garrotxa: "la",
  Gironès: "el",
  Lluçanès: "el",
  Maresme: "el",
  Moianès: "el",
  Montsià: "el",
  Noguera: "la",
  Osona: "",
  "Pallars Jussà": "el",
  "Pallars Sobirà": "el",
  "Pla d'Urgell": "el",
  "Pla de l'Estany": "el",
  Priorat: "el",
  "Ribera d'Ebre": "la",
  Ripollès: "el",
  Segarra: "la",
  Segrià: "el",
  Selva: "la",
  Solsonès: "el",
  Tarragonès: "el",
  "Terra Alta": "la",
  Urgell: "l'",
  "Vallès Occidental": "el",
  "Vallès Oriental": "el",
};

/** "el Baix Llobregat", "l'Alt Empordà", "Osona". */
export function caComarca(comarca: string): string {
  const article = COMARCA_ARTICLE[comarca] ?? "";
  if (article === "l'") return `l'${comarca}`;
  return article ? `${article} ${comarca}` : comarca;
}

export function knownComarca(comarca: string): boolean {
  return comarca in COMARCA_ARTICLE;
}

/** Joins with commas and a final "i" / "y" / "and". */
export function joinList(items: readonly string[], lang: "ca" | "es" | "en"): string {
  if (items.length <= 1) return items[0] ?? "";
  const last = items.at(-1) ?? "";
  const word = lang === "ca" ? "i" : lang === "es" ? (/^h?i/i.test(last) && !/^hi[aeiou]/i.test(last) ? "e" : "y") : "and";
  return `${items.slice(0, -1).join(", ")} ${word} ${last}`;
}
