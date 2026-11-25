import assert from "node:assert/strict";
import { test } from "node:test";

process.env.VERCEL_ENV = "production";
process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";

const { articleSchema, breadcrumbSchema, faqSchema, graph, organizationSchema } = await import("../src/lib/seo/jsonld.ts");
const { plainInline } = await import("../src/lib/content/inline-text.ts");
const { towns, hasEnglish } = await import("../src/lib/programmatic/christmas-fairs/data.ts");
const { FAIRS_LOCALES } = await import("../src/lib/programmatic/christmas-fairs/paths.ts");
const { faqNode, hubFaqItems, townFaqFor } = await import("../src/lib/programmatic/christmas-fairs/page-facts.ts");
const { CITIES } = await import("../src/lib/programmatic/spain-2027/cities.ts");
const { cityFaq } = await import("../src/lib/programmatic/spain-2027/city-copy.ts");
const { cityFaqIntl } = await import("../src/lib/programmatic/spain-2027/city-copy-intl.ts");
const { communityFaq, hubFaq } = await import("../src/lib/programmatic/spain-2027/copy.ts");
const { hubFaqIntl } = await import("../src/lib/programmatic/spain-2027/copy-intl.ts");

/**
 * Rules every page's structured data obeys, whatever its template. The same
 * rules run on live HTML by `npm run site:audit` (scripts/lib/page-checks.ts,
 * tests/site-audit-checks.test.ts); here they run on what the templates build,
 * before a deploy. Structured-data audit of 25 Nov 2026.
 */

type Node = Record<string, unknown>;
const nodesOf = (json: string) => (JSON.parse(json) as { "@graph": Node[] })["@graph"];
const faq = (names: string[]): Node => ({
  "@type": "FAQPage",
  mainEntity: names.map((name) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: `${name} Sí.` } })),
});

// ---- Rule 1: at most one FAQPage and one BreadcrumbList per page --------------------------------

test("rule: graph() leaves one FAQPage, with every question printed once", () => {
  const out = nodesOf(graph([breadcrumbSchema([{ label: "Inicio", href: "/es/" }, { label: "A", href: "/es/a/" }]), faq(["¿A?", "¿B?"]), faq(["¿B?", "¿C?"]), null]));
  const faqs = out.filter((n) => n["@type"] === "FAQPage");
  assert.equal(faqs.length, 1);
  assert.deepEqual((faqs[0]!.mainEntity as Node[]).map((q) => q.name), ["¿A?", "¿B?", "¿C?"]);
});

