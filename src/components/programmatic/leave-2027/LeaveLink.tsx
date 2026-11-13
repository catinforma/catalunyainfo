import Link from "next/link";

import { caA } from "@/lib/programmatic/holidays/names";
import { LEAVE_YEAR, leaveLinkFor, leavePath, type LeaveLocale } from "@/lib/programmatic/leave-2027/copy";

/**
 * Links to the 2027 leave planner (`LeavePage.tsx`), kept apart so the town,
 * city and long weekends pages do not import the planner's page.
 */

const YEAR = LEAVE_YEAR;
const L = <T,>(locale: LeaveLocale, v: Record<LeaveLocale, T>): T => v[locale];

/** One sentence linking the planner, for the long weekends pages and the 2027 hubs. */
export function LeaveHubLink({ locale }: { locale: LeaveLocale }) {
  return (
    <p>
      {L(locale, {
        ca: "Tens uns dies de vacances i vols saber on posar-los?",
        es: "¿Tienes unos días de vacaciones y quieres saber dónde ponerlos?",
        en: "Got some leave and want to know where to put it?",
      })}{" "}
      <Link href={leavePath(locale)}>
        {L(locale, {
          ca: `Calcula el teu pla del ${YEAR}, municipi a municipi`,
          es: `Calcula tu plan de ${YEAR}, municipio a municipio`,
          en: `Work out your ${YEAR} plan, town by town`,
        })}
      </Link>
      .
    </p>
  );
}

/** On a town or city page: the planner with this place picked. */
export function LeavePlaceLink({ locale, placeId, place }: { locale: LeaveLocale; placeId: string; place: string }) {
  return (
    <p>
      <Link href={leaveLinkFor(locale, placeId)}>
        {L(locale, {
          ca: `Com aprofitar les vacances del ${YEAR} ${caA(place)}: quins dies demanar`,
          es: `Cómo aprovechar las vacaciones de ${YEAR} en ${place}: qué días pedir`,
          en: `Make the most of your ${YEAR} leave in ${place}: which days to book`,
        })}
      </Link>
    </p>
  );
}
