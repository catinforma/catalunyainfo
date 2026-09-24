/**
 * AdSense readiness check, run against production.
 *
 * Version 1 of this site was rejected for "low value content" — 42
 * auto-generated news items. This check exists so that judgement is made
 * against evidence rather than optimism, and so the same failure cannot
 * recur unnoticed.
 *
 * It reports PASS, WARNING or FAIL per item, and never claims approval is
 * guaranteed: nothing here can promise that, and a tool that implies it would
 * be lying.
 *
 * WARNING means a human has to look. FAIL means do not apply yet.
 *
 * Usage: `npm run adsense:check`
 */
import { OPERATOR, hasLegalIdentity } from "../src/lib/content/pages/operator.ts";
import { SITE } from "../src/lib/site.ts";

export {};

const ORIGIN = process.env.SEO_ORIGIN ?? SITE.productionOrigin;

type Level = "PASS" | "WARNING" | "FAIL";

interface Result {
  level: Level;
  name: string;
  detail: string;
}

const results: Result[] = [];
const record = (level: Level, name: string, detail: string) =>
  results.push({ level, name, detail });

async function get(path: string): Promise<{ status: number; body: string }> {
  try {
    const response = await fetch(`${ORIGIN}${path}`, {
      headers: { "user-agent": "CatalunyaInfo-adsense-check" },
      signal: AbortSignal.timeout(30_000),
    });
    return { status: response.status, body: await response.text() };
  } catch {
    return { status: 0, body: "" };
  }
}

/** Rough word count of the visible text, with markup and scripts removed. */
function visibleWords(html: string): number {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  const main = start >= 0 && end > start ? html.slice(start, end) : html;
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1).length;
}

