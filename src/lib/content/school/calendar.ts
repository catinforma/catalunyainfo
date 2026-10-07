/**
 * The school calendar for Catalonia, 2026-2027 to 2028-2029.
 *
 * Every date here is transcribed from Ordre EDF/66/2026, de 22 d'abril (DOGC
 * núm. 9653, 27.4.2026), checked against the published text on 7 Oct 2026.
 * One order sets three school years at once, so this file does not go stale
 * until September 2029; a test fails the build once today is past the last
 * year it covers, so the page can never quietly answer for a year it does not
 * know.
 *
 * What the order does not fix, and this file therefore does not pretend to:
 * each school's four free-choice days ("dies de lliure disposició"), and the
 * local holidays, which come from the local-holidays dataset.
 */

export const SCHOOL_SOURCE = {
  name: "Ordre EDF/66/2026, de 22 d'abril, calendari escolar dels cursos 2026-2027, 2027-2028 i 2028-2029",
  url: "https://portaldogc.gencat.cat/utilsEADOP/PDF/9653/2147443.pdf",
  publisher: "Departament d'Educació i Formació Professional — DOGC núm. 9653, 27.4.2026",
};

export const SCHOOL_VERIFIED_AT = "2026-10-07";

export interface SchoolYear {
  /** "2026-2027" */
  label: string;
  /** Infant (2nd cycle), primary, ESO, batxillerat, FP bàsica: 8 Sep, or the next working day if that is a holiday. */
  start: string;
  /** Last day for infant (2nd cycle), primary and ESO. */
  end: string;
  /** Last day of first-year batxillerat. Second year depends on the university-access calendar. */
  endBatxillerat1: string;
  /** Vocational training (GM, GS, PFI, IFE, preparatory courses) starts by this date at the latest. */
  startFP: string;
  /** Christmas holidays, both days inclusive. */
  christmas: [string, string];
  /** Easter holidays, both days inclusive. */
  easter: [string, string];
}

export const SCHOOL_YEARS: readonly SchoolYear[] = [
  {
    label: "2026-2027",
    start: "2026-09-08",
    end: "2027-06-21",
    endBatxillerat1: "2027-06-17",
    startFP: "2026-09-14",
    christmas: ["2026-12-22", "2027-01-07"],
    easter: ["2027-03-20", "2027-03-29"],
  },
  {
    label: "2027-2028",
    start: "2027-09-08",
    end: "2028-06-22",
    endBatxillerat1: "2028-06-20",
    startFP: "2027-09-13",
    christmas: ["2027-12-22", "2028-01-09"],
    easter: ["2028-04-08", "2028-04-17"],
  },
  {
    label: "2028-2029",
    start: "2028-09-08",
    end: "2029-06-22",
    endBatxillerat1: "2029-06-20",
    startFP: "2028-09-12",
    christmas: ["2028-12-22", "2029-01-07"],
    easter: ["2029-03-24", "2029-04-02"],
  },
];

export type SchoolStatus =
  | { kind: "christmas" | "easter"; year: SchoolYear; until: string }
  | { kind: "term"; year: SchoolYear; nextBreak: { kind: "christmas" | "easter" | "summer"; from: string } }
  | { kind: "summer"; nextStart: SchoolYear }
  | { kind: "unknown" };

/**
 * What the general calendar says about a date: inside a holiday period, in
 * term, or in the summer break. Weekends, Catalonia-wide holidays, local
 * holidays and each school's free-choice days are not resolved here; the
 * component says so next to the answer.
 */
export function schoolStatusOn(iso: string): SchoolStatus {
  for (const year of SCHOOL_YEARS) {
    if (iso >= year.christmas[0] && iso <= year.christmas[1]) {
      return { kind: "christmas", year, until: year.christmas[1] };
    }
    if (iso >= year.easter[0] && iso <= year.easter[1]) {
      return { kind: "easter", year, until: year.easter[1] };
    }
    if (iso >= year.start && iso <= year.end) {
      const nextBreak =
        iso < year.christmas[0]
          ? { kind: "christmas" as const, from: year.christmas[0] }
          : iso < year.easter[0]
            ? { kind: "easter" as const, from: year.easter[0] }
            : { kind: "summer" as const, from: year.end };
      return { kind: "term", year, nextBreak };
    }
  }
  // Summer only between two years this file knows; outside them, say nothing.
  for (let i = 0; i + 1 < SCHOOL_YEARS.length; i++) {
    const year = SCHOOL_YEARS[i]!;
    const next = SCHOOL_YEARS[i + 1]!;
    if (iso > year.end && iso < next.start) return { kind: "summer", nextStart: next };
  }
  return { kind: "unknown" };
}

/** Whether the calendar still has an answer for this date. */
export function isSchoolCovered(iso: string): boolean {
  return iso <= SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!.end;
}
