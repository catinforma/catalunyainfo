import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { CalculatorNextStep, MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import {
  AGE5_LABEL,
  AGE_LABEL,
  DIST_LABEL,
  OCCUPATION_LEVEL_LABEL,
  OCCUPATION_LEVEL_NOTE,
  REGION_LABEL,
  SECTOR_LABEL,
  SEX_LABEL,
  WORKDAY_LABEL,
  cellText,
  day,
  euros,
  labelledName,
  netSalaryLink,
  onDay,
  pct,
  wageEditions,
  wagePath,
  type WageLocale,
} from "@/lib/programmatic/average-salary/copy";
import { CSV_ATTRIBUTION, CSV_PATH } from "@/lib/programmatic/average-salary/csv";
import { SALARY_SNAPSHOT } from "@/lib/programmatic/average-salary/data";
import { finderData, regionRanking, type FinderInput } from "@/lib/programmatic/average-salary/engine";
import {
  AGE_BANDS,
  AGE_BANDS_5,
  DIST_KEYS,
  INE_LICENCE,
  INE_PAGES,
  OCCUPATION_LEVELS,
  REGION_IDS,
  SECTORS,
  SEXES,
  TABLES,
  WORKDAYS,
  tableApiUrl,
  tablePageUrl,
  type Cell,
  type RegionId,
  type Sex,
  type TableKey,
} from "@/lib/programmatic/average-salary/ine";
import { LAG_QUOTE, headline, leadText, netEstimate, releaseText, wageFaq, wageMeta } from "@/lib/programmatic/average-salary/page";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, datasetSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { RegionChart } from "./RegionChart";
import { WageFinder } from "./WageFinder";

/**
 * "Salario medio en España" / "Salari mitjà a Espanya" / "Average salary in
 * Spain": the INE's latest annual wage figures (EAES) by community, age,
 * sex, sector and occupation, the EPA's monthly wage deciles, the
 * "people like you" finder, a ranked chart, a table for every breakdown,
 * mean vs median vs mode, gross vs net (to the net salary calculator), which
 * year the data is about, a CSV of everything with "Fuente: INE", questions,
 * sources and limits. Every figure is the committed INE snapshot's.
 */

const L = <T,>(locale: WageLocale, v: Record<WageLocale, T>): T => v[locale];
const S = SALARY_SNAPSHOT;

/** Reporting regions for the community tables: Spain first, then the 17 communities in INE order. */
const ROWS: readonly RegionId[] = REGION_IDS;

/** The finder's default: Spain, both sexes, every age, sector and occupation, 30,000 € a year (the net salary calculator's own default). */
export const FINDER_DEFAULT: FinderInput = { region: "es", sex: "both", age: "all", sector: "all", occupation: "all", salary: 30000 };

export function wageCrumbs(locale: WageLocale): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label: wageMeta(locale).breadcrumb, href: wagePath(locale) }];
}

