import { SNAPSHOT, regionalDays, aranSwap, municipalities } from "./data";
import { dayMonth, weekdayDayMonth, type DateLocale } from "./format";
import type { GuideKey } from "./links";
import { esName, joinList } from "./names";
import type { DatePage } from "./paths";
import type { DatePlace } from "./types";

/**
 * Content of the "És festiu el …?" pages. Every statement is either computed
 * from the snapshot (who has a local holiday, which towns may open shops) or
 * quotes an official text read on the snapshot date:
 *
 *  - Ordre EMT/66/2025 (2026) and Ordre EMT/52/2026 (2027): the Catalonia-wide days;
 *  - BOE-A-2025-21667: the 2026 national table (7 Dec is a holiday in nine
 *    communities and Melilla, not Catalonia; 26 Dec only in Catalonia and the
 *    Balearic Islands);
 *  - Llei 18/2017, articles 36.2.d (1 and 6 Jan, 25 and 26 Dec are closing
 *    days for shops) and 37 (the shops outside those limits);
 *  - Ordre EMT/77/2025, Resolució EMT/4342/2025 and Ordre EMT/89/2026: the
 *    shop-opening Sundays and holidays of 2026 and 2027;
 *  - Ordre EDF/66/2026: Christmas school holidays, 22 Dec 2026 to 7 Jan 2027.
 */

/** BOE-A-2025-21667, row "7 Lunes siguiente al Día de la Constitución Española" (read 27 Oct 2026). */
const MONDAY_7_REGIONS: Record<DateLocale, string[]> = {
  ca: ["Andalusia", "l'Aragó", "Astúries", "Cantàbria", "Castella i Lleó", "Extremadura", "la Comunitat de Madrid", "la Regió de Múrcia", "la Rioja", "Melilla"],
  es: ["Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla y León", "Extremadura", "la Comunidad de Madrid", "la Región de Murcia", "La Rioja", "Melilla"],
  en: ["Andalusia", "Aragon", "Asturias", "Cantabria", "Castile and León", "Extremadura", "the Community of Madrid", "the Region of Murcia", "La Rioja", "Melilla"],
};

export interface DateSection {
  title: string;
  paragraphs: string[];
}

export interface DateContent {
  /** True when it is a holiday across Catalonia. */
  holiday: boolean;
  answer: string;
  answerNote: string[];
  description: string;
  /** Places with a local holiday that day (or on the eve, when the day itself is Catalonia-wide). */
  local: { text: string; places: DatePlace[] };
  sections: DateSection[];
  guides: GuideKey[];
}

function count(places: DatePlace[]) {
  return { municipalities: places.filter((p) => !p.parent).length, nuclei: places.filter((p) => p.parent).length };
}

function placesPhrase(places: DatePlace[], locale: DateLocale): string {
  const { municipalities: m, nuclei: n } = count(places);
  if (locale === "ca") return `${m} ${m === 1 ? "municipi" : "municipis"}${n ? ` i ${n} ${n === 1 ? "nucli" : "nuclis"}` : ""}`;
  if (locale === "es") return `${m} ${m === 1 ? "municipio" : "municipios"}${n ? ` y ${n} ${n === 1 ? "núcleo" : "núcleos"}` : ""}`;
  return `${m} ${m === 1 ? "town" : "towns"}${n ? ` and ${n} ${n === 1 ? "village" : "villages"}` : ""}`;
}

function placeNames(places: DatePlace[], locale: DateLocale): string {
  return joinList(places.map((p) => (locale === "es" ? esName(p.name) : p.name)), locale);
}

/** Listed municipalities (the 100 with a page) whose shop days for 2026 leave this date out. */
function shopsClosedAmongListed(iso: string): string[] {
  return municipalities()
    .filter((m) => !m.shops.includes(iso))
    .sort((a, b) => a.rank - b.rank)
    .map((m) => m.name);
}

function regionalName(iso: string, locale: DateLocale): string | null {
  const year = Number(iso.slice(0, 4));
  return regionalDays(year).find((d) => d.date === iso)?.name[locale] ?? null;
}

const DEC7 = "2026-12-07";
const DEC24 = "2026-12-24";
const DEC31 = "2026-12-31";

