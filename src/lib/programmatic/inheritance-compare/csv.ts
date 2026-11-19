import { absoluteUrl } from "@/lib/site";

import { VERIFICATION_NOTES } from "./notes";
import { cmpPath } from "./paths";
import { RULES_AS_OF } from "./state";
import { TERRITORIES, exampleRows } from "./territories";
import type { Cell, Territory } from "./types";

/**
 * The comparison's CSV (/data/impuesto-sucesiones-por-comunidad-2026.csv):
 * one row per territory and item, the six rule cells and the worked
 * example's figures, each with its status, article, law, date and the URL of
 * the text read. Summaries in Spanish. Every row names the source and the
 * page, as CC BY 4.0 asks.
 *
 * RFC 4180: comma-separated, "." as the decimal point, CRLF, UTF-8 with a
 * byte-order mark so that spreadsheet programs read the accents.
 */

export const CSV_LICENCE = "https://creativecommons.org/licenses/by/4.0/";
export const CSV_ATTRIBUTION = `Fuente: CatalunyaInfo (${absoluteUrl(cmpPath("es"))}), a partir del BOE, los boletines oficiales y las normas forales`;

export const CSV_COLUMNS = ["territory_id", "territory", "regime", "item", "status", "summary_es", "value", "unit", "article", "law", "in_force_from", "source_url", "read_on", "attribution"] as const;

function field(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const ITEMS: readonly [string, (t: Territory) => Cell][] = [
  ["group_ii_reduction", (t) => t.inheritance.groupII],
  ["group_i_ii_bonus", (t) => t.inheritance.bonus],
  ["habitual_home", (t) => t.inheritance.home],
  ["group_iii_siblings", (t) => t.inheritance.groupIII],
  ["gift_parent_child", (t) => t.gift.benefit],
  ["gift_formal_requirement", (t) => t.gift.formal],
];

export function compareCsv(): string {
  const rows: (string | number)[][] = [];
  const main = (t: Territory) => t.sources[t.mainSource]!;
  for (const t of TERRITORIES) {
    for (const [item, get] of ITEMS) {
      const c = get(t);
      const src = c.cite ? t.sources[c.cite.src] : undefined;
      rows.push([t.id, t.name.es, t.regime, item, c.pending ? "pending" : "verified", c.text.es, "", "", c.cite?.art ?? "", src?.name ?? "", c.from ?? "", src?.url ?? main(t).url, (src ?? main(t)).read, CSV_ATTRIBUTION]);
    }
    const note = VERIFICATION_NOTES[t.id];
    if (note) rows.push([t.id, t.name.es, t.regime, "verification_note", "note", note.es, "", "", "", main(t).name, "", main(t).url, RULES_AS_OF, CSV_ATTRIBUTION]);
  }
  for (const { territory: t, result: r } of [...exampleRows()].sort((a, b) => TERRITORIES.indexOf(a.territory) - TERRITORIES.indexOf(b.territory))) {
    const base = [t.id, t.name.es, t.regime];
    const tail = (url: string) => ["", main(t).name, "", url, RULES_AS_OF, CSV_ATTRIBUTION];
    if (!r) {
      rows.push([...base, "example_to_pay", "pending", t.example.kind === "pending" ? t.example.reason.es : "", "", "EUR", ...tail(main(t).url)]);
      continue;
    }
    const figures: [string, number, string][] = [
      ["example_reductions_applied", r.baseImponible - r.baseLiquidable, "EUR"],
      ["example_base_liquidable", r.baseLiquidable, "EUR"],
      ["example_quota", r.quotaTributaria, "EUR"],
      ["example_bonus_pct", r.bonusPct, "percent"],
      ["example_to_pay", r.toPay, "EUR"],
    ];
    for (const [item, value, unit] of figures) rows.push([...base, item, "verified", "Hijo de 30 años, heredero único: 300.000 € netos, de los que 150.000 € son la vivienda habitual del fallecido (no vivía en ella); sin patrimonio previo", value.toFixed(2), unit, ...tail(main(t).url)]);
  }
  const lines = [CSV_COLUMNS.join(","), ...rows.map((r) => r.map(field).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}
