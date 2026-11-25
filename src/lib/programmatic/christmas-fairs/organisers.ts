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
 * Re-read on 25 Nov 2026 (00:55-01:10 CET, curl with a browser user agent, every quote
 * below for a fair of 28 Nov - 8 Dec grepped on its page; downloads in a scratch dir):
 *   - Canyelles: the fair page is unchanged; the Petita Llúcia news was republished on
 *     24 Nov and now lists the Harry Potter space and Els Colors del Nadal; it says
 *     nothing of buses or parking for 28-29 Nov (the shuttle and minibus timetables are
 *     for 21-22 Nov);
 *   - Caldes de Montbui: programme PDF unchanged (last modified 4 Nov), the council's
 *     "Com arribar" page gives the public car parks and the Granollers and Sabadell bus lines;
 *   - Espinelves, Girona, Vic, Olot, Granollers, Vallirana, Barcelona (Santa Llúcia
 *     agenda updated 17 Nov, Sagrada Família, Nadal al Port), Ascó, Sant Antoni de
 *     Vilamajor, Ripoll, Arbúcies, Balaguer, Tivissa, Berga, Garriguella, Solsona,
 *     Figueres: dates, hours and places unchanged;
 *   - not readable: Terrassa, Reus and Sant Cugat (403/503 to curl and to the web
 *     fetch tool), Santa Coloma (self-signed certificate), Sitges (login form);
 *   - new in the 15 largest towns: Sabadell (Fira de Santa Llúcia), Mataró (Fira de
 *     Nadal), Badalona (Fira de Nadal Tradicional), Tarragona (Fira de Nadal and Fira
 *     d'Artesania). Hospitalet (Fira de Nadal i Reis from 11 Dec), Rubí (from 11 Dec)
 *     start after 8 Dec; Cornellà and Sant Boi publish nothing for the window.
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

/**
 * Towns whose page body stays as it was while their title test reads
 * (docs/SEO_EXPERIMENTS.md, 13 Nov 2026: "Body and description unchanged on
 * these pages"). INE -> last day of the hold. Their `details` stay in the
 * entry below but are not merged (data.ts), and their page leaves out the
 * blocks added since (the same-weekend links). tests/christmas-fairs.test.ts
 * fails the day after, until the entry is removed (or renewed and logged).
 * Espinelves: the title test reads again on 27 Nov; the fair opens on 28.
 */
// 20 Nov 2026: Espinelves' hold closed early (docs/SEO_EXPERIMENTS.md, 20 Nov, "Espinelves hold closed"):
// its positions fell from ~9 to 13-30 from 16 Nov, so the title test can no longer be read, and the fair opens on 28 Nov.
export const BODY_HOLDS: Readonly<Record<string, string>> = {};

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
  // 25 Nov 2026: fair page re-read (unchanged); the Petita Llúcia news was republished on 24 Nov (`after`).
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament de Canyelles", url: `${CANYELLES}/promocio-economica-i-turisme/la-fira-de-santa-llucia` },
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
  // Council news "Petita Llúcia. Exposicions Obertes el 28 i 29 de novembre"
  // ("Publicat el Dilluns, 23 Novembre 2026"), read 24 Nov 2026: "Els dies 28 i
  // 29 de novembre es mantenen obertes les exposicions de la 24a Fira de Santa
  // Llúcia de Canyelles, en el marc de la Petita Llúcia"; "Es podran visitar
  // Castell dels Contes Màgics, Patge Vibó, Park Noël, Play Mobil, Diorames,
  // Arbre dels Desitjos, Nadal de Colors, Pessebre solidari gegant del Casal,
  // pessebre de l'Ajuntament de Canyelles."; "Es manté la venda anticipada
  // d'entrades per a les exposicions CASTELL DELS CONTES MÀGICS, PATGE VIBÓ i
  // PARK NOëL. … També es podran adquirir de manera PRESENCIAL,de 9h a 20h, els
  // dies 28 i 29 de novembre, a les taquilles situades al Pol Nord, fins a
  // exhaurir les entrades."; "L'entrada és gratuïta per als infants de 0 a 3
  // anys"; "L'entrada costa 1 euro per a la resta de públic"; "L'horari de
  // l'exposició és de 9h a 21h". The council's agenda the same day: "Petita
  // Llúcia Dis. 28 Nov, 2026 (10:00 - 20:00)", "Diu. 29 Nov, 2026 (10:00 -
  // 20:00)" (the two pages give different hours: both are shown as written).
  // Re-read 25 Nov 2026: the council's news is now headed "Publicat el Dimarts, 24
  // Novembre 2026 13:08" and lists "Castell dels Contes Màgics, Patge Reial Vibó, Park
  // Noël, Exposició de Diorames, Exposició de Playmobil, Espai Harry Potter, Pessebre
  // Solidari, Pessebre de l'Ajuntament, Arbre dels Desitjos, Els Colors del Nadal";
  // "Són entrades individuals. Són vàlides per entrar a les exposicions de 9h a 21h el
  // dia per al qual s'han adquirit No hi ha horari d'entrada"; "L'entrada costa 1 euro
  // per a la resta de públic"; "Entrades limitades"; the box offices "de 9h a 20h".
  after: {
    ca: "**La Petita Llúcia, dissabte 28 i diumenge 29 de novembre:** no hi ha parades, però les exposicions de la fira continuen obertes: el Castell dels Contes Màgics, el Patge Reial Vibó, el Park Noël, els diorames, Playmobil, l'Espai Harry Potter, el Pessebre Solidari, el pessebre de l'Ajuntament, l'Arbre dels Desitjos i Els Colors del Nadal. La notícia de l'Ajuntament (24 de novembre) dona l'horari de les exposicions de 9 a 21 h; la seva agenda, de 10 a 20 h. Per al Castell dels Contes Màgics, el Patge Reial Vibó i el Park Noël cal entrada: 1 euro, gratuïta de 0 a 3 anys, individual, vàlida el dia comprat i sense hora d'entrada, i les entrades són limitades; es compren anticipades a Entradium.com o a les taquilles del Pol Nord, de 9 a 20 h, fins que s'exhaureixin.",
    es: "**La Petita Llúcia, sábado 28 y domingo 29 de noviembre:** no hay paradas, pero las exposiciones de la feria siguen abiertas: el Castell dels Contes Màgics, el Paje Real Vibó, el Park Noël, los dioramas, Playmobil, el Espai Harry Potter, el Pessebre Solidari, el belén del Ayuntamiento, el Arbre dels Desitjos y Els Colors del Nadal. La noticia del Ayuntamiento (24 de noviembre) da el horario de las exposiciones de 9 a 21 h; su agenda, de 10 a 20 h. Para el Castell dels Contes Màgics, el Paje Real Vibó y el Park Noël hace falta entrada: 1 euro, gratis de 0 a 3 años, individual, válida el día de compra y sin hora de entrada, y las entradas son limitadas; se compran anticipadas en Entradium.com o en las taquillas del Pol Nord, de 9 a 20 h, hasta agotarlas.",
    en: "**La Petita Llúcia, Saturday 28 and Sunday 29 November:** there are no stalls, but the fair's exhibitions stay open: the Castle of Magic Tales, the Royal Page Vibó, Park Noël, the dioramas, Playmobil, the Harry Potter space, the charity nativity, the town hall's nativity scene, the Wishing Tree and Els Colors del Nadal (the colours of Christmas). The council's news item (24 November) gives the exhibitions' hours as 9:00 to 21:00; its agenda says 10:00 to 20:00. The Castle of Magic Tales, the Royal Page Vibó and Park Noël need a ticket: 1 euro, free for children aged 0 to 3, individual, valid on the day bought with no entry time, and limited in number; buy in advance on Entradium.com or at the ticket desks at the Pol Nord, 9:00 to 20:00, while they last.",
  },
  access: [
    // 25 Nov 2026: the council's news on the Petita Llúcia (re-read, "Publicat el
    // Dimarts, 24 Novembre 2026 13:08") and its agenda give hours and tickets for 28 and
    // 29 Nov and say nothing of a shuttle bus or parking; the shuttle and minibus
    // timetables it links are headed "21 i 22 de novembre".
    {
      ca: "**La Petita Llúcia (28 i 29 de novembre):** la notícia de l'Ajuntament (24 de novembre) i la seva agenda no parlen de bus llançadora ni d'aparcament per a aquests dos dies; els horaris del bus llançadora i del minibús urbà que publica són els del 21 i 22 de novembre, els dies de la fira.",
      es: "**La Petita Llúcia (28 y 29 de noviembre):** la noticia del Ayuntamiento (24 de noviembre) y su agenda no hablan de bus lanzadera ni de aparcamiento para esos dos días; los horarios del bus lanzadera y del minibús urbano que publica son los del 21 y 22 de noviembre, los días de la feria.",
      en: "**La Petita Llúcia (28 and 29 November):** the council's news item (24 November) and its agenda mention no shuttle bus or parking for these two days; the shuttle and town minibus timetables it publishes are for 21 and 22 November, the fair days.",
    },
    {
      ca: "**Bus llançadora gratuït Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, dissabte 21 i diumenge 22 de novembre (els dies de la fira): surt de Vilanova (parada: Estació) a les 9, 11, 13, 15, 17 i 19 h, i de Vilafranca (estació d'autobusos) a les 10, 12, 14, 16, 18 i 20 h. De Canyelles cap a Vilafranca, a les 9.30, 11.30, 13.30, 15.30, 17.30 i 19.30 h; cap a Vilanova, a les 10.30, 12.30, 14.30, 16.30, 18.30 i 20.30 h.",
      es: "**Bus lanzadera gratuito Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, sábado 21 y domingo 22 de noviembre (los días de la feria): sale de Vilanova (parada: Estació) a las 9, 11, 13, 15, 17 y 19 h, y de Vilafranca (estación de autobuses) a las 10, 12, 14, 16, 18 y 20 h. De Canyelles hacia Vilafranca, a las 9.30, 11.30, 13.30, 15.30, 17.30 y 19.30 h; hacia Vilanova, a las 10.30, 12.30, 14.30, 16.30, 18.30 y 20.30 h.",
      en: "**Free shuttle bus Vilanova i la Geltrú – Canyelles – Vilafranca del Penedès**, Saturday 21 and Sunday 22 November (the fair days): from Vilanova (stop: Estació) at 9:00, 11:00, 13:00, 15:00, 17:00 and 19:00, and from Vilafranca (bus station) at 10:00, 12:00, 14:00, 16:00, 18:00 and 20:00. From Canyelles to Vilafranca at 9:30, 11:30, 13:30, 15:30, 17:30 and 19:30; to Vilanova at 10:30, 12:30, 14:30, 16:30, 18:30 and 20:30.",
    },
    {
      ca: "**Bus llançadora gratuït Sitges – Sant Pere de Ribes – Canyelles (21 i 22 de novembre):** surt de Sitges (Parc de Can Robert, costat Oasis) a les 10, 13 i 16 h i passa per Sant Pere de Ribes (plaça de Catalunya) deu minuts després; torna de Canyelles a les 13.30, 16.30 i 21 h.",
      es: "**Bus lanzadera gratuito Sitges – Sant Pere de Ribes – Canyelles (21 y 22 de noviembre):** sale de Sitges (Parc de Can Robert, junto a Oasis) a las 10, 13 y 16 h y pasa por Sant Pere de Ribes (plaza de Catalunya) diez minutos después; vuelve de Canyelles a las 13.30, 16.30 y 21 h.",
      en: "**Free shuttle bus Sitges – Sant Pere de Ribes – Canyelles (21 and 22 November):** from Sitges (Parc de Can Robert, next to Oasis) at 10:00, 13:00 and 16:00, calling at Sant Pere de Ribes (Plaça de Catalunya) ten minutes later; back from Canyelles at 13:30, 16:30 and 21:00.",
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
    {
      label: { ca: "La Petita Llúcia, 28 i 29 de novembre (Ajuntament)", es: "La Petita Llúcia, 28 y 29 de noviembre (Ayuntamiento)", en: "La Petita Llúcia, 28 and 29 November (council, Catalan)" },
      url: `${CANYELLES}/fira-de-santa-llucia/petita-llucia-exposicions-obertes-el-28-i-29-de-novembre`,
    },
  ],
};

const SANTA_LLUCIA_SITE = "https://firadesantallucia.cat";

/**
 * Barcelona, Fira de Santa Llúcia (27 Nov - 23 Dec 2026), the organiser's own
 * site, read on 20 Nov 2026 (it now shows "© Associació Fira de Santa Llúcia
 * 2026"; on 13 Nov it still showed 2025): home ("un total de 211 parades",
 * "181 parades dedicades exclusivament als productes nadalencs", "30 parades
 * d'artesania i articles de regal", "240 anys des de la primera data
 * documentada de la seva celebració, l'any 1786"), the calendar ("Laborables:
 * de 10:00 a 21:00 · Festius i vigílies: de 10:00 a 21:00"), the news (the
 * new star on the tree, "que supera els 14 metres d'alçada"), the activities
 * page ("Programació provisional a 2 de novembre": the giant tió's days and
 * hours, the Diada on 12 December) and "Com arribar" (metro L1 Catalunya or
 * Urquinaona, L3 Liceu or Catalunya, L4 Jaume I; buses 17, 19, 40, 45 and
 * 120; Bicing on the Avinguda; car parks on the Avinguda de la Catedral and
 * Avinguda de Francesc Cambó, "Entrada des de la Via Laietana"). The dates
 * stay credited to the Agenda Cultural entry below, as before.
 */
const SANTA_LLUCIA_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  times: { opens: "10:00", closes: "21:00" },
  organizer: { name: "Associació Fira de Santa Llúcia", url: `${SANTA_LLUCIA_SITE}/` },
  programme: [
    {
      ca: "**Cada dia, de 10 a 21 h**, feiners, festius i vigílies, a l'avinguda de la Catedral: 211 parades, 181 de pessebres, figures, molsa, arbres i guarniments de Nadal i 30 d'artesania i regals.",
      es: "**Todos los días, de 10 a 21 h**, laborables, festivos y vísperas, en la avenida de la Catedral: 211 paradas, 181 de belenes, figuras, musgo, árboles y adornos de Navidad y 30 de artesanía y regalos.",
      en: "**Every day, 10:00 to 21:00**, weekdays, holidays and eves alike, on Avinguda de la Catedral: 211 stalls, 181 with nativity scenes, figures, moss, trees and decorations, and 30 with crafts and gifts.",
    },
    {
      ca: "**Tió gegant** per a infants de menys de 12 anys: els dies 5, 6, 7, 8, 12, 13 i 19 de desembre, d'11 a 13.30 h i de 16.30 a 19.30 h; els dies 4, 11, 14, 15, 16, 17 i 18, només de 16.30 a 19.30 h.",
      es: "**Tió gigante** para niños de menos de 12 años: los días 5, 6, 7, 8, 12, 13 y 19 de diciembre, de 11 a 13.30 h y de 16.30 a 19.30 h; los días 4, 11, 14, 15, 16, 17 y 18, solo de 16.30 a 19.30 h.",
      en: "**Giant tió** (the Catalan Christmas log) for children under 12: on 5, 6, 7, 8, 12, 13 and 19 December, 11:00 to 13:30 and 16:30 to 19:30; on 4, 11, 14, 15, 16, 17 and 18 December, 16:30 to 19:30 only.",
    },
    {
      ca: "**Dissabte 12 de desembre, la Diada:** presentació a les 11 h, sortida de la Carassa a les 12 h, titelles de Nadal a les 12.05 h i lliurament del guardó de Firaire d'Honor a les 13.15 h (programa provisional del 2 de novembre).",
      es: "**Sábado 12 de diciembre, la Diada:** presentación a las 11 h, salida de la Carassa a las 12 h, títeres de Navidad a las 12.05 h y entrega del premio Firaire d'Honor a las 13.15 h (programa provisional del 2 de noviembre).",
      en: "**Saturday 12 December, the fair's Diada:** opening words at 11:00, the Carassa sets off at 12:00, Christmas puppets at 12:05 and the Firaire d'Honor award at 13:15 (provisional programme of 2 November).",
    },
  ],
  news: [
    {
      ca: "La fira celebra els 240 anys de la primera data documentada, el 1786, i estrena un estel que corona l'arbre de Nadal de la fira, de més de 14 metres d'alçada.",
      es: "La feria celebra los 240 años de la primera fecha documentada, 1786, y estrena una estrella que corona su árbol de Navidad, de más de 14 metros de altura.",
      en: "The fair marks 240 years since its first documented date, 1786, and its Christmas tree, over 14 metres tall, gets a new star on top.",
    },
  ],
  access: [
    {
      ca: "**Santa Llúcia, en transport públic** (l'organització el recomana, sobretot els caps de setmana i festius): metro L1 (Catalunya o Urquinaona), L3 (Liceu o Catalunya) i L4 (Jaume I); autobusos 17, 19, 40, 45 i 120; estació de Bicing a l'avinguda de la Catedral, davant dels números 4-6. **En cotxe:** aparcaments a l'avinguda de la Catedral i a l'avinguda de Francesc Cambó, amb entrada per la Via Laietana.",
      es: "**Santa Llúcia, en transporte público** (la organización lo recomienda, sobre todo los fines de semana y festivos): metro L1 (Catalunya o Urquinaona), L3 (Liceu o Catalunya) y L4 (Jaume I); autobuses 17, 19, 40, 45 y 120; estación de Bicing en la avenida de la Catedral, delante de los números 4-6. **En coche:** aparcamientos en la avenida de la Catedral y en la avenida de Francesc Cambó, con entrada por la Via Laietana.",
      en: "**Santa Llúcia by public transport** (the organisers recommend it, especially at weekends and on holidays): metro L1 (Catalunya or Urquinaona), L3 (Liceu or Catalunya) and L4 (Jaume I); buses 17, 19, 40, 45 and 120; a Bicing station on Avinguda de la Catedral, opposite numbers 4-6. **By car:** car parks on Avinguda de la Catedral and Avinguda de Francesc Cambó, entered from Via Laietana.",
    },
  ],
  links: [
    { label: { ca: "Fira de Santa Llúcia (web oficial)", es: "Fira de Santa Llúcia (web oficial)", en: "Fira de Santa Llúcia (official website)" }, url: `${SANTA_LLUCIA_SITE}/` },
    { label: { ca: "Horaris", es: "Horarios", en: "Opening hours" }, url: `${SANTA_LLUCIA_SITE}/calendari.php` },
    { label: { ca: "Activitats (programa provisional)", es: "Actividades (programa provisional)", en: "Activities (provisional programme)" }, url: `${SANTA_LLUCIA_SITE}/activitats.php` },
    { label: { ca: "Com arribar-hi", es: "Cómo llegar", en: "Getting there" }, url: `${SANTA_LLUCIA_SITE}/com_arribar.php` },
  ],
};

