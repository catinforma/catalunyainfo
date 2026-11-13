import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";

import { dayDate } from "./festive";
import { granRecapteMention } from "./gran-recapte";
import { SHOPS } from "./shops";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * La Marató de 3Cat 2026: when it is, what it is for, how to watch it and
 * how to give.
 *
 * Every fact was read on 26 Oct 2026 on 3Cat's own pages (the HTML itself,
 * not a summary):
 *
 *  - 3Cat news, 2 Apr 2026 ("SERÀ DIUMENGE 13 DE DESEMBRE La Marató 2026 se
 *    centrarà en les malalties neurodegeneratives i neuromusculars"): 35th
 *    edition; more than 600 neurodegenerative conditions, about 250,000
 *    people in Catalonia; more than 150 neuromuscular ones, about 44,000
 *    people, "més del 50% de pacients debuten en la infància"; donations go
 *    "íntegrament" to awareness and research; the 2025 edition was on cancer.
 *  - The 2026 hub (ca/es/en): "El 13 de desembre ... 35a edició"; since 1992
 *    "ha recaptat 271,9 milions d'euros i ha finançat 1.084 projectes" (no
 *    date on the page, so the page prints the day it was read).
 *  - 3Cat video of 2 Oct 2026: Raquel Sans and Miki Núñez present on TV3,
 *    Roger Escapa on Catalunya Ràdio, on 13 December.
 *  - Donation page ("Fes el teu donatiu ... La Marató 2026"): online, Bizum
 *    "Donacions" with code 33333 and the postal code in the concept, bank
 *    transfer; certificate form "abans del 31 de desembre". The IBAN is not
 *    copied here on purpose: readers are sent to the official page for it.
 *    No phone number is published there yet.
 *  - Volunteering page: phone centres at Fira de Barcelona, Palau de
 *    Congressos de Girona, Port de Tarragona and Universitat de Lleida;
 *    pre-registration at marato.voluntariat.org from 10:00 on 20 Oct to 10:00
 *    on 10 Nov, places drawn by lot.
 *  - Popular activities page ("més de 3.500 activitats ... cada any"),
 *    outreach sessions page (13 Oct - 13 Dec) and the news of 20 Oct 2026
 *    (about 6,500 sessions, about 1,000 schools, about 450 health
 *    professionals, about 225,000 young people, "Crea per La Marató").
 *  - "Què és La Marató?": since 1992, TV3 the pioneering public broadcaster in
 *    Spain to run a telethon, about fifteen hours live, TV and radio.
 *  - 3Cat live page: "tots els canals de TV3, Catalunya Ràdio".
 *  - Ley 49/2002, art. 19 (BOE consolidated, as amended by RDL 6/2023): 80%
 *    of the first 250 euros, 40% of the rest (45% for repeat donors, 3Cat
 *    donation page and art. 19.1), capped at 10% of the taxable base.
 *
 * Not published on 26 Oct 2026, so not printed: the programme's start time
 * and running order, the donation phone number, the 2026 total.
 *
 * 30 Oct 2026 (top-3 push): the CA page had 657 impressions and 4 clicks in a
 * week at position 6, so the CA and ES titles now carry the answer (the date,
 * 13 December) instead of "quan és". Re-read that day: the 2026 hub (13 Dec,
 * 35th edition, no start time) and the donation page (Bizum 33333, no phone
 * number); nothing new to add.
 *
 * 30 Oct 2026, afternoon (seasonal top-3 push): the 2026 hub, the donation
 * page and the volunteering page read again (still no start time and no phone
 * number; pre-registration until 10:00 on 10 November). Titles kept; the H1
 * and the lead now say "La Marató de TV3", the words people search ("marató
 * tv3 2026"), and the FAQ answers "a quina hora", "on es veu" and "com ser
 * voluntari" as well as "quan és". Links: the Christmas fairs hub.
 *
 * 3 Nov 2026 (CTR sweep): the CA page had 1,672 impressions and 7 clicks in
 * two weeks at position 6.3, and "marató tv3 2026 data" took 0 clicks at
 * position 4.3: the date alone is answered on the results page. The CA
 * title swaps "causa" for "voluntaris" ("voluntaris marato tv3 2026" and
 * variants) and the description names the cause and the volunteer
 * deadline; a "Voluntaris" line joins the key facts. The volunteering page
 * was re-read that day: pre-registration at marato.voluntariat.org from
 * 10:00 on 20 Oct to 10:00 on 10 Nov, places drawn by lot, Sunday 13
 * December, no start time. After 10 November the description's deadline
 * is past and should be replaced.
 *
 * 4 Nov 2026: one body sentence at the end of the volunteering section links
 * the new Gran Recapte 2026 guide (13-14 Nov), from gran-recapte.ts
 * granRecapteMention(); titles and description untouched. Goes out with
 * `gran-recapte-links`.
 *
 * 11 Nov 2026 (CTR retitles, docs/SEO_EXPERIMENTS.md): volunteer
 * pre-registration closed at 10:00 on 10 Nov, so the CA title and description
 * drop it. CA 0.5 % at 6.5, ES 1.4 % at 6.8 (29 Oct-6 Nov), "marató tv3 2026
 * data" 0.3 % at 5.6: the date alone is answered on the results page. CA/ES
 * titles now promise the donation and tax-relief answers (Bizum 33333, Llei
 * 49/2002 art. 19, both above); the descriptions add the presenters and
 * where to watch. EN title kept; its description follows. No new fact.
 *
 * 11 Nov 2026 (after the volunteer deadline): the key facts, the
 * volunteering paragraph and the FAQ answer in ca/es/en say pre-registration
 * is closed and what the registration site says now (VOLUNTEER_CHECKED
 * below). Two sources added. Group `marato`.
 *
 * 13 Nov 2026 (December push, body only; titles, H1 and descriptions wait
 * for the 18 Nov check in docs/SEO_EXPERIMENTS.md): 3Cat announced the
 * programme on 10 Nov (PROGRAMME below). The lead, key facts, "when" section
 * and FAQ now give the TV3 times and venues, the radio start, the 900 21 50 50
 * line for 13 Dec, a "what is on" section (testimonies, reporters, the match
 * on Esport3, InfoK on 7 Dec, audience places full), the album (29 Nov, 12 €)
 * with its tracks; ES/EN key facts gain the volunteers row CA had.
 *
 * No new photograph: the hero is the shops guide's lead picture (Christmas
 * lights), with the same alt text and caption.
 */

export const MARATO_VERIFIED = "2026-10-26";

/**
 * Volunteering after the deadline, read with curl on 11 Nov 2026 on the
 * Generalitat's registration site (research_notes/marato-voluntariat-2026.md):
 * home ("Tancat el període de preinscripcions."), the pre-registration page
 * (assignment by the drawn number and preferences, 72 hours to accept, waiting
 * list "activa fins el 8 de desembre", direct registration "a mitjans de
 * novembre" only "en el cas que quedin places vacants", first for the waiting
 * list, then for everyone; online training compulsory) and the draw result
 * (cut-off numbers below). 3Cat's own volunteering page still shows
 * "PREINSCRIPCIONS OBERTES!" with the 20 Oct-10 Nov window; the registration
 * site, which runs the process, is followed.
 */
export const VOLUNTEER_CHECKED = "2026-11-13";
const VOLUNTEER_CHECKED_TEXT = { ca: "el 13 de novembre de 2026", es: "el 13 de noviembre de 2026", en: "on 13 November 2026" } as const;

/**
 * The 2026 programme, from 3Cat's news of 10 Nov 2026 ("La 35a edició de La
 * Marató donarà veu a les persones que conviuen amb malalties
 * neurodegeneratives i neuromusculars", <time> 2026-11-10T13:28), read with
 * curl on 13 Nov 2026:
 *   "El programa de televisió començarà a les 9.30 des de la Torre de
 *   Collserola, on s'allargarà fins a les 14.30, i es reprendrà a les 16.00
 *   des del Parc Audiovisual de Catalunya, a Terrassa, fins a la 1.00 de la
 *   matinada."
 *   "A Catalunya Ràdio, Roger Escapa presentarà "El suplement" des de la
 *   Universitat de Lleida, a partir de les 8.00"
 *   "El diumenge 13 de desembre també estarà actiu el telèfon 900 21 50 50."
 *   "El partit de futbol de La Marató es jugarà a l'estadi Nou Sardenya i es
 *   podrà seguir per Esport3"; "El 7 de desembre, l'"InfoK" emetrà un especial".
 * Same day: the "Públic" page (afternoon at the Parc Audiovisual de Catalunya,
 * "PLACES COMPLETES!") and "El disc" page (22nd edition, on sale "un únic dia,
 * el diumenge 29 de novembre, en format CD per 12 euros" with the newspapers
 * listed; 3Cat shop CD/USB; Apple Music; 12 tracks). The donation page was
 * re-read (same three channels, still no phone number on it; certificate
 * form "abans del 31 de desembre") and so was the volunteering site (no
 * change since 11 Nov: closed, waiting list to 8 Dec, no direct sign-up yet).
 */
export const PROGRAMME_CHECKED = "2026-11-13";
const PROGRAMME_CHECKED_TEXT = { ca: "13 de novembre de 2026", es: "13 de noviembre de 2026", en: "13 November 2026" } as const;
export const PROGRAMME = {
  /** TV3, 24-hour clock, Catalan style ("9.30"); the es/en copy writes "9:30". */
  tv: [
    { from: "9.30", to: "14.30", place: "Torre de Collserola" },
    { from: "16.00", to: "1.00", place: "Parc Audiovisual de Catalunya" },
  ],
  radioFrom: "8.00",
  phone: "900 21 50 50",
  discDate: "2026-11-29",
  discPrice: 12,
  infoKDate: "2026-12-07",
  news: "https://www.3cat.cat/3catinfo/la-35a-edicio-de-la-marato-donara-veu-a-les-persones-que-conviuen-amb-malalties-neurodegeneratives-i-neuromusculars/noticia/3438943/",
  audience: "https://www.3cat.cat/tv3/marato/public/2026/4010/",
  disc: "https://www.3cat.cat/tv3/marato/disc/2026/4030/",
} as const;
/** "9.30" -> "9:30" for the es/en editions. */
const hm = (time: string) => time.replace(".", ":");

/**
 * The disc's twelve pieces, as 3Cat's disc page lists them (13 Nov 2026):
 * [title, original title or null, performers]. "&" joins performers and
 * becomes i / y / and.
 */
const DISC: [string, string | null, string][] = [
  ["Vestigis", "poema de Mireia Calafell", "Carme Elias & Quartet Brossa"],
  ["Per neuraltres i el badal", "Per nosaltres i els de dalt", "Joan Dausà & Coral Parkinsongs"],
  ["Ai, Dolors", null, "Roger Mas"],
  ["No tinc temps", null, "Lax'n'Busto"],
  ["Que bonic!", null, "Montse Castellà & Orchestra Fireluche"],
  ["Barca del temps", null, "Ferran Palau & Mar Pujol"],
  ["Se'n va anar", null, "Obeses & Original Jazz Orquesta Taller de Músics (OJO)"],
  ["La dansa del vestit", null, "The Tyets, Pavvla, Javito & Marcel Lázara"],
  ["Pel camí de ronda", "La casa de la bomba", "Dan Peralbo & el Comboi"],
  ["Viatge d'un savi vilatrista cap enlloc", null, "Xicu"],
  ["El pardal", null, "Alosa"],
  ["Queda't de mi alguna cosa", null, "Marina Rossell"],
];
const AND = { ca: "i", es: "y", en: "and" } as const;
const DISC_TRACKS: Record<Locale, string[]> = Object.fromEntries(
  (["ca", "es", "en"] as const).map((locale) => [
    locale,
    DISC.map(([title, note, who]) => {
      const q = (t: string) => (locale === "en" ? `"${t}"` : `«${t}»`);
      const extra = note === null ? "" : note.startsWith("poema de") ? ` (${locale === "en" ? note.replace("poema de", "poem by") : note})` : ` (${q(note)})`;
      return `${q(title)}${extra}: ${who.replace("&", AND[locale])}`;
    }),
  ]),
) as Record<Locale, string[]>;

const PAPERS = ["Ara", "Diari de Girona", "Diari de Tarragona", "El 9 Nou", "El País", "El Periódico", "El Punt Avui & l'Esportiu", "Enderrock", "La Mañana", "La Vanguardia", "Lecturas", "Mundo Deportivo", "Regió 7", "Segre", "Sport"];
const DISC_PAPERS: Record<Locale, string> = Object.fromEntries(
  (["ca", "es", "en"] as const).map((locale) => {
    const names = PAPERS.map((name) => name.replace("&", AND[locale]));
    return [locale, `${names.slice(0, -1).join(", ")} ${AND[locale]} ${names[names.length - 1]}`];
  }),
) as Record<Locale, string>;
/** "Núm. 654 per Barcelona, Núm. 65 per Girona, Núm. 173 per Lleida, Núm. 176 per Tarragona." */
export const VOLUNTEER_CUTOFF = { barcelona: 654, girona: 65, lleida: 173, tarragona: 176 } as const;

export const MARATO = {
  date: "2026-12-13",
  edition: 35,
  bizum: "33333",
  hub: "https://www.3cat.cat/tv3/marato/",
  hub2026: { ca: "https://www.3cat.cat/tv3/marato/2026/390/", es: "https://www.3cat.cat/tv3/marato/es/2026/390/", en: "https://www.3cat.cat/tv3/marato/en/2026/390/" },
  donate: { ca: "https://www.3cat.cat/tv3/marato/donatiu/", es: "https://www.3cat.cat/tv3/marato/es/donatiu/", en: "https://www.3cat.cat/tv3/marato/en/donatiu/" },
  live: "https://www.3cat.cat/3cat/directes/",
  volunteer: "https://marato.voluntariat.org/",
  activities: "https://www.3cat.cat/tv3/marato/activitats-populars/2026/3630/",
  sessions: "https://www.3cat.cat/tv3/marato/sessions-divulgatives/2026/3690/",
} as const;

const SOURCES: B2Source[] = [
  { name: "La Marató 2026 se centrarà en les malalties neurodegeneratives i neuromusculars", url: "https://www.3cat.cat/3catinfo/la-marato-2026-se-centrara-en-les-malalties-neurodegeneratives-i-neuromusculars/noticia/3392974/", publisher: "3Cat" },
  { name: "La Marató 2026: neurodegeneratives i neuromusculars", url: MARATO.hub2026.ca, publisher: "Fundació La Marató de 3Cat" },
  { name: "La Marató 2026: neurodegenerativas y neuromusculares", url: MARATO.hub2026.es, publisher: "Fundació La Marató de 3Cat" },
  { name: "La Marató 2026: neurodegenerative and neuromuscular diseases", url: MARATO.hub2026.en, publisher: "Fundació La Marató de 3Cat" },
  { name: "Raquel Sans i Miki Núñez presentaran La Marató a TV3 i Roger Escapa, a Catalunya Ràdio", url: "https://www.3cat.cat/3cat/raquel-sans-i-miki-nunez-presentaran-la-marato-a-tv3-i-roger-escapa-a-catalunya-radio/video/6428091/", publisher: "3Cat" },
  { name: "Fes el teu donatiu per a La Marató", url: MARATO.donate.ca, publisher: "Fundació La Marató de 3Cat" },
  { name: "Voluntariat: preinscripcions obertes", url: "https://www.3cat.cat/tv3/marato/voluntariat/2026/3950/", publisher: "Fundació La Marató de 3Cat" },
  { name: "Preinscripcions per a La Marató de 3Cat", url: "https://marato.voluntariat.org/preinscripcions-la-marato-de-3cat", publisher: "Generalitat de Catalunya, Direcció General d'Acció Comunitària i Innovació Social" },
  { name: "Resultat del sorteig del voluntariat per a La Marató de 3Cat 2026", url: "https://marato.voluntariat.org/resultat-del-sorteig-del-voluntariat-la-marato-de-3cat-2026", publisher: "Generalitat de Catalunya, Direcció General d'Acció Comunitària i Innovació Social" },
  { name: "Activitats populars", url: MARATO.activities, publisher: "Fundació La Marató de 3Cat" },
  { name: "Sessions divulgatives", url: MARATO.sessions, publisher: "Fundació La Marató de 3Cat" },
  { name: "La Marató sobre les malalties neurodegeneratives i neuromusculars arribarà a uns 225.000 joves", url: "https://www.3cat.cat/3catinfo/la-marato-sobre-les-malalties-neurodegeneratives-i-neuromusculars-arribara-a-uns-225000-joves/noticia/3435146/", publisher: "3Cat" },
  { name: "Què és La Marató?", url: "https://www.3cat.cat/tv3/marato/que-es-la-marato/", publisher: "Fundació La Marató de 3Cat" },
  { name: "Emissions en directe", url: MARATO.live, publisher: "3Cat" },
  { name: "La 35a edició de La Marató donarà veu a les persones que conviuen amb malalties neurodegeneratives i neuromusculars (10/11/2026)", url: PROGRAMME.news, publisher: "3Cat" },
  { name: "La Marató 2026: públic", url: PROGRAMME.audience, publisher: "Fundació La Marató de 3Cat" },
  { name: "El disc de La Marató 2026", url: PROGRAMME.disc, publisher: "Fundació La Marató de 3Cat" },
  { name: "Ley 49/2002, de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo (artículo 19)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-25039", publisher: "BOE" },
];

export const MARATO_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/la-marato-tv3-3cat",
    title: "La Marató de TV3 2026: diumenge 13 de desembre, a què es dedica i com fer un donatiu",
    seoTitle: "La Marató TV3 2026: 13 de desembre, com donar i desgravar",
    seoDescription:
      "Diumenge 13 de desembre a TV3, per a les malalties neurodegeneratives i neuromusculars. Qui la presenta, on veure-la, Bizum 33333 i quant desgrava donar.",
    excerpt:
      "La Marató 2026, la 35a: quan és, a quines malalties es dedica, qui la presenta, com veure-la i com col·laborar-hi per canals oficials.",
  },
  es: {
    path: "guias/la-marato-tv3-3cat",
    title: "La Marató de TV3 2026: domingo 13 de diciembre, a qué se dedica y cómo donar",
    seoTitle: "La Marató TV3 2026: 13 de diciembre, cómo donar y desgravar",
    seoDescription:
      "Domingo 13 de diciembre en TV3, para las enfermedades neurodegenerativas y neuromusculares. Quién la presenta, dónde verla, Bizum 33333 y cuánto desgrava.",
    excerpt:
      "La Marató 2026, la 35ª: cuándo es, a qué enfermedades se dedica, quién la presenta, cómo verla y cómo colaborar por canales oficiales.",
  },
  en: {
    path: "guides/la-marato-tv3-telethon",
    title: "La Marató 2026: Catalonia's TV3 telethon on Sunday 13 December, cause and how to donate",
    seoTitle: "La Marató 2026: TV3 telethon on 13 December, how to donate",
    seoDescription:
      "TV3 telethon on Sunday 13 December, for neurodegenerative and neuromuscular diseases. Who presents it, where to watch, Bizum code 33333 and the tax relief.",
    excerpt:
      "The 35th La Marató: when it is, which diseases it is for, who presents it, how to watch it and how to give through the official channels.",
  },
};

