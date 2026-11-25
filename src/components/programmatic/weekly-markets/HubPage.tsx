import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareBar } from "@/components/share/ShareBar";
import { hubView } from "@/lib/programmatic/weekly-markets/copy";
import { CENSUS_LINKS } from "@/lib/programmatic/weekly-markets/data";
import { type Clock } from "@/lib/programmatic/weekly-markets/logic";
import { marketsHubPath, marketsTownPath } from "@/lib/programmatic/weekly-markets/paths";
import type { MkLocale } from "@/lib/programmatic/weekly-markets/types";

import { hubCrumbs } from "./TownPage";

const LINK_LABELS: Record<MkLocale, { census: string; data: string; diba: string }> = {
  ca: { census: "Cens de mercats setmanals (CCAM)", data: "Dades obertes del cens", diba: "Cercador de la Diputació de Barcelona" },
  es: { census: "Censo de mercados semanales (CCAM)", data: "Datos abiertos del censo", diba: "Buscador de la Diputación de Barcelona" },
  en: { census: "Weekly markets census (CCAM)", data: "Census open data", diba: "Barcelona Provincial Council finder" },
};

/** The hub: the next session of each town of the pilot, and where the official census is for the others. */
export function HubPage({ locale, clock }: { locale: MkLocale; clock: Clock }) {
  const v = hubView(clock, locale);
  const links = LINK_LABELS[locale];
  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{v.h1}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{v.lead}</p>
          <ShareBar locale={locale} path={marketsHubPath(locale)} title={v.h1} contentType="weekly_markets_hub" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="pilot">{v.headingTowns}</h2>
          <ul>
            {v.towns.map((town) => (
              <li key={town.slug}>
                <Link href={marketsTownPath(locale, town.slug)}>{town.name}</Link>
                {": "}
                {town.answer}
              </li>
            ))}
          </ul>

          <h2 id="altres">{v.headingOthers}</h2>
          <p>{v.others}</p>
          <ul>
            <li>
              <a href={CENSUS_LINKS.page} rel="noopener nofollow" target="_blank">
                {links.census}
              </a>
            </li>
            <li>
              <a href={CENSUS_LINKS.data} rel="noopener nofollow" target="_blank">
                {links.data}
              </a>
            </li>
            <li>
              <a href={CENSUS_LINKS.diba} rel="noopener nofollow" target="_blank">
                {links.diba}
              </a>
            </li>
          </ul>

          <h2 id="metode">{v.headingMethod}</h2>
          <ul>
            {v.method.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
