# Cluster 3 — Barcelona practical: rankings-push review (26 Oct 2026)

Reviewer: cluster agent 3 (read-only). Input: `input-3-bcn-practical.json` (GSC 27 Sep–24 Oct) plus per-page query pulls (`gsc-page.py`-equivalent, same window). Every fact below was re-read on the official page on **26 Oct 2026** unless marked otherwise. Competition = US-located WebSearch, indicative only.

Rules applied: SEO_EXPERIMENTS 26 Oct (no title/meta proposals: none of these titles is factually wrong or misses its query); metro-hours titles frozen to 14 Nov, EN transport-pass title frozen to 16 Nov, tourist-tax titles changed 23 Oct. Earliest edit = last commit + 28 days; P0 fixes may go in now.

## Summary

| Article (ca/es/en) | Impr. 28 d (ca/es/en) | Best position | Priority | Earliest edit | P0 |
|---|---|---|---|---|---|
| Transport passes | 62 / 455 / 1,995 | 7.7 (EN) | **5** | 21 Nov | no |
| Metro hours | 272 / 1,347 / 933 | 6.4 (EN) | **4** | 20 Nov | no |
| Tourist tax | 231 / 1,205 / 266 | 6.7 (CA) | **4** | 20 Nov | no |
| Street parking | 611 / 1,031 / 180 | 5.8 (EN) | **4** | 21 Nov | no |
| ZBE, foreign cars | 32 / 415 / 364 | 7.6 (CA) | 3 | 21 Nov | no |
| Cruise port | 6 / 57 / 236 | 7.8 (CA) | 3 | **P0 now (before 31 Oct)**; rest 21 Nov | **yes** |
| Airport to centre | 70 / 264 / 467 | 8.9 (CA, thin) | 2 | 20 Nov | no |
| Weather by month | 91 / 107 / 0 | 4.3 (CA) | 1 | 21 Nov | no |
| Barcelona Card vs Hola | 12 / 39 / 51 | 9.3 (EN) | 1 | 21 Nov | no |
| Barcelona practical hub | 2 / 1 / 0 | 6 (ES, 1 impr.) | 1 | 22 Nov | no |

Verified correct on 26 Oct (no change needed): TMB fares (single €2.90, T-casual €13, T-dia €12, T-usual €22.80, airport ticket €5.90, Hola from €12.50); ATM T-casual zones 1–7 (13.00 → 57.60) and its rules (3 transfers / 75 min +15 min per zone, not valid at L9 Sud T1/T2, +€1 on cardboard); TMB metro hours and special nights; AMB taxi 2026 (€2.80, €1.35/€1.66 per km, €4.60 airport and Moll Adossat supplements, €21 airport minimum, €46 airport–Moll Adossat); AREA blue and green rates, hours, resident rate; ZBE hours, area, €7 fee, 24 day permits, €5/€6, 23:59-next-day rule, 15 working days, "multa a partir de 200 euros"; ATC tourist-tax tables (Barcelona and rest of Catalonia, Barcelona surcharge 5/6/7 €, the seven municipalities); AEMET 0076 normals (all twelve rows); Cruise Bus €3.50 / €5; Barcelona Card €39 (online €35.10), more than 25 museums, no night buses.

---

## 1. Cruise port to city centre — P0 now

**Demand.** EN 236 impr. at 9.3: `cruise bus barcelona ticket` 6.0, `cruise bus barcelona` 10.8, `… price` 11.8, `how far is the cruise port … from city center` 7.3, `how much is taxi from barcelona cruise port to city centre` 8.3, `barcelona cruise port taxi` 53. ES 57 at 22.6 (`muelle adosado`, `moll adossat` 40–54). CA 6.

**Live page.** Answer-first lead, terminal table, Cruise Bus €3.50/€5, taxi supplements, "Changes ahead". Table lists terminal C as a working terminal; Cruise Bus copy says it stops at "A, B, C, D, E and H".

