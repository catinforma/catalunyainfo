import { calculateNetSalary, DEFAULT_INPUT, type SalaryInput, type SalaryResult } from "@/lib/programmatic/net-salary/engine";
import { CALC_COPY, fillFigures, money, netSalaryPath, parseAmount, percent, readHash, smiDeductionNote, writeHash } from "@/lib/programmatic/net-salary/copy";
import { REGIONS, regionById } from "@/lib/programmatic/net-salary/regions";
import { FORAL_LINKS, SALARY_RULES_AS_OF, SALARY_RULES_YEAR, SOURCES } from "@/lib/programmatic/net-salary/rules-2026";
import { dayMonthYear } from "@/lib/programmatic/holidays/format";
import { embedDocument, esc } from "@/lib/programmatic/embed-2027/shell";
import { absoluteUrl } from "@/lib/site";

import { netSalaryEmbedPath, type CalcEmbedLocale } from "./paths";

/**
 * The embeddable net salary calculator (/embed/<locale>/calc/net-salary/):
 * the site's engine (net-salary/engine.ts, validated against the AEAT's own
 * service) behind a plain GET form, no script. The form's field names are the
 * full calculator's hash keys (copy.ts `writeHash`/`readHash`), so the
 * result's "open in the full calculator" link carries the reader's figures
 * over. Without a query it shows the page's own example (30,000 €, Catalonia,
 * 14 payments).
 *
 * Every word comes from the calculator's copy (CALC_COPY); every figure from
 * the engine. Nothing the reader typed reaches the HTML except through the
 * engine's normalised input, escaped.
 */

const W: Record<CalcEmbedLocale, { title: string; submit: string; full: string; official: string; rules: (date: string) => string; notCovered: string }> = {
  ca: {
    title: `Calculadora de sou net ${SALARY_RULES_YEAR}`,
    submit: "Calcula",
    full: "Obre-ho a la calculadora completa (discapacitat, mobilitat, hipoteca i el detall de cada pas)",
    official: "Servei oficial de càlcul de retencions de l'Agència Tributària",
    rules: (d) => `Regles del ${SALARY_RULES_YEAR}: algoritme de retenció de l'AEAT i Ordre PJC/297/2026 de cotització, revisats el ${d}.`,
    notCovered: "Navarra i el País Basc no hi són: tenen taules de retenció pròpies.",
  },
  es: {
    title: `Calculadora de sueldo neto ${SALARY_RULES_YEAR}`,
    submit: "Calcular",
    full: "Ábrelo en la calculadora completa (discapacidad, movilidad, hipoteca y el detalle de cada paso)",
    official: "Servicio oficial de cálculo de retenciones de la Agencia Tributaria",
    rules: (d) => `Reglas de ${SALARY_RULES_YEAR}: algoritmo de retención de la AEAT y Orden PJC/297/2026 de cotización, revisados el ${d}.`,
    notCovered: "Navarra y el País Vasco no están: tienen tablas de retención propias.",
  },
  en: {
    title: `Spain net salary calculator ${SALARY_RULES_YEAR}`,
    submit: "Calculate",
    full: "Open it in the full calculator (disability, relocation, mortgage and every step of the sum)",
    official: "The Tax Agency's official withholding calculation service",
    rules: (d) => `${SALARY_RULES_YEAR} rules: the AEAT withholding algorithm and contribution order PJC/297/2026, checked on ${d}.`,
    notCovered: "Navarre and the Basque Country are not covered: they have withholding tables of their own.",
  },
};

/** The reader's figures from the query string, as the full calculator reads its hash; the example without one. */
export function netSalaryInput(search: URLSearchParams): SalaryInput {
  const p = new URLSearchParams(search);
  // "30.000", "30 000 €", "30,000.50": read as the calculator's field does.
  const gross = p.get("b");
  if (gross !== null) p.set("b", String(parseAmount(gross)));
  return readHash(p.toString(), DEFAULT_INPUT, (id) => Boolean(regionById(id)));
}

const sel = (on: boolean) => (on ? " selected" : "");

function select(name: string, label: string, options: [string, string][], value: string, id = name): string {
  return (
    `<label for="${id}">${esc(label)}</label><select id="${id}" name="${name}">` +
    options.map(([v, text]) => `<option value="${esc(v)}"${sel(v === value)}>${esc(text)}</option>`).join("") +
    `</select>`
  );
}

