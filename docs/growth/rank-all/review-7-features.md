# Review — cluster 7: feature guides (26 Oct 2026)

Read-only review. Method: AGENT_BRIEF.md, rankings-push.md, SEO_EXPERIMENTS.md (26 Oct entry: titles do not move CTR at positions 7–10, position does). GSC = `scripts/gsc-page.py <path> 28`, window 27 Sep – 24 Oct. Competition = WebSearch on 26 Oct (US results, so only indicative).

**The input rows give the wrong source and date.** Every row says `features/shared.ts`, last committed 2026-09-18. The content is actually in `features/<name>.ts`, and `git log -1 --format=%cs` gives the real last-edit dates: castanyada **2026-10-23**, sitges **2026-10-07**, and all the others **2026-10-24** (round-2 page-1 sprint). The earliest edit dates below use the real dates.

**Most impressions on these pages come from hidden queries.** GSC hides most of them as anonymised. For example, the ES rainy page has 126 impressions but only 2 visible queries, and both are AI fan-out fragments ("coche", "en cataluña"). Read each page against its named queries only (see the 29 Sep entry in SEO_EXPERIMENTS).

## Summary

| Article | Impr. 28 d (ca+es+en) | Best position (page) | Priority | Earliest edit | P0 |
|---|---|---|---|---|---|
| Castanyada | 516 (349 / 39 / 128) | 7.6 (es) | **5** | P0 **now**; rest 20 Nov | **yes** |
| Sitges festival guide | 735 (109 / 248 / 378) | 6.8 (ca) | 2 (demand gone until 2027) | P0 **now**; rest 4 Nov | **yes** |
| Autumn food fairs | 164 (31 / 108 / 25) | 6.6 (ca) | 4 | P0 **now**; rest 21 Nov | **yes** |
| Rainy day | 251 (24 / 126 / 101) | 5.5 (ca) | 4 | 21 Nov | no |
| Catalonia without a car / trains | 92 (8 / 54 / 30) | 7.0 (ca) | 3 | 21 Nov | no |
| Lesser-known Gaudí | 44 (6 / 22 / 16) | 5.0 (ca) | 3 | 21 Nov | no |
| Medieval villages | 58 (25 / 20 / 13) | 22.1 (en) | 2 | 21 Nov | no |
| Surprising / hidden places | 24 (0 / 21 / 3) | 9.7 (en) | 1 | 21 Nov | no |
| Tourist traps | 11 (5 / 0 / 6) | 3.6 (ca) | 1 | 21 Nov | no |
| Beyond Montserrat | 7 (0 / 6 / 1) | 9.0 (en) | 1 | 21 Nov | no |

**The three P0s are all calendar decay.** The pages present events that have already happened as if they were still to come. Each is a body-only fix, and none touches a title.

---

## 1. Castanyada — P0, priority 5

`/ca/tradicions/castanyada-catalunya/`, `/es/tradiciones/castanyada-cataluna/`, `/en/traditions/castanyada-catalonia/` — source `features/castanyada.ts`, last edit 2026-10-23. The title was changed in the 23 Oct sprint and is **frozen until 20 Nov**.

**Demand.** This is peak week. CA: `castanyada 2026` 16 @ 7.5, `quan es la castanyada 2026` 10 @ 5.1 (2 clicks, 20 %), `quin dia es la castanyada 2026` 5 @ 6.0, `dia de la castanyada 2026` 4 @ 6.2, `fira de la castanya 2026` 4 @ 5.8, `castanyada` 4 @ 60.5. ES: `castañada 2026` 9 @ 7.9. EN: `castanyeres` 14 @ 64.4, `castanyera catalunya` 6 @ 9.8, `castanyada` 6 @ 18.3.

**Live page (fetched 26 Oct).** The lead and the key-facts box still offer the Viladrau fair of 24–25 Oct as "la fira de referència". The "Viladrau, la referència" section says the fair "se celebra" and advises "matinar hi val la pena". The FAQ "On hi ha fires de la castanya aquest any?" answers with that same fair. All six 24–25 Oct rows in the table are past. Searchers for `fira de la castanya 2026` arrive now and are shown a fair that is over.

**Competition.** The SERP for `quan és la castanyada 2026` is weak. It is mostly aggregators (escapadaambnens, festivalesdeespana, an EYCA discount page), and none of them answers the date in its first line. Our page does answer it, so the gap is freshness, not format. For `castanyeres` the results are betevé (which we already cite), school PDFs and a study-abroad blog. Those are informational pages in Catalan; the EN page at 64 is an intent and language mismatch, so leave it alone.

### P0 (apply now; body only, titles untouched)

The new events come from the Generalitat open-data agenda `rhpv-yr4f`, queried 26 Oct 2026 (events containing "castany" between 27 Oct and 2 Nov):
- Valls 30 Oct 17.30 h, Plaça del Pati, free.
- Capellades 31 Oct 18 h, Teatre la Lliga, €3.
- Maçanet de la Selva 1 Nov 17.30 h, Pista Jardí, free.
- Bellver de Cerdanya 2 Nov 18 h, Centre Cívic Escoles Velles, €3.