/**
 * Barcelona, Sagrada Família fair, the council's Guia BCN entry re-read on 20
 * Nov 2026: "reuneix més de 70 parades" (trees, decorations, nativity scenes,
 * gifts, food) and "Com a novetat, la fira incorpora la primera edició de la
 * Firetaventura Solidària, un espai amb entrada lliure destinat als infants".
 * No organiser site, programme or transport advice on that page.
 */
const SAGRADA_FAMILIA_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  times: { opens: "10:00", closes: "21:00" },
  programme: [
    {
      ca: "**Cada dia, de 10 a 21 h**, a la plaça de la Sagrada Família: més de 70 parades d'avets i guarniments, pessebres i figures, regals i productes com mel, torrons, formatges i embotits.",
      es: "**Todos los días, de 10 a 21 h**, en la plaza de la Sagrada Família: más de 70 paradas de abetos y adornos, belenes y figuras, regalos y productos como miel, turrones, quesos y embutidos.",
      en: "**Every day, 10:00 to 21:00**, on Plaça de la Sagrada Família: over 70 stalls with Christmas trees and decorations, nativity scenes and figures, gifts and food such as honey, turrón, cheese and cured meats.",
    },
  ],
  news: [
    {
      ca: "Primera edició de la Firetaventura Solidària, un espai per als infants i les famílies on, segons la Guia BCN, l'entrada és lliure.",
      es: "Primera edición de la Firetaventura Solidària, un espacio para niños y familias donde, según la Guia BCN, la entrada es libre.",
      en: "First edition of the Firetaventura Solidària, a space for children and families which, according to the Guia BCN, anyone can enter.",
    },
  ],
  links: [{ label: { ca: "Guia BCN: Fira de Nadal de la Sagrada Família", es: "Guia BCN: Fira de Nadal de la Sagrada Família", en: "Guia BCN: Sagrada Família Christmas fair" }, url: "https://guia.barcelona.cat/detall/fira-de-nadal-a-la-sagrada-familia_99400017122.html" }],
};

/**
 * Cardedeu, 31a Fira de Nadal i del Torró Artesà (11-13 Dec 2026), read on 20
 * Nov 2026 on the organiser's site (http only, see HTTP_ONLY_HOSTS): the
 * programme PDF ("PROGRAMA D'ACTIVITATS FIRA 2026", created 16 Nov 2026) and
 * the booklet PDF (created 12 Nov). They disagree on Friday's opening: the
 * home page and the booklet say "19:00 h", the programme "18:00 h Obertura del
 * recinte firal"; the page gives both. No parking, shuttle or transport
 * advice is published; the station section below comes from the Rodalies data.
 */
const CARDEDEU_DETAILS: FairDetails = {
  // 24 Nov 2026: the programme PDF re-fetched: same file (created 16 Nov 2026).
  readOn: "2026-11-24",
  why: {
    ca: "Divendres, el web i el llibret de la fira diuen que el recinte obre a les 19 h, i el programa del 16 de novembre, a les 18 h.",
    es: "El viernes, la web y el librito de la feria dicen que el recinto abre a las 19 h, y el programa del 16 de noviembre, a las 18 h.",
    en: "On Friday, the fair's website and booklet say the grounds open at 19:00; the programme of 16 November says 18:00.",
  },
  programme: [
    {
      ca: "**Dimarts 8 de desembre, a les 8.30 h:** encesa i benedicció del Foc de la Fira a l'ermita de Sant Hilari, i a les 12 h, baixada del Foc a l'església de Santa Maria.",
      es: "**Martes 8 de diciembre, a las 8.30 h:** encendido y bendición del Foc de la Fira en la ermita de Sant Hilari, y a las 12 h, bajada del fuego a la iglesia de Santa Maria.",
      en: "**Tuesday 8 December, 8:30:** the Fair's Fire is lit and blessed at the Sant Hilari hermitage, and at 12:00 carried down to the church of Santa Maria.",
    },
    {
      ca: "**Divendres 11, a les 19.30 h:** inauguració de la 31a fira, amb la convidada d'honor Queralt Albiñana i el pregó de Rosa Vila.",
      es: "**Viernes 11, a las 19.30 h:** inauguración de la 31.ª feria, con la invitada de honor Queralt Albiñana y el pregón de Rosa Vila.",
      en: "**Friday 11, 19:30:** the 31st fair opens, with guest of honour Queralt Albiñana and a speech by Rosa Vila.",
    },
    {
      ca: "**Dissabte 12**, obertura a les 10 h: gòspel a la plaça Sant Joan (12 h), xocolatada popular (17 h) i l'escudella de la fira a la plaça Sant Corneli (20 h).",
      es: "**Sábado 12**, apertura a las 10 h: góspel en la plaza Sant Joan (12 h), chocolatada popular (17 h) y la escudella de la feria en la plaza Sant Corneli (20 h).",
      en: "**Saturday 12**, open from 10:00: gospel in Plaça Sant Joan (12:00), hot chocolate for all (17:00) and the fair's escudella stew in Plaça Sant Corneli (20:00).",
    },
    {
      ca: "**Diumenge 13**, obertura a les 10 h: sardanes a la plaça Sant Joan (12.15 h), fer cagar el tió al carrer Cervantes, darrere el Mercat Municipal (17 h), màgia (18.30 h) i cloenda amb la retirada del foc (20.30 h).",
      es: "**Domingo 13**, apertura a las 10 h: sardanas en la plaza Sant Joan (12.15 h), hacer cagar el tió en la calle Cervantes, detrás del Mercat Municipal (17 h), magia (18.30 h) y clausura con la retirada del fuego (20.30 h).",
      en: "**Sunday 13**, open from 10:00: sardanes in Plaça Sant Joan (12:15), tió-beating for children in Carrer Cervantes, behind the Mercat Municipal (17:00), a magic show (18:30) and the closing, when the fire is taken down (20:30).",
    },
  ],
  tickets: {
    ca: "Les demostracions d'elaboració de torrons, amb reserva a l'estand de l'associació: 4 € per persona (6 € dues persones); la xerrada i tast «Els secrets de la xocolata», diumenge a les 11 h, 3 € (4 € dues persones).",
    es: "Las demostraciones de elaboración de turrones, con reserva en el estand de la asociación: 4 € por persona (6 € dos personas); la charla y cata «Els secrets de la xocolata», el domingo a las 11 h, 3 € (4 € dos personas).",
    en: "The turrón-making demonstrations, booked at the association's stand: 4 € per person (6 € for two); the chocolate talk and tasting on Sunday at 11:00, 3 € (4 € for two).",
  },
  after: {
    ca: "**Pessebre** a la capella de Sant Corneli, del 12 de desembre al 5 de gener de 2027.",
    es: "**Belén** en la capilla de Sant Corneli, del 12 de diciembre al 5 de enero de 2027.",
    en: "**Nativity scene** in the Sant Corneli chapel, 12 December to 5 January 2027.",
  },
  links: [
    { label: { ca: "Programa d'activitats 2026 (PDF)", es: "Programa de actividades 2026 (PDF)", en: "2026 programme (PDF, Catalan)" }, url: "http://www.firadenadal.cat/programa.pdf" },
    { label: { ca: "Llibret de la 31a fira (PDF)", es: "Librito de la 31.ª feria (PDF)", en: "31st fair booklet (PDF, Catalan)" }, url: "http://www.firadenadal.cat/llibret.pdf" },
  ],
};

/**
 * Arbúcies, Fira del Tió (5-6 Dec 2026): the 2026 programme leaflet the
 * council's tourism site links as "Programa de la Fira del Tió 2026" (PDF
 * created 18 Nov 2026; its cover: "5 i 6 de desembre de 2026"), read on 20
 * Nov from the rendered pages (the text layer is garbled): "Dissabte de 10 a
 * 19 h · Diumenge de 10 a 18 h · Carrer Camprodon i plaça de la Vila". The
 * 2026 stallholder rules say Sunday's closing "serà a les 15:00 … (l'horari de
 * tancament pot variar…)": the page gives the programme's hours and the
 * difference. The map marks parking with "P" but gives no text on it.
 */
