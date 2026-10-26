# Review — cluster 6: nature & season (26 Oct 2026)

Reviewer: cluster agent 6, read-only. Method: `.claude/skills/seo-audit/references/rankings-push.md`; rules from `AGENT_BRIEF.md`, `content-intelligence-editor.md`, `SEO_EXPERIMENTS.md` (26 Oct: titles don't move CTR at 7–10, position does) and the cannibalisation rules in `docs/EDITORIAL_ROADMAP.md`.

Data: GSC 27 Sep–24 Oct (`scripts/gsc-page.py`, plus a query×page pull); live HTML fetched 26 Oct ~16:40; URL Inspection API for the low-impression URLs (all "Submitted and indexed"). Competitor checks used WebSearch, which is US-located and weak for Catalan and Spanish queries, so treat them as indicative.

**No title or meta changes are proposed anywhere in this cluster.** Every title already contains its main query, and none is factually wrong.

## Summary

| Article | Impr. 28d (ca/es/en) | Best position on a named query | Priority | Earliest edit | P0 |
| --- | --- | --- | --- | --- | --- |
| Mushroom report | 855 / 2,303 / 62 | `donde hay setas ahora en cataluña 2026` 1.4 | **5** | P0 now · rest 17 Nov | **yes** |
| Autumn colours | 498 / 472 / 370 | `colors tardor 2026` 1.0; `colors de tardor a catalunya` 5.4–6.2 | **4** | P0 now · rest 17 Nov | **yes** |
| Snow depth today | 0 / 0 / 0 (new 25 Oct) | — | 3 | P0 now (code) · rest 22 Nov | **yes** |
| Christmas markets | 156 / 3 / 8 | `fires nadal catalunya 2026` 3.4 | 4 | add dates as published · rest 22 Nov | no (watch) |
| Living nativity scenes | 0 / 0 / 0 (new 25 Oct) | — | 3 | 22 Nov | no |
| Reservoirs | 142 / 195 / 0 | `embalses catalunya hoy` 8.0; `nivell embassaments catalunya` 7 | 3 | 21 Nov | no |
| Ski resorts | 45 / 138 / 0 | ca 6.4 (page); es `estaciones de esquí de cataluña` 57.8 | 3 | dated fixes 2 Nov · rest 22 Nov | dated |
| Snow without skiing | 77 / 16 / 22 | en `does it snow in catalonia` 7.4 | 2 | P0 now · rest 22 Nov | **yes** |
| Setcases | 2 / 68 / 20 | es `que ver en setcases` 9.9; en `setcases` 10.2 | 2 | 22 Nov | no |
| Ripollès hub | 29 / 43 / 18 | 26–50 | 2 | 22 Nov | no |

Earliest-edit rule: date of last commit + 28 days. Ripollès, Setcases, snow without skiing and the ski guide are also inside the round-2 window (measured 21 Nov). P0 factual fixes may go in now.

### P0 list (apply now)

1. **Mushroom report, all three languages.** The "season so far" prose contradicts the live table directly beneath it. It says Ponent has "no basis… to consider this week" while the table rates Ponent *Favourable*. It also says Montseny "ranks second" and Ripollès "drops from first place"; the live ranking has Montseny 8th and Ripollès 1st. And the Pyrenees section says first frosts "usually arrive late Oct–early Nov" when Meteocat measured them on 8–9 Oct. → §1
2. **Autumn colours, all three languages.** The "Com està la tardor ara?" block is stamped 14 Oct and still sends readers to a 17 Oct event "this weekend"; "the second half of October is starting" is now false. → §2
3. **Snow depth today, ca and es.** The live page reads "no hem pogut llegir les dades del Meteocat" / "no pudimos leer los datos" in place of the answer, and Google crawled it like that on 25–26 Oct. On en, every Pyrenean station lacks a validated reading, so the headline "no snow at any of the 3 stations" refers only to three stations *outside* the Pyrenees. → §3
4. **Snow without skiing FAQ, all three languages.** "As of 24 October none had announced its 2026-27 date" contradicts the ski guide and Baqueira's own announcement (opening 28 Nov 2026). → §8
5. **Ski guide, dated (2 Nov, 17 Nov, 22 Nov, 8 Dec).** Several prices expire on those dates. → §7

### Cannibalisation check (roadmap: mushroom report vs Ripollès/Setcases)

The 28-day check the roadmap asked for after Setcases went live (29 Sep) is due now. The query×page pull for 27 Sep–24 Oct shows **no** `setcases`, `set cases`, `ripoll*` or `molló` impressions on the mushroom URLs. In the previous period (30 Aug–26 Sep), the mushroom pages had a single impression each for `setcases`, `set cases`, `ripolles` and `ripollès`. Those queries now land on the destination pages: `setcases` 14 impressions @ 10.2 (en) and 8 @ 28.2 (es); `que ver en setcases` 9 @ 9.9; `ripoll*` 40+ impressions @ 29–87.

The hand-off worked and the intents are disjoint. Keep them that way: nothing in this review adds a destination section to the mushroom report or a conditions table to Ripollès or Setcases. The only cross-link proposed is the hub link the roadmap asked for (§1, item C).

---

## 1. Mushroom report — `/ca/natura/bolets-catalunya-condicions/` · `/es/naturaleza/setas-cataluna-condiciones/` · `/en/nature/mushroom-season-catalonia/`

**Demand.**
- es: `donde hay setas ahora en cataluña 2026` 565 impressions @ 1.4, 22% CTR (the site's best query). Also `mapa bolets catalunya 2026` 174 @ 7.7, `temporada de setas 2026` 22 @ 5.9, `donde hay setas ahora en cataluña` (no year) 15 @ 10.1.
- ca: `on trobar bolets aquesta setmana 2026` 118 @ 8.3, `mapa bolets catalunya 2026` 91 @ 8.7, `bolets catalunya 2026` 32 @ 10.8.
- ca, question-shaped and losing: `on hi ha bolets avui` 14 @ 28, `predicció bolets catalunya` 14 @ 24.2, `mapa predicció bolets catalunya` 8 @ 17.5, `quants dies després de ploure surten els bolets` 14 @ 22.6, `mapa bolets avui` 12 @ 29.
- en: conversational fragments only; ignore them.

**Live page.** The first screen is correct and fresh: Meteocat reading of 25 Oct, top three Ripollès / northern Berguedà / Garrotxa, "Bones condicions no garanteixen que hi hagi bolets". It never claims mushrooms are present. Below the table, the zone prose ("Com ha anat la temporada fins a principis d'octubre") still talks in the present about the 7 Oct ranking (see P0 above).

**Competition** (Catalan, extended search):
- vadebolets.cat "mapa boletaire setmanal" (weekly, dated 22 Oct, traffic-light by area)
- boletradar.cat (a daily map index at 100 m)
- ifongapp.com (daily probability maps per species)
- TV3 *Caçadors de bolets* weekly forecast

They win `mapa…` and `predicció…` on **format**: an actual map, refreshed daily. Two of them also publish species-level and field observations, which this site rightly refuses to do. We cannot match the observations. We can match the map at comarca level, and we can answer the question queries.

**Changes.**

**A. P0 — make the dated prose dated (now).** These are edits to `ZONES[].heading/body` in `src/lib/content/mushrooms/payload.ts`. No new facts except the frost readings, which are sourced below.

Find → replace in every language:
- ca "de l'última setmana" / "l'última setmana" → "de la setmana fins al 6 d'octubre"
- es "de la última semana" / "la última semana" → "de la semana hasta el 6 de octubre"
- en "over the past week" → "in the week to 6 October"

Sentence replacements:

| Zone | ca | es | en |
| --- | --- | --- | --- |
| Montseny, heading | Montseny: la zona més regada a principis d'octubre | Montseny: la zona más regada a principios de octubre | Montseny: the wettest massif in early October |
| Montseny, 1st sentence | A l'informe del 7 d'octubre, el Montseny va ser el canvi més gran respecte del setembre. | En el informe del 7 de octubre, el Montseny fue el cambio más grande respecto a septiembre. | In the 7 October report, Montseny was the biggest change since September. |
| Montseny, "Per això el situem segon…" | Per això, el 7 d'octubre el vam situar segon i no primer. | Por eso, el 7 de octubre lo situamos segundo y no primero. | That is why, on 7 October, it ranked second, not first. |
| Ripollès, "Per això baixa del primer lloc…" | Per això, el 7 d'octubre va baixar del primer lloc, no perquè les condicions hi haguessin empitjorat. | Por eso, el 7 de octubre bajó del primer puesto, no porque las condiciones hubieran empeorado. | That is why, on 7 October, it dropped from first place, not because conditions had got worse. |
| Pirineu, heading | Pirineu central i occidental: sec fins a principis d'octubre | Pirineo central y occidental: seco hasta principios de octubre | Central and western Pyrenees: dry until early October |
| Pirineu, replace "A més, aquí la temporada és curta: les primeres glaçades acostumen a arribar…" | A més, a cota alta ja glaça: el Meteocat va registrar mínimes sota zero a la Bonaigua (2.262 m) el 8 i el 9 d'octubre i del 20 al 23 d'octubre. | Además, en cota alta ya hiela: Meteocat registró mínimas bajo cero en la Bonaigua (2.262 m) el 8 y el 9 de octubre y del 20 al 23 de octubre. | And at altitude it is already freezing: Meteocat recorded sub-zero minimums at Bonaigua (2,262 m) on 8 and 9 October and from 20 to 23 October. |
| Ports, last clause | …de manera que, a 7 d'octubre, tenia més sentit seguir-ne l'evolució que no pas anar-hi. | …así que, a 7 de octubre, tenía más sentido seguir su evolución que ir. | …so, as of 7 October, it was an area to follow rather than one to head for. |
| Ponent, heading | Ponent: la pluja no havia arribat a principis d'octubre | Poniente: la lluvia no había llegado a principios de octubre | Western Catalonia: no rain until early October |
| Ponent, last sentence | Amb aquelles xifres, a 7 d'octubre no hi havia base per situar-lo entre les zones a considerar. La pluja de mitjan octubre sí que hi ha arribat: mira la taula de dalt. | Con aquellas cifras, a 7 de octubre no había base para situarlo entre las zonas a considerar. La lluvia de mediados de octubre sí ha llegado: mira la tabla de arriba. | On those figures, as of 7 October there was no basis for including it. The mid-October rain has reached it since: see the table above. |

Sources:
- Bonaigua frosts: Meteocat XEMA daily data, dataset 7bvh-jvq2 (https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json), station Z1 "Bonaigua (2.262 m)", variable 1002 (daily minimum), read 26 Oct 2026. Values: 08-10 −4.3, 09-10 −5.9, 18-10 −1.0, 20-10 −2.6, 21-10 −2.7, 22-10 −2.8, 23-10 −2.2 °C.
- Ponent: `conditions.ts` (XEMA, read 25 Oct) gives 53.8 mm mean over 31 stations in 15 days.

**B. FAQ for the question queries (17 Nov, or bundle with A if the owner accepts one combined change set while the season is still running).** All answers below are sourced and none says mushrooms are present.

- **ca Q:** Quants dies després de ploure surten els bolets?
  **A:** No hi ha un nombre fix. Com a norma general, el manual de gestió micològica del CTFC indica que els bolets micorrízics fructifiquen 21 dies després de les primeres pluges de finals de l'estiu, sempre que continuï plovent de tant en tant, la temperatura no sigui gaire alta i hi hagi humitat a l'ambient, sense vent. Per això aquest informe mira la pluja acumulada i els dies des de l'última pluja, i no un sol xàfec. Bones condicions no garanteixen que hi hagi bolets.
- **es Q:** ¿Cuántos días después de llover salen las setas?
  **A:** No hay un número fijo. Como norma general, el manual de gestión micológica del CTFC indica que las setas micorrícicas fructifican 21 días después de las primeras lluvias de finales del verano, siempre que siga lloviendo de vez en cuando, la temperatura no sea muy alta y haya humedad ambiental, sin viento. Por eso este informe mira la lluvia acumulada y los días desde la última lluvia, y no un solo chaparrón. Buenas condiciones no garantizan que haya setas.
- **en Q:** How many days after rain do mushrooms appear?
  **A:** There is no fixed number. As a general rule, the CTFC's mushroom-management handbook says mycorrhizal mushrooms fruit 21 days after the first late-summer rains, provided some rain keeps falling, temperatures are not too high and the air stays humid, without wind. That is why this report looks at accumulated rain and days since the last rain, not a single downpour. Good conditions do not guarantee mushrooms.
- **ca Q:** De quins mesos depèn la temporada a cada zona?
  **A:** Segons el CTFC, al Pirineu la producció depèn sobretot de la pluja de juliol a octubre; al Prepirineu i la Catalunya Central, de la de setembre a novembre, i a prop de la costa (Serralada Prelitoral), de la d'octubre a desembre.
  - es: Según el CTFC, en el Pirineo la producción depende sobre todo de la lluvia de julio a octubre; en el Prepirineo y la Cataluña central, de la de septiembre a noviembre, y cerca de la costa (Serralada Prelitoral), de la de octubre a diciembre.
  - en: According to the CTFC, in the Pyrenees production depends mostly on rain from July to October; in the pre-Pyrenees and central Catalonia, on September to November; and near the coast (the pre-coastal range), on October to December.
- **ca Q:** Hi ha una predicció de bolets per a aquesta setmana?
  **A:** No en publiquem: ningú no pot saber si en un bosc concret hi ha bolets. Publiquem la pluja que ha mesurat el Meteocat a cada zona i com l'hem classificada; la taula de dalt és la lectura del {READ_AT}.
  - es: No la publicamos: nadie puede saber si en un bosque concreto hay setas. Publicamos la lluvia que ha medido Meteocat en cada zona y cómo la hemos clasificado; la tabla de arriba es la lectura del {READ_AT}.
  - en: We don't publish one: nobody can know whether a particular forest has mushrooms. We publish the rain Meteocat measured in each area and how we rated it; the table above is the reading of {READ_AT}.

Source for the CTFC answers: Martínez de Aragón, J. et al. (2022), *Manual d'itineraris de gestió micològica a Catalunya*, CTFC, 1st edition September 2022, p. 53. URL: https://ctfc.cat/docs/Manual_itineraris_de_gestio_micologica_a_Catalunya.pdf (already in `SOURCES`). Quotes, read 26 Oct 2026:
- «Com a norma general, els bolets micorrízics fructifiquen 21 dies després de les primeres pluges de finals de l'estiu, sempre que, a més, hi hagi episodis puntuals de pluja, la temperatura no sigui gaire elevada i hi hagi humitat a l'ambient (absència de vent).»
- «…com més al nord i més altitud (com en el cas dels Pirineus), que hi hagi més producció de bolets dependrà de la quantitat de pluja registrada durant els mesos de juliol, agost, setembre i octubre. Al Prepinineu i la Catalunya Central… setembre, octubre i novembre, mentre que si ens acostem a la costa (Serralada Prelitoral)… octubre, novembre i desembre…»

**C. Internal link out to the Ripollès hub (17 Nov).** The roadmap asks for the cross-link both ways, and the hub is the right home for the toponym. Append one sentence to the Ripollès zone body. This adds no destination content:
- ca: Si hi vas, la [guia del Ripollès](/ca/destinacions/ripolles/) explica què veure a la comarca i com arribar-hi.
- es: Si vas, la [guía del Ripollès](/es/destinos/ripolles/) explica qué ver en la comarca y cómo llegar.
- en: If you go, our [Ripollès guide](/en/destinations/ripolles/) covers what to see in the county and how to get there.

**D. Format (build, P1).** Add a comarca-level choropleth map of the eight zones, coloured by the existing three bands, above the `conditionsMap` list. That answers `mapa bolets…` (265 impressions at 7.7–8.7) in the format competitors win with. Use comarca outlines only, with no points, pins or coordinates; check it against `mushroom-zones/guard.ts`. Comarca boundaries: ICGC open data (verify the licence before use).

**E. Small bugs (P2).**
- The `conditionsMap` list uses `ZONE_READINGS` order, not `ranked()` order: Montseny (42.4 mm) shows above Ports and Ponent, while the table puts it last.
- Millimetres print with a decimal point in ca/es ("101.8 mm").
- "fa 1 dies" / "hace 1 días" / "1 days ago" need a singular.

**Weekly data refresh:** keep it going (Mondays); it is the product.

Priority **5**. Earliest edit: A now; B–D 17 Nov.

---

## 2. Autumn colours — `/ca/natura/colors-tardor-catalunya/` · `/es/naturaleza/colores-otono-cataluna/` · `/en/nature/fall-colors-catalonia/`

**Demand.**
- ca: `colors de tardor a catalunya` 45 @ 6.2 (19 @ 5.4 in the inventory window), `colors tardor 2026` 6 @ 1.0, `colors de tardor` 6 @ 8.3.
- ca: `bolets de tardor catalunya` 26 @ 34 also lands here. It is the mushroom report's intent; do not chase it.
- es: `cuando empieza el otoño en cataluña` 7 @ 6.6.
- en: fragments only.
- 1,340 impressions in all at positions 4–6. The season runs out mid-November.

**Live page.** The status block reads "**Actualitzat el 14 d'octubre** … Si hi vas aquest cap de setmana: el 17 d'octubre…" and "ara comença la segona quinzena d'octubre". Both are stale (P0). The rest is sound. I re-verified the Alt Pirineu windows: Virós "1ª quincena de octubre para el hayedo y 2ª quinzena para el camino real"; Bonabé "2ª quinzena de octubre a 1ª de noviembre"; Sant Joan "2a quincena de octubre y 1a quincena de noviembre". I also re-verified the descent statement on the park's *boscos singulars* page: «els colors de tardor comencen la segona meitat de setembre a l'estatge subalpí … es traslladen gradualment a cotes més baixes, on acostumen a ser màxims la segona quinzena d'octubre i fins a mitjan novembre».

**Competition.** escapadaambnens.com (a 2026 autumn listicle), femturisme, and Ara's "10 routes". They win on **freshness and breadth** (dated weekly agendas, more places). None publishes an official "now" reading either.

**Changes.**

**A. P0 — replace `status[]` and the "Actualitzat" key fact (now).**

ca:
1. **Actualitzat el 26 d'octubre de 2026.** Cap organisme oficial publica com estan ara mateix els boscos, així que no et direm que el color «ja hi és»: et diem què toca segons el calendari dels parcs i què ha fet el temps.
2. **Pel calendari, som a l'última setmana d'octubre.** És la finestra que Torisme Val d'Aran dona per a la Vall de Salenques (finals d'octubre i principis de novembre), i continuen les del Parc Natural de l'Alt Pirineu per a la Vall de Bonabé i la Vall de Sant Joan, que arriben fins a la primera quinzena de novembre. També és el moment de vigilar la Fageda d'en Jordà i el Montseny. Al Bosc de Virós, la finestra oficial de la fageda (primera quinzena d'octubre) ja ha passat.
3. **Pel temps:** a l'alta muntanya ja glaça. Segons les dades diàries del Meteocat, la Bonaigua (2.262 m) va baixar de zero el 18 d'octubre i cada dia del 20 al 23 (−2,8 °C el 22), i Bonabé (1.691 m) el 21 i el 22 (−0,3 °C). La pluja de mitjan octubre sí que ha arribat al Pirineu: 55,1 mm de mitjana a les 24 estacions del Meteocat de la Cerdanya, l'Alt Urgell, el Pallars i l'Aran en els 15 dies fins al 25 d'octubre.

es:
1. **Actualizado el 26 de octubre de 2026.** Ningún organismo oficial publica cómo están ahora mismo los bosques, así que no te diremos que el color «ya está»: te decimos qué toca según el calendario de los parques y qué ha hecho el tiempo.
2. **Por calendario, estamos en la última semana de octubre.** Es la ventana que Torisme Val d'Aran da para el valle de Salenques (finales de octubre y principios de noviembre), y siguen las del Parc Natural de l'Alt Pirineu para la Vall de Bonabé y la Vall de Sant Joan, que llegan hasta la primera quincena de noviembre. También es el momento de vigilar la Fageda d'en Jordà y el Montseny. En el Bosc de Virós, la ventana oficial del hayedo (primera quincena de octubre) ya ha pasado.
3. **Por el tiempo:** en alta montaña ya hiela. Según los datos diarios de Meteocat, la Bonaigua (2.262 m) bajó de cero el 18 de octubre y cada día del 20 al 23 (−2,8 °C el 22), y Bonabé (1.691 m) el 21 y el 22 (−0,3 °C). La lluvia de mediados de octubre sí ha llegado al Pirineo: 55,1 mm de media en las 24 estaciones de Meteocat de la Cerdanya, el Alt Urgell, el Pallars y el Aran en los 15 días hasta el 25 de octubre.

en:
1. **Updated 26 October 2026.** No official body publishes what the forests look like right now, so we won't tell you the colour is already there: we tell you what the parks' calendar says and what the weather has done.
2. **By the calendar, this is the last week of October.** It is the window the Val d'Aran tourism board gives for the Salenques valley (late October and early November), and the Alt Pirineu Natural Park's windows for the Bonabé and Sant Joan valleys run on into the first half of November. It is also the time to watch La Fageda d'en Jordà and Montseny. At Bosc de Virós, the official beech window (first half of October) has passed.
3. **By the weather:** it is already freezing at altitude. Meteocat's daily data show Bonaigua (2,262 m) below zero on 18 October and every day from 20 to 23 October (−2.8 °C on the 22nd), and Bonabé (1,691 m) on 21 and 22 October (−0.3 °C). Mid-October's rain did reach the Pyrenees: a 55.1 mm average across Meteocat's 24 stations in Cerdanya, Alt Urgell, Pallars and Aran in the 15 days to 25 October.

Drop paragraph 4 (the 17 Oct outing). Only add the Montseny 31 Oct outing ("Tardor, castanyes i castanyers", Viladrau) back if parcs.diba.cat still lists it. I could not re-verify it on 26 Oct, so it is **UNVERIFIED**.

Key fact "Actualitzat / Actualizado / Updated" → 26 d'octubre de 2026 / 26 de octubre de 2026 / 26 October 2026. Set `LAST_VERIFIED` to match.

Sources:
- XEMA daily dataset 7bvh-jvq2: stations Z1 Bonaigua and YT Bonabé, variable 1002, read 26 Oct 2026. Bonabé values: 21-10 −0.1, 22-10 −0.3 °C. Bonaigua as in §1.
- Pyrenees rainfall: `src/lib/content/mushrooms/conditions.ts` (XEMA, read 25 Oct): zone `pirineu`, 55.1 mm, 24 stations.
- Windows: parcsnaturals.gencat.cat Alt Pirineu "Colors de tardor" page (shows "Fecha de actualización: 13.05.2014") and visitvaldaran.com (Salenques), both already cited.

**B. Answer the es question (17 Nov; the demand returns in September).** Add an es FAQ or a sentence in `directAnswer`:
- Q: ¿Cuándo empieza el otoño en Cataluña?
- A: El otoño astronómico de 2026 empezó el 23 de septiembre a las 02:05 (hora oficial peninsular), según el Observatorio Astronómico Nacional, y durará hasta el 21 de diciembre. El color de los bosques va por otro calendario: empieza en la segunda mitad de septiembre en la alta montaña del Pirineo.
- Source: https://astronomia.ign.es/inicio-estaciones/otono, «El otoño de 2026 en el hemisferio norte comenzará el día 23 de septiembre a las 02 horas 05 minutos» and «terminará el 21 de diciembre con el comienzo del invierno», read 26 Oct 2026.
- ca/en equivalents only if wanted; the query is Spanish.

**C. Weekly status refresh until mid-November** (roadmap: "weekly, Oct–Nov"). Treat it like the mushroom data refresh, not as an editorial change.

Priority **4**. Earliest edit: A now; B 17 Nov.

---

## 3. Snow depth today — `/ca/guies/neu-pirineu-avui/` · `/es/guias/nieve-pirineo-hoy/` · `/en/guides/snow-pyrenees-today/`

**Demand.** None yet: published 25 Oct, indexed 25–26 Oct. Demand arrives with the first snowfall (Nov–Dec).

**Live page (P0).**
- **ca and es** show `unreachable`: "Quan s'ha actualitzat aquesta pàgina no hem pogut llegir les dades del Meteocat." Google crawled these versions (ca 26 Oct 04:44, es 25 Oct 17:17).
- **en** shows data, but all 17 Pyrenean stations have "No validated reading in 48 h". The headline "There is no snow on the ground at any of the 3 Meteocat stations with a recent validated reading" therefore rests on Puig Sesolles, Els Ports and Prades. On a page titled "Is there snow in the Pyrenees today?" that is a misleading first-screen answer.

**Competition** (indicative): infonieve.es / skiinfo / the resorts' own snow reports win "nieve pirineo hoy" with live resort data. Our differentiator is measured natural snow, which only works if the number is there.

**Changes (P0, code; now).**
1. `src/lib/content/snow/depth.ts`, `loadSnowReport`: a fetch error must not become a day-long ISR page. Either throw, so Next keeps serving the last good render (a failed regeneration does not replace the cached page), or retry once and only then fall back. Add a test that an `error` report is never what a cached page shows when a previous good one exists.
2. `snowSummary`: when no station in the Pyrenean areas has a current reading, lead with that instead of `none(total)`. Add a key such as `pyreneesNoCurrent`:
   - ca: "Cap de les {n} estacions del Meteocat al Pirineu no té encara una lectura validada de les últimes 48 hores, així que avui no podem dir si hi ha neu a terra al Pirineu."
   - es: "Ninguna de las {n} estaciones de Meteocat en el Pirineo tiene todavía una lectura validada de las últimas 48 horas, así que hoy no podemos decir si hay nieve en el suelo en el Pirineo."
   - en: "None of Meteocat's {n} Pyrenean stations has a validated reading from the last 48 hours yet, so we can't say today whether there is snow on the ground in the Pyrenees."

   Keep the outside-the-Pyrenees line after it.
3. Root cause to check: validated XEMA snow readings lag by more than 48 h for the Pyrenean stations right now. If that is normal, consider a 96 h window (the query already pulls 4 days), stating the age on each row as now.

No body copy changes. Priority **3** (seasonal, and broken on 2 of 3 editions). Earliest edit: code fix now; content 22 Nov.

---

## 4. Christmas markets — `/ca/tradicions/mercats-de-nadal-catalunya/` · `/es/tradiciones/mercados-navidad-cataluna/` · `/en/traditions/christmas-markets-catalonia/`

**Demand.**
- ca: `fires de nadal catalunya 2026` 14 @ 5.7 and `fires nadal catalunya 2026` 9 @ 3.4; `mercats de nadal catalunya` 11 @ 9.5; `mercats de nadal catalunya 2026` 6 @ 5.2; `mercat de nadal catalunya` 4 @ 14.8.
- es: indexed 24 Oct, 3 impressions.
- en: `barcelona christmas market` 2 @ 73.5. That query belongs to Barcelona city guides; don't chase it.
- Demand is rising toward the late-November peak.

**Live page.** Accurate and current as of 24 Oct. On 26 Oct I re-checked firadesantallucia.cat: the calendar page still shows "Calendari – 2025", and the home page still says «Del 28 de novembre al 23 de desembre», with © 2025. So "Pendent" is still right.

**Competition.** escapadaambnens.com ("20 millors fires i mercats de Nadal 2026", one page per fair); radicalstorage and festivalesdeespana print unconfirmed 2026 dates. They win on **breadth** (Reus, Terrassa, Sabadell, Sant Feliu…) and on per-fair pages, at the cost of accuracy. Our edge is the confirmed-date rule. Keep it.

**Changes.**
- **As published (counts as P0 freshness, apply on the day).** Weekly check, Mondays, of: firadesantallucia.cat, barcelona.cat/nadal (the city says it updates "cap al novembre"), the Sagrada Família fair, figueres.cat, paeria.cat, manresa.cat and granollers.cat. Replace "Pendent" with the organiser's dates. Add Reus, Terrassa, Sabadell, Tarragona and Vic only when a council page gives 2026 dates. That is the breadth gap, closed honestly.
- **Lead wording (22 Nov).** The top query uses "fires". Lead, ca: "Les **fires i mercats de Nadal** de Catalunya el 2026: quines dates han confirmat els organitzadors…" (es: "Las **ferias y mercados de Navidad**…"; en unchanged). No title change.
- **Internal links in.** The school-calendar page ranks for `vacances de nadal` (4 @ 6.8) and `quan comencen les vacances de nadal` (2 @ 8). It belongs to cluster 2; earliest edit 20 Nov (round-1 window). Add after its Christmas-holiday sentence:
  - ca: "Per a plans durant les vacances de Nadal (del 22 de desembre de 2026 al 7 de gener de 2027): [els mercats i fires de Nadal](/ca/tradicions/mercats-de-nadal-catalunya/), [el calendari de pessebres vivents](/ca/tradicions/pessebres-vivents-catalunya/) i [on veure neu sense esquiar](/ca/guies/on-veure-neu-catalunya-sense-esquiar/)."
  - es: "Para planes durante las vacaciones de Navidad (del 22 de diciembre de 2026 al 7 de enero de 2027): [los mercados y ferias de Navidad](/es/tradiciones/mercados-navidad-cataluna/), [el calendario de belenes vivientes](/es/tradiciones/belenes-vivientes-cataluna/) y [dónde ver nieve sin esquiar](/es/guias/donde-ver-nieve-cataluna-sin-esquiar/)."
  - en: "For plans over the Christmas holidays (22 December 2026 to 7 January 2027): [Christmas markets in Catalonia](/en/traditions/christmas-markets-catalonia/), [the living nativity calendar](/en/traditions/living-nativity-scenes-catalonia/) and [where to see snow without skiing](/en/guides/where-to-see-snow-catalonia-without-skiing/)."
  - Dates come from `src/lib/content/school/calendar.ts` (`christmas: ["2026-12-22", "2027-01-07"]`, DOGC-sourced on that page).

Priority **4**. Earliest edit: dates as they appear; rest 22 Nov.

---

## 5. Living nativity scenes — `/ca/tradicions/pessebres-vivents-catalunya/` · `/es/tradiciones/belenes-vivientes-cataluna/` · `/en/traditions/living-nativity-scenes-catalonia/`

**Demand.** None yet: published and indexed 25 Oct. The peak is December.

**Live page.** The first screen says "Encara no hi ha cap pessebre vivent de la temporada a l'Agenda Cultural…", and the useful table of 11 known nativities sits two sections down. I spot-checked: Torre del Suro, «21 de desembre de 2026» «a les 18 h», «L'ENTRADA ÉS LLIURE», «NO CAL INSCRIPCIÓ PREVIA» (pessebrevivent.cat, read 26 Oct).

**Competition.** escapadaambnens.com (lists by comarca), femturisme, and pessebresvivents.cat (the federation's map and calendar once published). They win on **breadth**: the federation announced more than 300 performances in 51 municipalities last season, and the agenda feed caught 44.

**Changes (22 Nov).**
1. While the agenda list is empty, render the "known nativities" table before the empty-list notice, so the first screen answers with dates.
2. Once pessebresvivents.cat publishes its 2026-27 calendar, link to it as the complete list, cited and dated.
3. Internal link from the Barcelona Christmas guide (`christmas-barcelona.ts`, which already links the markets):
   - ca: "Per veure'n un de vivent a la ciutat, el 33è Pessebre Vivent de la Torre del Suro, al Guinardó, és el 21 de desembre a les 18 h, amb entrada lliure; la resta, al [calendari de pessebres vivents](/ca/tradicions/pessebres-vivents-catalunya/)."
   - es: "Para ver uno viviente en la ciudad, el 33.º Pessebre Vivent de la Torre del Suro, en el Guinardó, es el 21 de diciembre a las 18 h, con entrada libre; el resto, en el [calendario de belenes vivientes](/es/tradiciones/belenes-vivientes-cataluna/)."
   - en: "For a living one in the city, the 33rd Torre del Suro living nativity, in Guinardó, is on 21 December at 6 pm, free entry; the rest are in the [living nativity calendar](/en/traditions/living-nativity-scenes-catalonia/)."
   - Source: pessebrevivent.cat as quoted above.
4. Also add the school-calendar link from §4.

Priority **3**. Earliest edit: 22 Nov.

---

## 6. Reservoirs — `/ca/guies/embassaments-catalunya-avui/` · `/es/guias/embalses-cataluna-hoy/` · `/en/guides/catalonia-reservoir-levels/`

**Demand.**
- es: `embalses catalunya` 29 @ 14.2, `embalses cataluña` 12 @ 26, `pantanos catalunya hoy` 4 @ 10.5, `embalses catalunya hoy` 3 @ 8.0, plus a long tail at 9–11 (`agua embalsada…`, `nivel agua…`, `reserva agua…`).
- ca: `estat embassaments` 6 @ 41.8, `nivell embassaments` 5 @ 19.4, `embassaments de catalunya` 4 @ 24.
- `aca embassaments` and `aigua en temps real` are navigational to ACA; we won't win those.
- en: indexed, no impressions.
- 1 click in 337 impressions.

**Live page.** Works: ACA reading of 26 Oct, 78.2%, Ter-Llobregat 80.8%, a nine-row table and the week's change. The reading time is "2 min": thin next to what ranks.

**Competition** (indicative; US search returned press). ACA's own "estat dels embassaments" / "aigua en temps real", embalses.net (one page per reservoir, history), and press trackers (El Periódico, 3Cat, Ara) with "vs last year" and drought context. They win on **format and context**: a year-on-year comparison, a trend chart and drought status.

**Changes (21 Nov).**
1. **A year-ago comparison, computed in the block** from the same ACA dataset; nothing typed by hand. Verified example from https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json, `dia='2025-10-26'`, read 26 Oct 2026:
   - The nine reservoirs held 499.5 hm³ (≈ 73.7% of 678.1 hm³), against 530 hm³ / 78.2% today: **+4.5 points**.
   - Ter-Llobregat held 456.4 hm³ (≈ 76.8% of 594.1), against 80.8% today: **+4.0 points**.
   - Template:
     - ca: "Fa un any ({date}) eren al {pct} %: {delta} punts."
     - es: "Hace un año ({date}) estaban al {pct} %: {delta} puntos."
     - en: "A year ago ({date}) they were at {pct}%: {delta} points."
2. **A 12-month line chart** of the total and Ter-Llobregat from the same dataset. That is the format the trackers win with.
3. **Drought status.** Keep the current "ask ACA" paragraph. I could not verify the current ACA drought status for each operating unit on 26 Oct (search returned 2021–2024 resolutions only), so it is **UNVERIFIED**. Add a dated status line only from sequera.gencat.cat or the DOGC resolution in force.
4. **Internal link in (optional, low).** From the mushroom report's rain explanation (`why`): ca "La mateixa pluja és la que omple els [embassaments](/ca/guies/embassaments-catalunya-avui/)." Only if the owner sees it as editorially right; it is a stretch for a mushroom reader.

Priority **3**. Earliest edit: 21 Nov.

---

## 7. Ski resorts — `/ca/guies/estacions-esqui-catalunya/` · `/es/guias/estaciones-esqui-cataluna/` · `/en/guides/ski-resorts-catalonia/`

**Demand.**
- es: `estaciones de esquí de cataluña` 12 @ 57.8, `esquiar a catalunya` 11 @ 61, `esquí catalunya` 11 @ 63, `pistas de esqui cataluña` 10 @ 59.7, all page 6.
- ca: page at 6.4 on small numbers.
- en: indexed 25 Oct, no impressions.
- Peak: December.

**Live page.** A good comparison table, an answer-first lead and an FAQ, re-checked on 24–25 Oct. Baqueira verified on 26 Oct (baqueira.es news): «La estación tiene previsto inaugurar la temporada de invierno 2026-2027 el próximo 28 de noviembre y prolongarla hasta el 4 de abril de 2027…»; «La campaña de venta anticipada se prolongará hasta el 1 de noviembre… 1.300… Una vez finalizada esta primera fase, las tarifas pasarán a ser de 1.400 €».

**Competition** (indicative). Wikipedia's resort list, catalunya.com, infonieve/skiinfo, pirineu365. They win on **authority and live snow reports**. On-page there is little left to add. Position 58–63 with a complete page is an authority limit (rankings-push: "if you can't name a reason, don't guess with a rewrite").

**Changes.**
- **Dated fixes (P0 on the date; do not wait for 22 Nov).**
  - **2 Nov:** Baqueira season-pass row → "1.400 € (preu general des del 2 de novembre)" / "1.400 € (precio general desde el 2 de noviembre)" / "€1,400 (standard price from 2 November)".
  - **18 Nov:** remove the Guils "25% off until 17 Nov" sentence (it is also on the snow page).
  - **23 Nov:** Masella 730 € → 840 €.
  - **9 Dec:** Alp2500 950 € → 1.090 €.
  - Each date comes from the prices already cited on the page.
- **As announced:** when FGC, Masella or Port del Comte publish opening dates, replace "Cap altra estació n'ha anunciat la data" the same day. On 26 Oct I found no FGC announcement.
- **Internal links in (22 Nov).** The school-calendar sentence in §4 could add "[les estacions d'esquí](…)", but keep it to three links; snow-without-skiing is the better fit there. The calendari laboral (cluster 2) could carry, at the pont de la Puríssima (8 Dec, a Tuesday, a holiday per the Generalitat calendar already cited on the pessebres page): ca "És també quan obren les estacions d'esquí: mira [la comparativa d'estacions](/ca/guies/estacions-esqui-catalunya/)." Only if that page has a ponts section.

Priority **3**. Earliest edit: dated fixes as listed; rest 22 Nov.

---

## 8. Snow without skiing — `/ca/guies/on-veure-neu-catalunya-sense-esquiar/` · `/es/guias/donde-ver-nieve-cataluna-sin-esquiar/` · `/en/guides/where-to-see-snow-catalonia-without-skiing/`

**Demand.**
- ca: `rutes hivern catalunya` 35 @ 66.6 and `vall de montnou` 15 @ 55.5. Both are intent mismatches (general winter hikes; a specific valley the page doesn't cover); don't chase them.
- en: `does it snow in catalonia` 5 @ 7.4. The page's lead already answers it ("Yes, it snows in Catalonia: in the Pyrenees.").
- es: `donde nieva en cataluña` 1 @ 5.

**Live page / P0.** The FAQ "Quan obren les estacions?" ends "A 24 d'octubre de 2026 cap ha anunciat la data de la temporada 2026-27". It is wrong: Baqueira announced 28 Nov on 28 Jul (verified above). The ski guide says so. Replace in `pyrenees.ts` lines 902 / 951 / 1000:
- ca: "Normalment entre finals de novembre i principis de desembre. Baqueira Beret preveu obrir la temporada 2026-27 el 28 de novembre, si la neu ho permet; les estacions d'FGC encara no n'han anunciat la data (consultat el 26 d'octubre de 2026)."
- es: "Normalmente entre finales de noviembre y principios de diciembre. Baqueira Beret prevé abrir la temporada 2026-27 el 28 de noviembre, si la nieve lo permite; las estaciones de FGC aún no han anunciado la fecha (consultado el 26 de octubre de 2026)."
- en: "Usually between late November and early December. Baqueira Beret plans to open the 2026-27 season on 28 November, snow permitting; FGC's resorts have not yet announced their dates (checked 26 October 2026)."

Also remove the Guils "25% until 17 Nov" sentence on 18 Nov.

**Competition** (indicative). Catalan winter-route listicles (femturisme, escapadaambnens) for "rutes hivern"; resort pages for raquetes. No content gap worth closing within this page's intent.

**Internal links in (22 Nov).** The school-calendar sentence in §4. It is already linked from Christmas Barcelona, Núria, climate, Ripollès and Setcases.

Priority **2**. Earliest edit: P0 now; rest 22 Nov.

---

## 9. Setcases — `/ca/destinacions/setcases/` · `/es/destinos/setcases/` · `/en/destinations/setcases/`

**Demand.**
- es: `setcases que ver` 14 @ 14.1, `que ver en setcases` 9 @ 9.9, `setcases` 8 @ 28.2, `que ver en setcases y alrededores` 3 @ 13.3, `que hacer en setcases` 2 @ 16.5, `setcases altitud` 2 @ 46.5.
- en: `setcases` 14 @ 10.2.
- ca: 2 impressions. Last crawled 3 Oct, so Google has not yet seen the 24 Oct edit.

**Live page.** Strong and answer-first: the altitude (1,265 m, Idescat) and population are in the key facts, plus miradors, a routes table from the park, Vallter prices and buses, and an FAQ. Facts are dated 24 Oct.

**Competition** (WebSearch returned junk for this query; indicative only). Ripollès Turisme, setcases.cat, Wikipedia, rural-tourism portals. The likely reason is **authority** (official and local domains), not a missing section. The page already covers "qué ver", "alrededores" and "qué hacer".

**Changes.**
- No body change before the round-2 reading (21 Nov). The 24 Oct changes need the window.
- Lever: links from the Ripollès hub (already), the snow guide (already, via Vallter) and the ski guide. In `ski.ts`, the Vallter row or its bus paragraph can link the village (22 Nov):
  - ca: "Vallter és sobre [Setcases](/ca/destinacions/setcases/)…"
  - es: "Vallter está sobre [Setcases](/es/destinos/setcases/)…"
  - en: "Vallter sits above [Setcases](/en/destinations/setcases/)…"
- Per the roadmap, the mushroom report must not link to Setcases as a destination.

Priority **2**. Earliest edit: 22 Nov.

---

## 10. Ripollès hub — `/ca/destinacions/ripolles/` · `/es/destinos/ripolles/` · `/en/destinations/ripolles/`

**Demand.** About 90 impressions, all at 26–87: `ripoll` 50, `ripolles` 51–64, `ripoll espagne` 46, `comarca de ripoll` 29, `ripolles info` 26.7, `visitar ripoll` 46.5, `que ver en ripoll` 42.

**Live page.** The round-2 rewrite leads with Ripoll: monastery hours and prices table (7.50 €), R3 trains, Sant Joan, Camprodon/Beget, Núria and Setcases. Verified 24 Oct.

**Competition** (es). viajeroscallejeros, felicesvacaciones, barcelonaurbana, escapadarural, femturisme, visit.ripoll.cat. They win on **authority and links**; their sections (monastery, Sant Joan, Camprodon, Beget, Núria) are ones we already cover. Rankings-push applies: when the gap isn't on-page, the fix is links.

**Changes.**
- No body change before 22 Nov.
- **Internal link from the strongest page on the site:** the mushroom report's Ripollès zone (§1 C, from 17 Nov). It is the cross-link the roadmap asks for.
- Owner, phase D: listing in the Ripollès Turisme / council directories, where eligible.

Priority **2**. Earliest edit: 22 Nov (inbound link from the mushroom page from 17 Nov).

---

## Verified-correct (spot checks, 26 Oct)

- Santa Llúcia 2026 dates still unpublished (firadesantallucia.cat shows 2025).
- Torre del Suro 21 Dec 2026, 18 h, free entry.
- Baqueira opening 28 Nov 2026, closing 4 Apr 2027; season pass 1.300 € until 1 Nov, then 1.400 €.
- Alt Pirineu windows (Virós, Cardós, Bonabé, Sant Joan) and the descent statement.
- ACA reading 26 Oct 2026 matches the live table.
- Mushroom report data dated 25 Oct; no presence claims anywhere on the page.
- All 12 low-impression URLs inspected are "Submitted and indexed" with a self canonical.

## Unverified (do not print until checked)

- The Montseny outing on 31 Oct (Viladrau), on the autumn page.
- The current ACA drought status per operating unit.
- 2026-27 opening dates for FGC resorts, Masella and Port del Comte (none found on 26 Oct).
