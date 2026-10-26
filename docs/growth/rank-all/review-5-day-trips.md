# Review: cluster 5, day trips (26 Oct 2026)

Reviewer: cluster agent, read-only. Method: AGENT_BRIEF.md and rankings-push.md. GSC data runs 27 Sep to 24 Oct; per-day data shows these URLs only started collecting impressions on 13 Oct.
Every page in this cluster was edited on 23 or 24 Oct (sprint rounds 1 and 2 in SEO_EXPERIMENTS). Titles and metas stay frozen. Body changes wait for each page's date below, **except the P0s, which can ship now**.

## Summary

| Article | Impressions ca/es/en (28 d) | Best position (page) | Priority | Earliest edit | P0 |
|---|---|---|---|---|---|
| Vall de Núria rack railway | 46 / 291 / 191 = 528 | 7.2 en (es query "vall de nuria" 3.6) | **5** | 20 Nov 2026 | No |
| PortAventura from Barcelona | 69 / 118 / 360 = 547 | 7.1 en | **4** | 21 Nov 2026 | Time-boxed only (strike) |
| Sitges by train | 13 / 222 / 173 = 408 | 6.2 ca, 13.0 es | **4** | 21 Nov 2026 | Time-boxed only (strike) |
| Montserrat without a tour | 15 / 99 / 92 = 206 | 13.5 ca | **3** | **P0 now**; rest 21 Nov | **YES** |
| Figueres / Dalí Museum | 1 / 71 / 54 = 126 | 21.2 en | 2 | 21 Nov 2026 | Time-boxed only (strike) |
| Cerdanya without a car | 6 / 13 / 25 = 44 | 3.5 ca, 8.4 en | 2 | **P0 now**; rest 21 Nov | **YES** |
| Girona by train | 7 / 25 / 10 = 42 | 5.9 ca | 2 | 21 Nov 2026 | Time-boxed only (strike) |
| Andorra by bus | 4 / 9 / 19 = 32 | 5.2 ca | 1 | 21 Nov 2026 | No |
| Tarragona by train | 1 / 1 / 16 = 18 | 15.4 en | 1 | 21 Nov 2026 | Time-boxed only (strike) |

Earliest edit = last commit + 28 days: 23 Oct gives 20 Nov, 24 Oct gives 21 Nov. These match the "measure on" dates of the two sprint entries.

## Rail service check, 26 Oct 2026 (all lines this cluster prints)

Sources read today: the Rodalies home page and notices, the planner API behind rodalies.gencat.cat/horaris (`serveisgrs.rodalies.gencat.cat/api`, which also serves `/notices`), line PDFs, and FGC's GTFS feed (`feed_version 2026-10-25T15:22:41+01:00`).

| Line / page | Status today | Effect on our copy |
|---|---|---|
| **R3** (Cerdanya, Núria) | Notice "R3: Modificació del servei entre L'Hospitalet de Llobregat i Puigcerdà", "Data d'actualització: 06.07.2026": "una oferta de circulacions del 50% respecte a la que hi havia abans del 20 de gener". Daily notice of 25 Oct 08:02: "Circulació ferroviària entre la Garriga i Puigcerdà/La Tor de Querol. Servei alternatiu per carretera entre Ripoll - Puigcerdà, i entre Fabra i Puig - Puigcerdà." No end date. Stop change at Balenyà-Els Hostalets "a partir del 22/10". R3.pdf re-uploaded 25 Oct (sheet still dated 06/07/2026). | Regime unchanged. **The Cerdanya timetable is missing a daily through train (P0 below).** |
| **R2 Sud** (Sitges) | 17 Oct: line suspended from 22:00 because of rain, "El servei ha quedat restablert des de l'inici del servei de diumenge 18 d'octubre amb normalitat." 26 Oct 10:11: incident at Vilanova resolved ("Circulació restablerta… demores de 20 minuts de mitjana"). R2.pdf re-uploaded 25 Oct 20:48, sheet still "01/9/2026". Planner for 28 Oct, 31 Oct and 1 Nov: Sants→Sitges 5:45 to 0:06, at :06/:15/:36/:45, 31 or 37 min, 5,50 €; last Sitges→Sants 22:22. | All Sitges figures confirmed. Nothing to change. |
| **R11** (Girona, Figueres) | No notice. R11.pdf dated 04/07/2026. Planner for 28 Oct: Sants→Girona 23 trains, 5:56 to 21:46, 8,95 € regional / 12 € MD; Sants→Figueres 21 trains, 12,80 / 17,10 €; last Figueres→Sants 20:46. | Confirmed, except the Girona journey range (P1). |
| **R14 / R15 / R16 / R17 / RT2** (Tarragona, PortAventura) | R13-R14: road replacement between Lleida-Pirineus and La Plana Picamoixons (cable theft, notice of 10 Aug; daily notice 25 Oct). This does not touch Barcelona–Tarragona. R15.pdf 13/10/2026, R16 10/07/2026, R17RT2 08/06/2026. Planner for 28 Oct: Sants→Tarragona 32 trains at :03/:33, 69 min, 8,60 €; Sants→Salou-Port Aventura R17 at 8:33, 10:33 and 12:33 (1 h 24, 9,35 €), back at 11:11, 13:11 and 21:41. Planner for 31 Oct: last Tarragona→Sants 21:56. | All confirmed. |
| **All Renfe-run lines** | **Strike, Thursday 29 Oct** (`/ca/detalls/article/10_19_Vaga_29`, "Data d'actualització: 19.10.2026"): "convocatòria estatal del Sindicat de maquinistes SEMAF", "de les 00.01 a les 23.59 hores". Rodalies: "Hores punta: 66% del servei habitual." / "Resta de la jornada: 33% del servei habitual." Regionals: "els serveis mínims que estableixi el Departament d'Empresa i Treball de la Generalitat de Catalunya". Per-line minimum-service PDFs are linked from that page. | Time-boxed P0 (below). |
| **FGC R5 + Cremallera** (Montserrat) | GTFS of 25 Oct: R5 unchanged (weekdays 5:16 to 22:30; weekends hourly at :36). Rack railway: **from 2 Nov the weekday timetable ends an hour earlier.** Not a Renfe line, so the strike does not list it. | **P0 below.** |