No other Castanyada event with an official date was found. Castelldefels, Jesús (Tortosa), Cabró Rock and Castanyoween appear only on aggregators, so they stay out, in line with the file's own rule.

**Lead**
- CA: «La Castanyada del 2026 és el **dissabte 31 d'octubre**, la vigília de Tots Sants, que enguany cau en diumenge. Aquella nit Viladrau fa el Ball de les Bruixes, i l'espectacle infantil «On són les castanyes?» passa per Valls (30 d'octubre), Capellades (31), Maçanet de la Selva (1 de novembre) i Bellver de Cerdanya (2). La 31a Fira de la Castanya de Viladrau ja es va fer el 24 i 25 d'octubre.»
- ES: «La Castañada de 2026 es el **sábado 31 de octubre**, la víspera de Todos los Santos, que este año cae en domingo. Esa noche Viladrau celebra el Ball de les Bruixes, y el espectáculo infantil «On són les castanyes?» pasa por Valls (30 de octubre), Capellades (31), Maçanet de la Selva (1 de noviembre) y Bellver de Cerdanya (2). La 31ª Fira de la Castanya de Viladrau ya se celebró el 24 y 25 de octubre.»
- EN: «The Castanyada 2026 is on **Saturday 31 October**, the eve of All Saints' Day, which falls on a Sunday this year. Its symbol is the **castanyera**, the chestnut seller roasting on a street brazier. That night Viladrau holds its Ball de les Bruixes, and the children's show "On són les castanyes?" plays Valls (30 October), Capellades (31), Maçanet de la Selva (1 November) and Bellver de Cerdanya (2). Viladrau's 31st Chestnut Fair already took place on 24–25 October.»

**Key facts:** replace the row "Fira de referència / Viladrau, 24 i 25 d'octubre de 2026" with
- CA: `{ label: "La nit del 31", value: "Ball de les Bruixes a Viladrau" }`
- ES: `{ label: "La noche del 31", value: "Ball de les Bruixes en Viladrau" }`
- EN: `{ label: "On the night of the 31st", value: "Viladrau's Ball de les Bruixes" }`

**Table changes:**
- Delete the four rows that are wholly past: Viladrau fair, Arbúcies, Vilanova del Vallès and Cardona.
- La Pedrera row → "Ds. 31 d'octubre, 10:00" / "Sáb. 31 de octubre, 10:00" / "Sat 31 October, 10:00".
- Children's-show row → "Del 30 d'octubre al 2 de novembre" with the places "Valls (30, 17.30 h, gratuït), Capellades (31, 18 h, 3 €), Maçanet de la Selva (1 nov., 17.30 h, gratuït) i Bellver de Cerdanya (2 nov., 18 h, 3 €)". Translate the same way for es/en.
- Keep the Ball de les Bruixes row.
- Caption: "comprovats el 26 d'octubre de 2026".

**"Viladrau, la referència" section:** "confirma que la 31a Fira … se celebra" → "**es va celebrar** el cap de setmana del 24 i 25 d'octubre de 2026". Replace "Compta que hi haurà molta gent: matinar hi val la pena" with "Si hi vas l'any que ve, compta que hi ha molta gent: matinar hi val la pena." Apply the same tense changes in es/en.

**FAQ "On hi ha fires de la castanya aquest any?"**
- CA: «La més gran, la 31a Fira de la Castanya de Viladrau, ja es va fer el 24 i 25 d'octubre de 2026. La nit del 31 encara hi ha el Ball de les Bruixes de Viladrau, i a la taula hi ha els altres actes amb data confirmada.»
- ES: «La mayor, la 31ª Fira de la Castanya de Viladrau, ya se celebró el 24 y 25 de octubre de 2026. La noche del 31 aún queda el Ball de les Bruixes de Viladrau, y en la tabla están los demás actos con fecha confirmada.»
- EN: «The biggest, Viladrau's 31st Chestnut Fair, already took place on 24–25 October 2026. On the night of the 31st there is still Viladrau's Ball de les Bruixes; the table lists the other events with a confirmed date.»

Update `CHECKED` to 26 Oct and add the agenda dataset to `sources` (it is already the `AGENDA` constant).

### What the page becomes from 3 November (body only; P0-type staleness, so it may go in that day)

The source for the date is the site's own holiday payload: Tots Sants 2027 is Monday 1 Nov, festiu, DOGC 9637 of 1 Apr 2026. 31 Oct 2027 is a Sunday (computed).
- CA lead: «La Castanyada del 2027 serà el **diumenge 31 d'octubre**, la vigília de Tots Sants, que serà dilluns 1 de novembre i és festiu a Catalunya. Les fires i els actes del 2027 encara no tenen data publicada; a sota hi ha els del 2026 com a referència.»
- ES: «La Castañada de 2027 será el **domingo 31 de octubre**, la víspera de Todos los Santos, que será lunes 1 de noviembre y es festivo en Cataluña. Las ferias y actos de 2027 aún no tienen fecha publicada; abajo están los de 2026 como referencia.»
- EN: «The Castanyada 2027 falls on **Sunday 31 October**, the eve of All Saints' Day, which is Monday 1 November and a public holiday in Catalonia. No 2027 fair or event dates have been published yet; the 2026 ones are below for reference.»
- Retitle the table "… 2026 (edició passada)".
- FAQ "Quan és la Castanyada el 2027?" → "Diumenge 31 d'octubre de 2027."
- Titles: change "2026" to "2027" only **after the 20 Nov reading**. Demand is negligible from November to September.

**In-links (now, body only).**
- The mushroom report (`mushrooms/publish.ts`, refreshed weekly, ranks 1–2 on its main queries) carries Castanyada only in its related cards. Add one in-body sentence to the season paragraph:
  - CA «Si surts al bosc el cap de setmana del 31 d'octubre, és ${link("castanyada","ca","la Castanyada")}: castanyes, panellets i el Ball de les Bruixes de Viladrau.»
  - Translate likewise for es/en.
- After 3 Nov, add one line on the "es festiu avui" page under 1 November linking to the Castanyada. That page's title is frozen to 3 Nov; its body may change after that.

---

## 2. Sitges Film Festival guide — P0, priority 2

`/ca/agenda/festival-sitges-guia/`, `/es/agenda/festival-sitges-guia/`, `/en/events/sitges-film-festival-guide/` — source `features/sitges.ts`, last edit 2026-10-07. The 24 Sep EN title experiment was read on 26 Oct (no lift) and is no longer frozen.

**Demand.** It collapsed with the festival: EN had 47–59 impressions a day in late September and 0–2 a day after 19 Oct. The named queries were all `2026 schedule / tickets / dates` at positions 9–11 (`… schedule` 24 @ 9.0, `… tickets` 21 @ 10.0). One small evergreen cluster survives: `sala llevant sitges` (ca/es/en, 2–3 each @ 6–10). ES also had `peter jackson sitges 2026` 2 @ 18.5, `cuando es el festival de sitges` @ 45 and `festival de cine de sitges próxima fecha` @ 45. Those last two are exactly the question the page should answer until next year.

**Live page (ES fetched 26 Oct).**
- The lead says "Sitges **vuelve a convertirse**" (future/present) for an edition that ended on 18 Oct.
- The key facts say "Parrilla de sesiones: Publicada".
- The callout tells readers to check the grid "la misma mañana que vayas".
- There are no winners and no mention of the next edition.

**Official state (sitgesfilmfestival.com, 26 Oct).**
- The palmarès was published on 17 Oct 2026: "La 59ª edició del SITGES … anuncia el seu esperat palmarès. Sanguine, de Marion Le Corroller, guanya el Premi a Millor pel·lícula." (https://sitgesfilmfestival.com/ca/noticies/sanguine-marion-corroller-millor-pellicula-sitges-2026).
- No 2027 dates are published. The home page still shows only "8-18 octubre 2026".
- Honorary awards: Danny DeVito, Meiko Kaji and Takashi Shimizu, 16 Oct (news "tres premis en un dia"); Amy Irving, Gran Premi Honorífic, 18 Oct.

**Competition.** Not worth chasing until the 60th edition is announced. Off-season, the ranking pages are Wikipedia and the festival itself.

### What the page should become until next year

Keep the URL. Turn the page from a pre-festival guide into "**2026 results + what we know about the next edition + the evergreen first-timer guide**". Change the body now and **do not touch titles yet**: demand is near zero, so a title change would be unreadable. When the festival publishes the 60th edition's dates, rewrite the titles and lead to the new year in one change. Monitor sitgesfilmfestival.com monthly from March; the 2025 and 2026 editions both ran in the first half of October, so the ramp-up is July–September.

**Lead (replace)**
- CA: «La 59a edició del Festival de Sitges es va fer del 8 al 18 d'octubre de 2026, i el premi a la Millor Pel·lícula va ser per a **Sanguine**, de Marion Le Corroller. El Festival encara no ha anunciat les dates de la pròxima edició (comprovat el 26 d'octubre de 2026); quan les publiqui, les posarem aquí.»
- ES: «La 59ª edición del Festival de Sitges se celebró del 8 al 18 de octubre de 2026, y el premio a la Mejor Película fue para **Sanguine**, de Marion Le Corroller. El Festival aún no ha anunciado las fechas de la próxima edición (comprobado el 26 de octubre de 2026); cuando las publique, las pondremos aquí.»
- EN: «The 59th Sitges Film Festival ran from 8 to 18 October 2026, and Best Film went to **Sanguine**, by Marion Le Corroller. The festival has not yet announced the dates of its next edition (checked 26 October 2026); we will add them here when it does.»

Delete the second intro paragraph in ca/es ("Anar-hi per primera vegada…"), or keep it in a general tense.

**Key facts:**
- Replace "Graella de sessions: Publicada…" with "Pròxima edició: dates per anunciar" / "Próxima edición: fechas por anunciar" / "Next edition: dates not yet announced".
- Change "Dates" to "Dates 2026: 8–18 d'octubre".
- Add "Millor pel·lícula 2026: Sanguine (Marion Le Corroller)".

**Delete:** the "On consultar la graella de sessions" callout, and the "Què se sap ja de l'edició 2026" section with its "announced names" list.

**Add, in their place, H2 "Palmarès 2026" / "Palmarés 2026" / "2026 winners".** Copy the title strings exactly from the official news; the categories are given here in Catalan, so translate the category names for es/en.

| Premi | Pel·lícula / persona |
|---|---|
| Millor Pel·lícula (Secció Oficial Fantàstic) | Sanguine, de Marion Le Corroller |
| Premi Especial del Jurat | Drag, de Greg Yagolnitzer i Raviv Ullman |
| Millor Direcció | Joko Anwar, per Ghost in the Cell |
| Millor Interpretació Femenina | Jasmine Trinca, per The Spiral |
| Millor Interpretació Masculina | Benoît Magimel, per Historias de la noche (The Birthday Party) |
| Premi Citizen Kane al Director Revelació | Leviticus, d'Adrian Chiarella |
| Gran Premi del Públic | Wildwood, de Travis Knight |
| Noves Visions, Millor Pel·lícula | Hen, de Nico Scheepers |
| Òrbita, Millor Pel·lícula | Gummy, de Javi Prada |
| Méliès d'Argent, Millor Pel·lícula | The Spiral, de Paolo Strippoli |

Caption: «Font: Sitges Film Festival, palmarès publicat el 17 d'octubre de 2026.» Then one sentence:
- CA «Els premis honorífics van ser per a Danny DeVito, Meiko Kaji i Takashi Shimizu (16 d'octubre) i Amy Irving, Gran Premi Honorífic (18 d'octubre).»
- ES «Los premios honoríficos fueron para Danny DeVito, Meiko Kaji y Takashi Shimizu (16 de octubre) y Amy Irving, Gran Premio Honorífico (18 de octubre).»
- EN «Honorary awards went to Danny DeVito, Meiko Kaji and Takashi Shimizu (16 October) and to Amy Irving, the Grand Honorary Award (18 October).»

**Keep, in a general tense:** venues (this answers `sala llevant`), "Do not try to see everything", passes, getting there and the first-timer strategy. Change "torna a convertir-se", "aquesta edició" and similar wording to general. Add the venue page as the place to check the Sala Llevant's location; no address is printed unless it is read on the venues page.

**Sources:** add the palmarès news URL. Update the file comment.

**In-links:** none now. The trains page already links here. Revisit when the 2027 dates come out.

---

## 3. Autumn food fairs — P0, priority 4

`/ca/gastronomia/fires-gastronomiques-tardor-catalunya/`, `/es/gastronomia/ferias-gastronomicas-otono-cataluna/`, `/en/food/catalonia-autumn-food-festivals/` — `features/foodfairs.ts`, last edit 2026-10-24 (round-2 sprint; titles frozen until 21 Nov).

**Demand.** ES has 108 impressions @ 7.0 with 5 clicks; CA 31 @ 6.6 with 3 clicks; EN 25 @ 8.6. Almost no named queries are visible (ES: `barcelona`, `hay alguna mas`, both fragments; CA: `fires de tardor a catalunya` @ 48). The page ranks on hidden long-tail queries.

**Live page (ES, 26 Oct).** The H1 is fine. The **lead opens with the 24–25 Oct fairs (Viladrau, Monistrol, Cardona), which are over**, and the first three table rows are the same past fairs. The "Cómo elegir" section still says "Para una salida familiar el 24 y el 25 de octubre".

**Competition.** `ferias gastronómicas otoño cataluña 2026 noviembre` returns escapadaambnens (several roundups) and festivalesdeespana, which are aggregators with many more fairs (Fira del Bolet de Terrassa, the Solsonès gastronomic days, 17 Oct–16 Nov). They win on **breadth**. We win on the accuracy of each date, which is the site's rule. Do not import their dates.

**Re-check on 26 Oct.**
- festadelvi.cat (home): «30 d'octubre – 1 de novembre de 2026»; «Copa i tiquets de degustació — Preu per confirmar», so the page's wording is still right.
- festadelvi.cat/entrades: «cal comprar la copa i els tiquets corresponents, que es venen al mateix recinte de la Festa del Vi, a l'estand habilitat per a aquest servei».
- The Mostra hours on /programa match the page: Fri 19.00–21.30; Sat 11.00–14.00 and 17.30–21.30; Sun 11.00–14.00. The Nit de les Garnatxes Blanques is 22.00–01.00, €65.

### P0 (apply now)

**Lead**
- CA: «La pròxima és la **39a Festa del Vi de Gandesa**, a la Terra Alta, **de divendres 30 d'octubre a diumenge 1 de novembre de 2026**. Al novembre vénen les fires de l'oli nou: **Reus (13 i 14)**, **Maials (14 i 15)**, **Barcelona, a la plaça de Catalunya (del 20 al 22)** i **Tarragona (27 i 28)**. Les fires de Viladrau (castanya), Monistrol de Montserrat (coca i mató) i Cardona (llenega) ja es van fer el 24 i 25 d'octubre.»
- ES: «La próxima es la **39.ª Festa del Vi de Gandesa**, en la Terra Alta, **de viernes 30 de octubre a domingo 1 de noviembre de 2026**. En noviembre llegan las ferias del aceite nuevo: **Reus (13 y 14)**, **Maials (14 y 15)**, **Barcelona, en la plaza de Catalunya (del 20 al 22)** y **Tarragona (27 y 28)**. Las ferias de Viladrau (castaña), Monistrol de Montserrat (coca y mató) y Cardona (llenega) ya se celebraron el 24 y 25 de octubre.»
- EN: «Next up is the **39th Festa del Vi in Gandesa**, in the Terra Alta, **from Friday 30 October to Sunday 1 November 2026**. November brings the new olive oil fairs: **Reus (13–14)**, **Maials (14–15)**, **Barcelona, on Plaça de Catalunya (20–22)** and **Tarragona (27–28)**. The Viladrau (chestnut), Monistrol de Montserrat (coca i mató) and Cardona (llenega) fairs already took place on 24–25 October.»

**Other changes:**
- **Table:** move the three 24–25 Oct rows to the bottom and suffix the date cell with " (ja feta)" / " (ya celebrada)" / " (already held)". Change "comprovades el 24" to 26 in the caption.
- **Section "24 i 25 d'octubre…":** move it after the oil section, retitle it «Ja s'han fet: castanya, coca i mató i llenega (24 i 25 d'octubre)» / «Ya celebradas: …» / «Already held: …», and change the verbs to the past tense ("va celebrar", "la va situar").
- **Gandesa paragraph:** append CA «La copa i els tiquets de degustació es venen al mateix recinte, a l'estand habilitat.» / ES «La copa y los tickets de degustación se venden en el propio recinto, en el estand habilitado.» / EN «The glass and tasting tickets are sold at a stand inside the venue.» Source: festadelvi.cat/entrades, read 26 Oct 2026.
- **"Com triar":** replace the first sentence with CA «Per beure amb criteri, aquest cap de setmana de Tots Sants: Gandesa.» / ES «Para beber con criterio, este puente de Todos los Santos: Gandesa.» / EN «To drink with some guidance over the All Saints weekend: Gandesa.» Keep the rest.
- Leave the description as it is: it is not wrong, and it is frozen until 21 Nov.

