import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { IntentLink } from "@/components/nav/IntentLink";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { HTML_LANG } from "@/lib/i18n/config";
import { legalPath } from "@/lib/i18n/routes";
import { HUB_COPY, HUB_GROUPS, SCOPE_LABEL, hubCrumb, type HubCard } from "@/lib/programmatic/calculators/hub";
import { calculatorsHubEditions, calculatorsHubPath, type CalcLocale } from "@/lib/programmatic/calculators/paths";
import { HUB_QUESTIONS_TITLE, byPopularity, hubQuestions } from "@/lib/programmatic/calculators/related";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * The calculators hub: /es/calculadoras/, /ca/calculadores/, /en/calculators/.
 * A short answer-first lead, the ten most-searched questions as links to
 * their tools (26 Nov 2026), then one card per tool (lib/programmatic/calculators/hub.ts),
 * grouped by topic, most-searched first within each group
 * (calculators/related.ts POPULARITY), each with the question it answers and
 * its official basis. Server-rendered, no client code; breadcrumb JSON-LD only, like the
 * calculators themselves.
 */

export function calculatorsHubCrumbs(locale: CalcLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    hubCrumb(locale),
  ];
}

export function calculatorsHubMetadata(locale: CalcLocale): Metadata {
  const c = HUB_COPY[locale];
  return buildMetadata({ locale, path: calculatorsHubPath(locale), title: c.title, description: c.description, translations: calculatorsHubEditions() });
}

function Card({ card, locale }: { card: HubCard; locale: CalcLocale }) {
  const c = HUB_COPY[locale];
  const lang = card.hrefLang?.[locale];
  return (
    <li>
      <Link href={card.href[locale]} className="ci-tool" hrefLang={lang ? HTML_LANG[lang] : undefined}>
        <span className="ci-tool-title">
          {card.title[locale]}
          {lang ? <span className="text-sm font-normal text-[var(--color-muted)]"> ({c.otherLanguage})</span> : null}
        </span>
        <span className="ci-tool-desc">{card.answers[locale]}</span>
        <span className="text-sm text-[var(--color-muted)]">
          <strong className="font-semibold">{c.basis}:</strong> {card.basis[locale]}
        </span>
        <span className="ci-tool-live">
          {SCOPE_LABEL[card.scope][locale]}
          {card.checked ? ` · ${c.checked(card.checked)}` : ""}
        </span>
      </Link>
    </li>
  );
}

export function CalculatorsHubRoute({ locale }: { locale: CalcLocale }) {
  const c = HUB_COPY[locale];
  const crumbs = calculatorsHubCrumbs(locale);
  const questions = hubQuestions(locale);
  return (
    <>
      <SiteHeader locale={locale} translations={calculatorsHubEditions()} />
      <main id="main">
        <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell py-5 md:py-8 lg:py-12">
            <Breadcrumbs items={crumbs} locale={locale} />
            <h1 className="ci-measure">{c.h1}</h1>
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{c.lead}</p>
          </div>
        </header>

        <div className="ci-shell py-10">
          {/* 26 Nov 2026: the most-searched questions first, each a link to the tool that answers it (calculators/related.ts). */}
          <section aria-labelledby="preguntas-mas-buscadas" className="ci-measure mb-10">
            {/* mb-3 / gap-2 (27 Nov 2026): the title sat on its first link and the ten
                links ran together; now spaced like the groups below. */}
            <h2 id="preguntas-mas-buscadas" className="mb-3">{HUB_QUESTIONS_TITLE[locale]}</h2>
            <ul className="grid gap-2">
              {questions.map((q) => (
                <li key={q.id}>
                  <IntentLink href={q.href}>
                    {q.question}
                  </IntentLink>
                </li>
              ))}
            </ul>
          </section>

          {HUB_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`grupo-${group.id}`} className="mb-10">
              <div className="ci-section-head">
                <h2 id={`grupo-${group.id}`} className="m-0">
                  {group.title[locale]}
                </h2>
              </div>
              {group.intro ? <p className="ci-measure mb-4">{group.intro[locale]}</p> : null}
              <ul className="ci-tools">
                {byPopularity(group.cards.map((card) => card.key)).map((key) => group.cards.find((card) => card.key === key)!).map((card) => (
                  <Card key={card.key} card={card} locale={locale} />
                ))}
              </ul>
            </section>
          ))}

          <div role="note" className="ci-callout ci-callout-warning ci-measure">
            <p>{c.note}</p>
          </div>

          <section aria-labelledby="como-las-hacemos" className="ci-measure mt-10">
            <h2 id="como-las-hacemos">{c.methodHeading}</h2>
            <p>{c.method}</p>
            <p>
              <Link href={legalPath("editorial-policy", locale)}>{c.methodLink}</Link>
            </p>
          </section>

          <ShareBar locale={locale} path={calculatorsHubPath(locale)} title={c.h1} contentType="calculators_hub" variant="full" />
        </div>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
