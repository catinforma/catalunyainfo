import type { Locale } from "@/lib/i18n/config";
import { isLowDemandPath } from "@/lib/seo/low-demand";
import { SHARE_COPY, sharedUrl, shareLinks } from "@/lib/share/links";

import { ShareControls } from "./ShareControls";

/** The page's own path: the last breadcrumb, which every page's trail ends on. */
export function crumbPath(crumbs: readonly { href: string }[]): string {
  return crumbs.at(-1)?.href ?? "";
}

/**
 * Share bar for a content page, in two sizes: `compact` (icon buttons) under
 * the meta line, `full` (with a lead-in line) at the end of the article.
 *
 * Every URL is built here, on the server, so the client part receives strings
 * only and the low-demand list never reaches the browser. Pages kept out of
 * the index (lib/seo/low-demand.ts) get no bar: there is little point in
 * inviting readers to pass on a page we do not ask Google to show.
 */
export function ShareBar({
  locale,
  path,
  title,
  contentType,
  variant = "compact",
  className,
}: {
  locale: Locale;
  /** The page's canonical path, e.g. "/es/guias/huelga-hoy-cataluna/". */
  path: string;
  title: string;
  /** GA4 `content_type` of the `share` event (entry type or page family). */
  contentType: string;
  variant?: "compact" | "full";
  className?: string;
}) {
  if (!path || isLowDemandPath(path)) return null;
  const copy = SHARE_COPY[locale];
  const controls = (
    <ShareControls
      locale={locale}
      path={path}
      title={title}
      contentType={contentType}
      links={shareLinks(path, title, locale)}
      nativeUrl={sharedUrl(path, "native")}
      copyUrl={sharedUrl(path, "copy")}
      copy={copy}
      variant={variant}
    />
  );

  if (variant === "compact") {
    return <div className={className ?? "mt-3"}>{controls}</div>;
  }
  return (
    <div className={className ?? "ci-measure mt-10 border-t border-[var(--color-rule)] pt-6"}>
      <p className="mb-2 text-sm font-semibold">{copy.heading}</p>
      {controls}
    </div>
  );
}
