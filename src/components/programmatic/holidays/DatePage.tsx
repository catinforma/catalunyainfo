import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { BOE_2027 } from "@/lib/programmatic/holidays/boe-2027";
import { DATE_UI, dateQuestion } from "@/lib/programmatic/holidays/copy";
import { SNAPSHOT } from "@/lib/programmatic/holidays/data";
import { dateContent } from "@/lib/programmatic/holidays/dates";
import { isTranche4 } from "@/lib/programmatic/holidays/dates-2027";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { longDate, type DateLocale } from "@/lib/programmatic/holidays/format";
import { esName } from "@/lib/programmatic/holidays/names";
import { datePath, hubPath, municipalityPath, type DatePage as DatePageIso } from "@/lib/programmatic/holidays/paths";
import { restOfSpainLabel } from "@/lib/programmatic/spain-2027/day-copy";
import { restOfSpainLabelIntl } from "@/lib/programmatic/spain-2027/day-copy-intl";
import { hasDayPage } from "@/lib/programmatic/spain-2027/days";
import { spainDayPath } from "@/lib/programmatic/spain-2027/paths";

import { DateQuestions, GuideLinks, Sources, type SourceKey } from "./parts";

/** The question before the link to the Spain-wide day page. */
const REST_OF_SPAIN: Record<DateLocale, string> = { ca: "I a la resta d'Espanya?", es: "¿Y en el resto de España?", en: "And in the rest of Spain?" };

export function dateCrumbs(iso: DatePageIso, locale: DateLocale): Crumb[] {
  const ui = DATE_UI[locale];
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: ui.breadcrumbParent, href: hubPath(locale) },
    { label: dateQuestion(iso, locale), href: datePath(locale, iso) },
  ];
}

/** The town page a place on the list links to: every town in ca/es, the English selection in English. */
function placeHref(slug: string | null, locale: DateLocale): string | null {
  if (!slug) return null;
  if (locale === "en") return hasEnglishPage(slug) ? municipalityPath("en", slug) : null;
  return municipalityPath(locale, slug);
}

export function DatePageView({ iso, locale }: { iso: DatePageIso; locale: DateLocale }) {
  const ui = DATE_UI[locale];
  const content = dateContent(iso, locale);
  const year = iso.slice(0, 4);
  // Tranche 4 (2027): the order, the BOE's national list, the 2027 shop calendar, the retail law and the
  // school order; then each council whose days are listed, or the DOGC order once it is out.
  const tranche4 = isTranche4(iso);
  const sources: SourceKey[] = tranche4
    ? ["regional2027", "boe2027", "shopsOrder2027", "retailLaw", "school"]
    : year === "2026"
      ? [
          "regional2026",
          // 31 December: the answer names 1 January 2027; 1 November: the notice
          // names 1 November 2027 (both Ordre EMT/52/2026).
          ...(iso === "2026-12-31" || iso === "2026-11-01" ? (["regional2027"] as const) : []),
          "localOrder",
          "amendment",
          "boe2026",
          "shopsOrder",
          "shops",
          "retailLaw",
          "school",
        ]
      : ["regional2027", "localOrder", "retailLaw", "school"];

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={dateCrumbs(iso, locale)} locale={locale} />
          <h1 className="ci-measure">{dateQuestion(iso, locale)}</h1>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <div className="ci-today">
            <p className={`ci-today-answer ${content.holiday ? "is-holiday" : "is-not"}`}>{content.verdict ?? (content.holiday ? ui.yes : ui.no)}</p>
            <p className="ci-today-date">
              <time dateTime={iso}>{longDate(iso, locale)}</time>
            </p>
          </div>
          <p className="ci-lead">{content.answer}</p>
          {content.answerNote.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {content.notice ? (
            <p>
              {content.notice.before}
              <Link href={content.notice.href}>{content.notice.label}</Link>
              {content.notice.after}
            </p>
          ) : null}
          {/* The Spain-wide day page, in this page's own language (body links stay in their language). */}
          {hasDayPage(iso) ? (
            <p>
              <strong>{REST_OF_SPAIN[locale]}</strong>{" "}
              <Link href={spainDayPath(iso, locale)}>{locale === "es" ? restOfSpainLabel(iso) : restOfSpainLabelIntl(iso, locale)}</Link>.
            </p>
          ) : null}

          <h2 id="local">{content.local.title ?? ui.localTitle}</h2>
          <p>{content.local.text}</p>
          {content.local.places.length > 0 ? (
            <ul className="columns-1 sm:columns-2 lg:columns-3">
              {content.local.places.map((p) => {
                const label = locale === "es" ? esName(p.name) : p.name;
                const parent = p.parent ? (locale === "es" ? esName(p.parent) : p.parent) : null;
                // Every town has a page in ca/es (tranche 3), the English selection in English;
                // a nucleus links its town's, which lists the nucleus's days.
                const href = placeHref(p.slug, locale);
                return (
                  <li key={`${p.name}-${p.parent ?? ""}`}>
                    {href && !parent ? <Link href={href}>{label}</Link> : label}
                    {parent ? (
                      <span className="text-[var(--color-muted)]">
                        {" ("}
                        {href ? <Link href={href}>{parent}</Link> : parent}
                        {")"}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {content.local.note ? <p className="text-sm">{content.local.note}</p> : null}

          {content.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="ci-hol-other-dates">
          <h2 id="ci-hol-other-dates">{ui.otherDates}</h2>
          {/* By year, this page's year first: the dates next to it are the first links. */}
          <DateQuestions locale={locale} first={year} exclude={iso} />
          <p className="mt-4">
            <Link href={hubPath(locale)}>{ui.municipalityLink}</Link>
          </p>
        </section>

        <GuideLinks keys={content.guides} locale={locale} title={ui.guidesTitle} />

        <Sources
          keys={sources}
          locale={locale}
          title={ui.sourcesTitle}
          extra={content.extraSources ?? []}
          readOn={tranche4 ? [SNAPSHOT.readOn, BOE_2027.readOn].sort().at(-1) : undefined}
        />
      </div>
    </article>
  );
}