const RELATED = ["christmasBarcelona", "decemberBridge", "christmas", "shops", "pessebres", "workCalendar"] as const;

const link = (href: string, label: string) => `[${label}](${href})`;

export function buildMaratoBody(locale: Locale): Block[] {
  const day = dayDate(MARATO.date, locale);
  // The lead already names the year in "La Marató de 3Cat 2026".
  const dayNoYear = dayDate(MARATO.date, locale, false);

  if (locale === "ca") {
    return [
      lead(
        `**La Marató de TV3 2026 és el ${dayNoYear} i es dedica a les malalties neurodegeneratives i neuromusculars.** És la ${MARATO.edition}a edició del programa solidari de TV3 i Catalunya Ràdio, que ara es diu La Marató de 3Cat i recull diners per a la recerca: la presenten Raquel Sans i Miki Núñez a TV3, des de les ${PROGRAMME.tv[0].from}, i Roger Escapa a Catalunya Ràdio, des de les ${PROGRAMME.radioFrom}.`,
      ),
      keyFacts("La Marató 2026, d'un cop d'ull", [
        { label: "Data", value: dayDate(MARATO.date, "ca").replace(/^d/, "D") },
        { label: "Edició", value: `${MARATO.edition}a` },
        { label: "Causa", value: "Malalties neurodegeneratives i neuromusculars" },
        { label: "On es veu", value: "TV3 i Catalunya Ràdio, i en directe a 3cat.cat" },
        { label: "Presentadors", value: "Raquel Sans i Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
        { label: "Donatius", value: `Per internet, per Bizum (codi ${MARATO.bizum}) o per transferència, des de la pàgina oficial` },
        { label: "Voluntaris", value: "Preinscripció tancada el 10 de novembre; el sorteig ja s'ha fet i s'assignen les places. Llista d'espera fins al 8 de desembre" },
        { label: "Horari a TV3", value: `De ${PROGRAMME.tv[0].from} a ${PROGRAMME.tv[0].to} des de la Torre de Collserola, i de ${PROGRAMME.tv[1].from} a ${PROGRAMME.tv[1].to} de la matinada des del Parc Audiovisual de Catalunya (Terrassa)` },
        { label: "Catalunya Ràdio", value: `«El suplement» especial des de la Universitat de Lleida, a partir de les ${PROGRAMME.radioFrom}` },
        { label: "Telèfon de donatius", value: `${PROGRAMME.phone}, actiu el diumenge 13 de desembre` },
        { label: "Disc de La Marató", value: `A la venda el ${dayDate(PROGRAMME.discDate, "ca", false)} amb els diaris, en CD per ${PROGRAMME.discPrice} €` },
      ]),
      callout(
        "info",
        "Com tractem les dades",
        `Tot el que hi ha en aquesta pàgina surt de 3Cat i de la Fundació La Marató de 3Cat. L'horari, els escenaris i el telèfon de donatius són els que 3Cat va anunciar el 10 de novembre de 2026 (consultat el ${PROGRAMME_CHECKED_TEXT.ca}). No hi posem xifres de cap altra edició com si fossin d'aquesta.`,
      ),
      ...h2(
        "Quan és La Marató 2026 i a quina hora comença?",
        `El **${day}**. Segons ${link(PROGRAMME.news, "3Cat")}, el programa de televisió començarà a les **${PROGRAMME.tv[0].from}** des de la Torre de Collserola, on s'allargarà fins a les ${PROGRAMME.tv[0].to}, i es reprendrà a les **${PROGRAMME.tv[1].from}** des del Parc Audiovisual de Catalunya, a Terrassa, fins a la ${PROGRAMME.tv[1].to} de la matinada. A Catalunya Ràdio, Roger Escapa presentarà una edició especial d'«El suplement» des de la Universitat de Lleida a partir de les ${PROGRAMME.radioFrom} (consultat el ${PROGRAMME_CHECKED_TEXT.ca}).`,
        "La Torre de Collserola es va inaugurar el 1992, el mateix any que La Marató, i segons 3Cat simbolitza la connexió: com les neurones transmeten informació, la torre fa arribar els senyals de ràdio i televisió al territori.",
        `És el diumenge després del ${b2link("decemberBridge", "ca", "pont de desembre")}. Aquell dia les botigues de Barcelona poden obrir, perquè el 13 de desembre és un dels diumenges d'obertura del calendari comercial del 2026: ho detallem a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
      ),
      ...h2(
        "A què es dedica La Marató 2026?",
        "A les **malalties neurodegeneratives i neuromusculars**. Segons la Fundació, de neurodegeneratives n'hi ha més de 600 de reconegudes i a Catalunya afecten unes 250.000 persones: entre les més freqüents hi ha l'Alzheimer i altres demències, el Parkinson i l'esclerosi múltiple, i entre les menys habituals, els parkinsonismes atípics i la malaltia de Huntington.",
        "Les neuromusculars són més de 150, afecten unes 44.000 persones a Catalunya i més de la meitat dels pacients en tenen els primers símptomes a la infància. Entre elles hi ha la distròfia muscular de Duchenne, la miastènia greu, l'atròfia muscular espinal i l'esclerosi lateral amiotròfica (ELA).",
        "Les neurodegeneratives són progressives i la majoria de les neuromusculars no tenen cura; unes i altres fan perdre autonomia, per això aquesta edició també posa el focus en les persones que en tenen cura. La Fundació destina els donatius íntegrament a la sensibilització i a la recerca. La del 2025 es va dedicar al càncer.",
      ),
      ...h2(
        "Com es pot veure i escoltar La Marató?",
        `A **TV3** i a **Catalunya Ràdio**, i per internet a ${link(MARATO.live, "la secció de directes de 3Cat")}, que emet en directe els canals de TV3 i de Catalunya Ràdio. A TV3 la presenten Raquel Sans i Miki Núñez, i a Catalunya Ràdio, Roger Escapa, segons va anunciar 3Cat el 2 d'octubre de 2026. La plataforma 3Cat i les xarxes socials hi sumaran directes i entrevistes.`,
      ),
      ...h2(
        "Què hi haurà al programa?",
        "Segons 3Cat, la jornada donarà veu a més de 40 testimonis de persones afectades i posarà el focus en les persones cuidadores. Hi haurà divulgació científica amb especialistes i connexions amb les activitats solidàries de tot el territori, amb Helena Garcia Melero, Toni Cruanyes, Marc Ribas i Elisenda Carod fent de reporters, actuacions de The Txandals i una «travessa» especial de Raquel Sans i Miki Núñez.",
        "**El partit de futbol de La Marató** es jugarà a l'estadi Nou Sardenya i es podrà seguir per Esport3, amb connexions dels personatges del «Crackòvia».",
        `**Abans del dia:** el ${dayDate(PROGRAMME.infoKDate, "ca", false)}, l'«InfoK» emetrà un especial sobre aquestes malalties; la sèrie «Com si fos ahir» inclourà una trama sobre l'Alzheimer, i Catalunya Ràdio hi dedicarà continguts tota la setmana.`,
        `**Anar-hi com a públic:** la tarda del 13 de desembre, La Marató convidava el públic al Parc Audiovisual de Catalunya, però les places ja són completes, segons la ${link(PROGRAMME.audience, "pàgina de públic")} (consultada el ${PROGRAMME_CHECKED_TEXT.ca}).`,
      ),
      ...h2(
        "Com fer un donatiu a La Marató 2026",
        `Només pels canals que publica la Fundació a la seva ${link(MARATO.donate.ca, "pàgina de donatius")}. El ${PROGRAMME_CHECKED_TEXT.ca} n'hi havia tres:`,
      ),
      list(
        "**Per internet**, amb el formulari de la mateixa pàgina.",
        `**Per Bizum**, a l'apartat «Donacions» de l'aplicació, amb el codi de La Marató: **${MARATO.bizum}**. Cal escriure el codi postal al camp «concepte».`,
        "**Per transferència bancària** al compte de la Fundació. Copia el número de la pàgina oficial, no d'un missatge ni d'una xarxa social.",
      ),
      ...paras(
        `**Per telèfon, el diumenge 13 de desembre:** al **${PROGRAMME.phone}**, segons ${link(PROGRAMME.news, "3Cat")}. Les trucades les atenen persones voluntàries des de les seus telefòniques de la Fira de Barcelona, el Palau de Congressos de Girona, el Port de Tarragona i la Universitat de Lleida.`,
        "**Desgravació.** La Fundació La Marató de 3Cat és una entitat acollida a la Llei 49/2002. L'article 19 d'aquesta llei permet als contribuents de l'IRPF deduir el 80% dels primers 250 € donats i el 40% de la resta (el 45% si els dos exercicis anteriors es va donar a la Fundació un import igual o superior), amb el límit del 10% de la base liquidable. Per rebre el certificat, la Fundació demana omplir el formulari de la pàgina de donatius abans del 31 de desembre.",
      ),
      ...h2(
        "Com participar-hi: voluntariat i activitats populars",
        `**Voluntariat.** La preinscripció per atendre trucades a les seus telefòniques del 13 de desembre es va tancar el 10 de novembre de 2026, i el sorteig ja s'ha fet: les places s'assignen a partir del número ${VOLUNTEER_CUTOFF.barcelona} a Barcelona, el ${VOLUNTEER_CUTOFF.girona} a Girona, el ${VOLUNTEER_CUTOFF.lleida} a Lleida i el ${VOLUNTEER_CUTOFF.tarragona} a Tarragona, per ordre i segons les preferències de cada persona preinscrita. Qui rep una plaça ho sap per correu electrònic, l'ha d'acceptar en 72 hores i ha de fer una formació en línia; qui no en té queda en una llista d'espera, activa fins al 8 de desembre. Només si queden places vacants s'obrirà, a mitjans de novembre, una inscripció directa: primer per a la llista d'espera i, si encara en sobren, per a tothom. Tot el procés és a ${link(MARATO.volunteer, "marato.voluntariat.org")} (consultat ${VOLUNTEER_CHECKED_TEXT.ca}). El voluntariat el coordina la Direcció General d'Acció Comunitària i Innovació Social, del Departament de Drets Socials i Inclusió.`,
        `**Activitats populars.** Segons la Fundació, cada any s'organitzen més de 3.500 activitats per recaptar diners: concerts, competicions esportives, caminades, dinars... Les entitats que en vulguin fer una la poden inscriure des de la ${link(MARATO.activities, "pàgina d'activitats populars")}, que també té un mapa per comarques amb les ja inscrites.`,
        // 4 Nov 2026: one sentence on the Gran Recapte (13-14 Nov), read from gran-recapte.ts.
        granRecapteMention("ca", "marato"),
      ),
      ...h2(
        "El disc de La Marató 2026",
        `És la 22a edició del disc, i la dirigeix per primera vegada Marc Mateu: onze cançons i un poema d'artistes catalans de diverses generacions. Surt a la venda **un sol dia, el ${dayDate(PROGRAMME.discDate, "ca", false)}**, en CD per ${PROGRAMME.discPrice} € amb aquests diaris i revistes: ${DISC_PAPERS.ca}. També es podrà comprar a la botiga de 3Cat, en CD i en una edició especial en USB, i en digital a Apple Music, segons la ${link(PROGRAMME.disc, "pàgina del disc")} (consultada el ${PROGRAMME_CHECKED_TEXT.ca}).`,
      ),
      list(...DISC_TRACKS.ca),
      ...h2(
        "La Marató a les escoles i instituts",
        "Del 13 d'octubre al 13 de desembre de 2026, la Fundació coordina unes 6.500 sessions divulgatives sobre aquestes malalties en un miler de centres de secundària, batxillerat i cicles formatius i a les unitats d'escolarització compartida (UEC), amb el suport del Departament d'Educació i Formació Professional. Les fan uns 450 professionals de la salut i arribaran a uns 225.000 joves.",
        `Després de la sessió, cada classe pot participar al concurs «Crea per La Marató» amb una peça de qualsevol disciplina artística: música, dansa, teatre, cinema, literatura, dibuix... Els centres i les entitats que vulguin una sessió la poden demanar amb el formulari de la ${link(MARATO.sessions, "pàgina de sessions divulgatives")}.`,
      ),
      ...h2(
        "Què és La Marató?",
        "Un projecte solidari de Televisió de Catalunya i la Fundació La Marató de 3Cat que recull diners per investigar malalties que encara no tenen cura i en fa divulgació. Va començar el 1992: segons la Fundació, TV3 va ser la televisió pública pionera a Espanya a fer un «telethon». Molta gent encara en diu La Marató de TV3; el nom actual és La Marató de 3Cat.",
        `Segons ${link(MARATO.hub2026.ca, "la pàgina de La Marató 2026")}, consultada el 26 d'octubre de 2026, des del 1992 ha recaptat 271,9 milions d'euros i ha finançat 1.084 projectes de recerca.`,
      ),
      ...h2(
        "Més plans per al desembre",
        `El pont, els mercats i el Nadal: ${b2link("decemberBridge", "ca", "el pont de desembre del 2026")}, ${b2link("christmas", "ca", "els mercats de Nadal de Catalunya")}, ${b2link("pessebres", "ca", "els pessebres vivents")} i ${b2link("christmasBarcelona", "ca", "l'encesa de llums de Nadal a Barcelona")}.`,
        `El cap de setmana de La Marató també és de fires de Nadal en molts municipis: les que tenen data oficial, poble a poble, són a [fires de Nadal per municipi](${fairsHubPath("ca")}).`,
      ),
      faq([
        { question: "Quan és La Marató de TV3 2026?", answer: `El ${day}, a TV3 i Catalunya Ràdio.` },
        { question: "A quina hora comença La Marató 2026?", answer: `A TV3, a les ${PROGRAMME.tv[0].from} des de la Torre de Collserola fins a les ${PROGRAMME.tv[0].to}, i de les ${PROGRAMME.tv[1].from} a la ${PROGRAMME.tv[1].to} de la matinada des del Parc Audiovisual de Catalunya, a Terrassa. A Catalunya Ràdio, des de les ${PROGRAMME.radioFrom}, segons 3Cat.` },
        { question: "On es fa La Marató 2026?", answer: "Al matí, des de la Torre de Collserola; a la tarda i al vespre, des del Parc Audiovisual de Catalunya, a Terrassa. Catalunya Ràdio la fa des de la Universitat de Lleida. Les places de públic per a la tarda ja són completes." },
        { question: "On es pot veure La Marató?", answer: "A TV3 i a Catalunya Ràdio, i per internet a la secció de directes de 3Cat (3cat.cat), que emet els dos canals en directe." },
        { question: "A què es dedica La Marató 2026?", answer: "A les malalties neurodegeneratives i neuromusculars, com l'Alzheimer, el Parkinson, l'esclerosi múltiple, l'ELA o les distròfies musculars." },
        { question: "Qui presenta La Marató 2026?", answer: "Raquel Sans i Miki Núñez a TV3, i Roger Escapa a Catalunya Ràdio." },
        { question: "Com puc fer un donatiu a La Marató?", answer: `A la pàgina oficial de donatius de 3Cat: per internet, per Bizum amb el codi ${MARATO.bizum} (a «Donacions») o per transferència al compte que hi publica la Fundació.` },
        { question: "Quin és el telèfon de La Marató 2026?", answer: `El ${PROGRAMME.phone}, actiu el diumenge 13 de desembre, segons 3Cat. Les trucades s'atenen des de les seus de Barcelona, Girona, Tarragona i Lleida. La resta de l'any es pot donar per internet, per Bizum (${MARATO.bizum}) o per transferència.` },
        { question: "Quan surt el disc de La Marató 2026?", answer: `El ${dayDate(PROGRAMME.discDate, "ca", false)}, només aquell dia amb els diaris, en CD per ${PROGRAMME.discPrice} €. També es ven a la botiga de 3Cat (CD i USB) i és a Apple Music.` },
        { question: "Com puc ser voluntari de La Marató 2026?", answer: "La preinscripció es va tancar el 10 de novembre de 2026 i el sorteig de places ja s'ha fet. Només si queden places vacants s'obrirà, a mitjans de novembre, una inscripció directa a marato.voluntariat.org, primer per a la llista d'espera i després per a tothom. També pots col·laborar amb un donatiu o amb una activitat popular." },
        { question: "Els donatius a La Marató desgraven?", answer: "Sí, per als contribuents de l'IRPF: la Llei 49/2002 permet deduir el 80% dels primers 250 € i el 40% de la resta (el 45% per a qui hi va donar el mateix o més els dos anys anteriors). El certificat s'ha de demanar a la Fundació abans del 31 de desembre." },
      ]),
      ...paras(verifiedLine("ca", MARATO_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**La Marató de TV3 2026 es el ${dayNoYear} y se dedica a las enfermedades neurodegenerativas y neuromusculares.** Es la ${MARATO.edition}ª edición del programa solidario de TV3 y Catalunya Ràdio, que ahora se llama La Marató de 3Cat y recauda dinero para la investigación: la presentan Raquel Sans y Miki Núñez en TV3, desde las ${hm(PROGRAMME.tv[0].from)}, y Roger Escapa en Catalunya Ràdio, desde las ${hm(PROGRAMME.radioFrom)}.`,
      ),
      keyFacts("La Marató 2026, de un vistazo", [
        { label: "Fecha", value: dayDate(MARATO.date, "es").replace(/^d/, "D") },
        { label: "Edición", value: `${MARATO.edition}ª` },
        { label: "Causa", value: "Enfermedades neurodegenerativas y neuromusculares" },
        { label: "Dónde verla", value: "TV3 y Catalunya Ràdio, y en directo en 3cat.cat" },
        { label: "Presentadores", value: "Raquel Sans y Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
        { label: "Donativos", value: `Por internet, por Bizum (código ${MARATO.bizum}) o por transferencia, desde la página oficial` },
        { label: "Voluntarios", value: "Preinscripción cerrada el 10 de noviembre; el sorteo ya se ha hecho y se asignan las plazas. Lista de espera hasta el 8 de diciembre" },
        { label: "Horario en TV3", value: `De ${hm(PROGRAMME.tv[0].from)} a ${hm(PROGRAMME.tv[0].to)} desde la Torre de Collserola, y de ${hm(PROGRAMME.tv[1].from)} a ${hm(PROGRAMME.tv[1].to)} de la madrugada desde el Parc Audiovisual de Catalunya (Terrassa)` },
        { label: "Catalunya Ràdio", value: `«El suplement» especial desde la Universitat de Lleida, a partir de las ${hm(PROGRAMME.radioFrom)}` },
        { label: "Teléfono de donativos", value: `${PROGRAMME.phone}, activo el domingo 13 de diciembre` },
        { label: "Disco de La Marató", value: `A la venta el ${dayDate(PROGRAMME.discDate, "es", false)} con los periódicos, en CD por ${PROGRAMME.discPrice} €` },
      ]),
      callout(
        "info",
        "Cómo tratamos los datos",
        `Todo lo que hay en esta página sale de 3Cat y de la Fundació La Marató de 3Cat. El horario, los escenarios y el teléfono de donativos son los que 3Cat anunció el 10 de noviembre de 2026 (consultado el ${PROGRAMME_CHECKED_TEXT.es}). No ponemos cifras de ninguna otra edición como si fueran de esta.`,
      ),
      ...h2(
        "¿Cuándo es La Marató 2026 y a qué hora empieza?",
        `El **${day}**. Según ${link(PROGRAMME.news, "3Cat")}, el programa de televisión empezará a las **${hm(PROGRAMME.tv[0].from)}** desde la Torre de Collserola, donde seguirá hasta las ${hm(PROGRAMME.tv[0].to)}, y se reanudará a las **${hm(PROGRAMME.tv[1].from)}** desde el Parc Audiovisual de Catalunya, en Terrassa, hasta la ${hm(PROGRAMME.tv[1].to)} de la madrugada. En Catalunya Ràdio, Roger Escapa presentará una edición especial de «El suplement» desde la Universitat de Lleida a partir de las ${hm(PROGRAMME.radioFrom)} (consultado el ${PROGRAMME_CHECKED_TEXT.es}).`,
        "La Torre de Collserola se inauguró en 1992, el mismo año que La Marató, y según 3Cat simboliza la conexión: como las neuronas transmiten información, la torre hace llegar las señales de radio y televisión al territorio.",
        `Es el domingo después del ${b2link("decemberBridge", "es", "puente de diciembre")}. Ese día las tiendas de Barcelona pueden abrir, porque el 13 de diciembre es uno de los domingos de apertura del calendario comercial de 2026: lo detallamos en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
      ),
      ...h2(
        "¿A qué se dedica La Marató 2026?",
        "A las **enfermedades neurodegenerativas y neuromusculares**. Según la Fundació, hay más de 600 neurodegenerativas reconocidas y en Cataluña afectan a unas 250.000 personas: entre las más frecuentes están el alzhéimer y otras demencias, el párkinson y la esclerosis múltiple, y entre las menos habituales, los parkinsonismos atípicos y la enfermedad de Huntington.",
        "Las neuromusculares son más de 150, afectan a unas 44.000 personas en Cataluña y más de la mitad de los pacientes tienen los primeros síntomas en la infancia. Entre ellas están la distrofia muscular de Duchenne, la miastenia gravis, la atrofia muscular espinal y la esclerosis lateral amiotrófica (ELA).",
        "Las neurodegenerativas son progresivas y la mayoría de las neuromusculares no tienen cura; unas y otras hacen perder autonomía, por eso esta edición también pone el foco en las personas que las cuidan. La Fundació destina los donativos íntegramente a la sensibilización y a la investigación. La de 2025 se dedicó al cáncer.",
      ),
      ...h2(
        "¿Cómo se puede ver y escuchar La Marató?",
        `En **TV3** y en **Catalunya Ràdio**, y por internet en ${link(MARATO.live, "la sección de directos de 3Cat")}, que emite en directo los canales de TV3 y de Catalunya Ràdio. En TV3 la presentan Raquel Sans y Miki Núñez, y en Catalunya Ràdio, Roger Escapa, según anunció 3Cat el 2 de octubre de 2026. La plataforma 3Cat y las redes sociales sumarán directos y entrevistas.`,
      ),
      ...h2(
        "¿Qué habrá en el programa?",
        "Según 3Cat, la jornada dará voz a más de 40 testimonios de personas afectadas y pondrá el foco en las personas cuidadoras. Habrá divulgación científica con especialistas y conexiones con las actividades solidarias de todo el territorio, con Helena Garcia Melero, Toni Cruanyes, Marc Ribas y Elisenda Carod como reporteros, actuaciones de The Txandals y una «travessa» especial de Raquel Sans y Miki Núñez.",
        "**El partido de fútbol de La Marató** se jugará en el estadio Nou Sardenya y se podrá seguir por Esport3, con conexiones de los personajes de «Crackòvia».",
        `**Antes del día:** el ${dayDate(PROGRAMME.infoKDate, "es", false)}, el «InfoK» emitirá un especial sobre estas enfermedades; la serie «Com si fos ahir» incluirá una trama sobre el alzhéimer, y Catalunya Ràdio les dedicará contenidos toda la semana.`,
        `**Ir como público:** la tarde del 13 de diciembre, La Marató invitaba al público al Parc Audiovisual de Catalunya, pero las plazas ya están completas, según la ${link(PROGRAMME.audience, "página de público")} (consultada el ${PROGRAMME_CHECKED_TEXT.es}).`,
      ),
      ...h2(
        "Cómo hacer un donativo a La Marató 2026",
        `Solo por los canales que publica la Fundació en su ${link(MARATO.donate.es, "página de donativos")}. El ${PROGRAMME_CHECKED_TEXT.es} había tres:`,
      ),
      list(
        "**Por internet**, con el formulario de la misma página.",
        `**Por Bizum**, en el apartado de donaciones de la aplicación, con el código de La Marató: **${MARATO.bizum}**. Hay que escribir el código postal en el campo del concepto.`,
        "**Por transferencia bancaria** a la cuenta de la Fundació. Copia el número de la página oficial, no de un mensaje ni de una red social.",
      ),
      ...paras(
        `**Por teléfono, el domingo 13 de diciembre:** en el **${PROGRAMME.phone}**, según ${link(PROGRAMME.news, "3Cat")}. Las llamadas las atienden personas voluntarias desde los centros telefónicos de la Fira de Barcelona, el Palau de Congressos de Girona, el Port de Tarragona y la Universitat de Lleida.`,
        "**Desgravación.** La Fundació La Marató de 3Cat es una entidad acogida a la Ley 49/2002. El artículo 19 de esa ley permite a los contribuyentes del IRPF deducir el 80% de los primeros 250 € donados y el 40% del resto (el 45% si en los dos ejercicios anteriores se donó a la Fundació un importe igual o superior), con el límite del 10% de la base liquidable. Para recibir el certificado, la Fundació pide rellenar el formulario de la página de donativos antes del 31 de diciembre.",
      ),
      ...h2(
        "Cómo participar: voluntariado y actividades populares",
        `**Voluntariado.** La preinscripción para atender llamadas en los centros telefónicos del 13 de diciembre se cerró el 10 de noviembre de 2026, y el sorteo ya se ha hecho: las plazas se asignan a partir del número ${VOLUNTEER_CUTOFF.barcelona} en Barcelona, el ${VOLUNTEER_CUTOFF.girona} en Girona, el ${VOLUNTEER_CUTOFF.lleida} en Lleida y el ${VOLUNTEER_CUTOFF.tarragona} en Tarragona, por orden y según las preferencias de cada persona preinscrita. Quien recibe una plaza lo sabe por correo electrónico, debe aceptarla en 72 horas y hacer una formación en línea; quien no la tiene queda en una lista de espera, activa hasta el 8 de diciembre. Solo si quedan plazas vacantes se abrirá, a mediados de noviembre, una inscripción directa: primero para la lista de espera y, si aún sobran, para todo el mundo. Todo el proceso está en ${link(MARATO.volunteer, "marato.voluntariat.org")} (consultado ${VOLUNTEER_CHECKED_TEXT.es}). Lo coordina la Direcció General d'Acció Comunitària i Innovació Social, del Departament de Drets Socials i Inclusió.`,
        `**Actividades populares.** Según la Fundació, cada año se organizan más de 3.500 actividades para recaudar dinero: conciertos, competiciones deportivas, caminatas, comidas... Las entidades que quieran hacer una pueden inscribirla desde la ${link(MARATO.activities, "página de actividades populares")}, que también tiene un mapa por comarcas con las ya inscritas.`,
        granRecapteMention("es", "marato"),
      ),
      ...h2(
        "El disco de La Marató 2026",
        `Es la 22.ª edición del disco, y lo dirige por primera vez Marc Mateu: once canciones y un poema de artistas catalanes de varias generaciones. Sale a la venta **un solo día, el ${dayDate(PROGRAMME.discDate, "es", false)}**, en CD por ${PROGRAMME.discPrice} € con estos periódicos y revistas: ${DISC_PAPERS.es}. También se podrá comprar en la tienda de 3Cat, en CD y en una edición especial en USB, y en digital en Apple Music, según la ${link(PROGRAMME.disc, "página del disco")} (consultada el ${PROGRAMME_CHECKED_TEXT.es}). Las canciones, con sus títulos en catalán:`,
      ),
      list(...DISC_TRACKS.es),
      ...h2(
        "La Marató en los colegios e institutos",
        "Del 13 de octubre al 13 de diciembre de 2026, la Fundació coordina unas 6.500 sesiones divulgativas sobre estas enfermedades en un millar de centros de secundaria, bachillerato y formación profesional y en las unidades de escolarización compartida (UEC), con el apoyo del Departament d'Educació i Formació Professional. Las imparten unos 450 profesionales de la salud y llegarán a unos 225.000 jóvenes.",
        `Después de la sesión, cada clase puede participar en el concurso «Crea per La Marató» con una pieza de cualquier disciplina artística: música, danza, teatro, cine, literatura, dibujo... Los centros y entidades que quieran una sesión pueden pedirla con el formulario de la ${link(MARATO.sessions, "página de sesiones divulgativas")}.`,
      ),
      ...h2(
        "¿Qué es La Marató?",
        "Un proyecto solidario de Televisió de Catalunya y la Fundació La Marató de 3Cat que recauda dinero para investigar enfermedades que aún no tienen cura y las divulga. Empezó en 1992: según la Fundació, TV3 fue la televisión pública pionera en España en hacer un «telethon». Mucha gente aún la llama La Marató de TV3; el nombre actual es La Marató de 3Cat.",
        `Según ${link(MARATO.hub2026.es, "la página de La Marató 2026")}, consultada el 26 de octubre de 2026, desde 1992 ha recaudado 271,9 millones de euros y ha financiado 1.084 proyectos de investigación.`,
      ),
      ...h2(
        "Más planes para diciembre",
        `El puente, los mercados y la Navidad: ${b2link("decemberBridge", "es", "el puente de diciembre de 2026")}, ${b2link("christmas", "es", "los mercados de Navidad de Cataluña")}, ${b2link("pessebres", "es", "los belenes vivientes")} y ${b2link("christmasBarcelona", "es", "el encendido de luces de Navidad en Barcelona")}.`,
        `El fin de semana de La Marató también es de ferias de Navidad en muchos municipios: las que tienen fecha oficial, pueblo a pueblo, están en [ferias de Navidad por municipio](${fairsHubPath("es")}).`,
      ),
      faq([
        { question: "¿Cuándo es La Marató de TV3 2026?", answer: `El ${day}, en TV3 y Catalunya Ràdio.` },
        { question: "¿A qué hora empieza La Marató 2026?", answer: `En TV3, a las ${hm(PROGRAMME.tv[0].from)} desde la Torre de Collserola hasta las ${hm(PROGRAMME.tv[0].to)}, y de las ${hm(PROGRAMME.tv[1].from)} a la ${hm(PROGRAMME.tv[1].to)} de la madrugada desde el Parc Audiovisual de Catalunya, en Terrassa. En Catalunya Ràdio, desde las ${hm(PROGRAMME.radioFrom)}, según 3Cat.` },
        { question: "¿Dónde se hace La Marató 2026?", answer: "Por la mañana, desde la Torre de Collserola; por la tarde y la noche, desde el Parc Audiovisual de Catalunya, en Terrassa. Catalunya Ràdio la hace desde la Universitat de Lleida. Las plazas de público para la tarde ya están completas." },
        { question: "¿Dónde se puede ver La Marató?", answer: "En TV3 y en Catalunya Ràdio, y por internet en la sección de directos de 3Cat (3cat.cat), que emite los dos canales en directo." },
        { question: "¿A qué se dedica La Marató 2026?", answer: "A las enfermedades neurodegenerativas y neuromusculares, como el alzhéimer, el párkinson, la esclerosis múltiple, la ELA o las distrofias musculares." },
        { question: "¿Quién presenta La Marató 2026?", answer: "Raquel Sans y Miki Núñez en TV3, y Roger Escapa en Catalunya Ràdio." },
        { question: "¿Cómo puedo hacer un donativo a La Marató?", answer: `En la página oficial de donativos de 3Cat: por internet, por Bizum con el código ${MARATO.bizum} (en el apartado de donaciones) o por transferencia a la cuenta que publica la Fundació.` },
        { question: "¿Cuál es el teléfono de La Marató 2026?", answer: `El ${PROGRAMME.phone}, activo el domingo 13 de diciembre, según 3Cat. Las llamadas se atienden desde los centros de Barcelona, Girona, Tarragona y Lleida. El resto del año se puede donar por internet, por Bizum (${MARATO.bizum}) o por transferencia.` },
        { question: "¿Cuándo sale el disco de La Marató 2026?", answer: `El ${dayDate(PROGRAMME.discDate, "es", false)}, solo ese día con los periódicos, en CD por ${PROGRAMME.discPrice} €. También se vende en la tienda de 3Cat (CD y USB) y está en Apple Music.` },
        { question: "¿Cómo puedo ser voluntario de La Marató 2026?", answer: "La preinscripción se cerró el 10 de noviembre de 2026 y el sorteo de plazas ya se ha hecho. Solo si quedan plazas vacantes se abrirá, a mediados de noviembre, una inscripción directa en marato.voluntariat.org, primero para la lista de espera y después para todo el mundo. También puedes colaborar con un donativo o con una actividad popular." },
        { question: "¿Los donativos a La Marató desgravan?", answer: "Sí, para los contribuyentes del IRPF: la Ley 49/2002 permite deducir el 80% de los primeros 250 € y el 40% del resto (el 45% para quien donó lo mismo o más los dos años anteriores). El certificado se pide a la Fundació antes del 31 de diciembre." },
      ]),
      ...paras(verifiedLine("es", MARATO_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**La Marató de TV3 2026 is on ${dayNoYear} and is dedicated to neurodegenerative and neuromuscular diseases.** It is the ${MARATO.edition}th edition of the TV3 and Catalunya Ràdio telethon, now called La Marató de 3Cat, that raises money for medical research: Raquel Sans and Miki Núñez present it on TV3, from ${hm(PROGRAMME.tv[0].from)}, and Roger Escapa on Catalunya Ràdio, from ${hm(PROGRAMME.radioFrom)}.`,
    ),
    keyFacts("La Marató 2026 at a glance", [
      { label: "Date", value: dayDate(MARATO.date, "en") },
      { label: "Edition", value: `${MARATO.edition}th` },
      { label: "Cause", value: "Neurodegenerative and neuromuscular diseases" },
      { label: "Where to watch", value: "TV3 and Catalunya Ràdio, and live online at 3cat.cat" },
      { label: "Presenters", value: "Raquel Sans and Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
      { label: "Donations", value: `Online, by Bizum (code ${MARATO.bizum}) or by bank transfer, from the official page` },
      { label: "Volunteers", value: "Pre-registration closed on 10 November; the draw has been held and places are being assigned. Waiting list until 8 December" },
      { label: "TV3 times", value: `${hm(PROGRAMME.tv[0].from)} to ${hm(PROGRAMME.tv[0].to)} from the Torre de Collserola, then ${hm(PROGRAMME.tv[1].from)} to ${hm(PROGRAMME.tv[1].to)} am from the Parc Audiovisual de Catalunya (Terrassa)` },
      { label: "Catalunya Ràdio", value: `A special "El suplement" from the University of Lleida, from ${hm(PROGRAMME.radioFrom)}` },
      { label: "Donation phone line", value: `${PROGRAMME.phone}, open on Sunday 13 December` },
      { label: "La Marató album", value: `On sale on ${dayDate(PROGRAMME.discDate, "en", false)} with newspapers, CD at €${PROGRAMME.discPrice}` },
    ]),
    callout(
      "info",
      "How we handle the details",
      `Everything on this page comes from 3Cat and the Fundació La Marató de 3Cat. The times, venues and donation phone number are those 3Cat announced on 10 November 2026 (checked on ${PROGRAMME_CHECKED_TEXT.en}). We never give another edition's figures as this year's.`,
    ),
    ...h2(
      "When is La Marató 2026 and what time does it start?",
      `On **${day}**. According to ${link(PROGRAMME.news, "3Cat")}, the TV programme starts at **${hm(PROGRAMME.tv[0].from)}** from the Torre de Collserola, where it runs until ${hm(PROGRAMME.tv[0].to)}, and resumes at **${hm(PROGRAMME.tv[1].from)}** from the Parc Audiovisual de Catalunya in Terrassa, until ${hm(PROGRAMME.tv[1].to)} am. On Catalunya Ràdio, Roger Escapa presents a special edition of "El suplement" from the University of Lleida from ${hm(PROGRAMME.radioFrom)} (checked on ${PROGRAMME_CHECKED_TEXT.en}).`,
      "The Torre de Collserola, Barcelona's telecommunications tower, opened in 1992, the same year as La Marató; for 3Cat it stands for connection: just as neurons pass on information, the tower carries radio and TV signals across the country.",
      `It is the Sunday after the ${b2link("decemberBridge", "en", "December long weekend")}. Shops in Barcelona may open that day, because 13 December is one of the Sunday opening days in the 2026 shopping calendar: details in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
    ),
    ...h2(
      "What is La Marató 2026 for?",
      "**Neurodegenerative and neuromuscular diseases.** According to the Fundació, there are more than 600 recognised neurodegenerative conditions, affecting about 250,000 people in Catalonia: the commonest include Alzheimer's and other dementias, Parkinson's and multiple sclerosis, and the rarer ones atypical parkinsonism and Huntington's disease.",
      "There are more than 150 neuromuscular diseases, affecting about 44,000 people in Catalonia, and more than half of patients first show symptoms in childhood. They include Duchenne muscular dystrophy, myasthenia gravis, spinal muscular atrophy and amyotrophic lateral sclerosis (ALS).",
      "Neurodegenerative diseases are progressive and most neuromuscular ones have no cure; both take away people's independence, so this edition also looks at the people who care for them. The Fundació puts all donations into awareness and research. The 2025 edition was about cancer.",
    ),
    ...h2(
      "How to watch or listen to La Marató",
      `On **TV3** and **Catalunya Ràdio**, and online in ${link(MARATO.live, "3Cat's live section")}, which streams the TV3 and Catalunya Ràdio channels. Raquel Sans and Miki Núñez present it on TV3 and Roger Escapa on Catalunya Ràdio, 3Cat announced on 2 October 2026. The 3Cat platform and social media add live streams and interviews.`,
    ),
    ...h2(
      "What is on the programme?",
      "According to 3Cat, the day gives a voice to more than 40 people living with these diseases and focuses on carers. There is science explained by specialists and live links to fundraising events across Catalonia, with Helena Garcia Melero, Toni Cruanyes, Marc Ribas and Elisenda Carod as reporters, performances by The Txandals and a special \"travessa\" by Raquel Sans and Miki Núñez.",
      "**La Marató's football match** is played at the Nou Sardenya stadium and shown on Esport3, with links by the characters of the satire show \"Crackòvia\".",
      `**Before the day:** on ${dayDate(PROGRAMME.infoKDate, "en", false)} the children's news show "InfoK" has a special on these diseases; the series "Com si fos ahir" includes an Alzheimer's storyline, and Catalunya Ràdio covers La Marató all week.`,
      `**Going as audience:** La Marató invited the public to the Parc Audiovisual de Catalunya on the afternoon of 13 December, but the places are now full, according to its ${link(PROGRAMME.audience, "audience page")} (checked on ${PROGRAMME_CHECKED_TEXT.en}).`,
    ),
    ...h2(
      "How to donate to La Marató 2026",
      `Only through the channels the Fundació lists on its ${link(MARATO.donate.en, "donation page")}. On ${PROGRAMME_CHECKED_TEXT.en} there were three:`,
    ),
    list(
      "**Online**, with the form on that page.",
      `**By Bizum** (the Spanish mobile payment service), in the app's donations section, with La Marató's code: **${MARATO.bizum}**. Put your postcode in the payment concept field.`,
      "**By bank transfer** to the Fundació's account. Copy the account number from the official page, never from a message or a social media post.",
    ),
    ...paras(
      `**By phone, on Sunday 13 December:** on **${PROGRAMME.phone}**, according to ${link(PROGRAMME.news, "3Cat")}. Volunteers take the calls at phone centres at Fira de Barcelona, the Palau de Congressos de Girona, the Port of Tarragona and the University of Lleida.`,
      "**Tax relief.** The Fundació La Marató de 3Cat is covered by Spain's Law 49/2002. Article 19 of that law lets people who pay Spanish income tax (IRPF) deduct 80% of the first €250 donated and 40% of the rest (45% if you gave the Fundació the same amount or more in each of the two previous years), up to 10% of the taxable base. To get the certificate, the Fundació asks donors to fill in the form on the donation page before 31 December.",
    ),
    ...h2(
      "How to take part: volunteering and local events",
      `**Volunteering.** Pre-registration to answer calls at the phone centres on 13 December closed on 10 November 2026, and the draw has been held: places are assigned from number ${VOLUNTEER_CUTOFF.barcelona} in Barcelona, ${VOLUNTEER_CUTOFF.girona} in Girona, ${VOLUNTEER_CUTOFF.lleida} in Lleida and ${VOLUNTEER_CUTOFF.tarragona} in Tarragona, in order and by each person's preferences. Anyone given a place is told by email, must accept it within 72 hours and then takes an online training course; everyone else goes on a waiting list that runs until 8 December. Only if places are left over will direct registration open in mid-November, first for the waiting list and then, if places remain, for everyone. The whole process is on ${link(MARATO.volunteer, "marato.voluntariat.org")} (checked ${VOLUNTEER_CHECKED_TEXT.en}). Volunteering is coordinated by the Generalitat's Directorate-General for Community Action and Social Innovation (Department of Social Rights and Inclusion).`,
      `**Local events.** According to the Fundació, more than 3,500 fundraising events are organised every year: concerts, sports competitions, walks, lunches and more. Groups that want to run one can register it on the ${link(MARATO.activities, "popular activities page")}, which also has a map of those already registered, by comarca.`,
      granRecapteMention("en", "marato"),
    ),
    ...h2(
      "La Marató's 2026 album",
      `This is the album's 22nd edition, directed for the first time by Marc Mateu: eleven songs and a poem by Catalan artists of several generations. It goes on sale **on one day only, ${dayDate(PROGRAMME.discDate, "en", false)}**, as a €${PROGRAMME.discPrice} CD with these newspapers and magazines: ${DISC_PAPERS.en}. It will also be sold in 3Cat's shop, on CD and as a special USB edition, and digitally on Apple Music, according to the ${link(PROGRAMME.disc, "album page")} (checked on ${PROGRAMME_CHECKED_TEXT.en}). The tracks, with their Catalan titles:`,
    ),
    list(...DISC_TRACKS.en),
    ...h2(
      "La Marató in schools",
      "From 13 October to 13 December 2026 the Fundació is coordinating about 6,500 talks on these diseases in about a thousand secondary schools, sixth-form (batxillerat) and vocational training centres and shared schooling units (UEC), with the support of the Catalan Department of Education and Vocational Training. About 450 health professionals give them, reaching about 225,000 young people.",
      `After the talk, each class can enter the "Crea per La Marató" competition with a piece in any art form: music, dance, theatre, film, writing, drawing... Schools and organisations that want a talk can request one with the form on the ${link(MARATO.sessions, "outreach sessions page")}.`,
    ),
    ...h2(
      "What is La Marató?",
      "A charity project run by Televisió de Catalunya and the Fundació La Marató de 3Cat that raises money for research into diseases that still have no cure, and explains them to the public. It began in 1992: according to the Fundació, TV3 was the pioneering public broadcaster in Spain to run a telethon. Many people still call it La Marató de TV3; its current name is La Marató de 3Cat.",
      `According to ${link(MARATO.hub2026.en, "the La Marató 2026 page")}, checked on 26 October 2026, it has raised €271.9 million since 1992 and funded 1,084 research projects.`,
    ),
    ...h2(
      "More for December",
      `The long weekend, the markets and Christmas: ${b2link("decemberBridge", "en", "the December 2026 long weekend")}, ${b2link("christmas", "en", "Christmas markets in Catalonia")}, ${b2link("pessebres", "en", "living nativity scenes")} and ${b2link("christmasBarcelona", "en", "the Barcelona Christmas lights switch-on")}.`,
      `La Marató's weekend is also a Christmas market weekend in many towns: those with official dates, town by town, are in [Christmas markets by town](${fairsHubPath("en")}).`,
    ),
    faq([
      { question: "When is La Marató de TV3 2026?", answer: `On ${day}, on TV3 and Catalunya Ràdio.` },
      { question: "What time does La Marató 2026 start?", answer: `On TV3 at ${hm(PROGRAMME.tv[0].from)} from the Torre de Collserola until ${hm(PROGRAMME.tv[0].to)}, then from ${hm(PROGRAMME.tv[1].from)} to ${hm(PROGRAMME.tv[1].to)} am from the Parc Audiovisual de Catalunya in Terrassa. On Catalunya Ràdio from ${hm(PROGRAMME.radioFrom)}, according to 3Cat.` },
      { question: "Where is La Marató 2026 held?", answer: "In the morning at the Torre de Collserola; in the afternoon and evening at the Parc Audiovisual de Catalunya in Terrassa. Catalunya Ràdio broadcasts from the University of Lleida. The audience places for the afternoon are full." },
      { question: "Where can I watch La Marató?", answer: "On TV3 and Catalunya Ràdio, and online in 3Cat's live section (3cat.cat), which streams both channels." },
      { question: "What is La Marató 2026 for?", answer: "Neurodegenerative and neuromuscular diseases, such as Alzheimer's, Parkinson's, multiple sclerosis, ALS and the muscular dystrophies." },
      { question: "Who presents La Marató 2026?", answer: "Raquel Sans and Miki Núñez on TV3, and Roger Escapa on Catalunya Ràdio." },
      { question: "How can I donate to La Marató?", answer: `On 3Cat's official donation page: online, by Bizum with code ${MARATO.bizum} (in the donations section) or by bank transfer to the account the Fundació publishes there.` },
      { question: "What is La Marató 2026's phone number?", answer: `${PROGRAMME.phone}, open on Sunday 13 December, according to 3Cat. Calls are taken at centres in Barcelona, Girona, Tarragona and Lleida. The rest of the year you can give online, by Bizum (${MARATO.bizum}) or by bank transfer.` },
      { question: "When does La Marató's 2026 album come out?", answer: `On ${dayDate(PROGRAMME.discDate, "en", false)}, on that day only with newspapers, as a €${PROGRAMME.discPrice} CD. It is also sold in 3Cat's shop (CD and USB) and is on Apple Music.` },
      { question: "How can I volunteer for La Marató 2026?", answer: "Pre-registration closed on 10 November 2026 and the draw for places has been held. Only if places are left over will direct registration open in mid-November at marato.voluntariat.org, first for the waiting list and then for everyone. You can also help with a donation or a local fundraising event." },
      { question: "Are donations to La Marató tax-deductible?", answer: "Yes, for Spanish income tax (IRPF) payers: Law 49/2002 allows a deduction of 80% of the first €250 and 40% of the rest (45% for repeat donors who gave the same or more in the two previous years). Request the certificate from the Fundació before 31 December." },
    ]),
    ...paras(verifiedLine("en", MARATO_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const MARATO_GUIDE: B2Article = {
  key: "marato",
  entryKey: "guide-la-marato-3cat",
  categoryKey: "festivals",
  sources: SOURCES,
  // Reused from the manifest (no new photographs this round). Same alt and
  // caption as SHOPS's lead image: media rows are keyed by file.
  heroKey: SHOPS.heroKey,
  heroAlt: SHOPS.heroAlt,
  heroCaption: SHOPS.heroCaption,
  verifiedAt: MARATO_VERIFIED,
  publishedAt: "2026-10-26T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...MARATO_META[locale], blocks: buildMaratoBody(locale) }]),
  ) as B2Article["editions"],
};
