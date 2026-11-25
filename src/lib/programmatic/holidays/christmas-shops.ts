import {
  CHRISTMAS_SHOPS_CHECKED,
  CHRISTMAS_SHOPS_LAST_DAY,
  WORKING_ASKED,
  christmasDays,
  type ChristmasDay,
} from "@/lib/content/batch02/shops-christmas";

import { BARCELONA_DOGC_ENTRY, COUNCIL_CALENDARS, COUNCIL_CALENDARS_READ } from "@/lib/content/batch02/shops-council-calendars";

import { isAran } from "./data";
import { dayMonth, dayMonthYear, weekdayDayMonth, type DateLocale } from "./format";
import { caA, caStart, esName, joinList } from "./names";
import type { MuniLocale } from "./paths";
import type { SnapshotMunicipality } from "./types";

/**
 * Words for the "Obertura comercial a Nadal" section of a town holiday page
 * (5 Nov 2026): one row per Sunday and holiday from 6 December to 6 January,
 * from the town's 2026 opening days (snapshot `shops`, Resolució
 * EMT/4342/2025 or its defaults), its local holidays (2026 order) and the
 * retail law's closing days. Rendered by
 * components/programmatic/holidays/ChristmasShops.tsx; no title,
 * description or H1 of the page changes.
 */

/** The section is built only up to Reis: a page built later leaves it out. */
export function showChristmasShops(today: string): boolean {
  return today <= CHRISTMAS_SHOPS_LAST_DAY;
}

export interface ChristmasShopsRow {
  iso: string;
  day: string;
  /** "Sí" / "No": printed in bold. */
  verdict: string;
  /** The reason after the verdict, starting with its own punctuation; may be empty. */
  reason: string;
  answer: ChristmasDay["answer"];
}

/**
 * Towns whose council prints its own calendar (shops-council-calendars.ts):
 * the page quotes it, with the read date and time, and says that the actual
 * hours depend on each shop. Barcelona and Badalona (25 Nov 2026).
 */
export interface CouncilCopy {
  text: string;
  href: string;
  label: string;
}

export function councilCopy(slug: string, locale: DateLocale): CouncilCopy | null {
  if (slug !== "barcelona" && slug !== "badalona") return null;
  const c = COUNCIL_CALENDARS[slug];
  const date = dayMonthYear(COUNCIL_CALENDARS_READ.date, locale);
  const time = locale === "ca" ? `${COUNCIL_CALENDARS_READ.time.replace(":", ".")} h` : locale === "es" ? `${COUNCIL_CALENDARS_READ.time} h` : `${COUNCIL_CALENDARS_READ.time} Catalonia time`;
  const q = (s: string) => `«${s}»`;
  if (slug === "barcelona") {
    const [days, note] = c.quotes.map(q) as [string, string];
    const dogc = q(BARCELONA_DOGC_ENTRY);
    const text = {
      ca: `Barcelona ho diu així a la seva guia (Ajuntament de Barcelona, llegida el ${date} a les ${time}): ${days}, ${note}. El 8 de desembre de 2026 és, doncs, dia d'obertura autoritzada, igual que a la Resolució EMT/4342/2025 (DOGC 9551, 27.11.2025), que per a Barcelona diu: ${dogc} L'horari efectiu depèn de cada establiment.`,
      es: `Barcelona lo dice así en su guía (Ayuntamiento de Barcelona, leída el ${date} a las ${time}), en catalán: ${days}, ${note}. El 8 de diciembre de 2026 es, por tanto, día de apertura autorizada, igual que en la Resolución EMT/4342/2025 (DOGC 9551, 27.11.2025), que para Barcelona dice: ${dogc} El horario efectivo depende de cada establecimiento.`,
      en: `Barcelona says so in its city guide (Barcelona City Council, read on ${date} at ${time}), in Catalan: ${days}, ${note}. So 8 December 2026 is a day of authorised opening, as in Resolution EMT/4342/2025 (DOGC 9551, 27 Nov 2025), which says for Barcelona: ${dogc} Actual opening hours depend on each shop.`,
    }[locale];
    return { text, href: c.url, label: { ca: "Calendari d'obertura de comerços de Barcelona", es: "Calendario de apertura de comercios de Barcelona", en: "Barcelona's shop opening calendar" }[locale] };
  }
  const quote = c.quotes.map(q).join(" ");
  const text = {
    ca: `L'Ajuntament de Badalona ho diu així al seu calendari (llegit el ${date} a les ${time}): ${quote} El 8 de desembre no hi consta: la Resolució EMT/4342/2025 el va canviar. La pàgina de l'Ajuntament no esmenta cap excepció per tipus de comerç; les que fixa la llei (Llei 18/2017, article 37) s'apliquen igualment. L'horari efectiu depèn de cada establiment.`,
    es: `El Ayuntamiento de Badalona lo dice así en su calendario (leído el ${date} a las ${time}), en catalán: ${quote} El 8 de diciembre no consta: la Resolución EMT/4342/2025 lo cambió. La página del Ayuntamiento no menciona ninguna excepción por tipo de comercio; las que fija la ley (Ley 18/2017, artículo 37) se aplican igualmente. El horario efectivo depende de cada establecimiento.`,
    en: `Badalona City Council says so in its calendar (read on ${date} at ${time}), in Catalan: ${quote} 8 December is not on it: Resolution EMT/4342/2025 swapped it. The council's page names no exception by type of shop; those set by law (Law 18/2017, article 37) still apply. Actual opening hours depend on each shop.`,
  }[locale];
  return { text, href: c.url, label: { ca: "Calendari d'obertura de Badalona", es: "Calendario de apertura de Badalona", en: "Badalona's shop opening calendar" }[locale] };
}