---

## P0 — fix now (wrong facts live)

### P0-1 · Montserrat: November weekday rack-railway times are wrong

**Live claim (all 3 editions):** the table captioned "late October and November 2026" says Monistrol de Montserrat → Montserrat runs "Hourly at :48, 7:48 to 18:48" and Montserrat → Monistrol "Hourly at :15, 8:15 to 19:15". Monistrol-Vila has "Every 20 min, 8:35 to 19:15".

**Official data:** FGC GTFS (`https://www.fgc.cat/google/google_transit.zip`, feed_version `2026-10-25T15:22:41+01:00`, route `MM` "Cremallera Montserrat"):
- Service `6350da927176` runs on 37 dates from 2 Nov to 24 Dec: weekdays, except 7 and 8 Dec. On 4 Nov and 10 Dec the last train up from Monistrol de Montserrat is **17:48** and the last down is **18:15**. Monistrol-Vila → Montserrat runs at :15 and :55, last **18:15**.
- Service `6350da926176` runs on 22 dates from 7 Nov to 31 Dec: weekends, 7–8 Dec and 28–31 Dec. Last up 18:48, last down 19:15. Monistrol-Vila every 20 min to 19:15.
- 26–30 Oct (weekdays, read for 28 Oct): last up 18:48, last down 19:15. 25 Dec: last up 13:48 (14:15 from Vila). Both match the page.

A weekday visitor in November who trusts the page for the 19:15 train down would be stranded on the mountain.

**Paste-ready replacements** (`MONTSERRAT_COPY` in `src/lib/content/batch02/day-trips.ts`). Clock times stay inside the table, as `batch02.test.ts` requires.

`rackCaption`
- ca: `Cremallera de Montserrat, del 26 d'octubre al 31 de desembre de 2026`
- es: `Cremallera de Montserrat, del 26 de octubre al 31 de diciembre de 2026`
- en: `Montserrat rack railway, 26 October to 31 December 2026`

`rackHeaders`
- ca: `["Trajecte", "Caps de setmana i festius (i fins al 30 d'octubre)", "Feiners del 2 de novembre al 24 de desembre", "Durada"]`
- es: `["Trayecto", "Fines de semana y festivos (y hasta el 30 de octubre)", "Laborables del 2 de noviembre al 24 de diciembre", "Duración"]`
- en: `["Route", "Weekends and holidays (and until 30 October)", "Weekdays, 2 November to 24 December", "Journey"]`

`rackRows`
```ts
// ca
["Monistrol de Montserrat (enllaç R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (fins al 30 d'octubre, algunes hores cada 40 min)", "A :15 i :55, fins a les 18:15", "13 min"],
["25 de desembre", "Última pujada 13:48 (14:15 des de Monistrol-Vila)", "—", "—"],
// es
["Monistrol de Montserrat (enlace R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (hasta el 30 de octubre, algunas horas cada 40 min)", "A :15 y :55, hasta las 18:15", "13 min"],
["25 de diciembre", "Última subida 13:48 (14:15 desde Monistrol-Vila)", "—", "—"],
// en
["Monistrol de Montserrat (R5 connection) → Montserrat", "Hourly at :48, 7:48 to 18:48", "Hourly at :48, 7:48 to 17:48", "20 min"],
["Montserrat → Monistrol de Montserrat", "Hourly at :15, 8:15 to 19:15", "Hourly at :15, 8:15 to 18:15", "20 min"],
["Monistrol-Vila → Montserrat", "Every 20 min, 8:35 to 19:15 (until 30 October, some hours every 40 min)", "At :15 and :55, until 18:15", "13 min"],
["25 December", "Last train up 13:48 (14:15 from Monistrol-Vila)", "—", "—"],
```

`rackNote`
- ca: `Dades obertes d'horaris d'FGC (versió del 25 d'octubre de 2026) per al 28 d'octubre, el 4 i el 7 de novembre i el 10, el 25 i el 28 de desembre. El 7 i el 8 de desembre i del 28 al 31 de desembre s'aplica l'horari de cap de setmana.`
- es: `Datos abiertos de horarios de FGC (versión del 25 de octubre de 2026) para el 28 de octubre, el 4 y el 7 de noviembre y el 10, el 25 y el 28 de diciembre. El 7 y el 8 de diciembre y del 28 al 31 de diciembre rige el horario de fin de semana.`
- en: `FGC's open timetable data (version of 25 October 2026) for 28 October, 4 and 7 November and 10, 25 and 28 December. On 7 and 8 December and from 28 to 31 December the weekend timetable applies.`

