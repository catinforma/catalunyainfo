"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { AGE_LABEL, OCCUPATION_LEVEL_LABEL, REGION_LABEL, SECTOR_LABEL, SEX_LABEL, caDe, cellText, euros, inRegion, netSalaryLink, type WageLocale } from "@/lib/programmatic/average-salary/copy";
import { find, type FinderData, type FinderInput } from "@/lib/programmatic/average-salary/engine";
import { AGE_BANDS, OCCUPATION_LEVELS, REGION_IDS, SECTORS, SEXES, type Cell, type RegionId, type Sex } from "@/lib/programmatic/average-salary/ine";
import { parseAmount } from "@/lib/programmatic/employment/paths";

/**
 * "¿Cuánto cobra la gente como tú?": pick a community, sex, age band, sector
 * and occupation level and read the INE's figures for each group, then type a
 * yearly gross salary to see where it falls among that community's EAES
 * percentiles and the EPA's national wage deciles. Server-rendered on the
 * page's default case, so the answer is in the HTML without JavaScript.
 */

const L = <T,>(locale: WageLocale, v: Record<WageLocale, T>): T => v[locale];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "los trabajadores" / "les treballadores" / "women workers", for the sentences. */
function workers(sex: Sex, locale: WageLocale): string {
  return L(locale, {
    es: { both: "los trabajadores", women: "las trabajadoras", men: "los trabajadores hombres" },
    ca: { both: "els treballadors", women: "les treballadores", men: "els treballadors homes" },
    en: { both: "workers", women: "women workers", men: "men workers" },
  })[sex];
}