export interface ChristmasShopsCopy {
  council?: CouncilCopy | null;
  title: string;
  lead: string;
  cols: { day: string; answer: string };
  caption: string;
  rows: ChristmasShopsRow[];
  after: string;
  source: string;
  guide: string;
}

const NAMED: Record<string, Record<MuniLocale, string>> = {
  "2026-12-08": { ca: "la Immaculada", es: "la Inmaculada" },
  "2026-12-25": { ca: "Nadal", es: "Navidad" },
  "2026-12-26": { ca: "Sant Esteve", es: "San Esteban" },
  "2027-01-01": { ca: "Cap d'Any", es: "Año Nuevo" },
  "2027-01-06": { ca: "Reis", es: "Reyes" },
};

/** "6, 8, 13, 20 i 27 de desembre" (all the dates are December dates). */
function decemberDays(isos: string[], locale: MuniLocale): string {
  const days = isos.map((d) => String(Number(d.slice(8, 10))));
  return `${joinList(days, locale)} ${locale === "ca" ? "de desembre" : "de diciembre"}`;
}

function dayLabel(d: ChristmasDay, locale: MuniLocale): string {
  const base = weekdayDayMonth(d.iso, locale) + (d.iso.startsWith("2027") ? " de 2027" : "");
  const notes = [NAMED[d.iso]?.[locale], d.local ? (locale === "ca" ? "festa local" : "fiesta local") : null].filter(Boolean);
  return notes.length ? `${base} (${notes.join(", ")})` : base;
}