export function dateContent(iso: DatePage, locale: DateLocale): DateContent {
  const name = regionalName(iso, locale);
  const local = SNAPSHOT.localByDate[iso] ?? [];
  // "dimarts 8 de desembre de 2026": the article in front belongs to the weekday.
  const long = locale === "en" ? `${weekdayDayMonth(iso, locale)} ${iso.slice(0, 4)}` : `${weekdayDayMonth(iso, locale)} de ${iso.slice(0, 4)}`;
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const names = (list: string[]) => joinList(list.map((n) => (locale === "es" ? esName(n) : n)), locale);

  const shopsLaw = L(
    "Les botigues amb horari general tanquen. La llei de comerç fixa uns quants dies de tancament obligatori: l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (Llei 18/2017, article 36.2.d). Poden obrir els establiments que la llei deixa fora d'aquest horari, com fleques, pastisseries, botigues de conveniència, floristeries o farmàcies (article 37).",
    "Las tiendas con horario general cierran. La ley catalana de comercio fija varios días de cierre obligatorio: el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (Ley 18/2017, artículo 36.2.d). Pueden abrir los establecimientos que la ley deja fuera de ese horario, como panaderías, pastelerías, tiendas de conveniencia, floristerías o farmacias (artículo 37).",
    "Shops on the general timetable are closed. Catalonia's retail law sets a few compulsory closing days: 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September and 25 and 26 December (Llei 18/2017, article 36.2.d). Businesses the law leaves outside that timetable may open, such as bakeries, pastry shops, convenience stores, florists and pharmacies (article 37).",
  );
  const schoolChristmas = L(
    "Les vacances escolars de Nadal van del 22 de desembre de 2026 al 7 de gener de 2027, tots dos inclosos (Ordre EDF/66/2026).",
    "Las vacaciones escolares de Navidad van del 22 de diciembre de 2026 al 7 de enero de 2027, ambos incluidos (Orden EDF/66/2026).",
    "School Christmas holidays run from 22 December 2026 to 7 January 2027, both included (Order EDF/66/2026).",
  );
  const metroPointer = L(
    "Per saber com obre i tanca el metro de Barcelona els festius i les vigílies, mira la guia d'horaris del metro.",
    "Para saber cómo abre y cierra el metro de Barcelona los festivos y las vísperas, mira la guía de horarios del metro.",
    "For how the Barcelona metro opens and closes on public holidays and the nights before them, see the metro hours guide.",
  );

  if (iso === DEC7) {
    const n = placesPhrase(local, locale);
    const sb = municipalities().filter((m) => m.local.includes(iso) && m.shops.includes(iso)).map((m) => m.name);
    return {
      holiday: false,
      answer: L(
        `No. El ${long} és un dia feiner a Catalunya: dels festius del desembre, només ho són el 8, el 25 i el 26 (Ordre EMT/66/2025). Sí que és festa local a ${n}.`,
        `No. El ${long} es laborable en Cataluña: de los festivos de diciembre, solo lo son el 8, el 25 y el 26 (Orden EMT/66/2025). Sí es fiesta local en ${n}.`,
        `No. ${long} is a working day in Catalonia: the only December holidays are the 8th, 25th and 26th (Order EMT/66/2025). It is a local holiday in ${n}.`,
      ),
      answerNote: [
        L(
          `En altres comunitats sí que és festiu: el BOE el marca com a dilluns següent al Dia de la Constitució a ${joinList(MONDAY_7_REGIONS.ca, "ca")}, però no a Catalunya.`,
          `En otras comunidades sí es festivo: el BOE lo marca como lunes siguiente al Día de la Constitución en ${joinList(MONDAY_7_REGIONS.es, "es")}, pero no en Cataluña.`,
          `It is a holiday elsewhere in Spain: the BOE lists it as the Monday after Constitution Day in ${joinList(MONDAY_7_REGIONS.en, "en")}, but not in Catalonia.`,
        ),
      ],
      description: L(
        `No: el 7 de desembre de 2026 és feiner a Catalunya. És festa local a ${n}: la llista, botigues, escoles i el pont del 8.`,
        `No: el 7 de diciembre de 2026 es laborable en Cataluña. Es fiesta local en ${n}: la lista, tiendas, escuelas y el puente del 8.`,
        `No: 7 December 2026 is a working day in Catalonia, but a local holiday in ${n}. The list, shops, schools and the 8 December holiday.`,
      ),
      local: {
        text: L(
          `El dilluns 7 de desembre és festa local a ${n} (Ordre EMT/208/2025 i Ordre EMT/3/2026):`,
          `El lunes 7 de diciembre es fiesta local en ${n} (Orden EMT/208/2025 y Orden EMT/3/2026):`,
          `Monday 7 December is a local holiday in ${n} (Order EMT/208/2025 and Order EMT/3/2026):`,
        ),
        places: local,
      },
      sections: [
        {
          title: L("Botigues", "Tiendas", "Shops"),
          paragraphs: [
            L(
              `És un dia feiner: les botigues obren amb el seu horari habitual. Als municipis on és festa local, només hi poden obrir si el 7 de desembre és un dels seus deu dies d'obertura comercial${sb.length ? `, com passa ${sb.length === 1 ? "a" : "a"} ${names(sb)}` : ""} (Resolució EMT/4342/2025).`,
              `Es laborable: las tiendas abren con su horario habitual. En los municipios donde es fiesta local, solo pueden abrir si el 7 de diciembre es uno de sus diez días de apertura comercial${sb.length ? `, como ocurre en ${names(sb)}` : ""} (Resolución EMT/4342/2025).`,
              `It is a working day, so shops keep their usual hours. Where it is a local holiday, shops may open only if 7 December is one of that town's ten opening days${sb.length ? `, as it is in ${names(sb)}` : ""} (Resolution EMT/4342/2025).`,
            ),
          ],
        },
        {
          title: L("Escoles", "Escuelas", "Schools"),
          paragraphs: [
            L(
              `No és festiu escolar a tot Catalunya, però sí als municipis on és festa local. A més, cada escola tria quatre dies de lliure disposició i en pot fer servir un aquest dilluns: mira el calendari del teu centre (Ordre EDF/66/2026).`,
              `No es festivo escolar en toda Cataluña, pero sí en los municipios donde es fiesta local. Además, cada escuela elige cuatro días de libre disposición y puede usar uno este lunes: mira el calendario de tu centro (Orden EDF/66/2026).`,
              `It is not a school holiday across Catalonia, but it is wherever it is a local holiday. Each school also picks four days of its own and may use one on this Monday: check your school's calendar (Order EDF/66/2026).`,
            ),
          ],
        },
        {
          title: L("Transport", "Transporte", "Getting around"),
          paragraphs: [
            L(
              `La nit del 7 al 8 és vigília de festiu. ${metroPointer}`,
              `La noche del 7 al 8 es víspera de festivo. ${metroPointer}`,
              `The night of the 7th is the eve of a public holiday. ${metroPointer}`,
            ),
          ],
        },
      ],
      guides: ["decemberBridge", "shops", "school", "metroHours", "localHolidays", "workCalendar"],
    };
  }

  if (iso === "2026-12-08") {
    const eve = SNAPSHOT.localByDate[DEC7] ?? [];
    const closed = shopsClosedAmongListed(iso);
    return {
      holiday: true,
      answer: L(
        `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/66/2025) i a la resta d'Espanya.`,
        `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/66/2025) y en el resto de España.`,
        `Yes. ${long}, the ${name}, is a public holiday across Catalonia (Order EMT/66/2025) and the rest of Spain.`,
      ),
      answerNote: [
        L(
          `El dia abans, el dilluns 7, és feiner a Catalunya, tret dels ${placesPhrase(eve, "ca")} que hi tenen festa local.`,
          `El día antes, el lunes 7, es laborable en Cataluña, salvo en los ${placesPhrase(eve, "es")} que tienen fiesta local.`,
          `The day before, Monday 7 December, is a working day in Catalonia except in the ${placesPhrase(eve, "en")} with a local holiday.`,
        ),
      ],
      description: L(
        `Sí: el dimarts 8 de desembre de 2026, la Immaculada, és festiu a tot Catalunya. Quines botigues poden obrir, escoles i el dilluns 7.`,
        `Sí: el martes 8 de diciembre de 2026, la Inmaculada, es festivo en toda Cataluña. Qué tiendas pueden abrir, escuelas y el lunes 7.`,
        `Yes: Tuesday 8 December 2026 is a public holiday across Catalonia. Which shops may open, schools, and Monday the 7th.`,
      ),
      local: {
        text: L(
          "Cap municipi hi afegeix festa local: ja és festiu a tot arreu.",
          "Ningún municipio añade fiesta local: ya es festivo en todas partes.",
          "No town adds a local holiday: it is already a holiday everywhere.",
        ),
        places: [],
      },
      sections: [
        {
          title: L("Botigues", "Tiendas", "Shops"),
          paragraphs: [
            L(
              `Les botigues poden obrir a la majoria de municipis: el 8 de desembre és un dels dos dies municipals per defecte (Ordre EMT/77/2025, article 6), i Barcelona també l'ha triat (Resolució EMT/4342/2025). Entre els ${municipalities().length} municipis més poblats, no és dia d'obertura a ${names(closed)}.`,
              `Las tiendas pueden abrir en la mayoría de municipios: el 8 de diciembre es uno de los dos días municipales por defecto (Orden EMT/77/2025, artículo 6), y Barcelona también lo ha elegido (Resolución EMT/4342/2025). Entre los ${municipalities().length} municipios más poblados, no es día de apertura en ${names(closed)}.`,
              `Shops may open in most towns: 8 December is one of the two default municipal opening days (Order EMT/77/2025, article 6), and Barcelona has chosen it too (Resolution EMT/4342/2025). Among the ${municipalities().length} largest towns, it is not an opening day in ${names(closed)}.`,
            ),
            L(
              "Poder obrir no vol dir que obrin: cada botiga decideix.",
              "Poder abrir no quiere decir que abran: cada tienda decide.",
              "Being allowed to open does not mean every shop will.",
            ),
          ],
        },
        {
          title: L("Escoles", "Escuelas", "Schools"),
          paragraphs: [
            L(
              "És festiu laboral i, per tant, no hi ha classe (Ordre EDF/66/2026).",
              "Es festivo laboral y, por tanto, no hay clase (Orden EDF/66/2026).",
              "It is a public holiday, so there is no school (Order EDF/66/2026).",
            ),
          ],
        },
        { title: L("Transport", "Transporte", "Getting around"), paragraphs: [metroPointer] },
      ],
      guides: ["decemberBridge", "shops", "metroHours", "holidayToday", "workCalendar"],
    };
  }

  if (iso === "2026-12-25" || iso === "2026-12-26") {
    const isXmas = iso === "2026-12-25";
    const eve = SNAPSHOT.localByDate[DEC24] ?? [];
    const swap = aranSwap(2026);
    const closed27 = shopsClosedAmongListed("2026-12-27");
    const next27 = L(
      `El pròxim dia en què les botigues poden obrir és el diumenge 27 de desembre, que és al calendari general del 2026 (Ordre EMT/77/2025)${closed27.length ? `; entre els ${municipalities().length} municipis més poblats, no ho és a ${names(closed27)}` : ""}.`,
      `El próximo día en que las tiendas pueden abrir es el domingo 27 de diciembre, que está en el calendario general de 2026 (Orden EMT/77/2025)${closed27.length ? `; entre los ${municipalities().length} municipios más poblados, no lo es en ${names(closed27)}` : ""}.`,
      `The next day shops may open is Sunday 27 December, which is in the general 2026 calendar (Order EMT/77/2025)${closed27.length ? `; among the ${municipalities().length} largest towns it is not an opening day in ${names(closed27)}` : ""}.`,
    );
    return {
      holiday: true,
      answer: isXmas
        ? L(
            `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/66/2025) i a la resta d'Espanya.`,
            `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/66/2025) y en el resto de España.`,
            `Yes. ${long}, ${name}, is a public holiday across Catalonia (Order EMT/66/2025) and the rest of Spain.`,
          )
        : L(
            `Sí. El ${long}, ${name}, és festiu a Catalunya (Ordre EMT/66/2025), excepte a l'Aran, on el substitueix la ${swap?.name.ca} del ${dayMonth(swap?.date ?? "", "ca")}.`,
            `Sí. El ${long}, ${name}, es festivo en Cataluña (Orden EMT/66/2025), excepto en Arán, donde lo sustituye la ${swap?.name.es} del ${dayMonth(swap?.date ?? "", "es")}.`,
            `Yes. ${long}, ${name}, is a public holiday in Catalonia (Order EMT/66/2025), except in Aran, where the ${swap?.name.en} on ${dayMonth(swap?.date ?? "", "en")} replaces it.`,
          ),
      answerNote: isXmas
        ? [
            L(
              `L'endemà, dissabte 26, Sant Esteve, també és festiu a Catalunya.`,
              `Al día siguiente, sábado 26, San Esteban, también es festivo en Cataluña.`,
              `The next day, Saturday 26 December, Saint Stephen's Day, is also a holiday in Catalonia.`,
            ),
          ]
        : [
            L(
              "No és festiu a tota Espanya: a la taula del BOE per al 2026, el 26 de desembre només és festiu a Catalunya i a les Illes Balears.",
              "No es festivo en toda España: en la tabla del BOE para 2026, el 26 de diciembre solo es festivo en Cataluña y en las Illes Balears.",
              "It is not a holiday across Spain: in the BOE's 2026 table, 26 December is a holiday only in Catalonia and the Balearic Islands.",
            ),
          ],
      description: isXmas
        ? L(
            "Sí: el divendres 25 de desembre de 2026, Nadal, és festiu a tot Catalunya. Botigues tancades, quan tornen a obrir, la Nit de Nadal i escoles.",
            "Sí: el viernes 25 de diciembre de 2026, Navidad, es festivo en toda Cataluña. Tiendas cerradas, cuándo vuelven a abrir, Nochebuena y escuelas.",
            "Yes: Friday 25 December 2026, Christmas Day, is a public holiday across Catalonia. Shops closed, when they reopen, Christmas Eve and schools.",
          )
        : L(
            "Sí: el dissabte 26 de desembre de 2026, Sant Esteve, és festiu a Catalunya (no a l'Aran). Botigues tancades, quan tornen a obrir i escoles.",
            "Sí: el sábado 26 de diciembre de 2026, San Esteban, es festivo en Cataluña (no en Arán). Tiendas cerradas, cuándo vuelven a abrir y escuelas.",
            "Yes: Saturday 26 December 2026, Saint Stephen's Day, is a public holiday in Catalonia (not in Aran). Shops closed, when they reopen, schools.",
          ),
      local: isXmas
        ? {
            text: L(
              `Cap municipi hi afegeix festa local. La vigília, la Nit de Nadal (dijous 24), no és festiu a Catalunya, tret de ${placesPhrase(eve, "ca")} que hi tenen festa local: ${placeNames(eve, "ca")}.`,
              `Ningún municipio añade fiesta local. La víspera, Nochebuena (jueves 24), no es festivo en Cataluña, salvo en ${placesPhrase(eve, "es")} que tienen fiesta local: ${placeNames(eve, "es")}.`,
              `No town adds a local holiday. Christmas Eve (Thursday 24 December) is not a holiday in Catalonia, except in ${placesPhrase(eve, "en")} with a local holiday: ${placeNames(eve, "en")}.`,
            ),
            places: [],
          }
        : {
            text: L(
              "Cap municipi hi afegeix festa local: ja és festiu a tot Catalunya fora de l'Aran.",
              "Ningún municipio añade fiesta local: ya es festivo en toda Cataluña fuera de Arán.",
              "No town adds a local holiday: it is already a holiday everywhere in Catalonia outside Aran.",
            ),
            places: [],
          },
      sections: [
        { title: L("Botigues", "Tiendas", "Shops"), paragraphs: [shopsLaw, next27] },
        { title: L("Escoles", "Escuelas", "Schools"), paragraphs: [schoolChristmas] },
        { title: L("Transport", "Transporte", "Getting around"), paragraphs: [metroPointer] },
      ],
      guides: ["christmasTraditions", "christmasBarcelona", "shops", "metroHours", "workCalendar", "holidayToday"],
    };
  }

  // 1 and 6 January 2027: local days for 2027 are not published yet.
  const isNewYear = iso === "2027-01-01";
  const eve31 = SNAPSHOT.localByDate[DEC31] ?? [];
  const pending = L(
    "Els festius locals del 2027 encara no s'han publicat: l'ordre del 2026 va sortir al DOGC el 17 de desembre de 2025. Quan surti la del 2027, aquí sabràs quins municipis hi afegeixen festa.",
    "Los festivos locales de 2027 todavía no se han publicado: la orden de 2026 salió en el DOGC el 17 de diciembre de 2025. Cuando salga la de 2027, aquí sabrás qué municipios añaden fiesta.",
    "Local holidays for 2027 have not been published yet: the 2026 order appeared in the DOGC (Catalonia's official gazette) on 17 December 2025. Once the 2027 one is out, this page will say which towns add a holiday.",
  );
  return {
    holiday: true,
    answer: L(
      `Sí. El ${long}, ${name}, és festiu a tot Catalunya (Ordre EMT/52/2026).`,
      `Sí. El ${long}, ${name}, es festivo en toda Cataluña (Orden EMT/52/2026).`,
      `Yes. ${long}, ${name}, is a public holiday across Catalonia (Order EMT/52/2026).`,
    ),
    answerNote: isNewYear
      ? [
          L(
            `La vigília, el dijous 31 de desembre de 2026, no és festiu a Catalunya, tret de ${placesPhrase(eve31, "ca")} que hi tenen festa local: ${placeNames(eve31, "ca")}.`,
            `La víspera, el jueves 31 de diciembre de 2026, no es festivo en Cataluña, salvo en ${placesPhrase(eve31, "es")} que tienen fiesta local: ${placeNames(eve31, "es")}.`,
            `New Year's Eve, Thursday 31 December 2026, is not a holiday in Catalonia, except in ${placesPhrase(eve31, "en")} with a local holiday: ${placeNames(eve31, "en")}.`,
          ),
        ]
      : [],
    description: isNewYear
      ? L(
          "Sí: el divendres 1 de gener de 2027, Cap d'Any, és festiu a tot Catalunya. Botigues, la vigília del 31, escoles i els festius locals del 2027.",
          "Sí: el viernes 1 de enero de 2027, Año Nuevo, es festivo en toda Cataluña. Tiendas, la víspera del 31, escuelas y los festivos locales de 2027.",
          "Yes: Friday 1 January 2027, New Year's Day, is a public holiday across Catalonia. Shops, New Year's Eve, schools and 2027 local holidays.",
        )
      : L(
          "Sí: el dimecres 6 de gener de 2027, Reis, és festiu a tot Catalunya. Botigues, quan tornen les classes i els festius locals del 2027.",
          "Sí: el miércoles 6 de enero de 2027, Reyes, es festivo en toda Cataluña. Tiendas, cuándo vuelven las clases y los festivos locales de 2027.",
          "Yes: Wednesday 6 January 2027, Epiphany (Three Kings), is a public holiday across Catalonia. Shops, back to school and 2027 local holidays.",
        ),
    local: { text: pending, places: [] },
    sections: [
      {
        title: L("Botigues", "Tiendas", "Shops"),
        paragraphs: [
          shopsLaw,
          L(
            `El primer diumenge del 2027 en què les botigues poden obrir és el 3 de gener, al calendari general (Ordre EMT/89/2026). Els dos dies de cada municipi per al 2027 encara no s'han publicat; on l'ajuntament no n'hagi triat cap, s'hi aplicaran el 10 de gener i el 5 de desembre (article 5).`,
            `El primer domingo de 2027 en que las tiendas pueden abrir es el 3 de enero, en el calendario general (Orden EMT/89/2026). Los dos días de cada municipio para 2027 todavía no se han publicado; donde el ayuntamiento no haya elegido ninguno, se aplicarán el 10 de enero y el 5 de diciembre (artículo 5).`,
            `The first Sunday of 2027 when shops may open is 3 January, in the general calendar (Order EMT/89/2026). Each town's two extra days for 2027 have not been published yet; where a council chose none, 10 January and 5 December apply (article 5).`,
          ),
        ],
      },
      {
        title: L("Escoles", "Escuelas", "Schools"),
        paragraphs: [
          isNewYear
            ? schoolChristmas
            : L(
                "Les vacances escolars de Nadal duren fins al dijous 7 de gener de 2027, inclòs (Ordre EDF/66/2026).",
                "Las vacaciones escolares de Navidad duran hasta el jueves 7 de enero de 2027, incluido (Orden EDF/66/2026).",
                "School Christmas holidays last until Thursday 7 January 2027, inclusive (Order EDF/66/2026).",
              ),
        ],
      },
      {
        title: L("Transport", "Transporte", "Getting around"),
        paragraphs: [
          isNewYear
            ? L(
                `La nit del 31 de desembre és vigília de festiu. ${metroPointer} Per a la nit de Cap d'Any a Barcelona, mira també la guia de Cap d'Any.`,
                `La noche del 31 de diciembre es víspera de festivo. ${metroPointer} Para la Nochevieja en Barcelona, mira también la guía de Nochevieja.`,
                `The night of 31 December is the eve of a public holiday. ${metroPointer} For New Year's Eve in Barcelona, see also the New Year's Eve guide.`,
              )
            : L(
                `La nit del 5 al 6 és vigília de festiu. ${metroPointer}`,
                `La noche del 5 al 6 es víspera de festivo. ${metroPointer}`,
                `The night of 5 January is the eve of a public holiday. ${metroPointer}`,
              ),
        ],
      },
    ],
    guides: isNewYear
      ? ["newYear", "shops", "metroHours", "workCalendar", "school", "holidayToday"]
      : ["christmasBarcelona", "christmasTraditions", "shops", "school", "workCalendar", "holidayToday"],
  };
}

