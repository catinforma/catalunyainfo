import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";

import { dayDate } from "./festive";
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
 * No new photograph: the hero is the shops guide's lead picture (Christmas
 * lights), with the same alt text and caption.
 */

export const MARATO_VERIFIED = "2026-10-26";

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
  { name: "Activitats populars", url: MARATO.activities, publisher: "Fundació La Marató de 3Cat" },
  { name: "Sessions divulgatives", url: MARATO.sessions, publisher: "Fundació La Marató de 3Cat" },
  { name: "La Marató sobre les malalties neurodegeneratives i neuromusculars arribarà a uns 225.000 joves", url: "https://www.3cat.cat/3catinfo/la-marato-sobre-les-malalties-neurodegeneratives-i-neuromusculars-arribara-a-uns-225000-joves/noticia/3435146/", publisher: "3Cat" },
  { name: "Què és La Marató?", url: "https://www.3cat.cat/tv3/marato/que-es-la-marato/", publisher: "Fundació La Marató de 3Cat" },
  { name: "Emissions en directe", url: MARATO.live, publisher: "3Cat" },
  { name: "Ley 49/2002, de régimen fiscal de las entidades sin fines lucrativos y de los incentivos fiscales al mecenazgo (artículo 19)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2002-25039", publisher: "BOE" },
];

