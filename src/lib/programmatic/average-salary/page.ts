import type { MetadataRoute } from "next";

import { DEFAULT_INPUT, calculateNetSalary } from "@/lib/programmatic/net-salary/engine";
import { absoluteUrl } from "@/lib/site";

import { day, euros, onDay, pct, REGION_LABEL, wageEditions, WAGE_LOCALES, type WageLocale } from "./copy";
import { SALARY_SNAPSHOT } from "./data";
import { changePct, regionRanking } from "./engine";
import type { SalarySnapshot } from "./ine";

/**
 * The words of "Salario medio en España" that carry figures: title,
 * description, the answer-first lead, the release status, the net estimate
 * and the FAQ (also the FAQPage JSON-LD). Pure over a snapshot, so the tests
 * run them on the committed one.
 */

const L = <T>(locale: WageLocale, v: Record<WageLocale, T>): T => v[locale];

/** English names that take "the" in running text. */
const THE_EN = new Set(["pais-vasco", "canarias", "baleares", "valencia", "madrid"]);

/** INE, methodology of the EPA wage deciles (nota_epa_decil.pdf, §1), on why salary statistics built on administrative records come late. */
export const LAG_QUOTE = "se necesita más tiempo para la captura del dato, dado que se depende de cuándo estén disponibles los registros administrativos para su enlace";

/** The national headline: every figure an INE figure (the change is INE's own rounding of the two). */
export function headline(s: SalarySnapshot = SALARY_SNAPSHOT) {
  const es = s.eaes.dist.es;
  const need = (c: { v: number } | null, what: string) => {
    if (!c) throw new Error(`salary snapshot: no national ${what}`);
    return c.v;
  };
  const mean = need(es.both.mean, "mean");
  const women = need(es.women.mean, "women's mean");
  const men = need(es.men.mean, "men's mean");
  const ranking = regionRanking(s);
  return {
    year: s.eaes.year,
    released: s.eaes.released,
    mean,
    median: need(es.both.median, "median"),
    modal: s.eaes.modal,
    women,
    men,
    change: changePct(mean, s.eaes.previous.mean),
    womenShareOfMen: Math.round((women / men) * 1000) / 10,
    top: ranking.slice(0, 3),
    bottom: ranking.slice(-3).reverse(),
    epa: {
      year: s.epa.year,
      released: s.epa.released,
      mean: s.epa.means.all,
      median: s.epa.deciles.find((d) => d.decile === 6)?.lower ?? null,
      d4: s.epa.deciles.find((d) => d.decile === 4)?.lower ?? null,
      d8: s.epa.deciles.find((d) => d.decile === 8)?.lower ?? null,
    },
  };
}

/** Net pay of a gross salary with the net salary calculator's default case (single, no children, open-ended, 14 payments, common regime). */
export function netEstimate(gross: number) {
  const r = calculateNetSalary({ ...DEFAULT_INPUT, gross });
  return { annual: r.net.annual, perPayment: r.net.perPayment };
}

export function wageMeta(locale: WageLocale, s: SalarySnapshot = SALARY_SNAPSHOT) {
  const h = headline(s);
  const M = (n: number) => euros(n, locale);
  return L(locale, {
    es: {
      title: `Salario medio en España 2026: ${M(h.mean)} (dato INE de ${h.year})`,
      description: `INE: salario medio bruto de ${M(h.mean)} al año en ${h.year} y mediana de ${M(h.median)}. Por comunidad, edad, sexo y sector, deciles de la EPA y compara tu sueldo.`,
      h1: "Salario medio en España 2026: por comunidad, edad, sexo y sector (datos INE)",
      breadcrumb: "Salario medio",
    },
    ca: {
      title: `Salari mitjà a Espanya 2026: ${M(h.mean)} (dada INE del ${h.year})`,
      description: `INE: salari mitjà brut de ${M(h.mean)} l'any el ${h.year} i mediana de ${M(h.median)}. Per comunitat, edat, sexe i sector, decils de l'EPA i compara el teu sou.`,
      h1: "Salari mitjà a Espanya 2026: per comunitat, edat, sexe i sector (dades INE)",
      breadcrumb: "Salari mitjà",
    },
    en: {
      title: `Average salary in Spain 2026: ${M(h.mean)} (INE data for ${h.year})`,
      description: `INE: Spain's average gross salary was ${M(h.mean)} a year in ${h.year}, median ${M(h.median)}. By region, age, sex and sector, EPA wage deciles, and compare your pay.`,
      h1: "Average salary in Spain 2026: by region, age, sex and sector (INE data)",
      breadcrumb: "Average salary",
    },
  });
}

