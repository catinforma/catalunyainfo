/**
 * Which fairs are Christmas fairs, and which season the pages cover. Pure: the
 * snapshot script and the tests use the same rules.
 *
 * A fair is a Christmas fair when its own name says so, in Catalan or in the
 * calendar's Spanish rendering: Nadal / nadalenc, Santa Llúcia (the fair that
 * opens the Christmas season), Reis, the tió, the avet (Christmas tree), the
 * pessebre (nativity scene), Navidad, belén, abeto, Christmas. Nothing else is
 * guessed. On 30 Oct 2026 that leaves out, on purpose:
 *   - the Fira del Gall of Vilafranca (19-20 Dec), whose organiser calls it "a
 *     long-standing event the weekend before the holidays", never a Christmas
 *     fair (firadelgall.vilafranca.cat, read 30 Oct 2026);
 *   - the Fira dels Torrons of Llinars, the Fira d'Hivern of Porqueres, the
 *     Puríssima and Sant Nicolau fairs and Vic's Mercat Medieval: December
 *     fairs whose name is not a Christmas one.
 *
 * An agenda activity counts only when its title says Christmas and it is a
 * fair or market: filed under "fires i mercats", or "fira" / "mercat" in its
 * title. Concerts, pastorets and Christmas shows are not markets.
 */

/** The season: fairs overlapping these days. Reis is 6 January; a Reis fair can close on the 7th. */
export const SEASON = { from: "2026-11-01", to: "2027-01-07" } as const;

/** The year in titles and headings: the season's December. */
export const SEASON_YEAR = Number(SEASON.from.slice(0, 4));

/** Lower case, no accents, "l·l" as "ll": a matching key. */
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/l·l|l\.l/g, "ll");
}

const CHRISTMAS_WORDS = /\b(nadal|nadals|nadalenc|nadalenca|nadalencs|nadalenques|santa llucia|reis|reyes|tio|avet|avets|pessebre|pessebres|navidad|navidena|navideno|navidenos|navidenas|belen|belenes|abeto|abetos|christmas)\b/;

/** Whether a fair's name says Christmas. */
export function isChristmasName(...names: (string | null | undefined)[]): boolean {
  return names.some((name) => Boolean(name) && CHRISTMAS_WORDS.test(fold(name!)));
}

/** Whether [start, end] overlaps the season. */
export function inSeason(start: string, end: string, season: { from: string; to: string } = SEASON): boolean {
  return Boolean(start) && start <= season.to && (end || start) >= season.from;
}

const MARKET_WORDS = /\b(fira|fires|firal|mercat|mercats|mercadet|mercadets|feria|ferias|mercado|mercados|mercadillo|market)\b/;

/** Whether an agenda row is a Christmas fair or market (any date; the caller checks the season). */
export function isChristmasAgendaMarket(row: { denominaci?: string; tags_categor_es?: string }): boolean {
  const title = row.denominaci ?? "";
  if (!isChristmasName(title)) return false;
  return (row.tags_categor_es ?? "").includes("categories/fires-i-mercats") || MARKET_WORDS.test(fold(title));
}

/**
 * The part of a registered name a title can carry: the segment (between ". ")
 * that says Christmas. "Mercat d'Artesans. Fira de Nadal" -> "Fira de Nadal";
 * "Fira de Santa Llúcia. Fira de la Punta al Coixí" -> "Fira de Santa Llúcia".
 */
export function shortFairName(name: string): string {
  const parts = name.split(/\.\s+/).map((p) => p.trim()).filter(Boolean);
  return parts.find((p) => isChristmasName(p)) ?? parts[0] ?? name.trim();
}