const ARBUCIES_DETAILS: FairDetails = {
  // 25 Nov 2026: the programme PDF re-fetched: same file (created 18 Nov 2026), hours read again on the rendered page.
  readOn: "2026-11-25",
  why: {
    ca: "Horari del programa: dissabte de 10 a 19 h i diumenge de 10 a 18 h, al carrer Camprodon i la plaça de la Vila. Les normes per als paradistes fixen el tancament del diumenge a les 15 h, «pot variar».",
    es: "Horario del programa: sábado de 10 a 19 h y domingo de 10 a 18 h, en la calle Camprodon y la plaza de la Vila. Las normas para los paradistas fijan el cierre del domingo a las 15 h, «puede variar».",
    en: "Programme hours: Saturday 10:00 to 19:00 and Sunday 10:00 to 18:00, in Carrer Camprodon and Plaça de la Vila. The stallholders' rules set Sunday's closing at 15:00, \"subject to change\".",
  },
  programme: [
    {
      ca: "**Divendres 4, a les 19.30 h:** inauguració del Pessebre Gegant d'Arbúcies (carrer Camprodon, 71), obert fins al 31 de gener (excepte el 26 de desembre) i, durant la fira, de 16 a 20 h.",
      es: "**Viernes 4, a las 19.30 h:** inauguración del Pessebre Gegant d'Arbúcies (calle Camprodon, 71), abierto hasta el 31 de enero (excepto el 26 de diciembre) y, durante la feria, de 16 a 20 h.",
      en: "**Friday 4, 19:30:** the giant nativity scene opens (Carrer Camprodon, 71); open until 31 January (except 26 December) and, during the fair, 16:00 to 20:00.",
    },
    {
      ca: "**Dissabte 5:** «Anem a buscar el tió!» a les 11 h, des de la plaça de la Vila; concert de Joan Pinós i les Bestioles a les 12 h, i a les 18.15 h, a la plaça de la Vila, l'encesa dels llums de Nadal amb l'espectacle Correllums (làser, fum, música i dansa).",
      es: "**Sábado 5:** «Anem a buscar el tió!» a las 11 h, desde la plaza de la Vila; concierto de Joan Pinós i les Bestioles a las 12 h, y a las 18.15 h, en la plaza de la Vila, el encendido de las luces de Navidad con el espectáculo Correllums (láser, humo, música y danza).",
      en: "**Saturday 5:** \"Anem a buscar el tió!\" (go and find your tió) at 11:00 from Plaça de la Vila; Joan Pinós i les Bestioles in concert at 12:00, and at 18:15 in Plaça de la Vila the Christmas lights switch-on with the Correllums show (lasers, smoke, music and dance).",
    },
    {
      ca: "**Diumenge 6:** gimcana tionera d'11 a 13 h i concert i vermut tioner a les 12.30 h, a la plaça de la Vila; tots dos dies, mercat de Nadal d'artesania i regal i tallers per a infants.",
      es: "**Domingo 6:** gincana tionera de 11 a 13 h y concierto y vermut tioner a las 12.30 h, en la plaza de la Vila; los dos días, mercado de Navidad de artesanía y regalo y talleres para niños.",
      en: "**Sunday 6:** a tió treasure hunt 11:00 to 13:00 and a concert with vermouth at 12:30, in Plaça de la Vila; both days, a Christmas craft and gift market and children's workshops.",
    },
  ],
  tickets: {
    ca: "«Anem a buscar el tió!» demana reserva amb el codi QR del programa: 5 € amb el teu tió, 25 € amb tió inclòs.",
    es: "«Anem a buscar el tió!» pide reserva con el código QR del programa: 5 € con tu tió, 25 € con tió incluido.",
    en: "\"Anem a buscar el tió!\" needs booking with the QR code in the programme: 5 € with your own tió, 25 € with a tió included.",
  },
  access: [
    {
      ca: "**Aparcament:** el plànol del programa marca diverses zones d'aparcament al voltant del centre; no n'indica el preu.",
      es: "**Aparcamiento:** el plano del programa marca varias zonas de aparcamiento alrededor del centro; no indica el precio.",
      en: "**Parking:** the programme's map marks several parking areas around the centre; it gives no price.",
    },
  ],
  links: [
    { label: { ca: "Programa de la Fira del Tió 2026 (PDF)", es: "Programa de la Fira del Tió 2026 (PDF)", en: "Fira del Tió 2026 programme (PDF, Catalan)" }, url: "https://www.visitarbucies.com/uploads/files/entradas/fira-del-tio/diptic-fira-del-tio-sense-marques.pdf" },
    { label: { ca: "Fira del Tió (turisme d'Arbúcies)", es: "Fira del Tió (turismo de Arbúcies)", en: "Fira del Tió (Arbúcies tourism)" }, url: "https://www.visitarbucies.com/ca/activitats-i-esdeveniments/fires-i-festes/fira-del-tio.html" },
  ],
};

/**
 * Caldes de Montbui, Mercat de Nadal (4-8 Dec 2026): the programme PDF linked
 * from visiteucaldes.cat ("PROGRAMA MERCAT DE NADAL", PROGRAMA_MERCAT_NADAL_2026.pdf,
 * created 30 Oct 2026; "DEL 4 AL 8 DE DESEMBRE", Friday 4 as in 2026), read
 * on 20 Nov: "HORARI De 10 a 20 h · Divendres 4 de desembre, només de 18 a
 * 20 h", the opening with "primer tast del tradicional caldo de Nadal,
 * gratuït per a tothom" and "els 40 anys del Mercat", the caldo times and
 * prices, the children's programme and the rain plan. The council's tourism
 * page "Com arribar" gives the Sagalés buses from Barcelona ("e9 (per
 * autopista) · 202 i 203 (per carretera)").
 */
const CALDES_DETAILS: FairDetails = {
  // 24 Nov 2026: the programme PDF re-fetched: same file (created 30 Oct 2026).
  readOn: "2026-11-25",
  programme: [
    {
      ca: "**Divendres 4, a les 18 h**, a la plaça de la Font del Lleó: obertura del mercat amb el primer tast de caldo de Nadal, gratuït, i el Ball de Diables de Caldes, que celebra els 40 anys del mercat.",
      es: "**Viernes 4, a las 18 h**, en la plaza de la Font del Lleó: apertura del mercado con la primera cata de caldo de Navidad, gratuita, y el Ball de Diables de Caldes, que celebra los 40 años del mercado.",
      en: "**Friday 4, 18:00**, in Plaça de la Font del Lleó: the market opens with a first free tasting of Christmas broth and the Caldes devils' dance, marking the market's 40th year.",
    },
    {
      ca: "**Del 5 al 8, de 10 a 20 h**, al centre històric: casetes de fusta d'alimentació, artesania, antiguitats i brocanteria, cuina sobre rodes i activitats infantils. El caldo i la carn d'olla es fan amb aigua termal de la Font del Lleó: dissabte, llenties a les 12 h i caldo a les 17.30 h; diumenge i dilluns, a les 12 h i a les 17.30 h; dimarts, a les 12 h.",
      es: "**Del 5 al 8, de 10 a 20 h**, en el centro histórico: casetas de madera de alimentación, artesanía, antigüedades y brocante, cocina sobre ruedas y actividades infantiles. El caldo y la carn d'olla se hacen con agua termal de la Font del Lleó: sábado, lentejas a las 12 h y caldo a las 17.30 h; domingo y lunes, a las 12 h y a las 17.30 h; martes, a las 12 h.",
      en: "**5 to 8 December, 10:00 to 20:00**, in the old town: wooden huts with food, crafts, antiques and bric-a-brac, food trucks and children's activities. The broth and carn d'olla are made with thermal water from the Font del Lleó: Saturday, lentils at 12:00 and broth at 17:30; Sunday and Monday, at 12:00 and 17:30; Tuesday, at 12:00.",
    },
    {
      ca: "**Diumenge 6:** sardanes de Nadal a la plaça de l'Àngel (11.30 h) i fer cagar el tió a l'escenari de la plaça de Can Rius (12 h). Tallers i titelles a la plaça de Can Rius; si plou, les activitats infantils es fan a l'Espai Can Rius.",
      es: "**Domingo 6:** sardanas de Navidad en la plaza de l'Àngel (11.30 h) y hacer cagar el tió en el escenario de la plaza de Can Rius (12 h). Talleres y títeres en la plaza de Can Rius; si llueve, las actividades infantiles se hacen en el Espai Can Rius.",
      en: "**Sunday 6:** Christmas sardanes in Plaça de l'Àngel (11:30) and tió-beating on the Plaça de Can Rius stage (12:00). Workshops and puppet shows in Plaça de Can Rius; if it rains, the children's activities move to Espai Can Rius.",
    },
  ],
  news: [
    {
      ca: "El mercat fa 40 anys.",
      es: "El mercado cumple 40 años.",
      en: "The market turns 40.",
    },
  ],
  tickets: {
    ca: "Preus del programa: ració de caldo 1 €, de llenties 1 €, de carn d'olla 2 €, got 1 € (recomanen portar-ne un); el primer tast del divendres és gratuït.",
    es: "Precios del programa: ración de caldo 1 €, de lentejas 1 €, de carn d'olla 2 €, vaso 1 € (recomiendan llevar uno); la primera cata del viernes es gratuita.",
    en: "Programme prices: a serving of broth 1 €, lentils 1 €, carn d'olla 2 €, a cup 1 € (they suggest bringing your own); Friday's first tasting is free.",
  },
  access: [
    {
      ca: "**Des de Barcelona en autobús:** línies de Sagalés e9 (per autopista) i 202 i 203 (per carretera), segons el web de turisme de l'Ajuntament; des de Granollers, les 420 i 260, i des de Sabadell, les 230, 231 i 234.",
      es: "**Desde Barcelona en autobús:** líneas de Sagalés e9 (por autopista) y 202 y 203 (por carretera), según la web de turismo del Ayuntamiento; desde Granollers, las 420 y 260, y desde Sabadell, las 230, 231 y 234.",
      en: "**From Barcelona by bus:** Sagalés lines e9 (by motorway) and 202 and 203 (by the old road), according to the council's tourism website; from Granollers, the 420 and 260, and from Sabadell, the 230, 231 and 234.",
    },
    // 25 Nov 2026, "Com arribar" (visiteucaldes.cat/turisme/com-arribar/): "APARCAMENT PÚBLIC
    // Zona esportiva les Cremades Carrer Bigues (Bonastre) Carrer Balmes (Era del sindicat)
    // Aparcament Centre El Sindicat (de pagament)"; "Línies des de Granollers 420 i 260
    // Línies des de Sabadell 230 , 231 i 234". General page, not written for the market.
    {
      ca: "**Aparcament públic**, segons la mateixa pàgina de l'Ajuntament (no escrita per al mercat): la zona esportiva Les Cremades, el carrer Bigues (Bonastre), el carrer Balmes (Era del Sindicat) i l'aparcament del Centre, El Sindicat, que és de pagament.",
      es: "**Aparcamiento público**, según la misma página del Ayuntamiento (no escrita para el mercado): la zona deportiva Les Cremades, la calle Bigues (Bonastre), la calle Balmes (Era del Sindicat) y el aparcamiento del Centre, El Sindicat, que es de pago.",
      en: "**Public car parks**, from the same council page (not written for the market): the Les Cremades sports ground, carrer Bigues (Bonastre), carrer Balmes (Era del Sindicat) and the Centre car park, El Sindicat, which is paid.",
    },
  ],
  links: [
    { label: { ca: "Programa del Mercat de Nadal 2026 (PDF)", es: "Programa del Mercat de Nadal 2026 (PDF)", en: "2026 Christmas market programme (PDF, Catalan)" }, url: "https://www.visiteucaldes.cat/wp-content/uploads/PROGRAMA_MERCAT_NADAL_2026.pdf" },
    { label: { ca: "Com arribar a Caldes", es: "Cómo llegar a Caldes", en: "Getting to Caldes" }, url: "https://www.visiteucaldes.cat/turisme/com-arribar/" },
  ],
};

/**
 * Espinelves, 45a Fira de l'Avet (28 Nov - 8 Dec 2026): the fair's own site,
 * firadelavet.cat ("ORGANITZA: Ajuntament d'Espinelves, Plaça de l'Església,
 * 1"; modified 12 Nov 2026), read on 20 Nov 2026: "Dissabtes, festius i dilluns
 * 7 de desembre: de 10h a 20h · Feiners: de 10h a 18h", the programme and the
 * 2026 map (parking "P" signs around the village towards the Arboretum
 * Masjoan and the Coll de Ravell, and a "PEATGE" barrier on the access road;
 * no price on the site). Held by BODY_HOLDS until its title test reads on 27
 * Nov: not shown before then. Re-read on 24 Nov 2026: same page, same
 * programme (third programme line corrected, see below).
 */