export const MARATO_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/la-marato-tv3-3cat",
    title: "La Marató de TV3 2026: diumenge 13 de desembre, a què es dedica i com fer un donatiu",
    seoTitle: "La Marató de TV3 2026: 13 de desembre, causa i donatius",
    seoDescription:
      "La Marató de TV3 2026 és el diumenge 13 de desembre i es dedica a les malalties neurodegeneratives i neuromusculars. Com veure-la i fer un donatiu.",
    excerpt:
      "La Marató 2026, la 35a: quan és, a quines malalties es dedica, qui la presenta, com veure-la i com col·laborar-hi per canals oficials.",
  },
  es: {
    path: "guias/la-marato-tv3-3cat",
    title: "La Marató de TV3 2026: domingo 13 de diciembre, a qué se dedica y cómo donar",
    seoTitle: "La Marató de TV3 2026: 13 de diciembre, causa y cómo donar",
    seoDescription:
      "La Marató de TV3 2026 es el domingo 13 de diciembre y se dedica a las enfermedades neurodegenerativas y neuromusculares. Cómo verla y cómo donar.",
    excerpt:
      "La Marató 2026, la 35ª: cuándo es, a qué enfermedades se dedica, quién la presenta, cómo verla y cómo colaborar por canales oficiales.",
  },
  en: {
    path: "guides/la-marato-tv3-telethon",
    title: "La Marató 2026: Catalonia's TV3 telethon on Sunday 13 December, cause and how to donate",
    seoTitle: "La Marató 2026: TV3 telethon on 13 December, how to donate",
    seoDescription:
      "La Marató de 3Cat 2026, Catalonia's TV3 telethon, is on Sunday 13 December, for neurodegenerative and neuromuscular diseases. How to watch and donate.",
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
        `**La Marató de TV3 2026 és el ${dayNoYear} i es dedica a les malalties neurodegeneratives i neuromusculars.** És la ${MARATO.edition}a edició del programa solidari de TV3 i Catalunya Ràdio, que ara es diu La Marató de 3Cat i recull diners per a la recerca: la presenten Raquel Sans i Miki Núñez a TV3 i Roger Escapa a Catalunya Ràdio.`,
      ),
      keyFacts("La Marató 2026, d'un cop d'ull", [
        { label: "Data", value: dayDate(MARATO.date, "ca").replace(/^d/, "D") },
        { label: "Edició", value: `${MARATO.edition}a` },
        { label: "Causa", value: "Malalties neurodegeneratives i neuromusculars" },
        { label: "On es veu", value: "TV3 i Catalunya Ràdio, i en directe a 3cat.cat" },
        { label: "Presentadors", value: "Raquel Sans i Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
        { label: "Donatius", value: `Per internet, per Bizum (codi ${MARATO.bizum}) o per transferència, des de la pàgina oficial` },
        { label: "Horari del programa", value: "Encara no s'ha publicat" },
      ]),
      callout(
        "info",
        "Com tractem les dades",
        "Tot el que hi ha en aquesta pàgina surt de 3Cat i de la Fundació La Marató de 3Cat. L'horari del programa i el telèfon de donatius del dia encara no s'han publicat: els afegirem quan siguin al web de La Marató. No hi posem xifres de cap altra edició com si fossin d'aquesta.",
      ),
      ...h2(
        "Quan és La Marató 2026?",
        `El **${day}**. Segons la Fundació, el programa de televisió i ràdio dura unes quinze hores en directe; l'hora d'inici i la graella del 2026 encara no s'han publicat (consultat el 30 d'octubre de 2026).`,
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
        `A **TV3** i a **Catalunya Ràdio**, i per internet a ${link(MARATO.live, "la secció de directes de 3Cat")}, que emet en directe els canals de TV3 i de Catalunya Ràdio. A TV3 la presenten Raquel Sans i Miki Núñez, i a Catalunya Ràdio, Roger Escapa, segons va anunciar 3Cat el 2 d'octubre de 2026.`,
      ),
      ...h2(
        "Com fer un donatiu a La Marató 2026",
        `Només pels canals que publica la Fundació a la seva ${link(MARATO.donate.ca, "pàgina de donatius")}. El 26 d'octubre de 2026 n'hi havia tres:`,
      ),
      list(
        "**Per internet**, amb el formulari de la mateixa pàgina.",
        `**Per Bizum**, a l'apartat «Donacions» de l'aplicació, amb el codi de La Marató: **${MARATO.bizum}**. Cal escriure el codi postal al camp «concepte».`,
        "**Per transferència bancària** al compte de la Fundació. Copia el número de la pàgina oficial, no d'un missatge ni d'una xarxa social.",
      ),
      ...paras(
        "El dia del programa, La Marató obre seus telefòniques a la Fira de Barcelona, al Palau de Congressos de Girona, al Port de Tarragona i a la Universitat de Lleida per atendre les trucades de donatius. El número encara no és a la pàgina de donatius; fes servir només el que publiqui 3Cat.",
        "**Desgravació.** La Fundació La Marató de 3Cat és una entitat acollida a la Llei 49/2002. L'article 19 d'aquesta llei permet als contribuents de l'IRPF deduir el 80% dels primers 250 € donats i el 40% de la resta (el 45% si els dos exercicis anteriors es va donar a la Fundació un import igual o superior), amb el límit del 10% de la base liquidable. Per rebre el certificat, la Fundació demana omplir el formulari de la pàgina de donatius abans del 31 de desembre.",
      ),
      ...h2(
        "Com participar-hi: voluntariat i activitats populars",
        `**Voluntariat.** Qui vulgui atendre trucades a les seus telefòniques del 13 de desembre es pot preinscriure a ${link(MARATO.volunteer, "marato.voluntariat.org")} des de les 10 h del 20 d'octubre fins a les 10 h del 10 de novembre de 2026; les places se sortegen entre totes les persones preinscrites. El voluntariat el coordina la Direcció General d'Acció Comunitària i Innovació Social, del Departament de Drets Socials i Inclusió.`,
        `**Activitats populars.** Segons la Fundació, cada any s'organitzen més de 3.500 activitats per recaptar diners: concerts, competicions esportives, caminades, dinars... Les entitats que en vulguin fer una la poden inscriure des de la ${link(MARATO.activities, "pàgina d'activitats populars")}, que també té un mapa per comarques amb les ja inscrites.`,
      ),
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
        { question: "A quina hora comença La Marató 2026?", answer: "3Cat encara no ho ha publicat (consultat el 30 d'octubre de 2026). Segons la Fundació, el programa dura unes quinze hores en directe, a TV3 i a Catalunya Ràdio." },
        { question: "On es pot veure La Marató?", answer: "A TV3 i a Catalunya Ràdio, i per internet a la secció de directes de 3Cat (3cat.cat), que emet els dos canals en directe." },
        { question: "A què es dedica La Marató 2026?", answer: "A les malalties neurodegeneratives i neuromusculars, com l'Alzheimer, el Parkinson, l'esclerosi múltiple, l'ELA o les distròfies musculars." },
        { question: "Qui presenta La Marató 2026?", answer: "Raquel Sans i Miki Núñez a TV3, i Roger Escapa a Catalunya Ràdio." },
        { question: "Com puc fer un donatiu a La Marató?", answer: `A la pàgina oficial de donatius de 3Cat: per internet, per Bizum amb el codi ${MARATO.bizum} (a «Donacions») o per transferència al compte que hi publica la Fundació.` },
        { question: "Quin és el telèfon de La Marató 2026?", answer: "El 30 d'octubre de 2026 encara no s'havia publicat. Les trucades del dia s'atenen a les seus de Barcelona, Girona, Tarragona i Lleida; fes servir només el número que publiqui 3Cat." },
        { question: "Com puc ser voluntari de La Marató 2026?", answer: "Preinscrivint-te a marato.voluntariat.org fins a les 10 h del 10 de novembre de 2026; les places per atendre trucades a les seus telefòniques el dia de La Marató se sortegen entre totes les persones preinscrites." },
        { question: "Els donatius a La Marató desgraven?", answer: "Sí, per als contribuents de l'IRPF: la Llei 49/2002 permet deduir el 80% dels primers 250 € i el 40% de la resta (el 45% per a qui hi va donar el mateix o més els dos anys anteriors). El certificat s'ha de demanar a la Fundació abans del 31 de desembre." },
      ]),
      ...paras(verifiedLine("ca", MARATO_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**La Marató de TV3 2026 es el ${dayNoYear} y se dedica a las enfermedades neurodegenerativas y neuromusculares.** Es la ${MARATO.edition}ª edición del programa solidario de TV3 y Catalunya Ràdio, que ahora se llama La Marató de 3Cat y recauda dinero para la investigación: la presentan Raquel Sans y Miki Núñez en TV3 y Roger Escapa en Catalunya Ràdio.`,
      ),
      keyFacts("La Marató 2026, de un vistazo", [
        { label: "Fecha", value: dayDate(MARATO.date, "es").replace(/^d/, "D") },
        { label: "Edición", value: `${MARATO.edition}ª` },
        { label: "Causa", value: "Enfermedades neurodegenerativas y neuromusculares" },
        { label: "Dónde verla", value: "TV3 y Catalunya Ràdio, y en directo en 3cat.cat" },
        { label: "Presentadores", value: "Raquel Sans y Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
        { label: "Donativos", value: `Por internet, por Bizum (código ${MARATO.bizum}) o por transferencia, desde la página oficial` },
        { label: "Horario del programa", value: "Aún no se ha publicado" },
      ]),
      callout(
        "info",
        "Cómo tratamos los datos",
        "Todo lo que hay en esta página sale de 3Cat y de la Fundació La Marató de 3Cat. El horario del programa y el teléfono de donativos del día aún no se han publicado: los añadiremos cuando estén en la web de La Marató. No ponemos cifras de ninguna otra edición como si fueran de esta.",
      ),
      ...h2(
        "¿Cuándo es La Marató 2026?",
        `El **${day}**. Según la Fundació, el programa de televisión y radio dura unas quince horas en directo; la hora de inicio y la parrilla de 2026 aún no se han publicado (consultado el 30 de octubre de 2026).`,
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
        `En **TV3** y en **Catalunya Ràdio**, y por internet en ${link(MARATO.live, "la sección de directos de 3Cat")}, que emite en directo los canales de TV3 y de Catalunya Ràdio. En TV3 la presentan Raquel Sans y Miki Núñez, y en Catalunya Ràdio, Roger Escapa, según anunció 3Cat el 2 de octubre de 2026.`,
      ),
      ...h2(
        "Cómo hacer un donativo a La Marató 2026",
        `Solo por los canales que publica la Fundació en su ${link(MARATO.donate.es, "página de donativos")}. El 26 de octubre de 2026 había tres:`,
      ),
      list(
        "**Por internet**, con el formulario de la misma página.",
        `**Por Bizum**, en el apartado de donaciones de la aplicación, con el código de La Marató: **${MARATO.bizum}**. Hay que escribir el código postal en el campo del concepto.`,
        "**Por transferencia bancaria** a la cuenta de la Fundació. Copia el número de la página oficial, no de un mensaje ni de una red social.",
      ),
      ...paras(
        "El día del programa, La Marató abre centros telefónicos en la Fira de Barcelona, el Palau de Congressos de Girona, el Port de Tarragona y la Universitat de Lleida para atender las llamadas de donativos. El número aún no está en la página de donativos; usa solo el que publique 3Cat.",
        "**Desgravación.** La Fundació La Marató de 3Cat es una entidad acogida a la Ley 49/2002. El artículo 19 de esa ley permite a los contribuyentes del IRPF deducir el 80% de los primeros 250 € donados y el 40% del resto (el 45% si en los dos ejercicios anteriores se donó a la Fundació un importe igual o superior), con el límite del 10% de la base liquidable. Para recibir el certificado, la Fundació pide rellenar el formulario de la página de donativos antes del 31 de diciembre.",
      ),
      ...h2(
        "Cómo participar: voluntariado y actividades populares",
        `**Voluntariado.** Quien quiera atender llamadas en los centros telefónicos del 13 de diciembre puede preinscribirse en ${link(MARATO.volunteer, "marato.voluntariat.org")} desde las 10 h del 20 de octubre hasta las 10 h del 10 de noviembre de 2026; las plazas se sortean entre todas las personas preinscritas. Lo coordina la Direcció General d'Acció Comunitària i Innovació Social, del Departament de Drets Socials i Inclusió.`,
        `**Actividades populares.** Según la Fundació, cada año se organizan más de 3.500 actividades para recaudar dinero: conciertos, competiciones deportivas, caminatas, comidas... Las entidades que quieran hacer una pueden inscribirla desde la ${link(MARATO.activities, "página de actividades populares")}, que también tiene un mapa por comarcas con las ya inscritas.`,
      ),
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
        { question: "¿A qué hora empieza La Marató 2026?", answer: "3Cat aún no lo ha publicado (consultado el 30 de octubre de 2026). Según la Fundació, el programa dura unas quince horas en directo, en TV3 y en Catalunya Ràdio." },
        { question: "¿Dónde se puede ver La Marató?", answer: "En TV3 y en Catalunya Ràdio, y por internet en la sección de directos de 3Cat (3cat.cat), que emite los dos canales en directo." },
        { question: "¿A qué se dedica La Marató 2026?", answer: "A las enfermedades neurodegenerativas y neuromusculares, como el alzhéimer, el párkinson, la esclerosis múltiple, la ELA o las distrofias musculares." },
        { question: "¿Quién presenta La Marató 2026?", answer: "Raquel Sans y Miki Núñez en TV3, y Roger Escapa en Catalunya Ràdio." },
        { question: "¿Cómo puedo hacer un donativo a La Marató?", answer: `En la página oficial de donativos de 3Cat: por internet, por Bizum con el código ${MARATO.bizum} (en el apartado de donaciones) o por transferencia a la cuenta que publica la Fundació.` },
        { question: "¿Cuál es el teléfono de La Marató 2026?", answer: "El 30 de octubre de 2026 aún no se había publicado. Las llamadas del día se atienden en los centros de Barcelona, Girona, Tarragona y Lleida; usa solo el número que publique 3Cat." },
        { question: "¿Cómo puedo ser voluntario de La Marató 2026?", answer: "Preinscribiéndote en marato.voluntariat.org hasta las 10 h del 10 de noviembre de 2026; las plazas para atender llamadas en los centros telefónicos el día de La Marató se sortean entre todas las personas preinscritas." },
        { question: "¿Los donativos a La Marató desgravan?", answer: "Sí, para los contribuyentes del IRPF: la Ley 49/2002 permite deducir el 80% de los primeros 250 € y el 40% del resto (el 45% para quien donó lo mismo o más los dos años anteriores). El certificado se pide a la Fundació antes del 31 de diciembre." },
      ]),
      ...paras(verifiedLine("es", MARATO_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**La Marató de TV3 2026 is on ${dayNoYear} and is dedicated to neurodegenerative and neuromuscular diseases.** It is the ${MARATO.edition}th edition of the TV3 and Catalunya Ràdio telethon, now called La Marató de 3Cat, that raises money for medical research: Raquel Sans and Miki Núñez present it on TV3, Roger Escapa on Catalunya Ràdio.`,
    ),
    keyFacts("La Marató 2026 at a glance", [
      { label: "Date", value: dayDate(MARATO.date, "en") },
      { label: "Edition", value: `${MARATO.edition}th` },
      { label: "Cause", value: "Neurodegenerative and neuromuscular diseases" },
      { label: "Where to watch", value: "TV3 and Catalunya Ràdio, and live online at 3cat.cat" },
      { label: "Presenters", value: "Raquel Sans and Miki Núñez (TV3); Roger Escapa (Catalunya Ràdio)" },
      { label: "Donations", value: `Online, by Bizum (code ${MARATO.bizum}) or by bank transfer, from the official page` },
      { label: "Programme times", value: "Not published yet" },
    ]),
    callout(
      "info",
      "How we handle the details",
      "Everything on this page comes from 3Cat and the Fundació La Marató de 3Cat. The programme times and the donation phone number for the day have not been published yet; we will add them once they are on La Marató's website. We never give another edition's figures as this year's.",
    ),
    ...h2(
      "When is La Marató 2026?",
      `On **${day}**. According to the Fundació, the TV and radio programme runs for about fifteen hours live; the 2026 start time and running order have not been published (checked on 30 October 2026).`,
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
      `On **TV3** and **Catalunya Ràdio**, and online in ${link(MARATO.live, "3Cat's live section")}, which streams the TV3 and Catalunya Ràdio channels. Raquel Sans and Miki Núñez present it on TV3 and Roger Escapa on Catalunya Ràdio, 3Cat announced on 2 October 2026.`,
    ),
    ...h2(
      "How to donate to La Marató 2026",
      `Only through the channels the Fundació lists on its ${link(MARATO.donate.en, "donation page")}. On 26 October 2026 there were three:`,
    ),
    list(
      "**Online**, with the form on that page.",
      `**By Bizum** (the Spanish mobile payment service), in the app's donations section, with La Marató's code: **${MARATO.bizum}**. Put your postcode in the payment concept field.`,
      "**By bank transfer** to the Fundació's account. Copy the account number from the official page, never from a message or a social media post.",
    ),
    ...paras(
      "On the day, La Marató runs phone centres at Fira de Barcelona, the Palau de Congressos de Girona, the Port of Tarragona and the University of Lleida to take donation calls. The number is not on the donation page yet; only use the one 3Cat publishes.",
      "**Tax relief.** The Fundació La Marató de 3Cat is covered by Spain's Law 49/2002. Article 19 of that law lets people who pay Spanish income tax (IRPF) deduct 80% of the first €250 donated and 40% of the rest (45% if you gave the Fundació the same amount or more in each of the two previous years), up to 10% of the taxable base. To get the certificate, the Fundació asks donors to fill in the form on the donation page before 31 December.",
    ),
    ...h2(
      "How to take part: volunteering and local events",
      `**Volunteering.** Anyone who wants to answer calls at the phone centres on 13 December can pre-register at ${link(MARATO.volunteer, "marato.voluntariat.org")} until 10:00 on 10 November 2026 (registration opened at 10:00 on 20 October); places are drawn by lot among everyone who signs up. Volunteering is coordinated by the Generalitat's Directorate-General for Community Action and Social Innovation (Department of Social Rights and Inclusion).`,
      `**Local events.** According to the Fundació, more than 3,500 fundraising events are organised every year: concerts, sports competitions, walks, lunches and more. Groups that want to run one can register it on the ${link(MARATO.activities, "popular activities page")}, which also has a map of those already registered, by comarca.`,
    ),
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
      { question: "What time does La Marató 2026 start?", answer: "3Cat has not published it yet (checked on 30 October 2026). According to the Fundació, the programme runs for about fifteen hours live on TV3 and Catalunya Ràdio." },
      { question: "Where can I watch La Marató?", answer: "On TV3 and Catalunya Ràdio, and online in 3Cat's live section (3cat.cat), which streams both channels." },
      { question: "What is La Marató 2026 for?", answer: "Neurodegenerative and neuromuscular diseases, such as Alzheimer's, Parkinson's, multiple sclerosis, ALS and the muscular dystrophies." },
      { question: "Who presents La Marató 2026?", answer: "Raquel Sans and Miki Núñez on TV3, and Roger Escapa on Catalunya Ràdio." },
      { question: "How can I donate to La Marató?", answer: `On 3Cat's official donation page: online, by Bizum with code ${MARATO.bizum} (in the donations section) or by bank transfer to the account the Fundació publishes there.` },
      { question: "What is La Marató 2026's phone number?", answer: "It had not been published on 30 October 2026. Calls on the day are taken at centres in Barcelona, Girona, Tarragona and Lleida; only use the number 3Cat publishes." },
      { question: "How can I volunteer for La Marató 2026?", answer: "Pre-register at marato.voluntariat.org before 10:00 on 10 November 2026; places answering calls at the phone centres on the day are drawn by lot among everyone who signs up." },
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