**From 29 Nov** every 2026 fair is over. Turn the lead into «Dates de l'edició 2026, com a referència; les del 2027 hi seran quan les publiquin els organitzadors», keep the table, and diarise a full refresh for September 2027.

**After 21 Nov (P1, breadth).** Add one or two November fairs, but only once the organiser's own page gives the 2026 date. Candidates seen only on aggregators: Terrassa's Fira del Bolet and the Solsonès Jornades Gastronòmiques de Tardor; verify on terrassa.cat and solsonesturisme.com before adding.

---

## 4. Rainy day — priority 4

`/ca/plans/que-fer-catalunya-quan-plou/`, `/es/planes/que-hacer-cataluna-cuando-llueve/`, `/en/things-to-do/catalonia-rainy-day/` — `features/rainy.ts`, 2026-10-24, earliest edit **21 Nov**.

**Demand.**
- ES: 126 impressions @ 5.9 with 7 clicks, but the visible queries are only fragments.
- CA: 24 @ 5.5 with 6 clicks (25 %).
- EN: 101 @ 9.2. The Barcelona queries sit far down: `things to do in barcelona on a rainy day` @ 51, `what to do on a rainy day in barcelona` @ 72, `rainy day activities in barcelona` @ 65. `things to do in the rain near me` is @ 10.

