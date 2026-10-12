import { upcomingChanges, isSummerTime, type ClockChange as Change } from "@/lib/content/clock/rule";
import { daysBetween, shortDate, todayInCatalonia } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

/**
 * The next clock change in Catalonia, computed from the permanent rule in
 * Real Decreto 236/2002, with the days left and the one after it.
 *
 * Server-rendered and computed in Europe/Madrid; the route revalidates every
 * few minutes, so "today" is never a day out.
 */

const COPY: Record<
  Locale,
  {
    label: string;
    next: string;
    back: string;
    forward: string;
    today: string;
    tomorrow: string;
    days: string;
    after: string;
    afterBack: string;
    afterForward: string;
    nowSummer: string;
    nowWinter: string;
  }
> = {
  ca: {
    label: "Pròxim canvi d'hora",
    next: "Pròxim canvi d'hora: diumenge {date}",
    back: "A les 03:00 els rellotges tornen a les 02:00: el dia té 25 hores.",
    forward: "A les 02:00 els rellotges passen a les 03:00: el dia té 23 hores.",
    today: "És avui.",
    tomorrow: "És demà.",
    days: "Falten {n} dies.",
    after: "El següent: diumenge {date}, {what}.",
    afterBack: "quan es retarda una hora",
    afterForward: "quan s'avança una hora",
    nowSummer: "Ara som en horari d'estiu (UTC+2).",
    nowWinter: "Ara som en horari d'hivern (UTC+1).",
  },
  es: {
    label: "Próximo cambio de hora",
    next: "Próximo cambio de hora: domingo {date}",
    back: "A las 03:00 los relojes vuelven a las 02:00: el día tiene 25 horas.",
    forward: "A las 02:00 los relojes pasan a las 03:00: el día tiene 23 horas.",
    today: "Es hoy.",
    tomorrow: "Es mañana.",
    days: "Faltan {n} días.",
    after: "El siguiente: domingo {date}, {what}.",
    afterBack: "cuando se retrasa una hora",
    afterForward: "cuando se adelanta una hora",
    nowSummer: "Ahora estamos en horario de verano (UTC+2).",
    nowWinter: "Ahora estamos en horario de invierno (UTC+1).",
  },
  en: {
    label: "Next clock change",
    next: "Next clock change: Sunday {date}",
    back: "At 03:00 the clocks go back to 02:00: the day has 25 hours.",
    forward: "At 02:00 the clocks go forward to 03:00: the day has 23 hours.",
    today: "It is today.",
    tomorrow: "It is tomorrow.",
    days: "{n} days to go.",
    after: "The one after: Sunday {date}, {what}.",
    afterBack: "when they go back an hour",
    afterForward: "when they go forward an hour",
    nowSummer: "Catalonia is now on summer time (UTC+2).",
    nowWinter: "Catalonia is now on winter time (UTC+1).",
  },
};

export function ClockChange({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const today = todayInCatalonia();
  const [next, after] = upcomingChanges(today, 2) as [Change, Change];
  const withYear = (iso: string) => `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
  const n = daysBetween(today, next.date);
  const countdown = n === 0 ? t.today : n === 1 ? t.tomorrow : t.days.replace("{n}", String(n));

  return (
    <section className="ci-school" aria-label={t.label}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{t.next.replace("{date}", withYear(next.date))}</p>
        <p>
          {next.kind === "back" ? t.back : t.forward} {countdown}
        </p>
        <p className="ci-calc-note">
          {n === 0 ? "" : `${isSummerTime(today) ? t.nowSummer : t.nowWinter} `}
          {t.after
            .replace("{date}", withYear(after.date))
            .replace("{what}", after.kind === "back" ? t.afterBack : t.afterForward)}
        </p>
      </div>
    </section>
  );
}