test("rule: graph() keeps the first BreadcrumbList and drops a node repeated as is", () => {
  const a = breadcrumbSchema([{ label: "Inicio", href: "/es/" }, { label: "A", href: "/es/a/" }])!;
  const b = breadcrumbSchema([{ label: "Inicio", href: "/es/" }, { label: "B", href: "/es/b/" }])!;
  const place = { "@type": "Place", "@id": "https://www.catalunyainfo.com/#municipality-08043", name: "Canyelles" };
  const out = nodesOf(graph([a, b, place, place]));
  assert.equal(out.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
  assert.deepEqual(out.find((n) => n["@type"] === "BreadcrumbList"), a);
  assert.equal(out.filter((n) => n["@type"] === "Place").length, 1);
});

test("rule: an article body with several FAQ blocks gets one FAQPage with all their questions", () => {
  const node = faqSchema([
    { type: "faq", items: [{ question: "¿Uno?", answer: "Sí." }] },
    { type: "paragraph", text: "x" } as never,
    { type: "faq", items: [{ question: "¿Dos?", answer: "No." }] },
  ]) as { mainEntity: Node[] };
  assert.deepEqual(node.mainEntity.map((q) => q.name), ["¿Uno?", "¿Dos?"]);
  assert.equal(faqSchema([{ type: "paragraph", text: "x" } as never]), null);
});

// ---- Rule 2: the FAQ answer in the markup is the text the page shows ----------------------------

test("rule: FAQPage answer text is what renderInline prints (links keep their label, a lone * or _ stays)", () => {
  const answer = "Mira **el [calendario](/es/festivos/)** y _cursiva_; 5 * 3 = 15 y a_b, [raro](./relativo).";
  const node = faqSchema([{ type: "faq", items: [{ question: "¿?", answer }] }]) as { mainEntity: { acceptedAnswer: { text: string } }[] };
  assert.equal(node.mainEntity[0]!.acceptedAnswer.text, plainInline(answer));
  assert.equal(plainInline(answer), "Mira el calendario y cursiva; 5 * 3 = 15 y a_b, [raro](./relativo).");
});

test("rule: the Article's publisher is the Organization the layout declares, so one @id says one thing", () => {
  const entry = {
    entryId: "e1", translationId: "t1", type: "article", locale: "es", title: "Huelga", path: "guias/huelga/", href: "/es/guias/huelga/", excerpt: "x",
    hero: null, publishedAt: new Date("2026-11-10T08:00:00Z"), updatedAt: new Date("2026-11-20T08:00:00Z"), lastVerifiedAt: null, readingMinutes: 3,
    category: null, authorName: null, isFeatured: false, status: "published", body: [], noindex: false, canonicalUrl: null, seoTitle: null, seoDescription: null,
    og: null, author: null, tags: [], categories: [], sources: [], related: [], translations: {}, place: null, event: null, route: null, isDemo: false, breadcrumbs: [],
  };
  const article = articleSchema(entry as never) as Node;
  const layout = organizationSchema("es");
  assert.deepEqual(article.publisher, layout);
  assert.equal((article.publisher as Node)["@id"], "https://www.catalunyainfo.com/#organization");
});

// ---- Rule 3: family FAQs are plain, answerable text (no markup left over, no repeated question) -

const BAD = /undefined|null|NaN|\[object|\*\*|\]\(|`|\{\{|\}\}/;

function assertFaq(label: string, items: readonly { question: string; answer: string }[]) {
  if (items.length === 0) return;
  assert.ok(items.length >= 2, `${label}: a FAQ of one question`);
  const seen = new Set<string>();
  for (const item of items) {
    assert.ok(item.question.trim().length > 5 && item.answer.trim().length > 0, `${label}: empty question or answer`);
    assert.ok(!seen.has(item.question), `${label}: "${item.question}" twice`);
    seen.add(item.question);
    assert.doesNotMatch(item.question, BAD, `${label}: ${item.question}`);
    // After the page's own formatting no markup may be left on screen.
    assert.doesNotMatch(plainInline(item.answer), BAD, `${label}: ${item.answer.slice(0, 120)}`);
  }
  const node = faqSchema([{ type: "faq", items: [...items] }]) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  assert.deepEqual(node.mainEntity.map((q) => q.name), items.map((i) => i.question));
  assert.deepEqual(node.mainEntity.map((q) => q.acceptedAnswer.text), items.map((i) => plainInline(i.answer).trim()), label);
}

test("family FAQs: Christmas fairs (hub and every town, ca / es / en)", () => {
  let pages = 0;
  for (const locale of FAIRS_LOCALES) {
    assertFaq(`fairs hub ${locale}`, hubFaqItems(locale));
    for (const town of towns()) {
      if (locale === "en" && !hasEnglish(town)) continue;
      assertFaq(`fairs ${town.slug} ${locale}`, townFaqFor(town, locale));
      assert.equal((faqNode(townFaqFor(town, locale)) === null), townFaqFor(town, locale).length === 0);
      pages += 1;
    }
  }
  assert.ok(pages > 100, String(pages));
});

test("family FAQs: Spain 2027 hub, communities and every city (ca / es / en)", () => {
  assertFaq("spain hub es", hubFaq());
  for (const locale of ["ca", "en"] as const) assertFaq(`spain hub ${locale}`, hubFaqIntl(locale));
  assert.ok(CITIES.length > 500);
  for (const c of CITIES) {
    assertFaq(`city ${c.slug} es`, cityFaq(c));
    for (const locale of ["ca", "en"] as const) assertFaq(`city ${c.slug} ${locale}`, cityFaqIntl(c, locale));
  }
  assert.ok(typeof communityFaq === "function");
});