export function leadText(locale: WageLocale, s: SalarySnapshot = SALARY_SNAPSHOT): string {
  const h = headline(s);
  const M = (n: number) => euros(n, locale);
  const prev = s.eaes.previous.year;
  const modal = h.modal;
  return L(locale, {
    es: `El último dato oficial es de ${h.year}: el salario medio bruto en España fue de ${M(h.mean)} al año por trabajador, un ${pct(h.change, "es")} más que en ${prev}, según la Encuesta Anual de Estructura Salarial del INE, publicada ${onDay(h.released, "es")}. La mitad de los trabajadores ganó menos de ${M(h.median)} (salario mediano)${modal ? ` y el salario más frecuente fue de ${M(modal.value)}` : ""}. Las mujeres cobraron de media ${M(h.women)} y los hombres ${M(h.men)}.`,
    ca: `L'última dada oficial és del ${h.year}: el salari mitjà brut a Espanya va ser de ${M(h.mean)} l'any per treballador, un ${pct(h.change, "ca")} més que el ${prev}, segons l'Enquesta Anual d'Estructura Salarial de l'INE, publicada ${onDay(h.released, "ca")}. La meitat dels treballadors va guanyar menys de ${M(h.median)} (salari medià)${modal ? ` i el salari més freqüent va ser de ${M(modal.value)}` : ""}. Les dones van cobrar de mitjana ${M(h.women)} i els homes, ${M(h.men)}.`,
    en: `The latest official figure is for ${h.year}: Spain's average gross salary was ${M(h.mean)} a year per worker, ${pct(h.change, "en")} more than in ${prev}, according to the INE's Annual Wage Structure Survey, released ${onDay(h.released, "en")}. Half of all workers earned less than ${M(h.median)} (the median)${modal ? ` and the most common salary was ${M(modal.value)}` : ""}. Women earned ${M(h.women)} on average and men ${M(h.men)}.`,
  });
}

/** Which year the figures are about and when the next ones come: from the INE calendars in the snapshot. */
export function releaseText(locale: WageLocale, s: SalarySnapshot = SALARY_SNAPSHOT): string[] {
  const { eaes, epa } = s;
  const eaesNext = eaes.next
    ? L(locale, {
        es: `El INE tiene previsto publicar la encuesta de ${eaes.next.year} ${onDay(eaes.next.day, "es")}.`,
        ca: `L'INE té previst publicar l'enquesta del ${eaes.next.year} ${onDay(eaes.next.day, "ca")}.`,
        en: `The INE plans to release the ${eaes.next.year} survey ${onDay(eaes.next.day, "en")}.`,
      })
    : L(locale, {
        es: `El calendario del INE aún no da fecha para la encuesta de ${eaes.year + 1} (consultado ${onDay(s.asOf, "es")}); las dos últimas salieron a finales de mayo.`,
        ca: `El calendari de l'INE encara no dona data per a l'enquesta del ${eaes.year + 1} (consultat ${onDay(s.asOf, "ca")}); les dues últimes van sortir a final de maig.`,
        en: `The INE calendar has no date yet for the ${eaes.year + 1} survey (checked ${onDay(s.asOf, "en")}); the last two came out at the end of May.`,
      });
  const epaNext = epa.next
    ? L(locale, {
        es: `Los deciles de salarios de la EPA de ${epa.next.year} están previstos para ${onDay(epa.next.day, "es")}.`,
        ca: `Els decils de salaris de l'EPA del ${epa.next.year} estan previstos per ${onDay(epa.next.day, "ca").replace(/^el /, "al ").replace(/^l'/, "a l'")}.`,
        en: `The EPA wage deciles for ${epa.next.year} are scheduled for ${day(epa.next.day, "en")}.`,
      })
    : "";
  return [
    L(locale, {
      es: `Las cifras anuales son de ${eaes.year}, no de este año: la encuesta salarial se publica casi año y medio después de acabar el año al que se refiere y se elabora con las declaraciones anuales de retenciones de las empresas (modelo 190) y la afiliación a la Seguridad Social. Los deciles mensuales de la EPA también son de ${epa.year} (publicados ${onDay(epa.released, "es")}).`,
      ca: `Les xifres anuals són del ${eaes.year}, no d'aquest any: l'enquesta salarial es publica gairebé un any i mig després d'acabar l'any a què es refereix i s'elabora amb les declaracions anuals de retencions de les empreses (model 190) i l'afiliació a la Seguretat Social. Els decils mensuals de l'EPA també són del ${epa.year} (publicats ${onDay(epa.released, "ca")}).`,
      en: `The yearly figures are for ${eaes.year}, not this year: the wage survey comes out almost a year and a half after the year it covers and is built on employers' annual withholding returns (form 190) and Social Security registration. The EPA's monthly deciles are also for ${epa.year} (released ${onDay(epa.released, "en")}).`,
    }),
    [eaesNext, epaNext].filter(Boolean).join(" "),
  ];
}