const ESPINELVES_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament d'Espinelves (Fira de l'Avet)", url: "https://www.firadelavet.cat/" },
  programme: [
    {
      ca: "**Horari:** dissabtes, festius i el dilluns 7 de desembre, de 10 a 20 h; la resta de dies feiners, de 10 a 18 h.",
      es: "**Horario:** sábados, festivos y el lunes 7 de diciembre, de 10 a 20 h; el resto de días laborables, de 10 a 18 h.",
      en: "**Hours:** Saturdays, holidays and Monday 7 December, 10:00 to 20:00; other weekdays, 10:00 to 18:00.",
    },
    {
      ca: "**Dissabte 28 de novembre, a les 16.30 h:** inauguració i lliurament de l'Avet d'Or a l'arqueòleg Eudald Carbonell. **Diumenge 29, a les 12 h:** concert dels Atrapasomnis, al carrer de les Escoles. **Dimarts 8 de desembre, a les 19 h:** Cursa de l'Avet, a la plaça de l'Església.",
      es: "**Sábado 28 de noviembre, a las 16.30 h:** inauguración y entrega del Avet d'Or al arqueólogo Eudald Carbonell. **Domingo 29, a las 12 h:** concierto de los Atrapasomnis, en el carrer de les Escoles. **Martes 8 de diciembre, a las 19 h:** Cursa de l'Avet, en la plaza de l'Església.",
      en: "**Saturday 28 November, 16:30:** opening and the Golden Fir award to the archaeologist Eudald Carbonell. **Sunday 29, 12:00:** Atrapasomnis in concert, on Carrer de les Escoles. **Tuesday 8 December, 19:00:** the Fir Tree race, in Plaça de l'Església.",
    },
    // Corrected 24 Nov 2026 (site re-read, unchanged since 12 Nov): the "d'11:00
    // a 13:00" belongs to the "TALLER D'IMANTS DE CERÀMICA" ("Dies 5, 6, 7 i 8
    // de desembre … a la pista poliesportiva"); "Tallers de màgia – Pintacares
    // – Ponies – Tir amb Arc" is listed "Pels carrers del poble" with no days
    // or times. Also there: "Dia 28 de novembre de 09:00 a 13:00 A la primera
    // planta del poliesportiu 21ª TROBADA DE PLAQUES DE CAVA D'ESPINELVES";
    // "Dies 28 i 29 de novembre, 5, 6, 7 i 8 de desembre A la pista
    // poliesportiva Tallers i jocs per la mainada de la mà de GIL RATAPLAM";
    // "Xarangues itinerants pels carrers del poble: A les 11h, a les 13h i a
    // les 17h" on 28 and 29 Nov and 5, 6, 7 and 8 Dec.
    {
      ca: "**Dissabte 28 i diumenge 29 de novembre i del 5 al 8 de desembre:** xarangues pels carrers a les 11, a les 13 i a les 17 h, i tallers i jocs per a la mainada a la pista poliesportiva. **Del 5 al 8 de desembre, d'11 a 13 h:** taller d'imants de ceràmica, també a la pista poliesportiva. Pels carrers del poble, tallers de màgia, pintacares, ponis i tir amb arc (el programa no en dona dies ni hores).",
      es: "**Sábado 28 y domingo 29 de noviembre y del 5 al 8 de diciembre:** charangas por las calles a las 11, a las 13 y a las 17 h, y talleres y juegos para niños en la pista polideportiva. **Del 5 al 8 de diciembre, de 11 a 13 h:** taller de imanes de cerámica, también en la pista polideportiva. Por las calles del pueblo, talleres de magia, pintacaras, ponis y tiro con arco (el programa no da días ni horas).",
      en: "**Saturday 28 and Sunday 29 November and 5 to 8 December:** street bands at 11:00, 13:00 and 17:00, and children's workshops and games at the sports court. **5 to 8 December, 11:00 to 13:00:** a ceramic magnet workshop, also at the sports court. In the village streets, magic workshops, face painting, ponies and archery (the programme gives no days or times).",
    },
    {
      ca: "**Dissabte 28 de novembre, de 9 a 13 h:** 21a Trobada de Plaques de Cava, a la primera planta del poliesportiu.",
      es: "**Sábado 28 de noviembre, de 9 a 13 h:** 21.ª Trobada de Plaques de Cava (encuentro de coleccionistas de placas de cava), en la primera planta del polideportivo.",
      en: "**Saturday 28 November, 9:00 to 13:00:** the 21st cava-cap collectors' meet, on the first floor of the sports hall.",
    },
  ],
  news: [
    {
      ca: "Exposició «45 anys de la Fira de l'Avet».",
      es: "Exposición «45 anys de la Fira de l'Avet» (45 años de la feria).",
      en: "An exhibition on the fair's 45 years.",
    },
  ],
  access: [
    {
      ca: "**En cotxe:** el plànol del 2026 marca diversos aparcaments al voltant del poble, cap a l'Arboretum Masjoan i el Coll de Ravell, i un peatge a la carretera d'accés; el web no en publica el preu.",
      es: "**En coche:** el plano de 2026 marca varios aparcamientos alrededor del pueblo, hacia el Arboretum Masjoan y el Coll de Ravell, y un peaje en la carretera de acceso; la web no publica el precio.",
      en: "**By car:** the 2026 map shows several car parks around the village, towards the Arboretum Masjoan and Coll de Ravell, and a toll barrier on the access road; the website gives no price.",
    },
    // 25 Nov 2026: firadelavet.cat (modified 12 Nov) and the council's notice have no bus, shuttle or train.
    {
      ca: "**Autobús i tren:** el web de la fira (llegit el 25 de novembre) no publica cap servei d'autobús, llançadora ni tren cap a Espinelves.",
      es: "**Autobús y tren:** la web de la feria (leída el 25 de noviembre) no publica ningún servicio de autobús, lanzadera ni tren hacia Espinelves.",
      en: "**Bus and train:** the fair's website (read on 25 November) publishes no bus, shuttle or train service to Espinelves.",
    },
  ],
  links: [
    { label: { ca: "Fira de l'Avet (web oficial)", es: "Fira de l'Avet (web oficial)", en: "Fira de l'Avet (official website)" }, url: "https://www.firadelavet.cat/" },
    { label: { ca: "Plànol 2026", es: "Plano 2026", en: "2026 map" }, url: "https://www.firadelavet.cat/wp-content/uploads/2026/11/mapa-2026-opt.png" },
  ],
};

/**
 * Girona, Mercat de Nadal (27 Nov 2026 - 5 Jan 2027): the council's agenda
 * entry, re-read on 24 Nov 2026 (unchanged since 13 Nov): "Lloc: Plaça de la
 * Independència", "Preu: Gratuït", "La plaça Independència acull un any més el
 * Mercat de Nadal amb productes artesanals i alimentació artesana", "El Mercat
 * de Nadal s'inaugura el divendres, 27 de novembre. Després de l'acte de
 * l'encesa de llums de la plaça Catalunya, una cercavila anima a arribar fins a
 * la plaça Independència i prendre una xocolata desfeta calenta." The entry
 * gives no time for the opening, and web.girona.cat/nadal had none either.
 */
const GIRONA_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament de Girona", url: "https://www.girona.cat/agenda/cat/agenda_fitxa.php?id=44370&ta=age" },
  programme: [
    {
      ca: "**Divendres 27 de novembre, inauguració:** després de l'encesa dels llums de Nadal a la plaça de Catalunya, una cercavila porta fins a la plaça de la Independència, on hi ha xocolata desfeta. L'agenda de l'Ajuntament no en dona l'hora.",
      es: "**Viernes 27 de noviembre, inauguración:** tras el encendido de las luces de Navidad en la plaza de Catalunya, un pasacalles lleva hasta la plaza de la Independència, donde hay chocolate caliente. La agenda del Ayuntamiento no da la hora.",
      en: "**Friday 27 November, opening:** after the Christmas lights are switched on in Plaça de Catalunya, a street parade leads to Plaça de la Independència, where hot chocolate is served. The council's agenda gives no time.",
    },
    {
      ca: "**Què s'hi ven:** productes artesanals i alimentació artesana, segons l'Ajuntament.",
      es: "**Qué se vende:** productos artesanales y alimentación artesana, según el Ayuntamiento.",
      en: "**What is sold:** handmade goods and artisan food, according to the council.",
    },
  ],
  tickets: {
    ca: "L'agenda de l'Ajuntament indica «Preu: Gratuït».",
    es: "La agenda del Ayuntamiento indica «Preu: Gratuït» (gratis).",
    en: "The council's agenda lists it as free (\"Preu: Gratuït\").",
  },
  links: [
    { label: { ca: "Mercat de Nadal (Agenda de Girona)", es: "Mercat de Nadal (Agenda de Girona)", en: "Christmas market (Girona council agenda, Catalan)" }, url: "https://www.girona.cat/agenda/cat/agenda_fitxa.php?id=44370&ta=age" },
    { label: { ca: "Nadal a Girona (Ajuntament)", es: "Navidad en Girona (Ayuntamiento)", en: "Christmas in Girona (council, Catalan)" }, url: "https://web.girona.cat/nadal" },
  ],
};

const VIC_FIRES = "https://www.vicfires.cat";

/**
 * Vic, Fira d'Artesania de Nadal (5 Dec 2026 - 4 Jan 2027): the fair's page on
 * vicfires.cat (Ajuntament de Vic, Organisme Autònom de Fires i Mercats), read
 * on 24 Nov 2026: "FIRA D'ARTESANIA DE NADAL 2026 del 5 de desembre al 4 de
 * gener PLAÇA MAJOR de Vic Horaris: Dies 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23
 * i 24 de desembre i 2, 3 i 4 de gener: de 10 a 21 h"; "Una trentena de parades
 * amb productes elaborats de manera artesanal: joieria, ceràmica, fusta, cuir,
 * tèxtil, decoració nadalenca, espelmes, vidre, il·lustració"; "La fira
 * s'inicia coincidint amb el pont de la Puríssima i, posteriorment, es torna a
 * instal·lar durant les festes de Nadal". Its "Com arribar" page: "Ens trobareu
 * a la Plaça Major de Vic"; "C-17 Autovia Barcelona-Ripoll", "C-25 Eix
 * Transversal (Girona-Lleida)", "C-37 Eix Vic-Olot"; "Sagalés | Línia-e12:
 * Barcelona-Vic", "Teisa | Bus interurbà: Barcelona-Vic-Olot", "Teisa | EixBus:
 * Girona-Vic-Lleida"; "Renfe | Rodalies R3", "Atenció: consultar afectacions
 * per obres a línia R3 Barcelona-Vic". The Mercat Medieval's page, same site:
 * "MERCAT MEDIEVAL VIC 2026 del 5 al 8 de desembre 2026 HORARI: Cada dia de 10h
 * a 20h". The days in `closed` on the entry are the days of the range that the
 * organiser's list leaves out.
 */
const VIC_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament de Vic (Organisme Autònom de Fires i Mercats)", url: `${VIC_FIRES}/fira-d-artesania-de-nadal-2026` },
  times: { opens: "10:00", closes: "21:00" },
  programme: [
    {
      ca: "**Dies de fira, de 10 a 21 h:** 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 i 24 de desembre i 2, 3 i 4 de gener. No obre cada dia: comença pel pont de la Puríssima, torna els caps de setmana del 12-13 i del 19-20 i s'hi queda fins a la vigília de Nadal, i reobre del 2 al 4 de gener.",
      es: "**Días de feria, de 10 a 21 h:** 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 y 24 de diciembre y 2, 3 y 4 de enero. No abre todos los días: empieza por el puente de la Purísima, vuelve los fines de semana del 12-13 y del 19-20 y sigue hasta Nochebuena, y reabre del 2 al 4 de enero.",
      en: "**Fair days, 10:00 to 21:00:** 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 and 24 December and 2, 3 and 4 January. It is not open every day: it starts over the 5-8 December long weekend, returns on the weekends of 12-13 and 19-20 December and stays until Christmas Eve, then reopens from 2 to 4 January.",
    },
    {
      ca: "**Què s'hi troba:** una trentena de parades a la plaça Major amb productes fets artesanalment: joieria, ceràmica, fusta, cuir, tèxtil, decoració nadalenca, espelmes, vidre i il·lustració.",
      es: "**Qué hay:** una treintena de paradas en la plaza Major con productos hechos artesanalmente: joyería, cerámica, madera, cuero, textil, decoración navideña, velas, vidrio e ilustración.",
      en: "**What you will find:** around thirty stalls on Plaça Major with handmade goods: jewellery, ceramics, wood, leather, textiles, Christmas decorations, candles, glass and illustration.",
    },
    {
      ca: "**Del 5 al 8 de desembre** coincideix amb el Mercat Medieval de Vic, que fa 30 anys: cada dia, de 10 a 20 h, al centre històric.",
      es: "**Del 5 al 8 de diciembre** coincide con el Mercat Medieval de Vic, que cumple 30 años: todos los días, de 10 a 20 h, en el centro histórico.",
      en: "**From 5 to 8 December** it overlaps with Vic's Medieval Market, now in its 30th year: daily, 10:00 to 20:00, in the old town.",
    },
  ],
  access: [
    {
      ca: "**En tren:** Rodalies R3 (Barcelona-Vic). Vic Fires demana consultar abans les afectacions per obres a la línia.",
      es: "**En tren:** Rodalies R3 (Barcelona-Vic). Vic Fires pide consultar antes las afectaciones por obras en la línea.",
      en: "**By train:** Rodalies R3 (Barcelona-Vic). The organiser asks visitors to check for engineering works on the line first.",
    },
    {
      ca: "**En autobús:** Sagalés, línia e12 Barcelona-Vic; Teisa, Barcelona-Vic-Olot i l'Eixbus Girona-Vic-Lleida.",
      es: "**En autobús:** Sagalés, línea e12 Barcelona-Vic; Teisa, Barcelona-Vic-Olot y el Eixbus Girona-Vic-Lleida.",
      en: "**By bus:** Sagalés line e12 Barcelona-Vic; Teisa, Barcelona-Vic-Olot and the Eixbus Girona-Vic-Lleida.",
    },
    {
      ca: "**En cotxe:** C-17 (Barcelona-Ripoll), C-25 o Eix Transversal (Girona-Lleida) i C-37 (Vic-Olot).",
      es: "**En coche:** C-17 (Barcelona-Ripoll), C-25 o Eix Transversal (Girona-Lleida) y C-37 (Vic-Olot).",
      en: "**By car:** C-17 (Barcelona-Ripoll), C-25 or Eix Transversal (Girona-Lleida) and C-37 (Vic-Olot).",
    },
  ],
  links: [
    { label: { ca: "Fira d'Artesania de Nadal 2026 (Vic Fires)", es: "Fira d'Artesania de Nadal 2026 (Vic Fires)", en: "Christmas craft fair 2026 (Vic Fires, Catalan)" }, url: `${VIC_FIRES}/fira-d-artesania-de-nadal-2026` },
    { label: { ca: "Com arribar-hi (Vic Fires)", es: "Cómo llegar (Vic Fires)", en: "Getting there (Vic Fires, Catalan)" }, url: `${VIC_FIRES}/fira-d-artesania-de-nadal-2026/p/com-arribar-7-757-795-930-720-450-458-738-271` },
    { label: { ca: "Mercat Medieval de Vic 2026", es: "Mercat Medieval de Vic 2026", en: "Vic Medieval Market 2026 (Catalan)" }, url: `${VIC_FIRES}/mercat-medieval-vic-2026` },
  ],
};

