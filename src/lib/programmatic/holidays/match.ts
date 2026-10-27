import { nameKey, type Amendment, type OrderComarca, type OrderEntry } from "./dogc";

/**
 * Finding a municipality in a parsed local-holiday order.
 *
 * The order is grouped by comarca, and the same name can appear more than once
 * across Catalonia (Cantallops is a municipality in the Alt Empordà and a
 * nucleus in two Alt Penedès municipalities), so every lookup is made inside
 * the municipality's own comarca.
 *
 * Two shapes occur:
 *  - `Figueres, 25 de maig i 29 de juny.` - the municipality's own entry;
 *  - `Franqueses del Vallès, les Bellavista, 15 de maig i 3 de juliol.
 *     Corró d'Amunt, …` - a municipality without days of its own, whose name
 *     runs straight into its first nucleus. Each nucleus then has an entry.
 */

/** Lower case, no accents, single spaces - the gazetteer order kept. */
export function rawKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function sameComarca(heading: string, comarca: string): boolean {
  return nameKey(heading) === nameKey(comarca);
}

export interface AppliedAmendment {
  /** The comarca whose entry was changed (the order's heading). */
  comarca: string;
  name: string;
  before: string[];
  after: string[];
  /**
   * Set when the amending order named another comarca. Ordre EMT/3/2026 puts
   * Polinyà under the Vallès Oriental; the 2026 order lists it under the
   * Vallès Occidental. The entry is applied only if its quoted old text
   * ("on diu") matches exactly one entry anywhere.
   */
  statedComarca: string | null;
}

/** Applies amending orders ("on diu … ha de dir …") to a copy of a parsed order. */
export function applyAmendments(comarques: OrderComarca[], amendments: Amendment[]): {
  comarques: OrderComarca[];
  applied: AppliedAmendment[];
  unmatched: { comarca: string; name: string; reason: string }[];
} {
  const copy = comarques.map((c) => ({ heading: c.heading, entries: c.entries.map((e) => ({ ...e, dates: [...e.dates] })) }));
  const applied: AppliedAmendment[] = [];
  const unmatched: { comarca: string; name: string; reason: string }[] = [];

  for (const amendment of amendments) {
    for (const replacement of amendment.entries) {
      const key = nameKey(replacement.name);
      const quoted = amendment.before.find((e) => nameKey(e.name) === key);
      const quotedDates = quoted ? [...quoted.dates].sort().join(",") : null;
      const matchesQuote = (entry: OrderEntry) =>
        quoted ? quoted.noProposal === entry.noProposal && [...entry.dates].sort().join(",") === quotedDates : true;

      const stated = copy.find((c) => sameComarca(c.heading, amendment.comarca));
      let target = stated;
      let entry = stated?.entries.find((e) => nameKey(e.name) === key);
      let statedComarca: string | null = null;

      if (!entry) {
        // Named under the wrong comarca: accept only a unique, exact match of the quoted text.
        const elsewhere = copy.flatMap((c) =>
          c.entries.filter((e) => nameKey(e.name) === key && quoted && matchesQuote(e)).map((e) => ({ c, e })),
        );
        if (elsewhere.length === 1) {
          target = elsewhere[0]!.c;
          entry = elsewhere[0]!.e;
          statedComarca = amendment.comarca;
        }
      }
      if (!target || !entry) {
        unmatched.push({ comarca: amendment.comarca, name: replacement.name, reason: "not found" });
        continue;
      }
      if (!matchesQuote(entry)) {
        unmatched.push({ comarca: amendment.comarca, name: replacement.name, reason: "the quoted text does not match the order" });
        continue;
      }
      applied.push({ comarca: target.heading, name: replacement.name, before: [...entry.dates], after: [...replacement.dates], statedComarca });
      entry.dates = [...replacement.dates];
      entry.noProposal = replacement.noProposal;
    }
  }
  return { comarques: copy, applied, unmatched };
}

export interface Located {
  entry: OrderEntry;
  index: number;
  /** "own": the municipality's entry; "first-nucleus": its name prefixes a nucleus entry. */
  shape: "own" | "first-nucleus";
}

/** The municipality's entry within its comarca, or null. Throws on ambiguity. */
export function locate(comarca: OrderComarca, dogcName: string): Located | null {
  const key = nameKey(dogcName);
  const own = comarca.entries.flatMap((entry, index) => (nameKey(entry.name) === key ? [{ entry, index }] : []));
  if (own.length > 1) throw new Error(`holidays: "${dogcName}" appears ${own.length} times in ${comarca.heading}`);
  if (own[0]) return { ...own[0], shape: "own" };

  const prefix = `${rawKey(dogcName)} `;
  const prefixed = comarca.entries.flatMap((entry, index) => (rawKey(entry.name).startsWith(prefix) ? [{ entry, index }] : []));
  if (prefixed.length > 1) throw new Error(`holidays: "${dogcName}" prefixes ${prefixed.length} entries in ${comarca.heading}`);
  if (prefixed[0]) return { ...prefixed[0], shape: "first-nucleus" };
  return null;
}

/**
 * The entries of a municipality's nuclei, given their names from the previous
 * order: they follow the municipality's entry (or are its first-nucleus
 * entry). Unknown names are not guessed - the caller reports them.
 */
export function nucleiAfter(
  comarca: OrderComarca,
  located: Located,
  parentDogcName: string,
  nucleusNames: readonly string[],
): { found: Map<string, OrderEntry>; missing: string[] } {
  const wanted = new Map(nucleusNames.map((name) => [nameKey(name), name]));
  const found = new Map<string, OrderEntry>();
  const parentPrefix = `${rawKey(parentDogcName)} `;

  const consider = (entry: OrderEntry): boolean => {
    let key = nameKey(entry.name);
    const raw = rawKey(entry.name);
    if (raw.startsWith(parentPrefix)) key = nameKey(entry.name.slice(parentPrefix.length));
    const name = wanted.get(key);
    if (!name || found.has(name)) return false;
    found.set(name, entry);
    return true;
  };

  if (located.shape === "first-nucleus") consider(located.entry);
  // Nuclei follow their municipality. A small window past the known count
  // tolerates one new or renamed nucleus without reaching into the next
  // municipality's list.
  const end = Math.min(comarca.entries.length, located.index + 1 + wanted.size + 2);
  for (let i = located.index + 1; i < end; i += 1) {
    const entry = comarca.entries[i];
    if (entry) consider(entry);
  }
  return { found, missing: nucleusNames.filter((name) => !found.has(name)) };
}
