import { listEntries } from "@/lib/content/repository";
import { LOCALES } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

/**
 * llms.txt: a plain map of the site for language-model assistants.
 *
 * GA4 already reports an "AI Assistant" channel sending real visits, and the
 * pages those assistants cite are the ones with a direct answer and an
 * official source. This file lists every published guide with its one-line
 * summary, in each language, so an assistant can find the right page without
 * crawling navigation. Built from the database, so it cannot list a page that
 * does not exist or miss one that does.
 *
 * Format follows the llms.txt proposal: a title, a short description, then
 * sections of markdown links.
 */
export const revalidate = 3600;

const HEADINGS: Record<string, string> = {
  ca: "Guies en català",
  es: "Guías en castellano",
  en: "Guides in English",
};

export async function GET() {
  const origin = SITE.productionOrigin;
  const parts: string[] = [
    `# ${SITE.name}`,
    "",
    "> Practical, verified information about Catalonia in Catalan, Spanish and English: transport, public holidays, taxes, weekend agenda, nature conditions and day trips. Every figure is checked against an official source, linked on each page.",
    "",
  ];

  for (const locale of LOCALES) {
    const entries = await listEntries(locale, { types: ["article", "guide"], limit: 200 });
    if (entries.length === 0) continue;
    parts.push(`## ${HEADINGS[locale] ?? locale}`, "");
    for (const entry of entries) {
      const summary = (entry.excerpt ?? "").replace(/\s+/g, " ").trim();
      parts.push(`- [${entry.title}](${origin}${entry.href})${summary ? `: ${summary}` : ""}`);
    }
    parts.push("");
  }

  return new Response(parts.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