export function wageMetadata(locale: WageLocale): Metadata {
  const m = wageMeta(locale);
  return buildMetadata({ locale, path: wagePath(locale), title: m.title, description: m.description, translations: wageEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

/** "INE, tabla 28191 (API)" with both links. */
function TableSource({ table, locale }: { table: TableKey; locale: WageLocale }) {
  const spec = TABLES[table];
  const released = spec.op === "eaes" ? S.eaes.released : S.epa.released;
  return (
    <p className="text-sm">
      {L(locale, { es: "Fuente: INE", ca: "Font: INE", en: "Source: INE" })}, <A href={tablePageUrl(table)}>{L(locale, { es: `tabla ${spec.id}`, ca: `taula ${spec.id}`, en: `table ${spec.id}` })}</A> ({spec.name}; {L(locale, { es: "publicada", ca: "publicada", en: "released" })} {onDay(released, locale).replace(/^(el |on )/, "")}) · <A href={tableApiUrl(table, "ES", 1)}>API</A>
    </p>
  );
}

function Flags({ cells, locale }: { cells: Cell[]; locale: WageLocale }) {
  const low = cells.some((c) => c?.low);
  const none = cells.some((c) => c === null);
  if (!low && !none) return null;
  return (
    <p className="text-sm text-[var(--color-muted)]">
      {low
        ? L(locale, {
            es: "* Cifra basada en 100 a 500 observaciones: el INE avisa de que está sujeta a gran variabilidad. ",
            ca: "* Xifra basada en 100 a 500 observacions: l'INE avisa que està subjecta a gran variabilitat. ",
            en: "* Figure based on 100 to 500 observations: the INE warns it is subject to high variability. ",
          })
        : ""}
      {none ? L(locale, { es: "— El INE no da la cifra (menos de 100 observaciones).", ca: "— L'INE no dona la xifra (menys de 100 observacions).", en: "— The INE gives no figure (fewer than 100 observations)." }) : ""}
    </p>
  );
}

/** A server-rendered table: one header row, then a labelled row of INE cells each. */
function Grid({ caption, first, cols, rows, locale, decimals = 2, flags = true }: { caption: string; first: string; cols: string[]; rows: { key: string; label: string; cells: Cell[]; strong?: boolean }[]; locale: WageLocale; decimals?: number; flags?: boolean }) {
  return (
    <>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table ci-stack-table">
          <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{first}</th>
              {cols.map((c) => (
                <th key={c} scope="col" className="text-right">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row" className={r.strong ? "font-semibold" : "font-normal"}>
                  {r.label}
                </th>
                {r.cells.map((c, i) => (
                  <td key={cols[i]} data-label={cols[i]} className="whitespace-nowrap text-right tabular-nums">
                    {cellText(c, locale, decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {flags ? <Flags cells={rows.flatMap((r) => r.cells)} locale={locale} /> : null}
    </>
  );
}

export function AverageSalaryRoute({ locale }: { locale: WageLocale }) {
  const meta = wageMeta(locale);
  const crumbs = wageCrumbs(locale);
  const h = headline(S);
  const M = (n: number, d = 2) => euros(n, locale, d);
  const y = S.eaes.year;
  const ey = S.epa.year;
  const es = S.eaes.dist.es;
  const faq = wageFaq(locale, S);
  const ranking = regionRanking(S);
  const net = netEstimate(h.mean);
  const netMedian = netEstimate(h.median);
  const regionName = (r: RegionId) => REGION_LABEL[r][locale];
  const sexCols = SEXES.map((s) => SEX_LABEL[s][locale]);

  const hd = L(locale, {
    es: {
      figures: `Las cifras clave (${y})`,
      regions: "Salario medio por comunidad autónoma",
      age: "Salario medio por edad",
      ageRegion: "Por comunidad y edad",
      sector: "Salario medio por sector de actividad",
      sectorRegion: "Por comunidad y sector",
      occupation: "Salario medio por ocupación",
      occupationRegion: "Por comunidad y nivel de ocupación",
      workday: "Jornada completa y parcial",
      deciles: `Deciles de salarios de la EPA (${ey})`,
      measures: "Media, mediana y moda: cuál mirar",
      net: "Bruto y neto",
      year: "De qué año son estos datos",
      differ: "Por qué otras cifras no coinciden",
      agreement: "¿Buscas la tabla salarial de tu convenio?",
      csv: "Descarga los datos (CSV) y cómo citarlos",
      faq: "Preguntas frecuentes",
      sources: "Fuentes",
      limits: "Qué no dice esta página",
    },
    ca: {
      figures: `Les xifres clau (${y})`,
      regions: "Salari mitjà per comunitat autònoma",
      age: "Salari mitjà per edat",
      ageRegion: "Per comunitat i edat",
      sector: "Salari mitjà per sector d'activitat",
      sectorRegion: "Per comunitat i sector",
      occupation: "Salari mitjà per ocupació",
      occupationRegion: "Per comunitat i nivell d'ocupació",
      workday: "Jornada completa i parcial",
      deciles: `Decils de salaris de l'EPA (${ey})`,
      measures: "Mitjana, mediana i moda: quina mirar",
      net: "Brut i net",
      year: "De quin any són aquestes dades",
      differ: "Per què altres xifres no coincideixen",
      agreement: "Busques la taula salarial del teu conveni?",
      csv: "Descarrega les dades (CSV) i com citar-les",
      faq: "Preguntes freqüents",
      sources: "Fonts",
      limits: "Què no diu aquesta pàgina",
    },
    en: {
      figures: `The key figures (${y})`,
      regions: "Average salary by region",
      age: "Average salary by age",
      ageRegion: "By region and age",
      sector: "Average salary by sector",
      sectorRegion: "By region and sector",
      occupation: "Average salary by occupation",
      occupationRegion: "By region and occupation level",
      workday: "Full-time and part-time",
      deciles: `EPA wage deciles (${ey})`,
      measures: "Mean, median and mode: which one to look at",
      net: "Gross and net",
      year: "Which year these figures are for",
      differ: "Why other figures do not match",
      agreement: "Looking for your collective agreement's pay table?",
      csv: "Download the data (CSV) and how to cite it",
      faq: "Frequently asked questions",
      sources: "Sources",
      limits: "What this page does not tell you",
    },
  });

  const yearly = L(locale, { es: "Euros brutos al año por trabajador", ca: "Euros bruts l'any per treballador", en: "Gross euros a year per worker" });
  const monthly = L(locale, { es: "euros brutos al mes", ca: "euros bruts al mes", en: "gross euros a month" });
  const regionCol = L(locale, { es: "Comunidad", ca: "Comunitat", en: "Region" });

  const keyFigures: { label: string; value: string; note: string; total?: boolean }[] = [
    { label: L(locale, { es: "Salario medio (media)", ca: "Salari mitjà (mitjana)", en: "Average salary (mean)" }), value: M(h.mean), note: `INE ${TABLES.dist.id}`, total: true },
    { label: L(locale, { es: "Salario mediano (la mitad gana menos)", ca: "Salari medià (la meitat guanya menys)", en: "Median salary (half earn less)" }), value: M(h.median), note: `INE ${TABLES.dist.id}` },
    ...(h.modal ? [{ label: L(locale, { es: "Salario más frecuente (moda)", ca: "Salari més freqüent (moda)", en: "Most common salary (mode)" }), value: M(h.modal.value), note: L(locale, { es: "INE, nota de prensa", ca: "INE, nota de premsa", en: "INE, press release" }) }] : []),
    { label: L(locale, { es: "Mujeres (media)", ca: "Dones (mitjana)", en: "Women (mean)" }), value: M(h.women), note: `INE ${TABLES.dist.id}` },
    { label: L(locale, { es: "Hombres (media)", ca: "Homes (mitjana)", en: "Men (mean)" }), value: M(h.men), note: `INE ${TABLES.dist.id}` },
    { label: L(locale, { es: `Al mes, media EPA ${ey} (extras prorrateadas)`, ca: `Al mes, mitjana EPA ${ey} (extres prorratejades)`, en: `Per month, EPA ${ey} mean (extras prorated)` }), value: M(h.epa.mean, 1), note: `INE ${TABLES.decileWorkday.id}` },
    ...(h.epa.median !== null ? [{ label: L(locale, { es: `Al mes, mediana EPA ${ey}`, ca: `Al mes, mediana EPA ${ey}`, en: `Per month, EPA ${ey} median` }), value: M(h.epa.median, 1), note: `INE ${TABLES.deciles.id}` }] : []),
  ];

  const sexDetails = (title: string, build: (sex: Sex) => ReactNode) => (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-medium">{title}</summary>
      {(["women", "men"] as const).map((sex) => (
        <div key={sex}>{build(sex)}</div>
      ))}
    </details>
  );
  const bySexTitle = L(locale, { es: "Ver la tabla para mujeres y para hombres", ca: "Veure la taula per a dones i per a homes", en: "Show the table for women and for men" });

  const measures = L(locale, {
    es: [
      `La media (${M(h.mean)}) suma todos los salarios y divide entre el número de trabajadores. Unos pocos sueldos muy altos la suben, por eso la mayoría cobra menos que la media: en ${y}, la mitad de los trabajadores ganó menos de ${M(h.median)}, que es la mediana.`,
      h.modal ? `La moda es el salario más frecuente: ${M(h.modal.value)}, el ${pct(h.modal.share, "es")} de los asalariados, según la nota de prensa del INE. El INE lo resume así: «este hecho da lugar a que el salario medio sea superior tanto al salario mediano, como al más frecuente».` : "",
      "Para saber si un sueldo es «normal», mira la mediana y los percentiles de tu comunidad (tabla de abajo o el buscador). La media sirve para comparar territorios o años.",
    ],
    ca: [
      `La mitjana (${M(h.mean)}) suma tots els salaris i divideix pel nombre de treballadors. Uns pocs sous molt alts l'apugen, per això la majoria cobra menys que la mitjana: el ${y}, la meitat dels treballadors va guanyar menys de ${M(h.median)}, que és la mediana.`,
      h.modal ? `La moda és el salari més freqüent: ${M(h.modal.value)}, el ${pct(h.modal.share, "ca")} dels assalariats, segons la nota de premsa de l'INE, que ho resumeix així: «este hecho da lugar a que el salario medio sea superior tanto al salario mediano, como al más frecuente».` : "",
      "Per saber si un sou és «normal», mira la mediana i els percentils de la teva comunitat (taula de sota o el cercador). La mitjana serveix per comparar territoris o anys.",
    ],
    en: [
      `The mean (${M(h.mean)}) adds up every salary and divides by the number of workers. A few very high salaries pull it up, which is why most people earn less than the mean: in ${y}, half of all workers earned less than ${M(h.median)}, the median.`,
      h.modal ? `The mode is the most common salary: ${M(h.modal.value)}, earned by ${pct(h.modal.share, "en")} of employees, according to the INE's press release, which sums it up: «este hecho da lugar a que el salario medio sea superior tanto al salario mediano, como al más frecuente» (this makes the mean higher than both the median and the most common salary).` : "",
      "To judge whether a salary is \"normal\", look at the median and the percentiles of your region (table below, or the finder). The mean is for comparing places or years.",
    ],
  }).filter(Boolean);

  const netText = L(locale, {
    es: `Todas las cifras del INE de esta página son brutas: antes de restar las cotizaciones a la Seguridad Social y la retención del IRPF, e incluyen las pagas extra. Para pasarlas a neto depende de tu situación: con nuestra calculadora (normas de 2026, soltero, sin hijos, contrato indefinido, 14 pagas, régimen común), el salario medio de ${M(h.mean)} deja unos ${M(net.annual)} netos al año y el mediano de ${M(h.median)}, unos ${M(netMedian.annual)}. Es una estimación nuestra, no un dato del INE.`,
    ca: `Totes les xifres de l'INE d'aquesta pàgina són brutes: abans de restar les cotitzacions a la Seguretat Social i la retenció de l'IRPF, i inclouen les pagues extra. Per passar-les a net depèn de la teva situació: amb la nostra calculadora (normes del 2026, solter, sense fills, contracte indefinit, 14 pagues, règim comú), el salari mitjà de ${M(h.mean)} deixa uns ${M(net.annual)} nets l'any i el medià de ${M(h.median)}, uns ${M(netMedian.annual)}. És una estimació nostra, no una dada de l'INE.`,
    en: `Every INE figure on this page is gross: before Social Security contributions and income tax withholding, with extra payments included. Net pay depends on your circumstances: with our calculator (2026 rules, single, no children, open-ended contract, 14 payments, common tax regime), the mean of ${M(h.mean)} leaves about ${M(net.annual)} net a year and the median of ${M(h.median)} about ${M(netMedian.annual)}. This is our estimate, not an INE figure.`,
  });

  const differ = L(locale, {
    es: [
      `Encuesta Anual de Estructura Salarial (EAES): ganancia bruta anual por trabajador de las empresas del Régimen General de la Seguridad Social (secciones B a S de la CNAE-09, más el transporte marítimo); no incluye la agricultura, el empleo de hogar ni a los autónomos. Es la fuente de las cifras anuales de esta página.`,
      `Deciles de la EPA: salario bruto mensual del empleo principal de todos los asalariados que viven en España (también agricultura y sector público), calculado como lo cobrado en el año dividido entre 12; los empleos a tiempo parcial no se convierten a jornada completa. Por eso su media mensual (${M(h.epa.mean, 1)}) no es la anual de la EAES dividida entre 12.`,
      "La Encuesta de Estructura Salarial cuatrienal (la última, de 2022) tiene más detalle (antigüedad, estudios, tamaño de empresa) y otras cifras. Eurostat, la Agencia Tributaria o las ofertas de empleo miden otras poblaciones y conceptos.",
      "Muchos artículos que circulan citan años antiguos: comprueba siempre de qué año es el dato y de qué encuesta sale.",
    ],
    ca: [
      `Enquesta Anual d'Estructura Salarial (EAES): guany brut anual per treballador de les empreses del Règim General de la Seguretat Social (seccions B a S de la CNAE-09, més el transport marítim); no inclou l'agricultura, la feina de la llar ni els autònoms. És la font de les xifres anuals d'aquesta pàgina.`,
      `Decils de l'EPA: salari brut mensual de la feina principal de tots els assalariats que viuen a Espanya (també agricultura i sector públic), calculat com el que s'ha cobrat l'any dividit entre 12; les feines a temps parcial no es converteixen a jornada completa. Per això la seva mitjana mensual (${M(h.epa.mean, 1)}) no és l'anual de l'EAES dividida entre 12.`,
      "L'Enquesta d'Estructura Salarial quadriennal (l'última, del 2022) té més detall (antiguitat, estudis, mida de l'empresa) i altres xifres. Eurostat, l'Agència Tributària o les ofertes de feina mesuren altres poblacions i conceptes.",
      "Molts articles que circulen citen anys antics: comprova sempre de quin any és la dada i de quina enquesta surt.",
    ],
    en: [
      `Annual Wage Structure Survey (EAES): gross yearly earnings per worker at employers in the Social Security general scheme (CNAE-09 sections B to S, plus sea transport); it leaves out agriculture, domestic work and the self-employed. It is the source of this page's yearly figures.`,
      `EPA deciles: the gross monthly wage of the main job of every employee living in Spain (agriculture and the public sector included), computed as what was earned in the year divided by 12; part-time jobs are not converted to full-time. That is why its monthly mean (${M(h.epa.mean, 1)}) is not the EAES yearly mean divided by 12.`,
      "The four-yearly Wage Structure Survey (latest: 2022) has more detail (length of service, education, firm size) and different figures. Eurostat, the tax agency or job ads measure other populations and concepts.",
      "Many articles in circulation quote old years: always check which year a figure is for and which survey it comes from.",
    ],
  });

  const agreement = L(locale, {
    es: "Las tablas salariales de cada profesión no las publica el INE: las fija tu convenio colectivo, que se publica en el BOE o en el boletín oficial de tu comunidad o provincia y obliga a las empresas que incluye (Estatuto de los Trabajadores, art. 82.3). Puedes buscarlo en el registro oficial de convenios del Ministerio de Trabajo (REGCON). Las cifras de esta página son lo que se cobró de media, no el mínimo de tu categoría.",
    ca: "Les taules salarials de cada professió no les publica l'INE: les fixa el teu conveni col·lectiu, que es publica al BOE o al butlletí oficial de la teva comunitat o província i obliga les empreses que inclou (Estatut dels Treballadors, art. 82.3). El pots cercar al registre oficial de convenis del Ministeri de Treball (REGCON). Les xifres d'aquesta pàgina són el que es va cobrar de mitjana, no el mínim de la teva categoria.",
    en: "The INE does not publish pay tables for each job: your collective agreement sets them. It is published in the BOE or in your region's or province's official gazette and binds the employers it covers (Workers' Statute, art. 82.3). You can search for it in the Ministry of Labour's official register of agreements (REGCON). The figures on this page are what people earned on average, not the minimum for your grade.",
  });

  const citation = L(locale, {
    es: `Fuente: INE, Encuesta Anual de Estructura Salarial ${y} (publicada ${onDay(S.eaes.released, "es")}) y EPA, decil de salarios del empleo principal ${ey} (publicada ${onDay(S.epa.released, "es")}). Elaboración: CatalunyaInfo, ${absoluteUrl(wagePath("es"))}`,
    ca: `Font: INE, Enquesta Anual d'Estructura Salarial ${y} (publicada ${onDay(S.eaes.released, "ca")}) i EPA, decil de salaris de la feina principal ${ey} (publicada ${onDay(S.epa.released, "ca")}). Elaboració: CatalunyaInfo, ${absoluteUrl(wagePath("ca"))}`,
    en: `Source: INE, Annual Wage Structure Survey ${y} (released ${onDay(S.eaes.released, "en")}) and EPA wage deciles of the main job ${ey} (released ${onDay(S.epa.released, "en")}). Compiled by CatalunyaInfo, ${absoluteUrl(wagePath("en"))}`,
  });

  const csvText = L(locale, {
    es: `Todas las cifras de esta página (y las de mujeres y hombres de cada tabla) en un solo archivo: una fila por cifra, con su tabla del INE, el año, el día de publicación y la nota del INE cuando la cifra tiene pocas observaciones. Separado por comas, punto decimal, UTF-8. Cada fila lleva «${CSV_ATTRIBUTION}». Los datos del INE se pueden reutilizar con licencia CC BY 4.0 citando la fuente y la fecha de actualización.`,
    ca: `Totes les xifres d'aquesta pàgina (i les de dones i homes de cada taula) en un sol fitxer: una fila per xifra, amb la taula de l'INE, l'any, el dia de publicació i la nota de l'INE quan la xifra té poques observacions. Separat per comes, punt decimal, UTF-8. Cada fila porta «${CSV_ATTRIBUTION}». Les dades de l'INE es poden reutilitzar amb llicència CC BY 4.0 citant la font i la data d'actualització.`,
    en: `Every figure on this page (and the women's and men's figures of each table) in one file: one row per figure, with its INE table, the year, the release day and the INE's note when a figure rests on few observations. Comma-separated, decimal point, UTF-8; labels are the INE's own, in Spanish. Each row carries "${CSV_ATTRIBUTION}". INE data may be reused under CC BY 4.0, citing the source and the date of the update.`,
  });

  const limits = L(locale, {
    es: [
      "Son datos oficiales de lo que se cobró, no una previsión ni una tabla de lo que deberías cobrar.",
      "El INE no cruza edad, sector y ocupación entre sí: cada media es la de todo el grupo.",
      "Las cifras marcadas con * tienen pocas observaciones y el INE avisa de su gran variabilidad; las que no aparecen (—) no las da el INE.",
      "Ceuta y Melilla no tienen fila en estas tablas del INE.",
      "El paso a neto es una estimación de nuestra calculadora, no del INE.",
    ],
    ca: [
      "Són dades oficials del que es va cobrar, no una previsió ni una taula del que hauries de cobrar.",
      "L'INE no creua edat, sector i ocupació entre si: cada mitjana és la de tot el grup.",
      "Les xifres marcades amb * tenen poques observacions i l'INE n'avisa de la gran variabilitat; les que no hi surten (—) no les dona l'INE.",
      "Ceuta i Melilla no tenen fila en aquestes taules de l'INE.",
      "El pas a net és una estimació de la nostra calculadora, no de l'INE.",
    ],
    en: [
      "These are official figures for what people earned, not a forecast or a table of what you should earn.",
      "The INE does not cross age, sector and occupation: each average is for the whole group.",
      "Figures marked * rest on few observations and the INE warns of their high variability; those missing (—) are not given by the INE.",
      "Ceuta and Melilla have no row in these INE tables.",
      "The conversion to net pay is our calculator's estimate, not the INE's.",
    ],
  });

  const disclaimer = L(locale, {
    es: `Información orientativa con datos oficiales del INE, revisada ${onDay(S.asOf, "es")}. No sustituye a tu convenio, tu nómina ni al asesoramiento de un profesional. Las cifras son las del INE; si ves una diferencia con el INE, manda la del INE.`,
    ca: `Informació orientativa amb dades oficials de l'INE, revisada ${onDay(S.asOf, "ca")}. No substitueix el teu conveni, la teva nòmina ni l'assessorament d'un professional. Les xifres són les de l'INE; si hi veus una diferència amb l'INE, mana la de l'INE.`,
    en: `Guidance built on official INE data, checked ${onDay(S.asOf, "en")}. It does not replace your collective agreement, your payslip or professional advice. The figures are the INE's; if you see a difference with the INE, the INE's figure prevails.`,
  });

  const dataset = datasetSchema({
    path: wagePath(locale),
    name: meta.h1,
    description: meta.description,
    locale,
    creator: "Instituto Nacional de Estadística (INE)",
    license: INE_LICENCE,
    isBasedOn: (Object.keys(TABLES) as TableKey[]).map(tablePageUrl),
    spatialCoverage: L(locale, { es: "España", ca: "Espanya", en: "Spain" }),
    temporalCoverage: String(y === ey ? y : `${Math.min(y, ey)}/${Math.max(y, ey)}`),
    dateModified: S.asOf,
  });
  const datasetNode = dataset ? { ...dataset, distribution: { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: absoluteUrl(CSV_PATH) } } : null;
  const faqSchema = { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <SiteHeader locale={locale} translations={wageEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{leadText(locale, S)}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">
                {L(locale, {
                  es: `Datos del INE consultados ${onDay(S.asOf, "es")}. Fuente: INE.`,
                  ca: `Dades de l'INE consultades ${onDay(S.asOf, "ca")}. Font: INE.`,
                  en: `INE data checked ${onDay(S.asOf, "en")}. Source: INE.`,
                })}
              </p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <h2 id="cifras">{hd.figures}</h2>
              <dl className="ci-calc-results">
                {keyFigures.map((f) => (
                  <div key={f.label} className={f.total ? "ci-calc-total" : undefined}>
                    <dt>
                      {f.label} <span className="text-xs font-normal text-[var(--color-muted)]">({f.note})</span>
                    </dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>

              <WageFinder locale={locale} data={finderData(S)} initial={FINDER_DEFAULT} />
              <CalculatorNextStep current="average-salary" locale={locale} />

              <h2 id="comunidades">{hd.regions}</h2>
              <RegionChart locale={locale} rows={ranking} national={h.mean} year={y} tableId={TABLES.dist.id} />
              <Grid
                locale={locale}
                caption={`${yearly}, ${y}. ${L(locale, { es: "Percentil 10: el 10 % gana menos; P25, P75 y P90, igual.", ca: "Percentil 10: el 10 % guanya menys; P25, P75 i P90, igual.", en: "10th percentile: 10% earn less; likewise P25, P75 and P90." })}`}
                first={regionCol}
                cols={[...DIST_KEYS.map((k) => DIST_LABEL[k][locale]), SEX_LABEL.women[locale], SEX_LABEL.men[locale]]}
                rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: [...DIST_KEYS.map((k) => S.eaes.dist[r].both[k]), S.eaes.dist[r].women.mean, S.eaes.dist[r].men.mean] }))}
              />
              <TableSource table="dist" locale={locale} />
              {sexDetails(bySexTitle, (sex) => (
                <Grid
                  locale={locale}
                  caption={`${SEX_LABEL[sex][locale]}. ${yearly}, ${y}.`}
                  first={regionCol}
                  cols={DIST_KEYS.map((k) => DIST_LABEL[k][locale])}
                  rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: DIST_KEYS.map((k) => S.eaes.dist[r][sex][k]) }))}
                />
              ))}

              <h2 id="edad">{hd.age}</h2>
              <Grid
                locale={locale}
                caption={`${yearly}, ${y}. ${L(locale, { es: "España.", ca: "Espanya.", en: "Spain." })}`}
                first={L(locale, { es: "Edad", ca: "Edat", en: "Age" })}
                cols={sexCols}
                rows={AGE_BANDS_5.map((a) => ({ key: a, label: AGE5_LABEL[a][locale], strong: a === "all", cells: SEXES.map((s) => S.eaes.ageNational[s][a]) }))}
              />
              <TableSource table="ageNational" locale={locale} />
              <h3 id="comunidad-edad">{hd.ageRegion}</h3>
              <Grid
                locale={locale}
                caption={`${SEX_LABEL.both[locale]}. ${yearly}, ${y}.`}
                first={regionCol}
                cols={AGE_BANDS.map((a) => AGE_LABEL[a][locale])}
                rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: AGE_BANDS.map((a) => S.eaes.ageRegion[r].both[a]) }))}
              />
              <TableSource table="ageRegion" locale={locale} />
              {sexDetails(bySexTitle, (sex) => (
                <Grid
                  locale={locale}
                  caption={`${SEX_LABEL[sex][locale]}. ${yearly}, ${y}.`}
                  first={regionCol}
                  cols={AGE_BANDS.map((a) => AGE_LABEL[a][locale])}
                  rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: AGE_BANDS.map((a) => S.eaes.ageRegion[r][sex][a]) }))}
                />
              ))}

              <h2 id="sector">{hd.sector}</h2>
              <Grid
                locale={locale}
                caption={`${yearly}, ${y}. ${L(locale, { es: "España, secciones de la CNAE-09.", ca: "Espanya, seccions de la CNAE-09.", en: "Spain, CNAE-09 sections." })}`}
                first={L(locale, { es: "Sección de actividad", ca: "Secció d'activitat", en: "Sector (section)" })}
                cols={sexCols}
                rows={[
                  { key: "all", label: L(locale, { es: "Todas las secciones", ca: "Totes les seccions", en: "All sections" }), strong: true, cells: SEXES.map((s) => es[s].mean) },
                  ...S.eaes.sections.map((row) => ({ key: row.code, label: `${row.code}. ${labelledName(row, "sections", locale)}`, cells: SEXES.map((s) => row.values[s]) })),
                ]}
              />
              <TableSource table="sections" locale={locale} />
              <h3 id="comunidad-sector">{hd.sectorRegion}</h3>
              <Grid
                locale={locale}
                caption={`${SEX_LABEL.both[locale]}. ${yearly}, ${y}.`}
                first={regionCol}
                cols={SECTORS.map((k) => SECTOR_LABEL[k][locale])}
                rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: SECTORS.map((k) => S.eaes.sectorRegion[r].both[k]) }))}
              />
              <TableSource table="sectorRegion" locale={locale} />
              {sexDetails(bySexTitle, (sex) => (
                <Grid
                  locale={locale}
                  caption={`${SEX_LABEL[sex][locale]}. ${yearly}, ${y}.`}
                  first={regionCol}
                  cols={SECTORS.map((k) => SECTOR_LABEL[k][locale])}
                  rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: SECTORS.map((k) => S.eaes.sectorRegion[r][sex][k]) }))}
                />
              ))}

              <h2 id="ocupacion">{hd.occupation}</h2>
              <Grid
                locale={locale}
                caption={`${yearly}, ${y}. ${L(locale, { es: "España, grupos de la CNO-11.", ca: "Espanya, grups de la CNO-11.", en: "Spain, CNO-11 groups." })}`}
                first={L(locale, { es: "Ocupación", ca: "Ocupació", en: "Occupation" })}
                cols={sexCols}
                rows={[
                  { key: "all", label: OCCUPATION_LEVEL_LABEL.all[locale], strong: true, cells: SEXES.map((s) => es[s].mean) },
                  ...S.eaes.occupations.map((row) => ({ key: row.code, label: labelledName(row, "occupations", locale), cells: SEXES.map((s) => row.values[s]) })),
                ]}
              />
              <TableSource table="occupations" locale={locale} />
              <h3 id="comunidad-ocupacion">{hd.occupationRegion}</h3>
              <p className="text-sm">{OCCUPATION_LEVEL_NOTE[locale]}</p>
              <Grid
                locale={locale}
                caption={`${SEX_LABEL.both[locale]}. ${yearly}, ${y}.`}
                first={regionCol}
                cols={OCCUPATION_LEVELS.map((k) => (k === "all" ? OCCUPATION_LEVEL_LABEL.all[locale] : OCCUPATION_LEVEL_LABEL[k][locale].split(":")[0]!))}
                rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: OCCUPATION_LEVELS.map((k) => S.eaes.occupationRegion[r].both[k]) }))}
              />
              <TableSource table="occupationRegion" locale={locale} />
              {sexDetails(bySexTitle, (sex) => (
                <Grid
                  locale={locale}
                  caption={`${SEX_LABEL[sex][locale]}. ${yearly}, ${y}.`}
                  first={regionCol}
                  cols={OCCUPATION_LEVELS.map((k) => (k === "all" ? OCCUPATION_LEVEL_LABEL.all[locale] : OCCUPATION_LEVEL_LABEL[k][locale].split(":")[0]!))}
                  rows={ROWS.map((r) => ({ key: r, label: regionName(r), strong: r === "es", cells: OCCUPATION_LEVELS.map((k) => S.eaes.occupationRegion[r][sex][k]) }))}
                />
              ))}

              <h2 id="jornada">{hd.workday}</h2>
              <Grid
                locale={locale}
                caption={`${yearly}, ${y}. ${L(locale, { es: "España.", ca: "Espanya.", en: "Spain." })}`}
                first={L(locale, { es: "Jornada", ca: "Jornada", en: "Working time" })}
                cols={sexCols}
                rows={WORKDAYS.map((w) => ({ key: w, label: WORKDAY_LABEL[w][locale], strong: w === "all", cells: SEXES.map((s) => S.eaes.workday[s][w]) }))}
              />
              <TableSource table="workday" locale={locale} />
              <p>
                {L(locale, {
                  es: `En la EPA de ${ey}, el salario bruto mensual medio fue de ${M(S.epa.means.full, 1)} a jornada completa y de ${M(S.epa.means.part, 1)} a tiempo parcial (sin convertir a jornada completa).`,
                  ca: `A l'EPA del ${ey}, el salari brut mensual mitjà va ser de ${M(S.epa.means.full, 1)} a jornada completa i de ${M(S.epa.means.part, 1)} a temps parcial (sense convertir a jornada completa).`,
                  en: `In the ${ey} EPA, the average gross monthly wage was ${M(S.epa.means.full, 1)} full-time and ${M(S.epa.means.part, 1)} part-time (not converted to full-time).`,
                })}
              </p>
              <TableSource table="decileWorkday" locale={locale} />

              <h2 id="deciles">{hd.deciles}</h2>
              <p>
                {L(locale, {
                  es: `La EPA ordena a todos los asalariados de España por su salario bruto mensual del empleo principal y los parte en diez grupos iguales. El INE calcula ese salario dividiendo entre 12 lo cobrado en el año, con las pagas extra prorrateadas. Para saber en qué decil estás, divide tu sueldo bruto anual entre 12 (el buscador lo hace por ti).`,
                  ca: `L'EPA ordena tots els assalariats d'Espanya pel salari brut mensual de la feina principal i els divideix en deu grups iguals. L'INE calcula aquest salari dividint entre 12 el que s'ha cobrat l'any, amb les pagues extra prorratejades. Per saber en quin decil ets, divideix el teu sou brut anual entre 12 (el cercador ho fa per tu).`,
                  en: `The EPA ranks every employee in Spain by the gross monthly wage of their main job and splits them into ten equal groups. The INE computes that wage as the year's earnings divided by 12, extra payments prorated. To find your decile, divide your yearly gross salary by 12 (the finder does it for you).`,
                })}
              </p>
              <Grid
                locale={locale}
                decimals={1}
                flags={false}
                caption={`${L(locale, { es: "Euros brutos al mes", ca: "Euros bruts al mes", en: "Gross euros a month" })}, ${ey}. ${L(locale, { es: "Total de asalariados.", ca: "Total d'assalariats.", en: "All employees." })}`}
                first={L(locale, { es: "Decil", ca: "Decil", en: "Decile" })}
                cols={[L(locale, { es: "Desde (límite inferior)", ca: "Des de (límit inferior)", en: "From (lower limit)" }), L(locale, { es: "Salario medio del decil", ca: "Salari mitjà del decil", en: "Decile's average wage" })]}
                rows={S.epa.deciles.map((d) => ({ key: String(d.decile), label: String(d.decile), cells: [d.lower === null ? null : { v: d.lower }, { v: d.mean }] }))}
              />
              <p className="text-sm text-[var(--color-muted)]">
                {L(locale, {
                  es: `El INE no da límite inferior para el primer decil (—). Mediana: ${h.epa.median !== null ? M(h.epa.median, 1) : "—"} al mes, el límite inferior del decil 6. Unidad: ${monthly}.`,
                  ca: `L'INE no dona límit inferior per al primer decil (—). Mediana: ${h.epa.median !== null ? M(h.epa.median, 1) : "—"} al mes, el límit inferior del decil 6. Unitat: ${monthly}.`,
                  en: `The INE gives no lower limit for the first decile (—). Median: ${h.epa.median !== null ? M(h.epa.median, 1) : "—"} a month, the lower limit of decile 6. Unit: ${monthly}.`,
                })}
              </p>
              <TableSource table="deciles" locale={locale} />

              <h2 id="media-mediana-moda">{hd.measures}</h2>
              {measures.map((p) => (
                <p key={p}>{p}</p>
              ))}

              <h2 id="bruto-neto">{hd.net}</h2>
              <p>{netText}</p>
              <p>
                <Link href={netSalaryLink(locale, h.mean, null)}>
                  {L(locale, { es: `Calcula el neto de ${M(h.mean)} brutos`, ca: `Calcula el net de ${M(h.mean)} bruts`, en: `Work out the net pay of ${M(h.mean)} gross` })}
                </Link>{" "}
                ·{" "}
                <Link href={netSalaryLink(locale, h.median, null)}>
                  {L(locale, { es: `el de ${M(h.median)}`, ca: `el de ${M(h.median)}`, en: `of ${M(h.median)}` })}
                </Link>{" "}
                · <Link href={calcPath("smi-2027", locale)}>{L(locale, { es: "Salario mínimo (SMI)", ca: "Salari mínim (SMI)", en: "Minimum wage (SMI)" })}</Link>
              </p>

              <h2 id="ano-de-los-datos">{hd.year}</h2>
              {releaseText(locale, S).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <blockquote lang="es">
                <p>«{LAG_QUOTE}»</p>
                <footer className="text-sm">
                  <A href={INE_PAGES.epaMethod}>{L(locale, { es: "INE, El salario del empleo principal en la EPA, metodología", ca: "INE, El salario del empleo principal en la EPA, metodologia", en: "INE, El salario del empleo principal en la EPA, methodology" })}</A>
                </footer>
              </blockquote>

              <h2 id="otras-cifras">{hd.differ}</h2>
              <ul>
                {differ.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <h2 id="tabla-salarial-convenio">{hd.agreement}</h2>
              <p>
                {agreement} <A href="https://expinterweb.mites.gob.es/regcon/pub/consultaPublicaEstatal">{L(locale, { es: "Buscar mi convenio en REGCON", ca: "Cercar el meu conveni a REGCON", en: "Search for my agreement in REGCON" })}</A>.
              </p>

              <h2 id="descarga">{hd.csv}</h2>
              <p>{csvText}</p>
              <p>
                <a href={CSV_PATH} download>
                  {L(locale, { es: "Descargar salario-medio-ine.csv", ca: "Descarregar salario-medio-ine.csv", en: "Download salario-medio-ine.csv" })}
                </a>{" "}
                · <A href={INE_LICENCE}>CC BY 4.0</A> · <A href={INE_PAGES.licence}>{L(locale, { es: "condiciones de reutilización del INE", ca: "condicions de reutilització de l'INE", en: "INE reuse terms" })}</A>
              </p>
              <p className="text-sm">
                {L(locale, { es: "Para citar esta página:", ca: "Per citar aquesta pàgina:", en: "To cite this page:" })} <q>{citation}</q>
              </p>

              <h2 id="preguntas">{hd.faq}</h2>
              {faq.map((f) => (
                <section key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </section>
              ))}

              <h2 id="fuentes">{hd.sources}</h2>
              <ul className="text-sm">
                <li>
                  INE, <A href={INE_PAGES.eaes}>Encuesta Anual de Estructura Salarial</A>, {L(locale, { es: "año", ca: "any", en: "year" })} {y}: {(["dist", "ageRegion", "sectorRegion", "occupationRegion", "ageNational", "sections", "occupations", "workday"] as const).map((k, i) => (
                    <span key={k}>
                      {i ? ", " : ""}
                      <A href={tablePageUrl(k)}>{TABLES[k].id}</A>
                    </span>
                  ))}{" "}
                  ({L(locale, { es: "publicada", ca: "publicada", en: "released" })} {day(S.eaes.released, locale)}){S.eaes.press ? <> · <A href={S.eaes.press}>{L(locale, { es: "nota de prensa", ca: "nota de premsa", en: "press release" })}</A></> : null}
                </li>
                <li>
                  INE, <A href={INE_PAGES.epa}>Encuesta de Población Activa, decil de salarios del empleo principal</A>, {L(locale, { es: "año", ca: "any", en: "year" })} {ey}: <A href={tablePageUrl("deciles")}>{TABLES.deciles.id}</A>, <A href={tablePageUrl("decileWorkday")}>{TABLES.decileWorkday.id}</A> ({L(locale, { es: "publicada", ca: "publicada", en: "released" })} {day(S.epa.released, locale)}){S.epa.press ? <> · <A href={S.epa.press}>{L(locale, { es: "nota de prensa", ca: "nota de premsa", en: "press release" })}</A></> : null} · <A href={INE_PAGES.epaMethod}>{L(locale, { es: "metodología", ca: "metodologia", en: "methodology" })}</A>
                </li>
                <li>
                  <A href={INE_PAGES.calendar}>{L(locale, { es: "Calendario de publicaciones del INE", ca: "Calendari de publicacions de l'INE", en: "INE release calendar" })}</A> · <A href={INE_PAGES.licence}>{L(locale, { es: "Aviso legal del INE (reutilización, CC BY 4.0)", ca: "Avís legal de l'INE (reutilització, CC BY 4.0)", en: "INE legal notice (reuse, CC BY 4.0)" })}</A>
                </li>
                <li>
                  {L(locale, { es: "Ministerio de Trabajo", ca: "Ministeri de Treball", en: "Ministry of Labour" })}, <A href="https://expinterweb.mites.gob.es/regcon/index.htm">REGCON</A>
                </li>
              </ul>
              <p className="text-sm">
                {L(locale, {
                  es: `Leídas de la API del INE (servicios.ine.es) ${onDay(S.asOf, "es")}.`,
                  ca: `Llegides de l'API de l'INE (servicios.ine.es) ${onDay(S.asOf, "ca")}.`,
                  en: `Read from the INE's API (servicios.ine.es) ${onDay(S.asOf, "en")}.`,
                })}
              </p>

              <h2 id="limites">{hd.limits}</h2>
              <ul>
                {limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <MoreCalculators current="average-salary" locale={locale} />
            </div>
            <ShareBar locale={locale} path={wagePath(locale)} title={meta.h1} contentType="average_salary" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), datasetNode, faqSchema])} />
      <SiteFooter locale={locale} />
    </>
  );
}