export function wageFaq(locale: WageLocale, s: SalarySnapshot = SALARY_SNAPSHOT): { q: string; a: string }[] {
  const h = headline(s);
  const M = (n: number, d = 2) => euros(n, locale, d);
  const R = (r: (typeof h.top)[number]) => `${locale === "en" && THE_EN.has(r.region) ? "the " : ""}${REGION_LABEL[r.region][locale]} (${M(r.mean)})`;
  const net = netEstimate(h.mean);
  const netMedian = netEstimate(h.median);
  const epaMedian = h.epa.median;
  const modal = h.modal;
  const list = (xs: string[], and: string) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${and} ${xs.at(-1)}`);
  return L(locale, {
    es: [
      {
        q: "¿Cuál es el salario medio en España?",
        a: `${M(h.mean)} brutos al año por trabajador en ${h.year}, según la Encuesta Anual de Estructura Salarial del INE (publicada ${onDay(h.released, "es")}, tabla 28191). Es el último dato anual. En términos mensuales, la EPA da un salario bruto medio de ${M(h.epa.mean, 1)} al mes en ${h.epa.year}, con las pagas extra prorrateadas (tabla 66237).`,
      },
      {
        q: "¿Qué diferencia hay entre salario medio, mediano y modal?",
        a: `El medio es la media aritmética (${M(h.mean)}) y lo suben los sueldos muy altos. El mediano (${M(h.median)}) deja a la mitad de los trabajadores por debajo y a la otra mitad por encima: es el que mejor describe a un trabajador típico.${modal ? ` El modal es el más frecuente: ${M(modal.value)}, con un ${pct(modal.share, "es")} de los asalariados, según la nota de prensa del INE.` : ""}`,
      },
      {
        q: "¿Qué comunidad autónoma tiene el salario medio más alto y cuál el más bajo?",
        a: `En ${h.year}, los más altos fueron ${list(h.top.map(R), "y")}. Los más bajos, ${list(h.bottom.map(R), "y")} (INE, tabla 28191). Ceuta y Melilla no aparecen en estas tablas.`,
      },
      {
        q: "¿Cuánto es el salario medio en neto?",
        a: `Depende de tu situación personal. Con nuestra calculadora de sueldo neto (normas de 2026, soltero, sin hijos, contrato indefinido, 14 pagas, régimen común), ${M(h.mean)} brutos dejan unos ${M(net.annual)} netos al año (${M(net.perPayment)} en cada paga), y el salario mediano de ${M(h.median)}, unos ${M(netMedian.annual)}. Es una estimación nuestra, no un dato del INE.`,
      },
      {
        q: `¿Por qué el dato es de ${h.year} y no del año en curso?`,
        a: `Porque se elabora con registros administrativos del año entero (las declaraciones anuales de retenciones de las empresas y la afiliación a la Seguridad Social); como explica el INE en la metodología de los deciles salariales de la EPA, «${LAG_QUOTE}». Publicó el dato de ${h.year} ${onDay(h.released, "es")}. Cualquier «salario medio» del año en curso es una previsión, no una cifra oficial.`,
      },
      {
        q: "¿Cuánto cobran de media las mujeres y los hombres?",
        a: `En ${h.year}, las mujeres ${M(h.women)} y los hombres ${M(h.men)} al año: el salario medio femenino fue el ${pct(h.womenShareOfMen, "es")} del masculino. El INE advierte de que la diferencia depende también del tipo de jornada, el contrato, la ocupación y la antigüedad.`,
      },
      {
        q: "¿Gano más o menos que la mayoría?",
        a: epaMedian && h.epa.d4 && h.epa.d8
          ? `Según la EPA de ${h.epa.year}, la mitad de los asalariados ganó menos de ${M(epaMedian, 1)} brutos al mes (pagas extra prorrateadas: el sueldo anual dividido entre 12). El 30 % ganó menos de ${M(h.epa.d4, 1)} y otro 30 %, ${M(h.epa.d8, 1)} o más. Escribe tu sueldo en el buscador de esta página para ver tu decil.`
          : `Escribe tu sueldo en el buscador de esta página para ver tu decil en la EPA de ${h.epa.year}.`,
      },
    ],
    ca: [
      {
        q: "Quin és el salari mitjà a Espanya?",
        a: `${M(h.mean)} bruts l'any per treballador el ${h.year}, segons l'Enquesta Anual d'Estructura Salarial de l'INE (publicada ${onDay(h.released, "ca")}, taula 28191). És l'última dada anual. En termes mensuals, l'EPA dona un salari brut mitjà de ${M(h.epa.mean, 1)} al mes el ${h.epa.year}, amb les pagues extra prorratejades (taula 66237).`,
      },
      {
        q: "Quina diferència hi ha entre salari mitjà, medià i modal?",
        a: `El mitjà és la mitjana aritmètica (${M(h.mean)}) i l'apugen els sous molt alts. El medià (${M(h.median)}) deixa la meitat dels treballadors per sota i l'altra meitat per sobre: és el que descriu millor un treballador típic.${modal ? ` El modal és el més freqüent: ${M(modal.value)}, amb un ${pct(modal.share, "ca")} dels assalariats, segons la nota de premsa de l'INE.` : ""}`,
      },
      {
        q: "Quina comunitat autònoma té el salari mitjà més alt i quina el més baix?",
        a: `El ${h.year}, els més alts van ser ${list(h.top.map(R), "i")}. Els més baixos, ${list(h.bottom.map(R), "i")} (INE, taula 28191). Ceuta i Melilla no surten en aquestes taules.`,
      },
      {
        q: "Quant és el salari mitjà en net?",
        a: `Depèn de la teva situació personal. Amb la nostra calculadora de sou net (normes del 2026, solter, sense fills, contracte indefinit, 14 pagues, règim comú), ${M(h.mean)} bruts deixen uns ${M(net.annual)} nets l'any (${M(net.perPayment)} a cada paga), i el salari medià de ${M(h.median)}, uns ${M(netMedian.annual)}. És una estimació nostra, no una dada de l'INE.`,
      },
      {
        q: `Per què la dada és del ${h.year} i no de l'any en curs?`,
        a: `Perquè s'elabora amb registres administratius de tot l'any (les declaracions anuals de retencions de les empreses i l'afiliació a la Seguretat Social); com explica l'INE a la metodologia dels decils salarials de l'EPA, «${LAG_QUOTE}». Va publicar la dada del ${h.year} ${onDay(h.released, "ca")}. Qualsevol «salari mitjà» de l'any en curs és una previsió, no una xifra oficial.`,
      },
      {
        q: "Quant cobren de mitjana les dones i els homes?",
        a: `El ${h.year}, les dones ${M(h.women)} i els homes ${M(h.men)} l'any: el salari mitjà femení va ser el ${pct(h.womenShareOfMen, "ca")} del masculí. L'INE adverteix que la diferència depèn també del tipus de jornada, el contracte, l'ocupació i l'antiguitat.`,
      },
      {
        q: "Guanyo més o menys que la majoria?",
        a: epaMedian && h.epa.d4 && h.epa.d8
          ? `Segons l'EPA del ${h.epa.year}, la meitat dels assalariats va guanyar menys de ${M(epaMedian, 1)} bruts al mes (pagues extra prorratejades: el sou anual dividit entre 12). El 30 % va guanyar menys de ${M(h.epa.d4, 1)} i un altre 30 %, ${M(h.epa.d8, 1)} o més. Escriu el teu sou al cercador d'aquesta pàgina per veure el teu decil.`
          : `Escriu el teu sou al cercador d'aquesta pàgina per veure el teu decil a l'EPA del ${h.epa.year}.`,
      },
    ],
    en: [
      {
        q: "What is the average salary in Spain?",
        a: `${M(h.mean)} gross a year per worker in ${h.year}, according to the INE's Annual Wage Structure Survey (released ${onDay(h.released, "en")}, table 28191). It is the latest yearly figure. Per month, the EPA labour force survey gives an average gross wage of ${M(h.epa.mean, 1)} a month in ${h.epa.year}, with extra payments prorated (table 66237).`,
      },
      {
        q: "What is the difference between the mean, the median and the modal salary?",
        a: `The mean is the arithmetic average (${M(h.mean)}) and very high salaries pull it up. The median (${M(h.median)}) has half of all workers below it and half above: it describes a typical worker best.${modal ? ` The mode is the most common salary: ${M(modal.value)}, earned by ${pct(modal.share, "en")} of employees, according to the INE's press release.` : ""}`,
      },
      {
        q: "Which region has the highest and the lowest average salary?",
        a: `In ${h.year} the highest were ${list(h.top.map(R), "and")}. The lowest were ${list(h.bottom.map(R), "and")} (INE, table 28191). Ceuta and Melilla are not in these tables.`,
      },
      {
        q: "What is the average salary after tax (net)?",
        a: `It depends on your circumstances. With our net salary calculator (2026 rules, single, no children, open-ended contract, 14 payments, common tax regime), ${M(h.mean)} gross leaves about ${M(net.annual)} net a year (${M(net.perPayment)} per payment), and the median ${M(h.median)} about ${M(netMedian.annual)}. This is our estimate, not an INE figure.`,
      },
      {
        q: `Why is the figure for ${h.year} and not for this year?`,
        a: `Because it is built on administrative records for the whole year (employers' annual withholding returns and Social Security registration); as the INE's methodology for the EPA wage deciles puts it, «${LAG_QUOTE}» (more time is needed to capture the data, since it depends on when the administrative records are available to link). It released the ${h.year} figure ${onDay(h.released, "en")}. Any "average salary" for the current year is a forecast, not an official figure.`,
      },
      {
        q: "How much do women and men earn on average?",
        a: `In ${h.year}, women earned ${M(h.women)} and men ${M(h.men)} a year: the average female salary was ${pct(h.womenShareOfMen, "en")} of the male one. The INE notes the gap also depends on working hours, contract, occupation and length of service.`,
      },
      {
        q: "Do I earn more or less than most people?",
        a: epaMedian && h.epa.d4 && h.epa.d8
          ? `According to the ${h.epa.year} EPA, half of all employees earned less than ${M(epaMedian, 1)} gross a month (extra payments prorated: the yearly salary divided by 12). 30% earned less than ${M(h.epa.d4, 1)} and another 30% ${M(h.epa.d8, 1)} or more. Type your salary into the finder on this page to see your decile.`
          : `Type your salary into the finder on this page to see your decile in the ${h.epa.year} EPA.`,
      },
    ],
  });
}

/** Sitemap: the three editions, last modified on the newest INE release in the snapshot. */
export function wageSitemapEntries(s: SalarySnapshot = SALARY_SNAPSHOT): MetadataRoute.Sitemap {
  const e = wageEditions();
  const last = [s.eaes.released, s.epa.released].sort().at(-1)!;
  const languages = { es: absoluteUrl(e.es), ca: absoluteUrl(e.ca), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return WAGE_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
