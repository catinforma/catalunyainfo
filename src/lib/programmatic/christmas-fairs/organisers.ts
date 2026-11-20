import type { FairDetails, OrganiserFair, PendingMarket, UnconfirmedFair } from "./types";

/**
 * What organisers have published on their own official pages and the open
 * data does not carry, carries with other dates, or carries without saying
 * the organiser has confirmed them. Kept by hand: every entry was read on its
 * page on the date given, and `quote` is the sentence that gives the dates,
 * as the page writes it. Add an entry only from the organiser's own page
 * (council, organising association) or an official listing (the Ajuntament de
 * Barcelona's guide, the Generalitat's cultural agenda); never from a listing
 * site or the press. `hours` only when that page gives this edition's hours.
 *
 * When the big markets publish (Lleida, Tarragona…), move them from
 * PENDING_MARKETS to ORGANISER_FAIRS: their town gets a page with the next
 * deploy, and an English one if it is in `EN_TOWNS` (paths.ts).
 *
 * Read on 30 Oct 2026:
 *   - the Generalitat's fairs calendar (updated 25 Sep 2026) gives Canyelles
 *     28-29 Nov; the council gives 21-22 Nov, which the pages show;
 *   - eight more councils have announced Christmas markets the calendar does
 *     not list (their calls for stallholders, all with 2026 in the text or the
 *     page date);
 *   - Figueres' call for stallholders (page valid 1 Oct - 2 Nov 2026, last
 *     modified 1 Oct 2026, in its metadata) says the market "es celebrarà" on
 *     the Rambla from 27 November to 24 December, while its standing page
 *     still says "Dates a determinar per 2026": the call is the newer page;
 *   - Vic's agenda lists the Fira d'Artesania de Nadal 2026 (5 Dec - 4 Jan).
 *
 * Re-read on 3 Nov 2026: the cultural agenda published Santa Llúcia in
 * Barcelona (27 Nov - 23 Dec), Canyelles and Vic; `alsoReplaces` folds the
 * last two into their council entries so each is listed once.
 *
 * 13 Nov 2026 (season push: the 30 towns with the most search impressions,
 * each organiser page opened with a browser user agent and grepped):
 *   - every quote below from 30 Oct / 3 Nov is still on its page;
 *   - the calendar (updated 9 Nov) still gives Canyelles 28-29 Nov;
 *   - organisers now confirm the calendar's 2026 dates for Espinelves,
 *     Cardedeu, Olot, Arbúcies, Banyoles, Balaguer, Tivissa, Tàrrega, Berga and
 *     Ascó (entries with `replaces` and the same dates: the page says
 *     "confirmed" and quotes them);
 *   - two organisers give other dates than the calendar: Ripoll's council
 *     agenda 5-8 Dec (calendar 5-6) and Caldes de Montbui an opening evening on
 *     4 Dec, 18-20 h, at the Font del Lleó only, then 5-8 Dec 10-20 h
 *     (calendar 5-8);
 *   - the Ajuntament de Barcelona's guide (guia.barcelona.cat) lists the
 *     Sagrada Família fair 21 Nov - 23 Dec 2026, 10-21 h daily, so it leaves
 *     PENDING_MARKETS, and Nadal al Port (Moll de la Fusta, 27 Nov 2026 - 6 Jan
 *     2027, 11-23 h), whose programme says it includes "el mercat de Nadal";
 *   - Girona's council agenda (fitxa 44370) lists the Mercat de Nadal "fins al
 *     05/01/27", opening "el divendres, 27 de novembre" (a Friday only in
 *     2026; the same fitxa's start reads "27/11/27", a typo), 10.30-21 h,
 *     closed 25-26 Dec and 1 Jan, 19 h closing on 24 and 31 Dec and 5 Jan;
 *   - firadesantallucia.cat still shows the 2025 text ("Del 28 de novembre al
 *     23 de desembre", © 2025) and barcelona.cat/nadal still lists 2025; the
 *     agenda's 2026 dates and hours stay, credited to the agenda.
 */
/**
 * Organiser sites that serve their pages on plain http only, linked as http
 * (the only exception to the https rule in tests/christmas-fairs.test.ts).
 * www.firadenadal.cat (Cardedeu), 13 Nov 2026: https presents the hosting
 * company's certificate (*.dadapro.com), which no browser accepts for this
 * name; http answers with the 2026 dates.
 */
export const HTTP_ONLY_HOSTS: readonly string[] = ["www.firadenadal.cat"];

const CANYELLES = "https://www.canyelles.cat";
const CANYELLES_APP = "https://www.santalluciacanyelles.cat";

/**
 * Canyelles, 24a Fira de Santa Llúcia (21-22 Nov 2026), read on 20 Nov 2026
 * with curl (browser user agent), every file opened:
 *   - the council's fair page (agenda: "Dis. 21 Nov, 2026 (9:00 - 21:00)",
 *     "Diu. 22 Nov, 2026 (9:00 - 21:00)") and its news of 16 Nov ("més de 350
 *     parades", the new mapping on the castle and the "nou espai de jocs
 *     màgics"; Gerard Romero, Ambaixador del Nadal; Manuel López, Escudellaire
 *     d'Honor);
 *   - the presentation of 11 Nov: the fair "s'ha avançat una setmana … a causa
 *     de la convocatòria d'eleccions al Congrés del pròxim 29 de novembre"; La
 *     Petita Santa Llúcia "els dies 28 i 29 de novembre", with "la Haima del
 *     Patge Reial Vibó, el Castell dels Contes Màgics, el Parc Noel i diverses
 *     exposicions"; "diverses zones d'aparcament" and the free shuttle "des de
 *     Vilanova i la Geltrú, Vilafranca del Penedès, Sitges i Sant Pere de Ribes";
 *   - the carols news of 16 Nov (17 h, Santa Magdalena: Saturday the Àuria
 *     flute quartet, Sunday Coral Pla del Bosc and Coral Flor d'Espígol);
 *   - the programme leaflet (PDF, created 6 Nov 2026), the fair map, the
 *     shuttle and the urban minibus timetables (PNG, "21 i 22 de novembre",
 *     "Els horaris poden veure's afectats per la situació del trànsit");
 *   - the fair's web app (linked from the council's page as "WEBAPP FIRA DE
 *     SANTA LLÚCIA"): "Aparcaments gratuïts. Hi ha diversos aparcaments
 *     habilitats al voltant del nucli antic", the same shuttle times, and
 *     "Compra les entrades anticipades a entradium.com" under the Park Nöel, the
 *     Castell dels Contes Màgics and the Patge Reial Vibó only. No page gives a
 *     price, or says entry to the fair is free: the page says neither.
 */
