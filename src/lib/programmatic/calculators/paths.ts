import type { Locale } from "@/lib/i18n/config";

/**
 * The calculators family: the one registry of its URLs. One static folder
 * per language under `[locale]`, one sub-folder per tool, and the hub at the
 * folder itself.
 *
 *   /es/calculadoras/            hub ([locale]/calculadoras/page.tsx)
 *   /es/calculadoras/<tool>/     each tool ([locale]/calculadoras/<slug>/page.tsx)
 *   /ca/calculadores/…
 *   /en/calculators/…
 *
 * Every tool's module (net-salary/copy.ts, self-employed/copy.ts, sick-leave/copy.ts, paid-leave/copy.ts, employment/*, rent-update/copy.ts, lottery-tax/copy.ts, bono-social/copy.ts)
 * reads its slugs from `CALCULATORS` below, and the hub lists the same
 * registry, so a tool added here shows up on the hub (tests/calculators-hub.test.ts
 * fails until it has a card). Slugs are live URLs: never change one.
 *
 * Small and data-free: client components import it.
 */

export type CalcLocale = Locale;
export const CALC_LOCALES: readonly CalcLocale[] = ["ca", "es", "en"];

export const CALCULATORS_ROOT: Record<CalcLocale, string> = { es: "calculadoras", ca: "calculadores", en: "calculators" };

/** Every tool of the family with its slug per language, in the hub's order. */
export const CALCULATORS = [
  { id: "net-salary", slugs: { es: "sueldo-neto", ca: "sou-net", en: "net-salary-spain" } },
  // Christmas extra pay (ET art. 31, LGSS art. 147.1, RIRPF arts. 82-83): gross, earned part, IRPF, net, on the net salary engine.
  { id: "extra-pay", slugs: { es: "paga-extra", ca: "paga-extra", en: "christmas-extra-pay-spain" } },
  { id: "self-employed", slugs: { es: "cuota-autonomos", ca: "quota-autonoms", en: "spain-self-employed-contributions" } },
  { id: "dismissal", slugs: { es: "indemnizacion-despido", ca: "indemnitzacio-acomiadament", en: "severance-pay-spain" } },
  { id: "settlement", slugs: { es: "finiquito", ca: "quitanca-finiquito", en: "final-settlement-spain" } },
  { id: "unemployment", slugs: { es: "paro", ca: "atur", en: "unemployment-benefit-spain" } },
  // Unemployment subsidy (subsidio por desempleo): LGSS arts. 274-280 and DA 57ª-58ª as reformed by RDL 2/2024, plus the IMV 2026 amounts.
  { id: "unemployment-subsidy", slugs: { es: "subsidio-desempleo", ca: "subsidi-atur", en: "spain-unemployment-subsidy" } },
  // Sick pay (incapacidad temporal): LGSS arts. 169-176 as amended by RDL 31/2026 from 1 Dec 2026.
  { id: "sick-leave", slugs: { es: "baja-laboral", ca: "baixa-laboral", en: "sick-leave-pay-spain" } },
  // Paid leave (permisos retribuidos, ET arts. 37, 38, 48 and 48 bis): days per event, last day, birth-leave timeline.
  { id: "paid-leave", slugs: { es: "permisos-laborales", ca: "permisos-laborals", en: "spain-paid-leave" } },
  { id: "rent-update", slugs: { es: "actualizar-alquiler", ca: "actualitzar-lloguer", en: "rent-increase-spain" } },
  // Housing: the official Euribor (Banco de España / BOE monthly figure) and the mortgage calculator that reads it.
  { id: "euribor", slugs: { es: "euribor-hoy", ca: "euribor-avui", en: "euribor-today" } },
  { id: "mortgage", slugs: { es: "hipoteca", ca: "hipoteca", en: "mortgage-calculator-spain" } },
  // Housing (hub group "housing"): ITP or IVA + AJD on buying a home, by community (lib/programmatic/home-purchase-tax).
  { id: "home-purchase-tax", slugs: { es: "impuestos-compra-vivienda", ca: "impostos-compra-habitatge", en: "spain-home-purchase-taxes" } },
  // Housing and taxes: one heir's Catalan inheritance tax (Codi tributari de Catalunya, llibre sisè, arts. 631-2 to 633-4; lib/programmatic/inheritance-tax).
  { id: "inheritance-tax", slugs: { es: "impuesto-sucesiones-cataluna", ca: "impost-successions-catalunya", en: "catalonia-inheritance-tax" } },
  // Housing: is a town a declared zona de mercado residencial tensionado (Ley 12/2023 art. 18; BOE lists), and what changes (LAU arts. 10.3, 17.6-17.7).
  { id: "zona-tensionada", slugs: { es: "zona-tensionada", ca: "zona-tensionada", en: "spain-rent-control-areas" } },
  { id: "pensions-2027", slugs: { es: "subida-pensiones-2027", ca: "pujada-pensions-2027", en: "spain-pension-increase-2027" } },
  // Retirement age (LGSS art. 205.1.a and DT 7ª), early retirement coefficients (arts. 207-208) and the delay bonus (art. 210.2).
  { id: "retirement-age", slugs: { es: "edad-jubilacion", ca: "edat-jubilacio", en: "spain-retirement-age" } },
  // Widow's pension (LGSS arts. 219-223, Decreto 3158/1966 art. 31, RD 900/2018): who is entitled, 52/60/70 %, the amount against the 2026 minimum.
  { id: "widow-pension", slugs: { es: "pension-viudedad", ca: "pensio-viduitat", en: "spain-widows-pension" } },
  // Non-contributory retirement and invalidity pension (LGSS arts. 363-372): who qualifies, the household limit, the amount, the rent supplement.
  { id: "non-contributory-pension", slugs: { es: "pension-no-contributiva", ca: "pensio-no-contributiva", en: "spain-non-contributory-pension" } },
  { id: "working-days", slugs: { es: "dias-habiles", ca: "dies-habils", en: "working-days-spain" } },
  // Reference pages with official figures (hub group "official"): the SMI with its small calculator, the INE's CPI, and the Tesoro's Letras auctions with a yield calculator.
  { id: "smi-2027", slugs: { es: "salario-minimo-2027", ca: "salari-minim-2027", en: "spain-minimum-wage-2027" } },
  // Average salary (INE EAES by community, age, sex and sector; EPA wage deciles): lib/programmatic/average-salary.
  { id: "average-salary", slugs: { es: "salario-medio", ca: "salari-mitja", en: "average-salary-spain" } },
  { id: "ipc", slugs: { es: "ipc", ca: "ipc", en: "spain-inflation-cpi" } },
  { id: "treasury-bills", slugs: { es: "letras-del-tesoro", ca: "lletres-del-tresor", en: "spain-treasury-bills" } },
  // The IPREM (hub group "official"): the figures in force from the BOE, 2004–2026, 2027 and a multiples calculator (lib/programmatic/iprem). No year in the slug.
  { id: "iprem", slugs: { es: "iprem", ca: "iprem", en: "iprem-spain" } },
  // Lottery (hub group "lottery"): the special levy on lottery prizes (Ley 35/2006, DA 33ª) per décimo, share and draw.
  { id: "lottery-tax", slugs: { es: "premios-loteria", ca: "premis-loteria", en: "spain-lottery-prize-tax" } },
  // Vehicles (hub group "vehicle"): when the ITV is due (RD 920/2017 art. 6) and the official fee per region.
  { id: "itv", slugs: { es: "itv", ca: "itv", en: "itv-spain" } },
  // Vehicles: traffic fines' deadlines, the 50 % (Ley de Tráfico arts. 93-96, 110, 112) and points (arts. 63-65).
  { id: "traffic-fines", slugs: { es: "multas-trafico", ca: "multes-transit", en: "traffic-fines-spain" } },
  // Energy at home (hub group "energy"): who qualifies for the bono social eléctrico (RD 897/2017 arts. 3-4) and its 2026 discount (RDL 7/2026 art. 1).
  { id: "bono-social", slugs: { es: "bono-social-electrico", ca: "bo-social-electric", en: "bono-social-electricity-spain" } },
] as const satisfies readonly { id: string; slugs: Record<CalcLocale, string> }[];

