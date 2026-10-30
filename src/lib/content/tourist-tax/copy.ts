import type { Locale } from "@/lib/i18n/config";

/**
 * Editorial copy for the tourist tax guide. No figure is written here.
 *
 * Placeholders, filled from `rates.ts` by `publish.ts` (`fillFigures`):
 * `{bcnMin}`/`{bcnMax}` the cheapest and dearest Barcelona total per person
 * per night now, `{bcnSur}` Barcelona's surcharge, `{bcn4}` `{bcn5}`
 * `{bcnFlat}` `{bcnHostel}` Barcelona totals by type, `{rest4}` `{rest5}`
 * `{restHostel}` the regional rate elsewhere, `{rest4next}` the four-star rate
 * elsewhere from 1 April 2027, `{s0}`/`{s1}` Barcelona's surcharge now and from
 * 1 April 2027, `{hosp4}`/`{hosp4total}` L'Hospitalet's four-star surcharge and
 * total, `{te1}` `{te2}` `{te3}` the special rate, `{minInt}` `{maxInt}`
 * `{surInt}` whole-euro forms for the search title, `{age}` and `{max}`.
 */

export interface TaxCopy {
  path: string;
  title: string;
  /** May carry `{minInt}`, `{maxInt}`; filled by publish.ts. */
  seoTitle: string;
  /** May carry `{minInt}`, `{maxInt}`, `{surInt}`, `{max}`, `{age}`. */
  seoDescription: string;
  excerpt: string;

  lead: string[];
  directAnswerTitle: string;
  /**
   * Placeholders filled from `rates.ts`: `{bcn4}` total per person per night
   * in a Barcelona four-star, `{bcn4reg}` its regional part, `{bcn4sur}` the
   * municipal surcharge, `{couple4}` two people for four nights, `{rest4}` the
   * same hotel outside Barcelona, `{max}` the stay-unit cap and `{age}` the
   * exempt age. No figure is typed in this file.
   */
  directAnswer: string;

  keyFactsTitle: string;
  keyFactLabels: {
    surcharge: string;
    maxUnits: string;
    exemption: string;
    scope: string;
    verified: string;
    review: string;
  };
  keyFactValues: {
    exemption: string;
    scope: string;
    verified: string;
    review: string;
  };

  barcelonaTitle: string;
  barcelona: string[];
  barcelonaCaption: string;

  restTitle: string;
  rest: string[];
  restCaption: string;

  tableHeaders: { type: string; regional: string; surcharge: string; total: string };
  noSurcharge: string;
  tableNote: string;

  /** The seven municipal surcharges (ATC, from 1 Oct 2026). */
  muniTitle: string;
  muni: string[];
  muniCaption: string;
  muniHeaders: { municipality: string; hotel5: string; hotel4: string; flat: string; hostel: string; other: string };
  muniNote: string;
  special: string;

  faqTitle: string;
  faq: { question: string; answer: string }[];

  futureTitle: string;
  future: string[];
  futureCaption: string;
  futureHeaders: { type: string; rate: string };
  barcelonaFutureTitle: string;
  barcelonaFuture: string[];

  childrenTitle: string;
  children: string[];

  nightsTitle: string;
  nights: string[];

  examplesTitle: string;
  examplesIntro: string;
  exampleLabels: { scenario: string; calculation: string; total: string };
  examples: { scenario: string; note?: string }[];

  bookingTitle: string;
  booking: string[];

  whoTitle: string;
  who: string[];

  whyTitle: string;
  why: string[];

  closingTitle: string;
  closing: string[];
}

