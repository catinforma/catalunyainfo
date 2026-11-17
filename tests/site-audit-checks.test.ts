import assert from "node:assert/strict";
import { test } from "node:test";

import { checkJsonLd, decodeEntities, familyOf, pageIssues, parseHtml, templateSkeleton } from "../scripts/lib/page-checks.ts";
import { disallowRules, parseUrlset, robotsAllows } from "../scripts/lib/crawl.ts";
import { jsonForScript } from "../src/lib/seo/json-script.ts";

/**
 * The rules of `npm run site:audit` (scripts/lib/page-checks.ts), on fixed
 * HTML, so a regex that stops matching Next's output fails here instead of
 * silently reporting a clean site.
 */

const ORIGIN = "https://www.catalunyainfo.com";
const URL_ES = `${ORIGIN}/es/calculadoras/sueldo-neto/`;

function page({ head = "", body = "", lang = "es" }: { head?: string; body?: string; lang?: string }) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charSet="utf-8"/>${head}</head><body><header><a href="/es/">Inicio</a></header><main id="main">${body}</main><footer><a href="/es/contacto/">Contacto</a></footer></body></html>`;
}

const GOOD_HEAD = [
  `<title>Calculadora de sueldo neto 2026: de bruto a neto, por comunidad</title>`,
  `<meta name="description" content="Calcula tu sueldo neto 2026 en cualquier comunidad: retención de IRPF con el algoritmo oficial de la Agencia Tributaria y cotizaciones."/>`,
  `<meta name="robots" content="index, follow"/>`,
  `<link rel="canonical" href="${URL_ES}"/>`,
  `<link rel="alternate" hrefLang="ca" href="${ORIGIN}/ca/calculadores/sou-net/"/>`,
  `<link rel="alternate" hrefLang="es" href="${URL_ES}"/>`,
  `<link rel="alternate" hrefLang="en" href="${ORIGIN}/en/calculators/net-salary-spain/"/>`,
  `<link rel="alternate" hrefLang="x-default" href="${ORIGIN}/en/calculators/net-salary-spain/"/>`,
  `<meta property="og:title" content="Calculadora"/><meta property="og:description" content="d"/>`,
  `<meta property="og:url" content="${URL_ES}"/><meta property="og:image" content="${ORIGIN}/social-card.png"/>`,
  `<meta property="og:type" content="website"/><meta property="og:locale" content="es_ES"/>`,
  `<meta name="twitter:card" content="summary_large_image"/>`,
].join("");

test("a clean page has no errors or warnings", () => {
  const html = page({ head: GOOD_HEAD, body: `<h1>Calculadora de sueldo neto</h1><p>Texto</p><img src="/a.png" alt="Gráfico" width="640" height="360"/>` });
  const parsed = parseHtml(html, URL_ES, ORIGIN);
  assert.equal(parsed.title, "Calculadora de sueldo neto 2026: de bruto a neto, por comunidad");
  assert.equal(parsed.alternates["x-default"], `${ORIGIN}/en/calculators/net-salary-spain/`);
  assert.equal(parsed.links.find((l) => l.url === `${ORIGIN}/es/`)?.region, "nav");
  assert.equal(parsed.links.find((l) => l.url === `${ORIGIN}/es/contacto/`)?.region, "footer");
  const issues = pageIssues(parsed, URL_ES, ORIGIN).filter((i) => i.severity !== "info");
  assert.deepEqual(issues, []);
});

test("missing H1, canonical elsewhere, image without alt and mixed content are reported", () => {
  const head = GOOD_HEAD.replace(`<link rel="canonical" href="${URL_ES}"/>`, `<link rel="canonical" href="${ORIGIN}/es/"/>`);
  const html = page({ head, body: `<p>x</p><img src="http://example.org/a.png"/><img src="/b.png" alt=""/>` });
  const codes = pageIssues(parseHtml(html, URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(codes.includes("h1-missing"));
  assert.ok(codes.includes("canonical-not-self"));
  assert.ok(codes.includes("img-no-alt"), "an <img> with no alt attribute");
  assert.ok(codes.includes("mixed-content"));
  assert.ok(codes.includes("img-no-size"), "an <img> in <main> without width/height");
  // alt="" is a decorative image, which is allowed.
  assert.equal(parseHtml(html, URL_ES, ORIGIN).imagesEmptyAlt, 1);
});

test("an <svg><title> is not the document title, and the RSC payload is not markup", () => {
  const html = page({
    head: GOOD_HEAD,
    body: `<h1>H</h1><svg><title>Icono</title></svg><script>self.__next_f.push([1,"<title>Fake</title><h1>Fake</h1>"])</script>`,
  });
  const parsed = parseHtml(html, URL_ES, ORIGIN);
  assert.equal(parsed.titleCount, 1);
  assert.equal(parsed.h1.length, 1);
});

test("hreflang: no self-reference, duplicate and invalid codes", () => {
  const head = GOOD_HEAD.replace(`hrefLang="es" href="${URL_ES}"`, `hrefLang="es" href="${ORIGIN}/es/otra/"`) + `<link rel="alternate" hrefLang="en-UK" href="${ORIGIN}/en/x/"/>`;
  const codes = pageIssues(parseHtml(page({ head, body: "<h1>h</h1>" }), URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(codes.includes("hreflang-no-self"));
  assert.ok(!codes.includes("hreflang-invalid-code"), "en-UK has a valid shape; only the region is wrong, which Google reports itself");
  const bad = GOOD_HEAD + `<link rel="alternate" hrefLang="es_ES" href="${ORIGIN}/es/y/"/>`;
  const badCodes = pageIssues(parseHtml(page({ head: bad, body: "<h1>h</h1>" }), URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(badCodes.includes("hreflang-invalid-code"));
});

function ld(json: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
}

test("JSON-LD: invalid JSON and a block without @context are errors", () => {
  const html = page({ head: GOOD_HEAD, body: `<h1>h</h1><script type="application/ld+json">{"@type":</script>${ld({ "@type": "WebSite", name: "x" })}` });
  const codes = pageIssues(parseHtml(html, URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(codes.includes("jsonld-invalid"));
  assert.ok(codes.includes("jsonld-no-context"));
});

test("JSON-LD: an FAQPage must only mark up questions the page shows", () => {
  const faq = (q: string) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: "Sí." } }],
  });
  const visible = page({ head: GOOD_HEAD, body: `<h1>h</h1><h2>¿Hay huelga el jueves?</h2><p>Sí.</p>${ld(faq("¿Hay huelga el jueves?"))}` });
  const hidden = page({ head: GOOD_HEAD, body: `<h1>h</h1><p>Nada</p>${ld(faq("¿Hay huelga el jueves?"))}` });
  const codes = (html: string) => checkJsonLd(parseHtml(html, URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(!codes(visible).includes("jsonld-faq-not-visible"));
  assert.ok(codes(hidden).includes("jsonld-faq-not-visible"));
});

test("JSON-LD: Event needs a location with an address, BreadcrumbList sequential positions and absolute URLs", () => {
  const html = page({
    head: GOOD_HEAD,
    body: `<h1>h</h1>${ld({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Event", name: "Fira", startDate: "2026-12-05", location: { "@type": "Place", name: "Plaça" } },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${ORIGIN}/es/` },
            { "@type": "ListItem", position: 3, name: "Calc", item: "/es/calculadoras/" },
          ],
        },
        { "@type": "Article", headline: "T", datePublished: "17/11/2026", author: { "@type": "Person" } },
      ],
    })}`,
  });
  const codes = checkJsonLd(parseHtml(html, URL_ES, ORIGIN), URL_ES, ORIGIN).map((i) => i.code);
  assert.ok(codes.includes("jsonld-event-location-incomplete"));
  assert.ok(codes.includes("jsonld-breadcrumb-position"));
  assert.ok(codes.includes("jsonld-breadcrumb-relative-url"));
  assert.ok(codes.includes("jsonld-bad-date"));
  assert.ok(codes.includes("jsonld-article-author-no-name"));
  assert.ok(codes.includes("jsonld-article-missing"));
});

test("links written without the trailing slash or on the apex host are flagged (each is a redirect hop)", () => {
  const html = page({ head: GOOD_HEAD, body: `<h1>h</h1><a href="/es/festivos">a</a><a href="https://catalunyainfo.com/es/">b</a><a href="/llms.txt">c</a>` });
  const issue = pageIssues(parseHtml(html, URL_ES, ORIGIN), URL_ES, ORIGIN).find((i) => i.code === "links-redirecting-form");
  assert.ok(issue);
  assert.match(issue.detail ?? "", /^2:/);
});

test("sitemap and robots helpers", () => {
  const xml = `<urlset><url><loc>${ORIGIN}/ca/</loc><xhtml:link rel="alternate" hreflang="es" href="${ORIGIN}/es/" /><lastmod>2026-11-17</lastmod></url></urlset>`;
  assert.deepEqual(parseUrlset(xml), [{ loc: `${ORIGIN}/ca/`, lastmod: "2026-11-17", alternates: { es: `${ORIGIN}/es/` } }]);
  const rules = disallowRules("User-Agent: *\nAllow: /\nAllow: /api/fuel/catalonia/$\nDisallow: /api/\nDisallow: /*?*\n\nUser-Agent: SemrushBot\nDisallow: /\n");
  assert.equal(robotsAllows(rules, "/es/festivos/"), true);
  assert.equal(robotsAllows(rules, "/api/x/"), false);
  assert.equal(robotsAllows(rules, "/api/fuel/catalonia/"), true);
  assert.equal(robotsAllows(rules, "/es/?q=1"), false);
});

test("families and template skeletons", () => {
  assert.equal(familyOf(`${ORIGIN}/es/festivos/dia/1-noviembre-2026/`), "/es/festivos/dia/");
  assert.equal(familyOf(`${ORIGIN}/es/festivos/barcelona/`), "/es/festivos/");
  assert.equal(familyOf(`${ORIGIN}/es/`), "/es/");
  const a = templateSkeleton("Festivos en Badalona 2026: los días de fiesta", `${ORIGIN}/es/festivos/badalona/`);
  const b = templateSkeleton("Festivos en Terrassa 2026: los días de fiesta", `${ORIGIN}/es/festivos/terrassa/`);
  assert.equal(a, b);
  assert.equal(decodeEntities("Farmers&#x27; &amp; &quot;markets&quot;"), `Farmers' & "markets"`);
});

test("JSON-LD in a script element: every < is escaped and the JSON still parses", () => {
  const json = JSON.stringify({ name: "</script><script>alert(1)</script>", text: "a\u2028b" });
  const safe = jsonForScript(json);
  assert.ok(!safe.includes("<"), "no raw < left");
  assert.ok(!safe.includes("\u2028"));
  assert.deepEqual(JSON.parse(safe), JSON.parse(json));
});