export type CalculatorId = (typeof CALCULATORS)[number]["id"];
export const CALCULATOR_IDS: readonly CalculatorId[] = CALCULATORS.map((c) => c.id);

/** The three employment calculators (lib/programmatic/employment/), which share one page frame. */
export type CalcKey = Extract<CalculatorId, "dismissal" | "settlement" | "unemployment">;
export const CALC_KEYS: readonly CalcKey[] = ["dismissal", "settlement", "unemployment"];

/** The tool's slugs per language. */
export function calculatorSlugs(id: CalculatorId): Record<CalcLocale, string> {
  const entry = CALCULATORS.find((c) => c.id === id);
  if (!entry) throw new Error(`unknown calculator ${id}`);
  return entry.slugs;
}

/** "/es/calculadoras/sueldo-neto/". */
export function calcPath(id: CalculatorId, locale: CalcLocale): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/${calculatorSlugs(id)[locale]}/`;
}

/** The tool's three editions, for hreflang and the language switcher. */
export function calcEditions(id: CalculatorId): Record<CalcLocale, string> {
  return { ca: calcPath(id, "ca"), es: calcPath(id, "es"), en: calcPath(id, "en") };
}

/** "/es/calculadoras/": the family's hub. */
export function calculatorsHubPath(locale: CalcLocale): string {
  return `/${locale}/${CALCULATORS_ROOT[locale]}/`;
}

export function calculatorsHubEditions(): Record<CalcLocale, string> {
  return { ca: calculatorsHubPath("ca"), es: calculatorsHubPath("es"), en: calculatorsHubPath("en") };
}