const OLOT_FAIR_PAGE = "https://www.descobreixolot.cat/fira-del-pessebre-olot/";
const OLOT_NEWS = "https://www.olot.cat/ajuntament/comunicacio/actualitat/pln217/nadal-musica-artesania-i-pista-de-gel-a-la-fira-del-pessebre-d-olot-2026";

/**
 * Olot, Fira del Pessebre (5-7 Dec 2026), read on 24 Nov 2026:
 *   - the fair's page on descobreixolot.cat (the address the organiser
 *     registered in the fairs calendar; "DescobreixOlot és un projecte de
 *     l'Agència d'Innovació i desenvolupamnt de la Garrotxa – DinàmiG", data
 *     controller Ajuntament d'Olot): "Fira del Pessebre Olot 2026 Dates Del 5
 *     al 7 de desembre Horaris Dissabte i diumenge de 10 a 20 h Dilluns de 10 a
 *     19 h On De Sant Esteve a la plaça del Carme"; "a la plaça Major i a la
 *     plaça d'Esteve Ferrer, hi haurà el Nadal km 0"; "Des de la plaça Major,
 *     baixant cap a la plaça de la Pia Almoina i pels carrers adjacents fins a
 *     la plaça del Carme, hi ha el mercat de Nadal"; "Cada dia de la Fira, d'11
 *     a 14 h i de 16 a 19 h, s'hi faran tallers familiars d'artesania de Nadal
 *     … Són gratuïts!"; "12 h … Tocs de flabiol"; "12.30 h Vermut musical de
 *     Nadal a càrrec de Me'n vaig de rumba"; "De 10.30 h a 14 h Un Nadal com
 *     cal! Gran gimcana"; "16.30 hCercavila del gegantó Tió acompanyat dels
 *     Ministrers de la Bouera. A continuació, ball del gegantó a càrrec de
 *     l'Esbart Olot, a la plaça del Carme";
 *   - the council's news of 22 Nov 2026: "Del dissabte 5 al dilluns 7 de
 *     desembre"; "el carrer Sant Esteve tornarà a acollir les emblemàtiques
 *     casetes dels artesans pessebristes"; "A la plaça Major, la pista de gel
 *     compartirà espai amb el Mercat de Nadal km0"; the ice rink "per primera
 *     vegada, s'inaugurarà coincidint amb el primer dia de la Fira del
 *     Pessebre"; "el 5 de desembre, la plaça Hospital acollirà el tradicional
 *     mercat de col·leccionisme i andròmines"; "Tota la informació
 *     actualitzada es podrà consultar a descobreixolot.cat". The news gives
 *     the rink's last day as "dilluns 7 de gener", which is a Thursday in
 *     2027: the closing date is left out.
 */
const OLOT_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament d'Olot", url: OLOT_NEWS },
  programme: [
    {
      ca: "**On és cada cosa:** les casetes de fusta dels artesans pessebristes, al carrer de Sant Esteve; el Nadal km 0, a la plaça Major i a la plaça d'Esteve Ferrer; el mercat de Nadal, de la plaça Major cap a la plaça de la Pia Almoina i els carrers del voltant fins a la plaça del Carme.",
      es: "**Dónde está cada cosa:** las casetas de madera de los artesanos belenistas, en la calle de Sant Esteve; el Nadal km 0, en la plaza Major y en la plaza de Esteve Ferrer; el mercado de Navidad, de la plaza Major hacia la plaza de la Pia Almoina y las calles de alrededor hasta la plaza del Carme.",
      en: "**What is where:** the nativity-figure makers' wooden huts on Carrer de Sant Esteve; the Nadal km 0 local-produce market on Plaça Major and Plaça d'Esteve Ferrer; the Christmas market from Plaça Major down to Plaça de la Pia Almoina and the streets around it as far as Plaça del Carme.",
    },
    {
      ca: "**Cada dia, d'11 a 14 h i de 16 a 19 h:** tallers familiars gratuïts d'artesania de Nadal, a la carpa de la plaça del Mig.",
      es: "**Todos los días, de 11 a 14 h y de 16 a 19 h:** talleres familiares gratuitos de artesanía de Navidad, en la carpa de la plaza del Mig.",
      en: "**Every day, 11:00 to 14:00 and 16:00 to 19:00:** free family Christmas craft workshops in the marquee on Plaça del Mig.",
    },
    {
      ca: "**Dissabte 5:** a les 12 h, tocs de flabiol a les escales de Sant Esteve; a la tarda, música al carrer des de les 17 h. El mateix dia, mercat de col·leccionisme i andròmines a la plaça de l'Hospital.",
      es: "**Sábado 5:** a las 12 h, toques de flabiol en las escaleras de Sant Esteve; por la tarde, música en la calle desde las 17 h. El mismo día, mercado de coleccionismo y antigüedades en la plaza de l'Hospital.",
      en: "**Saturday 5:** at 12:00, flabiol (Catalan pipe) music on the steps of Sant Esteve; street music from 17:00. The same day, a collectors' and bric-a-brac market on Plaça de l'Hospital.",
    },
    {
      ca: "**Diumenge 6:** a les 12.30 h, vermut musical de Nadal amb Me'n vaig de rumba, a la plaça del Carme; a la tarda, música al carrer des de les 17 h.",
      es: "**Domingo 6:** a las 12.30 h, vermut musical de Navidad con Me'n vaig de rumba, en la plaza del Carme; por la tarde, música en la calle desde las 17 h.",
      en: "**Sunday 6:** at 12:30, a Christmas vermouth concert by Me'n vaig de rumba on Plaça del Carme; street music from 17:00.",
    },
    {
      ca: "**Dilluns 7:** de 10.30 a 14 h, gimcana «Un Nadal com cal!» a la plaça del Carme; a les 16.30 h, cercavila del gegantó Tió amb els Ministrers de la Bouera i, tot seguit, ball del gegantó a la plaça del Carme.",
      es: "**Lunes 7:** de 10.30 a 14 h, gincana «Un Nadal com cal!» en la plaza del Carme; a las 16.30 h, pasacalles del gigantón Tió con los Ministrers de la Bouera y, a continuación, baile del gigantón en la plaza del Carme.",
      en: "**Monday 7:** 10:30 to 14:00, the \"Un Nadal com cal!\" treasure hunt on Plaça del Carme; at 16:30, the parade of the Tió giant with the Ministrers de la Bouera, followed by the giant's dance on Plaça del Carme.",
    },
  ],
  news: [
    {
      ca: "La pista de gel de la plaça Major s'inaugura per primera vegada el primer dia de la fira, el dissabte 5 de desembre.",
      es: "La pista de hielo de la plaza Major se inaugura por primera vez el primer día de la feria, el sábado 5 de diciembre.",
      en: "For the first time, the ice rink on Plaça Major opens on the fair's first day, Saturday 5 December.",
    },
  ],
  links: [
    { label: { ca: "Fira del Pessebre 2026: programa (Descobreix Olot)", es: "Fira del Pessebre 2026: programa (Descobreix Olot)", en: "Fira del Pessebre 2026: programme (Descobreix Olot, Catalan)" }, url: OLOT_FAIR_PAGE },
    { label: { ca: "Notícia de l'Ajuntament d'Olot (22 de novembre)", es: "Noticia del Ayuntamiento de Olot (22 de noviembre)", en: "Olot council news item (22 November, Catalan)" }, url: OLOT_NEWS },
  ],
};

const MANRESA_AGENDA = "https://lapuntador.cat/apuntador/Members/manresaturisme/fira-santa-llucia/fira-de-santa-llucia";

/**
 * Manresa, Fira de Santa Llúcia (12-13 Dec 2026). Until 13 Nov the tourism
 * page still showed 2025; on 24 Nov 2026 the council's agenda
 * (web.manresa.cat/web/agenda) lists "Fira de Santa Llúcia Del 12/12/26 10:00h
 * al 13/12/26 20:00h Lloc : Plaça Major, Baixada de la Seu" and links the
 * entry read here (L'Apuntador, published by Manresa Turisme): "Dates Del
 * 12/12/2026 10:00 al 13/12/2026 20:00"; "Horaris de la fira. Dissabte 12 de
 * desembre de 10h a 20h a la Plaça Major. Diumenge 13 de desembre 10h a 20h a
 * la Plaça Major i a la Baixada de la Seu."; "TIÓ GEGANT D'11 a 13.30 h i de
 * 16.30 a 19 h | Plaça Major Preu: 1 euro (solidari per La Marató). Podeu
 * adquirir el tiquet a l'Oficina de Turisme (pl. Major, 20)"; "OFRENA
 * Tradicional ofrena de ciris de Santa Llúcia al Claustre de la Seu. De 9 a 20
 * h"; "A les parades de la plaça Major, s'afegiran les de la Baixada de la
 * Seu, especialitzades en ciris, espelmes i decoració de Nadal"; "MISSA DE
 * SANTA LLÚCIA 11 h | Basílica de la Seu"; "RECITAL DEL POEMA DE NADAL |
 * Carrer del Balç, A càrrec de la Companyia Els Carlins. Aforament limitat amb
 * reserva d'invitacions". The entry's opening summary puts the Baixada de la
 * Seu on Saturday; its "Horaris" section and Fira de Manresa's own page
 * (firamanresa.cat: "12 de desembre a la Plaça Major / 13 de desembre a la
 * Baixada de la Seu i a la Plaça Major") put it on Sunday, which is what the
 * page says. manresaturisme.cat still showed 2025 on 24 Nov.
 */
const MANRESA_DETAILS: FairDetails = {
  readOn: "2026-11-24",
  organizer: { name: "Ajuntament de Manresa", url: MANRESA_AGENDA },
  times: { opens: "10:00", closes: "20:00" },
  programme: [
    {
      ca: "**Dissabte 12, de 10 a 20 h, a la plaça Major:** parades de figures de pessebre, ornaments, rams i plantes, artesania, regals i alimentació. Tió gegant d'11 a 13.30 h i de 16.30 a 19 h; taller de follets del bosc d'11 a 13 h; nadales amb les violes del Conservatori a les 13 h; pintacares de 16 a 18 h; espectacle «Fades de neu» a les 18 h.",
      es: "**Sábado 12, de 10 a 20 h, en la plaza Major:** paradas de figuras de belén, adornos, ramos y plantas, artesanía, regalos y alimentación. Tió gigante de 11 a 13.30 h y de 16.30 a 19 h; taller de duendes del bosque de 11 a 13 h; villancicos con las violas del Conservatorio a las 13 h; pintacaras de 16 a 18 h; espectáculo «Fades de neu» a las 18 h.",
      en: "**Saturday 12, 10:00 to 20:00, on Plaça Major:** stalls with nativity figures, decorations, wreaths and plants, crafts, gifts and food. Giant tió 11:00 to 13:30 and 16:30 to 19:00; forest-elf workshop 11:00 to 13:00; carols by the Conservatori's violas at 13:00; face painting 16:00 to 18:00; the \"Fades de neu\" show at 18:00.",
    },
    {
      ca: "**Dissabte 12, a les 20 h:** recital del Poema de Nadal, al carrer del Balç, amb la Companyia Els Carlins (aforament limitat, amb reserva d'invitacions).",
      es: "**Sábado 12, a las 20 h:** recital del Poema de Nadal, en el carrer del Balç, con la Companyia Els Carlins (aforo limitado, con reserva de invitaciones).",
      en: "**Saturday 12, 20:00:** a recital of the Poema de Nadal on Carrer del Balç by the Companyia Els Carlins (limited capacity, invitations must be booked).",
    },
    {
      ca: "**Diumenge 13, de 10 a 20 h, a la plaça Major i a la Baixada de la Seu:** s'hi afegeixen les parades de la Baixada de la Seu, especialitzades en ciris, espelmes i decoració de Nadal. Ofrena de ciris de Santa Llúcia al claustre de la Seu, de 9 a 20 h, i missa de Santa Llúcia a les 11 h a la basílica.",
      es: "**Domingo 13, de 10 a 20 h, en la plaza Major y en la Baixada de la Seu:** se suman las paradas de la Baixada de la Seu, especializadas en cirios, velas y decoración de Navidad. Ofrenda de cirios de Santa Llúcia en el claustro de la Seu, de 9 a 20 h, y misa de Santa Llúcia a las 11 h en la basílica.",
      en: "**Sunday 13, 10:00 to 20:00, on Plaça Major and Baixada de la Seu:** the Baixada de la Seu stalls join in, specialising in candles and Christmas decorations. Offering of Saint Lucy candles in the cloister of La Seu, 9:00 to 20:00, and the Saint Lucy mass at 11:00 in the basilica.",
    },
    {
      ca: "**Diumenge 13, activitats:** tió gegant d'11 a 13.30 h i de 16.30 a 19 h; pintacares d'11.30 a 13.30 h; a les 13 h, ballada del Grup de Dansa Cor de Catalunya a la plaça Major i cercavila de gegants a la Baixada de la Seu; taller de boles de Nadal de 16.30 a 18.30 h; a les 18 h, nadales amb l'Orfeó Manresà a la Baixada de la Seu.",
      es: "**Domingo 13, actividades:** tió gigante de 11 a 13.30 h y de 16.30 a 19 h; pintacaras de 11.30 a 13.30 h; a las 13 h, danzas del Grup de Dansa Cor de Catalunya en la plaza Major y pasacalles de gigantes en la Baixada de la Seu; taller de bolas de Navidad de 16.30 a 18.30 h; a las 18 h, villancicos con el Orfeó Manresà en la Baixada de la Seu.",
      en: "**Sunday 13, activities:** giant tió 11:00 to 13:30 and 16:30 to 19:00; face painting 11:30 to 13:30; at 13:00, folk dances by the Grup de Dansa Cor de Catalunya on Plaça Major and a giants' parade on Baixada de la Seu; Christmas bauble workshop 16:30 to 18:30; at 18:00, carols by the Orfeó Manresà on Baixada de la Seu.",
    },
  ],
  tickets: {
    ca: "El programa no posa preu a l'entrada de la fira. El tió gegant costa 1 euro, solidari per a La Marató; el tiquet es compra a l'Oficina de Turisme (plaça Major, 20).",
    es: "El programa no pone precio a la entrada de la feria. El tió gigante cuesta 1 euro, solidario para La Marató; el tique se compra en la Oficina de Turismo (plaza Major, 20).",
    en: "The programme lists no entry price for the fair. The giant tió costs 1 euro, donated to La Marató; tickets are sold at the Tourist Office (Plaça Major, 20).",
  },
  links: [
    { label: { ca: "Fira de Santa Llúcia 2026: programa (agenda de Manresa)", es: "Fira de Santa Llúcia 2026: programa (agenda de Manresa)", en: "Fira de Santa Llúcia 2026: programme (Manresa agenda, Catalan)" }, url: MANRESA_AGENDA },
    { label: { ca: "Fira de Santa Llúcia (Fira de Manresa)", es: "Fira de Santa Llúcia (Fira de Manresa)", en: "Fira de Santa Llúcia (Fira de Manresa, Catalan)" }, url: "https://www.firamanresa.cat/web/menu/9216-fira-de-santa-llucia" },
  ],
};

