# CatalunyaInfo — pla x100

Escrit el 7 d'octubre de 2026 a partir de Search Console, GA4, l'auditoria
`npm run site:audit` i recerca sobre AdSense. Cap xifra d'aquest document és
inventada; les que són estimacions estan marcades com a estimació.

---

## 0. La veritat de partida, en números

| Mètrica (28 dies, 9 set – 7 oct) | Valor |
| --- | --- |
| Clics de Google | **273** (~10/dia) |
| Impressions | **8.601** |
| CTR | 3,2 % |
| URLs al sitemap | 117 (39 peces × 3 idiomes + institucionals) |
| Usuaris GA4 (9 dies) | ~63 (consentiment denegat per defecte: infracompta) |

**x100 vol dir passar de ~300 clics al mes a ~30.000.** És possible, però no
publicant més del mateix. Les dades de les últimes tres setmanes ensenyen
exactament què funciona en aquest web i què no.

### Què ha funcionat (mesurat)

| Patró | Prova |
| --- | --- |
| Pàgina de **«ara mateix»** amb dades oficials | Setas ES: posició 1,2, CTR 21 % a `donde hay setas ahora` |
| **Utilitat** amb calculadora/selector | Targetes de transport EN: 1 → 488 impressions en 8 dies; taxa turística: 37-40 s de lectura |
| **Barcelona pràctic en anglès** | Transport EN ja és la 2a pàgina del web la seva primera setmana |

### Què ha fallat (mesurat)

| Fallada | Cost |
| --- | --- |
| Pàgina «setmanal» que no s'actualitza | Setas ES: 25 clics/setmana → **0** |
| Pàgina «aquest cap de setmana» datada | Mostrava el 19-20 de setembre el 7 d'octubre |
| Respondre la pregunta equivocada | Calendari laboral: 772 impressions/setmana, **4 clics** |

**Conclusió:** el multiplicador d'aquest web no és el nombre d'articles. És el
nombre de pàgines que **(a)** responen una pregunta recurrent, **(b)** amb dades
oficials, **(c)** que s'actualitzen soles.

---

## 1. La matemàtica dels diners (sense maquillatge)