**Live page.** The first screen answers the Barcelona question (the 24 Oct lead). The Barcelona block has 7 items.

**Competition.** For `things to do in barcelona on a rainy day` the results are Hola Barcelona, Bounce ("13 things"), GoCity, IKONO and livingtours. They win on **format and breadth**: 13–20 named Barcelona venues, including the Picasso Museum, MNAC, Fundació Miró, CaixaForum and Las Arenas. Our Barcelona block has 7 and no art museum by name. They also win on **links**: big brands and old domains. The EN page is Catalonia-wide, which is an intent dilution for the Barcelona queries.

**Smallest change (21 Nov).** Add three art museums to the `BCN_COPY` items, using figures already verified on the site (free-museums fact pack, mirrored in `batch02/cards.ts`). **Re-read museupicassobcn.cat and museunacional.cat on the day:** both price URLs tried on 26 Oct returned 404.
- EN: «**Museu Picasso**: €12 online; free on Thursday afternoons in winter and on the first Sunday of the month.» «**MNAC** (Montjuïc): €12; free on Saturday afternoons.» «**Fundació Joan Miró**: €17 online.»
- ES: «**Museu Picasso**: 12 € en línea; gratis los jueves por la tarde en invierno y el primer domingo de mes.» «**MNAC** (Montjuïc): 12 €; gratis los sábados por la tarde.» «**Fundació Joan Miró**: 17 € en línea.»
- CA: «**Museu Picasso**: 12 € en línia; gratis els dijous a la tarda a l'hivern i el primer diumenge de mes.» «**MNAC** (Montjuïc): 12 €; gratis els dissabtes a la tarda.» «**Fundació Joan Miró**: 17 € en línia.»

