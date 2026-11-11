import { municipalities, regionalDays } from "@/lib/programmatic/holidays/data";
import { BOE_REF } from "@/lib/programmatic/spain-2027/sources";
import { caDe } from "@/lib/programmatic/holidays/names";
import { CITIES } from "@/lib/programmatic/spain-2027/cities";

import { EMBED_YEAR, type EmbedLocale } from "./places";

/**
 * Words of the page that hands out the widget ("Posa el calendari laboral
 * 2027 al teu web"). It states what the widget shows and how it behaves,
 * nothing else: every date stays in the widget, read from the data.
 */

export interface WidgetCopy {
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  lead: string;
  picker: string;
  previewTitle: string;
  codeTitle: string;
  codeHelp: string;
  copy: string;
  copied: string;
  linkTitle: string;
  linkHelp: string;
  /** Title of the <iframe> and anchor of the link in the code: "Calendari laboral 2027: Barcelona". */
  snippetTitle: string;
  showsTitle: string;
  shows: string[];
  updates: string;
  termsTitle: string;
  terms: string[];
  moreTitle: string;
  /** The link from the 2027 hubs and the town pages; `ctaPlace` takes the name as the page prints it. */
  cta: string;
  ctaPlace: (place: string) => string;
  /** Before `cta` on the hubs. */
  ctaLead: string;
}

