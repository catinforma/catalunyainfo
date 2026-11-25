import Link from "next/link";

import { marketsTownPath } from "@/lib/programmatic/weekly-markets/paths";
import type { MkLocale } from "@/lib/programmatic/weekly-markets/types";

/**
 * One line that points a weekend or agenda reader to the weekly street
 * markets of Vic and Mataró ("is there a market on Saturday, where, does the
 * holiday change it?"), a different answer from the fairs and activities the
 * page lists. Anchor words are the queries': "mercat setmanal de Vic",
 * "mercados semanales de Mataró", "weekly market in Vic". Pure and
 * server-rendered; `towns` limits the line to the towns inside the page's zone.
 */

export type MarketTown = "vic" | "mataro";

const TEXT: Record<MkLocale, { lead: string; vic: string; mataro: string; and: string; tail: string }> = {
  ca: { lead: "Els mercats de cada setmana no surten a la llista d'activitats:", vic: "mercat setmanal de Vic", mataro: "mercats setmanals de Mataró", and: " i ", tail: ", amb dia, plaça i canvis pels festius." },
  es: { lead: "Los mercados de cada semana no salen en la lista de actividades:", vic: "mercado semanal de Vic", mataro: "mercados semanales de Mataró", and: " y ", tail: ", con día, plaza y cambios por festivos." },
  en: { lead: "Weekly street markets are not in the activities list:", vic: "weekly market in Vic", mataro: "weekly markets in Mataró", and: " and ", tail: ", with day, square and holiday changes." },
};

export function MarketsContextLine({ locale, towns = ["vic", "mataro"], className = "ci-agenda-note" }: { locale: MkLocale; towns?: readonly MarketTown[]; className?: string }) {
  if (towns.length === 0) return null;
  const t = TEXT[locale];
  return (
    <p className={className} data-ci="markets-context">
      {t.lead}{" "}
      {towns.map((town, i) => (
        <span key={town}>
          {i > 0 ? t.and : null}
          <Link href={marketsTownPath(locale, town)}>{t[town]}</Link>
        </span>
      ))}
      {t.tail}
    </p>
  );
}

/** The towns of the pilot inside a weekend zone (a province or a comarca page), by zone id. */
export function marketTownsInZone(zoneId: string): MarketTown[] {
  if (zoneId === "provincia-barcelona") return ["vic", "mataro"];
  if (zoneId === "maresme") return ["mataro"];
  return [];
}