**Staleness to watch (not P0).** The Aquàrium line says "fins a l'1 de novembre" and then gives 2 Nov – 20 Dec hours, so it stays correct until 20 Dec. Re-check before then.

**In-links.**
- The free-museums guide (`b2link("museums")`) should get one sentence after its Sunday list: CA «Si plou, ${link("rainy","ca","aquí tens vint plans sota cobert")}.» Do the same for es/en.
- The Barcelona hub (`batch02/barcelona-hub.ts`) is the strongest Barcelona page; add a "Si plou" card pointing to the rainy page.
- Mushrooms and the weekend guide already link here.

---

## 5. Catalonia without a car / day trips by train — priority 3

`/ca/escapades/catalunya-sense-cotxe-tren/`, `/es/escapadas/cataluna-sin-coche-tren/`, `/en/day-trips/barcelona-day-trips-by-train/` — `features/trains.ts`, 2026-10-24, earliest edit **21 Nov**.

**Demand.**
- EN: 30 impressions @ 27.7. `day trips from barcelona by train` 3 @ 41, `barcelona day trips by train` @ 20, `best day trips from barcelona` @ 34.
- ES: 54 @ 7.7 with 7 clicks (13 %); `pueblos con encanto para ir en tren cataluña` 3 @ 59.
- CA: 8 @ 7.

