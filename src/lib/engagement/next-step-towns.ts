import type { Locale } from "@/lib/i18n/config";
import { townH1 } from "@/lib/programmatic/christmas-fairs/copy";
import { familyLastChecked, hasEnglish, townBySlug } from "@/lib/programmatic/christmas-fairs/data";
import { townPath } from "@/lib/programmatic/christmas-fairs/paths";
import { caA } from "@/lib/programmatic/holidays/names";
import { LEAVE_YEAR, leaveLinkFor } from "@/lib/programmatic/leave-2027/copy";
import { workingDaysLinkFor } from "@/lib/programmatic/working-days/copy";

import { nextStep, type NextStep, type NextStepLink } from "./next-step-core";

/**
 * The town holiday pages' "next useful step" (why and rules: lib/engagement/next-step.ts):
 * the 2027 leave planner with the town picked, then the town's Christmas fair
 * page while its season is on, else the working-days calculator with the town
 * picked. Kept apart from next-step.ts so the content pages do not load the
 * fairs snapshot.
 *
 * The anchors are the sentences that already link the planner and the
 * calculator lower on the page (LeaveLink.tsx, WorkingDaysLink.tsx) and the
 * fair page's own H1.
 */

/** "/ca/festius/2027/aprofitar-vacances/#p=mataro" with the town page's words. */
export function leavePlaceStep(locale: Locale, placeId: string, place: string): NextStepLink {
  const label = {
    ca: `Com aprofitar les vacances del ${LEAVE_YEAR} ${caA(place)}: quins dies demanar`,
    es: `Cómo aprovechar las vacaciones de ${LEAVE_YEAR} en ${place}: qué días pedir`,
    en: `Make the most of your ${LEAVE_YEAR} leave in ${place}: which days to book`,
  }[locale];
  return { href: leaveLinkFor(locale, placeId), label };
}

export function workingDaysPlaceStep(locale: Locale, placeId: string, place: string): NextStepLink {
  const label = {
    ca: `Terminis en dies hàbils ${caA(place)}: calcula l'últim dia amb els seus festius locals`,
    es: `Plazos en días hábiles en ${place}: calcula el último día con sus festivos locales`,
    en: `Deadlines in working days in ${place}: work out the last day with its local holidays`,
  }[locale];
  return { href: workingDaysLinkFor(locale, placeId), label };
}

/** The town's Christmas fair page, while one of its fairs is still to end; English only for the towns with an English page. */
export function fairStep(slug: string, locale: Locale, today: string): NextStepLink | null {
  const town = townBySlug(slug);
  if (!town) return null;
  if (locale === "en" && !hasEnglish(town)) return null;
  if (!town.fairs.some((fair) => fair.end && fair.end >= today)) return null;
  return { href: townPath(locale, town.slug), label: townH1(town, locale) };
}

/**
 * `today`: the page's build date (the Catalan and Spanish town pages already
 * print it). Without one (the English town pages, which never read the
 * clock), the day the fairs were last read decides, as on the fair pages.
 */
export function townNextStep(slug: string, place: string, locale: Locale, self: string, today: string = familyLastChecked()): NextStep | null {
  return nextStep("holidays", [leavePlaceStep(locale, slug, place), fairStep(slug, locale, today) ?? workingDaysPlaceStep(locale, slug, place)], self);
}
