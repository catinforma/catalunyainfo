import type { CalcLocale } from "@/lib/programmatic/calculators/paths";

/**
 * "En Cataluña: el SOC y el DARDO" (27 Nov 2026, batch 8J), on the paro
 * calculator and the subsidy checker. In Catalonia the benefit is paid by the
 * SEPE but the job-seeker registration (required to get it) is the Servei
 * Públic d'Ocupació de Catalunya's. Source, read 27 Nov 2026 01:59 UTC with
 * curl + grep of the quoted words:
 *   https://serveiocupacio.gencat.cat/ca/tramits/tramits-persones/inscriu-te-com-a-demandant-docupacio/
 *   «La inscripció com a demandant d'ocupació és gratuïta i voluntària, amb
 *   l'excepció de les persones perceptores de prestacions per desocupació per
 *   a les qui és un tràmit obligatori»; «Si és la primera vegada que es fa la
 *   inscripció i es disposa del DNI, es pot fer per internet a través del
 *   tràmit telemàtic»; «Quan finalitza la inscripció s'obté el DARDO»; «cal
 *   completar la informació del perfil professional en un termini de 30 dies,
 *   ja que en cas contrari la demanda d'ocupació es donaria de baixa»; «Les
 *   persones estrangeres que disposin d'un NIE […] poden sol·licitar la
 *   inscripció mitjançant el telèfon del SOC 930 886 200»; «trucar al telèfon
 *   930 886 200, de dilluns a divendres de 8.30 a 14h».
 * Re-read by SOC_READ_BY (tests/calculators-round3-27nov.test.ts).
 */

export const SOC_SOURCE = {
  url: "https://serveiocupacio.gencat.cat/ca/tramits/tramits-persones/inscriu-te-com-a-demandant-docupacio/",
  readOn: "2026-11-27",
  phone: "930 886 200",
} as const;
/** Phone hours and the 30-day rule are service details: re-read within three months. */
export const SOC_READ_BY = "2027-02-27";

export interface SocCopy {
  heading: string;
  paragraphs: string[];
  sourceName: string;
  readLine: string;
  faq: { q: string; a: string };
}

export function socCopy(locale: CalcLocale): SocCopy {
  const tel = SOC_SOURCE.phone;
  if (locale === "es") {
    return {
      heading: "En Cataluña: inscripción en el SOC y el DARDO",
      paragraphs: [
        "En Cataluña el paro y el subsidio los paga el SEPE, pero la inscripción como demandante de empleo, que es obligatoria para cobrarlos, se hace en el Servicio Público de Empleo de Cataluña (SOC). Si es la primera vez y tienes DNI, puedes hacerla por internet en el momento y al acabar obtienes el DARDO, el documento de alta y renovación de la demanda.",
        `Después tienes 30 días para completar tu perfil profesional; si no, la demanda se da de baja. Con NIE, la inscripción se pide por teléfono al SOC, en el ${tel} (de lunes a viernes, de 8.30 a 14 h), o en persona en tu Oficina de Trabajo (el SOC recomienda pedir cita).`,
      ],
      sourceName: "SOC: inscríbete como demandante de empleo",
      readLine: "Leído el 27 de noviembre de 2026.",
      faq: {
        q: "¿Dónde me inscribo como demandante de empleo en Cataluña para cobrar el paro?",
        a: `En el SOC (Servicio Público de Empleo de Cataluña): por internet si es la primera vez y tienes DNI, y al acabar obtienes el DARDO; con NIE, por teléfono en el ${tel}. La prestación la pides y la cobras del SEPE, pero sin esa inscripción no se paga.`,
      },
    };
  }
  if (locale === "ca") {
    return {
      heading: "A Catalunya: inscripció al SOC i el DARDO",
      paragraphs: [
        "A Catalunya l'atur i el subsidi els paga el SEPE, però la inscripció com a demandant d'ocupació, que és obligatòria per cobrar-los, es fa al Servei Públic d'Ocupació de Catalunya (SOC). Si és la primera vegada i tens DNI, la pots fer per internet al moment i en acabar obtens el DARDO, el document d'alta i renovació de la demanda.",
        `Després tens 30 dies per completar el teu perfil professional; si no, la demanda es dona de baixa. Amb NIE, la inscripció es demana per telèfon al SOC, al ${tel} (de dilluns a divendres, de 8.30 a 14 h), o en persona a la teva Oficina de Treball (el SOC recomana demanar cita).`,
      ],
      sourceName: "SOC: inscriu-te com a demandant d'ocupació",
      readLine: "Llegit el 27 de novembre de 2026.",
      faq: {
        q: "On m'inscric com a demandant d'ocupació a Catalunya per cobrar l'atur?",
        a: `Al SOC (Servei Públic d'Ocupació de Catalunya): per internet si és la primera vegada i tens DNI, i en acabar obtens el DARDO; amb NIE, per telèfon al ${tel}. La prestació la demanes i la cobres del SEPE, però sense aquesta inscripció no es paga.`,
      },
    };
  }
  return {
    heading: "In Catalonia: registering with the SOC and the DARDO",
    paragraphs: [
      "In Catalonia, unemployment benefit and the subsidy are paid by SEPE, but registering as a job seeker, which you must do to get them, is done with Catalonia's public employment service (Servei Públic d'Ocupació de Catalunya, SOC). If it is your first time and you have a Spanish DNI, you can do it online on the spot and get the DARDO, the registration and renewal document, at the end.",
      `You then have 30 days to complete your professional profile, or the registration is cancelled. With an NIE, you register by phone with the SOC on ${tel} (Monday to Friday, 8:30 to 14:00) or in person at your Oficina de Treball (the SOC advises booking an appointment).`,
    ],
    sourceName: "SOC: register as a job seeker (in Catalan)",
    readLine: "Read 27 November 2026.",
    faq: {
      q: "Where do I register as a job seeker in Catalonia to get unemployment benefit?",
      a: `With the SOC (Catalonia's public employment service): online if it is your first time and you have a DNI, and you get the DARDO at the end; with an NIE, by phone on ${tel}. You apply for and receive the benefit from SEPE, but it is not paid without that registration.`,
    },
  };
}
