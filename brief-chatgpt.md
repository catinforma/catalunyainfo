# CatalunyaInfo — estat de les visites (29 de setembre de 2026)

Briefing per decidir què fem a continuació. **Cap xifra d'aquest document és
estimada.** Tot surt de Google Search Console i Google Analytics 4, extret avui.

- **Search Console:** 1 – 29 de setembre de 2026 (28 dies).
- **Analytics 4:** 20 – 29 de setembre (9 dies). Consentiment denegat per
  defecte, així que GA4 **infracompta** de manera estructural. Els dos períodes
  no són comparables entre ells.

---

## 0. Llegeix això abans de proposar res sobre el CTR

El CTR agregat d'aquest lloc **no mesura el que sembla**. He mirat les queries
pàgina per pàgina i una part gran de les impressions no són cerques humanes.

Queries que Google atribueix a les nostres pàgines, 15 – 29 de setembre:

| Pàgina | Query | Posició | Clics |
| --- | --- | --- | --- |
| Sitges EN | `d'acord` | 4 | 0 |
| Sitges EN | `japanise` | 4 | 0 |
| Sitges EN | `check again` | 5 | 0 |
| Sitges EN | `si` | 4 | 0 |
| Sitges EN | `oct 10` | 3 | 0 |
| Bolets EN | `avui` | 4 | 0 |
| Bolets EN | `demà` | 3 | 0 |
| Bolets CA | `las dos cosas` | 3 | 0 |
| Bolets CA | `para ir mañana` | 6 | 0 |

`d'acord` vol dir «OK». `check again`, `si`, `las dos cosas` — ningú escriu
això a un cercador. Són fragments conversacionals, seuen a posició 2–6 i no
reben mai cap clic: **sub-consultes generades per IA**, no cerques.

GA4 ho confirma pel seu costat: hi ha un canal **AI Assistant** amb 5 usuaris i
10 sessions en nou dies.

**Conseqüència pràctica:** no proposis reescriure títols basant-te en el CTR
global ni en el CTR d'una pàgina. Només val el CTR de les queries amb nom i
intenció clara. Quan una query real troba la pàgina, això converteix bé:

- `donde hay setas ahora en cataluña 2026` → posició **1,5**, CTR **16,7 %**
- `bolets catalunya 2026` → posició **2,5**, CTR **33 %**

---

## 1. Què és el web

CatalunyaInfo (`https://www.catalunyainfo.com`) — mitjà editorial independent
d'informació pràctica i verificada sobre Catalunya, en **català, castellà i
anglès**, amb la mateixa informació als tres.

URLs: `/{idioma}/{secció}/{slug}/`, sense any al slug, perennes.
Exemple: `/ca/natura/bolets-catalunya-condicions/` ·
`/es/naturaleza/setas-cataluna-condiciones/` ·
`/en/nature/mushroom-season-catalonia/`

Volum actual: **15 peces editorials × 3 idiomes = 45 URLs d'article**, més 30
pàgines institucionals i 12 portades/hubs. **87 URLs al sitemap.**

Objectiu declarat: monetitzar amb AdSense i créixer en visites. La v1 del lloc
va ser rebutjada per AdSense per «low value content», i per això tot el que es
publica ha de ser verificable contra font oficial.

---

## 2. Xifres de capçalera — Search Console, 28 dies

| Mètrica | Valor |
| --- | --- |
| Clics | 191 |
| Impressions | 4.484 |
| CTR | 4,26 % |
| Posició mitjana | 7,3 |

El contingut nou va entrar el **14 de setembre**. Abans i després:

| | 1 – 13 set | 14 – 29 set |
| --- | --- | --- |
| Impressions | 294 | 4.190 |
| Clics | 1 | 190 |

---

## 3. El problema honest: els clics baixen mentre les impressions pugen

| | 14 – 20 set | 22 – 28 set |
| --- | --- | --- |
| Impressions | 1.572 | 2.193 |
| Clics | **105** | **66** |
| CTR | 6,7 % | 3,0 % |

Les impressions creixen un 40 % i els clics cauen un 37 %. Part s'explica per
l'apartat 0 (impressions d'IA que no són humanes). Però **no tot**: 105 → 66
clics és una caiguda real que cal entendre. Hipòtesi oberta: el pic de la
temporada de bolets va ser a mitjans de setembre. No està confirmada.

