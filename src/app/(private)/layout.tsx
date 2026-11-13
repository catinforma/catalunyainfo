import type { Metadata } from "next";

import "../globals.css";
import { fontClassNames } from "@/lib/fonts";

/**
 * Third root layout, for private tool pages that must open on the owner's
 * phone without the CMS (which is reachable only through an SSH tunnel):
 * today, the WhatsApp channel post (`/canal/<token>/`).
 *
 * Like the CMS it shares nothing with the public site: no header, no
 * analytics, no consent banner. Never indexed: this metadata, the
 * X-Robots-Tag from next.config.ts (ALWAYS_NOINDEX_SOURCES) and no sitemap
 * entry. `no-referrer`, so the token in the URL never reaches another page,
 * our own analytics included, when a link here is followed.
 */
export const metadata: Metadata = {
  title: "CatalunyaInfo",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={fontClassNames}>
      <body>{children}</body>
    </html>
  );
}
