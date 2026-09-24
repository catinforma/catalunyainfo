# CatalunyaInfo — estructura del web

**Actualitzat: 24 de setembre de 2026, després d'una auditoria tècnica completa.**

Document d'estat per decidir estratègia de monetització amb AdSense i creixement
de trànsit. Totes les xifres són reals, extretes de Search Console, Google
Analytics 4 i del propi web el 24/09/2026. Cap dada és estimada.

---

## 1. Resum en una pantalla

| | |
|---|---|
| Domini | `https://www.catalunyainfo.com` (host canònic únic) |
| Idiomes | Català, castellà, anglès — mateix contingut, no traducció parcial |
| URLs indexables | **81** (27 per idioma) |
| Articles editorials | **13** (× 3 idiomes = 39 edicions) |
| Pàgines institucionals | 10 (× 3 = 30) |
| Clics de cerca, últims 7 dies | **92** |
| Impressions, últims 7 dies | **1.753** |
| Posició mitjana | 6,2 |
| AdSense | **No sol·licitat encara.** Cap codi d'anuncis al web |
| Estat legal per a activitat comercial | **Incomplet** — vegeu §7 |

---

## 2. Arquitectura d'URL

Patró únic: `/{idioma}/{secció}/{slug}/`

- Sempre amb barra final.
- Mai paràmetres de consulta per al contingut.
- **Mai l'any al slug**: els articles s'actualitzen al mateix lloc en comptes
  de generar una URL nova cada temporada.
- Cada URL té canonical propi, 4 `hreflang` (ca, es, en, x-default) i schema
  `Article` + `BreadcrumbList`.

Exemple del mateix article als tres idiomes:

```
/ca/natura/bolets-catalunya-condicions/
/es/naturaleza/setas-cataluna-condiciones/
/en/nature/mushroom-season-catalonia/
```

Les seccions són localitzades: `escapades` / `escapadas` / `day-trips`.

---

## 3. Inventari de contingut

### 3.1 Articles publicats (13)

| # | Article | Secció | Paraules (ca/es/en) | Tipus |
|---|---|---|---|---|
| 1 | Condicions per als bolets | natura | setmanal | **Recurrent** |
| 2 | Colors de tardor | natura | ~900 | Estacional |
| 3 | Què fer aquest cap de setmana | agenda | ~1.500 | **Recurrent** |
| 4 | Catalunya sense cotxe: 12 escapades en tren | escapades | 1152 / 969 / 889 | Perenne |
| 5 | La Catalunya de Gaudí menys coneguda | cultura | 913 / 747 / 737 | Perenne |
| 6 | 10 pobles medievals | pobles | 946 / 796 / 871 | Perenne |
| 7 | Festival de Sitges: guia | agenda | 819 / 735 / 618 | Anual |
| 8 | Fires gastronòmiques de tardor | gastronomia | 947 / 854 / 815 | Estacional |
| 9 | La Castanyada | tradicions | 979 / 920 / 770 | Estacional |
| 10 | Més enllà de Montserrat | escapades | 791 / 657 / 692 | Perenne |
| 11 | Barcelona sense trampes per a turistes | barcelona | 924 / 855 / 857 | Perenne |
| 12 | 15 llocs sorprenents | llocs | 1044 / 891 / 989 | Perenne |
| 13 | 20 plans per a un dia de pluja | plans | 762 / 711 / 739 | Perenne |

Cap article baixa de 600 paraules en cap idioma. Tots citen fonts oficials
enllaçades i porten data de verificació visible.

### 3.2 Pàgines institucionals (10)

Hub legal, avís legal, privadesa, galetes, política editorial, correccions,
fonts, accessibilitat, qui som, contacte. Totes als tres idiomes.