`rack[1]`, second sentence (replaces "In winter the last train down is an hour earlier.")
- ca: `Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana: mira la taula.`
- es: `Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana: mira la tabla.`
- en: `From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends: see the table.`

FAQ 1 answer
- ca: `Surt cada hora de Monistrol de Montserrat, enllaçat amb l'R5. Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana; la taula d'aquesta pàgina té les hores.`
- es: `Sale cada hora de Monistrol de Montserrat, enlazado con la R5. Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana; la tabla de esta página tiene las horas.`
- en: `It leaves every hour from Monistrol de Montserrat, timed to the R5. From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends; the table on this page has the times.`

Also delete the old "December (example: 10 December)" row, which the new weekday column now covers. Set `MONTSERRAT_VERIFIED` to the date the fix ships, and update the code comment to the 25 Oct feed.
Optional fix in the same release: the Aeri calendar shows **1 Nov 9:30–19:00**, while the table's "November and December, weekends and holidays" row says 9:30–18:15. Add `1 November` to the October row, so it reads "October and 1 November, every day".

### P0-2 · Cerdanya: a daily through train is missing, so "four through trains a day" is wrong

**Live claim:** the lead says "**four through trains a day** run from La Garriga to Puigcerdà" (same in ca and es). The FAQ says "Four through trains a day up and five down". `CERDANYA_UP` has four rows.

**Official data:**
- Rodalies sheet "R3-Horaris-tren-fins-La-Tor-de-Querol-a-partir-06.07_V7.pdf" (footer 16/09/2026, Last-Modified 30 Sep 2026), page 2, has an R3 row "18:16 18:20 … 19:40 19:46 19:59 20:09 20:20 20:30 20:38 20:51". That is La Garriga 18:16, Ripoll 19:40, Ribes de Freser 19:59, La Molina 20:30, Puigcerdà 20:51. I checked the PDF's fills: the weekday-only shade (pink, legend "Només circula de dilluns a divendres (feiners)") appears only on early bus rows on pages 1 and 3, not on this row.
- The general line PDF `R3.pdf` (Last-Modified 25 Oct 2026) lists the same 18.16 → 20.51 row.
- The official planner (`/api/timetables`, La Garriga 77102 → Puigcerdà 77309) for Wed 28 Oct and Sat 31 Oct returns 5 trains each day: "06:46>09:21 10:16>12:53 13:16>15:53 16:16>18:53 18:16>20:51". Down, 31 Oct, also 5: 05:53, 07:51, 10:22, 14:21, 17:20. Single fare "REG 9.7" (9,70 €).

**Paste-ready**
- Add to `CERDANYA_UP` (after the 16:16 row): `["18:16", "19:40", "19:59", "20:30", "20:51", "—"],`
- Lead, replace "**quatre trens directes al dia**" / "**cuatro trenes directos al día**" / "**four through trains a day**" with:
  - ca: `**cinc trens directes al dia en cada sentit**`
  - es: `**cinco trenes directos al día en cada sentido**`
  - en: `**five through trains a day each way**`
- FAQ 1 answer:
  - ca: `Cinc trens directes al dia en cada sentit, també els caps de setmana, segons l'horari vigent des del 6 de juliol de 2026. La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser.`
  - es: `Cinco trenes directos al día en cada sentido, también los fines de semana, según el horario vigente desde el 6 de julio de 2026. El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser.`
  - en: `Five through trains a day each way, weekends included, on the timetable in force since 6 July 2026. Other R3 trains terminate at Ripoll or Ribes de Freser.`
- Optional, same release. In the paragraph after the tables, add the fare:
  - ca: `El bitllet senzill de la Garriga a Puigcerdà costa 9,70 €.`
  - es: `El billete sencillo de La Garriga a Puigcerdà cuesta 9,70 €.`
  - en: `A single from La Garriga to Puigcerdà costs €9.70.`
- Set `CERDANYA_VERIFIED` to the ship date, and update the code comment: the old line saying all through rows were listed was not true.

### P0-3 (time-boxed, 27–29 Oct only) · Renfe drivers' strike, Thursday 29 Oct

This affects only the pages whose trains are run by Renfe: Sitges, Tarragona, PortAventura, Girona, Figueres, Cerdanya and Núria. It does not affect Montserrat (FGC) or Andorra (coach). Ship only if a deploy can land before 29 Oct, and remove the notice on 30 Oct. If no deploy is possible, skip it: the pages already say to check Rodalies on the day.
- ca: `Vaga de maquinistes el dijous 29 d'octubre (tot el dia). Rodalies preveu el 66 % del servei en hora punta i el 33 % la resta del dia; els regionals circulen amb els serveis mínims que fixi la Generalitat. Consulta rodalies.gencat.cat abans de sortir.`
- es: `Huelga de maquinistas el jueves 29 de octubre (todo el día). Rodalies prevé el 66 % del servicio en hora punta y el 33 % el resto del día; los regionales circulan con los servicios mínimos que fije la Generalitat. Consulta rodalies.gencat.cat antes de salir.`
- en: `Train drivers' strike on Thursday 29 October (all day). Rodalies expects 66% of normal service at peak times and 33% the rest of the day; regional trains run the minimum services set by the Catalan government. Check rodalies.gencat.cat before you set off.`