function copy(locale: WageLocale) {
  return L(locale, {
    es: {
      title: "¿Cuánto cobra la gente como tú?",
      intro: "Elige comunidad, sexo, edad, sector y nivel de ocupación y escribe tu sueldo bruto anual (con las pagas extra). Verás la cifra del INE de cada grupo y en qué parte de la distribución estás.",
      noscript: "Sin JavaScript ves el caso por defecto (España, ambos sexos, 30.000 € al año). Todas las cifras están también en las tablas de abajo.",
      region: "Comunidad autónoma",
      sex: "Sexo",
      age: "Edad",
      sector: "Sector",
      occupation: "Nivel de ocupación",
      salary: "Tu sueldo bruto anual",
      salaryHint: "Antes de impuestos y cotizaciones, con las pagas extra. Déjalo vacío para ver solo las cifras del INE.",
      mean: (sex: Sex, r: RegionId, y: number) => `Salario medio, ${SEX_LABEL[sex].es.toLowerCase()}, ${inRegion(r, "es")} (${y})`,
      median: "Salario mediano (la mitad gana menos)",
      byAge: (a: string) => `Media por edad: ${a.toLowerCase()}`,
      bySector: (s: string) => `Media del sector: ${s.toLowerCase()}`,
      byOccupation: (o: string) => `Media de la ocupación ${o.split(":")[0]!.toLowerCase()}`,
      percentiles: (w: string, r: RegionId, p: string[]) => `${cap(inRegion(r, "es"))}, el 10 % de ${w} ganó menos de ${p[0]}; el 25 %, menos de ${p[1]}; la mitad, menos de ${p[2]}; el 75 %, menos de ${p[3]}, y el 90 %, menos de ${p[4]}.`,
      band: (s: string, from: number, to: number, w: string, r: RegionId, y: number) =>
        from === 0 ? `Con ${s} al año, menos del 10 % de ${w} ${inRegion(r, "es")} cobraba menos que tú en ${y}.`
        : to === 100 ? `Con ${s} al año, más del 90 % de ${w} ${inRegion(r, "es")} cobraba menos que tú en ${y}.`
        : `Con ${s} al año, entre el ${from} % y el ${to} % de ${w} ${inRegion(r, "es")} cobraba menos que tú en ${y}.`,
      decile: (s: string, m: string, d: number, from: string | null, to: string | null, y: number) =>
        `En la EPA de ${y} (todos los asalariados de España), ${s} al año son ${m} brutos al mes (anual ÷ 12): decil ${d}${from && to ? `, de ${from} a menos de ${to} al mes` : from ? `, ${from} al mes o más` : to ? `, menos de ${to} al mes` : ""}. ${d === 1 ? "Menos del 10 %" : d === 10 ? "Al menos el 90 %" : `Entre el ${(d - 1) * 10} % y el ${d * 10} %`} de los asalariados gana menos que tú.`,
      low: "* El INE avisa de que esta cifra se basa en 100 a 500 observaciones y está sujeta a gran variabilidad.",
      none: "— El INE no da la cifra: menos de 100 observaciones.",
      notCrossed: "El INE no cruza edad, sector y ocupación entre sí: cada media es la de todo el grupo (por ejemplo, todas las mujeres de 25 a 34 años de la comunidad, sea cual sea su sector).",
      net: (s: string) => `¿Cuánto son ${s} brutos en neto?`,
      netLink: "Calcúlalo en la calculadora de sueldo neto",
      invalid: "Escribe el sueldo en euros al año, por ejemplo 24000.",
      meter: (d: number) => `Decil ${d} de 10`,
    },
    ca: {
      title: "Quant cobra la gent com tu?",
      intro: "Tria comunitat, sexe, edat, sector i nivell d'ocupació i escriu el teu sou brut anual (amb les pagues extra). Veuràs la xifra de l'INE de cada grup i en quina part de la distribució ets.",
      noscript: "Sense JavaScript veus el cas per defecte (Espanya, tots dos sexes, 30.000 € l'any). Totes les xifres també són a les taules de sota.",
      region: "Comunitat autònoma",
      sex: "Sexe",
      age: "Edat",
      sector: "Sector",
      occupation: "Nivell d'ocupació",
      salary: "El teu sou brut anual",
      salaryHint: "Abans d'impostos i cotitzacions, amb les pagues extra. Deixa-ho buit per veure només les xifres de l'INE.",
      mean: (sex: Sex, r: RegionId, y: number) => `Salari mitjà, ${SEX_LABEL[sex].ca.toLowerCase()}, ${inRegion(r, "ca")} (${y})`,
      median: "Salari medià (la meitat guanya menys)",
      byAge: (a: string) => `Mitjana per edat: ${a.toLowerCase()}`,
      bySector: (s: string) => `Mitjana del sector: ${s.toLowerCase()}`,
      byOccupation: (o: string) => `Mitjana de l'ocupació ${o.split(":")[0]!.toLowerCase()}`,
      percentiles: (w: string, r: RegionId, p: string[]) => `${cap(inRegion(r, "ca"))}, el 10 % ${caDe(w)} va guanyar menys de ${p[0]}; el 25 %, menys de ${p[1]}; la meitat, menys de ${p[2]}; el 75 %, menys de ${p[3]}, i el 90 %, menys de ${p[4]}.`,
      band: (s: string, from: number, to: number, w: string, r: RegionId, y: number) =>
        from === 0 ? `Amb ${s} l'any, menys del 10 % ${caDe(w)} ${inRegion(r, "ca")} cobrava menys que tu el ${y}.`
        : to === 100 ? `Amb ${s} l'any, més del 90 % ${caDe(w)} ${inRegion(r, "ca")} cobrava menys que tu el ${y}.`
        : `Amb ${s} l'any, entre el ${from} % i el ${to} % ${caDe(w)} ${inRegion(r, "ca")} cobrava menys que tu el ${y}.`,
      decile: (s: string, m: string, d: number, from: string | null, to: string | null, y: number) =>
        `A l'EPA del ${y} (tots els assalariats d'Espanya), ${s} l'any són ${m} bruts al mes (anual ÷ 12): decil ${d}${from && to ? `, de ${from} a menys de ${to} al mes` : from ? `, ${from} al mes o més` : to ? `, menys de ${to} al mes` : ""}. ${d === 1 ? "Menys del 10 %" : d === 10 ? "Com a mínim el 90 %" : `Entre el ${(d - 1) * 10} % i el ${d * 10} %`} dels assalariats guanya menys que tu.`,
      low: "* L'INE avisa que aquesta xifra es basa en 100 a 500 observacions i està subjecta a gran variabilitat.",
      none: "— L'INE no dona la xifra: menys de 100 observacions.",
      notCrossed: "L'INE no creua edat, sector i ocupació entre si: cada mitjana és la de tot el grup (per exemple, totes les dones de 25 a 34 anys de la comunitat, sigui quin sigui el seu sector).",
      net: (s: string) => `Quant són ${s} bruts en net?`,
      netLink: "Calcula-ho a la calculadora de sou net",
      invalid: "Escriu el sou en euros l'any, per exemple 24000.",
      meter: (d: number) => `Decil ${d} de 10`,
    },
    en: {
      title: "What do people like you earn?",
      intro: "Pick a region, sex, age, sector and occupation level and type your yearly gross salary (extra payments included). You will see the INE's figure for each group and where you stand in the distribution.",
      noscript: "Without JavaScript you see the default case (Spain, both sexes, €30,000 a year). Every figure is also in the tables below.",
      region: "Region (autonomous community)",
      sex: "Sex",
      age: "Age",
      sector: "Sector",
      occupation: "Occupation level",
      salary: "Your yearly gross salary",
      salaryHint: "Before tax and contributions, extra payments included. Leave it empty to see the INE's figures only.",
      mean: (sex: Sex, r: RegionId, y: number) => `Average salary, ${SEX_LABEL[sex].en.toLowerCase()}, ${inRegion(r, "en")} (${y})`,
      median: "Median salary (half earn less)",
      byAge: (a: string) => `Average by age: ${a.toLowerCase()}`,
      bySector: (s: string) => `Average by sector: ${s.toLowerCase()}`,
      byOccupation: (o: string) => `Average for ${o.split(":")[0]!.toLowerCase()}-level occupations`,
      percentiles: (w: string, r: RegionId, p: string[]) => `${cap(inRegion(r, "en"))}, 10% of ${w} earned less than ${p[0]}; 25% less than ${p[1]}; half less than ${p[2]}; 75% less than ${p[3]}; and 90% less than ${p[4]}.`,
      band: (s: string, from: number, to: number, w: string, r: RegionId, y: number) =>
        from === 0 ? `On ${s} a year, fewer than 10% of ${w} ${inRegion(r, "en")} earned less than you in ${y}.`
        : to === 100 ? `On ${s} a year, more than 90% of ${w} ${inRegion(r, "en")} earned less than you in ${y}.`
        : `On ${s} a year, between ${from}% and ${to}% of ${w} ${inRegion(r, "en")} earned less than you in ${y}.`,
      decile: (s: string, m: string, d: number, from: string | null, to: string | null, y: number) =>
        `In the ${y} EPA (all employees in Spain), ${s} a year is ${m} gross a month (yearly ÷ 12): decile ${d}${from && to ? `, from ${from} to under ${to} a month` : from ? `, ${from} a month or more` : to ? `, under ${to} a month` : ""}. ${d === 1 ? "Fewer than 10%" : d === 10 ? "At least 90%" : `Between ${(d - 1) * 10}% and ${d * 10}%`} of employees earn less than you.`,
      low: "* The INE warns that this figure rests on 100 to 500 observations and is subject to high variability.",
      none: "— The INE gives no figure: fewer than 100 observations.",
      notCrossed: "The INE does not cross age, sector and occupation with one another: each average is for the whole group (for example, all women aged 25 to 34 in the region, whatever their sector).",
      net: (s: string) => `What is ${s} gross in net pay?`,
      netLink: "Work it out with the net salary calculator",
      invalid: "Type the salary in euros a year, for example 24000.",
      meter: (d: number) => `Decile ${d} of 10`,
    },
  });
}

