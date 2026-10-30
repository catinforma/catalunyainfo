import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { LinkList } from "@/components/programmatic/weekend/parts";
import { B2_TITLES, b2href } from "@/lib/content/batch02/shared";
import { getMessages } from "@/lib/i18n";
import { hubLead, hubMeta, labels, statusLabels, townName } from "@/lib/programmatic/christmas-fairs/copy";
import { FAIRS, comarcaOf, familyLastChecked, hasEnglish, pendingMarkets, towns, townsByProvince } from "@/lib/programmatic/christmas-fairs/data";
import { shortRange } from "@/lib/programmatic/christmas-fairs/format";
import { fairsHubPath, townPath, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";
import { weekendHubPath } from "@/lib/programmatic/weekend/paths";

import { FairRows, Guidance, PendingList, Sources, datedFairs } from "./parts";
import { FairStatus } from "./FairStatus";

export function hubCounts() {
  return { fairs: FAIRS.length, towns: towns().length };
}

export function hubCrumbs(locale: FairsLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubMeta(locale, hubCounts(), familyLastChecked()).crumb, href: fairsHubPath(locale) },
  ];
}

const NEXT_STEPS: Record<FairsLocale, { weekend: string | null; intro: string }> = {
  ca: { weekend: "Fires i mercats de cada cap de setmana", intro: "La guia dels grans mercats de Barcelona (Santa Llúcia, la Sagrada Família) i els pessebres vivents:" },
  es: { weekend: "Ferias y mercados de cada fin de semana", intro: "La guía de los grandes mercados de Barcelona (Santa Llúcia, la Sagrada Família) y los belenes vivientes:" },
  en: { weekend: null, intro: "Barcelona's big markets (Santa Llúcia, Sagrada Família) and living nativity scenes:" },
};

/** Every dated Christmas fair of the season, by date and by town, plus the big markets still without dates. */
export function HubPage({ locale }: { locale: FairsLocale }) {
  const t = labels(locale);
  const counts = hubCounts();
  const checked = familyLastChecked();
  const meta = hubMeta(locale, counts, checked);
  const steps = NEXT_STEPS[locale];
  const groups = townsByProvince().map((g) => ({
    province: g.province,
    towns: g.towns.filter((town) => locale !== "en" || hasEnglish(town)),
  }));
  const guides = (["christmas", "christmasBarcelona", "decemberBridge", "marato", "pessebres", "christmasTraditions", "shops"] as const).map((key) => ({
    label: B2_TITLES[key][locale],
    href: b2href(key, locale),
  }));

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{meta.h1}</h1>
          <p className="ci-measure mt-3 text-lg text-[var(--color-ink-soft)]">{hubLead(locale, counts, checked)}</p>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <FairStatus fairs={datedFairs(FAIRS, locale)} locale={locale} labels={statusLabels(locale, "hub", "")} showTown />

          <h2 id="pendents">{t.pending}</h2>
          <p>{t.pendingIntro}</p>
          <PendingList markets={pendingMarkets()} locale={locale} />
          <p>
            {steps.intro} <Link href={b2href("christmas", locale)}>{B2_TITLES.christmas[locale]}</Link>.
          </p>

          <h2 id="per-data">{t.byDate}</h2>
          <FairRows fairs={FAIRS} locale={locale} />
        </div>

        {groups.map((g) =>
          g.towns.length > 0 ? (
            <LinkList
              key={g.province}
              title={t.provinces[g.province] ?? g.province}
              id={`ci-xmas-p${g.province}`}
              links={g.towns.map((town) => ({
                label: townName(town.name, locale),
                href: townPath(locale, town.slug),
                note: `${comarcaOf(town)} · ${town.fairs.map((f) => shortRange(f.start, f.end, locale)).join(", ")}`,
              }))}
            />
          ) : null,
        )}

        <div className="ci-prose mt-10">
          <Guidance locale={locale} />
        </div>

        <LinkList title={t.guides} id="ci-xmas-guides" links={guides} />
        {steps.weekend ? (
          <p className="mt-4 text-sm">
            <Link href={weekendHubPath(locale as "ca" | "es")}>{steps.weekend}</Link>
          </p>
        ) : null}
        <Sources locale={locale} fairs={FAIRS} />
      </div>
    </article>
  );
}