**Live page (EN, 26 Oct).** The H1, the answer-first lead and the 12-row table with times and fares are live. Montserrat is not in the table.

**Competition.**
- EN: GuruWalk, Interrail, apartmentbarcelona, happytowander and spendlifetraveling. They win on **intent match**: every one leads with or includes **Montserrat** (R5 + rack railway), and several add Montblanc and Colònia Güell. Ours deliberately omits Montserrat, which is the single most expected answer.
- ES `pueblos con encanto…`: barcelonaurbana ("Cataluña sin coche: tren y autobús") and Renfe's own "pueblos bonitos cerca de Barcelona en tren". They win on **one missing section**: which charming villages you can and cannot reach by train.

**Smallest change (21 Nov).**
1. Add a 13th table row without renaming the article; the titles say 12 and are frozen. Present it as an aside: a row "Montserrat (see guide)", with figures from the site's own verified Montserrat guide (`batch02/day-trips.ts`, FGC GTFS). Re-check them on fgc.cat on the day.
   - EN: `["Montserrat", "FGC R5 from Plaça Espanya + rack railway or cable car", "60 min to the Aeri, 64 to Monistrol de Montserrat", "Rack railway or cable car €15 return", "Monastery and mountain — see our guide"]`
   - ES: `["Montserrat", "R5 de FGC desde Plaça Espanya + cremallera o teleférico", "60 min hasta el Aeri, 64 hasta Monistrol de Montserrat", "Cremallera o Aeri 15 € ida y vuelta", "Monasterio y montaña: ver guía"]`
   - CA: `["Montserrat", "R5 d'FGC des de Plaça Espanya + cremallera o Aeri", "60 min fins a l'Aeri, 64 fins a Monistrol de Montserrat", "Cremallera o Aeri 15 € anada i tornada", "Monestir i muntanya: vegeu la guia"]`
   - Note under the table. EN «Montserrat is not in the twelve because the last stretch is a rack railway or cable car, not a walk from the station; it has its own guide.» Translate the same for ca/es. Link with `b2link("montserratFree")`.
2. ES/CA only: add a short H2 after the table for `pueblos con encanto`.
   - ES «¿Y los pueblos con encanto? Sant Pol de Mar, Sitges y Vic tienen estación y se recorren a pie. Besalú, Rupit o Peratallada no tienen tren: se llega en autobús (TEISA a Besalú, Sagalés a Rupit), como explicamos en ${link("medieval","es","la guía de pueblos medievales")}.»
   - CA «I els pobles amb encant? Sant Pol de Mar, Sitges i Vic tenen estació i es recorren a peu. Besalú, Rupit o Peratallada no tenen tren: s'hi arriba en autobús (TEISA a Besalú, Sagalés a Rupit), com expliquem a ${link("medieval","ca","la guia de pobles medievals")}.»
   - The bus operators come from medieval.ts, which was verified on 24 Oct. **Peratallada's transport line must be copied from medieval.ts**, not assumed.
3. Re-check before editing: is the R3 still cut between Barcelona and La Garriga? On 26 Oct the press still gives January 2027; the Rodalies notice is the source. Also re-check the fares, because the table note pins them to Tue 27 Oct 2026.

**In-links.** The page is already well linked (13 files). No action.

---

