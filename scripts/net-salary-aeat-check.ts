/**
 * Checks the net salary engine against the AEAT's own withholding calculation:
 * its retention web service for payroll software (PRET-R200; "no requiere de
 * ningún tipo de firma o identificación", espeSWRET_2026.pdf on
 * https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml).
 *
 *   node --experimental-strip-types --import ./tests/register-alias.mjs scripts/net-salary-aeat-check.ts [--write] [--per 1]
 *
 * Sends every case of tests/fixtures/net-salary-aeat-2026.json (inputs only:
 * our Social Security total goes in as COTIZACIONES), one a second, and
 * compares the AEAT's rate, annual amount, base and minimum with the
 * engine's. Prints the differences; exits 1 if any. With --write it stores
 * the AEAT's answers as the new fixture (only after reading the diff).
 *
 * For a new year: copy the fixture, change EJER and PER (apéndice 2 of the
 * year's espeSWRET PDF), the birth-year anchors and the year in the XML.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { calculateNetSalary, round2, type SalaryInput } from "../src/lib/programmatic/net-salary/engine.ts";

const URL = "https://www2.agenciatributaria.gob.es/wlpl/PRET-R200/mc";
const YEAR = 2026;
const FIXTURE = join(import.meta.dirname, "..", "tests", "fixtures", "net-salary-aeat-2026.json");
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const PER = args.includes("--per") ? args[args.indexOf("--per") + 1]! : "1";

/** Birth years for the age bands (AEAT: age = year − birth year). Children under 3 born the year before; others well over 3. */
const BORN = { under65: YEAR - 36, "65to74": YEAR - 66, "75plus": YEAR - 78 } as const;
/** Dummy NIFs with valid check letters: the service validates the format only. */
const NIF_PAYER = "12345678Z";
const NIF_WORKER = "87654321X";
const NIF_SPOUSE = "11111111H";

function xml(input: SalaryInput): string {
  const r = calculateNetSalary(input);
  const i = r.input;
  const ceuta = r.regime === "ceuta-melilla";
  const family = i.family === 2 ? `<Situacion2><NifConyuge>${NIF_SPOUSE}</NifConyuge></Situacion2>` : `<Situacion${i.family}/>`;
  const disability = { none: "", "33": "<Discapacidad><Grado1/></Discapacidad>", "33mobility": "<Discapacidad><Grado1><MovilidadReducida/></Grado1></Discapacidad>", "65": "<Discapacidad><Grado2/></Discapacidad>" }[i.disability];
  const kids = Array.from({ length: i.children }, (_, k) => `<Descendiente><Nacimiento>${k < i.childrenUnder3 ? YEAR - 1 : YEAR - 11 - k}</Nacimiento>${i.childrenWhole ? "<ComputadoEntero/>" : ""}</Descendiente>`).join("");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<AEATRetencionesEntrada${YEAR}><IdDoc><CodModelo>RET</CodModelo><Ejercicio>${YEAR}</Ejercicio></IdDoc>`,
    `<Retenedor><Nif>${NIF_PAYER}</Nif><ApellidosNombre>PRUEBA</ApellidosNombre><Retenido><Nif>${NIF_WORKER}</Nif><ApellidosNombre>PRUEBA</ApellidosNombre>`,
    `<Nacimiento>${BORN[i.age]}</Nacimiento>${ceuta ? "<ResidenciaCeutaMelilla/>" : ""}`,
    `<SituacionFamiliar>${family}</SituacionFamiliar>${disability}`,
    // Contrato: 1 general, 2 under one year (algorithm "INFERIORAÑO", 2 % floor).
    `<SituacionLaboral><TrabajadorActivo><Contrato>${i.contract === "short" ? 2 : 1}</Contrato>${i.mobility ? "<MovilidadGeografica/>" : ""}</TrabajadorActivo></SituacionLaboral>`,
    `${kids}<RetribAnuales>${i.gross.toFixed(2)}</RetribAnuales><Cotizaciones>${r.ss.annual.toFixed(2)}</Cotizaciones>`,
    `${ceuta ? "<RdtosObtenidosCeutaMelilla/>" : ""}${i.housingLoan ? "<PagoPrestamosVivienda/>" : ""}`,
    `</Retenido></Retenedor></AEATRetencionesEntrada${YEAR}>`,
  ].join("");
}

function pick(text: string, tag: string): number | null {
  const m = text.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? Number(m[1]) : null;
}

interface Case {
  id: string;
  input: SalaryInput;
  cotizacionesSent: number;
  aeat: { rate: number; annual: number; base: number; minimum: number };
}

const fixture = JSON.parse(readFileSync(FIXTURE, "utf8")) as { cases: Case[]; calledOn: string };
let diffs = 0;
const next: Case[] = [];
for (const c of fixture.cases) {
  const body = `EJER=${YEAR}&PER=${PER}&F01=${encodeURIComponent(xml(c.input))}`;
  const res = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "catalunyainfo-net-salary-check" }, body });
  const text = await res.text();
  const minimum = text.match(/<MinimoPersonalFamiliar>[\s\S]*<Total>([^<]*)<\/Total>\s*<\/MinimoPersonalFamiliar>/);
  const aeat = { rate: pick(text, "TipoRetencion"), annual: pick(text, "ImpAnualRetencionesIngresosCuenta"), base: pick(text, "BaseRetencion"), minimum: minimum ? Number(minimum[1]) : null };
  const r = calculateNetSalary(c.input);
  const ours = { rate: r.irpf.rate, annual: r.irpf.annual, base: round2(r.irpf.base), minimum: r.irpf.minimum };
  const same = aeat.rate === ours.rate && aeat.annual === ours.annual && aeat.base === ours.base && aeat.minimum === ours.minimum;
  if (!same) diffs++;
  console.log(`${same ? "ok  " : "DIFF"} ${c.id}  aeat ${JSON.stringify(aeat)}  ours ${JSON.stringify(ours)}${aeat.rate === null ? `  ${text.slice(0, 300)}` : ""}`);
  if (aeat.rate !== null) next.push({ ...c, cotizacionesSent: r.ss.annual, aeat: aeat as Case["aeat"] });
  await new Promise((done) => setTimeout(done, 1000));
}
console.log(`${fixture.cases.length - diffs}/${fixture.cases.length} equal`);
if (WRITE && next.length === fixture.cases.length) {
  writeFileSync(FIXTURE, `${JSON.stringify({ ...fixture, calledOn: new Date().toISOString().slice(0, 10), cases: next }, null, 1)}\n`);
  console.log(`wrote ${FIXTURE}`);
}
process.exit(diffs ? 1 : 0);
