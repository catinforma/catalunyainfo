import type { Candidacy, ProvinceKey } from "@/lib/content/candidates/boe";

/**
 * BOE corrections of the proclaimed lists, read by hand and applied to the
 * lists the page reads from the BOE.
 *
 * Why by hand: a correction is prose ("En la candidatura: … Donde dice: «…»
 * Debe decir: «…»"), and its quotes do not always match the original word for
 * word (the 29N one quotes "PARTIT COMUNISTA DEL TREBALLADORS" where the
 * proclaimed list says "DELS"), so a parser would have to guess. Each fix
 * below is one candidacy, copied from the correction, and it is applied only
 * when everything it expects is still in the list read from the BOE that day:
 * the candidacy's number and name, every suffix it strips, every name it
 * respells. If any check fails, none of that correction is applied and the
 * page keeps the original lists with the plain "not applied" warning, so a
 * stale fix can never edit a list it was not written for.
 *
 * Kept from the correction, not applied: changes to a candidacy's own name
 * that come with a renumbering ("5. VOX (VOX)" → "4. VOX", and the PCTC typo
 * above). Only the number moves; the name stays the proclaimed one.
 */

export interface ListFix {
  /** The proclaimed candidacy, exactly as the proclaimed item numbers and names it. */
  province: ProvinceKey;
  chamber: "congress" | "senate";
  number: number;
  name: string;
  /** Removed from the end of every candidate and substitute name in the list ("Debe decir" drops it). */
  stripSuffix?: string;
  /** Names respelled by the correction, compared after `stripSuffix`. */
  rename?: { from: string; to: string }[];
  /** The candidacy's number in the corrected text. */
  renumber?: number;
}

export interface ListCorrection {
  /** The BOE item. */
  id: string;
  /** Its publication day. */
  date: string;
  fixes: ListFix[];
}

/**
 * BOE-A-2026-23383, BOE núm. 278, 7 Nov 2026, "Corrección de errores de las
 * candidaturas proclamadas para las elecciones al Congreso de los Diputados y
 * al Senado, convocadas por Real Decreto 806/2026" (XML read 13 Nov 2026).
 * Catalan parts: Girona (Senate) and Tarragona (Congress and Senate).
 */
export const CORRECTIONS_29N: ListCorrection[] = [
  {
    id: "BOE-A-2026-23383",
    date: "2026-11-07",
    fixes: [
      {
        // «1. Etna Estrems Fayos (ERC-EH BILDU).» → «1. Etna Estrems Fayos.», all three and their substitutes.
        province: "girona",
        chamber: "senate",
        number: 3,
        name: "ESQUERRA REPUBLICANA DE CATALUNYA-EUSKAL HERRIA BILDU (ERC-EH BILDU)",
        stripSuffix: " (ERC-EH BILDU)",
      },
      {
        // «1. Ester Roca Domodel.» → «1. Ester Roca Domedel.», and no "(COMUNS-FRONT AMPLI)" on any name.
        province: "tarragona",
        chamber: "congress",
        number: 7,
        name: "Comuns-Front Ampli (COMUNS-FRONT AMPLI)",
        stripSuffix: " (COMUNS-FRONT AMPLI)",
        rename: [{ from: "Ester Roca Domodel", to: "Ester Roca Domedel" }],
      },
      {
        // «1. Noemí Llauradó Sans (ERC-EH-BILDU).» → «1. Noemí Llauradó Sans.», all three and their substitutes.
        province: "tarragona",
        chamber: "senate",
        number: 2,
        name: "ESQUERRA REPUBLICANA DE CATALUNYA-EUSKAL HERRIA BILDU (ERC-EH BILDU)",
        stripSuffix: " (ERC-EH-BILDU)",
      },
      {
        // «4. PARTIT COMUNISTA DEL TREBALLADORS DE CATALUNYA (PCTC)» → «5. …»
        province: "tarragona",
        chamber: "senate",
        number: 4,
        name: "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)",
        renumber: 5,
      },
      {
        // «5. VOX (VOX)» → «4. VOX»
        province: "tarragona",
        chamber: "senate",
        number: 5,
        name: "VOX (VOX)",
        renumber: 4,
      },
    ],
  },
];