Page RPM d'AdSense per a trànsit espanyol de viatges: no hi ha cap xifra oficial
publicada. Rang raonable: **€2–15 per 1.000 pàgines vistes** (estimació, a partir
de [adstimate](https://adstimate.com/blog/highest-paying-adsense-niches.html) i
[techconda](https://www.techconda.com/2026/02/adsense-rpm-benchmarks.html)). El
trànsit **anglès de fora d'Espanya** paga diverses vegades més que el de
llatinoamèrica i bastant més que l'espanyol.

| Escenari | Pàgines vistes/mes | Ingressos/mes a €4 RPM | a €10 RPM |
| --- | --- | --- | --- |
| Avui | ~400 | €1,6 | €4 |
| x10 | ~4.000 | €16 | €40 |
| **x100** | ~40.000 | **€160** | **€400** |
| x500 | ~200.000 | €800 | €2.000 |

**Llegiu-ho dues vegades:** fins i tot x100 són centenars d'euros al mes, no
milers. Els diners de debò en aquest sector venen de **trànsit anglès amb
intenció de compra** (afiliació: entrades, Hola Barcelona, allotjament,
excursions) més que no pas d'AdSense sol. El pla està pensat perquè AdSense i
afiliació creixin junts sobre el mateix trànsit.

---

## 2. Bloquejants d'AdSense — estat real

`npm run adsense:check`: 11 PASS, **2 FAIL**.

| Bloquejant | Qui ho resol | Què cal |
| --- | --- | --- |
| **Identitat de l'editor** (LSSI-CE art. 10) | **Tu** | Nom o raó social, NIF i adreça a `src/lib/content/pages/operator.ts`. És obligatori per llei en el moment que el web porta publicitat. Sense això no s'ha d'aplicar. |
| **CMP certificat (TCF)** per a anuncis personalitzats a l'EEA | Tu, a AdSense | **No cal construir-lo.** Google el dona: AdSense → *Privacy & messaging* → missatge de regulacions europees. Està certificat ([Google](https://support.google.com/adsense/answer/13554116)). Obligatori des del 16/01/2024. |
| `ads.txt` | Jo, quan tinguis el `pub-ID` | Una línia. Ruta ja preparable. |

Requisits oficials d'elegibilitat ([Google](https://support.google.com/adsense/answer/9724)):
contingut propi, original i d'alta qualitat; complir les polítiques; accés a
l'HTML; majoria d'edat. **No hi ha mínim oficial d'articles ni de paraules** —
les xifres que circulen (20 articles, 800 paraules, 6 mesos) són de blogs, no de
Google.

**El risc real per a CatalunyaInfo és el mateix que va fer caure la v1: «low
value content».** I aquí hi ha una tensió que s'ha de gestionar:

> Les pàgines que més creixen (agenda, festius, bolets) llegeixen dades
> d'altres. Si el web es converteix en un agregador, el revisor hi veurà
> exactament el que va rebutjar la primera vegada.

Regla que proposo i que ja apliquen les pàgines noves: **cada llistat de dades
va embolcallat de guia original** (com triar, què mirar, quan no anar-hi) i cap
pàgina és només una taula. L'agenda del cap de setmana en té cinc seccions.

**Quan aplicar:** quan (1) la identitat de l'editor estigui publicada, (2) el
trànsit sigui estable 2-3 setmanes seguides, (3) l'auditoria estigui neta.
Estimació: **principis de novembre**.

---

## 3. Fet en aquesta sessió (7 d'octubre)

| Canvi | Efecte mesurat |
| --- | --- |
| **Agenda del cap de setmana en directe** (Agenda Cultural, dades obertes) | Mai més una pàgina datada. Primer resultat: 180 activitats, 88 municipis, 39 gratuïtes, pont del 9-12 d'octubre |
| **Festius locals de 1.398 municipis i nuclis** (dades obertes) | Una sola pàgina cercable, no 947 pàgines porta; «és festiu avui» diu també on és festa local |
| **Part de bolets autoalimentat** (Meteocat XEMA) | Test que trenca el build si passa de 10 dies |
| **Títols amb pressupost de 60 caràcters** | 39 títols tallats → 9 (les que queden són experiments congelats) |
| **Hubs amb títol i descripció** | 9 pàgines sense descripció → 0 |
| **Font del cos `optional`, hero amb `preload` de Next 16** | Treu el repintat tardà del paràgraf principal |
| **Contrast WCAG AA** | 13 errors → 0; accessibilitat 97 |
| **Edicions primes ampliades** amb dades d'accés verificades | 6 avisos → 0 a `adsense:check` |
| **`ads.txt`** llest per al `pub-ID` | Una variable d'entorn i actiu |
| **`llms.txt`** generat de la base de dades | Mapa per als assistents d'IA |
| **`npm run site:audit`** | Auditoria de cada URL en 1 minut |
| Error a `adsense:check` corregit | Reportava FAIL de consentiment per una comparació de majúscules |

### Lighthouse, mòbil (simulat)

| Pàgina | Rendiment | SEO | Accessibilitat | Bones pràctiques | CLS |
| --- | --- | --- | --- | --- | --- |
| Part de bolets | 92 | 100 | 97 | 100 | 0 |
| Colors de tardor | 88 | 100 | 97 | 100 | 0 |
| Portada | 89 | 100 | 97 | 100 | 0 |

LCP queda a ~3,5 s en mòbil simulat: és la descàrrega de la imatge principal
(ja en AVIF i precarregada). El següent pas són dades de camp de CrUX, que
arribaran quan hi hagi prou trànsit.

### AdSense: on som

`npm run adsense:check`: **12 PASS, 1 avís, 1 FAIL**. L'únic FAIL és la
identitat de l'editor, i només la pots posar tu.

### Afegit el 7 d'octubre al vespre

| Canvi | Per què |
| --- | --- |
| **Franja «Útil ara mateix» a la portada** (7 eines, ordre per idioma) | La portada EN retenia ~1,4 s per visita; les eines que retenen no hi eren |
| **Embassaments avui** (ACA, `gn9e-3qhr`, diari) | Oportunitat núm. 1 de la recerca; files històriques corruptes descartades per validació |
| Informe `reports/Oportunitats de trànsit CatalunyaInfo.md` | 12 oportunitats ordenades, polítiques Google/AdSense, afiliació |

**Nou per a AdSense (de la recerca):** el CMP ha de ser TCF **v2.3** (consentiments des de l'1/3/2026); el botó «Rebutjar» igual de visible que «Acceptar» (AEPD); l'avís legal en els tres idiomes abans de sol·licitar.

## 4. Les palanques, per impacte esperat

### Palanca 1 — Dades oficials que no envelleixen (×10-20)

Ja tenim tres fonts oficials connectades. N'hi ha més al mateix portal:

| Producte | Font | Demanda observada |
| --- | --- | --- |
| **Festius locals de cada municipi** | `b4eh-r8up`: 2.794 dates, 1.398 nuclis, 2026 | Centenars de queries «festivo [dia] [lloc]», posició 50-99 avui |
| **Què fer aquest cap de setmana a [ciutat/comarca]** | Agenda cultural, ja connectada | `que hacer este fin de semana en girona`, etc. |
| **Neu aquesta setmana** | FGC / Meteocat | Temporada desembre-abril; la guia de neu ja n'és la pàgina mare |

**Precaució:** 947 pàgines de municipi serien pàgines porta (doorway). Proposta
segura: **una** pàgina de festius locals, completa i cercable, i que «és festiu
avui» digui també en quins municipis és festiu local avui. Les pàgines per
ciutat, només per a les 10-15 ciutats grans i només si tenen contingut propi.

### Palanca 2 — Barcelona pràctic en anglès (×5-10, i el millor RPM)

Prova ja feta: targetes de transport EN, 488 impressions la primera setmana.

Prioritat de paquets editorials:
1. **Aeroport → centre** (el terme de més volum que falta)
2. Barcelona amb nens / dies de pluja / dilluns tancats
3. Sagrada Família / Park Güell: entrades i horaris (dades oficials, enllaç d'afiliació possible)
4. Barcelona → Girona / Montserrat / Sitges en tren (ja en tenim part)

### Palanca 3 — Convertir les impressions que ja tenim (×2-3)

**772 impressions/setmana al calendari laboral amb 4 clics.** Quan s'obri la
finestra el **22 d'octubre**, el títol ha de dir «2026 i 2027» i «per municipis»
(si s'ha fet la palanca 1). Sitges EN: mesura demà.

### Palanca 4 — Calendari estacional amb antelació (×2 en els pics)

Les pàgines triguen 2-10 dies a indexar-se. Publicar **4-6 setmanes abans**:

| Pic | Publicar abans de |
| --- | --- |
| Castanyada (31 oct) | **ja publicada**; ES encara no indexada |
| Mercats de Nadal | 15 nov (quan hi hagi dates oficials) |
| Neu | 20 nov |
| Reis / cavalcades | 1 des |
| Sant Jordi | 15 mar |

### Palanca 5 — Discover i IA (variable, pot ser gran)

- GA4 ja mostra **AI Assistant** com a canal (6 usuaris/setmana). Les pàgines
  amb resposta directa i font oficial són les que els assistents citen.
- Discover premia imatges grans (≥1200 px), títols clars i frescor. Les
  pàgines «en directe» són candidates naturals.

---

## 5. Calendari de 4 setmanes

| Setmana | Tasca | Qui |
| --- | --- | --- |
| 8-14 oct | Mesura Sitges (8). Festius locals: pàgina única + «avui és festiu a…» | Jo |
| 8-14 oct | **Publicar la identitat de l'editor** | **Tu** |
| 15-21 oct | Agenda per a Barcelona, Girona, Tarragona, Lleida (si la general rendeix) | Jo |
| 15-21 oct | Paquet **aeroport EN** | ChatGPT → jo |
| 22-28 oct | Obrir calendari laboral: títol i intenció | Jo |
| 29 oct - 4 nov | Auditoria neta, trànsit estable → **sol·licitud AdSense** | Tu |

---

## 6. El que no farem

- **Publicar per publicar.** El batch02 va aportar ~20 clics la primera setmana;
  bé, però no és el multiplicador.
- **Pàgines porta.** Cap pàgina generada només per contenir un nom de poble.
- **Dades no verificades.** Ni preus de revenedors, ni dates de l'any anterior,
  ni «hi ha bolets».
- **Anuncis abans d'aprovació**, ni més d'un bloc per pantalla després.

---

## 7. Com sabrem si va bé

Cada dilluns, amb `npm run growth:report` i `npm run site:audit`:

- **Clics qualificats** (no el CTR global, que està contaminat per fragments d'IA)
- Pàgines al top-10 i a 11-20
- Pàgines «en directe»: que totes mostrin dades de menys de 10 dies
- Auditoria: zero errors nous
