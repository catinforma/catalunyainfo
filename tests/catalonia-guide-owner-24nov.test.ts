import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, slugifyAnchor, type Block } from "../src/lib/content/blocks.ts";
import { COPY } from "../src/lib/content/holidays/copy.ts";
import { LOCAL_ORDER_CHECKED, buildBody, formatDay } from "../src/lib/content/holidays/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { mainElsewhere } from "../src/lib/programmatic/spain-2027/main-urls.ts";
import { BOE_REF } from "../src/lib/programmatic/spain-2027/sources.ts";

/**
 * 24 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Catalonia work calendar: the owner of
 * calendario laboral 2027 cataluña"): under the twelve dates, one box with the
 * official documents (Ordre EMT/52/2026 in the DOGC, BOE-A-2026-21254) and the
 * state of the local-holiday order; the Catalonia page of the Spain 2027 family
 * links the guide in the query's words. Title, description, lead and H1 of the
 * guide are inside their window (3 Nov to 1 Dec) and stay as they were.
 */

const src = (path: string) => readFileSync(join(import.meta.dirname, "..", path), "utf8");

test("guide: the documents box sits right under the twelve dates, with both PDFs and the local-order state", () => {
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const body = buildBody(locale);
    assert.ok(bodySchema.safeParse(body).success, locale);
    // lead, heading, table, then the box, then the 2026 callout.
    assert.ok(body[0]?.type === "paragraph" && body[0].lead, locale);
    assert.ok(body[2]?.type === "table", locale);
    const box = body[3] as Extract<Block, { type: "callout" }>;
    assert.ok(box?.type === "callout" && box.tone === "official", `${locale}: official box fourth`);
    assert.match(box.title ?? "", /2027/, locale);
    assert.match(box.title ?? "", locale === "en" ? /Catalonia public holidays 2027/ : /[Cc]alenda(ri|rio) laboral 2027 de (Catalunya|Cataluña)/, locale);
    // The order's own PDF (documentId 1040896 = DOGC 9637, 1 Apr 2026) and the BOE's.
    assert.ok(box.text.includes("documentId=1040896&type=01&language="), locale);
    assert.ok(box.text.includes(BOE_REF.pdf), locale);
    assert.ok(box.text.includes("EMT/52/2026") && box.text.includes("BOE-A-2026-21254"), locale);
    assert.match(box.text, /art\. 2/, locale);
    // The local-order state carries the read date (guarded by holiday-serp-push-13nov: 21 days) and points at the section.
    assert.ok(box.text.includes(formatDay(LOCAL_ORDER_CHECKED, copy, locale)), `${locale}: read date`);
    assert.ok(box.text.includes(`/${locale}/${copy.path}/#${slugifyAnchor(copy.localTitle)}`), `${locale}: local section anchor`);
    assert.equal(body[4]?.type, "callout", locale);
    assert.ok(!/\{[a-z0-9]+\}/i.test(box.text), locale);
  }
  assert.ok(BOE_REF.pdf.endsWith("BOE-A-2026-21254.pdf"));
});

test("guide: title, description, lead and H1 stay inside their window", () => {
  assert.equal(COPY.es.seoTitle, "Calendario laboral 2027 Cataluña y Barcelona: festivos");
  assert.equal(COPY.ca.seoTitle, "Calendari laboral 2027 Catalunya: festius, ponts i Pasqua");
  assert.equal(COPY.es.title, "Calendario laboral 2027 en Cataluña: festivos, puentes y mejores días para pedir vacaciones");
  assert.ok(COPY.es.seoDescription.startsWith("Los 12 festivos 2027 en Cataluña: 1 y 6 ene, 26 y 29 mar,"));
  assert.ok(COPY.es.lead[0]!.startsWith("Cataluña tiene 12 festivos en 2027:"));
  for (const locale of LOCALES) assert.equal((buildBody(locale)[0] as { text: string }).text, COPY[locale].lead[0]);
});

test("Spain 2027 Catalonia page: one sentence in the query's words links the guide, in es, ca and en", () => {
  const es = src("src/components/programmatic/spain-2027/pages.tsx");
  const intl = src("src/components/programmatic/spain-2027/pages-intl.tsx");
  assert.ok(es.includes('mainElsewhere("CT", "es")!.href}>calendario laboral 2027 de Cataluña</Link>'));
  assert.ok(intl.includes('mainElsewhere("CT", "ca")!.href}>calendari laboral 2027 de Catalunya</Link>'));
  assert.ok(intl.includes('mainElsewhere("CT", "en")!.href}>Catalonia public holidays 2027</Link>'));
  for (const locale of LOCALES) assert.equal(mainElsewhere("CT", locale)!.href, GUIDES.workCalendar[locale]);
});
