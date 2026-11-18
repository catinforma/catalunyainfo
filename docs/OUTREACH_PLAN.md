# Outreach plan: widgets and the local-holiday data report (draft, 18 Nov 2026)

> **NOTHING SENT. The owner must approve each message.**
> This is a draft for the owner. No site, council, newsroom or person has been contacted. House rule
> (`.claude/product-marketing.md`): no outreach, press, council or partner contact without the owner's explicit OK.
> The owner approves the list, then the exact text of each message, one by one. The owner sends each one from their
> own channel. No agent sends anything.

## What we offer (free, no ads, no cookies, no scripts)

| Asset | URL (ca / es / en) | Who it is for |
|---|---|---|
| **CAL**: holiday calendar widget, 2027 for 947 Catalan towns and 150+ Spanish cities, 2026 for Catalan towns, official source in the frame, updates itself when the DOGC order comes out | `/ca/festius/2027/al-teu-web/` · `/es/festivos/2027/en-tu-web/` · `/en/holidays/2027/for-your-website/` (and a box on every town page) | councils, schools/AFAs, local media, commerce associations |
| **SAL**: net salary 2026 widget (AEAT algorithm, Orden PJC/297/2026) | box on `/ca/calculadores/sou-net/` · `/es/calculadoras/sueldo-neto/` · `/en/calculators/net-salary-spain/` | gestorías, HR/payroll blogs, unions, employment services |
| **DH**: working-days widget (days between dates, deadlines under Ley 39/2015 and LEC, per month), with each place's holidays | box on `/ca/calculadores/dies-habils/` · `/es/calculadoras/dias-habiles/` · `/en/calculators/working-days-spain/` | gestorías, law firms, council "dies inhàbils" pages, unions |
| **REP**: data report "Festius locals de Catalunya: els dies que més es repeteixen" with a CSV (CC BY 4.0) | `/ca/festius/dades-festius-locals/` · `/es/festivos/datos-festivos-locales/` · `/en/holidays/local-holidays-data/` | local and comarcal media, consells comarcals, data journalists |

The paste code is an iframe with a plain `<a href>` **outside** it, in the host's own HTML. That link is the only one
that counts as a link from their site. The only condition we state is to keep that link. We never ask for a
particular anchor text, and a nofollow link is acceptable.

**Report facts that can go in a message** (all computed in `lib/programmatic/holidays/report.ts`, snapshot of the DOGC
order read 30 Oct 2026, council acts up to 17 Nov 2026):
- 2026: 917 municipalities share 1,772 local holidays across 201 different dates.
- Whit Monday (Pasqua Granada), 25 May 2026, is a local holiday in 139 municipalities, home to 3.6 M people (44.5 %
  of Catalonia).
- 61.9 % of local holidays fall on a Monday or a Friday.
- August has the most local holidays (289).
- 2027 so far: 433 councils (81.3 % of the population) have approved their two days. Whit Monday, 17 May 2027, leads
  again with 87. The DOGC order is still pending; the 2026 one came out on 17 Dec 2025.

## Rules for every message

- Send only to a **generic** contact page, form or role mailbox shown publicly. Never use a personal email, a
  personal profile or a phone number. The list below has no personal data.
- One message per site. At most one follow-up, after at least 14 days, and only if the owner approves it. Stop at
  any "no" or at silence after the follow-up.
- Offer nothing in exchange: no money, no link swap, no favour. The page and the widget have to be useful on
  their own.
