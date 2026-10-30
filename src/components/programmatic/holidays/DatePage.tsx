import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { DATE_UI, dateQuestion } from "@/lib/programmatic/holidays/copy";
import { dateContent } from "@/lib/programmatic/holidays/dates";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { longDate, type DateLocale } from "@/lib/programmatic/holidays/format";
import { esName } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, datePath, hubPath, municipalityPath, type DatePage as DatePageIso } from "@/lib/programmatic/holidays/paths";

import { GuideLinks, Sources, type SourceKey } from "./parts";

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
  const sources: SourceKey[] =
    year === "2026"
      ? [
          "regional2026",
          // 31 December: the answer names 1 January 2027 (Ordre EMT/52/2026).
          ...(iso === "2026-12-31" ? (["regional2027"] as const) : []),
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
            <p className={`ci-today-answer ${content.holiday ? "is-holiday" : "is-not"}`}>{content.holiday ? ui.yes : ui.no}</p>
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

          <h2 id="local">{ui.localTitle}</h2>
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
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {DATE_PAGES.filter((d) => d !== iso).map((d) => (
              <li key={d}>
                <Link href={datePath(locale, d)}>{dateQuestion(d, locale)}</Link>
              </li>
            ))}
            <li>
              <Link href={hubPath(locale)}>{ui.municipalityLink}</Link>
            </li>
          </ul>
        </section>

        <GuideLinks keys={content.guides} locale={locale} title={ui.guidesTitle} />

        <Sources keys={sources} locale={locale} title={ui.sourcesTitle} />
      </div>
    </article>
  );
}