## 6. Lesser-known Gaudí — priority 3

`/ca/cultura/gaudi-obres-menys-conegudes/`, `/es/cultura/gaudi-obras-menos-conocidas/`, `/en/culture/lesser-known-gaudi-sites/` — `features/gaudi.ts`, 2026-10-24, earliest edit **21 Nov**.

**Demand.**
- ES: 22 impressions @ 42.5. `jardín invisible gaudí` 5 @ 70.6, plus six `gaudí fuera de cataluña / fuera de barcelona` variants @ 64–80.
- EN: 16 @ 9.4.
- CA: 6 @ 5.

**Live page.** Eight sites, all in Barcelona, the Baix Llobregat and Mataró, with access and hours tables. It has nothing on the Jardí Invisible and nothing outside Catalonia, so ES ranks at 64–80 for queries it does not answer.

**Competition.**
- `jardín invisible gaudí`: Diari de Tarragona, El Debate (Mar 2026), the MNACTEC press dossier and pssjd.org. They win because they are **the only pages about the subject**.
- `obras de gaudí fuera de cataluña`: felicesvacaciones, esdiario, barcelonasecreta and spain.info. They win on a **missing section**: El Capricho (Comillas), Palacio Episcopal (Astorga) and Casa Botines (León).
- `lesser known gaudi buildings barcelona`: National Geographic, Hola Barcelona and meet.barcelona.cat. They also list **Col·legi de les Teresianes** and **Torre Miranda**, which we lack. Those are UNVERIFIED for us, so do not add them without a Patrimoni record.

**Smallest change (21 Nov).** Two short sections; no title change.