Source: https://rodalies.gencat.cat/ca/detalls/article/10_19_Vaga_29, updated 19.10.2026 (quotes in the rail table above).

---

## 1 · Vall de Núria rack railway (`nuria.ts`) — priority 5, edit from 20 Nov

**Demand.**
- es (291 impressions, page position 13.4): `vall de nuria` 13 @ 3.6; `cremallera núria gratis` 5 @ 9.0; `cuanto cuesta el cremallera de nuria` 5 @ 10.4; `precio cremallera vall de núria` 4 @ 11; `cremallera de nuria precios` 2 @ 10; `cremallera vall de nuria` 7 @ 41.6; `cremallera de núria` 5 @ 40.8; `cremallera de nuria horaris` 5 @ 85.
- en (191 impressions, 7.2): `nuria rack railway` 9 @ 24.9; `nuria valley rack railway` 6 @ 27.5; `vall de núria train tickets` 2 @ 8.5. The rest are fragments.
- ca (46, 7.7): `preu cremallera núria` 1 @ 15; `horaris cremallera nuria 2026` 1 @ 35.

**Live page.** The first screen promises what the page covers ("Aquí tens què costa…") but gives no price. The fares table comes after the "El cremallera" section. The page shows "Verificado el 18 oct 2026", while the timetable note says it was read on 23 Oct.

**Competition.** Top results for "cremallera vall de nuria precio horarios":
- escapadaambnens and barcelonaurbana put the 2026 prices and the first and last train in the opening lines. That is an intent match on the first screen.
- civitatis and the official sites win on authority.
- For "nuria rack railway": Wikipedia, turistren and valldenuria.cat also win on authority. On-page, the gap is the **price in the first two sentences** and a **"is it free?" answer**.

**Smallest change.**
1. **Answer-first lead.** It reuses the verified fares already on the page, with no clock times.
   - ca: `A la **Vall de Núria** no hi arriba cap carretera: s'hi puja amb el **cremallera** des de Ribes de Freser (**34 € anada i tornada**) o des de Queralbs (**31 €**), en uns 40 minuts, o a peu. El bitllet inclou el Telefèric Coma del Clot i la basílica, i els menors de 4 anys no paguen. A sota tens els horaris, com s'hi va des de Barcelona amb l'R3 tal com circula ara, què passa al novembre i què hi ha a dalt, amb dades d'FGC.`
   - es: `A la **Vall de Núria** no llega ninguna carretera: se sube en **cremallera** desde Ribes de Freser (**34 € ida y vuelta**) o desde Queralbs (**31 €**), en unos 40 minutos, o a pie. El billete incluye el Telefèric Coma del Clot y la basílica, y los menores de 4 años no pagan. Debajo tienes los horarios, cómo se va desde Barcelona con la R3 tal como circula ahora, qué pasa en noviembre y qué hay arriba, con datos de FGC.`
   - en: `No road reaches **Vall de Núria**: you go up by **rack railway** from Ribes de Freser (**€34 return**) or Queralbs (**€31**), in about 40 minutes, or on foot. The ticket includes the Coma del Clot cable car and the basilica, and under-4s travel free. Below are the times, how to get there from Barcelona on the R3 as it runs now, what happens in November and what is up there, from FGC's figures.`
2. **FAQ "Is it free?"** This targets `cremallera núria gratis` at position 9. I found no official free offer, including none for people named Núria (searched today). Answer only with verified facts:
   - ca: Q `El cremallera de Núria és gratis?` A `No. Només hi viatgen gratis els infants de 0 a 3 anys, i els gossos, lligats i amb morrió. El bitllet inclou el Telefèric Coma del Clot, l'entrada a la basílica, les exposicions i una audioguia.`
   - es: Q `¿Es gratis el cremallera de Núria?` A `No. Solo viajan gratis los niños de 0 a 3 años, y los perros, atados y con bozal. El billete incluye el Telefèric Coma del Clot, la entrada a la basílica, las exposiciones y una audioguía.`
   - en: Q `Is the Núria rack railway free?` A `No. Only children aged 0 to 3 travel free, and dogs on a lead and muzzled. The ticket includes the Coma del Clot cable car, entry to the basilica, the exhibitions and an audio guide.`
