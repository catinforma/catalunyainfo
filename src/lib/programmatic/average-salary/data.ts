import snapshotJson from "./snapshot.json" with { type: "json" };

import type { SalarySnapshot } from "./ine";

/**
 * The committed INE snapshot behind "Salario medio en España"
 * (scripts/average-salary-snapshot.ts: `npm run salary:snapshot -- build`).
 * The page is static: it prints exactly this file, with its dates.
 *
 * Freshness (tests/average-salary.test.ts):
 *  - EPA wage deciles: the INE calendar (publication 348) schedules the 2025
 *    deciles for 25 Nov 2026; the test fails from the day after a scheduled
 *    release the snapshot does not yet hold.
 *  - EAES: the INE calendar (publication 163) does not list the 2025 survey
 *    yet (read 18 Nov 2026; 2023 came out on 28 May 2025, 2024 on 28 May
 *    2026). Until a rebuild records its date, the test fails on
 *    EAES_CALENDAR_RECHECK_BY: re-run `npm run salary:snapshot -- check`,
 *    then `build` so the snapshot carries the scheduled day.
 */

export const SALARY_SNAPSHOT = snapshotJson as SalarySnapshot;

/** Re-read the INE calendar for the next EAES release by this day when the snapshot has none. */
export const EAES_CALENDAR_RECHECK_BY = "2027-01-15";

/** The day the page's sources were last read (the snapshot's own day). */
export const SALARY_DATA_AS_OF = SALARY_SNAPSHOT.asOf;