function rowFor(d: ChristmasDay, locale: MuniLocale, aran: boolean): ChristmasShopsRow {
  const yes = "Sí";
  const no = "No";
  const ca = locale === "ca";
  const reason = (() => {
    switch (d.answer) {
      case "open":
        return d.local ? (ca ? ": festa local i dia d'obertura" : ": fiesta local y día de apertura") : "";
      case "swapped":
        return ca ? ": l'Ajuntament el va canviar per un altre dia" : ": el Ayuntamiento lo cambió por otro día";
      case "localClosed":
        return ca ? ": festa local que no és dia d'obertura" : ": fiesta local que no es día de apertura";
      case "lawClosed": {
        const base = ca ? ": tancament obligatori (Llei 18/2017, art. 36.2.d)" : ": cierre obligatorio (Ley 18/2017, art. 36.2.d)";
        // Ordre EMT/66/2025 art. 1.b: in Aran 26 December is a working day; the retail law's closing still applies.
        if (aran && d.iso === "2026-12-26") return ca ? `${base}, encara que a l'Aran no és festiu` : `${base}, aunque en Arán no es festivo`;
        return base;
      }
      case "pending2027":
        return ca
          ? ", si l'Ajuntament no l'ha canviat: la llista de canvis del 2027 encara no s'ha publicat"
          : ", si el Ayuntamiento no lo ha cambiado: la lista de cambios de 2027 aún no se ha publicado";
    }
  })();
  const verdict = d.answer === "open" || d.answer === "pending2027" ? yes : no;
  return { iso: d.iso, day: dayLabel(d, locale), verdict, reason, answer: d.answer };
}