const CANYELLES_DETAILS: FairDetails = {
  readOn: "2026-11-20",
  times: { opens: "09:00", closes: "21:00" },
  why: {
    ca: "L'Ajuntament ha avançat la fira una setmana respecte de les dates previstes per les eleccions al Congrés del 29 de novembre; el calendari oficial de fires encara dona el 28 i el 29 de novembre.",
    es: "El Ayuntamiento ha adelantado la feria una semana respecto a las fechas previstas por las elecciones al Congreso del 29 de noviembre; el calendario oficial de ferias aún da el 28 y el 29 de noviembre.",
    en: "The council has brought the fair forward a week from the planned dates because of the general election on 29 November; the official fairs calendar still gives 28 and 29 November.",
  },
  programme: [
    {
      ca: "**Dissabte i diumenge, de 9 a 21 h:** més de 350 parades pels carrers del nucli antic, l'Arbre dels Desitjos, degustació d'escudella de Nadal (lateral de la Sala Multicultural) i de vi calent (carrer Major), la Botiga del Nadal, el pessebre de l'Ajuntament, el Pessebre Solidari del Casal i l'exposició de diorames (Ca la Pintora, carrer Major, 29).",
      es: "**Sábado y domingo, de 9 a 21 h:** más de 350 paradas por las calles del casco antiguo, el Arbre dels Desitjos (árbol de los deseos), degustación de escudella de Navidad (lateral de la Sala Multicultural) y de vino caliente (carrer Major), la Botiga del Nadal, el belén del Ayuntamiento, el Pessebre Solidari del Casal y la exposición de dioramas (Ca la Pintora, carrer Major, 29).",
      en: "**Saturday and Sunday, 9:00 to 21:00:** over 350 stalls in the streets of the old town, the Wishing Tree, tastings of Christmas escudella (beside the Sala Multicultural) and mulled wine (carrer Major), the Christmas shop, the nativity scene in the town hall, the charity nativity at the Casal and the diorama exhibition (Ca la Pintora, carrer Major, 29).",
    },
    {
      ca: "**Per als infants, de 9 a 20 h:** el Park Noël i la casa del Pare Noel (Pol Nord, pujada a l'església), el Castell dels Contes Màgics (dins del castell), el Patge Reial Vibó (jardins del castell), el Tió Gegant (plaça de l'Ajuntament), tallers de Nadal, la Casa de la Xocolata Calenta, l'exposició de Playmobil i el carrusel.",
      es: "**Para los niños, de 9 a 20 h:** el Park Noël y la casa de Papá Noel (Pol Nord, subida a la iglesia), el Castell dels Contes Màgics (dentro del castillo), el Paje Real Vibó (jardines del castillo), el Tió Gigante (plaza del Ayuntamiento), talleres de Navidad, la Casa de la Xocolata Calenta, la exposición de Playmobil y el carrusel.",
      en: "**For children, 9:00 to 20:00:** Park Noël and Father Christmas's house (Pol Nord, on the way up to the church), the Castle of Magic Tales (inside the castle), the Royal Page Vibó (castle gardens), the giant tió (town hall square), Christmas workshops, the hot chocolate house, a Playmobil exhibition and the carousel.",
    },
    {
      ca: "**Dissabte 21, a les 9 h**, obertura; **a les 12 h**, a la plaça de l'Onze de Setembre, benvinguda i proclamació de l'Ambaixador del Nadal (el periodista Gerard Romero) i de l'Escudellaire d'Honor (Manuel López); **a les 20 h**, piromusical nadalenc de Pirotècnia Igual.",
      es: "**Sábado 21, a las 9 h**, apertura; **a las 12 h**, en la plaza de l'Onze de Setembre, bienvenida y proclamación del Embajador de la Navidad (el periodista Gerard Romero) y del Escudellaire d'Honor (Manuel López); **a las 20 h**, piromusical navideño de Pirotècnia Igual.",
      en: "**Saturday 21:** opening at 9:00; **at 12:00**, in Plaça de l'Onze de Setembre, the welcome and the naming of the Christmas Ambassador (the journalist Gerard Romero) and the Escudellaire d'Honor (Manuel López); **at 20:00**, the Christmas fireworks-and-music show by Pirotècnia Igual.",
    },
    {
      ca: "**Diumenge 22, a les 11.30 h**, a la plaça de l'Onze de Setembre: lliurament de tions als nadons nascuts l'últim any i premis del concurs de dibuix «Viu la màgia del Nadal».",
      es: "**Domingo 22, a las 11.30 h**, en la plaza de l'Onze de Setembre: entrega de tions a los bebés nacidos el último año y premios del concurso de dibujo «Viu la màgia del Nadal».",
      en: "**Sunday 22, at 11:30**, in Plaça de l'Onze de Setembre: a tió (the Catalan Christmas log) for each baby born in the town in the last year, and the prizes of the children's drawing contest.",
    },
    {
      ca: "**Tots dos dies, a les 17 h**, nadales a l'església de Santa Magdalena (dissabte, el quartet de flautes travesseres Àuria; diumenge, la Coral Pla del Bosc i la Coral Flor d'Espígol), i música en directe a la plaça de l'Onze de Setembre, de 13 a 14.30 h i de 17.30 a 19 h.",
      es: "**Los dos días, a las 17 h**, villancicos en la iglesia de Santa Magdalena (sábado, el cuarteto de flautas traveseras Àuria; domingo, la Coral Pla del Bosc y la Coral Flor d'Espígol), y música en directo en la plaza de l'Onze de Setembre, de 13 a 14.30 h y de 17.30 a 19 h.",
      en: "**Both days, at 17:00**, carols in the church of Santa Magdalena (Saturday, the Àuria flute quartet; Sunday, the Pla del Bosc and Flor d'Espígol choirs), and live music in Plaça de l'Onze de Setembre, 13:00 to 14:30 and 17:30 to 19:00.",
    },
  ],
  news: [
    {
      ca: "Un mapping sobre la façana del castell, els dos dies de fira, i un espai nou de jocs màgics als jardins del castell.",
      es: "Un mapping sobre la fachada del castillo, los dos días de feria, y un espacio nuevo de juegos mágicos en los jardines del castillo.",
      en: "Projection mapping on the castle front on both days, and a new magic games area in the castle gardens.",
    },
  ],
  tickets: {
    ca: "El web de la fira ven entrades anticipades, a entradium.com, per a tres espais: el Park Noël, el Castell dels Contes Màgics i el Patge Reial Vibó. No hi indica el preu.",
    es: "La web de la feria vende entradas anticipadas, en entradium.com, para tres espacios: el Park Noël, el Castell dels Contes Màgics y el Paje Real Vibó. No indica el precio.",
    en: "The fair's website sells advance tickets, on entradium.com, for three spaces: Park Noël, the Castle of Magic Tales and the Royal Page Vibó. It does not give the price.",
  },
  after: {
    ca: "**La Petita Santa Llúcia, 28 i 29 de novembre:** el cap de setmana següent continuen oberts alguns espais, com la Haima del Patge Reial Vibó, el Castell dels Contes Màgics, el Parc Noel i diverses exposicions.",
    es: "**La Petita Santa Llúcia, 28 y 29 de noviembre:** el fin de semana siguiente siguen abiertos algunos espacios, como la Haima del Paje Real Vibó, el Castell dels Contes Màgics, el Parc Noel y varias exposiciones.",
    en: "**La Petita Santa Llúcia, 28 and 29 November:** the following weekend some spaces stay open, such as the Royal Page Vibó's tent, the Castle of Magic Tales, Parc Noel and several exhibitions.",
  },
  access: [
    {
      ca: "**Bus llançadora gratuït Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, dissabte i diumenge: surt de Vilanova (parada: Estació) a les 9, 11, 13, 15, 17 i 19 h, i de Vilafranca (estació d'autobusos) a les 10, 12, 14, 16, 18 i 20 h. De Canyelles cap a Vilafranca, a les 9.30, 11.30, 13.30, 15.30, 17.30 i 19.30 h; cap a Vilanova, a les 10.30, 12.30, 14.30, 16.30, 18.30 i 20.30 h.",
      es: "**Bus lanzadera gratuito Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, sábado y domingo: sale de Vilanova (parada: Estació) a las 9, 11, 13, 15, 17 y 19 h, y de Vilafranca (estación de autobuses) a las 10, 12, 14, 16, 18 y 20 h. De Canyelles hacia Vilafranca, a las 9.30, 11.30, 13.30, 15.30, 17.30 y 19.30 h; hacia Vilanova, a las 10.30, 12.30, 14.30, 16.30, 18.30 y 20.30 h.",
      en: "**Free shuttle bus Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, Saturday and Sunday: from Vilanova (stop: Estació) at 9:00, 11:00, 13:00, 15:00, 17:00 and 19:00, and from Vilafranca (bus station) at 10:00, 12:00, 14:00, 16:00, 18:00 and 20:00. From Canyelles to Vilafranca at 9:30, 11:30, 13:30, 15:30, 17:30 and 19:30; to Vilanova at 10:30, 12:30, 14:30, 16:30, 18:30 and 20:30.",
    },
    {
      ca: "**Bus llançadora gratuït Sitges – Sant Pere de Ribes – Canyelles:** surt de Sitges (Parc de Can Robert, costat Oasis) a les 10, 13 i 16 h i passa per Sant Pere de Ribes (plaça de Catalunya) deu minuts després; torna de Canyelles a les 13.30, 16.30 i 21 h.",
      es: "**Bus lanzadera gratuito Sitges – Sant Pere de Ribes – Canyelles:** sale de Sitges (Parc de Can Robert, junto a Oasis) a las 10, 13 y 16 h y pasa por Sant Pere de Ribes (plaza de Catalunya) diez minutos después; vuelve de Canyelles a las 13.30, 16.30 y 21 h.",
      en: "**Free shuttle bus Sitges – Sant Pere de Ribes – Canyelles:** from Sitges (Parc de Can Robert, next to Oasis) at 10:00, 13:00 and 16:00, calling at Sant Pere de Ribes (Plaça de Catalunya) ten minutes later; back from Canyelles at 13:30, 16:30 and 21:00.",
    },
    {
      ca: "**Des de Barcelona en tren:** l'R2 Sud para a Vilanova i la Geltrú, on el bus llançadora surt de l'Estació, i l'R4 a Vilafranca del Penedès, on surt de l'estació d'autobusos. L'Ajuntament avisa que els horaris dels autobusos poden variar pel trànsit.",
      es: "**Desde Barcelona en tren:** la R2 Sud para en Vilanova i la Geltrú, donde el bus lanzadera sale de la Estació, y la R4 en Vilafranca del Penedès, donde sale de la estación de autobuses. El Ayuntamiento avisa de que los horarios de los autobuses pueden variar por el tráfico.",
      en: "**From Barcelona by train:** the R2 Sud stops at Vilanova i la Geltrú, where the shuttle leaves from the Estació stop, and the R4 at Vilafranca del Penedès, where it leaves from the bus station. The council warns that bus times may vary with traffic.",
    },
    {
      ca: "**En cotxe:** aparcament gratuït en diverses zones habilitades al voltant del nucli antic (el plànol de la fira en marca al castell, a l'escola i al llarg de la C-15z); aparcament accessible a l'avinguda del Raval i al lateral de la C-15z. Dins del municipi, un minibús urbà gratuït enllaça els barris i les urbanitzacions amb el Poble.",
      es: "**En coche:** aparcamiento gratuito en varias zonas habilitadas alrededor del casco antiguo (el plano de la feria las marca en el castillo, en la escuela y a lo largo de la C-15z); aparcamiento accesible en la avenida del Raval y en el lateral de la C-15z. Dentro del municipio, un minibús urbano gratuito une los barrios y las urbanizaciones con el Poble (el centro).",
      en: "**By car:** free parking in several areas set up around the old town (the fair map shows them by the castle, at the school and along the C-15z); accessible parking on Avinguda del Raval and beside the C-15z. Within the municipality, a free minibus links the outlying districts and estates with the Poble (the centre).",
    },
  ],
  accessTitle: {
    ca: "Com arribar a la fira: bus llançadora gratuït i aparcament",
    es: "Cómo llegar a la feria: bus lanzadera gratis y aparcamiento",
    en: "Getting to the fair: free shuttle buses and parking",
  },
  snippet: {
    ca: "De 9 a 21 h, amb bus llançadora gratuït des de Vilanova, Vilafranca i Sitges.",
    es: "De 9 a 21 h, con bus lanzadera gratis desde Vilanova, Vilafranca y Sitges.",
    en: "9:00 to 21:00, with free shuttle buses from Vilanova, Vilafranca and Sitges.",
  },
  links: [
    { label: { ca: "Programa 2026 (PDF)", es: "Programa 2026 (PDF)", en: "2026 programme (PDF, Catalan)" }, url: `${CANYELLES}/documents/2026/2026_programa%20FSL_tr%C3%ADptic.pdf` },
    { label: { ca: "Plànol de la fira", es: "Plano de la feria", en: "Fair map" }, url: `${CANYELLES}/documents/2026/2026_11_21_planolfira.png` },
    { label: { ca: "Horaris del bus llançadora", es: "Horarios del bus lanzadera", en: "Shuttle bus timetable" }, url: `${CANYELLES}/documents/2026/2026_11_21_horaris_fsl_busllan%C3%A7adora.png` },
    { label: { ca: "Horaris del minibús urbà", es: "Horarios del minibús urbano", en: "Town minibus timetable" }, url: `${CANYELLES}/documents/2026/2026_11_21_horaris_fsl_minibusurba.png` },
    { label: { ca: "Activitats i entrades (web de la fira)", es: "Actividades y entradas (web de la feria)", en: "Activities and tickets (fair website)" }, url: `${CANYELLES_APP}/activitats` },
    { label: { ca: "Com arribar (web de la fira)", es: "Cómo llegar (web de la feria)", en: "Getting there (fair website)" }, url: `${CANYELLES_APP}/com-arribar` },
    {
      label: { ca: "Presentació de la 24a fira (Ajuntament)", es: "Presentación de la 24.ª feria (Ayuntamiento)", en: "Presentation of the 24th fair (council)" },
      url: `${CANYELLES}/fira-de-santa-llucia/presentacio-de-la-24a-fira-de-santa-llucia-i-el-programa-canyelles-es-nadal`,
    },
  ],
};

