import { listEntries } from "@/lib/content/repository";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";
import { buildLlmsTxt, type LlmsEntry } from "@/lib/seo/llms";

/**
 * llms.txt: a plain map of the site for language-model assistants.
 *
 * GA4 already reports an "AI Assistant" channel sending real visits, and the
 * pages those assistants cite are the ones with a direct answer and an
 * official source. The file opens with the live tools and data hubs (holidays
 * per town, strikes, Rodalies, fuel, reservoirs, elections, weekend), each
 * with a one-line description, then lists every published guide with its
 * one-line summary, in each language. The text is built by `lib/seo/llms.ts`
 * from the modules that render those pages and from the database, sorted, so
 * it cannot list a page that does not exist and the same content always gives
 * the same file.
 */
export const revalidate = 86400;

/** listEntries returns at most 100 rows a call (repository.ts). */
const PAGE = 100;
/** A ceiling, not a target: far above today's guide count per language. */
const MAX_GUIDES = 3000;

/**
 * Every published guide of one language, newest first. Until 17 Nov 2026 the
 * route asked for 200 and got the 100 most recent (listEntries caps a call at
 * 100), so long-lived guides such as the Barcelona parking guide (3,654
 * impressions 11-17 Nov) were missing from the file.
 */
async function allGuides(locale: Locale): Promise<LlmsEntry[]> {
  // Keyed by URL: entries published in the same second can trade places
  // between two offset pages, and the file must list each guide once.
  const out = new Map<string, LlmsEntry>();
  for (let offset = 0; offset < MAX_GUIDES; offset += PAGE) {
    const entries = await listEntries(locale, { types: ["article", "guide"], limit: PAGE, offset });
    for (const entry of entries) out.set(entry.href, { title: entry.title, href: entry.href, excerpt: entry.excerpt ?? null });
    if (entries.length < PAGE) break;
  }
  return [...out.values()];
}

export async function GET() {
  const guides: Partial<Record<Locale, LlmsEntry[]>> = {};
  for (const locale of LOCALES) {
    // listEntries rethrows DB errors (so pages keep their last good version);
    // llms.txt is auxiliary, so a failing locale is skipped instead.
    guides[locale] = await allGuides(locale).catch(() => []);
  }

  return new Response(buildLlmsTxt(SITE.productionOrigin, SITE.name, guides), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