El **formulari de contacte funciona**: desa a base de dades, té protecció
antispam (honeypot, temps mínim d'emplenament, límit per adreça) i safata de
lectura al panell d'administració.

### 3.3 Imatges

- 7 articles amb **fotografies reals** de Wikimedia Commons, amb autor,
  llicència i enllaç a l'original impresos sota cada foto.
- 6 articles amb il·lustracions generades amb IA, **identificades com a tals**
  al peu de cada imatge, als tres idiomes.
- Només s'accepten llicències CC0, CC BY, CC BY-SA, domini públic i GFDL. Les
  NC i ND es rebutgen automàticament perquè no encaixen amb un web que pot
  portar publicitat.

---

## 4. Navegació

Menú actual: **Destinacions, Guies, Agenda**.

És dinàmic: una secció apareix al menú només si té contingut, i torna a
aparèixer sola el dia que se'n publiqui el primer article. Actualitat i Rutes
estan ocultes perquè són buides.

Distribució actual per hub:

| Hub | Articles |
|---|---|
| Guies | 13 |
| Destinacions | 3 |
| Agenda | 3 |
| Actualitat | 0 (oculta) |
| Rutes | 0 (oculta) |

Un article pot aparèixer a més d'un hub segons la seva categoria.

---

## 5. Estat tècnic

| Àmbit | Estat |
|---|---|
| Framework | Next.js 16, React 19, TypeScript estricte |
| Renderitzat | Estàtic + ISR. **Cap pàgina depèn de JavaScript per mostrar text** |
| Allotjament | Vercel, funcions a París (UE) |
| Base de dades | Neon (Postgres) |
| Sitemap | 81 URLs, 0 duplicats, 0 errors 404 |
| `robots.txt` | Correcte; previsualitzacions i `*.vercel.app` mai indexables |
| Enllaços interns | 0 trencats, 0 orfes, 0 fuites entre idiomes (verificat) |
| Imatges rastrejables | Sí (corregit el 24/09; abans estaven bloquejades) |
| Redireccions heretades | 22 × 308 i 42 × 410 des de la versió 1 |
| Core Web Vitals | Sense desbordament a 320 i 390 px; imatges amb mida definida |
| Capçaleres de seguretat | CSP, HSTS, X-Content-Type-Options, Referrer-Policy |
| Analítica | GA4 amb Consent Mode v2, denegat per defecte |
| Galetes | Cap galeta de tercers abans del consentiment |

---

## 6. Trànsit real

### Search Console, últims 7 dies

| Mètrica | Valor |
|---|---|
| Clics | 92 |
| Impressions | 1.753 |
| CTR | 5,25 % |
| Posició mitjana | 6,2 |

Evolució: el 10 de setembre el web feia **0 clics/dia**. Els articles es van
començar a publicar el 13 de setembre.

| Data | Clics | Impressions |
|---|---|---|
| 17 set | 22 | 197 |
| 18 set | 16 | 235 |
| 19 set | 16 | 245 |
| 20 set | 10 | 273 |
| 21 set | 14 | 281 |
| 22 set | 8 | 314 |
| 23 set | 6 | 208 |

> Lectura important: els últims dies **baixen els clics mentre pugen les
> impressions**. És el que passa quan Google comença a servir pàgines noves en
> més consultes però encara en posicions baixes de la primera pàgina. No és una
> caiguda de rendiment; és ampliació de cobertura.

### Pàgines amb més clics (7 dies)

| Pàgina | Clics | Impr. | Posició |
|---|---|---|---|
| Bolets ES | 30 | 318 | 3,8 |
| Bolets CA | 14 | 138 | 5,4 |
| Festival de Sitges ES | 8 | 190 | 6,9 |
| Colors de tardor CA | 7 | 93 | 5,8 |
| Cap de setmana ES | 6 | 43 | 8,5 |
| Colors de tardor ES | 6 | 201 | 6,0 |
| Bolets EN | 5 | 209 | 5,3 |

### GA4 (10 dies)

78 usuaris, 148 pàgines vistes. Mòbil 58 / escriptori 20. Canals: orgànic 56,
directe 10, **AI Assistant 8**, cross-network 4.

Temps de lectura: bolets ES 37 s/vista, cap de setmana ES 59 s, Sitges ES 50 s.

> GA4 sempre dirà menys que Search Console: només mesura qui accepta el bàner
> de galetes. Per a volum, la font és Search Console.

---

## 7. AdSense: mesurat, no estimat

La versió 1 d'aquest web **va ser rebutjada per "contingut de poc valor"**: eren
42 notícies generades automàticament. Aquest és el context que qualsevol
estratègia ha de respectar.

Hi ha una comprovació automàtica (`npm run adsense:check`) que s'executa contra
el web en viu. Resultat del 24/09/2026: **12 comprovacions passen, 2 bloquegen.**

### Passa

| Comprovació | Resultat |
|---|---|
| Avís legal | 539 paraules |
| Política de privadesa | 693 paraules |
| Política de galetes | 364 paraules |
| Política editorial | 471 paraules |
| Qui som | 375 paraules |
| Contacte | 358 paraules, amb formulari funcional |
| URLs indexables | 81 al sitemap |
| Articles prims | 39 articles comprovats, **cap per sota de 400 paraules** |
| Llistats buits | Cap al sitemap |
| Codi d'anuncis | Cap al web, que és el correcte abans de sol·licitar |
| Imatges rastrejables | Sí |

### Bloqueja

**1. Dades identificatives legals absents.** Falten nom fiscal, NIF i adreça
postal. Són tres camps a `src/lib/content/pages/operator.ts` i es publiquen
sols als tres idiomes. Avui és defensable perquè el web no té activitat
comercial; **amb publicitat deixa de ser-ho**, perquè l'article 10 de la Llei
34/2002 (LSSI-CE) els exigeix.

**2. Consentiment per a anuncis.** El bàner actual és una eina de consentiment
pròpia, correcta per a analítica. Per servir **anuncis personalitzats a usuaris
de la UE cal un CMP certificat per Google** integrat amb l'IAB TCF. És feina
addicional, no un interruptor.

### Corregit el 24 de setembre

Tres defectes trobats en l'auditoria i ja resolts:

- **Googlebot no podia carregar cap imatge del contingut.** Totes es serveixen
  des de `/_next/image/?url=…` i el `robots.txt` tenia `Disallow: /*?*`.
- **Títol anglès del Festival de Sitges.** 45 impressions a posicions 7–10 i 1
  clic: les consultes demanaven dates, programa i entrades, i el títol prometia
  "a first-timer's guide". Canviat a "dates, venues and tickets".
- **Pàgines buides al sitemap.** `/temes/` i `/autors/` s'hi anunciaven amb 23
  paraules. Fora fins que tinguin contingut.

## 8. Buits que les dades assenyalen

Consultes on el web ja apareix sense tenir-ne pàgina dedicada:

- `mapa bolets catalunya 2026` — posició 5,7
- `predicció bolets catalunya`
- `donde hay setas ahora en cataluña 2026` — posició 2,1, ja converteix
- `entradas festival sitges`, `abonos sitges 2026`
- Topònims solts sense pàgina de destinació: Ripollès, Setcases, Castellar de
  n'Hug, Molló, Cerdanya, Alt Urgell

Seccions sense cap contingut: **actualitat i rutes**.

**El senyal més fort, i el menys explotat.** Aquests topònims ja posicionen
entre la 1 i la 7 amb una sola impressió cadascun, i **no tenen cap pàgina de
destinació**: Ripollès, la Quar, Molló, Castellar de n'Hug, Cerdanya, Vall
d'Aran, Vall d'en Bas. Destinacions és una secció que existeix, té tres
articles que hi cauen per categoria, i cap pàgina pròpia de cap lloc.

**El que ja funciona, i per què.** El part de bolets és el **48 % de tots els
clics del web**. No és el millor article; és l'únic que s'actualitza cada
setmana amb una xifra datada i amb font. Aquesta és la variable, no la
qualitat de la prosa.

Idiomes: l'anglès genera moltes impressions (209 i 293 en els dos articles
principals) i pocs clics. Hi ha un problema de títol o d'intenció, no de
posició.

