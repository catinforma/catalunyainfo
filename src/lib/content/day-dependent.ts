/**
 * Blocks whose output changes with the date: "is today a holiday", the school
 * calendar's "today", the clock-change countdown, this weekend's agenda and
 * the daily reservoir reading and tonight's metro hours.
 *
 * Pages carrying one are revalidated every night by the cron, and the sitemap
 * gives them today's date as `lastmod`: their main content genuinely changes
 * daily, and a `lastmod` frozen at the last republish told Google there was
 * nothing to recrawl while its copy said the wrong day.
 */
export const DAY_DEPENDENT_BLOCKS = ["holidayToday", "schoolCalendar", "clockChange", "weekendAgenda", "reservoirLevels", "metroTonight", "livingNativities", "snowDepth"];

/** Matches a block of one of those types in a body's jsonb text form. */
export const DAY_DEPENDENT_PATTERN = `"type":\\s*"(${DAY_DEPENDENT_BLOCKS.join("|")})"`;
