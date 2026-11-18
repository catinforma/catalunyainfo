import declarationsJson from "./declarations.json" with { type: "json" };

import type { CheckerTown, CommunityId, Context, Extension, GranRule, ZoneDecl } from "./copy";
import { RULES_AS_OF } from "./rules";

/**
 * The declared zones (declarations.json, built by
 * scripts/zonas-tensionadas-snapshot.ts from the Ministry of Housing's lists in
 * the BOE and the Generalitat's DOGC resolutions of 19 Oct 2026) and what the
 * page and the checker read from them. Server-side: the checker gets
 * `checkerTowns()` and `checkerContext()` as props.
 */

interface RawDeclaration {
  id: string;
  community: CommunityId;
  act: string;
  bulletin: string | null;
  url: string | null;
  also: { act: string; bulletin: string | null; url: string | null } | null;
  memoria: string | null;
  boe: string | null;
  from: string | null;
  until: string | null;
  granTenedor: { rule: GranRule; quote: string };
  neverRented: { applies: boolean; quote: string };
}

interface RawEntry {
  ine: string;
  name: string;
  community: CommunityId;
  area: string | null;
  declaration: string;
  extension: Extension;
}

export interface ZtData {
  boeIds: string[];
  boeErrata: string[];
  dogc: { act: string; dogc: string; published: string; url: string }[];
  builtOn: string;
  resolutions: { boe: string; quarter: string; title: string; published: string; from: string; until: string; url: string }[];
  extension: { act: string; number: string; date: string; bulletin: string; published: string; url: string; of: string; extended: number; notExtended: number };
  pending: { declaration: string; date: string; bulletin: string; published: string; url: string };
  declarations: RawDeclaration[];
  entries: RawEntry[];
  register: { source: string; catalonia: [string, string][] };
}

export const DATA = declarationsJson as unknown as ZtData;

export function declaration(id: string): RawDeclaration {
  const d = DATA.declarations.find((x) => x.id === id);
  if (!d) throw new Error(`unknown declaration ${id}`);
  return d;
}

export function boeUrl(id: string): string {
  return `https://www.boe.es/diario_boe/txt.php?id=${id}`;
}

/** The checker's context: every declaration in short, the Generalitat's two October 2026 acts, the day the data speaks for. */
export function checkerContext(): Context {
  const decls: Record<string, ZoneDecl> = {};
  for (const d of DATA.declarations)
    decls[d.id] = { id: d.id, community: d.community, act: d.act, bulletin: d.bulletin, url: d.url, boe: d.boe, from: d.from, until: d.until, rule: d.granTenedor.rule, neverRented: d.neverRented.applies };
  return { asOf: RULES_AS_OF, decls, extension: { number: DATA.extension.number, date: DATA.extension.date, published: DATA.extension.published }, pending: { date: DATA.pending.date, published: DATA.pending.published } };
}

const sortKey = (name: string) =>
  name
    .replace(/^(la |el |els |les |l'|a |o )/i, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

export const byName = (a: { name: string }, b: { name: string }) => sortKey(a.name).localeCompare(sortKey(b.name), "es");

/** Every town of Catalonia (INE register) plus every declared town elsewhere, each with its zones (none = not declared). */
export function checkerTowns(): CheckerTown[] {
  const towns = new Map<string, CheckerTown>();
  for (const [ine, name] of DATA.register.catalonia) towns.set(ine, { ine, name, community: "catalonia", zones: [] });
  for (const e of DATA.entries) {
    const t = towns.get(e.ine) ?? { ine: e.ine, name: e.name, community: e.community, zones: [] };
    // The declaration's spelling wins over the register's ("Castell d'Aro, Platja d'Aro i S'Agaró").
    t.name = e.name;
    t.zones.push({ decl: e.declaration, area: e.area, extension: e.extension });
    towns.set(e.ine, t);
  }
  return [...towns.values()].sort(byName);
}

export function checkerTown(ine: string): CheckerTown {
  const t = checkerTowns().find((x) => x.ine === ine);
  if (!t) throw new Error(`no town ${ine}`);
  return t;
}

/** Rows in a BOE list (the measures apply) and rows only declared by the Generalitat, per community. */
export function counts(): Record<CommunityId, { listed: number; pending: number; towns: number }> {
  const out = {} as Record<CommunityId, { listed: number; pending: number; towns: number }>;
  for (const c of ["catalonia", "basque-country", "navarre", "galicia", "asturias"] as CommunityId[]) {
    const rows = DATA.entries.filter((e) => e.community === c);
    const listed = rows.filter((e) => declaration(e.declaration).boe);
    out[c] = { listed: listed.length, pending: rows.length - listed.length, towns: new Set(listed.map((e) => e.ine)).size };
  }
  return out;
}

export interface ListGroup {
  decl: RawDeclaration;
  /** Catalonia's first zone is shown in two parts: the towns extended by TER/3739/2026 and the ones left out. */
  part: "extended" | "not-extended" | null;
  towns: RawEntry[];
}

/** The server-rendered list: per community, per declaration (newest BOE list first, the pending Catalan one first of all). */
export function listByCommunity(): { community: CommunityId; groups: ListGroup[] }[] {
  const order: CommunityId[] = ["catalonia", "basque-country", "navarre", "galicia", "asturias"];
  return order.map((community) => {
    const decls = DATA.declarations.filter((d) => d.community === community).sort((a, b) => (b.from ?? "9999").localeCompare(a.from ?? "9999"));
    const groups: ListGroup[] = [];
    for (const d of decls) {
      const towns = DATA.entries.filter((e) => e.declaration === d.id).sort(byName);
      if (towns.some((t) => t.extension)) {
        groups.push({ decl: d, part: "extended", towns: towns.filter((t) => t.extension === "extended") });
        groups.push({ decl: d, part: "not-extended", towns: towns.filter((t) => t.extension === "not-extended") });
      } else groups.push({ decl: d, part: null, towns });
    }
    return { community, groups };
  });
}

/** Large-landlord rule of each declaration in a BOE list, for the "5 or 10" table. */
export function granTable(): { decl: RawDeclaration; towns: RawEntry[] }[] {
  return DATA.declarations
    .filter((d) => d.boe)
    .map((d) => ({ decl: d, towns: DATA.entries.filter((e) => e.declaration === d.id).sort(byName) }))
    .sort((a, b) => a.decl.community.localeCompare(b.decl.community) || (a.decl.from ?? "").localeCompare(b.decl.from ?? ""));
}

/** Each zone's last day, for the date guard. */
export function expiries(): { decl: string; until: string; towns: number }[] {
  return DATA.declarations.filter((d) => d.until).map((d) => ({ decl: d.id, until: d.until!, towns: DATA.entries.filter((e) => e.declaration === d.id).length }));
}

/** The day the data was last built and the newest list it holds. */
export function latestList() {
  return [...DATA.resolutions].sort((a, b) => b.published.localeCompare(a.published))[0]!;
}
