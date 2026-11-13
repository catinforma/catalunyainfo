import Link from "next/link";

import { workingDaysPath, type WdLocale } from "@/lib/programmatic/working-days/copy";

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