export interface CorrectableLists {
  province: ProvinceKey;
  congress: Candidacy[];
  senate: Candidacy[];
}

function cloneCandidacy(candidacy: Candidacy): Candidacy {
  return {
    ...candidacy,
    corrections: [...(candidacy.corrections ?? [])],
    candidates: candidacy.candidates.map((candidate) => ({ ...candidate, substitutes: [...candidate.substitutes] })),
    substitutes: candidacy.substitutes.map((candidate) => ({ ...candidate, substitutes: [...candidate.substitutes] })),
  };
}

/** Every name a fix may touch: candidates, their Senate substitutes, the Congress substitutes. */
function allNames(candidacy: Candidacy): string[] {
  return [
    ...candidacy.candidates.flatMap((candidate) => [candidate.name, ...candidate.substitutes]),
    ...candidacy.substitutes.map((candidate) => candidate.name),
  ];
}

function mapNames(candidacy: Candidacy, fn: (name: string) => string): void {
  for (const candidate of [...candidacy.candidates, ...candidacy.substitutes]) {
    candidate.name = fn(candidate.name);
    candidate.substitutes = candidate.substitutes.map(fn);
  }
}

/** One fix on a copy of the lists; false (and the copy is to be dropped) when any expectation fails. */
function applyFix(lists: CorrectableLists[], fix: ListFix, id: string, renumbered: Set<string>): boolean {
  const province = lists.find((item) => item.province === fix.province);
  if (!province) return false;
  const candidacy = province[fix.chamber].find((item) => item.number === fix.number && item.name === fix.name);
  if (!candidacy || candidacy.status !== "listed" || candidacy.candidates.length === 0) return false;
  if (candidacy.corrections?.includes(id)) return false;

  if (fix.stripSuffix) {
    const suffix = fix.stripSuffix;
    if (!allNames(candidacy).every((name) => name.endsWith(suffix) && name.length > suffix.length)) return false;
    mapNames(candidacy, (name) => name.slice(0, -suffix.length).trim());
  }
  for (const { from, to } of fix.rename ?? []) {
    if (allNames(candidacy).filter((name) => name === from).length !== 1) return false;
    mapNames(candidacy, (name) => (name === from ? to : name));
  }
  if (fix.renumber !== undefined) {
    candidacy.number = fix.renumber;
    renumbered.add(`${fix.province}/${fix.chamber}`);
  }
  candidacy.corrections = [...(candidacy.corrections ?? []), id];
  return true;
}

/**
 * The lists with every correction in `available` (ids the page found in the
 * BOE that day) applied, each one all or nothing, and the ids actually
 * applied. The input is never modified. A chamber whose numbers were moved is
 * re-sorted by number, and a correction that would leave two candidacies with
 * one number is dropped.
 */
export function applyCorrections<T extends CorrectableLists>(
  lists: T[],
  available: Set<string>,
  corrections: ListCorrection[] = CORRECTIONS_29N,
): { lists: T[]; applied: string[] } {
  let current = lists;
  const applied: string[] = [];
  for (const correction of corrections) {
    if (!available.has(correction.id)) continue;
    const copy = current.map((item) => ({
      ...item,
      congress: item.congress.map(cloneCandidacy),
      senate: item.senate.map(cloneCandidacy),
    }));
    const renumbered = new Set<string>();
    if (!correction.fixes.every((fix) => applyFix(copy, fix, correction.id, renumbered))) continue;
    let clash = false;
    for (const item of copy) {
      for (const chamber of ["congress", "senate"] as const) {
        if (!renumbered.has(`${item.province}/${chamber}`)) continue;
        const numbers = item[chamber].map((candidacy) => candidacy.number).filter((n): n is number => n !== null);
        if (new Set(numbers).size !== numbers.length) clash = true;
        item[chamber].sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity));
      }
    }
    if (clash) continue;
    current = copy;
    applied.push(correction.id);
  }
  return { lists: current, applied };
}