3. **New table under "Getting there": R3 trains between La Garriga and Ribes de Freser.** Today the page has no train times at all, and the low-season last train down needs a connection. Source: the official planner for 28 Oct and 1 Nov 2026, the same both days. Fare: "REG 7.45".
   - Caption ca/es/en: `R3 entre la Garriga i Ribes de Freser (cada dia)` / `R3 entre La Garriga y Ribes de Freser (todos los días)` / `R3 between La Garriga and Ribes de Freser (daily)`
   - Headers: `["La Garriga → Ribes de Freser", "Ribes de Freser → La Garriga"]` (same in all three)
   - Rows: `["6:46 → 8:28", "6:51 → 8:36"], ["7:46 → 9:30", "8:49 → 10:36"], ["10:16 → 12:00", "9:48 → 11:34"], ["13:16 → 14:58", "11:20 → 13:06"], ["14:16 → 16:00", "15:19 → 17:06"], ["16:16 → 17:58", "17:18 → 19:06"], ["18:16 → 19:58", "18:19 → 20:06"]`
   - Note:
     - ca: `Cercador oficial de Rodalies per al 28 d'octubre i l'1 de novembre de 2026; senzill 7,45 €. L'últim cremallera de baixada de temporada baixa (17.10, a Ribes-Enllaç a les 17.50) enllaça amb l'R3 de les 18:19. De Barcelona a la Garriga, autobusos de Rodalies.`
     - es: `Planificador oficial de Rodalies para el 28 de octubre y el 1 de noviembre de 2026; sencillo 7,45 €. El último cremallera de bajada de temporada baja (17.10, en Ribes-Enllaç a las 17.50) enlaza con la R3 de las 18:19. De Barcelona a La Garriga, autobuses de Rodalies.`
     - en: `Official Rodalies planner for 28 October and 1 November 2026; single €7.45. The last low-season train down (17.10, at Ribes-Enllaç 17.50) connects with the 18:19 R3. Barcelona to La Garriga is by Rodalies bus.`
4. **R3 callout freshness.** Replace "the notice was still in force on 18 October" with the check date when shipping. Set `VERIFIED` to that date, which fixes the 18 Oct vs 23 Oct mismatch.
5. **Internal links in.**
   - Cerdanya already links to Núria.
   - Add one from Núria to Cerdanya's through-train table. In `get[0]`, after the TreNatura sentence, add:
     - ca: `Els trens directes fins a Puigcerdà són a ${b2link("cerdanya","ca","la guia de la Cerdanya sense cotxe")}.`
     - es and en: equivalent.
   - The ski page (`ski.ts`) and the Pyrenees pages already link to Núria. No more sources are editorially right.

**Verified, no change needed:**
- Fares, "Preus vàlids per a la temporada 2026": turistren.cat, read 26 Oct.
- Winter season ticket 62,50 € / 39,50 €, "Vàlida de l'1 de desembre de 2026 al 30 d'abril de 2027". pirineu365.cat now adds: "Aquesta temporada d'hivern 2026-2027, el bitllet del Cremallera inclou també el bitllet del Telefèric Coma del Clot". Winter single fares are still unpublished.
- TreNatura 40,20 € / 30,70 €, "Todo el año, excepto días laborables del mes de noviembre": renfe.com, read 26 Oct.

The November weekday closure could not be re-read in text: the calendar on pirineu365 shows it by colour only. FGC GTFS has the route `L1 Cremallera de Nuria` but no trips. Leave the copy as it is.

## 2 · PortAventura from Barcelona (`portaventura.ts`) — priority 4, edit from 21 Nov

**Demand.**
- en (360 impressions, 7.1): `ouverture portaventura 2027` 4 @ 1.0; `when is portaventura open` 2 @ 1; `horario portaventura octubre 2026` 2 @ 1; `how to get to portaventura from barcelona` 3 @ 7.7; `how far is portaventura from barcelona` 2 @ 20.5; `portaventura barcelona` 4 @ 60.
- es (118, 16.2): `apertura portaventura` 2 @ 48.5; `horarios tren port aventura` 2 @ 47.5; `como ir a port aventura desde barcelona` 1 @ 25.
- ca (69, 13.2): `portaventura horaris` 2 @ 41; `horari port aventura` 2 @ 58.5; French "horaires" variants at 44–63.
- Dated fragments ("10.01.27", "19 de março de 2027") point to AI fan-out queries. Ignore them.

**Live page.** The lead answers the opening dates. The calendar table sits directly under the lead with **no heading**: the first H2 is "Tickets and prices". So a page ranking for "horaris/horarios/opening times" has no "opening times" heading.

**Competition.**
- For "how to get to portaventura from barcelona", attractiontickets.com dominates. It answers train, bus and taxi in steps; its train facts are wrong (it says "R-16"). We are more accurate; it wins on links.
- For "horaris portaventura novembre 2026", pa-community.com and parcs-france.com win on format: a month-by-month calendar with dated headings. Their November dates contradict each other, and the official feed confirms ours.
- "portaventura barcelona" is navigational: the official site wins. Not winnable.

**Smallest change.**
1. **Add an H2 above the calendar table** (body only; the title is untouched).
   - ca: `Horaris de PortAventura Park: calendari d'obertura 2026-2027`
   - es: `Horarios de PortAventura Park: calendario de apertura 2026-2027`
   - en: `PortAventura Park opening times: 2026-27 calendar`

   In `body()`: `...h2(t.calTitle), table(t.calCaption, …)`.
2. **Answer "how far" in the train section**, using the verified journey time only (no km figure: no official distance read).
   - en FAQ add: Q `How far is PortAventura from Barcelona?` A `By train, 1 h 24 on the direct R17 from Barcelona-Sants, or 69 minutes to Tarragona plus 13 on the RT2 shuttle.`
   - es: Q `¿A cuánto está PortAventura de Barcelona?` A `En tren, a 1 h 24 en el R17 directo desde Barcelona-Sants, o a 69 minutos hasta Tarragona más 13 en la lanzadera RT2.`
   - ca: Q `A quina distància és PortAventura de Barcelona?` A `En tren, a 1 h 24 amb l'R17 directe des de Barcelona-Sants, o a 69 minuts fins a Tarragona més 13 amb la llançadora RT2.`
