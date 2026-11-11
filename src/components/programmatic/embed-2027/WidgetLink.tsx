import Link from "next/link";

import { widgetCopy } from "@/lib/programmatic/embed-2027/copy";
import { placeName, widgetLinkFor, widgetPagePath, type EmbedLocale, type EmbedPlace } from "@/lib/programmatic/embed-2027/places";

/** One sentence on the 2027 hubs: the page that hands out the embeddable calendar. */
export function WidgetHubLink({ locale }: { locale: EmbedLocale }) {
  const t = widgetCopy(locale);
  return (
    <p>
      {t.ctaLead} <Link href={widgetPagePath(locale)}>{t.cta}</Link>.
    </p>
  );
}

/** On a town or city page: the same page, with this place already picked (the hash). */
export function WidgetPlaceLink({ locale, place }: { locale: EmbedLocale; place: EmbedPlace }) {
  return (
    <p>
      <Link href={widgetLinkFor(locale, place)}>{widgetCopy(locale).ctaPlace(placeName(locale, place))}</Link>
    </p>
  );
}