**P0 — terminal C closes this week; MSC/H stop not confirmed by the operator.**
- Port de Barcelona press note, 15.04.2026 (https://www.portdebarcelona.cat/ca/media/8843/download): *"A finals d'any està previst el tancament i inici de l'enderroc de la terminal C del moll Adossat, que deixarà de prestar servei a finals d'octubre, així com el cessament de l'activitat de la terminal Barcelona Sud, situada al World Trade Center, previst per a finals d'any."*
- Cruise Bus stops page (https://cruisebus.barcelona/en/parades/, read 26 Oct): *"From terminals A, B, C, D and E, the Cruise Bus will drop you off right next to La Rambla…"* — terminal H/MSC is not named anywhere on the operator's stops or service page today. The Port's transport page only says the Adossat terminals have a shuttle.

Apply by 31 Oct (all three editions; `cruiseport.ts`):
- Table: delete the C row label → `["D (Palacruceros)", …, "2.5 km", …]` and add a note line. MSC (H) row, "Getting to the city" → `Taxi` / `Taxi` / `Taxi` (the Cruise Bus page does not list H; do not promise it).
- Bus paragraph:
  - en: "It stops at terminals A, B, D and E on the Moll Adossat (the operator's stops page also lists C, which the Port says stops operating at the end of October 2026) and runs to the city end next to the World Trade Center…"
  - es: "Para en las terminales A, B, D y E del Muelle Adosado (la página de paradas del operador también cita la C, que según el Port deja de operar a finales de octubre de 2026) y va hasta el extremo de la ciudad junto al World Trade Center…"
  - ca: "Para a les terminals A, B, D i E del Moll Adossat (la pàgina de parades de l'operador també cita la C, que segons el Port deixa de funcionar a finals d'octubre de 2026) i va fins a l'extrem de la ciutat al costat del World Trade Center…"
- "Changes ahead" — replace with the Port's own wording:
  - en: "In its note of 15 April 2026 the Port said terminal C on the Moll Adossat would stop operating at the end of October 2026 and then be demolished, and that the Barcelona Sud terminal at the World Trade Center would stop operating at the end of the year. Check your terminal with your cruise line."
  - es: "En su nota del 15 de abril de 2026 el Port indicó que la terminal C del Muelle Adosado dejaría de operar a finales de octubre de 2026 y después se derribaría, y que la terminal Barcelona Sud, en el World Trade Center, cesaría su actividad a finales de año. Confirma tu terminal con la naviera."
  - ca: "En la nota del 15 d'abril de 2026 el Port va indicar que la terminal C del Moll Adossat deixaria de funcionar a finals d'octubre de 2026 i després s'enderrocaria, i que la terminal Barcelona Sud, al World Trade Center, cessaria l'activitat a finals d'any. Confirma la terminal amb la naviliera."
- FAQ "Where do cruise ships leave from": drop "C," from the list (all three).
- Add the press note to `SOURCES`; set VERIFIED to the apply date.
- **P1, dated:** after 31 Dec 2026 the WTC row ("400 m, on foot") and the lead/FAQ "only the World Trade Center terminal is close enough to walk" become wrong. Re-check the Port at the start of January and rewrite then.

**Competition.** `cruise bus barcelona ticket`: barcelona.de / barcelona.com win with links and age, but quote stale figures (€3 / €4.50). Taxi queries: competitors give a number. Note: the Port calls the €5 ticket a *"€5 round-trip ticket"*, the operator *"DAY TICKET WEB (5€)"*; keep the operator's wording.

**Smallest change (21 Nov).** Answer the taxi-to-centre query with the verified meter components (no invented total):
- en: "There is no fixed fare from the terminals to the city centre: the meter starts at €2.80, adds €1.35 a km on weekdays from 08:00 to 20:00 (€1.66 at night, on Saturdays and holidays), plus the €4.60 Moll Adossat supplement. The terminals are 2 to 3.9 km from the city, on the Port's figures."
- es: "No hay tarifa fija de las terminales al centro: el taxímetro arranca en 2,80 €, suma 1,35 € por km los laborables de 08:00 a 20:00 (1,66 € de noche, sábados y festivos) y el suplemento de 4,60 € del Moll Adossat. Las terminales están a entre 2 y 3,9 km de la ciudad, según el Port."
- ca: "No hi ha tarifa fixa de les terminals al centre: el taxímetre comença a 2,80 €, suma 1,35 € per km els feiners de 08:00 a 20:00 (1,66 € de nit, dissabtes i festius) i el suplement de 4,60 € del Moll Adossat. Les terminals són a entre 2 i 3,9 km de la ciutat, segons el Port."
Source: https://taxi.amb.cat/usuaris/tarifes-del-taxi (2026 tariff, read 26 Oct).

**Links in.** Only airport + hub link here. Add from EN transport passes (strongest cluster page, 1,995 impr.) — in the "Where to start looking" paragraph: "Arriving by ship? See [how to get from the cruise terminals to the city](cruiseport)." es: "¿Llegas en crucero? Mira [cómo ir de las terminales al centro](cruiseport)." ca: "Arribes en creuer? Mira [com anar de les terminals al centre](cruiseport)."

**Priority 3** (236 EN impr. at 9.3; named queries at 6–12; high confidence).

---

## 2. Transport passes — priority 5

**Demand.** EN 1,995 impr. at 7.7 (41 clicks): `barcelona transport pass` 15.6, `t casual barcelona` 12.5, `t casual barcelona price` 8.2, `t-dia barcelona` 7.4, `barcelona metro pass` 25.5, `barcelona metro card` 34.6, `barcelona public transport pass` 19.2, plus the multilingual "3 days / 3 giorni / 4 giorni" tail at 4–12. ES 455 at 14.6: `t casual` 22.4, `tarjeta hola barcelona` 25, `t casual 3 zonas precio` 28, `hola barcelona vs t casual` 8.0, `tarjeta 10 viajes barcelona` 27.5. CA 62.

**Live page.** ES lead answers the T-casual price first; EN lead does not (it opens with "Barcelona's ticket system can be confusing…") and the EN edition has no zone table, which CA/ES have.

**Competition.** `barcelona transport pass`: TUI, Headout, Tiqets, barcelona-tourist-guide — sellers of Hola Barcelona; they win on intent (a buyable pass) and links. TMB itself is not in the top results. Our edge is the comparison table; the gap is that the EN lead does not state the answer and EN lacks the per-zone T-casual price that `t casual barcelona price` asks for.

**Smallest change (21 Nov; EN title stays frozen to 16 Nov and is not touched).**
1. EN answer-first lead (replace the first paragraph):
   "A **T-casual** costs **€13 for ten journeys** in zone 1, a **T-dia €12 for 24 hours** of unlimited travel, and the tourist **Hola Barcelona Travel Card €12.50 for 24 hours up to €43.60 for 120 hours**. For a month, the **T-usual** is €22.80. Which is cheapest depends on how many journeys you make and whether you use the airport metro, where the T-casual is not valid."
2. EN: add the zone table already used by ca/es (`ZONE_FARES`) under a new H2 "T-casual price by zone", caption "T-casual price by zone, 2026", note "Source: ATM, Autoritat del Transport Metropolità. Barcelona and El Prat de Llobregat are in zone 1." and the paragraph: "**How many zones do you need?** Count the fare sector you start in and the one you end in: Barcelona (zone 1) to Sabadell (zone 2C) needs a 2-zone ticket, according to TMB. Each journey allows up to 3 transfers within 75 minutes in one zone, plus 15 minutes for each extra zone. A T-casual on a cardboard T-mobilitat card costs €1 more."
3. FAQ block (all three; the page has none). Every answer from TMB/ATM, 26 Oct:
   - en: "How much is the T-casual in 2026?" → "€13 in zone 1, €25.50 for two zones and €34.70 for three, for ten journeys." / "Can two people share a T-casual?" → "Not at the same time: it is not tied to a name, but only one person can travel on it per journey." / "Is the T-casual valid to the airport?" → "Not through the L9 Sud metro stations at T1 and T2. It is valid on the R2 Nord train and on buses." / "Hola Barcelona or T-casual?" → "If you will make ten journeys or fewer and do not need the airport metro, the T-casual (€13) is cheaper than any Hola Barcelona card from 48 hours (€18.70)."
   - es: "¿Cuánto cuesta la T-casual en 2026?" → "13 € en una zona, 25,50 € en dos y 34,70 € en tres, por diez viajes." / "¿Pueden compartir dos personas una T-casual?" → "No a la vez: no es nominativa, pero en cada viaje solo puede usarla una persona." / "¿La T-casual vale para el aeropuerto?" → "No en las estaciones de metro de la L9 Sud en la T1 y la T2. Sí vale en el tren R2 Nord y en el autobús." / "¿Hola Barcelona o T-casual?" → "Si harás diez viajes o menos y no necesitas el metro del aeropuerto, la T-casual (13 €) sale más barata que cualquier Hola Barcelona de 48 horas o más (desde 18,70 €)."
   - ca: "Quant costa la T-casual el 2026?" → "13 € en una zona, 25,50 € en dues i 34,70 € en tres, per deu viatges." / "La poden compartir dues persones?" → "No alhora: no és nominativa, però a cada viatge només la pot fer servir una persona." / "La T-casual val per a l'aeroport?" → "No a les estacions de metro de l'L9 Sud a la T1 i la T2. Sí que val al tren R2 Nord i a l'autobús." / "Hola Barcelona o T-casual?" → "Si faràs deu viatges o menys i no necessites el metro de l'aeroport, la T-casual (13 €) surt més barata que qualsevol Hola Barcelona de 48 hores o més (des de 18,70 €)."
Sources: https://www.tmb.cat/ca/tarifes-metro-bus-barcelona ("T-casual … Des de: 13 €", "T-dia … Des de: 12 €", "T-usual … Des de: 22,80 €", "Bitllet aeroport … Preu: 5,90 €", "Hola Barcelona … Des de: 12,50 €"); https://www.atm.cat/en/titols-tarifes/titols-i-tarifes/t-casual (zone table 13,00 € … 57,60 €; "not valid at the Aeroport T1 and T2 metro stations on the L9 Sud line"). Note: TMB shows no effective date ("Fins al canvi de tarifes"); ATM keeps a second, lower table (12,55 € …) that is the previous year — do not confuse them.

**Links in.** Already 14 files. Add the EN metro-hours tip link (see §3). Nothing else needed.

**Priority 5** (largest page in the cluster, position 7.7, high confidence).

---

## 3. Metro hours — priority 4

**Demand.** ES 1,347 impr. at 10.5, **0 clicks**; 254 queries, almost all generic and without "Barcelona": `horario metro` 9.9, `a que hora abre/cierra el metro` 10–14, `horario metro viernes` 11.6, `hay metro toda la noche hoy` 8.5, `horario metro domingo` 13.8. Explicit Barcelona queries rank far worse: `horario metro barcelona` **29.3**, `metro barcelona horario` 22, `horario metro barcelona domingo/viernes` 31–44. EN 933 at 6.4: `does the barcelona metro run all night/24 hours` 6.2, `barcelona metro hours` 3.0, `sunday metro timings` 6.0, `what time do buses stop running in barcelona` 8.0, `barcelona bus hours` 3.5. CA 272 at 10.1 (`horari metro divendres` 9.1).

**Reading.** The generic Spanish queries come from Spain (GSC country split: 563 of the attributable impressions are ESP) with no city named; Google localises them and puts TMB and its own transit box above us. Zero clicks at 10–11 is the expected ceiling there. The winnable gap is the explicit `horario metro barcelona` set at 22–44.

**Live page.** Lead answers hours; "today/tomorrow" widget works (shows Mon 26 Oct correctly). H2s: closing time, special nights, NitBus, tram, tips.

**Competition.** `horario metro barcelona`: mapametrobarcelona.com (×2), metrodebarcelone.com, redtransporte, barcelona.com, Time Out (New Year). They win on links/age and on two sections we lack: **stations with different hours** (L9/L10 Sud industrial stations) and **Montjuïc funicular hours**.

**Smallest change (20 Nov; titles stay frozen to 14 Nov and are not touched).** Two sections + one FAQ, all from TMB's hours page (https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus, read 26 Oct):
- Quote 1: *"Mas Blau, Mercabarna and Parc Logístic (L9 Sud) and ZAL | Riu Vell, Ecoparc and Port Comercial | La Factoria (L10 Sud) stations have the same opening times everyday: from 5.00 to 24.00 hours. On 24 December, they will close at 23.00 hours."*
- Quote 2: *"From 10/26/2026 to 03/28/2027 (both included): Working days, Mondays to Fridays: from 07:30 to 20:00. Saturdays, Sundays and public holidays: from 09:00 to 20:00."* (summer: to 22:00 from 29 Mar 2027).

Paste-ready:
- en H2 "Stations with different hours": "Six stations on the L9 Sud and L10 Sud keep the same hours every day, 5:00 to midnight, and do not stay open all night on Saturdays: Mas Blau, Mercabarna and Parc Logístic (L9 Sud), and ZAL | Riu Vell, Ecoparc and Port Comercial | La Factoria (L10 Sud). On 24 December they close at 23:00. The airport stations follow the normal metro hours."
  H2 "Montjuïc funicular": "Until 28 March 2027 the funicular from Paral·lel runs Monday to Friday from 7:30 to 20:00, and Saturdays, Sundays and holidays from 9:00 to 20:00. From 29 March 2027 it closes at 22:00."
- es: "Estaciones con otro horario": "Seis estaciones de la L9 Sud y la L10 Sud tienen el mismo horario todos los días, de 5:00 a medianoche, y no abren toda la noche del sábado: Mas Blau, Mercabarna y Parc Logístic (L9 Sud), y ZAL | Riu Vell, Ecoparc y Port Comercial | La Factoria (L10 Sud). El 24 de diciembre cierran a las 23:00. Las estaciones del aeropuerto siguen el horario normal." / "Funicular de Montjuïc": "Hasta el 28 de marzo de 2027 el funicular desde Paral·lel funciona de lunes a viernes de 7:30 a 20:00, y sábados, domingos y festivos de 9:00 a 20:00. Desde el 29 de marzo de 2027 cierra a las 22:00."
- ca: "Estacions amb un altre horari": "Sis estacions de l'L9 Sud i l'L10 Sud tenen el mateix horari cada dia, de 5:00 a mitjanit, i no obren tota la nit del dissabte: Mas Blau, Mercabarna i Parc Logístic (L9 Sud), i ZAL | Riu Vell, Ecoparc i Port Comercial | La Factoria (L10 Sud). El 24 de desembre tanquen a les 23:00. Les estacions de l'aeroport segueixen l'horari normal." / "Funicular de Montjuïc": "Fins al 28 de març de 2027 el funicular des del Paral·lel funciona de dilluns a divendres de 7:30 a 20:00, i dissabtes, diumenges i festius de 9:00 a 20:00. A partir del 29 de març de 2027 tanca a les 22:00."
- FAQ (Sunday, `horario metro domingo` 13.8 / `sunday metro timings` 6.0):
  en "What are the metro hours on Sunday?" → "The metro keeps running through Saturday night into Sunday and closes at midnight on Sunday." es "¿Qué horario tiene el metro el domingo?" → "Sigue abierto toda la noche del sábado al domingo y cierra a medianoche el domingo." ca "Quin horari té el metro el diumenge?" → "Segueix obert tota la nit del dissabte al diumenge i tanca a mitjanit el diumenge." (TMB: *"Saturdays: … continuous service throughout Saturday to Sunday night"*, *"Metro service ends at midnight on Sunday."*)
- EN bus sentence (for `what time do buses stop running`): "TMB publishes daytime bus times stop by stop, in real time where available; there is no single closing time for the network. From about 22:30 the NitBus takes over." (TMB: *"If this information is not available, you will be shown the scheduled arrival times…"*; AMB: NitBus *"circulen de 22.30 h a 6.00 h"*.)

**P1 — NitBus line count.** Page says 24 lines. AMB's press note on N23/N24 says the network *"arriba a les 23 línies"*; AMB's NitBus search lists 24 codes including N0. Safer wording, all three: "more than 20 lines" / "más de 20 líneas" / "més de 20 línies".

**Links in (cross-cluster, editorially right).** The holiday calendars are the strongest relevant pages (ES 1,924 impr., CA 1,604): one tip under the holiday list in `holidays/copy.ts` — es: "La víspera de festivo, el metro de Barcelona funciona hasta las 2:00: [horario del metro](hours)." ca: "La vigília de festiu, el metro de Barcelona funciona fins a les 2:00: [horari del metro](hours)." en: "On the night before a public holiday, Barcelona's metro runs until 2:00: [metro hours](hours)." (Earliest 20 Nov; that page belongs to cluster 2.) EN metro-hours tip "Arriving late at the airport" → make "airport" an inline link to the airport guide (feeds §7).

**Priority 4** (2,500 impr.; EN already 6.4; ES generic set capped; medium confidence).

---

## 4. Tourist tax — priority 4

**Demand.** ES 1,205 at 9.6: `tasa turistica barcelona` 15.4, `cuanto es la tasa turistica en barcelona` 10.3, `tasa turistica catalunya` 9.9, **`tasa turistica cataluña` 32.0**, `tasas turisticas cataluña` 32.5, `taxa turistica catalunya` 15.9, `city tax barcelona` 32.8, `impuesto turistico barcelona` 22.5. EN 266 at 8.2 (`barcelona tourist tax calculator` 7.4; `city tax barcelona` 58). CA 231 at 6.7.

**Live page.** Calculator, answer-first box, Barcelona and rest-of-Catalonia tables. The seven municipal surcharges are named but their amounts are not shown ("Cal comprovar-ho"). The ATC's special rate is missing.

**Competition.** `tasa turistica barcelona`: Barcelona Secreta, Ara, Vozpópuli, Statista, Chekin — news on the rise, freshness and links. The "Cataluña" variants want the Catalonia-wide picture, which is exactly the municipal surcharge detail we hold back.

**Smallest change (20 Nov).**
1. Add the municipal-surcharge table from the ATC (https://atc.gencat.cat/ca/tributs/ieet/quota-tributaria, read 26 Oct; *"Els ajuntaments de Castelldefels, Esplugues de Llobregat, l'Hospitalet de Llobregat, El Prat de Llobregat, Sabadell, Sant Cugat del Vallès i Sant Just Desvern han aprovat recàrrecs municipals sobre l'impost que s'aplicaran a partir de l'1 d'octubre de 2026."*). Surcharge per person per night, 1 Oct 2026–31 Mar 2027 (→ from 1 Apr 2027):

   | Municipality | 5-star | 4-star | Tourist dwelling | Youth hostel | Other |
   |---|---|---|---|---|---|
   | Castelldefels | 4.00 (4.00) | 1.80 (2.40) | 1.75 (2.40) | 0.80 (1.00) | 0.90 (1.20) |
   | Esplugues de Llobregat | — | 1.80 (2.40) | 0.90 (1.20) | — | 1.75 (2.50) |
   | L'Hospitalet, Sabadell, Sant Cugat | 4.00 (4.00) | 1.80 (2.40) | 1.75 (2.50) | 0.80 (1.00) | 0.90 (1.20) |
   | El Prat de Llobregat | 4.00 (4.00) | 1.80 (2.40) | 1.75 (2.50) | 0.80 (1.00) | 0.90 (1.20) |
   | Sant Just Desvern | 4.00 | 1.80 | 1.75 | 0.80 | 0.90 |

   (Esplugues' dwelling/other figures are as the ATC prints them; "—" = no row on the ATC page. Put the figures in `rates.ts`, not in copy, per the file's rule.) Caption ca/es/en: "Recàrrec municipal fora de Barcelona, per persona i nit (ATC)" / "Recargo municipal fuera de Barcelona, por persona y noche (ATC)" / "Municipal surcharges outside Barcelona, per person per night (ATC)". Heading: "Municipis amb recàrrec propi" / "Municipios con recargo propio" / "Towns with their own surcharge".
2. One sentence on the special rate (ATC: *"La tarifa especial és aplicable a les estades en els establiments que, dins un centre recreatiu turístic, estiguin situats a les àrees en què s'admeten activitats de joc i apostes"*; TE1 10,00 €, TE2 7,00 €, TE3 5,00 € from 01.04.2026):
   - ca: "Hi ha una tarifa especial per als establiments situats, dins d'un centre recreatiu turístic, a les àrees on s'admet el joc: 10 € (5 estrelles), 7 € (4 estrelles) i 5 € (la resta)."
   - es: "Hay una tarifa especial para los establecimientos situados, dentro de un centro recreativo turístico, en las áreas donde se admite el juego: 10 € (5 estrellas), 7 € (4 estrellas) y 5 € (el resto)."
   - en: "A special rate applies to accommodation inside a tourist recreation centre, in the areas where gambling is allowed: €10 (five-star), €7 (four-star) and €5 (other)."

**Links in.** Only airport, cruise port and Christmas link here; the hub does not. Add to the hub "Arriving" group (see §10) and to the Barcelona tourist-traps feature (`features/traps.ts`, untouched since 18 Sep, so eligible now, though weak: ≤6 impr.): en "Budget for the tourist tax too: [what you pay per night in Barcelona](touristTax)." es "Suma también la tasa turística: [cuánto pagas por noche en Barcelona](touristTax)." ca "Compta també la taxa turística: [quant pagues per nit a Barcelona](touristTax)."

**Priority 4** (1,700 impr., ES at 9.6–10 on core queries, high confidence in the data).

---

## 5. Street parking — priority 4

**Demand.** ES 1,031 at 10.1: `como funciona la zona verde en barcelona` 22.2, `zona azul barcelona` 31.8, `zona blava barcelona` 32.2, `horario zona azul barcelona` 39.8, `precio zona azul barcelona` 9.5, `precio zona verde barcelona no residentes` 12.4, `que es mas barato zona azul o verde` 10.8. CA 611 at 9.0: `preu zona blava barcelona` **4.7** (36 impr.), `preu zona verda barcelona` 5.0, `horaris zona verda barcelona` 32. EN 180 (fragments).

**Live page.** Strong: price range in the lead, summary table, per-label tables, FAQ. No link to the official map of where the zones are.

**Competition.** `como funciona la zona verde en barcelona`: Mapfre, Highmotor, RACE, Parclick. They win on links and on two things: **where the zones are** (they point to the official map) and the **hours phrased as the question**.

**Smallest change (21 Nov).**
1. In the "rule" callout, add the official map (https://areaverda.cat/en/map — page title *"Map (orientative)"*, prompt *"Where do you want to park?"*; legend shows green, blue and resident-only areas and meters):
   - es: "Para ver qué zona hay en cada calle, usa el [mapa orientativo de AREA](https://areaverda.cat/es/map): muestra zona azul, verde, plazas exclusivas para residentes y parquímetros."
   - ca: "Per veure quina zona hi ha a cada carrer, fes servir el [mapa orientatiu d'AREA](https://areaverda.cat/ca/map): mostra zona blava, verda, places exclusives per a residents i parquímetres."
   - en: "To see which zone a street is in, use [AREA's map](https://areaverda.cat/en/map), which shows blue, green and resident-only spaces and the meters."
   (Check the /es and /ca map URLs resolve before publishing; /en verified.) Add to `PARKING_SOURCES`.
2. One FAQ in the words of the hours query (AREA blue: *"Monday to Friday, from 9:00 a.m. to 8:00 p.m., without interruption"*; centre also Saturdays; beach zones also Sundays and holidays; green: *"Monday to Friday or Monday to Saturday … from 8:00 a.m. to 8:00 p.m. or from 8:00 a.m. to 10:00 p.m., depending on the area"*):
   - es "¿Cuál es el horario de la zona azul en Barcelona?" → "De lunes a viernes, de 9:00 a 20:00 sin interrupción; en el centro, también los sábados, y en las zonas de playa, también domingos y festivos. La zona verde para no residentes se paga de 8:00 a 20:00 o a 22:00, de lunes a viernes o a sábado, según la zona."
   - ca "Quin és l'horari de la zona blava a Barcelona?" → "De dilluns a divendres, de 9:00 a 20:00 sense interrupció; al centre, també els dissabtes, i a les zones de platja, també diumenges i festius. La zona verda per a no residents es paga de 8:00 a 20:00 o a 22:00, de dilluns a divendres o a dissabte, segons la zona."
   - en "What are the blue zone hours in Barcelona?" → "Monday to Friday, 9:00 to 20:00 without a break; in the centre also on Saturdays, and in beach zones also on Sundays and holidays. Green spaces for non-residents are charged 8:00 to 20:00 or 22:00, Monday to Friday or Saturday, depending on the area."

**Links in.** Only hub + siblings link here today. Add:
- Spotify Camp Nou (`campnou.ts`, after "The club's page lists parking only for motorbikes, coaches, taxis and accessible vehicles."): en "Driving anyway? See [how Barcelona's blue and green parking zones work](parking)." es "¿Vas en coche igualmente? Mira [cómo funcionan la zona azul y la verde](parking)." ca "Hi vas igualment amb cotxe? Mira [com funcionen la zona blava i la verda](parking)."
- Tibidabo (`hills.ts`, "Parking at Tibidabo", EN 283 impr.): en "In the city itself, street parking is regulated: [blue and green zone prices](parking)." es "En la ciudad, el aparcamiento en la calle es regulado: [precios de la zona azul y verde](parking)." ca "A la ciutat, l'aparcament al carrer és regulat: [preus de la zona blava i verda](parking)."
Both pages last edited 23–24 Oct → 20–21 Nov.

**Priority 4** (1,800 impr.; CA already 4.7 on its head query; ES needs position).

---

## 6. ZBE, foreign cars — priority 3

**Demand.** ES 415 at 7.9: `como pedir autorización para entrar en barcelona` 11.2 (32), `autorización zbe barcelona` 16.7, `zbe barcelona autorizaciones diarias` 17. EN 364 at 8.4: `barcelona low emission zone` 26.6, `lez barcelona` 49, `… map` 16. CA 32.

**Live page.** Lead answers who/what/cost/hours; steps; fees; fine; Andorra. Missing: **where and how to pay/apply** — the "cómo pedir" query asks for the channel.

**Competition.** carwow.es, RACE (map), barcelona.com, motor.es. carwow wins on the channels (online, Correos, in person) and RACE on the map. No official ZBE map URL was found on zbe.barcelona or AMB (only quarterly report PDFs) — **do not add a map link**.

**Smallest change (21 Nov).** Add the channels to the "Day permits" section. AMB, https://zberegistre.ambmobilitat.cat/ca/AutoritzacionsDiaries (read 26 Oct): *"… área de usuario, en cualquier oficina de Correos del Estado español con un coste de gestión añadido, o bien presencialmente en la OAC del Área Metropolitana de Barcelona: calle 62, núm. 16-18, 08040 Barcelona (Zona Franca), los días laborables de lunes a viernes, de 9 a 14 h"*; FAQ: *"des del web del Registre o presencialment"*.
- es: "**Dónde se tramita.** La inscripción y los días se piden en línea, en el área de usuario del [Registro metropolitano](https://zberegistre.ambmobilitat.cat/). Los días también se pueden comunicar y pagar en cualquier oficina de Correos, con un coste de gestión añadido, o en persona en la oficina de atención de la AMB (calle 62, núm. 16-18, Zona Franca), de lunes a viernes laborables de 9 a 14 h."
- ca: "**On es tramita.** La inscripció i els dies es demanen en línia, a l'àrea d'usuari del [Registre metropolità](https://zberegistre.ambmobilitat.cat/). Els dies també es poden comunicar i pagar a qualsevol oficina de Correus, amb un cost de gestió afegit, o presencialment a l'oficina d'atenció de l'AMB (carrer 62, núm. 16-18, Zona Franca), de dilluns a divendres feiners de 9 a 14 h."
- en: "**Where to apply.** Register and book your days online, in the user area of the [AMB register](https://zberegistre.ambmobilitat.cat/). Days can also be booked and paid at any Spanish post office (Correos), for an added handling fee, or in person at the AMB office (Carrer 62, 16-18, Zona Franca), on working days Monday to Friday, 9:00 to 14:00."
Add step 0 to the "step by step" list: es "Entra en el Registro metropolitano de la AMB" (link) / ca "Entra al Registre metropolità de l'AMB" / en "Go to the AMB register".

Other figures re-verified 26 Oct (no change): 15 working days, Euro 3/Euro 4, €7 once, 24 days, €5/€6 since Jan 2022, 23:59 next day, date changes to the day before, *"se li pot imposar una multa a partir de 200 euros"* (https://www.zbe.barcelona/zones-baixes-emissions/vehicles-afectats.html), Mon–Fri 7–20 h. Third-party pages claim B-label diesel restrictions during pollution episodes; neither zbe.barcelona page states it — leave out.

**Links in.** Only hub + parking/transport. Add from Camp Nou alongside the parking link (en "…and, with a foreign-registered car, [register it for the low-emission zone first](zbe)."; es "…y, con matrícula extranjera, [regístralo antes para la ZBE](zbe)."; ca "…i, amb matrícula estrangera, [registra'l abans per a la ZBE](zbe).").

**Priority 3** (780 impr. at ~8; head query at 11; high confidence).

---

## 7. Airport to city centre — priority 2

**Demand.** EN 467 at **62.8**: every head variant (`transfer from barcelona airport to city centre`, `airport to barcelona city centre`, `bcn airport to city center`, `barcelona airport bus to city`) at 57–69; plus French (`aéroport barcelone centre ville` 68–75, ~60 impr., no FR edition). ES 264 at 32.5: `autobus aeropuerto barcelona centro` 42, `bus aeropuerto barcelona centro` 52, `transporte del aeropuerto … al centro` 49.5. CA 70 at 8.9 (thin).

**Live page.** Excellent first screen: answer-first lead, at-a-glance table, dated verification, sections per mode, terminals by airline, return trip, FAQ.

**Competition.** EN: cataloniahotels, hoppa, Wise, radicalstorage, barcelonalowdown — commercial domains with links; several quote stale Aerobús fares (€6.75). ES: barcelona.com, headout, barcelona-tourist-guide, guruwalk (€5.90 / €10.20, stale). **On-page we already beat them on accuracy and format; the gap is authority/links**, not content. Per the rankings-push rule: links, not a rewrite.

**Smallest change.**
- Links in (most important; all eligible from 20–21 Nov):
  - EN transport passes, T-casual section (after "…cannot be used through the L9 Sud airport metro gates at T1 or T2."): "Landing at the airport with one? See [how to get from the airport to the city centre](airport): the T-casual works on the R2 Nord train and bus 46." es: "¿Llegas al aeropuerto con una? Mira [cómo ir del aeropuerto al centro](airport): la T-casual vale en el tren R2 Nord y el bus 46." ca: "Arribes a l'aeroport amb una? Mira [com anar de l'aeroport al centre](airport): la T-casual val al tren R2 Nord i al bus 46."
  - Metro-hours tip (see §3).
- Freshness (P1): re-verify the Aerobús fare before the 20 Nov edit. Operator's rates page is JS-rendered and showed no figure to a server fetch today; ATM's airport page (content dated 21 Jul 2025) says *"Separate ticket required, from €7.45"*. The operator wins; €7.75/€13.30 stays as verified on 23 Oct, but confirm in a browser. Same for "Hola Barcelona with Aerobús from €28.65": not re-verifiable today.
- Verified 26 Oct (ATM): bus 46 *"approximately from 5:00 am to midnight"*; N17/N18 *"between midnight and 5:00 am … every 20–30 minutes"*; R2 Nord *"every 30 minutes, approximately, from 6 am to midnight"*; T-casual/T-familiar/T-grup not valid at L9 Sud airport stations. Rodalies R2N page: *"Aeroport - Sant Celoni/Maçanet Massanes: One train every 30 minutes"*, no current notice.
- Watch: FGC's new rail line to both terminals is reported for late 2026/early 2027 (3Cat). Add nothing until FGC/Generalitat publish a date.

**Priority 2** (800 impr. but EN at 63 / ES at 32; low confidence that content moves it).

---

## 8. Weather by month — priority 1

**Demand.** ES 107 at 8.8 and CA 91 at 4.3, scattered one-impression queries (`cual es el mes mas frio`, `en que mes llueve mas`, `cuando comienza el invierno`). **EN 0 impressions** after 12 days live.

**Live page.** Full AEMET table, seasons, city-centre note, records, FAQ.

**Smallest change (21 Nov).**
- EN: run URL Inspection on `/en/guides/barcelona-weather-by-month/`; zero impressions on an English climate page suggests it is not indexed (owner action, not a content edit).
- Add the annual row to the table (AEMET 0076, read 26 Oct: *Año 20.3 / 11.8 / 588 / 53.3 / -*): ca "Any" / es "Año" / en "Year": 20,3 · 11,8 · 588 · 53,3 · —. Lead addition: es "En un año caen de media 588 mm en unos 53 días de lluvia." ca "En un any hi cauen de mitjana 588 mm en uns 53 dies de pluja." en "A year brings 588 mm of rain on average, over about 53 rain days."
- Links in: already from hub, beaches, Christmas, pessebres. Fine.

**Priority 1.**

---

## 9. Barcelona Card vs Hola Barcelona — priority 1

**Demand.** EN 51 at 9.3, ES 39 at 9.8, CA 12. Queries: `hola card barcelona` 11, `hola barcelona travel card worth it` 21.5, `barcelona card vs hola barcelona` 4.0.

**Live page.** Answer-first lead, price table, the break-even sum, FAQ. Verified 26 Oct: Barcelona Card *"€39.00 regular price, €35.10 online price"*, *"more than 25 free museums"*, night buses not included (thisisbarcelona.com); Hola *"From €12.50"* with €11.25 online (holabarcelona.com). Other durations are JS-rendered and were not re-read today (last verified 24 Oct).

**Smallest change.** None to the body. The ES transport page ranks 8.0 for `hola barcelona vs t casual`, so the comparison intent lives there (§2 FAQ). Links in already 8 files.

**Priority 1.**

---

## 10. Barcelona practical hub — priority 1

**Demand.** 3 impressions in total; published 13 Oct, edited 25 Oct.

**Live page.** Link list grouped by Arriving / Getting around / Seeing / Day trips; all summaries match their child guides as of 26 Oct.

**Smallest change (22 Nov).** The hub does not list the tourist-tax guide. Add to "Arriving":
- en `["touristTax", "Tourist tax", "Barcelona adds a €5 municipal surcharge per person per night to the Catalan rate; a four-star hotel totals €8.40, with a calculator."]`
- es `["touristTax", "Tasa turística", "Barcelona suma un recargo municipal de 5 € por persona y noche a la tarifa catalana; un hotel de 4 estrellas, 8,40 € en total, con calculadora."]`
- ca `["touristTax", "Taxa turística", "Barcelona suma un recàrrec municipal de 5 € per persona i nit a la tarifa catalana; un hotel de 4 estrelles, 8,40 € en total, amb calculadora."]`
(ATC: EB2 3,40 € + surcharge 5,00 € = 8,40 €, valid to 31 Mar 2027; the hub must be re-synced on 1 Apr 2027.) After §1 ships, update the cruise line to "…from the Moll Adossat; only the WTC terminal is walkable, until it closes at the end of 2026."

**Priority 1.**

---

## Do not print (checked, no official source)

- A typical taxi total from the airport or cruise port to the centre (no official figure; give the tariff instead).
- An official ZBE map link (none found).
- B-label diesel restrictions during pollution episodes (only third-party sites claim it).
- Cruise Bus hours or frequency, and whether it stops at terminal H/MSC.
- A NitBus line count of exactly 24 (AMB sources say 23 and list 24 codes).