export const ORGANISER_FAIRS: readonly OrganiserFair[] = [
  {
    id: "org:canyelles-santa-llucia",
    ine: "08043",
    name: "24a Fira de Santa Llúcia",
    start: "2026-11-21",
    end: "2026-11-22",
    place: null,
    url: "https://www.canyelles.cat/promocio-economica-i-turisme/la-fira-de-santa-llucia",
    publisher: "Ajuntament de Canyelles",
    readOn: "2026-11-20",
    quote:
      "La 24a edició de la Fira de Santa Llúcia se celebra el 21 i 22 de novembre de 2026. … 24a Fira de Santa Llúcia Dis. 21 Nov, 2026 (9:00 - 21:00) 24a Fira de Santa Llúcia Diu. 22 Nov, 2026 (9:00 - 21:00)",
    replaces: "vm32:24033377",
    // The cultural agenda's listing (3 Nov 2026), with the council's dates.
    alsoReplaces: ["agenda:2026110300050"],
    hours: { ca: "dissabte i diumenge, de 9 a 21 h", es: "sábado y domingo, de 9 a 21 h", en: "Saturday and Sunday, 9:00 to 21:00" },
    details: CANYELLES_DETAILS,
  },
  {
    id: "org:barcelona-sagrada-familia",
    ine: "08019",
    name: "Fira de Nadal de la Sagrada Família",
    start: "2026-11-21",
    end: "2026-12-23",
    place: "Plaça de la Sagrada Família",
    url: "https://guia.barcelona.cat/detall/fira-de-nadal-a-la-sagrada-familia_99400017122.html",
    publisher: "Ajuntament de Barcelona (Guia BCN)",
    readOn: "2026-11-13",
    quote: "Cada dia de 10:00 h a 21:00 h … On Plaça Sagrada Familia Quan Des de 21/11/2026 al 23/12/2026",
    hours: { ca: "cada dia, de 10 a 21 h", es: "todos los días, de 10 a 21 h", en: "daily, 10:00 to 21:00" },
  },
  {
    id: "org:barcelona-santa-llucia",
    ine: "08019",
    name: "Fira de Santa Llúcia a l'Avinguda de la Catedral de Barcelona",
    start: "2026-11-27",
    end: "2026-12-23",
    place: "Avinguda de la Catedral",
    url: "https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020",
    publisher: "Agenda Cultural de Catalunya (Generalitat de Catalunya)",
    readOn: "2026-11-13",
    quote: "Inici: 27/11/2026 Fi: 23/12/2026 … Horari: de 10 a 21 h",
    replaces: "agenda:2026110300020",
    hours: { ca: "de 10 a 21 h", es: "de 10 a 21 h", en: "10:00 to 21:00" },
  },
  {
    id: "org:figueres-mercat-de-nadal",
    ine: "17066",
    name: "Mercat de Nadal",
    start: "2026-11-27",
    end: "2026-12-24",
    place: "La Rambla",
    url: "https://www.figueres.cat/tramits/convocatories/mercatnadal26",
    publisher: "Ajuntament de Figueres",
    readOn: "2026-11-13",
    quote: "L’Ajuntament de Figueres organitza el Mercat de Nadal, que es celebrarà a la Rambla de la ciutat del 27 de novembre al 24 de desembre.",
  },
  {
    id: "org:girona-mercat-de-nadal",
    ine: "17079",
    name: "Mercat de Nadal",
    start: "2026-11-27",
    end: "2027-01-05",
    place: "Plaça de la Independència",
    url: "https://www.girona.cat/agenda/cat/agenda_fitxa.php?id=44370&ta=age",
    publisher: "Ajuntament de Girona (Agenda de Girona)",
    readOn: "2026-11-13",
    quote:
      "El Mercat de Nadal s'inaugura el divendres, 27 de novembre. … Activitat de l'Agenda de Girona fins al – 05/01/27. … Horari: de 10.30 a 21 h. Horari tancament dies 24 i 31 de desembre i 5 de gener: 19 h. Dies que el mercat romandrà tancat: 25 i 26 de desembre i 1 de gener",
    hours: {
      ca: "de 10.30 a 21 h; el 24 i el 31 de desembre i el 5 de gener tanca a les 19 h; tancat el 25 i el 26 de desembre i l'1 de gener",
      es: "de 10.30 a 21 h; el 24 y el 31 de diciembre y el 5 de enero cierra a las 19 h; cerrado el 25 y el 26 de diciembre y el 1 de enero",
      en: "10:30 to 21:00; closes at 19:00 on 24 and 31 December and 5 January; closed on 25 and 26 December and 1 January",
    },
    closed: ["2026-12-25", "2026-12-26", "2027-01-01"],
  },
  {
    id: "org:barcelona-nadal-al-port",
    ine: "08019",
    name: "Fira Nadal al Port",
    start: "2026-11-27",
    end: "2027-01-06",
    place: "Moll de la Fusta",
    url: "https://guia.barcelona.cat/detall/fira-nadal-al-port_99400639592.html",
    publisher: "Ajuntament de Barcelona (Guia BCN)",
    readOn: "2026-11-13",
    quote: "Cada dia d'11.00 h a 23.00 h … On Moll de la Fusta Quan Des de 27/11/2026 al 06/01/2027",
    hours: { ca: "cada dia, d'11 a 23 h", es: "todos los días, de 11 a 23 h", en: "daily, 11:00 to 23:00" },
  },
  {
    id: "org:sant-antoni-de-vilamajor-un-nadal-com-cal",
    ine: "08198",
    name: "1a Fira «Un Nadal com cal»",
    start: "2026-11-28",
    end: "2026-11-29",
    place: "Plaça de la Vila",
    url: "https://www.santantonidevilamajor.cat/actualitat/noticies/busquem-artesanses-i-creadorses-per-omplir-de-magia-la-1a-fira-un-nadal-com-cal-de-sant-antoni-de-vilamajor.html",
    publisher: "Ajuntament de Sant Antoni de Vilamajor",
    readOn: "2026-11-13",
    quote: "Dates: dissabte 28 i diumenge 29 de novembre de 2026.",
  },
  {
    id: "org:asco-fira-de-nadal",
    ine: "43019",
    name: "XVII Fira de Nadal i XV Mostra del Cava",
    start: "2026-11-28",
    end: "2026-11-29",
    place: null,
    url: "https://www.asco.cat/esdeveniment/xvii-fira-de-nadal-i-xv-mostra-del-cava-vi-escumos-corpinat/",
    publisher: "Ajuntament d'Ascó",
    readOn: "2026-11-13",
    quote: "Esdeveniments de novembre 2026 … XVII FIRA DE NADAL I XV MOSTRA DEL CAVA – VI ESCUMÓS – CORPINAT 28 novembre a les 11:00 - 29 novembre a les 23:00",
    replaces: "vm32:24033607",
  },
  {
    id: "org:espinelves-fira-de-l-avet",
    ine: "17063",
    name: "45a Fira de l'Avet",
    start: "2026-11-28",
    end: "2026-12-08",
    place: null,
    url: "https://espinelves.cat/%f0%9f%8c%b2fira-de-lavet-2025-sollicituds-i-reglament-de-participacio/",
    publisher: "Ajuntament d'Espinelves",
    readOn: "2026-11-13",
    quote: "A aquesta notícia trobareu tota la informació relacionada amb la 45a Fira de l’Avet any 2026 – Del 28 de novembre al 8 de desembre de 2026.",
    replaces: "vm32:24032308",
  },
  {
    id: "org:caldes-de-montbui-mercat-de-nadal",
    ine: "08033",
    name: "Mercat de Nadal",
    start: "2026-12-04",
    end: "2026-12-08",
    place: null,
    url: "https://www.visiteucaldes.cat/04-fires/fires/",
    publisher: "Ajuntament de Caldes de Montbui (Visiteu Caldes)",
    readOn: "2026-11-13",
    quote: "FIRES 2026 … MERCAT DE NADAL 4 de desembre de 18 a 20h. Obertura. Només Plaça Font del Lleó. 5, 6, 7 i 8 de desembre de 10 a 20h. Centre Històric.",
    replaces: "vm32:24032937",
    hours: {
      ca: "divendres 4 de desembre, obertura de 18 a 20 h, només a la plaça de la Font del Lleó; del 5 al 8 de desembre, de 10 a 20 h, al centre històric",
      es: "viernes 4 de diciembre, apertura de 18 a 20 h, solo en la plaza de la Font del Lleó; del 5 al 8 de diciembre, de 10 a 20 h, en el centro histórico",
      en: "Friday 4 December, opening evening 18:00 to 20:00, at Plaça de la Font del Lleó only; 5 to 8 December, 10:00 to 20:00, in the old town",
    },
  },
  {
    id: "org:ripoll-fira-de-nadal",
    ine: "17147",
    name: "Fira de Nadal de Ripoll 2026",
    start: "2026-12-05",
    end: "2026-12-08",
    place: null,
    url: "https://ripoll.cat/activitat/fira-de-nadal-de-ripoll-2026/",
    publisher: "Ajuntament de Ripoll",
    readOn: "2026-11-13",
    quote: "Fira de Nadal de Ripoll 2026 5 desembre - 8 desembre … Aquest pont de la Puríssima, Ripoll es vesteix de Nadal i els seus carrers es converteixen en una gran festa! Quatre dies de música, espectacles, llums…",
    replaces: "vm32:24032983",
  },
  {
    id: "org:arbucies-fira-del-tio",
    ine: "17009",
    name: "Fira del Tió",
    start: "2026-12-05",
    end: "2026-12-06",
    place: null,
    url: "https://arbucies.cat/ca/agenda/festes.html",
    publisher: "Ajuntament d'Arbúcies",
    readOn: "2026-11-13",
    quote: "Fira del Tió Dissabte 5 i diumenge 6 de desembre de 2026",
    replaces: "vm32:24032545",
  },
  {
    id: "org:balaguer-santa-llucia",
    ine: "25040",
    name: "Mercat de Santa Llúcia - La fira dels alls",
    start: "2026-12-05",
    end: "2026-12-05",
    place: null,
    url: "https://www.balaguer.cat/portal/102/",
    publisher: "Paeria de Balaguer",
    readOn: "2026-11-13",
    quote: "Mercat de Santa Llúcia - La fira dels alls Propera edició: dissabte 5 de desembre de 2026",
    replaces: "vm32:24033337",
  },
  {
    id: "org:olot-fira-del-pessebre",
    ine: "17114",
    name: "Fira del Pessebre",
    start: "2026-12-05",
    end: "2026-12-07",
    place: "Al centre d'Olot",
    url: "https://www.olot.cat/files/doc8506/normativa-fira-pessebre-2026.pdf",
    publisher: "Ajuntament d'Olot (normativa de la Fira del Pessebre 2026)",
    readOn: "2026-11-13",
    quote: "CALENDARI … Fira del Pessebre 5, 6 i 7 de desembre Al centre d’Olot",
    replaces: "vm32:24032768",
  },
  {
    id: "org:tivissa-fira-de-nadal",
    ine: "43150",
    name: "XIV Fira de Nadal de Tivissa",
    start: "2026-12-05",
    end: "2026-12-06",
    place: null,
    url: "https://www.tivissa.cat/fira-de-nadal-a-tivissa/",
    publisher: "Ajuntament de Tivissa",
    readOn: "2026-11-13",
    quote: "Els dies 5 i 6 de desembre de 2026 torna la XIV Fira de Nadal de Tivissa!",
    replaces: "vm32:34895242",
  },
  {
    id: "org:vic-artesania-de-nadal",
    ine: "08298",
    name: "Fira d'Artesania de Nadal",
    start: "2026-12-05",
    end: "2027-01-04",
    place: "Plaça Major",
    url: "https://www.vic.cat/ciutat/agenda/fira-d-artesania-de-nadal-2026",
    publisher: "Ajuntament de Vic",
    readOn: "2026-11-13",
    quote: "FIRA D'ARTESANIA DE NADAL 2026 … On? Plaça Major Quan? 05/12/2026 a 00:00 fins a 04/01/2027 a 00:00",
    // The cultural agenda's listing (3 Nov 2026): same dates and place.
    alsoReplaces: ["agenda:2026110300029"],
  },
  {
    id: "org:berga-fira-del-joc-i-de-nadal",
    ine: "08022",
    name: "Fira del Joc i del Nadal",
    start: "2026-12-06",
    end: "2026-12-06",
    place: null,
    url: "https://www.ajberga.cat/ambits/fires",
    publisher: "Ajuntament de Berga",
    readOn: "2026-11-13",
    quote: "FIRA DEL JOC I DEL NADAL Instruccions per participar 6 de desembre de 2026",
    replaces: "vm32:24032523",
  },
  {
    id: "org:garriguella-mercat-de-nadal",
    ine: "17077",
    name: "6è Mercat de Nadal de Garriguella",
    start: "2026-12-08",
    end: "2026-12-08",
    place: "Plaça de l'Església",
    url: "https://garriguella.cat/obertes-les-inscripcions-per-participar-en-el-6e-mercat-de-nadal-de-garriguella/",
    publisher: "Ajuntament de Garriguella",
    readOn: "2026-11-13",
    quote: "L’Ajuntament de Garriguella obre el termini d’inscripcions per participar al 6è Mercat de Nadal de Garriguella, que se celebrarà dimarts 8 de desembre, de 9.00 h a 14.00 h, a la Plaça de l’Església.",
    hours: { ca: "de 9 a 14 h", es: "de 9 a 14 h", en: "9:00 to 14:00" },
  },
  {
    id: "org:altafulla-fira-de-nadal",
    ine: "43012",
    name: "Fira de Nadal",
    start: "2026-12-11",
    end: "2026-12-13",
    place: "Places de l'Església i del Pou",
    url: "https://altafulla.cat/noticies/l-ajuntament-d-altafulla-obre-les-inscripcions-per-participar-en-la-fira-de-nadal-2026_1589",
    publisher: "Ajuntament d'Altafulla",
    readOn: "2026-11-13",
    quote: "L’Ajuntament d’Altafulla ha obert el període d’inscripcions per participar com a expositor a la Fira de Nadal 2026, que se celebrarà els dies 11, 12 i 13 de desembre a les places de l’Església i del Pou.",
  },
  {
    id: "org:cardedeu-fira-de-nadal",
    ine: "08046",
    name: "Fira de Nadal i del Torró Artesà de Cardedeu",
    start: "2026-12-11",
    end: "2026-12-13",
    place: null,
    // The organiser's site answers on plain http only (its https certificate is
    // rejected by browsers: rows.ts WEB_REPLACEMENTS), so it is linked as http.
    url: "http://www.firadenadal.cat/",
    publisher: "Associació de Veïns del Centre de la Vila de Cardedeu",
    readOn: "2026-11-13",
    quote: "DIES 11 (19:00 h), 12 i 13 DE DESEMBRE DEL 2026",
    replaces: "vm32:24033117",
    hours: { ca: "comença el divendres 11 a les 19 h", es: "empieza el viernes 11 a las 19 h", en: "opens on Friday 11 at 19:00" },
  },
  {
    id: "org:tarrega-fira-d-artistes",
    ine: "25217",
    name: "27a Fira d'Artistes i Mercat de Nadal",
    start: "2026-12-11",
    end: "2026-12-13",
    place: null,
    url: "https://www.tarrega.cat/promocioeconomica-turisme/fires-i-mercats-1",
    publisher: "Ajuntament de Tàrrega",
    readOn: "2026-11-13",
    quote: "27a Fira d'Artistes i Mercat de Nadal | Del 11 al 13 de desembre de 2026",
    replaces: "vm32:24033189",
  },
  {
    id: "org:banyoles-fira-de-nadal",
    ine: "17015",
    name: "Fira de Nadal de Banyoles",
    start: "2026-12-12",
    end: "2026-12-13",
    place: null,
    url: "https://seu.banyoles.cat/Categories-de-tr%C3%A0mits/Promoci%C3%B3-econ%C3%B2mica/Fira-de-Nadal",
    publisher: "Ajuntament de Banyoles",
    readOn: "2026-11-13",
    quote: "Fira de Nadal Dates: 12 i 13 de desembre de 2026 (diumenge només matí)",
    replaces: "vm32:24033492",
    hours: { ca: "el diumenge, només al matí", es: "el domingo, solo por la mañana", en: "Sunday: mornings only" },
  },
  {
    id: "org:sant-pere-de-vilamajor-vila-claus",
    ine: "08234",
    name: "4a Fira de Nadal Vila Claus",
    start: "2026-12-12",
    end: "2026-12-13",
    place: "Parc de la Rectoria",
    url: "https://www.vilamajor.cat/actualitat/noticies/ja-es-poden-sollicitar-parades-per-a-la-4a-fira-de-nadal-vila-claus-2026.html",
    publisher: "Ajuntament de Sant Pere de Vilamajor",
    readOn: "2026-11-13",
    quote:
      "Ja es poden presentar les sol·licituds per participar amb una parada a la 4a Fira de Nadal Vila Claus de Sant Pere de Vilamajor, que aquest any se celebrarà durant dos dies, el dissabte 12 i el diumenge 13 de desembre de 2026, al parc de la Rectoria.",
  },
  {
    id: "org:roquetes-fira-de-nadal",
    ine: "43133",
    name: "32a Fira de Nadal de Roquetes",
    start: "2026-12-12",
    end: "2026-12-13",
    place: "Passeig Ramon Bosch i Rosell i Plaça dels Països Catalans",
    url: "https://roquetes.cat/web/obertes-les-inscripcions-per-participar-a-la-32a-fira-de-nadal-de-roquetes-%F0%9F%8E%84/",
    publisher: "Ajuntament de Roquetes",
    readOn: "2026-11-13",
    quote: "La fira se celebrarà els dies 12 i 13 de desembre de 2026, al Passeig Ramon Bosch i Rosell i la Plaça dels Països Catalans.",
  },
  {
    id: "org:cubelles-fira-de-nadal",
    ine: "08074",
    name: "Fira de Nadal de Cubelles",
    start: "2026-12-18",
    end: "2026-12-20",
    place: null,
    url: "https://www.cubelles.cat/cubelles-facil/promocio-economica/cubelles-recupera-la-fira-de-nadal-amb-un-format-renovat-inspirat-en-els-mercats-nadalencs-tradicionals.html",
    publisher: "Ajuntament de Cubelles",
    readOn: "2026-11-13",
    quote: "La fira se celebrarà del 18 al 20 de desembre i incorporarà les tradicionals casetes nadalenques, amb una oferta centrada en l'artesania, el comerç de proximitat i les activitats familiars.",
  },
  {
    id: "org:les-masies-de-voltrega-mercat-de-nadal",
    ine: "08117",
    name: "Mercat de Nadal de les Masies de Voltregà",
    start: "2026-12-18",
    end: "2026-12-20",
    place: null,
    url: "https://www.lesmasiesdevoltrega.cat/actualitat/noticies/obertes-les-inscripcions-per-participar-en-el-mercat-de-nadal-de-les-masies-de-voltrega.html",
    publisher: "Ajuntament de les Masies de Voltregà",
    readOn: "2026-11-13",
    quote:
      "L’Ajuntament de les Masies de Voltregà obre les inscripcions per a les persones artesanes, comerços, projectes i iniciatives que vulguin participar com a expositors al Mercat de Nadal de les Masies de Voltregà, que se celebrarà els dies 18, 19 i 20 de desembre de 2026.",
  },
];