- Be useful about their page, not pushy. If their list has an error (example: #23), say what the official order
  says and link it, politely, as information.
- Track every contact in the table below (status, date, reply), so nobody is contacted twice.
- Sending window: **after the deploy**. For the Catalan towns, the best moment is just after the 2027 DOGC local
  order is published (expected mid-December, like the 2026 one on 17 Dec 2025). The widgets and the report switch to
  the order automatically, and the message can say "already with the DOGC order".

## Candidates (40)

Research pass of 18 Nov 2026 (public pages only). Every target page and every contact URL was fetched, except where
marked. Priority **A**: a standing page that is stale or has no source, where an auto-updating embed replaces yearly
edits. **B**: a 2027 news item that can link the report or the widget in an update or next year's piece. **C**: a links
page. Status is the same for every row: **not contacted**.

| # | Site | Type | Lang | Target page | Generic contact page | Asset | Pri. | Angle |
|---|---|---|---|---|---|---|---|---|
| 1 | Ajuntament de Granollers | Council | ca | https://www.granollers.cat/calendari-de-festes | https://www.granollers.cat/adreces/administratius/oficina-datencio-ciutadana-oac | CAL | A | Heading still says "2025 i 2026" over 2026/27 content; the embed avoids the yearly edit and cites the order |
| 2 | Ajuntament de Girona | Council | ca | https://seu.girona.cat/portal/girona_ca/ajuntament/calendari/ | https://seu.girona.cat/portal/girona_ca/ajuntament/contacte/ (no form) | CAL, DH | A | The page is also the "dies inhàbils" calendar: the working-days widget with Girona picked |
| 3 | La Paeria (Lleida) | Council | ca | https://www.paeria.cat/ca/ciutat/calendaris/calendari-laboral | https://tramits.paeria.cat/Ciutadania/DetallTramit.aspx?Cercador=True&IdTramit=1817 (bústia) | CAL | A | Full table only for 2026; 2027 gives local days only (Lleida, Raimat, Sucs, whose nuclei the widget shows) |
| 4 | Ajuntament de Cunit | Council | ca | https://www.cunit.cat/calendari-laboral/ | https://www.cunit.cat/ajuntament/contacte/ | CAL | A | Plain text, no source; the embed adds the official citation |
| 5 | Ajuntament de Vilafant | Council | ca | https://www.vilafant.cat/lajuntament/noticies/calendari-laboral-2027-festius | https://www.vilafant.cat/contacte | CAL | A | 2027 calendar as a PNG; already links treball.gencat |
| 6 | Ajuntament de l'Aldea | Council | ca | https://laldea.cat/agenda/09-2024/festes-locals-2027 | https://laldea.cat/ajuntament/suggeriments-queixes | CAL | A | Cites Ordre EMT/52/2026 without a link |
| 7 | Ajuntament de Guissona | Council | ca | https://www.guissona.cat/serveis-de-guissona/festes/festes-locals-guissona-2024/ | https://www.guissona.cat/es/contacte/ | CAL | A | URL says 2024, content is 2027: an evergreen embed |
| 8 | Ajuntament de la Bisbal d'Empordà | Council | ca | https://labisbal.cat/municipi/calendari-de-festes-2/ | https://labisbal.cat/contacte/formulari-de-contacte/ | CAL | A | Headings say 2027, body and attachment say 2026 |
| 9 | Ajuntament de Torelló | Council | ca | https://torello.cat/les-festes-locals-del-2027-seran-la-segona-pasqua-i-rocaprevera/ | https://torello.cat/el-teu-ajuntament/atencio-a-la-ciutadania/ | CAL, REP | B | They chose Segona Pasqua, the most repeated local day in Catalonia (report) |
| 10 | Ajuntament de Capellades | Council | ca | https://www.capellades.cat/actualitat/noticies/el-ple-aprova-les-festes-locals-per-al-2027.html | https://www.capellades.cat/altres-continguts/contactar | CAL, REP | B | One 2027 local day on a Saturday (6 Feb), rare in the data |
| 11 | Ajuntament de Premià de Dalt | Council | ca | https://www.premiadedalt.cat/news/les-festes-locals-de-premia-de-dalt-per-al-2027-ja-tenen-data | https://www.premiadedalt.cat/contact-info | CAL | B | "Will be included in the official calendar": the embed switches to the DOGC order when it is out |
| 12 | Ajuntament de Castellterçol | Council | ca | https://www.castelltersol.cat/actualitat/noticies/el-ple-determina-les-dues-festes-locals-del-2027.html | https://www.castelltersol.cat/contacte | CAL | B | Mentions the Generalitat calendar without a link |
| 13 | Ajuntament de Canyelles | Council links page | ca | https://www.canyelles.cat/enllacos-dinteres | https://www.canyelles.cat/contacta | CAL, DH | C | Links DOGC, CIDO, BOP but no holiday calendar |
| 14 | Manlleu, Oficina de Promoció Econòmica | Council (commerce) | ca | https://www.manlleu.cat/ope/ca/festius | https://www.manlleu.cat/ope/contacte.htm | CAL, DH | A | Shops need local holidays and working days together |
| 15 | Ajuntament d'Igualada, Comerç | Council (commerce) | ca | https://www.igualada.cat/ca/la-ciutat/comerc-bis/festius-locals-dobertura-comercial | https://www.igualada.cat/ca/contacte | CAL | A | Calendar image, no labour-holiday source |
| 16 | Ajuntament del Vendrell, Comerç | Council links page | ca | https://elvendrell.net/comerc/webs-d-interes | https://elvendrell.net/contacte | CAL, SAL | C | About 31 links, none for holidays or calendars |
| 17 | Ajuntament de Ripollet, Educació | Council (education) | ca | https://www.ripollet.cat/serveis/educacio/calendari-escolar-2023-2024 | generic OAC mailbox on the page (no contact page found) | CAL | A | URL says 2023-2024 for 2026-27 content |
| 18 | Olot Educació | Education portal | ca | https://oloteducacio.cat/calendari-escolar/ | https://oloteducacio.cat/contacte/ | CAL | B | Families need the labour holidays next to the school days |
| 19 | Servei d'Ocupació Municipal de l'Arboç | Council (employment) | ca | https://som.arbocenc.cat/treballadors/enllacos-d-interes | https://som.arbocenc.cat/contactar.html (no form) | SAL, DH | C | Job seekers comparing offers need gross-to-net figures |
| 20 | Consell Comarcal del Vallès Oriental | Consell comarcal | ca | https://www.vallesoriental.cat/la-comarca/festes-locals | https://www.vallesoriental.cat/2028-el-consell/atencio-ciutadana | CAL, REP | A | Serves a 2026 PDF, nothing for 2027; the report's comarca table and the CSV filtered by comarca |
| 21 | Biblioteca Virtual (Xarxa de Biblioteques Municipals, Diputació de Barcelona) | Library | ca | https://bibliotecavirtual.diba.cat/ca/mon-laboral | https://formularis.diba.cat/diba/biblioteques/en/user-assistance | SAL, DH | C | "Món laboral" bookshelf has no payslip or calendar resource |
| 22 | Diari de Terrassa | Local media | ca | https://www.diarideterrassa.com/terrassa/aquests-seran-els-festius-del-2027-consulta-aqui-el-calendari-complet.html | https://www.diarideterrassa.com/contacte/ | CAL, REP | B | Lists the days with no primary source; the report gives the official one and the Catalan context |
| 23 | Ràdio Sabadell | Local media | ca | https://radiosabadell.fm/actualitat/societat/aprovat-calendari-dies-festius-2027-sabadell | https://radiosabadell.fm/contacte | CAL | B | Their list includes 15 Aug and 26 Dec 2027. Ordre EMT/52/2026 lists neither (both are Sundays; checked against our data 18 Nov). Mention it as information, with the order's link |
| 24 | Ràdio Rubí | Local media | ca | https://www.radiorubi.cat/news/el-ple-aprova-el-28-i-el-29-de-juny-com-a-festius-municipals-de-2027/ | https://www.radiorubi.cat/contact/ | CAL, REP | B | Rubí puts both local days back to back (Festa Major) |
| 25 | somMontmeló (diarisom group) | Local media | ca | https://www.sommontmelo.cat/noticia/114083/montmelo-aprova-els-festius-locals-de-2027 | https://www.sommontmelo.cat/contacte | CAL, REP | B | Chose Segona Pasqua "because Barcelona has it": the report's top-date story; the group has sister local editions |
| 26 | Cugat Mèdia | Public local media | ca | https://www.cugat.cat/noticies/aquests-son-els-festius-locals-a-sant-cugat-i-valldoreix-de-2027/ | https://www.cugat.cat/contacte/ | CAL | B | Sant Cugat and Valldoreix have different days: the widget shows the nucleus |
| 27 | TOT Sant Cugat | Local media | ca | https://www.totsantcugat.cat/actualitat/societat/aquests-son-festius-2027-sant-cugat_2236710102.html | https://www.totsantcugat.cat/contacte.html | CAL | B | Static 14-day list; the embed stays current |
| 28 | Eix Diari (Penedès, Garraf) | Comarcal media | ca | https://www.eixdiari.cat/politica/doc/122188/el-ple-de-vilanova-declara-la-sala-be-cultural-dinteres-local-i-aprova-el-dilluns-de-carnaval-com-a-.html | https://www.eixdiari.cat/contactar.html | CAL, REP | B | Vilanova moved Sant Antoni (a Sunday) to Carnival Monday: a "moved day" for the report |
| 29 | AFA Escola Reina Violant (Barcelona) | School AFA | ca | https://afareinaviolant.org/enllacos/ | https://afareinaviolant.org/contacte/ | CAL | C | Links page about 29 entries; school calendar only as a PDF |
| 30 | AFA Escola Les Acàcies | School AFA | ca | https://afa.escolalesacacies.cat/calendari-escolar-2026-2027/ | https://afa.escolalesacacies.cat/contacte/ | CAL | B | Includes La Mercè without marking which days are local |
| 31 | CCOO, secció sindical Ajuntament de Sant Boi | Union | ca | https://ccoo.app/ajuntament-sant-boi-de-llobregat/recordatori-calendari-laboral-2026/ | https://ccoo.app/ajuntament-sant-boi-de-llobregat/contacta/ | CAL, DH | B | Calendar only as image/PDF; staff need working-day counts |
| 32 | UBCI, Unió de Botiguers Congrés-Indians | Commerce association | ca | https://www.ubci.cat/cat/enllacos.html | https://www.ubci.cat/cat/contactar.html | CAL | C | Links directory without a calendar; moderate activity (latest dated news Oct 2025) |
| 33 | Berenguer Assessors (Terrassa) | Gestoria | ca | https://www.berenguerassessors.com/ca/festius-2027-catalunya/ | https://www.berenguerassessors.com/contact-us/ | CAL, SAL, DH | A | Keeps per-town pages; one embed covers every town |
| 34 | BNFIX PICH (Barcelona) | Assessoria / law | ca | https://pich.bnfix.com/ca/publicat-el-calendari-oficial-de-festes-laborals-a-catalunya-pel-2027/ | https://pich.bnfix.com/ca/contacte/ | CAL, REP | B | Said in May that local days "es coneixeran properament", never updated |
| 35 | SRB Assessors (Barcelona) | Assessoria | ca | https://www.srbasesores.com/publicat-el-calendari-de-festes-laborals-per-lany-2027/?lang=ca | https://www.srbasesores.com/contacte/?lang=ca | CAL, DH | B | Tells readers to "add local days separately": the widget does it |
| 36 | Asesoría Piera (El Prat) | Asesoría | es | https://www.asesoriapiera.com/publicado-el-calendario-de-fiestas-laborales-para-el-ano-2027/ | https://www.asesoriapiera.com/contactar/ | CAL, SAL | B | Spain-wide post; local days only generic |
| 37 | Nuño Jiménez Asesores (Madrid, Toledo) | Gestoría | es | https://www.xn--nuoasesores-2db.com/laboral-y-recursos-humanos/calendario-laboral-madrid-2027/ | https://www.xn--nuoasesores-2db.com/contacto/ | CAL (Spain), SAL | B | Per-city series; BOCM named, not linked |
| 38 | Abakon Asesores (Ciudad Real) | Gestoría | es | https://abakonasesores.com/calendario-laboral-ciudad-real/ | https://abakonasesores.com/contacto-abakon-asesores-ciudad-real/ | CAL, DH | B | Local days "pendientes de publicación oficial": the widget updates itself |
| 39 | Conesa Legal (Barcelona) | Payroll / law firm | en | https://www.conesalegal.com/en/info/barcelona-work-calendar | https://www.conesalegal.com/en/contact-online | SAL, DH, CAL | B | English payroll audience, already cites EMT/52/2026 and the BOE |
| 40 | Moving to Barcelona | Expat portal | en | https://www.movingtobarcelona.com/barcelona-links/ | https://www.movingtobarcelona.com/contact/ | CAL (en), SAL | C | Links page with no official holiday resource. **Caution:** has an "Advertise" page and affiliate links. Ask for nothing paid; skip if they ask for money |

**Left out:**
- Sites with "write for us" or advertising-led pages: expatinfodesk.com, Asesoría Edac (serviciosdac.com),
  iSabadell (whose contact link goes to advertising), irBarcelona (tourism, affiliate links).
- Pages that could not be fetched: Badalona (403), Castelldefels school calendar (403), Barcelona International Welcome
  (blocked), a Barcelona Metropolitan article (404). Re-check by hand if wanted.
- Also left out on purpose: big national media, any page behind a login, and aerobusbcn.com (never linked).

**What the research found** (useful for the wording):
- Councils mostly announce the 2027 days in a one-off news item after the plenary vote (May–August). The standing
  pages go stale: slugs or headings with old years (Guissona, Ripollet, Granollers, la Bisbal, l'Aldea).
- Few cite the source. Among councils, only Girona links the DOGC. Local media cite "the plenary".
- The 2027 local order is not out yet. "Council approvals now, the DOGC order the day it is published" is the
  strongest pitch.
- Competing calendar sites already rank for these searches. Our edge is official sourcing, no ads, and the auto-update.

## Message templates (for the owner to adapt; each final text needs approval)

### Catalan (council, consell comarcal, local media, school AFA)

> **Assumpte:** Calendari de festius [2027] de [MUNICIPI] per al vostre web, gratuït i amb la font oficial
>
> Bon dia,
>
> He vist la pàgina [URL DE LA SEVA PÀGINA] amb els festius de [MUNICIPI]. Per si us és útil: a CatalunyaInfo hem
> fet un calendari que es pot enganxar a qualsevol web amb dues línies de codi. Surten els festius de Catalunya i els
> locals de [MUNICIPI], i cada llista porta la seva font oficial (DOGC). S'actualitza sol: quan surti l'ordre de festes
> locals del 2027, apareixerà al vostre web sense tocar res. No porta publicitat, ni galetes, ni seguiment.
>
> El codi és aquí: [URL DE LA PÀGINA "AL TEU WEB" AMB EL MUNICIPI]. Només demanem que es mantingui l'enllaç a la
> font.
>
> [Només per a mitjans:] També hem publicat les dades de tots els festius locals de Catalunya, amb un CSV obert:
> [URL DE L'INFORME]. El dilluns de Pasqua Granada és festa local a 139 municipis, on viu el 44,5 % de la població.
>
> Gràcies, i perdoneu la molèstia.
> [SIGNATURA DEL PROPIETARI]

### Spanish (gestoría, asesoría, HR/payroll blog, union)

> **Asunto:** Calculadora de sueldo neto y de días hábiles para vuestra web, gratis
>
> Hola:
>
> He leído vuestro artículo [URL DE SU PÁGINA]. Por si sirve a vuestros lectores: en CatalunyaInfo tenemos una
> calculadora de sueldo neto 2026 (algoritmo de retenciones de la AEAT y cotizaciones de la Orden PJC/297/2026) y otra
> de días hábiles con los festivos de cada comunidad y municipio (plazos de la Ley 39/2015 incluidos). Se insertan en
> cualquier web con dos líneas de código, sin publicidad, sin cookies y sin seguimiento, y se actualizan solas cuando
> cambian las normas.
>
> El código está aquí: [URL DE LA CALCULADORA]#embed. Solo pedimos mantener el enlace a la fuente que va debajo.
>
> Un saludo,
> [FIRMA DEL PROPIETARIO]

## Tracker (fill in after the owner approves; one line per message)

| # | Approved text (date) | Sent (date, channel) | Follow-up (date) | Reply | Link live (URL, date) |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

## Measuring

- GSC → Links → "Top linking sites": count referring domains on deploy day (UI only, the API does not expose it),
  then monthly. Review 2027-02-18 (`docs/SEO_EXPERIMENTS.md`, entry of 18 Nov 2026).
- Count `/embed/` requests by Referer origin in the Caddy access log (browsers send the host's origin only; no
  cookie, no analytics in the frame). This shows who embeds a widget even before Google counts the link.
- Mentions without a link (radio, press) are still worth noting here: AI answers cite pages that mention us.
