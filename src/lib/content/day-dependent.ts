/**
 * Blocks whose output changes with the date: "is today a holiday", the school
 * calendar's "today", the clock-change countdown, this weekend's agenda and
 * the daily reservoir reading, tonight's metro hours and whether shops may
 * open today in Barcelona (`shopsToday`, 23 Nov 2026) and whether the blue and
 * green parking zones are charged today (`parkingToday`, 24 Nov 2026) and
 * whether a Renfe or Rodalies strike is on or next (`railStrikeNext`, 24 Nov 2026).
 *
 * Pages carrying one are revalidated every night by the cron, and the sitemap
 * gives them today's date as `lastmod`: their main content genuinely changes
 * daily, and a `lastmod` frozen at the last republish told Google there was
 * nothing to recrawl while its copy said the wrong day.
 */
export const DAY_DEPENDENT_BLOCKS = ["holidayToday", "schoolCalendar", "clockChange", "weekendAgenda", "reservoirLevels", "metroTonight", "livingNativities", "snowDepth", "candidateLists", "spainSchoolCalendar", "shopsToday", "shopsSundays", "parkingToday", "railStrikeNext"];

/**
 * Blocks that change on a few known dates rather than every day: an
 * `electionPhased` stretch of a 29N guide reads differently from 30 Nov and from
 * 8 Dec (24 Nov 2026). The nightly cron re-renders pages carrying one, so the
 * switch needs no publish, but the sitemap does not date them "today" (their
 * `lastmod` moves at the phase start, `electionPhaseStart`, not every night).
 */
export const PHASE_DEPENDENT_BLOCKS = ["electionPhased"];

/** Matches a block of one of those types in a body's jsonb text form: the sitemap's "changes daily". */
export const DAY_DEPENDENT_PATTERN = `"type":\\s*"(${DAY_DEPENDENT_BLOCKS.join("|")})"`;

/** Same, plus the phase-dependent blocks: every page the nightly cron must re-render. */
export const REVALIDATE_NIGHTLY_PATTERN = `"type":\\s*"(${[...DAY_DEPENDENT_BLOCKS, ...PHASE_DEPENDENT_BLOCKS].join("|")})"`;

/** Matches an `electionPhased` block in a body's jsonb text form. */
export const PHASE_DEPENDENT_PATTERN = `"type":\\s*"(${PHASE_DEPENDENT_BLOCKS.join("|")})"`;
