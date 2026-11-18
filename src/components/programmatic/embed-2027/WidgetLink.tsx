import Link from "next/link";

import { widgetCopy } from "@/lib/programmatic/embed-2027/copy";
import { attributionPath, embedId, embedPath, placeName, widgetLinkFor, widgetPagePath, type EmbedLocale, type EmbedPlace } from "@/lib/programmatic/embed-2027/places";
import { CALENDAR_HEIGHT, iframeSnippet } from "@/lib/programmatic/embed-2027/snippet";
import { siteOrigin } from "@/lib/site";

import { CodeBox } from "./CodeBox";

/** One sentence on the 2027 hubs: the page that hands out the embeddable calendar. */
export function WidgetHubLink({ locale }: { locale: EmbedLocale }) {
  const t = widgetCopy(locale);
  return (
    <p>
      {t.ctaLead} <Link href={widgetPagePath(locale)}>{t.cta}</Link>.
    </p>
  );
}

/**
 * On a town or city page: "embed this", folded. The code for this place's
 * 2027 calendar is in the page itself (server-rendered, the same as the
 * builder's: snippet.ts), with a copy button; the builder, with this place
 * picked, offers the rest (another town, 2026, a plain link).
 */
export function WidgetPlaceLink({ locale, place }: { locale: EmbedLocale; place: EmbedPlace }) {
  const t = widgetCopy(locale);
  const name = placeName(locale, place);
  const code = iframeSnippet({
    origin: siteOrigin(),
    embed: embedPath(locale, place),
    page: attributionPath(locale, place),
    title: `${t.snippetTitle}: ${name}`,
    height: CALENDAR_HEIGHT,
  });
  return (
    <details className="ci-embed-box my-4 rounded border border-[var(--color-rule)] p-3">
      <summary className="cursor-pointer font-semibold">{t.ctaPlace(name)}</summary>
      <p>{t.boxLead}</p>
      <CodeBox id={`embed-${embedId(place).replace("/", "-")}`} label={t.boxCodeLabel(name)} code={code} copyLabel={t.copy} copiedLabel={t.copied} />
      <p>
        <Link href={widgetLinkFor(locale, place)}>{t.boxMore}</Link>
      </p>
    </details>
  );
}
