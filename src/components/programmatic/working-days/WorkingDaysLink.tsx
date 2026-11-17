import Link from "next/link";

import { caA } from "@/lib/programmatic/holidays/names";
import { workingDaysLinkFor, workingDaysPath, type WdLocale } from "@/lib/programmatic/working-days/copy";

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
