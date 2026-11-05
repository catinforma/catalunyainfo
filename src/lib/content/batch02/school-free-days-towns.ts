import { WEEKDAY_NAMES, holidayOn, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { SCHOOL_YEARS } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { councilApproved2027, municipalityBySlug, nextYearFor } from "@/lib/programmatic/holidays/data";

/**
 * School free days ("dies de lliure disposició") of the 2026-2027 course,
 * municipality by municipality: the data behind the hub page
 * (school-free-days.ts) and the short section on the town holiday pages
 * (components/programmatic/holidays/SchoolFreeDays.tsx).
 *
 * What they are (Ordre EDF/66/2026, section 2.4 c-e): each school "pot
 * establir quatre dies festius de lliure disposició", spread over the three
 * terms, never on the first or last day of the course nor in the Christmas or
 * Easter holidays; and the municipal school councils, once the local holidays
 * are known, "han de fixar els dies que convindria que adoptessin tots els
 * centres del mateix municipi". So a row is the town's common set, as its
 * municipal school council (or the council, for it) published it; a school
 * can still choose otherwise, and the pages say so.
 *
 * Every row was read on its official source on the day in `checked`: the
 * council's own site or e-office, its municipal education body, the
 * Consell Escolar / Consell d'Educació Municipal's own document, or the
 * Consorci d'Educació de Barcelona. Newspapers, AMPA/AFA pages and single
 * schools' calendars were used only to find the council page, never as the
 * source. The fact pack, with the quote behind every row and what was
 * searched for each town without one, is
 * research_notes/x10/lliure-disposicio-2026-27.md.
 *
 * A town whose council has published nothing for 2026-2027 has no row in
 * FREE_DAYS_TOWNS: it is in FREE_DAYS_PENDING with the council page to watch,
 * and the hub says "not published" with a link to it. Never fill a row from a
 * school's calendar or a newspaper.
 *
 * HOW TO UPDATE (before each block of days: the next one is Carnaval, early
 * February 2027; FREE_DAYS_REREAD_BY makes a test fail on that day):
 *  - Re-read each pending town's `watch` page and each row's `url`. A new or
 *    changed set goes in with the council's own URL, the read date and the
 *    quote in the fact pack. freeDaysProblems() refuses hosts that are not
 *    the publisher's own (`hosts`), dates that are not school days and reads
 *    later than FREE_DAYS_AS_OF.
 *  - Move FREE_DAYS_AS_OF to the day every row and pending town was re-read,
 *    and FREE_DAYS_REREAD_BY to the next re-read (at most 70 days later).
 *  - Run the tests, deploy (the town pages are static), publish
 *    `lliure-disposicio`.
 */

/** The day every row and pending town below was last read on its official source. */
export const FREE_DAYS_AS_OF = "2026-11-05";

/**
 * The day the councils must have been re-read by: a test fails from this day
 * until FREE_DAYS_AS_OF moves past it. 1 Dec 2026 leaves time to catch late
 * publications and changes before the Carnaval block (4-9 Feb 2027).
 */
export const FREE_DAYS_REREAD_BY = "2026-12-01";

/** The school year these days belong to (Ordre EDF/66/2026). */
export const COURSE = SCHOOL_YEARS.find((y) => y.label === "2026-2027")!;

/** Monday 7 December 2026: the day the hub answers first. */
export const MONDAY_7 = "2026-12-07";

export interface FreeDaysTown {
  /** The town's slug on the holiday pages (holidays/snapshot.json). */
  slug: string;
  /** The town's name as printed in every language. */
  name: string;
  /** The free days the source gives, ISO, in date order. */
  days: string[];
  /**
   * "proposal": the source calls them a proposal or recommendation of the
   * municipal school council (each school decides); "agreement": it says the
   * municipal school council agreed or fixed them; "notice": the council
   * publishes them as the town's school calendar without saying which.
   */
  kind: "proposal" | "agreement" | "notice";
  /**
   * Who set or published them, with its article, as the sentence on the town
   * page names it: "el Consell Escolar Municipal de Terrassa" /
   * "el Consejo Escolar Municipal de Terrassa".
   */
  body: { ca: string; es: string; en: string };
  /** The page or PDF that lists the days. */
  url: string;
  /** Its title, as printed (the article's source list). */
  title: string;
  /** Who publishes `url`. */
  publisher: string;
  /** The publisher's own hosts: `url` must be on one of them. */
  hosts: RegExp;
  /** The day `url` was read, ISO. */
  checked: string;
  /** What the source says about which schools it covers, when it narrows it. */
  scope?: Record<Locale, string>;
  /** Printed after the days when the source qualifies them (different days for some schools, say). */
  note?: Record<Locale, string>;
}

export interface FreeDaysPending {
  slug: string;
  name: string;
  /** The council page where the days would appear (education, municipal school council or news). */
  watch: string;
  hosts: RegExp;
  /** The day it was searched for and not found. */
  checked: string;
}

const READ = "2026-11-05";

export const FREE_DAYS_TOWNS: readonly FreeDaysTown[] = [
  {
    slug: "barcelona",
    name: "Barcelona",
    // CEMB, "Proposta de dies de lliure disposició del CEMB per al curs 2026-2027", approved by the plenary of 10 Jun 2026:
    // "1r. Trimestre: -Divendres, 30 d'octubre de 2026 (festivitat Castanyada - Tots Sants) -Dilluns, 7 de desembre de 2026 (pont del 8 de desembre)
    // 2n. Trimestre: - Dilluns, 8 de febrer de 2027 (festivitat Carnaval) 3r. Trimestre: - Divendres, 14 de maig de 2027 (festivitat 2a Pasqua)".
    // "tot i que és una proposta de ciutat, els centres educatius tenen autonomia de gestió".
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-05-14"],
    kind: "proposal",
    body: { ca: "el Consell d'Educació Municipal de Barcelona", es: "el Consell d'Educació Municipal de Barcelona", en: "Barcelona's municipal education council" },
    url: "https://pro-gestornoticies-dtibcn-cat.s3.amazonaws.com/gestornoticies-pro/media/PROPOSTA_APROVADA_DE_DIES_DE_LLIURE_DISPOSICIO_DEL_CEMB_PER_AL_CURS_2026-2027.0d2f10d5.pdf",
    title: "Proposta de dies de lliure disposició del CEMB per al curs 2026-2027",
    publisher: "Consell d'Educació Municipal de Barcelona",
    // The City Council's news manager stores its attachments on this bucket (the PDF is linked from its own news item).
    hosts: /^(pro-gestornoticies-dtibcn-cat\.s3\.amazonaws\.com|([a-z0-9-]+\.)*barcelona\.cat)$/,
    checked: READ,
  },
  {
    slug: "blanes",
    name: "Blanes",
    // Educació. Calendari Escolar. — CALENDARI ESCOLAR PER AL CURS 2026-2027: «CALENDARI ESCOLAR PER AL CURS 2026-2027 [...] DIES FESTIUS: Festius de lliure disposició: [...] 30 d'octubre de 2026 [...] 7 de desembre de 2026 [...] 8 de febrer de 2027 [...] 30 d'abril de 2027 [...] 17 de maig de 2027 [...] Els dies de lliure disposició acordats al Consell Escolar Municipal: 30 d’octubre i 7 de desembre de 2026 i el 8 de febrer i el 30 d’abril de 2027»
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-30", "2027-05-17"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Blanes", es: "el Ayuntamiento de Blanes", en: "Blanes Town Council" },
    url: "https://www.blanes.cat/docweb/educacio.calendariescolar",
    title: "Calendari escolar per al curs 2026-2027",
    publisher: "Ajuntament de Blanes",
    hosts: /(^|\.)blanes\.cat$/,
    checked: READ,
  },
  {
    slug: "cambrils",
    name: "Cambrils",
    // CALENDARI ESCOLAR CURS 2026-27 (Ajuntament de Cambrils – Educació): «CALENDARI ESCOLAR [...] CURS 2026-27 [...] DIES LLIURE DISPOSICIÓ INFANTIL, PRIMÀRIA, INSTITUTS, EMMC» The days are the dark-red cells of the PDF's calendar (no text layer): 2 Nov, 7 Dec, 8 Feb, 30 Apr, 3 May; read visually on 5 Nov 2026. Local holidays (orange): 8 Sep 2026 and 29 Jun 2027.
    days: ["2026-11-02", "2026-12-07", "2027-02-08", "2027-04-30", "2027-05-03"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Cambrils", es: "el Ayuntamiento de Cambrils", en: "Cambrils Town Council" },
    url: "https://www.cambrils.cat/ca/serveis/educacio/fitxers/2026-2027-curs-varis/calendari-26-27.pdf",
    title: "Calendari escolar curs 2026-27",
    publisher: "Ajuntament de Cambrils, Educació",
    hosts: /(^|\.)cambrils\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària, instituts i Escola Municipal de Música.", es: "Infantil, primaria, institutos y Escola Municipal de Música.", en: "Infant and primary schools, secondary schools and the municipal music school." },
  },
  {
    slug: "castellar-del-valles",
    name: "Castellar del Vallès",
    // Calendari escolar i de festes curs 2026-2027: «30 d’octubre de 2026 (divendres): Dia de lliure disposició als centres de segon cicle d’educació infantil i primària, d’ESO, estudis postobligatoris (cicles formatius i batxillerat), l’Escola Municipal de Música i l’Escola Municipal de Persones Adultes. [...] 7 de desembre de 2026 (dilluns): Dia de lliure disposició a les escoles bressol municipal “El Coral” i “Colobrers”, als centres de segon cicle d’educació infantil i primària [...] 8 de febrer 2027 (dilluns): Dia de lliure disposició als centres de segon cicle d’educació infantil i primària [...] 30 d’abril de 2027 (divendres): Dia de lliure disposició a les escoles bressol municipals “El Coral” i “Colobrers”, als centres de segon cicle »
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-30"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Castellar del Vallès", es: "el Ayuntamiento de Castellar del Vallès", en: "Castellar del Vallès Town Council" },
    url: "https://www.castellarvalles.cat/49550/descriptiu/",
    title: "Calendari escolar i de festes curs 2026-2027",
    publisher: "Ajuntament de Castellar del Vallès",
    hosts: /(^|\.)castellarvalles\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària, ESO, batxillerat i FP; les escoles bressol municipals tenen dies propis.", es: "Infantil, primaria, ESO, bachillerato y FP; las escuelas infantiles municipales tienen días propios.", en: "Infant, primary and secondary schools, sixth form and vocational training; municipal nurseries have their own days." },
  },
  {
    slug: "girona",
    name: "Girona",
    // ACORD DEL CONSELL MUNICIPAL D’EDUCACIÓ DE GIRONA PER A LA RECOMANACIÓ DEL CALENDARI, HORARI ESCOLAR, PREU DEL MATERIAL COMPLEMENTARI I SORTIDES ESCOLARS PER AL CURS 2026-2027, APROVAT A LA SESSIÓ PLENÀRIA DE 9 DE JUNY DE 2026: «Recomanar a tots els centres educatius públics i privats de la ciutat escollir com a dies de lliure disposició per al curs 2026-27, les dates següents: [...] 30 d’octubre de 2026 [...] 07 desembre de 2026 [...] 05 de febrer de 2027 [...] 08 de febrer de 2027 [...] En compensació de la festa local, Sant Jaume el 25 de juliol : [...] 17 de maig de 2027»
    days: ["2026-10-30", "2026-12-07", "2027-02-05", "2027-02-08", "2027-05-17"],
    kind: "proposal",
    body: { ca: "el Consell Municipal d'Educació de Girona", es: "el Consejo Municipal de Educación de Girona", en: "Girona's municipal education council" },
    url: "https://web.girona.cat/documents/d/guest/acord-calendari-preu-material-curs26-27",
    title: "Acord del Consell Municipal d'Educació de Girona per a la recomanació del calendari del curs 2026-2027 (9 de juny de 2026)",
    publisher: "Ajuntament de Girona",
    hosts: /(^|\.)girona\.cat$/,
    checked: READ,
    scope: { ca: "Recomanació a tots els centres públics i privats de la ciutat.", es: "Recomendación a todos los centros públicos y privados de la ciudad.", en: "A recommendation to every state and private school in the city." },
    note: { ca: "El 17 de maig de 2027 és «en compensació de la festa local, Sant Jaume el 25 de juliol».", es: "El 17 de mayo de 2027 es «en compensació de la festa local, Sant Jaume el 25 de juliol» (a cambio de la fiesta local de Sant Jaume, el 25 de julio).", en: "17 May 2027 is given \"en compensació de la festa local, Sant Jaume el 25 de juliol\" (in exchange for the Sant Jaume local holiday on 25 July)." },
  },
  {
    slug: "granollers",
    name: "Granollers",
    // Calendari escolar de Granollers. CURS 2026/27 ENSENYAMENTS OBLIGATORIS (Consell Escolar Municipal de Granollers) — file calendari_escolar_2026-27_modificat.pdf: «Lliure disposició [...] Calendari escolar de Granollers. CURS 2026/27 ENSENYAMENTS OBLIGATORIS EDUCACIÓ INFANTIL, PRIMÀRIA i ESO: Inici 8/09/26 i finalització 21/06/27» The days are the yellow cells of the PDF's calendar (no text layer): 30 Oct, 7 Dec, 8 Feb, 19 Apr, 17 May; read visually on 5 Nov 2026. Local holidays (cyan): 7 May and 27 Aug 2027.
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-19", "2027-05-17"],
    kind: "notice",
    body: { ca: "el Consell Escolar Municipal de Granollers", es: "el Consejo Escolar Municipal de Granollers", en: "Granollers's municipal school council" },
    url: "https://www.granollers.cat/sites/default/files/usuaris/u998/calendari_escolar_2026-27_modificat.pdf",
    title: "Calendari escolar de Granollers, curs 2026/27, ensenyaments obligatoris",
    publisher: "Consell Escolar Municipal de Granollers (Ajuntament de Granollers)",
    hosts: /(^|\.)granollers\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària i ESO.", es: "Infantil, primaria y ESO.", en: "Infant, primary and secondary schools." },
  },
  {
    slug: "lleida",
    name: "Lleida",
    // Calendari Escolar - Educació - La Paeria - Ajuntament de Lleida: «En la sessió plenària del Consell Educatiu Municipal celebrat el dijous 21 de maig de 2026 es va acordar proposar els següents dies festius de lliure disposició per al curs 26-27: Divendres, 30 d’octubre de 2026 Dilluns, 7 de desembre de 2026 Divendres, 5 de febrer de 2027 Dilluns, 10 de maig de 2027»
    days: ["2026-10-30", "2026-12-07", "2027-02-05", "2027-05-10"],
    kind: "proposal",
    body: { ca: "el Consell Educatiu Municipal de Lleida", es: "el Consejo Educativo Municipal de Lleida", en: "Lleida's municipal education council" },
    url: "https://educacio.paeria.cat/ca/escolaritzacio/copy_of_calendari-escolar",
    title: "Calendari escolar (Educació, Ajuntament de Lleida)",
    publisher: "Ajuntament de Lleida (la Paeria)",
    hosts: /(^|\.)paeria\.cat$/,
    checked: READ,
  },
  {
    slug: "manlleu",
    name: "Manlleu",
    // CALENDARI ESCOLAR 2026-2027 ESCOLES INFANTIL, PRIMÀRIA I SECUNDÀRIA: «Dies de lliure disposició : 30 d'octubre, 7 de desembre, 8 de febrer, 30 d'abril, 14 de maig»
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-30", "2027-05-14"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Manlleu", es: "el Ayuntamiento de Manlleu", en: "Manlleu Town Council" },
    url: "https://www.manlleu.cat/educacio/files/doc187/calendari-escolar-2026-2027-escoles-infantil-primaria-i-secundaria.pdf",
    title: "Calendari escolar 2026-2027, escoles infantil, primària i secundària",
    publisher: "Ajuntament de Manlleu, Manlleu Educació",
    hosts: /(^|\.)manlleu\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària i secundària.", es: "Infantil, primaria y secundaria.", en: "Infant, primary and secondary schools." },
  },
  {
    slug: "martorell",
    name: "Martorell",
    // Calendari escolar 2026-2027 de Martorell: «30/10/2026 Lliure disposició (excepte EOI) [...] 7/12/2026 Lliure disposició [...] 8/2/2027 Lliure disposició (excepte EOI) [...] 23/4/2027 Lliure disposició (excepte EOI) [...] 17/5/2027 Lliure disposició»
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-23", "2027-05-17"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Martorell", es: "el Ayuntamiento de Martorell", en: "Martorell Town Council" },
    url: "https://patronat.martorell.cat/wp-content/uploads/2026/10/Calendari-escolar-Martorell-26-27.pdf",
    title: "Calendari escolar 2026-2027 de Martorell",
    publisher: "Patronat Municipal de Serveis d'Atenció a les Persones (Ajuntament de Martorell)",
    hosts: /(^|\.)martorell\.cat$/,
    checked: READ,
    scope: { ca: "L'Escola Oficial d'Idiomes té dies propis.", es: "La Escuela Oficial de Idiomas tiene días propios.", en: "The official language school (EOI) has its own days." },
  },
  {
    slug: "mataro",
    name: "Mataró",
    // PROPOSTA CALENDARI ESCOLAR CURS 2026-2027 PRIMÀRIA I SECUNDÀRIA: «PROPOSTA CALENDARI ESCOLAR CURS 2026-2027 [...] Festius de lliure disposició proposats pel Consell Escolar Municipal: 02/11/26; 07/12/26; 08/02/27; 01/03/27; i 30/04/27»
    days: ["2026-11-02", "2026-12-07", "2027-02-08", "2027-03-01", "2027-04-30"],
    kind: "proposal",
    body: { ca: "el Consell Escolar Municipal de Mataró", es: "el Consejo Escolar Municipal de Mataró", en: "Mataró's municipal school council" },
    url: "https://www.mataro.cat/ca/temes/educacio/e-obligatoria-3-16-anys/calendari-escolar-2025-2026/calendari-escolar-2026-2027.pdf",
    title: "Proposta calendari escolar curs 2026-2027 primària i secundària",
    publisher: "Ajuntament de Mataró, Servei d'Educació",
    hosts: /(^|\.)mataro\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària i ESO.", es: "Infantil, primaria y ESO.", en: "Infant, primary and secondary schools." },
  },
  {
    slug: "mollet-del-valles",
    name: "Mollet del Vallès",
    // Calendari Escolar – Mollet del Vallès – Curs 2026/2027: «Calendari Escolar – Mollet del Vallès – Curs 2026/2027 [...] Dies de Lliure Disposició de les Escoles de Primària públiques i concertades, Instituts de Secundària públics i concertats, Escola d’Educació Can Vila, CFA, Escola Oficial d’Idiomes i Escola Municipal de Música i Dansa. [...] divendres 30 d’octubre de 2026* [...] dilluns 7 de desembre de 2026 [...] dilluns 8 de febrer de 2027 [...] divendres 30 d’abril de 2027 [...] dilluns 17 de maig de 2027**»
    days: ["2026-10-30", "2026-12-07", "2027-02-08", "2027-04-30", "2027-05-17"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Mollet del Vallès", es: "el Ayuntamiento de Mollet del Vallès", en: "Mollet del Vallès Town Council" },
    url: "https://www.molletvalles.cat/ca/ce-27-2.pdf",
    title: "Calendari escolar, Mollet del Vallès, curs 2026/2027",
    publisher: "Ajuntament de Mollet del Vallès",
    hosts: /(^|\.)molletvalles\.cat$/,
    checked: READ,
    scope: { ca: "Primària i secundària públiques i concertades, escoles municipals i EOI; el Col·legi Lestonnac fa el 2 de novembre en lloc del 30 d'octubre, i l'Escola Municipal de Música i Dansa el 20 de maig en lloc del 17.", es: "Primaria y secundaria públicas y concertadas, escuelas municipales y EOI; el Col·legi Lestonnac hace el 2 de noviembre en lugar del 30 de octubre, y la Escola Municipal de Música i Dansa el 20 de mayo en lugar del 17.", en: "State and state-funded primary and secondary schools, municipal schools and the EOI; Col·legi Lestonnac takes 2 November instead of 30 October, and the municipal music and dance school 20 May instead of the 17th." },
  },
  {
    slug: "montcada-i-reixac",
    name: "Montcada i Reixac",
    // CALENDARI ESCOLAR DEL CURS 2026-27 PER A EDUCACIÓ INFANTIL, PRIMÀRIA I SECUNDÀRIA: «CALENDARI ESCOLAR DEL CURS 2026-27 PER A EDUCACIÓ INFANTIL, PRIMÀRIA I SECUNDÀRIA [...] Dies de lliure disposició.» The days are the red cells of the PDF's calendar (no text layer): 2 Nov, 7 Dec, 8 Feb, 30 Apr; read visually on 5 Nov 2026. Local holidays (green): 24 Sep 2026 and 17 May 2027.
    days: ["2026-11-02", "2026-12-07", "2027-02-08", "2027-04-30"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Montcada i Reixac", es: "el Ayuntamiento de Montcada i Reixac", en: "Montcada i Reixac Town Council" },
    url: "https://www.montcada.cat/media/repository/publicacions/educacio/CALENDARI__INF-PRIM-SECUND_2026-27.pdf",
    title: "Calendari escolar del curs 2026-27 per a educació infantil, primària i secundària",
    publisher: "Ajuntament de Montcada i Reixac",
    hosts: /(^|\.)montcada\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària i secundària.", es: "Infantil, primaria y secundaria.", en: "Infant, primary and secondary schools." },
  },
  {
    slug: "olot",
    name: "Olot",
    // Calendari escolar – Olot Educació (Curs 2026-2027): «Curs 2026-2027 [...] Festius locals i de lliure disposició El Departament d’Educació ha establert 5 dies festius de lliure disposició per al curs 2026-2027 consensuats a nivell local: 2 de novembre 7 de desembre 5 de febrer 30 d’abril 3 de maig»
    days: ["2026-11-02", "2026-12-07", "2027-02-05", "2027-04-30", "2027-05-03"],
    kind: "notice",
    body: { ca: "l'Ajuntament d'Olot", es: "el Ayuntamiento de Olot", en: "Olot Town Council" },
    url: "https://oloteducacio.cat/calendari-escolar/",
    title: "Calendari escolar, curs 2026-2027 (Olot Educació)",
    publisher: "Ajuntament d'Olot, Olot Educació",
    hosts: /(^|\.)(oloteducacio\.cat|olot\.cat)$/,
    checked: READ,
  },
  {
    slug: "pineda-de-mar",
    name: "Pineda de Mar",
    // El nou curs 2026-2027 comença amb una inversió de més de 3.000.000 d’euros en millores als centres educatius: «Dies de lliure disposició Els centres educatius disposaran dels dies de lliure disposició, que per al curs 2026-2027, es proposen les següents dates: 2026: 30 d’octubre, 2 de novembre, 7 de desembre 2027: 8 de febrer, 23 d’abril, 17 de maig»
    days: ["2026-10-30", "2026-11-02", "2026-12-07", "2027-02-08", "2027-04-23", "2027-05-17"],
    kind: "proposal",
    body: { ca: "el Consell Escolar Municipal de Pineda de Mar", es: "el Consejo Escolar Municipal de Pineda de Mar", en: "Pineda de Mar's municipal school council" },
    url: "https://www.pinedademar.cat/el-municipi/noticies/el-nou-curs-2026-2027-comenca-amb-una-inversio-de-mes-de-3-000-000-d2019euros-en-millores-als-centres-educatius",
    title: "El nou curs 2026-2027 comença amb una inversió de més de 3.000.000 d’euros en millores als centres educatius",
    publisher: "Ajuntament de Pineda de Mar",
    hosts: /(^|\.)pinedademar\.cat$/,
    checked: READ,
  },
  {
    slug: "el-prat-de-llobregat",
    name: "el Prat de Llobregat",
    // Calendari escolar 2026-2027 (El Prat municipal magazine, juliol 2026, p. 30): «Dies de lliure disposició: Acordats pel Consell d’Educació Municipal i que per tant convé que adoptin els centres educatius. [...] Lliure disposició 1 [...] 7 Des. [...] Lliure disposició 2 [...] 8 Feb. [...] Lliure disposició 3 [...] 30 Abr. [...] Lliure disposicó 4 [...] 14 Mai.»
    days: ["2026-12-07", "2027-02-08", "2027-04-30", "2027-05-14"],
    kind: "agreement",
    body: { ca: "el Consell d'Educació Municipal del Prat de Llobregat", es: "el Consejo de Educación Municipal de El Prat de Llobregat", en: "El Prat's municipal education council" },
    url: "https://www.elprat.cat/sites/default/files/calendariprat_26-27.pdf",
    title: "Calendari escolar 2026-2027 (El Prat, juliol 2026)",
    publisher: "Ajuntament del Prat de Llobregat",
    hosts: /(^|\.)elprat\.cat$/,
    checked: READ,
  },
  {
    slug: "ripollet",
    name: "Ripollet",
    // Calendari Escolar 2026-2027: «Calendari escolar del curs 2026-2027. Festius, vacances i dies de lliure disposició dels centres educatius públics i concertats de Ripollet. [...] Festes lliure disposició 2 de novembre de 2026 7 de desembre de 2026 (excepte escoles bressol municipals) 8 de febrer de 2027 3 de maig de 2027 18 de maig de 2027 25 de juny de 2027 (escoles bressol municipals)»
    days: ["2026-11-02", "2026-12-07", "2027-02-08", "2027-05-03", "2027-05-18"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Ripollet", es: "el Ayuntamiento de Ripollet", en: "Ripollet Town Council" },
    url: "https://www.ripollet.cat/serveis/educacio/calendari-escolar-2023-2024",
    title: "Calendari escolar 2026-2027",
    publisher: "Ajuntament de Ripollet",
    hosts: /(^|\.)ripollet\.cat$/,
    checked: READ,
    scope: { ca: "Centres públics i concertats; les escoles bressol municipals tenen dies propis.", es: "Centros públicos y concertados; las escuelas infantiles municipales tienen días propios.", en: "State and state-funded schools; municipal nurseries have their own days." },
  },
  {
    slug: "salou",
    name: "Salou",
    // Calendari escolar 2026-2027 (Oficina Municipal d'Escolarització): «Calendari escolar 2026-2027 8 de setembre de 2026. Inici de les classes al segon cicle de l’educació infantil, l’educació primària i l’educació secundària. [...] Dies de lliure disposició: 2 de novembre de 2026 7 de desembre de 2026 1 de febrer de 2027 30 d’abril de 2027»
    days: ["2026-11-02", "2026-12-07", "2027-02-01", "2027-04-30"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Salou", es: "el Ayuntamiento de Salou", en: "Salou Town Council" },
    url: "https://www.salou.cat/ca/la-ciutat-per-temes/educacio/loficina-municipal-descolaritzacio-ome/calendari-escolar-2023-2024",
    title: "Calendari escolar 2026-2027 (Oficina Municipal d'Escolarització)",
    publisher: "Ajuntament de Salou",
    hosts: /(^|\.)salou\.cat$/,
    checked: READ,
  },
  {
    slug: "salt",
    name: "Salt",
    // Calendari Escolar Infantil-Primària-ESO CURS 2026/2027: «CURS 2026/2027 Calendari Escolar Infantil-Primària-ESO [...] Lliure disposició» The days are the pink cells of the PDF's calendar (no text layer): 30 Oct, 7 Dec, 5 Feb, 30 Apr, 3 May; read visually on 5 Nov 2026. Local holiday (blue): 29 Oct 2026.
    days: ["2026-10-30", "2026-12-07", "2027-02-05", "2027-04-30", "2027-05-03"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Salt", es: "el Ayuntamiento de Salt", en: "Salt Town Council" },
    url: "https://educacio.viladesalt.cat/wp-content/uploads/2026/07/Calendari-escolar-Infantil-Primaria-ESO-2026-27.pdf",
    title: "Calendari escolar infantil, primària i ESO, curs 2026/2027",
    publisher: "Ajuntament de Salt, Oficina Municipal d'Escolarització",
    hosts: /(^|\.)viladesalt\.cat$/,
    checked: READ,
    scope: { ca: "Infantil, primària i ESO.", es: "Infantil, primaria y ESO.", en: "Infant, primary and secondary schools." },
  },
  {
    slug: "tarragona",
    name: "Tarragona",
    // CALENDARI ESCOLAR 2026-2027 (Ajuntament de Tarragona, Institut Municipal d'Educació): «CALENDARI ESCOLAR 2026-2027 [...] Dies de lliure disposició aprovats pel Consell Escolar Municipal de Tarragona (Plenari 10/06/2026).» The days are the yellow cells of the PDF's calendar (no text layer): 24 Sep, 2 Nov, 7 Dec, 8 Feb, 30 Apr; read visually on 5 Nov 2026. Local holidays printed: 23 Sep and 19 Aug.
    days: ["2026-09-24", "2026-11-02", "2026-12-07", "2027-02-08", "2027-04-30"],
    kind: "agreement",
    body: { ca: "el Consell Escolar Municipal de Tarragona", es: "el Consejo Escolar Municipal de Tarragona", en: "Tarragona's municipal school council" },
    url: "https://www.tarragona.cat/educacio/estudiar-a-tgn/oficina-municipal-descolaritzacio-ome/fitxers/calendari-escolar-26-27",
    title: "Calendari escolar 2026-2027",
    publisher: "Ajuntament de Tarragona, Institut Municipal d'Educació",
    hosts: /(^|\.)tarragona\.cat$/,
    checked: READ,
  },
  {
    slug: "valls",
    name: "Valls",
    // Calendari Escolar per al Curs 2026/2027: «Dies de lliure disposició 2 de novembre de 2026, 7 de desembre de 2026, 1 de febrer de 2027, 30 d’abril de 2027 i 3 de maig de 2027.»
    days: ["2026-11-02", "2026-12-07", "2027-02-01", "2027-04-30", "2027-05-03"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Valls", es: "el Ayuntamiento de Valls", en: "Valls Town Council" },
    url: "https://www.valls.cat/calendari-escolar-valls",
    title: "Calendari escolar per al curs 2026/2027",
    publisher: "Ajuntament de Valls",
    hosts: /(^|\.)valls\.cat$/,
    checked: READ,
  },
  {
    slug: "el-vendrell",
    name: "el Vendrell",
    // L’Ajuntament del Vendrell dona continuïtat al Casal de Conciliació els dies de lliure disposició dels centres educatius: «La comunitat educativa del municipi tria sis dies de lliure disposició que complementen el calendari escolar. Les properes dates en què s’oferirà el Casal de Conciliació seran dimarts 13 d’octubre, dilluns 2 de novembre i dilluns 7 de desembre.»
    days: ["2026-10-13", "2026-11-02", "2026-12-07"],
    kind: "notice",
    body: { ca: "l'Ajuntament del Vendrell", es: "el Ayuntamiento de El Vendrell", en: "El Vendrell Town Council" },
    url: "https://www.elvendrell.net/informacio/9861-l-ajuntament-del-vendrell-dona-continuitat-al-casal-de-conciliacio-els-dies-de-lliure-disposicio-dels-centres-educatius",
    title: "L'Ajuntament del Vendrell dona continuïtat al Casal de Conciliació els dies de lliure disposició dels centres educatius",
    publisher: "Ajuntament del Vendrell",
    hosts: /(^|\.)elvendrell\.net$/,
    checked: READ,
    note: { ca: "L'Ajuntament només n'ha publicat els del primer trimestre, en anunciar el casal de conciliació d'aquests dies.", es: "El Ayuntamiento solo ha publicado los del primer trimestre, al anunciar el casal de conciliación de esos días.", en: "The council has only published the first term's, announcing its childcare service for those days." },
  },
  {
    slug: "vic",
    name: "Vic",
    // CALENDARI ESCOLAR 2026-2027: «CALENDARI ESCOLAR 2026-2027 [...] Lliure disposició a Vic [...] Dies de lliure disposició: [...] 2 de novembre de 2026 [...] 7 de desembre de 2026 [...] 8 de febrer de 2027 (a canvi de la festa local del 5 de juliol) [...] 30 d'abril de 2027 [...] 14 de maig de 2027»
    days: ["2026-11-02", "2026-12-07", "2027-02-08", "2027-04-30", "2027-05-14"],
    kind: "notice",
    body: { ca: "l'Ajuntament de Vic", es: "el Ayuntamiento de Vic", en: "Vic Town Council" },
    url: "https://www.vic.cat/serveis/educacio/regidoria-deducacio-1/calendari-escolar-2026-27/calendari-escolar-26_27-1.pdf",
    title: "Calendari escolar 2026-2027",
    publisher: "Ajuntament de Vic, Regidoria d'Educació",
    hosts: /(^|\.)vic\.cat$/,
    checked: READ,
    note: { ca: "El 8 de febrer de 2027 és «a canvi de la festa local del 5 de juliol».", es: "El 8 de febrero de 2027 es «a canvi de la festa local del 5 de juliol» (a cambio de la fiesta local del 5 de julio).", en: "8 February 2027 is given \"a canvi de la festa local del 5 de juliol\" (in exchange for the 5 July local holiday)." },
  },
  {
    slug: "vilanova-i-la-geltru",
    name: "Vilanova i la Geltrú",
    // CALENDARI ESCOLAR CURS 2026 – 2027 (Període de setembre de 2026 a agost de 2027): «Dies de lliure disposició aprovats pel CEM (4 dies) [...] Consulteu directament amb cada centre els quatre dies festius de lliure disposició que han escollit en acord dels respectius consells escolars de cada centre, atès que poden variar respecte els acordats pel Consell Escolar Municipal.» The days are the purple cells of the PDF's calendar (no text layer): 2 Nov, 7 Dec, 30 Apr, 17 May; read visually on 5 Nov 2026. imet.cat serves an incomplete certificate chain (curl needs -k; browsers load it).
    days: ["2026-11-02", "2026-12-07", "2027-04-30", "2027-05-17"],
    kind: "agreement",
    body: { ca: "el Consell Escolar Municipal de Vilanova i la Geltrú", es: "el Consejo Escolar Municipal de Vilanova i la Geltrú", en: "Vilanova i la Geltrú's municipal school council" },
    url: "https://www.imet.cat/doc/doc_31402494.pdf",
    title: "Calendari escolar curs 2026-2027",
    publisher: "Ajuntament de Vilanova i la Geltrú, Institut Municipal d'Educació i Treball (IMET)",
    hosts: /(^|\.)(imet\.cat|vilanova\.cat)$/,
    checked: READ,
    scope: { ca: "Infantil, primària i ESO; cada escola els pot variar.", es: "Infantil, primaria y ESO; cada colegio puede variarlos.", en: "Infant, primary and secondary schools; each school may vary them." },
  },
];

export const FREE_DAYS_PENDING: readonly FreeDaysPending[] = [
  // Amposta: Searched web, amposta.cat Educació section and WordPress search ('lliure disposició', 'calendari escolar', 'consell escolar municipal', 'curs escolar 2026-2027'). The 10 Sep 2026 news 'Amposta inicia el curs escolar amb nous estudis de formació professional i millores als centres' gives no free days. No CEM page found. Council news 'El 18 de maig i el 7 de desembre, festes locals del 2026' (ampost
  { slug: "amposta", name: "Amposta", watch: "https://amposta.cat/la-ciutat/educacio/", hosts: /(^|\.)amposta\.cat$/, checked: READ },
  // Badalona: Searched web (Catalan queries), badalona.cat education section (participacio page only has 'Reglament del CEM'; site search is JS-rendered, education news RSS empty) and participa311-badalona.diba.cat (only the 1989 CEM reglament). Only school-level actes (agora.xtec.cat) mention 2026-27 free days - not accepted. No official Badalona common days found.
  { slug: "badalona", name: "Badalona", watch: "https://www.badalona.cat/ca/serveis-ajuntament/educacio-i-formacio/participacio", hosts: /(^|\.)badalona\.cat$/, checked: READ },
  // Calafell: Council site search (calafell.cat/search?key=) for 'lliure disposició' returns only an e-administration ordinance item; 'calendari escolar 2026' returns only open-days news. Ensenyament pages list schools and a 'Guia educativa del municipi de Calafell 2026-2027' PDF dated Feb 2026 (before the Ordre EDF/66/2026; not checked). No CEM page or 2026-27 free days found.
  { slug: "calafell", name: "Calafell", watch: "https://calafell.cat/temes-i-serveis/ensenyament/educacio-infantil-i-primaria", hosts: /(^|\.)calafell\.cat$/, checked: READ },
  // Castelldefels: Searched castelldefels.org site search ('lliure disposició', 'calendari escolar 2026-2027', 'Consell d'Educació Municipal'), the Educació section and the Consell Escolar Municipal page (descriptive text only, no documents or dates), plus web searches: no official 2026-2027 free-days list found. Newest relevant council item seen: back-to-school news for 2024-2025. The CEM is being reformulated as a
  { slug: "castelldefels", name: "Castelldefels", watch: "https://www.castelldefels.org/ca/serveis/educacio/participacio-educativa/consell-escolar-municipal", hosts: /(^|\.)castelldefels\.org$/, checked: READ },
  // Cornellà de Llobregat: cornella.cat site search for 'lliure disposició' and 'calendari escolar' returns nothing relevant; education section has no calendar/CEM page. Web search only found a school certificate (Escola Els Pins, per search summary in Cornellà, 21 Jul 2026: 9 Oct 2026, 7 Dec 2026, 8 Feb 2027, 27 May 2027) - school source, not accepted, and it does not say the days are municipal.
  { slug: "cornella-de-llobregat", name: "Cornellà de Llobregat", watch: "https://www.cornella.cat/ca/viure-a-cornella/cornella-humana/educacio", hosts: /(^|\.)cornella\.cat$/, checked: READ },
  // Esparreguera: Searched web, esparreguera.cat Educació and Consell Escolar Municipal pages (generic text, no calendar), 'Dies festius' page (2026 labour holidays only), and site search ('lliure disposició', 'calendari escolar'). A municipal calendar does exist: the council's 'Instruccions ... Escola Municipal de les Arts curs 2026-2027' PDF says 'L’Escola Municipal de Les Arts seguirà els dies festius i de lliur
  { slug: "esparreguera", name: "Esparreguera", watch: "https://www.esparreguera.cat/educacio/consell-escolar-municipal/", hosts: /(^|\.)esparreguera\.cat$/, checked: READ },
  // Esplugues de Llobregat: Searched esplugues.cat (WordPress search API for 'lliure disposició', 'calendari escolar', 'consell escolar municipal'; media library for 'calendari', 'escolar', 'lliure') and the Educació page: no 2026-2027 free-days document. The council did publish 'Calendari escolar Esplugues curs 2024-2025' (wp-content/uploads/2024/06/Calendari-escolar-Esplugues-curs-2024-2025.pdf), but no 2025-26 or 2026-27 
  { slug: "esplugues-de-llobregat", name: "Esplugues de Llobregat", watch: "https://www.esplugues.cat/serveis/educacio/", hosts: /(^|\.)esplugues\.cat$/, checked: READ },
  // Figueres: figueres.cat site search ('lliure disposició') and the Consell Escolar Municipal – Consell d'Educació page (only the reglament) give no 2026-2027 free days. The 'Calendaris escolars / Proposta de calendaris escolars' link redirects to the Pla Educatiu d'Entorn Google Site (sites.google.com/xtec.cat/pee-figueres/calendari-escolar), which offers 'Calendari_Escolar_Pla_Educatiu_Entorn_2026-2027.pdf' 
  { slug: "figueres", name: "Figueres", watch: "https://www.figueres.cat/temes/educacio/escolaritzacio", hosts: /(^|\.)figueres\.cat$/, checked: READ },
  // Gavà: Council site is gavaciutat.cat (gava.cat redirects). Site search for 'lliure disposició' and 'calendari escolar' returns no 2026-2027 school free days (newest education hit: 'Inici del període de preinscripció escolar pel curs 2026-2027'); the Consell Escolar Municipal page is descriptive only. Education page links news to elbruguersdigital.cat (municipal news) but nothing on free days seen. Web s
  { slug: "gava", name: "Gavà", watch: "https://www.gavaciutat.cat/educacio", hosts: /(^|\.)gavaciutat\.cat$/, checked: READ },
  // l'Hospitalet de Llobregat: The Consell Educatiu de L'Hospitalet usually ratifies the free days in plenary (2 Jul 2025 agenda item 3: 'Ratificació dies de lliure disposició dels centres educatius' for 2025-26). A meeting 'CE Sessió Plenària curs 2026-2027' (meetings/5213, created ~30 Oct 2026) and an 'extraordinària curs 2025-2026' (4126) exist on participa311 but are not publicly viewable (redirect to login; API returns nul
  { slug: "l-hospitalet-de-llobregat", name: "l'Hospitalet de Llobregat", watch: "https://participa311-lhospitalet.diba.cat/assemblies/ConsellEducatiu", hosts: /(^|\.)diba\.cat$/, checked: READ },
  // Igualada: Searched igualada.cat (site search 'lliure disposició' and 'calendari escolar'; Educació service page): no 2026-2027 school free days or CEM document. Search hits were unrelated or old (e.g. 'Avui comença el curs escolar a Igualada', 12-09-2019; guia de centres/preinscripció news). Web searches gave only other towns' and schools' documents.
  { slug: "igualada", name: "Igualada", watch: "https://www.igualada.cat/ca/serveis/educacio", hosts: /(^|\.)igualada\.cat$/, checked: READ },
  // Lloret de Mar: Searched lloret.cat (site search 'lliure disposició' and 'calendari escolar', Educació section, press note 'Més de 5.500 alumnes inicien el curs escolar 2026-2027 a Lloret de Mar' of 08-09-2026): no town-wide/CEM free-days list for schools. Only hit: the calendar of ONE municipal nursery, Llar d'Infants Els Pops, Curs 2026-2027 ('Dies de lliure disposició: 7 desembre, 5 i 8 febrer, 30 abril i 17 m
  { slug: "lloret-de-mar", name: "Lloret de Mar", watch: "https://www.lloret.cat/ca/seccions/educacio", hosts: /(^|\.)lloret\.cat$/, checked: READ },
  // Manresa: Council education section (web.manresa.cat) has no CEM or school-calendar page; web searches found no council/CEM document for 2026-27. Only a school source surfaced: Institut Escola Manresa's '26-27 Carta d'inici de curs' (agora.xtec.cat), which per search summary lists 2 Nov, 7 Dec, 23 Feb, 30 Apr, 17 May as festius de lliure disposició - not accepted and not stated to be municipal. (The 'ACTA C
  { slug: "manresa", name: "Manresa", watch: "https://web.manresa.cat/web/menu/3358-educacio", hosts: /(^|\.)manresa\.cat$/, checked: READ },
  // el Masnou: Searched web, elmasnou.cat Educació and CEMM pages (only reglament), 'Guia educativa 26-27' PDF (no free days). The CEMM approves common days each May: its minutes 'Acta CEMM 20-05-25' (seu-e.cat) approved 2025-26 days ('1r trimestre: divendres 10 d’octubre i dilluns 3 de novembre de 2025. 2n trimestre: dilluns 16 de febrer i divendres 13 de març de 2026'). The equivalent 2026 minutes for 2026-27 
  { slug: "el-masnou", name: "el Masnou", watch: "https://www.elmasnou.cat/temes/educacio/consell-escolar-municipal-del-masnou-cemm", hosts: /(^|\.)elmasnou\.cat$/, checked: READ },
  // Molins de Rei: Searched web, molinsderei.cat WordPress search ('lliure disposició', 'calendari escolar', 'consell escolar/educatiu municipal'), the 'Participació educativa' page (only CEM minutes 2022-2023), the 9 Sep 2026 start-of-course news item. The council's 'Dossier preinscripció Bressol 2026-2027' says 'Dies de lliure disposició del curs escolar 2026-2027: els que aprovin els Consells Escolars de les esco
  { slug: "molins-de-rei", name: "Molins de Rei", watch: "https://molinsderei.cat/participacioeducativa/", hosts: /(^|\.)molinsderei\.cat$/, checked: READ },
  // Olesa de Montserrat: Searched web (Catalan queries), olesademontserrat.cat 'Educació i infància' page, the Sept 2026 start-of-course news item, and the site's own search for 'lliure disposició' (only hit: 2009 news 'Aprovats els tres dies festius de lliure disposició dels centres Escolars Curs 2009', showing the CEM historically approves common days). Nothing for 2026-27 found.
  { slug: "olesa-de-montserrat", name: "Olesa de Montserrat", watch: "https://www.olesademontserrat.cat/educacio-i-infancia", hosts: /(^|\.)olesademontserrat\.cat$/, checked: READ },
  // Palafrugell: Searched web, educacio.palafrugell.cat WordPress search ('lliure disposició', 'calendari escolar', 'consell escolar municipal'), the CEM page: its 'CONSULTA EL CALENDARI ESCOLAR' button still links to the generic Generalitat 2025-2026 calendar image (uploaded Jan 2026, no town days). News item on start of course (comunicacio.palafrugell.cat/.../6770) now 404s. No 2026-27 common days found.
  { slug: "palafrugell", name: "Palafrugell", watch: "https://educacio.palafrugell.cat/participacio/consells/consell-escolar-municipal/", hosts: /(^|\.)palafrugell\.cat$/, checked: READ },
  // Premià de Mar: Council education area (premiademar.cat area.php?id=54) has no calendar/free-days page; the 8 Sep 2026 press note 'Prop de 3.130 alumnes d'infantil, primària i secundària han començat avui el curs 2026-2027 a Premià de Mar' (https://premiademar.cat/document.php?id=38027) gives no free days. Web searches returned only other towns' CEM minutes (Malgrat, Montornès).
  { slug: "premia-de-mar", name: "Premià de Mar", watch: "https://premiademar.cat/area.php?id=54", hosts: /(^|\.)premiademar\.cat$/, checked: READ },
  // Reus: Reus sets common days in the Consell Educatiu de Ciutat (CEC). Newest published acta is the CEC plenary of 29 Oct 2025 (signed 30 Mar 2026), item 'TERCER .- Dies de lliure disposició curs 2026-27': by city agreement the choice rotates, and for 2026-27 it is the turn of 'infantil i primària pública' to choose; the primary-heads representative asked to decide later ('no precipitar-nos fixant dates a
  { slug: "reus", name: "Reus", watch: "https://www.reus.cat/serveis/consell-educatiu-de-ciutat", hosts: /(^|\.)reus\.cat$/, checked: READ },
  // Rubí: rubi.cat site search ('lliure disposició', 'calendari escolar 2026') and the CEM page give no 2026-27 days. The council's annual 'Guia d'ensenyament' (2025-26 edition checked) does not list lliure disposició days; no 2026-27 edition found at the expected path. Web search returned only school actes (town unclear) - not accepted.
  { slug: "rubi", name: "Rubí", watch: "https://www.rubi.cat/ca/temes/educacio/participa/consell-escolar-municipal-cem", hosts: /(^|\.)rubi\.cat$/, checked: READ },
  // Sabadell: Council site web.sabadell.cat / www.sabadell.cat unreachable from here (DNS failure / connection refused), so could not search it; watch URL is the homepage (education page path not verified). The Sabadell CEM normally issues a 'CEM Calendari ... CENTRES EDUCATIUS NO UNIVERSITARIS' proposal 'per a tots els centres educatius de Sabadell' (2024-25 copy seen on a school site). For 2026-27 only school
  { slug: "sabadell", name: "Sabadell", watch: "https://web.sabadell.cat/", hosts: /(^|\.)sabadell\.cat$/, checked: READ },
  // Sant Adrià de Besòs: Council site moved to sant-adria.cat (old sant-adria.net has a broken cert/empty page). Site search for "lliure disposició" returns only the Canguteca rules page; search 'calendari escolar' returns nothing relevant. Education section and CEM page (https://www.sant-adria.cat/sant-adria-per-temes/educacio/consell-escolar-municipal) have no calendar or 2026-27 free days. Web searches found only press
  { slug: "sant-adria-de-besos", name: "Sant Adrià de Besòs", watch: "https://www.sant-adria.cat/sant-adria-per-temes/educacio", hosts: /(^|\.)sant-adria\.cat$/, checked: READ },
  // Sant Andreu de la Barca: Searched web (Catalan queries), sabarca.cat education theme page and its documents (Patis Oberts 26-27 forms), education news list (newest: 'Els Patis Oberts tornen l'1 d'octubre', '3.837 alumnes comencen el curs escolar' of 8 Sep 2026 - no free days mentioned). No CEM page or 2026-27 lliure disposició dates found on official sources.
  { slug: "sant-andreu-de-la-barca", name: "Sant Andreu de la Barca", watch: "https://sabarca.cat/temes/educacio", hosts: /(^|\.)sabarca\.cat$/, checked: READ },
  // Sant Boi de Llobregat: Web search found nothing for Sant Boi (only schools in Cornellà/Pallejà and El Prat's calendar). santboi.cat site search ('lliure disposició', 'calendari escolar') only returns the general 'Calendari festiu' page (no school days); education section (consells-de-participacio, serveis-les-families, actualitat-educacio) has no calendar or CEM agreement.
  { slug: "sant-boi-de-llobregat", name: "Sant Boi de Llobregat", watch: "https://www.santboi.cat/ciutadania/educacio/consells-de-participacio", hosts: /(^|\.)santboi\.cat$/, checked: READ },
  // Sant Cugat del Vallès: Web searches (Catalan) returned only school actes from other/unclear towns and the local paper Tot Sant Cugat (not accepted). santcugat.cat site search is JS-rendered; checked sitemap education pages (etapes-educatives, the 'Educació' hub whose slug is llistes-definitives-preinscripcio-a-ebm02) - no calendar / lliure disposició / CEM content found. Watch URL is the council's 'Educació' hub per its
  { slug: "sant-cugat-del-valles", name: "Sant Cugat del Vallès", watch: "https://santcugat.cat/web/llistes-definitives-preinscripcio-a-ebm02", hosts: /(^|\.)santcugat\.cat$/, checked: READ },
  // Sant Feliu de Guíxols: Searched web (Catalan queries incl. ensenyament.guixols.cat), guixols.cat homepage and site search for 'lliure disposició' (no relevant hits), ciutadania.guixols.cat areas page (links to 'Servei d'Educació Municipal' at https://ensenyament.guixols.cat/, which currently returns only a default 'IIS Windows Server' page). No CEM page or 2026-27 free days found.
  { slug: "sant-feliu-de-guixols", name: "Sant Feliu de Guíxols", watch: "https://ciutadania.guixols.cat/arees_i_serveis", hosts: /(^|\.)guixols\.cat$/, checked: READ },
  // Sant Feliu de Llobregat: www.santfeliu.cat was unreachable from here (curl connection timeout; WebFetch ECONNREFUSED), so the council site could not be searched. Checked the council's Decidim platform (participa311-santfeliu.diba.cat): Consell Escolar Municipal assembly page (cmescolar) has no 2026-27 documents; the Consell Educatiu de Ciutat assembly only has 2022 session reports. Web searches returned only other towns' 
  { slug: "sant-feliu-de-llobregat", name: "Sant Feliu de Llobregat", watch: "https://www.santfeliu.cat/", hosts: /(^|\.)santfeliu\.cat$/, checked: READ },
  // Sant Joan Despí: Council site search (sjdespi.cat) for 'lliure disposició' and 'calendari escolar' returns nothing relevant; education section has no calendar page; the 2026-27 start-of-course news item ('Inici del curs escolar per a més de 4.100 alumnes a Sant Joan Despí') gives no free days. Web searches found only other towns' school/CEM documents.
  { slug: "sant-joan-despi", name: "Sant Joan Despí", watch: "https://sjdespi.cat/la-ciutat-per-temes/educacio", hosts: /(^|\.)sjdespi\.cat$/, checked: READ },
  // Sant Pere de Ribes: Council 'Calendari escolar' page only says the Departament sets the calendar and to ask each school; CEM page (https://www.santperederibes.cat/municipi/educacio/consell-escolar-municipal) is descriptive only, no documents. Web searches found council aid notices and a 16 Jun 2026 JGL agenda (unrelated), no 2026-27 free days.
  { slug: "sant-pere-de-ribes", name: "Sant Pere de Ribes", watch: "https://www.santperederibes.cat/municipi/educacio/calendari-escolar", hosts: /(^|\.)santperederibes\.cat$/, checked: READ },
  // Sant Vicenç dels Horts: Searched web (Catalan queries), svh.cat WordPress search ('lliure disposició', 'calendari escolar', 'consell escolar municipal'), the three CEM pages (Actiu page modified 2026-11-03 but only has generic text + reglament) and the 'Guia educativa 26-27' PDF (preinscription guide, no free days). No 2026-27 free days on council site. A school (IES Gabriela Mistral, agora.xtec.cat) published a common '
  { slug: "sant-vicenc-dels-horts", name: "Sant Vicenç dels Horts", watch: "https://svh.cat/les-eines/organs-de-participacio/consell-escolar-municipal/", hosts: /(^|\.)svh\.cat$/, checked: READ },
  // Santa Coloma de Gramenet: gramenet.cat returns 403 to curl and WebFetch (whole site, incl. PDFs), so could not check. Search found the municipal bulletin 'Ajuntament Informa' 1894 (24 Jul 2026) and 1851 (12 Sep 2025) PDFs and the 2026 school guides, but could not open them; no official 2026-27 dates seen in search snippets. The town's body is the 'Consell d'Educació Municipal' (reglament modified 2025). Watch URL is the ho
  { slug: "santa-coloma-de-gramenet", name: "Santa Coloma de Gramenet", watch: "https://www.gramenet.cat/", hosts: /(^|\.)gramenet\.cat$/, checked: READ },
  // Santa Perpètua de Mogoda: Searched web (Catalan queries), staperpetua.cat education theme page (only preinscripció 26-27 rules and absenteeism protocol PDFs), the Consell Escolar Municipal page (generic text, last updated 27.02.2026, no documents), and the site search (results JS-rendered, nothing usable). No official 2026-27 lliure disposició dates found.
  { slug: "santa-perpetua-de-mogoda", name: "Santa Perpètua de Mogoda", watch: "https://www.staperpetua.cat/ajuntament/govern/consells-municipals-i-comissions/consell-escolar-municipal.html", hosts: /(^|\.)staperpetua\.cat$/, checked: READ },
  // Sitges: Council site search for "lliure disposició" returns 0 results; 'calendari escolar' returns only start-of-course news. Education section ('Tornada a l'escola', Educació Infantil i Primària) has no calendar or free days; the 8 Sep 2026 news 'Sitges comença el curs escolar 2026-2027 amb 2.883 alumnes...' gives no free days. No CEM page found.
  { slug: "sitges", name: "Sitges", watch: "https://www.sitges.cat/serveis/ensenyament", hosts: /(^|\.)sitges\.cat$/, checked: READ },
  // Terrassa: terrassa.cat and participa.terrassa.cat are behind Cloudflare (403 / challenge) for curl and WebFetch. Search found the council press release '260903 NP inici curs escolar' (3 Sep 2026, could not open) and old CEM minutes (CEM historically votes the common days, e.g. 2022-23). The only 2026-27-free-day-adjacent hits were school sites (Joan Maragall acta, no dates) and a 2025-26 school calendar (10
  { slug: "terrassa", name: "Terrassa", watch: "https://participa.terrassa.cat/assemblies", hosts: /(^|\.)terrassa\.cat$/, checked: READ },
  // Tortosa: Council site (www2.tortosa.cat) education section has only static pages (no calendar). Council news archive search for 'lliure disposici' returns nothing; 'curs escolar' returns only old start-of-year items (latest 2022). Web searches surfaced only school/press calendars from other towns; nothing official for Tortosa 2026-27.
  { slug: "tortosa", name: "Tortosa", watch: "https://www2.tortosa.cat/ciutat/educacio/", hosts: /(^|\.)tortosa\.cat$/, checked: READ },
  // Vila-seca: Searched web (Catalan queries), vila-seca.cat 'Ensenyament' service page (only transport escolar 2026-2027 and llars d'infants procedures), education news list and the Joomla site search for 'lliure disposició' (no relevant hits). No CEM page or 2026-27 lliure disposició dates found. Press reports the 2027 local holidays as 18 Jan and 3 Aug 2027 (not an official source; not used).
  { slug: "vila-seca", name: "Vila-seca", watch: "https://www.vila-seca.cat/ca/serveis-a-vila-seca/ensenyament-a-vila-seca", hosts: /(^|\.)vila-seca\.cat$/, checked: READ },
  // Viladecans: viladecans.cat (all pages and PDFs) returns a Cloudflare 403 challenge to curl and WebFetch, so the council site could not be read; Wayback CDX was rate-limited/unavailable. Web searches ('lliure disposició' 2026-2027 Viladecans, site:viladecans.cat calendari escolar) returned no council page or CEM document with 2026-2027 free days, only other towns' and schools' calendars. The municipal magazine
  { slug: "viladecans", name: "Viladecans", watch: "https://www.viladecans.cat/", hosts: /(^|\.)viladecans\.cat$/, checked: READ },
  // Vilafranca del Penedès: Council education portal educacio.vilafranca.cat checked: CEM minutes page lists actes up to 'Acta CEM 2026-04-13.pdf' (no mention of lliure disposició); the 7 Sep 2026 news 'Vilafranca inicia el curs escolar 2026-2027 amb 6.656 alumnes' and its PDF have no free days; site search is Google CSE (not usable); no calendari escolar page. A school's June 2026 acords (agora.xtec.cat/ceipestalella, not o
  { slug: "vilafranca-del-penedes", name: "Vilafranca del Penedès", watch: "https://educacio.vilafranca.cat/participacio/consell-escolar-municipal/actes-reunions", hosts: /(^|\.)vilafranca\.cat$/, checked: READ },
];

/* -------------------------------------------------------------------------- */
/* Checks                                                                     */
/* -------------------------------------------------------------------------- */

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const valid = (value: string) => ISO.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;

/**
 * Why a day cannot be a free day of the 2026-2027 course, or null: a weekend,
 * outside the course, its first or last day, in the Christmas or Easter
 * holidays, a Catalonia-wide holiday, or one of the town's own local days.
 */
export function notASchoolDay(iso: string, localDays: readonly string[] = []): string | null {
  if (!valid(iso)) return "not an ISO date";
  const weekday = weekdayIndex(iso);
  if (weekday === 0 || weekday === 6) return "a weekend";
  if (iso < COURSE.start || iso > COURSE.end) return "outside the course";
  if (iso === COURSE.start || iso === COURSE.end) return "the first or last day of the course";
  if (iso >= COURSE.christmas[0] && iso <= COURSE.christmas[1]) return "in the Christmas holidays";
  if (iso >= COURSE.easter[0] && iso <= COURSE.easter[1]) return "in the Easter holidays";
  const holiday = holidayOn(iso);
  if (holiday) return `a Catalonia-wide holiday (${holiday.name.en})`;
  if (localDays.includes(iso)) return "a local holiday of the town";
  return null;
}

/** Why a row cannot be printed, or nothing when it can. `localDays`: the town's own local holidays in the course. */
export function freeDaysProblems(town: FreeDaysTown, localDays: readonly string[] = []): string[] {
  const problems: string[] = [];
  if (!town.days.length) problems.push(`${town.name}: no days (a town without days goes in FREE_DAYS_PENDING)`);
  // Four, plus up to the two local holidays when they fall on days without school (section 2.4 b).
  if (town.days.length > 6) problems.push(`${town.name}: more than four days plus two local holidays`);
  if ([...town.days].sort().join() !== town.days.join() || new Set(town.days).size !== town.days.length) problems.push(`${town.name}: days out of order or repeated`);
  for (const day of town.days) {
    const why = notASchoolDay(day, localDays);
    if (why) problems.push(`${town.name}: ${day} is ${why}`);
  }
  try {
    const url = new URL(town.url);
    if (url.protocol !== "https:") problems.push(`${town.url} is not https`);
    if (!town.hosts.test(url.host)) problems.push(`${town.name}: ${url.host} is not the publisher's own site`);
    if (/[?&]utm_/.test(town.url)) problems.push(`${town.url} carries tracking`);
  } catch {
    problems.push(`${town.name}: ${town.url} is not a URL`);
  }
  if (!town.title.trim() || !town.publisher.trim() || !town.body.ca.trim() || !town.body.es.trim() || !town.body.en.trim()) problems.push(`${town.name}: empty title, publisher or body`);
  if (!/^(el |la |l'|els |les )/.test(town.body.ca) || !/^(el |la |los |las )/.test(town.body.es)) problems.push(`${town.name}: the body needs its article ("el Consell…", "el Consejo…")`);
  if (!valid(town.checked)) problems.push(`${town.name}: checked ${town.checked} is not an ISO date`);
  else if (town.checked > FREE_DAYS_AS_OF) problems.push(`${town.name}: checked ${town.checked} is after FREE_DAYS_AS_OF`);
  return problems;
}

/* -------------------------------------------------------------------------- */
/* Reading                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The town's own local holidays inside the course: 2026's from the DOGC order
 * (holidays snapshot), 2027's from the next order once parsed, or until then
 * from the council's own approval (council-2027.ts), when there is one.
 */
export function localDaysInCourse(slug: string): string[] {
  const m = municipalityBySlug(slug);
  const next = nextYearFor(slug)?.local ?? councilApproved2027(slug)?.local ?? [];
  return [...(m?.local ?? []), ...next].filter((d) => d >= COURSE.start && d <= COURSE.end);
}

/** What Monday 7 December 2026 is for the town's schools, by its own data. */
export type Monday7 = "free" | "local" | "school";

export function monday7(town: FreeDaysTown): Monday7 {
  if (localDaysInCourse(town.slug).includes(MONDAY_7)) return "local";
  return town.days.includes(MONDAY_7) ? "free" : "school";
}

export function freeDaysFor(slug: string, towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): FreeDaysTown | null {
  return towns.find((t) => t.slug === slug) ?? null;
}

export function pendingFor(slug: string, pending: readonly FreeDaysPending[] = FREE_DAYS_PENDING): FreeDaysPending | null {
  return pending.find((t) => t.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */
/* The town holiday pages' section                                            */
/* -------------------------------------------------------------------------- */

/** After a set of five or six days: what the order allows, not why the town did it. */
export const MORE_THAN_FOUR: Record<Locale, string> = {
  ca: "L'Ordre EDF/66/2026 permet sumar als quatre dies les festes locals que cauen en un dia sense classe.",
  es: "La Ordre EDF/66/2026 permite sumar a los cuatro días las fiestas locales que caen en un día sin clase.",
  en: "Order EDF/66/2026 lets schools add to the four days any local holiday that falls on a day without school.",
};

export interface TownSection {
  heading: string;
  /** The 7 December answer, bold on the page. */
  answer: string;
  /** The days, the caveat and (when the source qualifies them) its note. */
  text: string;
  source: { lead: string; name: string; url: string; read: string };
  hub: { label: string; href: string };
}

/**
 * The short "Dies de lliure disposició escolar 2026-27" section of a town's
 * holiday page (ca/es), or null for a town without a published set: those
 * pages say nothing (the hub lists them as not published). Titles,
 * descriptions and H1s of the town pages are not touched.
 */
export function townSection(slug: string, locale: "ca" | "es", hubHref: string, towns: readonly FreeDaysTown[] = FREE_DAYS_TOWNS): TownSection | null {
  const town = freeDaysFor(slug, towns);
  if (!town) return null;
  const status = monday7(town);
  const days = dayPhrase(town.days, locale);
  const body = town.body[locale];
  const Body = body.charAt(0).toUpperCase() + body.slice(1);
  const verb = {
    ca: { proposal: "proposa", agreement: "ha fixat", notice: "publica" },
    es: { proposal: "propone", agreement: "ha fijado", notice: "publica" },
  }[locale][town.kind];
  const answer = {
    ca: { free: "Dilluns 7 de desembre de 2026: sense classe.", local: "Dilluns 7 de desembre de 2026: sense classe, és festa local.", school: "Dilluns 7 de desembre de 2026: hi ha classe." },
    es: { free: "Lunes 7 de diciembre de 2026: sin clase.", local: "Lunes 7 de diciembre de 2026: sin clase, es fiesta local.", school: "Lunes 7 de diciembre de 2026: hay clase." },
  }[locale][status];
  const extra = [town.scope?.[locale], town.note?.[locale], town.days.length > 4 ? MORE_THAN_FOUR[locale] : null].filter(Boolean).join(" ");
  const text = {
    ca: `${Body} ${verb} aquests dies de lliure disposició del curs 2026-2027 per a les escoles ${ofTown(town.name, "ca")}: ${days}.${status === "school" ? " El 7 de desembre no hi és." : ""}${extra ? ` ${extra}` : ""} Cada escola fixa els seus dies i en pot triar d'altres: confirma-ho amb el centre.`,
    es: `${Body} ${verb} estos días de libre disposición del curso 2026-2027 para los colegios ${ofTown(town.name, "es")}: ${days}.${status === "school" ? " El 7 de diciembre no está." : ""}${extra ? ` ${extra}` : ""} Cada colegio fija sus días y puede elegir otros: confírmalo con el centro.`,
  }[locale];
  return {
    heading: locale === "ca" ? "Dies de lliure disposició escolar 2026-27" : "Días de libre disposición escolar 2026-27",
    answer,
    text,
    source: {
      lead: locale === "ca" ? "Font:" : "Fuente:",
      name: town.title,
      url: town.url,
      read: `${town.publisher}, ${locale === "ca" ? "consultat el" : "consultado el"} ${readDate(town.checked, locale)}`,
    },
    hub: {
      label: locale === "ca" ? `Dies de lliure disposició 2026-2027 de ${towns.length} municipis i si hi ha escola el 7 de desembre` : `Días de libre disposición 2026-2027 de ${towns.length} municipios y si hay colegio el 7 de diciembre`,
      href: hubHref,
    },
  };
}

/** "dilluns 7 de desembre de 2026" / "lunes 7 de diciembre de 2026" / "Monday 7 December 2026". */
export function freeDay(iso: string, locale: Locale, withYear = true): string {
  const year = withYear ? (locale === "en" ? ` ${iso.slice(0, 4)}` : ` de ${iso.slice(0, 4)}`) : "";
  return `${WEEKDAY_NAMES[locale][weekdayIndex(iso)]} ${shortDate(iso, locale)}${year}`;
}

/** "5 de novembre de 2026" / "5 November 2026". */
export function readDate(iso: string, locale: Locale): string {
  return `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
}

/** "el Prat de Llobregat" in Catalan, "El Prat de Llobregat" in Spanish and English (as the holiday pages print it). */
export function nameIn(name: string, locale: Locale): string {
  return locale === "ca" ? name : name.charAt(0).toUpperCase() + name.slice(1);
}

/** "del Prat de Llobregat", "de l'Hospitalet", "d'Olot", "de Terrassa"; "de El Prat de Llobregat" in Spanish. */
export function ofTown(name: string, locale: "ca" | "es"): string {
  if (locale === "es") return `de ${nameIn(name, "es")}`;
  if (name.startsWith("el ")) return `del ${name.slice(3)}`;
  if (name.startsWith("els ")) return `dels ${name.slice(4)}`;
  if (/^(la |les |l')/.test(name)) return `de ${name}`;
  return /^[AEIOUÀÈÉÍÒÓÚH]/.test(name) && !/^(Hu|Hi)[aeiou]/.test(name) ? `d'${name}` : `de ${name}`;
}

const AND: Record<Locale, string> = { ca: " i ", es: " y ", en: " and " };

/** "a, b i c". */
export function joinNames(items: readonly string[], locale: Locale): string {
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")}${AND[locale]}${items[items.length - 1]}`;
}

/**
 * The days grouped by year so each year is said once: "divendres 30
 * d'octubre i dilluns 7 de desembre de 2026, dilluns 8 de febrer i divendres
 * 14 de maig de 2027".
 */
export function dayPhrase(days: readonly string[], locale: Locale): string {
  const years = [...new Set(days.map((d) => d.slice(0, 4)))];
  const groups = years.map((year) => {
    const inYear = days.filter((d) => d.startsWith(year)).map((d) => freeDay(d, locale, false));
    return `${joinNames(inYear, locale)}${locale === "en" ? " " : " de "}${year}`;
  });
  return groups.join(", ");
}