export function christmasShopsCopy(
  m: Pick<SnapshotMunicipality, "name" | "slug" | "comarca" | "shops" | "local" | "shopsOwnList">,
  locale: MuniLocale,
): ChristmasShopsCopy {
  const ca = locale === "ca";
  const name = ca ? m.name : esName(m.name);
  const days = christmasDays(m);
  const aran = isAran(m);
  const rows = days.map((d) => rowFor(d, locale, aran));
  const december = (d: ChristmasDay) => d.iso.startsWith("2026-12");
  const open = days.filter((d) => december(d) && d.answer === "open").map((d) => d.iso);
  const swapped = days.filter((d) => december(d) && d.answer === "swapped").map((d) => d.iso);
  const working = WORKING_ASKED.filter((d) => !m.local.includes(d));
  const checked = dayMonthYear(CHRISTMAS_SHOPS_CHECKED, locale);
  const listed = m.shopsOwnList;

  if (ca) {
    const swappedLine = swapped.length
      ? swapped.length === 1
        ? ` El ${weekdayDayMonth(swapped[0]!, "ca")}, no: l'Ajuntament el va canviar per un altre dia (Resolució EMT/4342/2025).`
        : ` Els dies ${decemberDays(swapped, "ca")}, no: l'Ajuntament els va canviar per altres dies (Resolució EMT/4342/2025).`
      : "";
    const workingLine = working.length
      ? `${working.length === 1 ? `El ${dayMonth(working[0]!, "ca")} és laborable` : `${joinList(working.map((d, i) => `${i === 0 ? "El" : "el"} ${Number(d.slice(8, 10))}`), "ca")} de desembre són laborables`}: cada botiga hi fa el seu horari, entre les 6.00 i les 21.00. `
      : "";
    const tourist =
      m.slug === "barcelona"
        ? "A Barcelona, la zona turística (ZGAT) només amplia l'obertura del 15 de maig al 15 de setembre: al desembre hi valen aquests mateixos dies."
        : "Als municipis declarats turístics a efectes d'horaris comercials, les botigues de la zona declarada en queden fora durant el període aprovat; aquesta declaració es publica al butlletí oficial de la província i no és a les fonts d'aquesta taula.";
    return {
      council: councilCopy(m.slug, "ca"),
      title: `Obertura comercial a Nadal ${caA(m.name)}`,
      lead: `Les botigues amb horari general ${caA(m.name)} poden obrir ${open.length === 1 ? "el dia" : "els dies"} ${decemberDays(open, "ca")}.${swappedLine} El 25 i el 26 de desembre i l'1 i el 6 de gener han de tancar, i el diumenge 3 de gener de 2027 és dia d'obertura del calendari general, si l'Ajuntament no l'ha canviat.`,
      cols: { day: "Dia", answer: "Botigues amb horari general" },
      caption: `Diumenges i festius de Nadal ${caA(m.name)}: poden obrir les botigues?`,
      rows,
      after: `${workingLine}Fleques, pastisseries, floristeries, botigues de conveniència, farmàcies i botigues d'alimentació o de pimes de fins a 300 m², entre d'altres, poden obrir qualsevol dia, també els de tancament (Llei 18/2017, article 37). ${tourist}`,
      source: `${caStart(name)} ${listed ? "consta a la Resolució EMT/4342/2025 amb els seus dies" : "no consta a la Resolució EMT/4342/2025, que per als municipis que no hi consten fixa els dies per defecte"}; Ordre EMT/89/2026 per al 2027 i Llei 18/2017, articles 36 i 37. Consultat el ${checked}.`,
      guide: "Botigues obertes per Nadal a tots els municipis de Catalunya",
    };
  }

  const swappedLine = swapped.length
    ? swapped.length === 1
      ? ` El ${weekdayDayMonth(swapped[0]!, "es")}, no: el Ayuntamiento lo cambió por otro día (Resolución EMT/4342/2025).`
      : ` Los días ${decemberDays(swapped, "es")}, no: el Ayuntamiento los cambió por otros días (Resolución EMT/4342/2025).`
    : "";
  const workingLine = working.length
    ? `${working.length === 1 ? `El ${dayMonth(working[0]!, "es")} es laborable` : `${joinList(working.map((d, i) => `${i === 0 ? "El" : "el"} ${Number(d.slice(8, 10))}`), "es")} de diciembre son laborables`}: cada tienda abre con su horario, entre las 6.00 y las 21.00. `
    : "";
  const tourist =
    m.slug === "barcelona"
      ? "En Barcelona, la zona turística (ZGAT) solo amplía la apertura del 15 de mayo al 15 de septiembre: en diciembre valen estos mismos días."
      : "En los municipios declarados turísticos a efectos de horarios comerciales, las tiendas de la zona declarada quedan fuera durante el periodo aprobado; esa declaración se publica en el boletín oficial de la provincia y no está en las fuentes de esta tabla.";
  return {
    council: councilCopy(m.slug, "es"),
    title: `Apertura comercial en Navidad en ${name}`,
    lead: `Las tiendas con horario general de ${name} pueden abrir ${open.length === 1 ? "el día" : "los días"} ${decemberDays(open, "es")}.${swappedLine} El 25 y el 26 de diciembre y el 1 y el 6 de enero deben cerrar, y el domingo 3 de enero de 2027 es día de apertura del calendario general, si el Ayuntamiento no lo ha cambiado.`,
    cols: { day: "Día", answer: "Tiendas con horario general" },
    caption: `Domingos y festivos de Navidad en ${name}: ¿pueden abrir las tiendas?`,
    rows,
    after: `${workingLine}Panaderías, pastelerías, floristerías, tiendas de conveniencia, farmacias y tiendas de alimentación o de pymes de hasta 300 m², entre otras, pueden abrir cualquier día, también los de cierre (Ley catalana 18/2017, artículo 37). ${tourist}`,
    source: `${name} ${listed ? "figura en la Resolución EMT/4342/2025 con sus días" : "no figura en la Resolución EMT/4342/2025, que para los municipios que no figuran en ella fija los días por defecto"}; Orden EMT/89/2026 para 2027 y Ley 18/2017, artículos 36 y 37. Consultado el ${checked}.`,
    guide: "Tiendas abiertas en Navidad en todos los municipios de Cataluña",
  };
}

const NAMED_EN: Record<string, string> = {
  "2026-12-08": "Immaculate Conception",
  "2026-12-25": "Christmas Day",
  "2026-12-26": "St Stephen's Day",
  "2027-01-01": "New Year's Day",
  "2027-01-06": "Epiphany",
};

/**
 * The same section for the English town pages (24 Nov 2026): the English
 * page listed the year's opening days but not the yes/no per Christmas
 * Sunday and holiday, nor why a day is missing (a council swap).
 */
