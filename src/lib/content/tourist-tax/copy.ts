import type { Locale } from "@/lib/i18n/config";

/** Editorial copy for the tourist tax guide. No figure is written here. */

export interface TaxCopy {
  path: string;
  title: string;
  seoTitle: string;
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
    title: "Taxa turística a Barcelona i Catalunya: quant pagaràs realment",
    seoTitle: "Taxa turística Barcelona 2026-2027: preus i calculadora",
    seoDescription:
      "Consulta la taxa turística actual de Barcelona i Catalunya, calcula quant pagaràs segons l'allotjament, les persones i les nits, i comprova les exempcions.",
    excerpt:
      "Quant costa realment la taxa turística segons on dorms, quantes persones tributen i quantes nits. Amb calculadora i tarifes oficials verificades.",

    lead: [
      "Allotjar-se a Barcelona afegeix una quantitat fixa per persona i per nit a la factura, i fora de Barcelona les tarifes són sensiblement més baixes. La diferència entre un cas i l'altre és prou gran com per notar-se en el pressupost d'un viatge curt.",
      "La quantitat exacta depèn de quatre coses: **on dorms, el tipus d'allotjament, quantes persones tributen i quantes unitats d'estada es computen**.",
    ],
    directAnswerTitle: "Resposta ràpida",
    directAnswer:
      "En un hotel de 4 estrelles a Barcelona pagues **{bcn4} per persona i nit** ({bcn4reg} de tarifa de la Generalitat més {bcn4sur} de recàrrec municipal): per a dues persones i quatre nits, {couple4}. El mateix hotel fora de Barcelona: {rest4} per persona i nit. Les persones de {age} anys o menys no paguen, i el càlcul s'atura a {max} nits per persona.",

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
      scope: "Un municipi pot tenir recàrrec propi des de l'1/10/2026",
      verified: "24 de setembre de 2026",
      review: "1 d'octubre de 2026",
    },

    barcelonaTitle: "Quant costa actualment a Barcelona",
    barcelona: [
      "A Barcelona l'import final suma dues quantitats: la **tarifa de la Generalitat** i el **recàrrec municipal de l'Ajuntament**.",
    ],
    barcelonaCaption: "Taxa turística a Barcelona, per persona i unitat d'estada",

    restTitle: "Quant costa a la resta de Catalunya",
    rest: [
      "Fora de Barcelona les tarifes autonòmiques són força més baixes. Ara bé, hi ha una novetat important: des de l'**1 d'octubre de 2026**, qualsevol municipi pot establir un recàrrec propi si l'ha aprovat per ordenança.",
      "No donem per suposat que un municipi en tingui, ni que no en tingui. Per això la taula següent mostra només la part autonòmica, i la calculadora no suma cap recàrrec que no haguem pogut verificar.",
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
      "Tarifes verificades el 24 de setembre de 2026 a l'Agència Tributària de Catalunya. Import per persona i unitat d'estada.",

    futureTitle: "Què canvia l'1 d'abril de 2027",
    future: [
      "La Generalitat ja té aprovades tarifes superiors per a la resta de Catalunya a partir de l'1 d'abril de 2027. Aquestes són les que consten oficialment:",
    ],
    futureCaption: "Tarifes fora de Barcelona des de l'1 d'abril de 2027",
    futureHeaders: { type: "Tipus d'allotjament", rate: "Tarifa" },
    barcelonaFutureTitle: "I a Barcelona?",
    barcelonaFuture: [
      "Aquí hem de ser honestos sobre el que sabem i el que no. El recàrrec municipal de Barcelona el fixa l'Ajuntament per ordenança, i la llei permet que arribi fins a 8 euros.",
      "**No hem pogut verificar quin serà l'import a partir de l'1 d'abril de 2027**, i per això no el publiquem ni el sumem a la calculadora. Preferim dir-t'ho a donar-te una xifra que no hem comprovat: si estàs pressupostant un viatge per a després d'aquesta data, consulta l'ordenança vigent.",
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
        note: "Sense cap recàrrec municipal verificat.",
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
    title: "Tasa turística en Barcelona y Cataluña: cuánto pagarás realmente",
    seoTitle: "Tasa turística Barcelona 2026-2027: precios y calculadora",
    seoDescription:
      "Consulta la tasa turística actual de Barcelona y Cataluña y calcula cuánto pagarás según alojamiento, personas, noches y fecha del viaje.",
    excerpt:
      "Cuánto cuesta realmente la tasa turística según dónde duermes, cuántas personas tributan y cuántas noches. Con calculadora y tarifas oficiales verificadas.",

    lead: [
      "Dormir en Barcelona añade una cantidad fija por persona y noche a la factura del alojamiento, y fuera de la ciudad las tarifas son bastante menores. La diferencia es lo bastante grande como para notarse en el presupuesto de un viaje corto.",
      "La cantidad depende de cuatro cosas: **dónde te alojas, el tipo de establecimiento, cuántas personas tributan y cuántas unidades de estancia se computan**.",
    ],
    directAnswerTitle: "Respuesta rápida",
    directAnswer:
      "En un hotel de 4 estrellas en Barcelona pagas **{bcn4} por persona y noche** ({bcn4reg} de tarifa autonómica más {bcn4sur} de recargo municipal): para dos personas y cuatro noches, {couple4}. El mismo hotel fuera de Barcelona: {rest4} por persona y noche. Las personas de {age} años o menos no pagan, y el cálculo se detiene en {max} noches por persona.",

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
      scope: "Un municipio puede tener recargo propio desde el 1/10/2026",
      verified: "24 de septiembre de 2026",
      review: "1 de octubre de 2026",
    },

    barcelonaTitle: "Tarifas actuales en Barcelona",
    barcelona: [
      "En Barcelona el importe final suma dos cantidades: la **tarifa autonómica de la Generalitat** y el **recargo municipal del Ayuntamiento**.",
    ],
    barcelonaCaption: "Tasa turística en Barcelona, por persona y unidad de estancia",

    restTitle: "¿Y fuera de Barcelona?",
    rest: [
      "Las tarifas autonómicas son claramente inferiores. Pero hay una novedad importante: desde el **1 de octubre de 2026**, cualquier municipio puede establecer un recargo propio si lo ha aprobado mediante ordenanza.",
      "No damos por supuesto que un municipio lo tenga, ni que no lo tenga. Por eso la tabla siguiente muestra solo la parte autonómica, y la calculadora no suma ningún recargo que no hayamos podido verificar.",
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
      "Tarifas verificadas el 24 de septiembre de 2026 en la Agència Tributària de Catalunya. Importe por persona y unidad de estancia.",

    futureTitle: "Qué cambia el 1 de abril de 2027",
    future: [
      "La Generalitat ya tiene aprobadas tarifas superiores para el resto de Cataluña a partir del 1 de abril de 2027. Estas son las que constan oficialmente:",
    ],
    futureCaption: "Tarifas fuera de Barcelona desde el 1 de abril de 2027",
    futureHeaders: { type: "Tipo de alojamiento", rate: "Tarifa" },
    barcelonaFutureTitle: "¿Y en Barcelona?",
    barcelonaFuture: [
      "Aquí conviene ser honesto sobre lo que sabemos y lo que no. El recargo municipal de Barcelona lo fija el Ayuntamiento por ordenanza, y la ley permite que llegue hasta 8 euros.",
      "**No hemos podido verificar cuál será el importe a partir del 1 de abril de 2027**, así que no lo publicamos ni lo sumamos en la calculadora. Preferimos decírtelo antes que darte una cifra sin comprobar: si estás presupuestando un viaje posterior a esa fecha, consulta la ordenanza vigente.",
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
        note: "Sin ningún recargo municipal verificado.",
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
    seoTitle: "Barcelona tourist tax 2026-2027: rates & calculator",
    seoDescription:
      "Check Barcelona and Catalonia tourist tax rates and calculate what you'll pay by accommodation type, guests, nights and travel date.",
    excerpt:
      "What the tourist tax really costs, by where you stay, how many guests are liable and how many nights. With a calculator and verified official rates.",

    lead: [
      "Staying in Barcelona adds a fixed amount per liable guest per night to your accommodation bill. Elsewhere in Catalonia the rates are considerably lower — the gap is big enough to matter on a short trip.",
      "What you pay depends on four things: **where you sleep, the type of accommodation, how many guests are liable, and how many stay units count**.",
    ],
    directAnswerTitle: "Quick answer",
    directAnswer:
      "A four-star hotel in Barcelona costs **{bcn4} per person per night** ({bcn4reg} regional rate plus {bcn4sur} municipal surcharge): for two people over four nights, {couple4}. The same hotel elsewhere in Catalonia: {rest4} per person per night. Guests aged {age} or younger pay nothing, and the count stops at {max} nights per person.",

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
      scope: "A municipality may levy its own surcharge from 1 Oct 2026",
      verified: "24 September 2026",
      review: "1 October 2026",
    },

    barcelonaTitle: "Barcelona tourist tax rates",
    barcelona: [
      "In Barcelona the final amount is two figures added together: the **Catalonia-wide rate** and the **city council's municipal surcharge**.",
    ],
    barcelonaCaption: "Tourist tax in Barcelona, per liable guest per stay unit",

    restTitle: "What if you stay elsewhere in Catalonia?",
    rest: [
      "The regional rates are markedly lower outside Barcelona. There is one important change to know about: from **1 October 2026**, any municipality may levy its own surcharge if it has approved one.",
      "We do not assume a municipality has one, and we do not assume it has none. The table below therefore shows only the regional part, and the calculator adds no surcharge we have not verified.",
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
      "Rates verified on 24 September 2026 against the Catalan Tax Agency. Amount per liable guest per stay unit.",

    futureTitle: "What changes on 1 April 2027",
    future: [
      "Catalonia has already legislated higher regional rates for accommodation outside Barcelona from 1 April 2027. These are the figures on record:",
    ],
    futureCaption: "Rates outside Barcelona from 1 April 2027",
    futureHeaders: { type: "Accommodation type", rate: "Rate" },
    barcelonaFutureTitle: "And in Barcelona?",
    barcelonaFuture: [
      "Here it is worth being straight about what is known and what is not. Barcelona's municipal surcharge is set by the city council through an ordinance, and the law allows it to reach €8.",
      "**We could not verify what the amount will be from 1 April 2027**, so we neither publish it nor add it in the calculator. We would rather tell you that than hand you a figure we have not checked: if you are budgeting a trip after that date, check the ordinance in force.",
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
        note: "With no verified municipal surcharge.",
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
