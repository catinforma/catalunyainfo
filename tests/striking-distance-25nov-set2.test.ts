import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { TSI_GUIDE } from "../src/lib/content/batch02/tsi.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { CATALONIA_IPC, cataloniaSection } from "../src/lib/programmatic/ipc/catalonia.ts";
import { IPC_SNAPSHOT } from "../src/lib/programmatic/ipc/data.ts";
import { latestFigures } from "../src/lib/programmatic/ipc/series.ts";

// 25 Nov 2026, striking-distance body answers, second set (ci-demanda).

const today = () => new Date().toISOString().slice(0, 10);

test("IPC page: Catalonia's October 2026 figure in ca/es/en, next to Spain's, only while October is the newest month", () => {
  const latest = latestFigures(IPC_SNAPSHOT);
  assert.ok(latest);
  assert.equal(latest.month, CATALONIA_IPC.month, "snapshot newest month is the one the Catalonia line is for");
  const es = cataloniaSection("es", latest)!;
  const ca = cataloniaSection("ca", latest)!;
  const en = cataloniaSection("en", latest)!;
  assert.equal(es.heading, "IPC en Cataluña");
  assert.equal(ca.heading, "IPC a Catalunya");
  assert.equal(en.heading, "CPI in Catalonia");
  assert.match(es.text, /En Cataluña, el IPC general subió un 4,8 % en los doce meses hasta octubre de 2026 y varió un \+0,7 %/);
  assert.match(es.text, /en septiembre la tasa anual era del 4,5 %\. En el conjunto de España fue del 4,9 %\./);
  assert.match(ca.text, /A Catalunya, l'IPC general va pujar un 4,8 % en els dotze mesos fins a l'octubre de 2026/);
  assert.match(ca.text, /Al conjunt d'Espanya va ser del 4,9 %\./);
  assert.match(en.text, /In Catalonia, the all-items CPI rose 4\.8% in the twelve months to October 2026 and changed \+0\.7%/);
  assert.match(en.text, /For Spain as a whole it was 4\.9%\./);
  for (const s of [es, ca, en]) {
    assert.match(s.source, /IPC294107/);
    assert.match(s.source, /25/);
    assert.doesNotMatch(s.text, /undefined|NaN|—/);
  }
  assert.equal(cataloniaSection("es", { ...latest, month: "2026-11" }), null, "hidden once the newest month is not the one verified");
  assert.equal(cataloniaSection("es", null), null);
});

test("date guard: from 16 Dec 2026 the Catalonia IPC line carries the November figures (INE release 15 Dec 2026)", () => {
  if (today() < CATALONIA_IPC.rereadBy) return;
  assert.ok(CATALONIA_IPC.month >= "2026-11", "Re-read INE series IPC294107 / IPC294109 (table 76140), update CATALONIA_IPC in src/lib/programmatic/ipc/catalonia.ts and the previous month.");
});

test("TSI guide: the CIP FAQ says where the code is printed, in ca/es/en", () => {
  const want = { ca: /imprès a l'anvers de la targeta/, es: /impreso en el anverso de la tarjeta/, en: /printed on the front of the card/ } as const;
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(TSI_GUIDE.editions[locale].blocks), want[locale]);
  }
});