---

## 9. Regles editorials innegociables

Qualsevol proposta ha de complir-les o no es pot publicar:

1. **No inventar dades.** Ni xifres, dates, horaris, preus, percentatges ni
   normativa. Si no es pot verificar contra font oficial o primària, no es
   publica. Es diu "consulta horaris actualitzats" abans que inventar-los.
2. **Font oficial enllaçada sempre.** Enllaços nets, sense `utm_`.
3. **Finestres temporals, mai dates de màxim garantides.**
4. **Tres idiomes amb el mateix contingut.**
5. **URL perenne, sense any.**
6. **Imatges**: les generades amb IA s'identifiquen al peu; les fotografies
   porten autor i llicència. Cap imatge amb drets reservats.
7. **Res es publica automàticament.** Revisió humana sempre.
8. Sense keyword stuffing, sense 20 FAQ de farciment, sense contingut inflat.

Aquestes regles no són preferències estètiques: són el que separa aquest web de
la versió que Google va rebutjar.

---

## 10. Què necessito de tu

Estratègia per arribar a AdSense aprovat i multiplicar el trànsit, tenint en
compte que:

- El model que ja funciona és el **contingut recurrent** (el part setmanal de
  bolets és el 48 % dels clics del web).
- El contingut perenne acaba de publicar-se i encara no ha madurat a Google.
- Hi ha dues seccions buides que es poden omplir.
- L'anglès té impressions però no converteix.

Per a cada proposta, dona'm: què ataca, per què les dades ho justifiquen, i si
és perenne o recurrent. No proposis res que requereixi inventar dades ni
augmentar el volum amb contingut de farciment: això és exactament el que va fer
rebutjar la versió 1.