export function christmasShopsCopyEn(
  m: Pick<SnapshotMunicipality, "name" | "slug" | "comarca" | "shops" | "local" | "shopsOwnList">,
): ChristmasShopsCopy {
  const name = m.name.charAt(0).toUpperCase() + m.name.slice(1);
  const days = christmasDays(m);
  const aran = isAran(m);
  const december = (d: ChristmasDay) => d.iso.startsWith("2026-12");
  const open = days.filter((d) => december(d) && d.answer === "open").map((d) => String(Number(d.iso.slice(8, 10))));
  const swapped = days.filter((d) => december(d) && d.answer === "swapped").map((d) => d.iso);
  const working = WORKING_ASKED.filter((d) => !m.local.includes(d));
  const rows: ChristmasShopsRow[] = days.map((d) => {
    const notes = [NAMED_EN[d.iso], d.local ? "local holiday" : null].filter(Boolean);
    const base = weekdayDayMonth(d.iso, "en") + (d.iso.startsWith("2027") ? " 2027" : "");
    const reason = (() => {
      switch (d.answer) {
        case "open":
          return d.local ? ": a local holiday and an opening day" : "";
        case "swapped":
          return ": the council swapped it for another day";
        case "localClosed":
          return ": a local holiday that is not an opening day";
        case "lawClosed": {
          const law = ": shops must close (Catalan Law 18/2017, art. 36.2.d)";
          return aran && d.iso === "2026-12-26" ? `${law}, although it is not a holiday in Aran` : law;
        }
        case "pending2027":
          return ", unless the council has changed it: the 2027 list of changes is not out yet";
      }
    })();
    return {
      iso: d.iso,
      day: notes.length ? `${base} (${notes.join(", ")})` : base,
      verdict: d.answer === "open" || d.answer === "pending2027" ? "Yes" : "No",
      reason,
      answer: d.answer,
    };
  });
  const swappedLine = swapped.length
    ? swapped.length === 1
      ? ` Not on ${weekdayDayMonth(swapped[0]!, "en")}: the council swapped it for another day (Resolution EMT/4342/2025).`
      : ` Not on ${joinList(swapped.map((d) => String(Number(d.slice(8, 10)))), "en")} December: the council swapped them for other days (Resolution EMT/4342/2025).`
    : "";
  const workingLine = working.length
    ? `${working.length === 1 ? `${dayMonth(working[0]!, "en")} is a working day` : `${joinList(working.map((d) => String(Number(d.slice(8, 10)))), "en")} December are working days`}: each shop keeps its own hours, between 6.00 and 21.00. `
    : "";
  const tourist =
    m.slug === "barcelona"
      ? "In Barcelona the tourist zone (ZGAT) only extends opening from 15 May to 15 September: in December these same days apply."
      : "In towns declared tourist areas for shop hours, shops inside the declared zone are exempt during the approved period; that declaration is published in the provincial gazette and is not in the sources of this table.";
  return {
    council: councilCopy(m.slug, "en"),
    title: `Are shops open at Christmas in ${name}?`,
    lead: `Shops on the general timetable in ${name} may open on ${joinList(open, "en")} December.${swappedLine} On 25 and 26 December and on 1 and 6 January they must close, and Sunday 3 January 2027 is an opening day on the general calendar unless the council has changed it.`,
    cols: { day: "Day", answer: "Shops on the general timetable" },
    caption: `Christmas Sundays and holidays in ${name}: can shops open?`,
    rows,
    after: `${workingLine}Bakeries, cake shops, florists, convenience stores, chemists and food shops or small businesses up to 300 m², among others, may open any day, closing days included (Catalan Law 18/2017, article 37). ${tourist}`,
    source: `${name} ${m.shopsOwnList ? "is listed with its own days in Resolution EMT/4342/2025" : "is not listed in Resolution EMT/4342/2025, which sets the default days for towns not listed"}; Order EMT/89/2026 for 2027 and Law 18/2017, articles 36 and 37. Checked on ${dayMonthYear(CHRISTMAS_SHOPS_CHECKED, "en")}.`,
    guide: "Shops open on Sundays and holidays in every town in Catalonia",
  };
}
