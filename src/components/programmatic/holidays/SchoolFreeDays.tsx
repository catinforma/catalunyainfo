import Link from "next/link";

import { townSection } from "@/lib/content/batch02/school-free-days-towns";
import { b2href } from "@/lib/content/batch02/shared";
import type { MuniLocale } from "@/lib/programmatic/holidays/paths";

/**
 * "Dies de lliure disposició escolar 2026-27" on a town's holiday page: the
 * 7 December answer and the town's free days, from its official source
 * (school-free-days-towns.ts), with a link to the hub. Renders nothing for a
 * town without a published set. Its own file so the page renderer only gains
 * one line (other sections are added to MunicipalityPage.tsx in parallel).
 */
export function SchoolFreeDays({ slug, locale }: { slug: string; locale: MuniLocale }) {
  const section = townSection(slug, locale, b2href("schoolFreeDays", locale));
  if (!section) return null;
  return (
    <>
      <h2 id="lliure-disposicio">{section.heading}</h2>
      <p>
        <strong>{section.answer}</strong> {section.text}
      </p>
      <p className="text-sm">
        {section.source.lead}{" "}
        <a href={section.source.url} rel="noopener nofollow" target="_blank">
          {section.source.name}
        </a>
        <span className="text-[var(--color-muted)]"> — {section.source.read}.</span>
      </p>
      <p>
        <Link href={section.hub.href}>{section.hub.label}</Link>
      </p>
    </>
  );
}