Impressions per dia: 163 (14 set) → 451 (28 set), rècord. Posició mitjana
oscil·la entre 5,2 i 9,6 sense tendència clara.

---

## 4. Pàgines — Search Console, 15 – 29 de setembre

| URL | Clics | Impr. | CTR | Pos. |
| --- | --- | --- | --- | --- |
| `/es/naturaleza/setas-cataluna-condiciones/` | **60** | 606 | 9,9 % | 3,6 |
| `/ca/natura/bolets-catalunya-condicions/` | **26** | 332 | 7,8 % | 5,2 |
| `/es/agenda/festival-sitges-guia/` | 13 | 359 | 3,6 % | 7,4 |
| `/ca/natura/colors-tardor-catalunya/` | 10 | 153 | 6,5 % | 5,7 |
| `/es/naturaleza/colores-otono-cataluna/` | 10 | 323 | 3,1 % | 6,1 |
| `/` (portada) | 8 | 148 | 5,4 % | 9,6 |
| `/en/nature/mushroom-season-catalonia/` | 8 | 351 | 2,3 % | 5,0 |
| `/es/agenda/que-hacer-este-fin-de-semana-cataluna/` | 8 | 69 | 11,6 % | 10,0 |
| `/en/nature/fall-colors-catalonia/` | 7 | 147 | 4,8 % | 3,9 |
| `/ca/agenda/que-fer-aquest-cap-de-setmana-catalunya/` | 5 | 74 | 6,8 % | 12,7 |
| `/en/events/sitges-film-festival-guide/` | 4 | **496** | **0,8 %** | 7,5 |
| `/es/gastronomia/ferias-gastronomicas-otono-cataluna/` | 3 | 79 | 3,8 % | 6,6 |
| `/es/guias/tasa-turistica-barcelona-cataluna/` | 3 | 114 | 2,6 % | 7,2 |
| `/ca/guies/calendari-laboral-catalunya/` | 2 | 247 | 0,8 % | 7,7 |
| `/es/planes/que-hacer-cataluna-cuando-llueve/` | 2 | 17 | 11,8 % | 5,2 |
| `/es/guias/calendario-laboral-cataluna/` | 1 | 192 | 0,5 % | 16,0 |
| `/en/guides/catalonia-public-holidays/` | 1 | 70 | 1,4 % | 12,7 |

**Concentració:** el part de bolets (ca + es) són **86 dels 191 clics = 45 %**
de tot el lloc.

---

## 5. Les queries reals que guanyem i les que perdem

Del propi informe de queries del part de bolets. **Aquí hi ha la demanda
mesurada, no suposada.**

Guanyem els termes genèrics:

| Query | Posició | CTR |
| --- | --- | --- |
| `donde hay setas ahora en cataluña 2026` | 1,5 | 16,7 % |
| `bolets catalunya 2026` | 2,5 | 33 % |
| `temporada de bolets 2026` | 5,2 | 9,1 % |
| `condicions bolets catalunya` | 2,6 | 0 % |

Perdem els específics:

| Query | Posició | Per què importa |
| --- | --- | --- |
| `bolets vall d'en bas` | **30,3** | Demanda per comarca, no la servim |
| `predicció bolets catalunya` | **16,4** | El nostre propi tema, a pàgina 2 |
| `quants dies després de ploure surten els bolets` | **59** | Pregunta real sense resposta a la pàgina |
| `mapa bolets catalunya 2026` | 7,1 | Demanen un mapa pel seu nom |
| `on trobar bolets aquesta setmana` | 6,2 | Més fluix que el terme genèric |

Altres queries del lloc amb senyal:

- `calendario laboral 2027` → posició 15,7 (tenim la pàgina, no la guanyem)
- `catalunya info` → posició 5,4, 39 impressions, CTR 5,1 % (marca)
- `sitges film festival 2026 dates` → posició 8,3, CTR 7,1 %

---

## 6. Analytics 4 — 20 a 29 de setembre (9 dies)

56 usuaris actius, 68 sessions. Recorda: consentiment denegat per defecte,
la xifra real és més alta.