/**
 * Calendar fairs whose organiser's own page was opened on 13 Nov 2026 and does
 * not carry the 2026 edition yet: the pages keep the calendar's dates (the
 * organiser registered them there) and say plainly that the organiser has not
 * confirmed them. Re-read these first on each pass; when one publishes, move
 * it to ORGANISER_FAIRS (with `replaces`) and drop it here.
 */
export const UNCONFIRMED_FAIRS: readonly UnconfirmedFair[] = [
  {
    fairId: "vm32:24032442",
    url: "https://www.manresaturisme.cat/activitats/fira-de-santa-llucia",
    publisher: "Manresa Turisme",
    readOn: "2026-11-13",
    shows: {
      ca: "La seva pàgina encara és la de l'edició del 2025 (dissabte 13 i diumenge 14 de desembre).",
      es: "Su página aún es la de la edición de 2025 (sábado 13 y domingo 14 de diciembre).",
      en: "Its page still shows the 2025 edition (Saturday 13 and Sunday 14 December).",
    },
  },
  {
    fairId: "vm32:24033611",
    url: "https://santceloni.cat/34917",
    publisher: "Ajuntament de Sant Celoni",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de la fira encara és la del 2025 (6 i 7 de desembre de 2025).",
      es: "La página de la feria aún es la de 2025 (6 y 7 de diciembre de 2025).",
      en: "The fair's page still shows 2025 (6 and 7 December 2025).",
    },
  },
  {
    fairId: "vm32:24032429",
    url: "https://solsonaturisme.com/",
    publisher: "Solsona Turisme",
    readOn: "2026-11-13",
    shows: {
      ca: "El web de turisme diu «El 5 de desembre se celebra una nova edició de la Fira del Tió», sense any.",
      es: "La web de turismo dice que el 5 de diciembre se celebra una nueva edición de la Fira del Tió, sin año.",
      en: "The tourism website says a new edition is held on 5 December, without a year.",
    },
  },
  {
    fairId: "vm32:24032398",
    url: "https://www.vallirana.cat/",
    publisher: "Ajuntament de Vallirana",
    readOn: "2026-11-13",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia la fira del 2026.",
      es: "La web del Ayuntamiento aún no anuncia la feria de 2026.",
      en: "The council's website does not announce the 2026 fair yet.",
    },
  },
  {
    fairId: "vm32:24033508",
    url: "https://guixols.cat/nadal",
    publisher: "Ajuntament de Sant Feliu de Guíxols",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara és la del 2025-2026.",
      es: "La página de Navidad del Ayuntamiento aún es la de 2025-2026.",
      en: "The council's Christmas page still shows 2025-2026.",
    },
  },
  {
    fairId: "vm32:24033327",
    url: "https://www.valls.cat/",
    publisher: "Ajuntament de Valls",
    readOn: "2026-11-13",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia el mercat del 2026.",
      es: "La web del Ayuntamiento aún no anuncia el mercado de 2026.",
      en: "The council's website does not announce the 2026 market yet.",
    },
  },
  {
    fairId: "vm32:24033249",
    url: "https://www.martorell.cat/nadal",
    publisher: "Ajuntament de Martorell",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara és la del 2025-2026.",
      es: "La página de Navidad del Ayuntamiento aún es la de 2025-2026.",
      en: "The council's Christmas page still shows 2025-2026.",
    },
  },
  {
    fairId: "vm32:24033323",
    url: "https://www.arbocenc.cat/",
    publisher: "Ajuntament de l'Arboç",
    readOn: "2026-11-13",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia la fira del 2026 (l'última que publica és la del 13 i 14 de desembre de 2025).",
      es: "La web del Ayuntamiento aún no anuncia la feria de 2026 (la última que publica es la del 13 y 14 de diciembre de 2025).",
      en: "The council's website does not announce the 2026 fair yet (the last it lists is 13-14 December 2025).",
    },
  },
  {
    fairId: "vm32:24033253",
    url: "https://www.balsareny.cat/",
    publisher: "Ajuntament de Balsareny",
    readOn: "2026-11-13",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia la fira del 2026.",
      es: "La web del Ayuntamiento aún no anuncia la feria de 2026.",
      en: "The council's website does not announce the 2026 fair yet.",
    },
  },
  {
    fairId: "vm32:24033306",
    url: "https://www.montgat.cat/turisme/festes-i-fires",
    publisher: "Ajuntament de Montgat",
    readOn: "2026-11-13",
    shows: {
      ca: "L'Ajuntament només diu que es fa «un diumenge al volts de Nadal al Parc del Tramvia», sense data del 2026.",
      es: "El Ayuntamiento solo dice que se hace un domingo cerca de Navidad en el Parc del Tramvia, sin fecha de 2026.",
      en: "The council only says it is held on a Sunday around Christmas in Parc del Tramvia, with no 2026 date.",
    },
  },
  {
    fairId: "vm32:24032332",
    url: "https://www.lapobladesegur.cat/ca/fira-de-nadal/",
    publisher: "Ajuntament de la Pobla de Segur",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de la fira és d'una edició anterior i no dona la data del 2026.",
      es: "La página de la feria es de una edición anterior y no da la fecha de 2026.",
      en: "The fair's page is from an earlier edition and gives no 2026 date.",
    },
  },
];

