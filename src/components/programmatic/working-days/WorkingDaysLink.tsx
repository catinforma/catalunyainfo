import Link from "next/link";

import { caA } from "@/lib/programmatic/holidays/names";
import { communityPlaceId, workingDaysLinkFor, workingDaysPath, type WdLocale } from "@/lib/programmatic/working-days/copy";

/**
 * One sentence linking the working-days calculator, for the 2027 work
 * calendar hubs and the leave planner (kept apart so they do not import the
 * calculator's page).
 */
export function WorkingDaysHubLink({ locale }: { locale: WdLocale }) {
  const t = {
    es: ["¿Tienes un plazo que vence con estos festivos?", "Calcula los días hábiles y el último día del plazo en tu municipio"],
    ca: ["Tens un termini que venç amb aquests festius?", "Calcula els dies hàbils i l'últim dia del termini al teu municipi"],
    en: ["Got a deadline running over these holidays?", "Work out the working days and the last day of the deadline where you are"],
  }[locale];
  return (
    <p>
      {t[0]} <Link href={workingDaysPath(locale)}>{t[1]}</Link>.
    </p>
  );
}

/**
 * On a town or city page: the calculator with this place picked. Its local
 * holidays are dias inhabiles for an administrative deadline there (Ley
 * 39/2015 art. 30.6-30.7), which is why the page is the natural way in. Before
 * this link (site audit, 17 Nov 2026) the calculators were linked almost only
 * from each other and the hub.
 */
export function WorkingDaysPlaceLink({ locale, placeId, place }: { locale: WdLocale; placeId: string; place: string }) {
  const text = {
    es: `Plazos en días hábiles en ${place}: calcula el último día con sus festivos locales`,
    ca: `Terminis en dies hàbils ${caA(place)}: calcula l'últim dia amb els seus festius locals`,
    en: `Deadlines in working days in ${place}: work out the last day with its local holidays`,
  }[locale];
  return (
    <p>
      <Link href={workingDaysLinkFor(locale, placeId)}>{text}</Link>
    </p>
  );
}

/**
 * On a Spain 2027 community page (19 Nov 2026): the calculator with the whole
 * community picked (`<community slug>/all`, the planner's value), whose
 * regional holidays are inhábiles there (Ley 39/2015 art. 30.6-30.7).
 * `inPlace` is the page's own "en la Comunidad de Madrid" / "a l'Aragó" /
 * "in the Basque Country". No local days at that level, so no "locales".
 * Catalonia is the planner's own first item (CATALONIA_ID), not "<slug>/all" (`communityPlaceId`).
 */
export function WorkingDaysCommunityLink({ locale, region, esSlug, inPlace }: { locale: WdLocale; region: string; esSlug: string; inPlace: string }) {
  const placeId = communityPlaceId(region, esSlug);
  const text = {
    es: `Plazos en días hábiles ${inPlace}: calcula el último día con sus festivos`,
    ca: `Terminis en dies hàbils ${inPlace}: calcula l'últim dia amb els seus festius`,
    en: `Deadlines in working days ${inPlace}: work out the last day with its holidays`,
  }[locale];
  return (
    <p>
      <Link href={workingDaysLinkFor(locale, placeId)}>{text}</Link>
    </p>
  );
}