3. **Internal links in** (after each source page's own window):
   - Tibidabo amusement park (`hills.ts:194`, 283 impressions, en): add `"portaventura"` to `b2Related(["tibidabo", …])`.
   - Zoo & Aquarium (`family-markets.ts:263`, 409 impressions, en, pos 8.9): add `"portaventura"` to `b2Related(["museums","tibidabo","montjuic"])`.

   Both are family days out, so the link is editorially right.

**Verified today:**
- PortAventura feed `/api/club/calendar/influx/portaventura/{MM}/{YYYY}`. Nov 2026: 10:30 opening; weekdays to 18:00; Saturdays 7 and 14 Nov to 23:00; Sundays 1 and 8 Nov to 20:00, 15 Nov to 19:00. Feb 2027: open only on 20–21 and 27–28. March 2027: weekends, then daily from 18 Mar.
- Rodalies combined ticket: "General (adults 11–59): 41,95 euros; Reduced: 37,95 euros", valid "from 28/2/2026 to 6/1/2027".
- R17 times: planner, 28 Oct.

## 3 · Sitges by train (`coast-trips.ts`) — priority 4, edit from 21 Nov

**Demand.**
- es (222 impressions, 13.0): `tren sitges` 23 @ 26.3; `barcelona sitges tren` 22 @ 18.6; `tren barcelona sitges` 18 @ 16.4; `sitges barcelona tren` 17 @ 15.9; `trenes a sitges` 14 @ 14.0; `como llegar a sitges en tren` 3 @ 14; `horarios trenes barcelona sants a sitges` 1 @ 11.
- en (173, 13.2): `barcelona to sitges train` 34 @ 23.8; `barcelona sitges trein` 6 @ 10.5; `last train from barcelona to sitges` 3 @ 9.7; `sitges train station` 2 @ 48.5.

**Live page.** The answer is on the first screen: line, frequency, 31–37 min, 5,50 €, last train back at 22:22. The table and FAQ render. Nothing stale: every train figure was re-confirmed today (rail table above).

**Competition.** For both "barcelona to sitges train" and "tren barcelona sitges horarios", the results are aggregators: rome2rio, rail.cc, Rail Europe, omio, movelia. They win on **links and authority**, not content: their facts are vaguer or wrong (Rail Europe's "12hr 22m"). Our on-page answer is already better. The lever is **internal links** plus one unique fact they lack: the cheapest ticket.

**Smallest change.**
1. **Cheapest-ticket fact** (new, verified). The official planner prices Sants → Sitges under two fare systems:
   - Rodalies own: "ROD zones 4": single 5,50 €, Bonotren 35,80 €, monthly 20 €.
   - ATM integrated: **"ATM zones 3": T-casual 34,70 €** (10 journeys).

   Add to `fare[1]`, as the first sentence:
   - ca: `Si viatges amb targeta integrada, el cercador de Rodalies compta Barcelona–Sitges com a **3 zones** de l'ATM: una T-casual de 3 zones (10 viatges) costa 34,70 €, és a dir, 3,47 € el viatge, davant dels 5,50 € del senzill.`
   - es: `Si viajas con tarjeta integrada, el planificador de Rodalies cuenta Barcelona–Sitges como **3 zonas** de la ATM: una T-casual de 3 zonas (10 viajes) cuesta 34,70 €, es decir, 3,47 € el viaje, frente a los 5,50 € del sencillo.`
   - en: `On an integrated ATM card, the Rodalies planner counts Barcelona–Sitges as **3 zones**: a 3-zone T-casual (10 journeys) costs €34.70, or €3.47 a trip against €5.50 for a single.`

   Add an FAQ, all three languages: "Can I use the T-casual to Sitges? Yes, as a 3-zone trip, €34.70 for 10 journeys."
2. **Internal links in.**
   - **Sitges Film Festival guide** (`src/lib/content/features/sitges.ts`). Impressions: en 378 @ 8.4, es 248 @ 8.9, ca 109 @ 6.8. Last commit **18 Sep**, so it is **eligible now**. It talks about the last train back but links to the generic trains list. After lines 105 / 184 / 257 add:
     - ca: `Horaris, preu i últim tren de tornada, a ${b2link("sitges", "ca", "la guia del tren de Barcelona a Sitges")}.`
     - es: `Horarios, precio y último tren de vuelta, en ${b2link("sitges", "es", "la guía del tren de Barcelona a Sitges")}.`
     - en: `Times, fares and the last train back are in ${b2link("sitges", "en", "our Barcelona to Sitges train guide")}.`

     This is the single strongest editorially-right link this cluster can get. It belongs to cluster 7 (features): coordinate so only one agent edits that file.
   - **Transport passes** (`barcelona-practical.ts`, the "Quantes zones necessites?" paragraph near line 172; en 1,995 impressions @ 7.7). Eligible 21 Nov. Cluster 3. Append:
     - ca: `Per a Sitges, per exemple, el cercador de Rodalies compta 3 zones: ho tens a ${b2link("sitges","ca","el tren de Barcelona a Sitges")}.`
     - es and en: equivalent.

## 4 · Montserrat without a tour (`day-trips.ts`) — priority 3, P0 now (above), rest from 21 Nov

**Demand.**
- es (99 impressions, 35.5): `cremallera de montserrat horarios` 4 @ 15; `horario cremallera de montserrat` 4 @ 35; `montserrat fgc` 4 @ 35; `trans montserrat` 4 @ 38.5; `teleferico montserrat` 4 @ 58.5; `cremallera montserrat gratis` 3 @ 27.
- en (92, 29.2): `montserrat cable car or rack train` 3 @ 15.3; `montserrat rack railway` 4 @ 32.5; `montserrat cable car` 3 @ 30; `montserrat funicular schedule` 2 @ 58.5.
- ca (15, 13.5): `horaris cremallera montserrat 2026` 2 @ 19.5; `aeri montserrat horaris` 2 @ 31.5.

**Live page.** Very complete: timetables for the rack railway, the Aeri and the R5, fares, combos, FAQ. Its weak point is the P0: the rack-railway table had no weekday/weekend split.

**Competition.**
- For "cremallera de montserrat horarios": turistren.cat (official) wins on authority. barcelona-tourist-guide.com wins on **format**: a month-by-month, weekday vs weekend table of closing times, exactly the split our page lacked.
- For "montserrat cable car or rack railway": Wikipedia (two articles), turistren and barcelonahacks win on authority and links.

**Smallest change.**
1. The P0 table split already closes the format gap.
2. **"Gratis".** Turistren lists child fares for ages 4–13, which implies under-4s travel free, but I found no verbatim official line today. **UNVERIFIED**: do not add an FAQ until the turistren fare table's under-4 line is quoted.
3. **Sant Joan funicular timetable** (`montserrat funicular schedule`). No official timetable is published as text: the turistren funicular page has only technical data, and the FGC GTFS has no funicular route. **UNVERIFIED**: leave it out.
4. **Links.** `features/montserrat.ts` (beyond Montserrat) and the trains feature already link. The transport passes page has `montserratFree` in its related cards. No stronger editorially-right source exists. At positions 29–35 the limit is authority: apply the "two rounds then stop" rule.

**Verified today:**
- Santa Cova funicular: "romandrà fora de servei per tasques de manteniment fins a nou avís". Sant Joan: "operatiu i en ple funcionament". Rack railway fares valid to 31 Dec 2026 (turistren.cat).
- Aeri November calendar: weekdays 9:30–17:15, weekends 9:30–18:15, 1 Nov 9:30–19:00, no closures. Aeri 2026 fares 10 / 15 €.
- R5 from GTFS: 28 Oct, 27 trains up, 5:16 to 22:30; 31 Oct, hourly at :36, last 22:30.

## 5 · Figueres and the Dalí Museum (`figueres.ts`) — priority 2, edit from 21 Nov

**Demand.**
- es (71 impressions, 47.6): `como ir al museo dali desde barcelona` 11 @ 46; `barcelona dali museos` 12 @ 66; `museo de dali barcelona` 11 @ 69.5; `museo dali barcelona` 10 @ 55; price queries at 64–85.
- en (54, 21.2): `figueres museum tickets` 7 @ 42.7; `barcelona to salvador dali museum` 6 @ 43.8; `barcelona to dali museum train` 3 @ 27.7; `figueres vilafant to dali museum` 3 @ 19.3.

**Live page.** The answer-first lead works ("not in Barcelona but in Figueres"). It has train and opening-hours tables and an FAQ.

**Competition.**
- For "como ir al museo dali desde barcelona": barcelona-tourist-guide.com and spanish-fiestas.com win with a **missing section**: they cover bus, car and taxi as well as train, plus a walking time from the station.
- For "figueres museum tickets": resellers (hellotickets, Expedia) win on intent (transactional).

**Smallest change.**
1. **Fix the incomplete hours table (P1).** The official page lists six periods; we print four. Add:
   - en: `["1 June – 30 June", "Tuesday to Sunday", "10:30–18:00"]`, `["1 September – 30 September", "Tuesday to Sunday", "9:30–18:00"]`
   - es: `["1 de junio – 30 de junio", "Martes a domingo", "10:30–18:00"]`, `["1 de septiembre – 30 de septiembre", "Martes a domingo", "9:30–18:00"]`
   - ca: `["1 de juny – 30 de juny", "Dimarts a diumenge", "10:30–18:00"]`, `["1 de setembre – 30 de setembre", "Dimarts a diumenge", "9:30–18:00"]`

   Source: salvador-dali.org/en/visit/dali-theatre-museum/, read 26 Oct: "1 June – 30 June: open from Tuesday to Sunday, from 10:30 am to 6:00 pm" and "1 September – 30 September: open from Tuesday to Sunday, from 9:30 am to 6:00 pm".
2. **Lead precision (P1).** "from November to March the museum opens…" should read "from October to 22 March". The official periods are "1 October – 31 December" and "1 January – 22 March"; from 23 March it opens at 9:30.
   - ca: `d'octubre al 22 de març`
   - es: `de octubre al 22 de marzo`
   - en: `from October to 22 March`
3. **Bus section.** **UNVERIFIED**: Sagalés' Barcelona Nord ↔ Figueres service appears only on aggregators. Read sagales.com before adding anything.
4. **Intent mismatch, es.** "museo dali barcelona" wants a museum *in* Barcelona. The lead already corrects it. Do not chase it further.

## 6 · Cerdanya without a car (`day-trips.ts`) — priority 2, P0 now (above), rest from 21 Nov

**Demand.**
- en (25 impressions, 8.4): `r3 train` 2 @ 10.
- es (13, 8.5) and ca (6, 3.5): no named queries.

**Live page.** Answer-first. The R3 callout and timetable render, but with the P0 above: a through train is missing.

**Competition.** For "cerdanya sin coche tren R3 Puigcerdà", the results are bibgirona.cat press PDFs from 2021–24. Nobody has current through-train tables. We already lead on content; demand is tiny.

**Smallest change.** The P0 only, plus the 9,70 € fare. **Verified:** Bus Blanc 2026-27 is still unpublished (cerdanya.org search today), so the existing caveat stands.

## 7 · Girona by train (`day-trips.ts`) — priority 2, edit from 21 Nov

**Demand.**
- es (25 impressions, 34.2): `tren barcelona girona` 11 @ 41; `trenes barcelona girona` 5 @ 40.8.
- en (10, 15): `girona from barcelona by train` 1 @ 44.
- ca (7, 5.9).

**Live page.** Answer-first lead, comparison table, sights table.

**Competition.** For "tren barcelona girona": omio, barcelona-tourist-guide, a felicesvacaciones blog, sncf-connect. They win on authority. Their facts disagree with each other, and ours come from the official planner. No content gap.

**Smallest change.**
1. **Journey range (P1).** The official planner for 28 Oct shows Sants → Girona durations of "01:19, 01:25, 01:31, 01:41": the 7:16 takes 1 h 41; the 20:46 and 21:46 take 1 h 25.
   - Lead and table cell, replace "1 h 19 – 1 h 31" / "d'1 h 19 a 1 h 31" / "de 1 h 19 a 1 h 31":
     - ca: `d'1 h 19 a 1 h 41 (la majoria, 1 h 19 o 1 h 31)`
     - es: `de 1 h 19 a 1 h 41 (la mayoría, 1 h 19 o 1 h 31)`
     - en: `1 h 19 to 1 h 41 (most take 1 h 19 or 1 h 31)`
   - The same figure is in `features/trains.ts` lines 68 and 186 (cluster 7). Flag it there.
2. **Links in.** Christmas markets and Christmas in Barcelona already link here. The transport passes related cards include `girona`. Nothing stronger exists. The limit is authority.

## 8 · Andorra by bus (`andorra.ts`) — priority 1, edit from 21 Nov

**Demand.**
- en (19 impressions, 9.2): `barcelona to andorra bus` 2 @ 24.
- es (9, 6.7) and ca (4, 5.2).

**Live page.** Bus table first, then documents, customs and an FAQ.

**Competition.** For "barcelona to andorra bus": rome2rio, flixbus.co.uk, ordinoarcalis.com, tiqets. They win on links. FlixBus and ALSA also appear as operators, and we do not list them.

**Smallest change.** **UNVERIFIED** gap: ALSA and FlixBus timetables (the ALSA site could not be read on 24 Oct). Add them only from the operators' own pages. Low priority.

**Verified today, matches the page:**
- Andbus: "One way: €33 … Return: €56"; T1 00:45 → Andorra 04:00; Diagonal 01:15.
- Direct Bus: Sants 06:15 … 23:45; back 06:15 … 22:15. New line: "los días 24, 25 y 31 de diciembre como el 1 de enero los horarios pueden estar sujetos a modificaciones". Optional: add it to `busNote` in December.

## 9 · Tarragona by train (`coast-trips.ts`) — priority 1, edit from 21 Nov

**Demand.**
- en (16 impressions, 15.4): `barcelona to tarragona train` 2 @ 47.5; `tarragona combined ticket` 2 @ 30.5.
- es and ca: 1 impression each.

**Live page.** Train table first, then sites and the hours table "from 27 October to 31 March".

**Competition.** For "barcelona to tarragona train": rome2rio, edreams, Rail Europe. They win on links. Some push high-speed trains to Camp de Tarragona; we already explain the difference.

**Smallest change.** None needed.

**Verified today:**
- tarragona.cat hours, 27 Oct–31 Mar, match the table. Closed "29 November (general elections)". Open days on 14, 15 and 28 Nov, plus 24 Nov, the last Tuesday.
- mnat.cat: "La seva reobertura està prevista durant el darrer trimestre del 2026". Still closed, so our copy holds.
- Ignore the Fòrum's one-off 27 Oct closure (9–17 h).

---

## Do not print (checked, not verifiable today)

- Sant Joan funicular timetable: no official text page; not in the FGC GTFS.
- Montserrat rack railway free under-4s: no verbatim quote yet.
- A free Núria rack railway for people named Núria: no official source.
- Sagalés bus Barcelona–Figueres: aggregators only.
- ALSA or FlixBus to Andorra.
- Minimum-service percentages for regional trains and AVE on 29 Oct: Rodalies defers to the Generalitat and the per-line PDFs; the press says they were not yet set.
- The planner gives Puigcerdà arrivals as 12:53 / 15:53 / 18:53, one minute off the PDF's 12:54 / 15:54 / 18:54. Keep the PDF figures, which the page cites.
