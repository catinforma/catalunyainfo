import { NEWS_ALERTS_LABEL, activeNewsAlerts, newsAlertsExpiryScript } from "@/lib/alerts/news-alerts";
import type { Locale } from "@/lib/i18n/config";

/**
 * The sitewide alert strip, under the header (rendered by SiteHeader). A
 * Server Component with no client code: the lines are decided when the page is
 * rendered (lib/alerts/news-alerts.ts) and an ended line is hidden by the
 * root layout's inline script (`NewsAlertsExpiry`), so it adds nothing to the
 * client bundle. It is in the initial HTML, so it takes its place before the
 * first paint (no layout shift); it sits outside the sticky header, so it
 * scrolls away with the page.
 *
 * Plain anchors, not `next/link`: on every page, a Link would prefetch the
 * targets' payloads on every page view.
 */
export function NewsAlerts({ locale, currentPath }: { locale: Locale; currentPath?: string }) {
  const lines = activeNewsAlerts(locale, currentPath);
  if (lines.length === 0) return null;

  return (
    <nav className="ci-alerts" aria-label={NEWS_ALERTS_LABEL[locale]}>
      <ul className="ci-shell">
        {lines.map((line) => (
          <li key={line.id} data-alert={line.id}>
            <a href={line.href}>
              {line.text}
              <span aria-hidden="true"> →</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The expiry script, first thing in <body> in the root layout, so it runs
 * before any strip is parsed. The root layout persists across client-side
 * navigation, so React only ever hydrates this element: it is never created on
 * the client (where a script would not run and React would warn). Children
 * rather than `dangerouslySetInnerHTML`, which tests/security.test.ts keeps to
 * the JSON-LD component; React writes a script's text unescaped.
 */
export function NewsAlertsExpiry() {
  return <script>{newsAlertsExpiryScript()}</script>;
}