| Canal | Usuaris | Sessions |
| --- | --- | --- |
| Organic Search | 40 | 47 |
| Direct | 6 | 7 |
| **AI Assistant** | **5** | **10** |
| Cross-network | 3 | 3 |
| Unassigned | 2 | 2 |

Dispositiu: mòbil 33 · escriptori 20 · tauleta 2.

Temps d'interacció (segons acumulats / vistes):

| Pàgina | Vistes | Segons | Mitjana |
| --- | --- | --- | --- |
| `/es/naturaleza/setas-cataluna-condiciones/` | 30 | 1.107 | 37 s |
| `/es/agenda/festival-sitges-guia/` | 10 | 566 | 57 s |
| `/es/naturaleza/colores-otono-cataluna/` | 4 | 238 | 60 s |
| `/es/agenda/que-hacer-este-fin-de-semana-cataluna/` | 4 | 143 | 36 s |

La gent que arriba, llegeix. No hi ha problema de contingut.

---

## 7. Indexació

Al 25 de setembre: 30 de 80 URLs inspeccionades estaven indexades. Causa: el
sitemap no s'havia tornat a descarregar des del 17 de setembre. Resubmès.

Avui: **~67 de 87 indexades**. Queda fora:

- **Contingut (5):** castanyada ca i es, fires gastronòmiques ca i en, Sitges ca.
  Se'ls han afegit enllaços interns des de les pàgines fortes el 28 de setembre;
  revisió prevista ~5 d'octubre. La castanyada és el 31 d'octubre: si no
  s'indexa abans del 20 d'octubre, la finestra es perd.
- **Institucionals (13):** `qui-som`, `about`, `contact`, índexs legals i sis
  legals soltes. Indiferent per a AdSense: el revisor hi arriba per enllaç.
- **`/ca/`:** marcada com a duplicat de `/`. Causa identificada (el 307 de
  negociació d'idioma). No es toca: un 308 cachearia l'idioma d'un visitant per
  a tots els següents.

Auditoria d'enllaços interns: **0 trencats, 0 orfes, 0 fugues entre idiomes.**

---

## 8. Finestres de mesura congelades — no proposis tocar-ho

| Fins | Què |
| --- | --- |
| 8 d'octubre | Títol de Sitges EN (canviat el 24 set). Festival 8–18 oct |
| 22 d'octubre | Títols del calendari laboral (publicat 24 set) |
| 23 d'octubre | Títols de la taxa turística (publicat 25 set) |

Regla del projecte: **un sol canvi per finestra de mesura**, i mai dos canvis a
la mateixa pàgina en menys de 28 dies. Si no, res és atribuïble.

---

## 9. Què necessito de tu

Tenint en compte tot l'anterior, i sobretot l'apartat 0 i l'apartat 5:

1. **Quin hauria de ser el pròxim paquet de contingut?** L'evidència apunta a
   aprofundir on ja som autoritat (bolets: comarques + preguntes) abans
   d'obrir temes nous. Contradiu-me si veus una raó millor.
2. **Per què cauen els clics de 105 a 66** mentre les impressions pugen? La
   hipòtesi de l'estacionalitat dels bolets no està confirmada.
3. **Com hauríem de segmentar el reporting** perquè el soroll d'IA no ens torni
   a enganyar cada setmana.
4. **Com competir per `predicció bolets catalunya`** (posició 16) i per les
   queries de comarca, sense canibalitzar el part que ja rankeja a posició 3,6.

### Restriccions que no es poden saltar

- **No inventar dades.** Cap xifra, data, preu, horari, normativa o coordenada
  sense font oficial verificable. És el motiu pel qual AdSense va rebutjar la v1.
- **Cada article ha de tenir com a mínim 1 foto**, com a imatge principal. Sense
  foto no es publica: el publicador ho rebutja. Cada paquet editorial ha de
  portar la foto (amb llicència i atribució) o no està complet.
- **Imatges:** només CC0, CC BY, CC BY-SA, domini públic o GFDL. NC i ND
  rebutjades. Atribució obligatòria a la pàgina.
- **URLs perennes**, sense any al slug.
- Res de contingut de notícies autogenerat.