export const COPY: Record<Locale, TaxCopy> = {
  ca: {
    path: "guies/taxa-turistica-barcelona-catalunya",
    title: "Quant és la taxa turística a Barcelona? Tarifes 2026 a Barcelona i Catalunya",
    seoTitle: "Taxa turística Barcelona 2026: de {minInt} a {maxInt} € per persona i nit",
    seoDescription:
      "Taxa turística a Barcelona: de {minInt} a {maxInt} € per persona i nit (Generalitat + {surInt} € de l'Ajuntament). Màxim {max} nits; fins a {age} anys, gratis. Calculadora.",
    excerpt:
      "Quant costa realment la taxa turística segons on dorms, quantes persones tributen i quantes nits. Amb calculadora i tarifes oficials verificades.",

    lead: [
      "La taxa turística a Barcelona costa **de {bcnMin} a {bcnMax} per persona i nit** fins al 31 de març de 2027, segons l'allotjament: la tarifa de la Generalitat més {bcnSur} de recàrrec de l'Ajuntament. En un hotel de 4 estrelles són **{bcn4}**; en un habitatge d'ús turístic, **{bcnFlat}**.",
      "Oficialment es diu impost sobre les estades en establiments turístics (IEET). Es paga com a màxim per {max} nits per persona, qui té {age} anys o menys no paga, i fora de Barcelona la tarifa és més baixa, llevat de set municipis amb recàrrec propi. El que pagaràs depèn de quatre coses: **on dorms, el tipus d'allotjament, quantes persones tributen i quantes nits**.",
    ],
    directAnswerTitle: "Resposta ràpida",
    directAnswer:
      "En un hotel de 4 estrelles a Barcelona pagues **{bcn4} per persona i nit** ({bcn4reg} de tarifa de la Generalitat més {bcn4sur} de recàrrec municipal): per a dues persones i quatre nits, {couple4}. El mateix hotel en un municipi sense recàrrec: {rest4} per persona i nit (a l'Hospitalet, Sabadell, Sant Cugat i quatre municipis més, el doble). Les persones de {age} anys o menys no paguen, i el càlcul s'atura a {max} nits per persona.",

    keyFactsTitle: "Dades clau",
    keyFactLabels: {
      surcharge: "Recàrrec municipal de Barcelona",
      maxUnits: "Màxim d'unitats que tributen",
      exemption: "Exempció per edat",
      scope: "Fora de Barcelona",
      verified: "Última verificació",
      review: "Propera revisió",
    },
    keyFactValues: {
      exemption: "16 anys o menys",
      scope: "Recàrrec municipal vigent des de l'1/10/2026 a Castelldefels, Esplugues, l'Hospitalet, el Prat, Sabadell, Sant Cugat i Sant Just Desvern",
      verified: "30 d'octubre de 2026",
      review: "1 de desembre de 2026",
    },

    barcelonaTitle: "Quant és la taxa turística a Barcelona?",
    barcelona: [
      "A Barcelona l'import final suma dues quantitats: la **tarifa de la Generalitat** i el **recàrrec municipal de l'Ajuntament**.",
    ],
    barcelonaCaption: "Taxa turística a Barcelona, per persona i unitat d'estada",

    restTitle: "Quant és la taxa turística a la resta de Catalunya?",
    rest: [
      "Fora de Barcelona les tarifes autonòmiques són força més baixes. Però des de l'**1 d'octubre de 2026** set municipis ja cobren un recàrrec propi: **Castelldefels, Esplugues de Llobregat, l'Hospitalet de Llobregat, el Prat de Llobregat, Sabadell, Sant Cugat del Vallès i Sant Just Desvern**. En un hotel de 4 estrelles, per exemple, el recàrrec és igual que la tarifa autonòmica, de manera que la duplica.",
      "La taula següent mostra només la part autonòmica, que és el que pagues en qualsevol municipi que no tingui recàrrec. La llista de municipis amb recàrrec la publica l'Agència Tributària de Catalunya i pot créixer.",
    ],
    restCaption: "Taxa turística fora de Barcelona, per persona i unitat d'estada",

    tableHeaders: {
      type: "Tipus d'allotjament",
      regional: "Generalitat",
      surcharge: "Recàrrec",
      total: "Total",
    },
    noSurcharge: "Cal comprovar-ho",
    tableNote:
      "Tarifes verificades el 30 d'octubre de 2026 a l'Agència Tributària de Catalunya. Import per persona i unitat d'estada.",

    muniTitle: "Taxa turística a l'Hospitalet, Sabadell, Sant Cugat i els altres municipis amb recàrrec",
    muni: [
      "Des de l'1 d'octubre de 2026, set municipis sumen un recàrrec propi a la tarifa de la Generalitat. Per exemple, en un hotel de 4 estrelles de l'Hospitalet pagues {hosp4} de recàrrec més {rest4} de tarifa autonòmica: **{hosp4total} per persona i nit**. Aquests són els recàrrecs que publica l'Agència Tributària de Catalunya, vigents fins al 31 de març de 2027:",
    ],
    muniCaption: "Recàrrec municipal fora de Barcelona, per persona i unitat d'estada (1/10/2026–31/3/2027)",
    muniHeaders: { municipality: "Municipi", hotel5: "Hotel 5★", hotel4: "Hotel 4★", flat: "Habitatge d'ús turístic", hostel: "Alberg", other: "Resta" },
    muniNote:
      "Agència Tributària de Catalunya, consultada el 30 d'octubre de 2026. S'afegeix a la tarifa de la Generalitat. «—»: l'ATC no hi publica recàrrec per a aquesta categoria. Les xifres d'Esplugues són les que publica l'ATC. No s'hi inclouen els recàrrecs de creuers de Castelldefels i el Prat.",
    special:
      "També hi ha una tarifa especial per als establiments d'un centre recreatiu turístic situats a les zones on s'admet el joc: {te1} als hotels de 5 estrelles, {te2} als de 4 i {te3} a la resta, per persona i nit.",

    faqTitle: "Preguntes freqüents sobre la taxa turística",
    faq: [
      { question: "Quant és la taxa turística a Barcelona?", answer: "De {bcnMin} a {bcnMax} per persona i nit fins al 31 de març de 2027: {bcnHostel} en un alberg de joventut, {bcn4} en un hotel de 4 estrelles, {bcnFlat} en un habitatge d'ús turístic i {bcn5} en un hotel de 5 estrelles. Inclou {bcnSur} de recàrrec municipal." },
      { question: "Quant és la taxa turística a Catalunya fora de Barcelona?", answer: "La tarifa de la Generalitat va de {restHostel} (alberg) a {rest5} (hotel de 5 estrelles) per persona i nit; {rest4} en un hotel de 4 estrelles. A Castelldefels, Esplugues, l'Hospitalet, el Prat, Sabadell, Sant Cugat i Sant Just Desvern s'hi suma un recàrrec municipal." },
      { question: "Els nens paguen la taxa turística?", answer: "No. Les persones de {age} anys o menys n'estan exemptes." },
      { question: "Quantes nits es paga la taxa turística?", answer: "Com a màxim {max} per persona en una estada continuada al mateix establiment; si canvies d'allotjament, el còmput torna a començar." },
      { question: "Puja la taxa turística el 2027?", answer: "Sí, l'1 d'abril de 2027: a Barcelona el recàrrec municipal passa de {s0} a {s1} per persona i nit, i fora de Barcelona puja la tarifa de la Generalitat (en un hotel de 4 estrelles, de {rest4} a {rest4next})." },
      { question: "Qui cobra la taxa turística?", answer: "L'allotjament, que la cobra a qui s'hi allotja i la declara. A la factura ha d'aparèixer separada del preu, amb les unitats d'estada i la tarifa aplicada." },
    ],

    futureTitle: "Què canvia l'1 d'abril de 2027",
    future: [
      "La Generalitat ja té aprovades tarifes superiors per a la resta de Catalunya a partir de l'1 d'abril de 2027. Aquestes són les que consten oficialment:",
    ],
    futureCaption: "Tarifes fora de Barcelona des de l'1 d'abril de 2027",
    futureHeaders: { type: "Tipus d'allotjament", rate: "Tarifa" },
    barcelonaFutureTitle: "I a Barcelona?",
    barcelonaFuture: [
      "El recàrrec municipal de Barcelona puja cada 1 d'abril fins al 2029, segons l'Ordenança fiscal 2.2 de l'Ajuntament: **{s0}** fins al 31 de març de 2027, **{s1}** de l'1 d'abril de 2027 al 31 de març de 2028, **{s2}** fins al 31 de març de 2029 i **{s3}** a partir de llavors, el màxim que permet la llei. La tarifa de la Generalitat per a Barcelona no canvia.",
      "Així, l'1 d'abril de 2027 un hotel a Barcelona pagarà **{step} més per persona i nit**. La calculadora ja aplica aquests imports segons la data.",
    ],

    childrenTitle: "Els menors paguen?",
    children: [
      "Les persones de **16 anys o menys estan exemptes**. Dit d'una altra manera: els menors de 17 anys no paguen l'impost, sempre que es pugui acreditar l'edat en els termes que estableixi l'administració.",
      "Hi ha altres exempcions previstes legalment, com determinades estades vinculades a motius de salut, programes socials públics o supòsits de força major. Si creus que el teu cas hi encaixa, consulta la font oficial abans de reclamar res a l'establiment.",
    ],

    nightsTitle: "Quantes nits es paguen?",
    nights: [
      "El càlcul té un màxim de **set unitats d'estada per persona** dins d'una estada continuada al mateix establiment.",
      "Això importa en els viatges llargs. Deu nits al mateix hotel dins de la mateixa estada no es multipliquen per deu: el màxim computable són set. Compte amb el matís, però: **mateixa persona, mateix establiment, període continuat**. Canviar d'hotel enmig del viatge comença un còmput nou.",
    ],

    examplesTitle: "Exemples amb números reals",
    examplesIntro:
      "Tots els càlculs següents utilitzen les tarifes verificades i es poden reproduir a la calculadora.",
    exampleLabels: { scenario: "Cas", calculation: "Càlcul", total: "Total" },
    examples: [
      { scenario: "Parella, 4 nits, hotel de 4 estrelles a Barcelona" },
      {
        scenario: "2 adults i 2 menors exempts, 4 nits, habitatge d'ús turístic a Barcelona",
        note: "Només tributen els dos adults.",
      },
      {
        scenario: "2 adults, 10 nits, hotel de 5 estrelles a Barcelona",
        note: "El màxim computable són set unitats per persona, no deu.",
      },
      {
        scenario: "2 adults, 4 nits, hotel de 4 estrelles fora de Barcelona",
        note: "En un municipi sense recàrrec municipal.",
      },
    ],

    bookingTitle: "I si vaig reservar abans d'una pujada?",
    booking: [
      "Reservar abans **no congela automàticament** la tarifa. És un error molt estès.",
      "La normativa permet aplicar la tarifa vigent en el moment de fer la reserva quan en aquell mateix moment se satisfan tant l'import de la reserva com el de l'impost i els recàrrecs corresponents. És a dir: depèn de si també vas pagar l'impost aleshores, no només de la data en què vas reservar.",
      "Si la teva estada cau a cavall d'un canvi de tarifa, mira què diu exactament el document de reserva i quin import t'ha cobrat l'establiment.",
    ],

    whoTitle: "Qui cobra la taxa?",
    who: [
      "El contribuent és la persona que fa l'estada, però qui la cobra i la declara és l'establiment, que actua com a substitut del contribuent.",
      "A la factura, l'import de l'impost s'ha de mostrar **separat** del preu de l'allotjament, amb les unitats d'estada i la tarifa aplicada. Si no hi apareix així, tens motiu per preguntar.",
    ],

    whyTitle: "Per què existeix",
    why: [
      "Des de l'abril de 2026, una part dels ingressos de l'impost es destina a polítiques d'habitatge de la Generalitat i la resta al Fons per al Foment del Turisme.",
    ],

    closingTitle: "Guarda aquesta pàgina",
    closing: [
      "Aquesta és una pàgina sensible als canvis normatius: les tarifes es mouen l'1 d'abril i els recàrrecs municipals poden aparèixer en qualsevol moment. La mantindrem a la mateixa adreça i la revisarem quan canviï alguna cosa oficial.",
    ],
  },

  es: {
    path: "guias/tasa-turistica-barcelona-cataluna",
    title: "¿Cuánto es la tasa turística en Barcelona? Tarifas 2026 en Barcelona y Cataluña",
    seoTitle: "Tasa turística Barcelona 2026: {minInt} a {maxInt} € por persona y noche",
    seoDescription:
      "Tasa turística en Barcelona: de {minInt} a {maxInt} € por persona y noche (Generalitat + {surInt} € del Ayuntamiento). Máximo {max} noches; hasta {age} años, gratis.",
    excerpt:
      "Cuánto cuesta realmente la tasa turística según dónde duermes, cuántas personas tributan y cuántas noches. Con calculadora y tarifas oficiales verificadas.",

    lead: [
      "La tasa turística en Barcelona cuesta **de {bcnMin} a {bcnMax} por persona y noche** hasta el 31 de marzo de 2027, según el alojamiento: la tarifa de la Generalitat más {bcnSur} de recargo del Ayuntamiento. En un hotel de 4 estrellas son **{bcn4}**; en una vivienda de uso turístico, **{bcnFlat}**.",
      "Oficialmente se llama impuesto sobre las estancias en establecimientos turísticos (IEET). Se paga como máximo por {max} noches por persona, quien tiene {age} años o menos no paga, y fuera de Barcelona la tarifa es más baja, salvo en siete municipios con recargo propio. Lo que pagarás depende de **dónde te alojas, el tipo de establecimiento, cuántas personas tributan y cuántas noches**.",
    ],
    directAnswerTitle: "Respuesta rápida",
    directAnswer:
      "En un hotel de 4 estrellas en Barcelona pagas **{bcn4} por persona y noche** ({bcn4reg} de tarifa autonómica más {bcn4sur} de recargo municipal): para dos personas y cuatro noches, {couple4}. El mismo hotel en un municipio sin recargo: {rest4} por persona y noche (en L'Hospitalet, Sabadell, Sant Cugat y otros cuatro municipios, el doble). Las personas de {age} años o menos no pagan, y el cálculo se detiene en {max} noches por persona.",

    keyFactsTitle: "Datos clave",
    keyFactLabels: {
      surcharge: "Recargo municipal de Barcelona",
      maxUnits: "Máximo de unidades que tributan",
      exemption: "Exención por edad",
      scope: "Fuera de Barcelona",
      verified: "Última verificación",
      review: "Próxima revisión",
    },
    keyFactValues: {
      exemption: "16 años o menos",
      scope: "Recargo municipal vigente desde el 1/10/2026 en Castelldefels, Esplugues, L'Hospitalet, El Prat, Sabadell, Sant Cugat y Sant Just Desvern",
      verified: "30 de octubre de 2026",
      review: "1 de diciembre de 2026",
    },

    barcelonaTitle: "¿Cuánto es la tasa turística en Barcelona?",
    barcelona: [
      "En Barcelona el importe final suma dos cantidades: la **tarifa autonómica de la Generalitat** y el **recargo municipal del Ayuntamiento**.",
    ],
    barcelonaCaption: "Tasa turística en Barcelona, por persona y unidad de estancia",

    restTitle: "¿Cuánto es la tasa turística en Cataluña fuera de Barcelona?",
    rest: [
      "Fuera de Barcelona las tarifas autonómicas son bastante más bajas. Pero desde el **1 de octubre de 2026** siete municipios ya cobran un recargo propio: **Castelldefels, Esplugues de Llobregat, L'Hospitalet de Llobregat, El Prat de Llobregat, Sabadell, Sant Cugat del Vallès y Sant Just Desvern**. En un hotel de 4 estrellas, por ejemplo, el recargo es igual que la tarifa autonómica, así que la duplica.",
      "La tabla siguiente muestra solo la parte autonómica, que es lo que pagas en cualquier municipio sin recargo. La lista de municipios con recargo la publica la Agència Tributària de Catalunya y puede crecer.",
    ],
    restCaption: "Tasa turística fuera de Barcelona, por persona y unidad de estancia",

    tableHeaders: {
      type: "Tipo de alojamiento",
      regional: "Generalitat",
      surcharge: "Recargo",
      total: "Total",
    },
    noSurcharge: "Hay que comprobarlo",
    tableNote:
      "Tarifas verificadas el 30 de octubre de 2026 en la Agència Tributària de Catalunya. Importe por persona y unidad de estancia.",

    muniTitle: "Tasa turística en L'Hospitalet, Sabadell, Sant Cugat y los demás municipios con recargo",
    muni: [
      "Desde el 1 de octubre de 2026, siete municipios suman un recargo propio a la tarifa de la Generalitat. Por ejemplo, en un hotel de 4 estrellas de L'Hospitalet pagas {hosp4} de recargo más {rest4} de tarifa autonómica: **{hosp4total} por persona y noche**. Estos son los recargos que publica la Agència Tributària de Catalunya, vigentes hasta el 31 de marzo de 2027:",
    ],
    muniCaption: "Recargo municipal fuera de Barcelona, por persona y unidad de estancia (1/10/2026–31/3/2027)",
    muniHeaders: { municipality: "Municipio", hotel5: "Hotel 5★", hotel4: "Hotel 4★", flat: "Vivienda de uso turístico", hostel: "Albergue", other: "Resto" },
    muniNote:
      "Agència Tributària de Catalunya, consultada el 30 de octubre de 2026. Se suma a la tarifa de la Generalitat. «—»: la ATC no publica recargo para esa categoría. Las cifras de Esplugues son las que publica la ATC. No se incluyen los recargos de cruceros de Castelldefels y El Prat.",
    special:
      "Hay además una tarifa especial para los establecimientos de un centro recreativo turístico situados en las zonas donde se admite el juego: {te1} en hoteles de 5 estrellas, {te2} en los de 4 y {te3} en el resto, por persona y noche.",

    faqTitle: "Preguntas frecuentes sobre la tasa turística",
    faq: [
      { question: "¿Cuánto es la tasa turística en Barcelona?", answer: "De {bcnMin} a {bcnMax} por persona y noche hasta el 31 de marzo de 2027: {bcnHostel} en un albergue de juventud, {bcn4} en un hotel de 4 estrellas, {bcnFlat} en una vivienda de uso turístico y {bcn5} en un hotel de 5 estrellas. Incluye {bcnSur} de recargo municipal." },
      { question: "¿Cuánto es la tasa turística en Cataluña fuera de Barcelona?", answer: "La tarifa de la Generalitat va de {restHostel} (albergue) a {rest5} (hotel de 5 estrellas) por persona y noche; {rest4} en un hotel de 4 estrellas. En Castelldefels, Esplugues, L'Hospitalet, El Prat, Sabadell, Sant Cugat y Sant Just Desvern se suma un recargo municipal." },
      { question: "¿Los niños pagan la tasa turística?", answer: "No. Las personas de {age} años o menos están exentas." },
      { question: "¿Cuántas noches se paga la tasa turística?", answer: "Como máximo {max} por persona en una estancia continuada en el mismo establecimiento; si cambias de alojamiento, el cómputo empieza de nuevo." },
      { question: "¿Sube la tasa turística en 2027?", answer: "Sí, el 1 de abril de 2027: en Barcelona el recargo municipal pasa de {s0} a {s1} por persona y noche, y fuera de Barcelona sube la tarifa de la Generalitat (en un hotel de 4 estrellas, de {rest4} a {rest4next})." },
      { question: "¿Quién cobra la tasa turística?", answer: "El alojamiento, que la cobra a quien se aloja y la declara. En la factura debe aparecer separada del precio, con las unidades de estancia y la tarifa aplicada." },
    ],

    futureTitle: "Qué cambia el 1 de abril de 2027",
    future: [
      "La Generalitat ya tiene aprobadas tarifas superiores para el resto de Cataluña a partir del 1 de abril de 2027. Estas son las que constan oficialmente:",
    ],
    futureCaption: "Tarifas fuera de Barcelona desde el 1 de abril de 2027",
    futureHeaders: { type: "Tipo de alojamiento", rate: "Tarifa" },
    barcelonaFutureTitle: "¿Y en Barcelona?",
    barcelonaFuture: [
      "El recargo municipal de Barcelona sube cada 1 de abril hasta 2029, según la Ordenanza fiscal 2.2 del Ayuntamiento: **{s0}** hasta el 31 de marzo de 2027, **{s1}** del 1 de abril de 2027 al 31 de marzo de 2028, **{s2}** hasta el 31 de marzo de 2029 y **{s3}** a partir de entonces, el máximo que permite la ley. La tarifa de la Generalitat para Barcelona no cambia.",
      "Así, el 1 de abril de 2027 un hotel en Barcelona pagará **{step} más por persona y noche**. La calculadora ya aplica estos importes según la fecha.",
    ],

    childrenTitle: "¿Los niños pagan?",
    children: [
      "Las personas de **16 años o menos están exentas**. Dicho de otro modo: los menores de 17 años no pagan el impuesto, siempre que pueda acreditarse la edad según los requisitos aplicables.",
      "Existen otras exenciones previstas legalmente, como determinadas estancias vinculadas a motivos de salud, programas sociales públicos o supuestos de fuerza mayor. Si crees que tu caso encaja, consulta la fuente oficial antes de reclamar nada al establecimiento.",
    ],

    nightsTitle: "¿Cuántas noches se pagan?",
    nights: [
      "El cálculo tiene un máximo de **siete unidades de estancia por persona** dentro de una estancia continuada en el mismo establecimiento.",
      "Esto importa en viajes largos. Diez noches en el mismo hotel dentro de la misma estancia no se multiplican por diez: el máximo computable son siete. Ojo al matiz: **misma persona, mismo establecimiento, periodo continuado**. Cambiar de hotel a mitad de viaje inicia un cómputo nuevo.",
    ],

    examplesTitle: "Ejemplos con números reales",
    examplesIntro:
      "Todos los cálculos usan las tarifas verificadas y pueden reproducirse en la calculadora.",
    exampleLabels: { scenario: "Caso", calculation: "Cálculo", total: "Total" },
    examples: [
      { scenario: "Pareja, 4 noches, hotel de 4 estrellas en Barcelona" },
      {
        scenario: "2 adultos y 2 menores exentos, 4 noches, vivienda de uso turístico en Barcelona",
        note: "Solo tributan los dos adultos.",
      },
      {
        scenario: "2 adultos, 10 noches, hotel de 5 estrellas en Barcelona",
        note: "El máximo computable son siete unidades por persona, no diez.",
      },
      {
        scenario: "2 adultos, 4 noches, hotel de 4 estrellas fuera de Barcelona",
        note: "En un municipio sin recargo municipal.",
      },
    ],

    bookingTitle: "¿Y si reservé antes de una subida?",
    booking: [
      "Reservar antes **no congela automáticamente** la tarifa. Es un error muy extendido.",
      "La normativa permite aplicar la tarifa vigente en el momento de la reserva cuando en ese mismo momento se satisfacen tanto el importe de la reserva como el del impuesto y los recargos correspondientes. Es decir: depende de si también pagaste el impuesto entonces, no solo de la fecha en que reservaste.",
      "Si tu estancia cae a caballo de un cambio de tarifa, mira qué dice exactamente el documento de reserva y qué importe te ha cobrado el establecimiento.",
    ],

    whoTitle: "¿Quién cobra la tasa?",
    who: [
      "El contribuyente es quien realiza la estancia, pero quien la cobra y la declara es el alojamiento, que actúa como sustituto del contribuyente.",
      "En la factura, el importe del impuesto debe mostrarse **separado** del precio del alojamiento, con las unidades de estancia y la tarifa aplicada. Si no aparece así, tienes motivo para preguntar.",
    ],

    whyTitle: "Por qué existe",
    why: [
      "Desde abril de 2026, una parte de los ingresos del impuesto se destina a políticas de vivienda de la Generalitat y el resto al Fondo para el Fomento del Turismo.",
    ],

    closingTitle: "Guarda esta página",
    closing: [
      "Esta es una página sensible a los cambios normativos: las tarifas se mueven el 1 de abril y los recargos municipales pueden aparecer en cualquier momento. La mantendremos en la misma dirección y la revisaremos cuando cambie algo oficial.",
    ],
  },

  en: {
    path: "guides/barcelona-catalonia-tourist-tax",
    title: "Barcelona tourist tax: what you'll actually pay",
    seoTitle: "Barcelona tourist tax 2026: €{minInt} to €{maxInt} per person per night",
    seoDescription:
      "Barcelona city tax: €{minInt} to €{maxInt} per person per night (Catalan rate + €{surInt} city surcharge). Max {max} nights; {age} or younger free. Calculator.",
    excerpt:
      "What the tourist tax really costs, by where you stay, how many guests are liable and how many nights. With a calculator and verified official rates.",

    lead: [
      "Barcelona's tourist tax (city tax) is **{bcnMin} to {bcnMax} per person per night** until 31 March 2027, depending on the accommodation: the Catalan rate plus the city council's {bcnSur} surcharge. A four-star hotel costs **{bcn4}** a night; a licensed tourist dwelling, **{bcnFlat}**.",
      "Its official name is the tax on stays in tourist establishments (IEET). It is charged for at most {max} nights per person, guests aged {age} or younger are exempt, and elsewhere in Catalonia the rate is lower, except in seven municipalities with their own surcharge. What you pay depends on **where you sleep, the type of accommodation, how many guests are liable, and how many nights**.",
    ],
    directAnswerTitle: "Quick answer",
    directAnswer:
      "A four-star hotel in Barcelona costs **{bcn4} per person per night** ({bcn4reg} regional rate plus {bcn4sur} municipal surcharge): for two people over four nights, {couple4}. The same hotel in a municipality without a surcharge: {rest4} per person per night (double that in L'Hospitalet, Sabadell, Sant Cugat and four other towns). Guests aged {age} or younger pay nothing, and the count stops at {max} nights per person.",

    keyFactsTitle: "Key facts",
    keyFactLabels: {
      surcharge: "Barcelona municipal surcharge",
      maxUnits: "Maximum taxable stay units",
      exemption: "Age exemption",
      scope: "Outside Barcelona",
      verified: "Last verified",
      review: "Next review",
    },
    keyFactValues: {
      exemption: "16 or younger",
      scope: "Municipal surcharge in force since 1 Oct 2026 in Castelldefels, Esplugues, L'Hospitalet, El Prat, Sabadell, Sant Cugat and Sant Just Desvern",
      verified: "30 October 2026",
      review: "1 December 2026",
    },

    barcelonaTitle: "How much is the city tax in Barcelona?",
    barcelona: [
      "In Barcelona the final amount is two figures added together: the **Catalonia-wide rate** and the **city council's municipal surcharge**.",
    ],
    barcelonaCaption: "Tourist tax in Barcelona, per liable guest per stay unit",

    restTitle: "Tourist tax elsewhere in Catalonia",
    rest: [
      "Regional rates are much lower outside Barcelona. But since **1 October 2026** seven municipalities have charged their own surcharge: **Castelldefels, Esplugues de Llobregat, L'Hospitalet de Llobregat, El Prat de Llobregat, Sabadell, Sant Cugat del Vallès and Sant Just Desvern**. In a four-star hotel, for example, the surcharge equals the regional rate, doubling it.",
      "The table below shows the regional part only, which is what you pay in any municipality without a surcharge. The Catalan Tax Agency publishes the list of municipalities with a surcharge, and it may grow.",
    ],
    restCaption: "Tourist tax outside Barcelona, per liable guest per stay unit",

    tableHeaders: {
      type: "Accommodation type",
      regional: "Catalonia rate",
      surcharge: "Surcharge",
      total: "Total",
    },
    noSurcharge: "Needs checking",
    tableNote:
      "Rates verified on 30 October 2026 against the Catalan Tax Agency. Amount per liable guest per stay unit.",

    muniTitle: "Tourist tax in L'Hospitalet, Sabadell, Sant Cugat and the other towns with a surcharge",
    muni: [
      "Since 1 October 2026, seven municipalities have added their own surcharge to the Catalan rate. In a four-star hotel in L'Hospitalet, for example, you pay a {hosp4} surcharge plus the {rest4} regional rate: **{hosp4total} per person per night**. These are the surcharges the Catalan Tax Agency publishes, valid until 31 March 2027:",
    ],
    muniCaption: "Municipal surcharge outside Barcelona, per liable guest per stay unit (1 Oct 2026–31 Mar 2027)",
    muniHeaders: { municipality: "Municipality", hotel5: "5★ hotel", hotel4: "4★ hotel", flat: "Tourist dwelling", hostel: "Youth hostel", other: "Other" },
    muniNote:
      "Catalan Tax Agency (ATC), read on 30 October 2026. Added to the Catalan rate. \"—\": the ATC lists no surcharge for that category. Esplugues figures are as the ATC publishes them. Cruise surcharges in Castelldefels and El Prat are not shown.",
    special:
      "There is also a special rate for establishments inside a tourist recreation centre in the areas where gaming is allowed: {te1} in five-star hotels, {te2} in four-star hotels and {te3} elsewhere, per person per night.",

    faqTitle: "Tourist tax: frequently asked questions",
    faq: [
      { question: "How much is the tourist tax in Barcelona?", answer: "{bcnMin} to {bcnMax} per person per night until 31 March 2027: {bcnHostel} in a youth hostel, {bcn4} in a four-star hotel, {bcnFlat} in a licensed tourist dwelling and {bcn5} in a five-star hotel. That includes the {bcnSur} municipal surcharge." },
      { question: "How much is the tourist tax elsewhere in Catalonia?", answer: "The Catalan rate runs from {restHostel} (youth hostel) to {rest5} (five-star hotel) per person per night; {rest4} in a four-star hotel. Castelldefels, Esplugues, L'Hospitalet, El Prat, Sabadell, Sant Cugat and Sant Just Desvern add a municipal surcharge." },
      { question: "Do children pay the tourist tax?", answer: "No. Guests aged {age} or younger are exempt." },
      { question: "How many nights is the tourist tax charged for?", answer: "At most {max} per person for one continuous stay at the same establishment; if you change accommodation, the count starts again." },
      { question: "Is the tourist tax going up in 2027?", answer: "Yes, on 1 April 2027: Barcelona's municipal surcharge rises from {s0} to {s1} per person per night, and the Catalan rate rises outside Barcelona (from {rest4} to {rest4next} in a four-star hotel)." },
      { question: "Who collects the tourist tax?", answer: "The accommodation, which charges it to the guest and files it. On the invoice it must be shown separately from the price, with the stay units and the rate applied." },
    ],

    futureTitle: "What changes on 1 April 2027",
    future: [
      "Catalonia has already legislated higher regional rates for accommodation outside Barcelona from 1 April 2027. These are the figures on record:",
    ],
    futureCaption: "Rates outside Barcelona from 1 April 2027",
    futureHeaders: { type: "Accommodation type", rate: "Rate" },
    barcelonaFutureTitle: "And in Barcelona?",
    barcelonaFuture: [
      "Barcelona's municipal surcharge rises every 1 April until 2029, under the city's Fiscal Ordinance 2.2: **{s0}** until 31 March 2027, **{s1}** from 1 April 2027 to 31 March 2028, **{s2}** until 31 March 2029 and **{s3}** from then on, the legal maximum. The Catalan rate for Barcelona does not change.",
      "So from 1 April 2027 a Barcelona hotel stay costs **{step} more per person per night**. The calculator already applies these amounts by date.",
    ],

    childrenTitle: "Do children pay?",
    children: [
      "People aged **16 or younger are exempt**. In other words, under-17s do not pay the tax, subject to the documentation requirements set by the authorities.",
      "Other specific exemptions exist in law, including qualifying stays connected with healthcare, certain publicly funded social programmes and force majeure. If you think your case qualifies, check the official source before raising it with the accommodation.",
    ],

    nightsTitle: "Is there a maximum number of nights?",
    nights: [
      "Yes. The tax is capped at **seven stay units per person** within one continuous stay at the same establishment.",
      "This matters on longer trips. Ten nights at the same hotel in one continuous stay are not multiplied by ten: seven is the maximum counted. Note the wording though — **same person, same establishment, continuous period**. Changing hotel mid-trip starts a fresh count.",
    ],

    examplesTitle: "Worked examples",
    examplesIntro:
      "Every figure below uses the verified rates and can be reproduced in the calculator.",
    exampleLabels: { scenario: "Scenario", calculation: "Calculation", total: "Total" },
    examples: [
      { scenario: "Couple, 4 nights, four-star hotel in Barcelona" },
      {
        scenario: "2 adults and 2 exempt children, 4 nights, tourist dwelling in Barcelona",
        note: "Only the two adults are liable.",
      },
      {
        scenario: "2 adults, 10 nights, five-star hotel in Barcelona",
        note: "Seven units per person is the maximum counted, not ten.",
      },
      {
        scenario: "2 adults, 4 nights, four-star hotel outside Barcelona",
        note: "In a municipality with no municipal surcharge.",
      },
    ],

    bookingTitle: "What if you booked before a rate rise?",
    booking: [
      "Booking early does **not** automatically lock in the old rate. This is a widespread misunderstanding.",
      "The rules allow the rate in force at the time of booking to apply when the accommodation payment and the tax — including any applicable surcharge — are also paid at that moment. So it depends on whether you paid the tax then, not merely on when you booked.",
      "If your stay straddles a rate change, check exactly what your booking confirmation says and what the accommodation has charged you.",
    ],

    whoTitle: "Who collects it?",
    who: [
      "The guest is the taxpayer, but the accommodation collects the tax and files it, acting as substitute for the taxpayer.",
      "On the invoice the tax must be shown **separately** from the accommodation charge, with the stay units and the rate applied. If it is not, you have grounds to ask why.",
    ],

    whyTitle: "Why it exists",
    why: [
      "Since April 2026, part of the revenue goes to the Catalan government's housing policies and the remainder to the Tourism Promotion Fund.",
    ],

    closingTitle: "Save this page",
    closing: [
      "This page is sensitive to regulatory change: rates move on 1 April and municipal surcharges can appear at any time. We will keep it at the same address and review it whenever something official changes.",
    ],
  },
};