async function main() {
  console.log(`AdSense readiness — ${ORIGIN}\n`);

  /* ---- Policy pages ----------------------------------------------------- */
  const policyPages = [
    ["/ca/legal/avis-legal/", "Legal notice"],
    ["/ca/legal/privacitat/", "Privacy policy"],
    ["/ca/legal/cookies/", "Cookie policy"],
    ["/ca/legal/politica-editorial/", "Editorial policy"],
    ["/ca/qui-som/", "About"],
    ["/ca/contacte/", "Contact"],
  ] as const;

  for (const [path, name] of policyPages) {
    const page = await get(path);
    const words = visibleWords(page.body);
    if (page.status !== 200) {
      record("FAIL", name, `${path} returned ${page.status}`);
    } else if (words < 120) {
      record("WARNING", name, `${path} has only ~${words} words`);
    } else {
      record("PASS", name, `${path} — ~${words} words`);
    }
  }

  /* ---- Legal identity ---------------------------------------------------- */
  if (hasLegalIdentity()) {
    record("PASS", "Publisher identity", "Legal name, tax id and address are published");
  } else {
    const missing = [
      !OPERATOR.legalName && "legal name",
      !OPERATOR.taxId && "tax id",
      !OPERATOR.address && "address",
    ].filter(Boolean);
    record(
      "FAIL",
      "Publisher identity",
      `Missing ${missing.join(", ")} in src/lib/content/pages/operator.ts. ` +
        "Spanish LSSI-CE art. 10 requires these once the site carries advertising.",
    );
  }

  /* ---- Contact route ----------------------------------------------------- */
  const contact = await get("/ca/contacte/");
  if (contact.body.includes("ci-contact-form")) {
    record("PASS", "Contact method", "A working contact form is published");
  } else if (contact.body.includes(SITE.contactEmail)) {
    record("WARNING", "Contact method", "Email is published but no form was found");
  } else {
    record("FAIL", "Contact method", "No contact form and no email address found");
  }

  /* ---- Content depth ----------------------------------------------------- */
  const sitemap = await get("/sitemap.xml");
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
  const articleUrls = urls.filter(
    (url) => !/\/(legal|qui-som|quienes-somos|about|contacte|contacto|contact)\//.test(url),
  );

  record(
    urls.length >= 30 ? "PASS" : "WARNING",
    "Indexable URLs",
    `${urls.length} in the sitemap (${articleUrls.length} outside the policy pages)`,
  );

  /* ---- Thin content ------------------------------------------------------ */
  // Articles and listings are judged apart. A hub with 130 words of listing is
  // doing its job; an article with 130 words is the thing that got version 1
  // rejected. Depth of 3 segments (/locale/section/slug/) is an article.
  const isArticle = (url: string) =>
    url.replace(ORIGIN, "").split("/").filter(Boolean).length === 3;

  const thin: string[] = [];
  const emptyIndexes: string[] = [];
  let checked = 0;

  for (const url of articleUrls) {
    const path = url.replace(ORIGIN, "");
    const page = await get(path);
    if (page.status !== 200) continue;
    const words = visibleWords(page.body);

    if (isArticle(url)) {
      checked += 1;
      if (words < 400) thin.push(`${path} (~${words} words)`);
    } else if (words < 60) {
      emptyIndexes.push(`${path} (~${words} words)`);
    }
  }

  if (thin.length === 0) {
    record("PASS", "Thin articles", `${checked} articles checked, none under 400 words`);
  } else {
    record("WARNING", "Thin articles", `${thin.length} of ${checked}: ${thin.join(", ")}`);
  }

  if (emptyIndexes.length === 0) {
    record("PASS", "Empty listings", "No near-empty listing page is in the sitemap");
  } else {
    record(
      "WARNING",
      "Empty listings",
      `${emptyIndexes.length} in the sitemap with almost no content: ${emptyIndexes.join(", ")}`,
    );
  }

  /* ---- No ad code yet ---------------------------------------------------- */
  const home = await get("/ca/");
  const hasAdCode = /adsbygoogle|pagead2\.googlesyndication/.test(home.body);
  record(
    hasAdCode ? "WARNING" : "PASS",
    "Ad code",
    hasAdCode
      ? "Ad code is already present — it must not be live before approval"
      : "No ad code on the site, which is correct before applying",
  );

  /* ---- Crawlability ------------------------------------------------------ */
  const robots = await get("/robots.txt");
  const blocksImages =
    /Disallow:\s*\/\*\?\*/.test(robots.body) && !/Allow:\s*\/_next\/image/.test(robots.body);
  record(
    blocksImages ? "FAIL" : "PASS",
    "Image crawlability",
    blocksImages
      ? "robots.txt blocks /_next/image, so Googlebot cannot load any content image"
      : "The image optimiser is crawlable",
  );

  /* ---- Consent ----------------------------------------------------------- */
  const hasConsentGate = home.body.includes("ci-consent") || home.body.includes("consent");
  record(
    hasConsentGate ? "WARNING" : "FAIL",
    "Consent for ads",
    "A first-party consent banner covers analytics. Serving personalised ads to " +
      "EEA/UK users additionally requires a Google-certified CMP integrated with " +
      "the IAB TCF — that is a separate piece of work, not a switch.",
  );

  /* ---- Report ------------------------------------------------------------ */
  const width = Math.max(...results.map((r) => r.name.length));
  for (const result of results) {
    console.log(`${result.level.padEnd(8)} ${result.name.padEnd(width)}  ${result.detail}`);
  }

  const fails = results.filter((r) => r.level === "FAIL").length;
  const warnings = results.filter((r) => r.level === "WARNING").length;

  console.log(
    `\n${fails > 0 ? "FAIL" : warnings > 0 ? "WARNING" : "PASS"}: ` +
      `${fails} blocking, ${warnings} to review, ${results.length - fails - warnings} passing.`,
  );
  console.log(
    "\nThis check cannot predict approval. It only reports what is verifiable " +
      "from the live site; the judgement about content quality is a human one.",
  );
  process.exit(fails > 0 ? 1 : 0);
}

await main();
