import assert from "node:assert/strict";
import { test } from "node:test";

import { HOURS } from "../src/lib/content/batch02/hours.ts";

// 25 Nov 2026: "horario metro barcelona sabado", "a que hora cierra el metro entre semana",
// "horari metro barcelona divendres". TMB's hours page, read 25 Nov 2026 (EN, ES, CA): Monday to Thursday and
// midweek holidays 05:00 to midnight; Fridays and the nights before holidays 05:00 to 02:00; Saturdays
// "continuous service throughout Saturday to Sunday night"; Sundays until midnight.

type Blocks = { type: string; level?: number; text?: string }[];

function under(blocks: Blocks, heading: string): string {
  const i = blocks.findIndex((b) => b.type === "heading" && b.level === 2 && b.text === heading);
  assert.notEqual(i, -1, `missing H2 "${heading}"`);
  const out: string[] = [];
  for (const b of blocks.slice(i + 1)) {
    if (b.type === "heading") break;
    if (b.text) out.push(b.text);
  }
  return out.join(" ");
}

test("metro hours: Saturday and weekday closing have their own H2, answered in the first sentence", () => {
  const want = {
    en: { sat: "What time does the metro close on Saturdays?", week: "What time does the metro close on weekdays?", noClose: /does not close/, mid: /midnight on Sunday/, weekMid: /midnight \(24:00\)/ },
    es: { sat: "¿A qué hora cierra el metro los sábados?", week: "¿A qué hora cierra el metro entre semana?", noClose: /No cierra/, mid: /medianoche del domingo/, weekMid: /medianoche \(24:00\)/ },
    ca: { sat: "A quina hora tanca el metro els dissabtes?", week: "A quina hora tanca el metro entre setmana?", noClose: /No tanca/, mid: /mitjanit del diumenge/, weekMid: /mitjanit \(24:00\)/ },
  } as const;
  for (const locale of ["en", "es", "ca"] as const) {
    const blocks = HOURS.editions[locale].blocks as Blocks;
    const sat = under(blocks, want[locale].sat);
    assert.match(sat, want[locale].noClose, locale);
    assert.match(sat, want[locale].mid, locale);
    assert.ok(sat.includes("5:00") && sat.includes("L9 Sud"), `${locale}: opens at 5:00; the L9/L10 Sud exception`);
    const week = under(blocks, want[locale].week);
    assert.match(week, want[locale].weekMid, locale);
    assert.ok(week.includes("2:00"), `${locale}: Fridays at 2:00`);
  }
});