/**
 * The big markets people search for whose 2026 dates are not published yet,
 * each with the official page that will carry them. The hub lists them as
 * "not published yet"; none of them has a town page until its dates are out.
 * 13 Nov 2026: the Sagrada Família and Girona published and left this list.
 */
export const PENDING_MARKETS: readonly PendingMarket[] = [
  {
    id: "pending:lleida-mercat-de-nadal",
    ine: "25120",
    name: "Mercat de Nadal",
    url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal",
    publisher: "Paeria de Lleida",
    readOn: "2026-11-13",
    shows: {
      ca: "La Paeria només enllaça el calendari dels mercats de Nadal 2025-2026, a la plaça de la Catedral i voltants.",
      es: "La Paeria solo enlaza el calendario de los mercados de Navidad 2025-2026, en la plaza de la Catedral y alrededores.",
      en: "The city only links the 2025-2026 Christmas market calendar, on Plaça de la Catedral and around it.",
    },
  },
  {
    id: "pending:tarragona-fira-de-nadal",
    ine: "43148",
    name: "Fires de Nadal i d'Artesania",
    url: "https://www.tarragona.cat/la-ciutat/nadal-a-tarragona/",
    publisher: "Ajuntament de Tarragona",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara no dona dates per a les fires del 2026.",
      es: "La página de Navidad del Ayuntamiento aún no da fechas para las ferias de 2026.",
      en: "The council's Christmas page gives no dates for the 2026 fairs yet.",
    },
  },
  {
    id: "pending:sitges-nadal",
    ine: "08270",
    name: "Nadal a Sitges",
    url: "https://www.sitges.cat/serveis/nadal-a-sitges",
    publisher: "Ajuntament de Sitges",
    // 3 and 13 Nov 2026: the page answered with a login form, so this stays the 30 Oct reading.
    readOn: "2026-10-30",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara no anuncia cap fira ni mercat del 2026.",
      es: "La página de Navidad del Ayuntamiento aún no anuncia ninguna feria ni mercado de 2026.",
      en: "The council's Christmas page announces no 2026 fair or market yet.",
    },
  },
  {
    id: "pending:granollers-fires-de-nadal",
    ine: "08096",
    name: "Fires de Nadal",
    url: "https://www.granollers.cat/nadal/fires-de-nadal",
    publisher: "Ajuntament de Granollers",
    readOn: "2026-11-13",
    shows: {
      ca: "La pàgina de l'Ajuntament encara és la de l'edició 2025-2026.",
      es: "La página del Ayuntamiento aún es la de la edición 2025-2026.",
      en: "The council's page still shows the 2025-2026 edition.",
    },
  },
];