/**
 * Barcelona, Nadal al Port (27 Nov 2026 - 6 Jan 2027), read on 25 Nov 2026: the
 * organiser's own site (nadalalportvell.com, Autoritat Portuària de Barcelona):
 * "Disponibles de 11:00 a 23:00 del 27 de novembre al 6 de gener", with a
 * calendar of the shows; and the council's Guia BCN entry: "Del 27 de novembre al 6
 * de gener, té lloc una nova edició de la fira Nadal al Port"; "La instal·lació
 * oferirà tres passis diaris, a les 18.30, 20.30 i 22.30 hores"; "El divendres 27
 * de novembre, a les 18 h, tindrà lloc la inauguració de la vuitena edició … al
 * moll de la Fusta, amb la tradicional encesa de llums"; "El Messies Participatiu
 * … posarà el punt final a l'acte inaugural"; "Preus … Entrada Gratuïta". The site
 * sells tickets ("Comprar tickets") for the Fada del Mar and the Fàbrica de
 * Joguines + Golondrinas; their prices were not read.
 */
const PORT_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Autoritat Portuària de Barcelona (Port de Barcelona)", url: "https://www.nadalalportvell.com" },
  times: { opens: "11:00", closes: "23:00" },
  programme: [
    {
      ca: "**Cada dia, d'11 a 23 h**, al Moll de la Fusta, del 27 de novembre al 6 de gener. El tema d'enguany és Gaudí: una gran instal·lació inflable a la plaça del Portal de la Pau, inspirada en la torre de Jesucrist de la Sagrada Família, i un cel de llum i música que recrea el trencadís.",
      es: "**Cada día, de 11 a 23 h**, en el Moll de la Fusta, del 27 de noviembre al 6 de enero. El tema de este año es Gaudí: una gran instalación hinchable en la plaza del Portal de la Pau, inspirada en la torre de Jesucristo de la Sagrada Família, y un cielo de luz y música que recrea el trencadís.",
      en: "**Every day, 11:00 to 23:00**, at the Moll de la Fusta, from 27 November to 6 January. This year's theme is Gaudí: a large inflatable on Plaça del Portal de la Pau inspired by the Tower of Jesus Christ of the Sagrada Família, and a sky of light and music that recreates his trencadís mosaic.",
    },
    {
      ca: "**Divendres 27 de novembre, a les 18 h:** inauguració amb l'encesa de llums; després, l'espectacle de llum i música i el concert coral El Messies Participatiu. L'espectacle té tres passis diaris, a les 18.30, 20.30 i 22.30 h.",
      es: "**Viernes 27 de noviembre, a las 18 h:** inauguración con el encendido de luces; después, el espectáculo de luz y música y el concierto coral El Messies Participatiu. El espectáculo tiene tres pases diarios, a las 18.30, 20.30 y 22.30 h.",
      en: "**Friday 27 November, 18:00:** opening with the lights switch-on, then the light and music show and the choral concert El Messies Participatiu. The show runs three times a day, at 18:30, 20:30 and 22:30.",
    },
  ],
  tickets: {
    ca: "La Guia BCN dona l'entrada a la fira com a gratuïta. El web de la fira ven tiquets per a algunes atraccions (la Fada del Mar, la Fàbrica de Joguines amb Golondrinas); no n'hem llegit els preus.",
    es: "La Guia BCN da la entrada a la feria como gratuita. La web de la feria vende entradas para algunas atracciones (el Hada del Mar, la Fábrica de Juguetes con Golondrinas); no hemos leído sus precios.",
    en: "The Guia BCN lists entry to the fair as free. The fair's website sells tickets for some attractions (the Sea Fairy, the Toy Factory with Golondrinas boats); we did not read their prices.",
  },
  links: [
    { label: { ca: "Nadal al Port (web oficial)", es: "Nadal al Port (web oficial)", en: "Nadal al Port (official website, Catalan)" }, url: "https://www.nadalalportvell.com" },
    { label: { ca: "Guia BCN: Nadal al Port", es: "Guia BCN: Nadal al Port", en: "Guia BCN: Nadal al Port" }, url: "https://guia.barcelona.cat/detall/fira-nadal-al-port_99400639592.html" },
  ],
};

/**
 * Sabadell, Fira de Santa Llúcia (27 Nov - 22 Dec 2026), the council's Christmas site
 * (web.sabadell.cat), read on 25 Nov 2026. The fair's own page: "Una vintena de
 * parades s'instal·laran aquests dies a la plaça de Sant Roc"; "La tradicional fira
 * obrirà portes el proper divendres, 27 de novembre, a les 5 de la tarda"; "La Fira de
 * Santa Llúcia, que ja compta amb 75 anys d'història, romandrà a la plaça de Sant
 * Roc fins el 22 de desembre de 10 del matí a les 2 del migdia i de 5 de la tarda a 8
 * del vespre (fins a les 9 de la nit els caps de setmana i festius)"; the free
 * workshops "28/11/2026 d' 11 a 14 h - Muntatge del pessebre de la Fira", "06/12/2026
 * d'11 a 13 h - Pinta-cares a la Fira", "08/12/2026 d'11 a 13 h - Taller fem un segell
 * a la Fira", "13/12/2026 de 12 a 13 h - Cantada de nadales", "20/12/2026 d'11 a 13 h -
 * Caga Tió". The council's Nadal home page says "FIRA DE SANTA LLÚCIA Del 27 de
 * novembre al 22 de desembre a la Plaça del Doctor Robert De dilluns a divendres, de
 * 10 a 14 h i de 17 a 20 h. Caps de setmana i festius, de 10 a 14 h i de 17 a 21 h
 * Inauguració: 27 de novembre, a les 17h": the same dates and hours, another square.
 * The two pages disagree on the square, so the entry gives no place and says so.
 */