export function WageFinder({ locale, data, initial }: { locale: WageLocale; data: FinderData; initial: FinderInput }) {
  const t = copy(locale);
  const id = useId();
  const [region, setRegion] = useState<RegionId>(initial.region);
  const [sex, setSex] = useState<Sex>(initial.sex);
  const [age, setAge] = useState(initial.age);
  const [sector, setSector] = useState(initial.sector);
  const [occupation, setOccupation] = useState(initial.occupation);
  const [salaryText, setSalaryText] = useState(initial.salary === null ? "" : String(initial.salary));

  const typed = salaryText.trim();
  const parsed = typed === "" ? null : parseAmount(typed);
  const invalid = typed !== "" && !(parsed !== null && parsed > 0);
  const r = find({ region, sex, age, sector, occupation, salary: invalid ? null : parsed }, data);

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("average-salary", locale, r);

  const C = (c: Cell) => cellText(c, locale);
  const M = (n: number, d = 2) => euros(n, locale, d);
  const shown: Cell[] = [r.dist.mean, r.dist.median, ...(age !== "all" ? [r.age] : []), ...(sector !== "all" ? [r.sector] : []), ...(occupation !== "all" ? [r.occupation] : [])];
  const anyLow = shown.some((c) => c?.low);
  const anyNone = shown.some((c) => c === null);
  const p = r.position;
  const pcts = (["p10", "q1", "median", "q3", "p90"] as const).map((k) => r.dist[k]);
  const w = workers(sex, locale);

  const select = <K extends string>(key: string, label: string, value: K, set: (v: K) => void, options: readonly K[], text: (k: K) => string) => (
    <p className="ci-calc-row">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <select id={`${id}-${key}`} className="ci-field" value={value} onChange={(e) => set(e.target.value as K)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {text(o)}
          </option>
        ))}
      </select>
    </p>
  );

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        {select("region", t.region, region, setRegion, REGION_IDS, (k) => REGION_LABEL[k][locale])}
        {select("sex", t.sex, sex, setSex, SEXES, (k) => SEX_LABEL[k][locale])}
        {select("age", t.age, age, setAge, AGE_BANDS, (k) => AGE_LABEL[k][locale])}
        {select("sector", t.sector, sector, setSector, SECTORS, (k) => SECTOR_LABEL[k][locale])}
        {select("occupation", t.occupation, occupation, setOccupation, OCCUPATION_LEVELS, (k) => OCCUPATION_LEVEL_LABEL[k][locale])}
        <p className="ci-calc-row">
          <label htmlFor={`${id}-salary`}>{t.salary}</label>
          <span className="ci-calc-number">
            <input id={`${id}-salary`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-salary-hint`} value={salaryText} onChange={(e) => setSalaryText(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-salary-hint`} className="ci-calc-note">
            {t.salaryHint}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        <dl className="ci-calc-results">
          <div className="ci-calc-total">
            <dt>{t.mean(sex, region, data.eaesYear)}</dt>
            <dd>{C(r.dist.mean)}</dd>
          </div>
          <div>
            <dt>{t.median}</dt>
            <dd>{C(r.dist.median)}</dd>
          </div>
          {age !== "all" ? (
            <div>
              <dt>{t.byAge(AGE_LABEL[age][locale])}</dt>
              <dd>{C(r.age)}</dd>
            </div>
          ) : null}
          {sector !== "all" ? (
            <div>
              <dt>{t.bySector(SECTOR_LABEL[sector][locale])}</dt>
              <dd>{C(r.sector)}</dd>
            </div>
          ) : null}
          {occupation !== "all" ? (
            <div>
              <dt>{t.byOccupation(OCCUPATION_LEVEL_LABEL[occupation][locale])}</dt>
              <dd>{C(r.occupation)}</dd>
            </div>
          ) : null}
        </dl>
        {pcts.every((c) => c !== null) ? <p className="ci-calc-note">{t.percentiles(w, region, pcts.map((c) => M(c!.v)))}</p> : null}

        {invalid ? (
          <p role="alert">{t.invalid}</p>
        ) : p ? (
          <>
            {p.band ? <p>{t.band(M(p.salary, Number.isInteger(p.salary) ? 0 : 2), p.band.from, p.band.to, w, region, data.eaesYear)}</p> : null}
            <p>{t.decile(M(p.salary, Number.isInteger(p.salary) ? 0 : 2), M(p.monthly, 1), p.decile, p.decileFrom === null ? null : M(p.decileFrom, 1), p.decileTo === null ? null : M(p.decileTo, 1), data.epaYear)}</p>
            <div className="mt-2 flex gap-[2px]" aria-hidden="true">
              {data.deciles.map((d) => (
                <span key={d.decile} className={`h-3 flex-1 ${d.decile === 1 ? "rounded-l" : ""} ${d.decile === 10 ? "rounded-r" : ""} ${d.decile === p.decile ? "bg-[var(--color-sea)]" : "bg-[var(--color-surface-sunk)]"}`} />
              ))}
            </div>
            <p className="ci-calc-note" aria-hidden="true">
              {t.meter(p.decile)}
            </p>
            <p>
              {t.net(M(p.salary, Number.isInteger(p.salary) ? 0 : 2))} <a href={netSalaryLink(locale, p.salary, region)}>{t.netLink}</a>.
            </p>
          </>
        ) : null}
        {anyLow ? <p className="ci-calc-note">{t.low}</p> : null}
        {anyNone ? <p className="ci-calc-note">{t.none}</p> : null}
        {age !== "all" || sector !== "all" || occupation !== "all" ? <p className="ci-calc-note">{t.notCrossed}</p> : null}
      </div>
    </section>
  );
}