export function widgetCopy(locale: EmbedLocale): WidgetCopy {
  const towns = municipalities().length;
  const cities = CITIES.length;
  const regional = regionalDays(EMBED_YEAR).length;
  const Y = EMBED_YEAR;
  if (locale === "ca") {
    return {
      title: `Posa el calendari laboral ${Y} al teu web`,
      description: `Calendari de festius del ${Y} per al web de l'ajuntament, l'escola o l'entitat: ${towns} municipis de Catalunya i ${cities} ciutats d'Espanya, amb la font oficial. Gratuït.`,
      h1: `Posa el calendari laboral ${Y} al teu web`,
      breadcrumb: "Al teu web",
      lead: `Un calendari de festius del ${Y} per posar al web de l'ajuntament, l'escola, l'entitat o el mitjà local: tria el municipi, copia el codi i enganxa'l a la pàgina. Hi ha els ${towns} municipis de Catalunya amb festes locals i ${cities} ciutats de la resta d'Espanya.`,
      picker: "Municipi o ciutat",
      previewTitle: "Com es veu",
      codeTitle: "El codi per enganxar",
      codeHelp: "Copia'l i enganxa'l on el teu web accepti HTML (a WordPress, en un bloc «HTML personalitzat»).",
      copy: "Copia el codi",
      copied: "Copiat",
      linkTitle: "Si el teu web no accepta iframes: un enllaç",
      linkHelp: "Un enllaç normal a la pàgina del calendari, per a webs i butlletins que no deixen incrustar res.",
      snippetTitle: `Calendari laboral ${Y}`,
      showsTitle: "Què hi surt",
      shows: [
        `A Catalunya, els ${regional} festius de tot Catalunya del ${Y} (Ordre EMT/52/2026); a la resta d'Espanya, els festius estatals i autonòmics del BOE (${BOE_REF.id}).`,
        "Els festius locals, només quan són oficials: a Catalunya, quan l'ordre del DOGC els publica o, abans, si l'ajuntament ja els ha aprovat, marcats «pendent del DOGC»; a la resta d'Espanya, quan els publica el butlletí oficial. Mentrestant, el calendari diu que encara no s'han publicat.",
        "La font de cada llista i el dia que la vam llegir.",
      ],
      updates: "S'actualitza sol: quan surtin els festius locals, apareixeran al teu web sense tocar el codi.",
      termsTitle: "Condicions",
      terms: [
        "És gratuït. Només et demanem que mantinguis l'enllaç «Font: CatalunyaInfo».",
        "No porta publicitat, ni galetes, ni scripts, ni cap seguiment: és una pàgina HTML estàtica.",
      ],
      moreTitle: "Els calendaris complets",
      cta: `Posa el calendari laboral ${Y} al teu web`,
      ctaPlace: (place) => `Posa el calendari laboral ${Y} ${caDe(place)} al teu web`,
      ctaLead: "Per al web d'un ajuntament, una escola o una entitat:",
    };
  }
  if (locale === "es") {
    return {
      title: `Pon el calendario laboral ${Y} en tu web`,
      description: `Calendario de festivos de ${Y} para la web del ayuntamiento, el colegio o la asociación: ${towns} municipios de Cataluña y ${cities} ciudades de España, con la fuente oficial. Gratis.`,
      h1: `Pon el calendario laboral ${Y} en tu web`,
      breadcrumb: "En tu web",
      lead: `Un calendario de festivos de ${Y} para poner en la web del ayuntamiento, el colegio, la asociación o el medio local: elige el municipio, copia el código y pégalo en la página. Están los ${towns} municipios de Cataluña con fiestas locales y ${cities} ciudades del resto de España.`,
      picker: "Municipio o ciudad",
      previewTitle: "Cómo se ve",
      codeTitle: "El código para pegar",
      codeHelp: "Cópialo y pégalo donde tu web acepte HTML (en WordPress, en un bloque «HTML personalizado»).",
      copy: "Copiar el código",
      copied: "Copiado",
      linkTitle: "Si tu web no acepta iframes: un enlace",
      linkHelp: "Un enlace normal a la página del calendario, para webs y boletines que no dejan insertar nada.",
      snippetTitle: `Calendario laboral ${Y}`,
      showsTitle: "Qué muestra",
      shows: [
        `En Cataluña, los ${regional} festivos de toda Cataluña de ${Y} (Orden EMT/52/2026); en el resto de España, los festivos nacionales y autonómicos del BOE (${BOE_REF.id}).`,
        "Los festivos locales, solo cuando son oficiales: en Cataluña, cuando la orden del DOGC los publica o, antes, si el ayuntamiento ya los ha aprobado, marcados «pendiente del DOGC»; en el resto de España, cuando los publica el boletín oficial. Mientras tanto, el calendario dice que todavía no se han publicado.",
        "La fuente de cada lista y el día en que la leímos.",
      ],
      updates: "Se actualiza solo: cuando salgan los festivos locales, aparecerán en tu web sin tocar el código.",
      termsTitle: "Condiciones",
      terms: [
        "Es gratis. Solo te pedimos que mantengas el enlace «Fuente: CatalunyaInfo».",
        "No lleva publicidad, ni cookies, ni scripts, ni ningún seguimiento: es una página HTML estática.",
      ],
      moreTitle: "Los calendarios completos",
      cta: `Pon el calendario laboral ${Y} en tu web`,
      ctaPlace: (place) => `Pon el calendario laboral ${Y} de ${place} en tu web`,
      ctaLead: "Para la web de un ayuntamiento, un colegio o una asociación:",
    };
  }
  return {
    title: `Add the ${Y} holiday calendar to your website`,
    description: `A ${Y} public holiday calendar for your council, school or association website: ${towns} towns in Catalonia and ${cities} cities in Spain, with the official source. Free.`,
    h1: `Add the ${Y} holiday calendar to your website`,
    breadcrumb: "On your website",
    lead: `A ${Y} public holiday calendar for the website of a council, a school, an association or local media: pick the town, copy the code and paste it into the page. It covers the ${towns} municipalities of Catalonia with local holidays and ${cities} cities in the rest of Spain.`,
    picker: "Town or city",
    previewTitle: "What it looks like",
    codeTitle: "The code to paste",
    codeHelp: "Copy it and paste it wherever your site accepts HTML (in WordPress, a “Custom HTML” block).",
    copy: "Copy the code",
    copied: "Copied",
    linkTitle: "If your site does not accept iframes: a link",
    linkHelp: "A plain link to the calendar page, for sites and newsletters that allow no embeds.",
    snippetTitle: `${Y} public holidays`,
    showsTitle: "What it shows",
    shows: [
      `In Catalonia, the ${regional} Catalonia-wide holidays of ${Y} (Order EMT/52/2026); in the rest of Spain, the national and regional holidays in the BOE (${BOE_REF.id}).`,
      "The local holidays, only once they are official: in Catalonia, when the DOGC order publishes them or, before that, when the council has approved them, marked “pending the DOGC order”; in the rest of Spain, when the official bulletin publishes them. Until then, the calendar says they are not out yet.",
      "The source of each list and the day we read it.",
    ],
    updates: "It updates itself: when the local holidays come out, they appear on your site without touching the code.",
    termsTitle: "Terms",
    terms: [
      "It is free. We only ask you to keep the “Source: CatalunyaInfo” link.",
      "No ads, no cookies, no scripts, no tracking of any kind: it is a static HTML page.",
    ],
    moreTitle: "The full calendars",
    cta: `Add the ${Y} holiday calendar to your website`,
    ctaPlace: (place) => `Add the ${Y} holiday calendar for ${place} to your website`,
    ctaLead: "For a council, school or association website:",
  };
}