const SABADELL_DETAILS: FairDetails = {
  readOn: "2026-11-25",
  organizer: { name: "Ajuntament de Sabadell", url: "https://web.sabadell.cat/nadal/fira-de-santa-llucia" },
  programme: [
    {
      ca: "**Obre divendres 27 de novembre, a les 17 h, i tanca el 22 de desembre:** de dilluns a divendres, de 10 a 14 h i de 17 a 20 h; caps de setmana i festius, de 10 a 14 h i de 17 a 21 h. Una vintena de parades de tot el que cal per guarnir la llar: arbres, tions i figures de pessebre. La fira té 75 anys d'història.",
      es: "**Abre el viernes 27 de noviembre, a las 17 h, y cierra el 22 de diciembre:** de lunes a viernes, de 10 a 14 h y de 17 a 20 h; fines de semana y festivos, de 10 a 14 h y de 17 a 21 h. Una veintena de paradas con todo lo necesario para adornar el hogar: árboles, tions y figuras de belén. La feria tiene 75 años de historia.",
      en: "**Opens on Friday 27 November at 17:00 and closes on 22 December:** Monday to Friday, 10:00 to 14:00 and 17:00 to 20:00; weekends and holidays, 10:00 to 14:00 and 17:00 to 21:00. About twenty stalls with what you need to decorate the home: trees, tions and nativity figures. The fair is 75 years old.",
    },
    {
      ca: "**On és:** la pàgina de la fira diu la plaça de Sant Roc; la pàgina de Nadal de l'Ajuntament diu la plaça del Doctor Robert. Les dues donen les mateixes dates i hores, i no resolen la diferència: confirma el lloc a l'Ajuntament abans d'anar-hi.",
      es: "**Dónde es:** la página de la feria dice la plaza de Sant Roc; la página de Navidad del Ayuntamiento dice la plaza del Doctor Robert. Las dos dan las mismas fechas y horas y no resuelven la diferencia: confirma el lugar con el Ayuntamiento antes de ir.",
      en: "**Where it is:** the fair's page says Plaça de Sant Roc; the council's Christmas page says Plaça del Doctor Robert. Both give the same dates and hours and neither settles the difference: confirm the place with the council before you go.",
    },
    {
      ca: "**Tallers gratuïts a la fira:** 28 de novembre, d'11 a 14 h, muntatge del pessebre de la fira; 6 de desembre, d'11 a 13 h, pinta-cares; 8 de desembre, d'11 a 13 h, taller de fer un segell; 13 de desembre, de 12 a 13 h, cantada de nadales (escola de música Praeludium); 20 de desembre, d'11 a 13 h, Caga Tió de la fira.",
      es: "**Talleres gratuitos en la feria:** 28 de noviembre, de 11 a 14 h, montaje del belén de la feria; 6 de diciembre, de 11 a 13 h, pintacaras; 8 de diciembre, de 11 a 13 h, taller de hacer un sello; 13 de diciembre, de 12 a 13 h, cantada de villancicos (escuela de música Praeludium); 20 de diciembre, de 11 a 13 h, Caga Tió de la feria.",
      en: "**Free workshops at the fair:** 28 November, 11:00 to 14:00, building the fair's nativity scene; 6 December, 11:00 to 13:00, face painting; 8 December, 11:00 to 13:00, a stamp-making workshop; 13 December, 12:00 to 13:00, carol singing (Praeludium music school); 20 December, 11:00 to 13:00, the fair's Caga Tió.",
    },
  ],
  links: [
    { label: { ca: "Fira de Santa Llúcia (Ajuntament de Sabadell)", es: "Fira de Santa Llúcia (Ayuntamiento de Sabadell)", en: "Fira de Santa Llúcia (Sabadell council, Catalan)" }, url: "https://web.sabadell.cat/nadal/fira-de-santa-llucia" },
    { label: { ca: "Nadal a Sabadell", es: "Navidad en Sabadell", en: "Christmas in Sabadell (council, Catalan)" }, url: "https://web.sabadell.cat/nadal" },
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
    readOn: "2026-11-25",
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
    // Programme and practical information, read 20 Nov 2026 (above).
    details: SAGRADA_FAMILIA_DETAILS,
    ine: "08019",
    name: "Fira de Nadal de la Sagrada Família",
    start: "2026-11-21",
    end: "2026-12-23",
    place: "Plaça de la Sagrada Família",
    url: "https://guia.barcelona.cat/detall/fira-de-nadal-a-la-sagrada-familia_99400017122.html",
    publisher: "Ajuntament de Barcelona (Guia BCN)",
    readOn: "2026-11-25",
    quote: "Cada dia de 10:00 h a 21:00 h … On Plaça Sagrada Familia Quan Des de 21/11/2026 al 23/12/2026",
    hours: { ca: "cada dia, de 10 a 21 h", es: "todos los días, de 10 a 21 h", en: "daily, 10:00 to 21:00" },
  },
  {
    id: "org:barcelona-santa-llucia",
    // Programme and practical information, read 20 Nov 2026 (above).
    details: SANTA_LLUCIA_DETAILS,
    ine: "08019",
    name: "Fira de Santa Llúcia a l'Avinguda de la Catedral de Barcelona",
    start: "2026-11-27",
    end: "2026-12-23",
    place: "Avinguda de la Catedral",
    url: "https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020",
    publisher: "Agenda Cultural de Catalunya (Generalitat de Catalunya)",
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
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
    // Re-read 24 Nov 2026: unchanged. Opening, price and what is sold: GIRONA_DETAILS (above).
    readOn: "2026-11-25",
    details: GIRONA_DETAILS,
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
    details: PORT_DETAILS,
    ine: "08019",
    name: "Fira Nadal al Port",
    start: "2026-11-27",
    end: "2027-01-06",
    place: "Moll de la Fusta",
    url: "https://guia.barcelona.cat/detall/fira-nadal-al-port_99400639592.html",
    publisher: "Ajuntament de Barcelona (Guia BCN)",
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
    quote: "Esdeveniments de novembre 2026 … XVII FIRA DE NADAL I XV MOSTRA DEL CAVA – VI ESCUMÓS – CORPINAT 28 novembre a les 11:00 - 29 novembre a les 23:00",
    replaces: "vm32:24033607",
  },
  {
    id: "org:espinelves-fira-de-l-avet",
    // Programme and practical information, read 20 Nov 2026 (above).
    details: ESPINELVES_DETAILS,
    ine: "17063",
    name: "45a Fira de l'Avet",
    start: "2026-11-28",
    end: "2026-12-08",
    place: null,
    url: "https://espinelves.cat/%f0%9f%8c%b2fira-de-lavet-2025-sollicituds-i-reglament-de-participacio/",
    publisher: "Ajuntament d'Espinelves",
    // Re-read 24 Nov 2026: the quoted text is unchanged.
    readOn: "2026-11-25",
    quote: "A aquesta notícia trobareu tota la informació relacionada amb la 45a Fira de l’Avet any 2026 – Del 28 de novembre al 8 de desembre de 2026.",
    replaces: "vm32:24032308",
  },
  {
    id: "org:caldes-de-montbui-mercat-de-nadal",
    // Programme and practical information, read 20 Nov 2026 (above).
    details: CALDES_DETAILS,
    ine: "08033",
    name: "Mercat de Nadal",
    start: "2026-12-04",
    end: "2026-12-08",
    place: null,
    url: "https://www.visiteucaldes.cat/04-fires/fires/",
    publisher: "Ajuntament de Caldes de Montbui (Visiteu Caldes)",
    // Re-read 24 Nov 2026: the quoted text is unchanged.
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
    quote: "Fira de Nadal de Ripoll 2026 5 desembre - 8 desembre … Aquest pont de la Puríssima, Ripoll es vesteix de Nadal i els seus carrers es converteixen en una gran festa! Quatre dies de música, espectacles, llums…",
    replaces: "vm32:24032983",
  },
  {
    id: "org:arbucies-fira-del-tio",
    // Programme and practical information, read 20 Nov 2026 (above).
    details: ARBUCIES_DETAILS,
    ine: "17009",
    name: "Fira del Tió",
    start: "2026-12-05",
    end: "2026-12-06",
    place: null,
    url: "https://arbucies.cat/ca/agenda/festes.html",
    publisher: "Ajuntament d'Arbúcies",
    // Re-read 24 Nov 2026: the quoted text is unchanged.
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
    quote: "Mercat de Santa Llúcia - La fira dels alls Propera edició: dissabte 5 de desembre de 2026",
    replaces: "vm32:24033337",
  },
  {
    id: "org:olot-fira-del-pessebre",
    ine: "17114",
    name: "Fira del Pessebre",
    start: "2026-12-05",
    end: "2026-12-07",
    // 24 Nov 2026: the programme is out. Until now the entry quoted the
    // council's rules PDF (olot.cat/files/doc8506/normativa-fira-pessebre-2026.pdf:
    // "Fira del Pessebre 5, 6 i 7 de desembre Al centre d’Olot"), which gave no hours.
    place: "Del carrer de Sant Esteve a la plaça del Carme",
    url: OLOT_FAIR_PAGE,
    publisher: "Descobreix Olot (DinàmiG i Ajuntament d'Olot)",
    readOn: "2026-11-25",
    quote: "Fira del Pessebre Olot 2026 Dates Del 5 al 7 de desembre Horaris Dissabte i diumenge de 10 a 20 h Dilluns de 10 a 19 h On De Sant Esteve a la plaça del Carme",
    replaces: "vm32:24032768",
    hours: {
      ca: "dissabte 5 i diumenge 6, de 10 a 20 h; dilluns 7, de 10 a 19 h",
      es: "sábado 5 y domingo 6, de 10 a 20 h; lunes 7, de 10 a 19 h",
      en: "Saturday 5 and Sunday 6, 10:00 to 20:00; Monday 7, 10:00 to 19:00",
    },
    details: OLOT_DETAILS,
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
    readOn: "2026-11-25",
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
    // 24 Nov 2026: the fair's own page gives the open days and the hours; the
    // council agenda entry quoted until now (vic.cat/ciutat/agenda/fira-d-artesania-de-nadal-2026:
    // "Quan? 05/12/2026 a 00:00 fins a 04/01/2027 a 00:00") only gave the range.
    url: `${VIC_FIRES}/fira-d-artesania-de-nadal-2026`,
    publisher: "Ajuntament de Vic (Vic Fires)",
    readOn: "2026-11-25",
    quote:
      "FIRA D'ARTESANIA DE NADAL 2026 del 5 de desembre al 4 de gener PLAÇA MAJOR de Vic Horaris: Dies 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 i 24 de desembre i 2, 3 i 4 de gener: de 10 a 21 h",
    hours: {
      ca: "de 10 a 21 h, només els dies 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 i 24 de desembre i 2, 3 i 4 de gener",
      es: "de 10 a 21 h, solo los días 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 y 24 de diciembre y 2, 3 y 4 de enero",
      en: "10:00 to 21:00, only on 5, 6, 7, 8, 12, 13, 19, 20, 21, 22, 23 and 24 December and 2, 3 and 4 January",
    },
    // Every day of the range that the organiser's list leaves out.
    closed: [
      "2026-12-09", "2026-12-10", "2026-12-11", "2026-12-14", "2026-12-15", "2026-12-16", "2026-12-17", "2026-12-18",
      "2026-12-25", "2026-12-26", "2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01",
    ],
    details: VIC_DETAILS,
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
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
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
    // Programme and practical information, read 20 Nov 2026 (above).
    details: CARDEDEU_DETAILS,
    ine: "08046",
    name: "Fira de Nadal i del Torró Artesà de Cardedeu",
    start: "2026-12-11",
    end: "2026-12-13",
    place: null,
    // The organiser's site answers on plain http only (its https certificate is
    // rejected by browsers: rows.ts WEB_REPLACEMENTS), so it is linked as http.
    url: "http://www.firadenadal.cat/",
    publisher: "Associació de Veïns del Centre de la Vila de Cardedeu",
    // Re-read 24 Nov 2026: the quoted text is unchanged.
    readOn: "2026-11-24",
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
    // Re-read 24 Nov 2026: the quoted text is unchanged.
    readOn: "2026-11-24",
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
  // --- Found on 25 Nov 2026 in the councils of the 15 largest towns (they were not in the calendar or this list) ---
  {
    id: "org:sabadell-fira-de-santa-llucia",
    details: SABADELL_DETAILS,
    ine: "08187",
    name: "Fira de Santa Llúcia",
    start: "2026-11-27",
    end: "2026-12-22",
    // Two pages of the council give two squares (Sant Roc, Doctor Robert): no place (SABADELL_DETAILS).
    place: null,
    url: "https://web.sabadell.cat/nadal/fira-de-santa-llucia",
    publisher: "Ajuntament de Sabadell",
    readOn: "2026-11-25",
    quote:
      "La tradicional fira obrirà portes el proper divendres, 27 de novembre, a les 5 de la tarda. … romandrà a la plaça de Sant Roc fins el 22 de desembre de 10 del matí a les 2 del migdia i de 5 de la tarda a 8 del vespre (fins a les 9 de la nit els caps de setmana i festius).",
    hours: {
      ca: "de dilluns a divendres, de 10 a 14 h i de 17 a 20 h; caps de setmana i festius, de 10 a 14 h i de 17 a 21 h",
      es: "de lunes a viernes, de 10 a 14 h y de 17 a 20 h; fines de semana y festivos, de 10 a 14 h y de 17 a 21 h",
      en: "Monday to Friday, 10:00 to 14:00 and 17:00 to 20:00; weekends and holidays, 10:00 to 14:00 and 17:00 to 21:00",
    },
  },
  {
    // The council's calendar "Fires 2026" (page note: "Aquest calendari es pot modificar"); the page of the
    // 2024 edition (fira-de-nadal-a-mataro-2) and the 2025 one are not used. No hours are published for 2026.
    id: "org:mataro-fira-de-nadal",
    ine: "08121",
    name: "Fira de Nadal",
    start: "2026-11-27",
    end: "2026-12-23",
    place: "Plaça de Santa Anna, La Rambla",
    url: "https://www.mataro.cat/ca/temes/comerc-mercats-i-fires/fires",
    publisher: "Ajuntament de Mataró (calendari de fires)",
    readOn: "2026-11-25",
    quote: "FIRA DE NADAL Del 27 de novembre al 23 de desembre Plaça de Santa Anna La Rambla DIRECCIÓ DE PROMOCIÓ ECONÒMICA",
    // The page's note: "Aquest calendari es pot modificar i es pot anar complementant amb noves propostes".
    hours: {
      ca: "calendari de l'Ajuntament, sense horari publicat; pot canviar",
      es: "calendario del Ayuntamiento, sin horario publicado; puede cambiar",
      en: "council calendar, no opening hours published; it may change",
    },
  },
  {
    // The council's "Programa de Nadal 2026-2027" (PDF linked from badalona.cat/.../nadal-2026-2027, which says the
    // Christmas tree moves to plaça de la Plana "per les obres"): the fair listed under "Pl. de la Plana".
    id: "org:badalona-fira-de-nadal-tradicional",
    ine: "08015",
    name: "Fira de Nadal Tradicional",
    start: "2026-11-20",
    end: "2026-12-23",
    place: "Plaça de la Plana",
    url: "https://www.badalona.cat/ca/serveis-ajuntament/cultura/festes/nadal/nadal-2026-2027/nadal-2026-2027/nadal_triptic_a3_28oct_def-1.pdf",
    publisher: "Ajuntament de Badalona (Programa de Nadal 2026-2027)",
    readOn: "2026-11-25",
    quote: "FIRA DE NADAL TRADICIONAL Del 20 de novembre al 23 de desembre De 9 a 21 h · Pl. de la Plana",
    hours: { ca: "de 9 a 21 h", es: "de 9 a 21 h", en: "9:00 to 21:00" },
  },
  {
    // The council's fairs page (tarragona.cat/la-ciutat/nadal-a-tarragona/fires): "Quan i on 04/12/2026 a 10:00 a 23/12/2026 a 21:00
    // Rambla Nova - Tram Teresianes Preu Gratuït Organitzat per Mercats de Tarragona". Left out: the 26a Fira de l'Oli DOP Siurana
    // (27-28 Nov, plaça Corsini), an olive-oil fair, not a Christmas one.
    id: "org:tarragona-fira-de-nadal",
    ine: "43148",
    name: "Fira de Nadal",
    start: "2026-12-04",
    end: "2026-12-23",
    place: "Rambla Nova (tram Teresianes)",
    url: "https://www.tarragona.cat/la-ciutat/nadal-a-tarragona/fires",
    publisher: "Ajuntament de Tarragona",
    readOn: "2026-11-25",
    quote:
      "La Rambla Nova acull la Fira de Nadal, del 4 al 23 de desembre. … Durada: Del 4 de desembre al 23 de desembre de 2026 Horari d’obertura: 10 - 21 h … Rambla Nova - Tram Teresianes Preu Gratuït",
    hours: { ca: "de 10 a 21 h; entrada gratuïta", es: "de 10 a 21 h; entrada gratuita", en: "10:00 to 21:00; free entry" },
  },
  {
    // The same page gives two end dates for the craft fair: its text and date field say 6 January, its "Durada" line 23 December.
    // The earlier one is printed (the safer one for someone planning a trip) and the quote shows both; the conflict is
    // not repeated in `hours` (26 Nov 2026 review: an editorial note does not belong in an hours answer).
    id: "org:tarragona-fira-d-artesania",
    ine: "43148",
    name: "Fira d'Artesania",
    start: "2026-12-04",
    end: "2026-12-23",
    place: "Rambla Nova (tram Balcó)",
    url: "https://www.tarragona.cat/la-ciutat/nadal-a-tarragona/fires",
    publisher: "Ajuntament de Tarragona",
    readOn: "2026-11-25",
    quote:
      "La Rambla Nova acull la Fira d’Artesania, del 4 de desembre al 6 de gener. … Inauguració: Divendres, 4 de desembre a les 17 h Durada: Del 4 de desembre al 23 de desembre de 2026 Horari d’obertura: 10 - 21 h (menys el dia 4 de desembre)",
    hours: {
      ca: "de 10 a 21 h; el 4 de desembre, inauguració a les 17 h",
      es: "de 10 a 21 h; el 4 de diciembre, inauguración a las 17 h",
      en: "10:00 to 21:00; on 4 December the opening is at 17:00",
    },
  },
  // --- Confirmed on 24 Nov 2026 (they were in UNCONFIRMED_FAIRS or PENDING_MARKETS until then) ---
  {
    // Council news "Comparteix el Nadal 2026-2027" ("Divendres, 20 de novembre
    // de 2026") and the programme leaflet it links (PDF,
    // /media/repository/noticies/11_novembre_2026/Nadal_2026_triptic_v_2.pdf):
    // "XV FIRA DE NADAL A VALLIRANA 27 de nov. de 18.30 h a 20.30 h 28 de nov.
    // d’11 a 14 h i de 16 a 20.30 h 29 de nov. d’11 a 14 h i de 16 a 19.30 h
    // Rambla de la Sobirania"; "DIVENDRES 27 DE NOVEMBRE … 17.30 h Xocolatada
    // popular per a tothom (unitats limitades). … 18.15 h Encesa de llums de
    // Nadal de Vallirana i inauguració de la fira." The fairs calendar gives
    // 28-29 November: the council adds the Friday evening.
    id: "org:vallirana-fira-de-nadal",
    ine: "08295",
    name: "XV Fira de Nadal a Vallirana",
    start: "2026-11-27",
    end: "2026-11-29",
    place: "Rambla de la Sobirania",
    url: "https://www.vallirana.cat/actualitat/noticies/comparteix-el-nadal-2026-2027.html",
    publisher: "Ajuntament de Vallirana",
    readOn: "2026-11-25",
    quote:
      "La sortida a totes les propostes serà el divendres 27 de novembre amb l’encesa de les llums de Nadal i l’obertura de la Fira que estarà a la rambla de la Sobirania fins al diumenge 29.",
    replaces: "vm32:24032398",
    hours: {
      ca: "divendres 27, de 18.30 a 20.30 h (a les 18.15 h, encesa de llums i inauguració); dissabte 28, d'11 a 14 h i de 16 a 20.30 h; diumenge 29, d'11 a 14 h i de 16 a 19.30 h",
      es: "viernes 27, de 18.30 a 20.30 h (a las 18.15 h, encendido de luces e inauguración); sábado 28, de 11 a 14 h y de 16 a 20.30 h; domingo 29, de 11 a 14 h y de 16 a 19.30 h",
      en: "Friday 27, 18:30 to 20:30 (lights switch-on and opening at 18:15); Saturday 28, 11:00 to 14:00 and 16:00 to 20:30; Sunday 29, 11:00 to 14:00 and 16:00 to 19:30",
    },
  },
  {
    id: "org:manresa-fira-de-santa-llucia",
    ine: "08113",
    name: "Fira de Santa Llúcia",
    start: "2026-12-12",
    end: "2026-12-13",
    place: "Plaça Major i Baixada de la Seu",
    url: MANRESA_AGENDA,
    publisher: "Ajuntament de Manresa (agenda L'Apuntador, Manresa Turisme)",
    readOn: "2026-11-24",
    quote:
      "Del 12/12/2026 10:00 al 13/12/2026 20:00 … Horaris de la fira. Dissabte 12 de desembre de 10h a 20h a la Plaça Major. Diumenge 13 de desembre 10h a 20h a la Plaça Major i a la Baixada de la Seu.",
    replaces: "vm32:24032442",
    hours: {
      ca: "dissabte 12, de 10 a 20 h, a la plaça Major; diumenge 13, de 10 a 20 h, a la plaça Major i a la Baixada de la Seu",
      es: "sábado 12, de 10 a 20 h, en la plaza Major; domingo 13, de 10 a 20 h, en la plaza Major y en la Baixada de la Seu",
      en: "Saturday 12, 10:00 to 20:00, on Plaça Major; Sunday 13, 10:00 to 20:00, on Plaça Major and Baixada de la Seu",
    },
    details: MANRESA_DETAILS,
  },
  {
    // The council's Christmas agenda ("Del 20 de novembre de 2026 al 7 de gener
    // de 2027, la Màgia del Nadal és a Martorell"), page 4 of the listing.
    id: "org:martorell-fira-de-nadal",
    ine: "08114",
    name: "Fira de Nadal",
    start: "2026-12-19",
    end: "2026-12-20",
    place: "Plaça de la Vila i carrer de Francesc Santacana",
    url: "https://www.martorell.cat/pg4/pag841/pl302/la-magia-del-nadal.htm",
    publisher: "Ajuntament de Martorell",
    readOn: "2026-11-24",
    quote: "19 desembre FIRA DE NADAL 10.00 a 20.00 h Pl. de la Vila i c. de Francesc Santacana … 20 desembre FIRA DE NADAL 10.00 a 20.00 h Pl. de la Vila i c. de Francesc Santacana",
    replaces: "vm32:24033249",
    hours: { ca: "dissabte 19 i diumenge 20, de 10 a 20 h", es: "sábado 19 y domingo 20, de 10 a 20 h", en: "Saturday 19 and Sunday 20, 10:00 to 20:00" },
  },
  {
    // Solsona Turisme's news of 19 Nov 2026 (the address the organiser
    // registered in the fairs calendar). Also there: "La fira, que presenta un
    // total de 36 parades"; "La jornada firal de dissabte començarà a les deu
    // del matí amb l’obertura dels mercats i l’exposició de tions"; "a les sis
    // de la tarda amb el lliurament de premis i l’encesa de l’arbre de Nadal a
    // la plaça Major". No closing time is given.
    id: "org:solsona-fira-del-tio",
    ine: "25207",
    name: "Fira del Tió",
    start: "2026-12-05",
    end: "2026-12-05",
    place: null,
    url: "https://solsonaturisme.com/la-fira-del-tio-de-solsona-amplia-el-recinte-firal-i-creix-fins-als-30-artesans/",
    publisher: "Solsona Turisme",
    readOn: "2026-11-25",
    quote:
      "En la seva dotzena edició, el dissabte 5 de desembre, la Fira del Tió assolirà una xifra rècord de participació artesana, amb 30 parades, cinc més que en l’edició anterior.",
    replaces: "vm32:24032429",
    hours: {
      ca: "dissabte 5, des de les 10 h; a les 18 h, encesa de l'arbre de Nadal a la plaça Major",
      es: "sábado 5, desde las 10 h; a las 18 h, encendido del árbol de Navidad en la plaza Major",
      en: "Saturday 5, from 10:00; at 18:00, the Christmas tree is lit on Plaça Major",
    },
  },
  {
    // Granollers published its 2026 fairs page (read 24 Nov 2026; the year is
    // fixed by its last block: "festius d’obertura El 29 de novembre, 6, 7, 8,
    // 13, 20 i 27 de desembre de 2026 i el 3 de gener de 2027"). The plants
    // stall is left out: the heading puts it on plaça de la Corona and the text
    // under it on plaça de l'Església.
    id: "org:granollers-fira-de-pessebres",
    ine: "08096",
    name: "Fira de pessebres i ornamentació",
    start: "2026-11-26",
    end: "2026-12-24",
    place: "Plaça de la Porxada",
    url: "https://www.granollers.cat/nadal/fires-de-nadal",
    publisher: "Ajuntament de Granollers",
    readOn: "2026-11-25",
    quote:
      "Fira de pessebres i ornamentació a la plaça de la Porxada Del 26 de novembre al 24 de desembre, de 10 a 13.30 h i de 16.30 a 20.30 h … Hi haurà un total de 6 paradistes.",
    hours: { ca: "de 10 a 13.30 h i de 16.30 a 20.30 h; 6 parades", es: "de 10 a 13.30 h y de 16.30 a 20.30 h; 6 paradas", en: "10:00 to 13:30 and 16:30 to 20:30; 6 stalls" },
  },
  {
    id: "org:granollers-fira-d-artesania",
    ine: "08096",
    name: "Fira d'Artesania",
    start: "2026-12-11",
    end: "2027-01-05",
    place: "Plaça Barangé",
    url: "https://www.granollers.cat/nadal/fires-de-nadal",
    publisher: "Ajuntament de Granollers",
    readOn: "2026-11-25",
    quote:
      "Fira d'Artesania a la plaça Barangé De l'11 de desembre al 5 de gener, de 10 a 13.30 h i de 16.30 a 20.30 h (tancat els dies 25 i 26 desembre i l'1 de gener) L'espai comptarà amb una dotzena de casetes de fusta i il·luminacio led, un carrusel d’època",
    hours: {
      ca: "de 10 a 13.30 h i de 16.30 a 20.30 h; tancat el 25 i el 26 de desembre i l'1 de gener; una dotzena de casetes de fusta i un carrusel d'època",
      es: "de 10 a 13.30 h y de 16.30 a 20.30 h; cerrado el 25 y el 26 de diciembre y el 1 de enero; una docena de casetas de madera y un carrusel de época",
      en: "10:00 to 13:30 and 16:30 to 20:30; closed on 25 and 26 December and 1 January; about a dozen wooden huts and a vintage carousel",
    },
    closed: ["2026-12-25", "2026-12-26", "2027-01-01"],
  },
  {
    id: "org:granollers-roca-umbert-market",
    ine: "08096",
    name: "Roca Umbert Market",
    start: "2026-12-11",
    end: "2026-12-13",
    place: "Roca Umbert (Dents de Serra)",
    url: "https://www.granollers.cat/nadal/fires-de-nadal",
    publisher: "Ajuntament de Granollers",
    readOn: "2026-11-25",
    quote: "Roca Umbert Market L'11 de desembre, de 17.30 a 20.30 h, i el 12 i 13 de desembre, de 10 a 20.30 h",
    hours: {
      ca: "divendres 11, de 17.30 a 20.30 h; dissabte 12 i diumenge 13, de 10 a 20.30 h",
      es: "viernes 11, de 17.30 a 20.30 h; sábado 12 y domingo 13, de 10 a 20.30 h",
      en: "Friday 11, 17:30 to 20:30; Saturday 12 and Sunday 13, 10:00 to 20:30",
    },
  },
];

/**
 * Calendar fairs whose organiser's own page was opened on 13 Nov 2026 (and
 * again on 24 Nov 2026: Manresa, Martorell, Solsona and Vallirana had published and moved
 * to ORGANISER_FAIRS; the rest read the same) and does not carry the 2026
 * edition yet: the pages keep the calendar's dates (the
 * organiser registered them there) and say plainly that the organiser has not
 * confirmed them. Re-read these first on each pass; when one publishes, move
 * it to ORGANISER_FAIRS (with `replaces`) and drop it here.
 */
export const UNCONFIRMED_FAIRS: readonly UnconfirmedFair[] = [
  {
    fairId: "vm32:24033611",
    url: "https://santceloni.cat/34917",
    publisher: "Ajuntament de Sant Celoni",
    readOn: "2026-11-25",
    shows: {
      ca: "La pàgina de la fira encara és la del 2025 (6 i 7 de desembre de 2025).",
      es: "La página de la feria aún es la de 2025 (6 y 7 de diciembre de 2025).",
      en: "The fair's page still shows 2025 (6 and 7 December 2025).",
    },
  },
  {
    fairId: "vm32:24033508",
    url: "https://guixols.cat/nadal",
    publisher: "Ajuntament de Sant Feliu de Guíxols",
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia el mercat del 2026.",
      es: "La web del Ayuntamiento aún no anuncia el mercado de 2026.",
      en: "The council's website does not announce the 2026 market yet.",
    },
  },
  {
    fairId: "vm32:24033323",
    url: "https://www.arbocenc.cat/",
    publisher: "Ajuntament de l'Arboç",
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
    shows: {
      ca: "El web de l'Ajuntament encara no anuncia la fira del 2026, i la seva agenda de novembre (actualitzada el 30 d'octubre) no hi posa cap fira el diumenge 29: només hi surt un partit de futbol.",
      es: "La web del Ayuntamiento aún no anuncia la feria de 2026, y su agenda de noviembre (actualizada el 30 de octubre) no pone ninguna feria el domingo 29: solo aparece un partido de fútbol.",
      en: "The council's website does not announce the 2026 fair yet, and its November agenda (updated 30 October) lists no fair on Sunday 29: only a football match appears.",
    },
  },
  {
    fairId: "vm32:24033306",
    url: "https://www.montgat.cat/turisme/festes-i-fires",
    publisher: "Ajuntament de Montgat",
    readOn: "2026-11-25",
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
    readOn: "2026-11-25",
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
 * 24 Nov 2026: Granollers published (ORGANISER_FAIRS); Lleida and Tarragona
 * read the same; Sitges answered with the login form again.
 * 25 Nov 2026: Tarragona's council published its fairs page (Fira de Nadal and
 * Fira d'Artesania, 4 Dec on the Rambla Nova), so it left this list; Lleida's page
 * still links only the 2025-26 calendar; Sitges answered with the login form again
 * (the 30 Oct reading stays).
 */
export const PENDING_MARKETS: readonly PendingMarket[] = [
  {
    id: "pending:lleida-mercat-de-nadal",
    ine: "25120",
    name: "Mercat de Nadal",
    url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal",
    publisher: "Paeria de Lleida",
    readOn: "2026-11-25",
    shows: {
      ca: "La Paeria només enllaça el calendari dels mercats de Nadal 2025-2026, a la plaça de la Catedral i voltants.",
      es: "La Paeria solo enlaza el calendario de los mercados de Navidad 2025-2026, en la plaza de la Catedral y alrededores.",
      en: "The city only links the 2025-2026 Christmas market calendar, on Plaça de la Catedral and around it.",
    },
  },
  {
    id: "pending:sitges-nadal",
    ine: "08270",
    name: "Nadal a Sitges",
    url: "https://www.sitges.cat/serveis/nadal-a-sitges",
    publisher: "Ajuntament de Sitges",
    // 3, 13, 24 and 25 Nov 2026: the page answered with a login form, so this stays the 30 Oct reading.
    readOn: "2026-10-30",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara no anuncia cap fira ni mercat del 2026.",
      es: "La página de Navidad del Ayuntamiento aún no anuncia ninguna feria ni mercado de 2026.",
      en: "The council's Christmas page announces no 2026 fair or market yet.",
    },
  },
];
