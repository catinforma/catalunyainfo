import { GLANCE_FEED_ANCHOR, cityGlanceCopy, type GlanceLocale } from "@/lib/programmatic/spain-2027/city-glance";
import type { City } from "@/lib/programmatic/spain-2027/cities";

/**
 * One line (two on a phone) under the answer paragraph of a Spain 2027 city
 * page, in ca, es and en from the same data: the holiday count, the local days
 * or their pending status with the bulletin, and the link to the .ics block.
 * Words and rules in lib/programmatic/spain-2027/city-glance.ts.
 */
export function CityGlance({ c, locale }: { c: City; locale: GlanceLocale }) {
  const g = cityGlanceCopy(c, locale);
  return (
    <p className="ci-glance" data-glance>
      <strong>{g.strong}</strong>
      {g.rest} · <a href={GLANCE_FEED_ANCHOR}>{g.cta}</a>
    </p>
  );
}
