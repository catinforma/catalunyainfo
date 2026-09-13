import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { STALE_AFTER_DAYS, daysSince, formatDate, isoDate } from "@/lib/format";

/**
 * The freshness signal.
 *
 * A practical guide is only worth reading if someone has checked it recently,
 * so this is the one element on the page that gets its own colour. It turns
 * amber once the last check is more than a year old — we would rather admit
 * that a page is ageing than quietly imply it is current.
 */
export function VerifiedStamp({
  date,
  locale,
  className = "",
}: {
  date: Date;
  locale: Locale;
  className?: string;
}) {
  const t = getMessages(locale);
  const stale = daysSince(date) > STALE_AFTER_DAYS;

  return (
    <span className={`ci-verified ${stale ? "ci-stale" : ""} ${className}`.trim()}>
      <span className="ci-verified-dot" aria-hidden="true" />
      {t.meta.verifiedOn}{" "}
      <time dateTime={isoDate(date)}>{formatDate(date, locale, "short")}</time>
    </span>
  );
}