**(a) The Jardí Invisible, Sant Boi de Llobregat.** Source: jardigaudisantboi.cat, read 26 Oct 2026. Quotes: «El jardí modernista del Parc Sanitari Sant Joan de Déu», «Construït entre el 1903 i el 1912», «recentment atribuït a Gaudí», «Per concertar visites envieu un correu a parcsanitari.torrentsdart@sjd.es». The site's own wording varies between "fet per" and "atribuït", so use **"atribuït"**.
- CA: «**El Jardí Invisible, Sant Boi de Llobregat.** Al Parc Sanitari Sant Joan de Déu hi ha un jardí modernista construït entre el 1903 i el 1912, amb una cova cascada, una capella de la Verge i una plaça de bancs, recentment atribuït a Gaudí. No té horari obert: les visites guiades es concerten per correu, segons el web del jardí. Informació: [jardigaudisantboi.cat](https://jardigaudisantboi.cat/).»
- ES: «**El Jardín Invisible, Sant Boi de Llobregat.** En el Parc Sanitari Sant Joan de Déu hay un jardín modernista construido entre 1903 y 1912, con una cueva cascada, una capilla de la Virgen y una plaza de bancos, atribuido recientemente a Gaudí. No tiene horario abierto: las visitas guiadas se conciertan por correo, según la web del jardín. Información: [jardigaudisantboi.cat](https://jardigaudisantboi.cat/).»
- EN: «**The Invisible Garden, Sant Boi de Llobregat.** In the grounds of the Parc Sanitari Sant Joan de Déu is a modernist garden built between 1903 and 1912 — a cascade grotto, a chapel of the Virgin and a square of benches — recently attributed to Gaudí. It has no public opening hours: guided visits are arranged by email, according to the garden's website. Details: [jardigaudisantboi.cat](https://jardigaudisantboi.cat/).»
- Add a row to the access table: "Jardí Invisible | Sant Boi de Llobregat | Visita guiada concertada".

**(b) Gaudí outside Catalonia.** Write it as a short paragraph, not a section with hours, because nothing beyond the location and the official site was verified. Sources:
- palaciodegaudi.es: «Gaudí aplicó en el exterior del palacio su propia visión del neogótico»; it now houses the Museo de los Caminos.
- casabotines.es: «Para su primera casa de vecinos, Gaudí diseñó un edificio de siete plantas».
- elcaprichodegaudi.com: titled "El Capricho de Gaudí … Comillas, Cantabria".

Copy:
- ES: «¿Y fuera de Cataluña? Hay tres obras de Gaudí que se visitan: **El Capricho**, en Comillas (Cantabria) ([elcaprichodegaudi.com](https://www.elcaprichodegaudi.com/)); el **Palacio Episcopal de Astorga** (León), hoy Museo de los Caminos ([palaciodegaudi.es](https://www.palaciodegaudi.es/)); y la **Casa Botines**, en León, su primera casa de vecinos ([casabotines.es](https://www.casabotines.es/)).»
- CA: «I fora de Catalunya? Hi ha tres obres de Gaudí que es visiten: **El Capricho**, a Comillas (Cantàbria); el **Palau Episcopal d'Astorga** (Lleó), avui Museo de los Caminos; i la **Casa Botines**, a Lleó, la seva primera casa de veïns.» Use the same links.
- EN: «And outside Catalonia? Three Gaudí buildings can be visited: **El Capricho** in Comillas (Cantabria); the **Episcopal Palace of Astorga** (León), now the Museo de los Caminos; and **Casa Botines** in León, his first apartment building.» Use the same links.

**Staleness to watch.** The Palau Güell row gives winter hours from 1 Nov, so it is correct from 1 Nov; nothing to do.

**In-links.** The monuments ticket guide (`batch02/monuments.ts`) already links here. The Colònia Güell paragraph in the Montserrat feature already links here. No action.

---

## 7. Medieval villages — priority 2

`/ca/pobles/pobles-medievals-catalunya/`, `/es/pueblos/pueblos-medievales-cataluna/`, `/en/villages/best-medieval-villages-catalonia/` — `features/medieval.ts`, 2026-10-24 (rewritten that day; titles frozen until 21 Nov). Earliest edit **21 Nov**.

**Demand.**
- CA: 25 @ 26.7; `pobles medievals de catalunya` 2 @ 56.5, `pobles medievals catalunya` @ 46.
- ES: 20 @ 53.8; `pueblos medievales cataluña` 2 @ 77.
- EN: 13 @ 22.

These are head terms. The 24 Oct rewrite has not been measured yet.

**Competition.** NacióDigital (twice), barcelonaurbana, femturisme, idealista ("12 pobles medievals de Lleida") and Diari Més ("12 … Tarragona"). They win on **links and authority**: they are media domains. Content-wise they also name **Montfalcó Murallat**, one of National Geographic's four picks, plus Cardona and Lleida villages. We have no Lleida-province village apart from Guimerà.

**Smallest change (21 Nov, only if the 24 Oct rewrite has not moved position by then).**
- Add an "També val la pena" box with **Montfalcó Murallat**, one line plus an official link. It is UNVERIFIED until it is read on the Patrimoni Cultural record or the Ajuntament dels Plans de Sió page. Do not change the "10" in the titles.
- This page is mostly limited by authority (rule: two rounds without movement → stop).

**In-links.** Today only three feature pages link here.
- From the Girona-by-train guide (`b2link("girona")`), in the closing paragraph: CA «Besalú, a 133 km de Barcelona, és a ${link("medieval","ca","la nostra guia de pobles medievals")}.» Translate likewise for es/en. The 133 km is the council figure already on the medieval page.
- From the Tarragona-by-train guide: a link to Montblanc and Siurana in the medieval guide.

---

## 8. Surprising / hidden places — priority 1

`/ca/llocs/llocs-sorprenents-catalunya/`, `/es/lugares/lugares-sorprendentes-cataluna/`, `/en/places/hidden-places-catalonia/` — `features/surprising.ts`, 2026-10-24, earliest edit 21 Nov.

**Demand.** ES has 21 impressions @ 32 on generic heads (`lugares bonitos en cataluña` @ 95, `llocs xulos de catalunya` @ 59). EN has 3 @ 9.7. CA has none.

**Competition.** Book listings ("101 lugares de Cataluña sorprendentes"), Matador, guias-viajar and femturisme. These are generic listicles, and there is no concrete content gap we can close with verified facts.

**Action.** None before the 21 Nov reading. The page was re-checked on 24 Oct and its facts are sound. The limit is demand and authority.

---

## 9. Tourist traps — priority 1

`/ca/barcelona/barcelona-trampes-turistes-alternatives/`, `/es/barcelona/barcelona-trampas-turistas-alternativas/`, `/en/barcelona/barcelona-tourist-traps-alternatives/` — `features/traps.ts`, 2026-10-24, earliest edit 21 Nov.

**Demand.** 11 impressions in total (CA 5 @ 3.6, EN 6 @ 6.3). The tourist-tax experiment's prediction 1 held: there is no cannibalisation from the tax guide.

**Competition.** For `barcelona tourist traps to avoid`: solosophie, barcelonahacks, GoCity, thecreativeadventurer and barcatrips. They win on a **missing section, scams and pickpockets** (spray, bracelet, phone-call scams; beaches and La Rambla). We cover planning mistakes only, by editorial choice.

**Action (P2, 21 Nov).** Add a short "Carteristes i estafes" section, but only from an official source. The Mossos d'Esquadra or Ajuntament de Barcelona safety advice is UNVERIFIED until read. Name no business; this is consistent with the file's legal line. Given the demand, this is low value.

---

## 10. Beyond Montserrat — priority 1

`/ca/escapades/escapades-barcelona-mes-enlla-montserrat/`, `/es/escapadas/escapadas-barcelona-mas-alla-montserrat/`, `/en/day-trips/beyond-montserrat-barcelona-day-trips/` — `features/montserrat.ts`, 2026-10-24, earliest edit 21 Nov.

**Demand.** 7 impressions in total; ES `escapadas desde barcelona` @ 52.

**Competition.** The SERP is mostly Montserrat itself, tour operators and Barceló's "excursiones desde Barcelona". It is a head term owned by big brands, and there is no content gap to close.

**Action.** None. Watch for overlap with the trains page (both list Colònia Güell, Mataró and Terrassa). If both rise for `escapadas desde barcelona`, pick one owner.