function form(lang: CalcEmbedLocale, input: SalaryInput): string {
  const t = CALC_COPY[lang];
  const age = { under65: "0", "65to74": "1", "75plus": "2" }[input.age];
  const contract = { "open-ended": "i", "fixed-term": "t", short: "s" }[input.contract];
  return [
    `<form method="get" action="${netSalaryEmbedPath(lang)}">`,
    `<label for="b">${esc(t.gross)}</label><input id="b" name="b" inputmode="decimal" autocomplete="off" value="${esc(String(input.gross))}" aria-describedby="b-hint" required><small id="b-hint">${esc(t.grossHint)}</small>`,
    select("n", t.payments, [["14", t.paymentsOption(14)], ["12", t.paymentsOption(12)]], String(input.payments)),
    select("r", t.region, REGIONS.map((r) => [r.id, r.names[lang]] as [string, string]), input.region),
    select("c", t.contract, (["i", "t", "s"] as const).map((k) => [k, t.contractOptions[{ i: "open-ended", t: "fixed-term", s: "short" }[k] as keyof typeof t.contractOptions]] as [string, string]), contract),
    select("f", t.family, (["3", "2", "1"] as const).map((k) => [k, t.familyOptions[Number(k) as 1 | 2 | 3]] as [string, string]), String(input.family)),
    `<label for="h">${esc(t.children)}</label><input id="h" name="h" type="number" min="0" max="10" step="1" value="${input.children}">`,
    `<label for="u">${esc(t.childrenUnder3)}</label><input id="u" name="u" type="number" min="0" max="10" step="1" value="${input.childrenUnder3}">`,
    select("a", t.age, (["0", "1", "2"] as const).map((k) => [k, t.ageOptions[{ "0": "under65", "1": "65to74", "2": "75plus" }[k] as keyof typeof t.ageOptions]] as [string, string]), age),
    `<button type="submit">${esc(W[lang].submit)}</button>`,
    `</form>`,
  ].join("");
}

function results(lang: CalcEmbedLocale, r: SalaryResult): string {
  const t = CALC_COPY[lang];
  if (!r.supported) {
    const links = (FORAL_LINKS[r.input.region as keyof typeof FORAL_LINKS] ?? []).map((l) => `<a href="${esc(l.url)}" rel="noopener nofollow" target="_blank">${esc(l.name)}</a>`);
    return `<h2>${esc(t.results)}</h2><p>${esc(t.foral)} ${links.join(" · ")}</p>`;
  }
  const rows: [string, string, boolean][] = [
    [t.netPayment(r.input.payments), money(r.net.perPayment, lang), true],
    ...(r.net.extraPayment !== null ? [[t.extraPayment, money(r.net.extraPayment, lang), false] as [string, string, boolean]] : []),
    [t.netAnnual, money(r.net.annual, lang), true],
    [t.grossAnnual, money(r.input.gross, lang), false],
    [t.ss, money(r.ss.annual, lang), false],
    [t.irpf, money(r.irpf.annual, lang), false],
    [t.irpfRate, percent(r.irpf.rate, lang), false],
    [t.effective, percent(r.effectiveRate, lang), false],
  ];
  const notes = [
    r.irpf.exempt ? t.exempt : null,
    r.irpf.limited ? t.limited : null,
    r.irpf.minimumRateApplied ? t.minimumRate : null,
    r.irpf.reducedByCeuta ? t.ceuta : null,
    r.ss.capped ? fillFigures(t.capped, lang) : null,
    r.ss.belowMinimum ? fillFigures(t.belowMinimum, lang) : null,
    smiDeductionNote(r, lang),
  ].filter((n): n is string => Boolean(n));
  return [
    `<h2 id="res">${esc(t.results)}</h2>`,
    `<table aria-labelledby="res"><tbody>`,
    ...rows.map(([label, value, strong]) => `<tr${strong ? ' class="l"' : ""}><th scope="row">${esc(label)}</th><td class="n">${strong ? `<strong>${esc(value)}</strong>` : esc(value)}</td></tr>`),
    `</tbody></table>`,
    ...notes.map((n) => `<p>${esc(n)}</p>`),
  ].join("");
}

const STYLE = [
  "form{display:grid;gap:4px;margin:0 0 8px}",
  "label{font-size:12px;font-weight:600;margin-top:6px}",
  "input,select{font:inherit;padding:6px;border:1px solid #b8c2be;border-radius:4px;max-width:100%;background:#fff;color:#1b2a33}",
  "button{font:inherit;font-weight:600;margin-top:10px;padding:8px 12px;border:0;border-radius:4px;background:#0b6b4f;color:#fff;cursor:pointer;justify-self:start}",
  "button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid #0b6b4f;outline-offset:2px}",
  "th[scope=row]{font-size:13px;color:#1b2a33;font-weight:400}",
].join("");

export function renderNetSalaryEmbed(lang: CalcEmbedLocale, search: URLSearchParams): string {
  const input = netSalaryInput(search);
  const result = calculateNetSalary(input);
  const w = W[lang];
  const t = CALC_COPY[lang];
  const full = `${absoluteUrl(netSalaryPath(lang))}${writeHash(result.input)}`;
  return embedDocument({
    lang,
    title: w.title,
    page: netSalaryPath(lang),
    style: STYLE,
    body: [
      `<h1>${esc(w.title)}</h1>`,
      `<p>${esc(t.intro)}</p>`,
      form(lang, result.input),
      results(lang, result),
      `<p>${esc(t.disclaimer)} ${esc(w.notCovered)}</p>`,
      `<p><a href="${esc(SOURCES.retentionsPage.url)}" rel="noopener nofollow" target="_blank">${esc(w.official)}</a></p>`,
      `<p><a href="${esc(full)}" target="_blank" rel="noopener">${esc(w.full)}</a></p>`,
      `<p><time datetime="${SALARY_RULES_AS_OF}">${esc(w.rules(dayMonthYear(SALARY_RULES_AS_OF, lang)))}</time></p>`,
    ],
  });
}
