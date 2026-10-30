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

export async function GET() {
  const guides: Partial<Record<Locale, LlmsEntry[]>> = {};
  for (const locale of LOCALES) {
    // listEntries rethrows DB errors (so pages keep their last good version);
    // llms.txt is auxiliary, so a failing locale is skipped instead.
    const entries = await listEntries(locale, { types: ["article", "guide"], limit: 200 }).catch(() => []);
    guides[locale] = entries.map((entry) => ({ title: entry.title, href: entry.href, excerpt: entry.excerpt ?? null }));
  }

  return new Response(buildLlmsTxt(SITE.productionOrigin, SITE.name, guides), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
