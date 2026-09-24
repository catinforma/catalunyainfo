# CatalunyaInfo — canvis del 24 de setembre de 2026

Complement al document d'estructura que ja tens. **No el substitueix**: només
recull el que ha canviat després d'una auditoria tècnica completa del web.

---

## 1. Tres defectes trobats i corregits

### Googlebot no podia carregar cap imatge del contingut

Totes les imatges es serveixen des de `/_next/image/?url=…`, i el `robots.txt`
tenia `Disallow: /*?*` per mantenir fora els paràmetres de seguiment. També
bloquejava l'optimitzador d'imatges.

Efecte mentre va durar: zero presència a Google Imatges i cap senyal visual per
a Discover, tot i tenir les fotografies correctes i amb llicència. Corregit i
verificat.

### El títol anglès del Festival de Sitges responia una pregunta que ningú feia

Search Console, 14 dies, `/en/events/sitges-film-festival-guide/`:

| Consulta | Impressions | Posició | Clics |
|---|---|---|---|
| sitges film festival 2026 | 8 | 9,0 | 0 |
| sitges film festival 2026 schedule | 7 | 7,0 | 0 |
| sitges film festival 2026 program | 6 | 8,2 | 0 |
| sitges film festival 2026 tickets | 4 | 9,5 | 0 |
| sitges festival 2026 | 4 | 7,5 | 0 |
| sitges film festival 2026 lineup | 3 | 10,7 | 0 |
| when is sitges film festival 2026 | 2 | 9,0 | 0 |
| sitges film festival dates | 2 | 9,0 | 0 |

**45 impressions a la primera pàgina, 1 clic.** Totes les consultes demanen
dates, programa, entrades o repartiment. El títol deia «a first-timer's guide».

L'article ja ho contestava tot. Només el títol no ho deia:

```
abans:  Sitges Film Festival 2026: a first-timer's guide
ara:    Sitges Film Festival 2026: dates, venues and tickets
```

Mesura prevista el 8 i el 22 d'octubre. **Cal comparar CTR a posició igual, no
clics bruts**: el festival és del 8 al 18 d'octubre i l'interès pujarà sol.

### Pàgines gairebé buides anunciades al sitemap

`/temes/` i `/autors/` hi eren amb 23 paraules cadascuna. Fora fins que tinguin
contingut.

---

## 2. AdSense: ara està mesurat

Hi ha una comprovació automàtica que s'executa contra el web en viu. Resultat
del 24/09: **12 comprovacions passen, 2 bloquegen.**

Passen: les sis pàgines de polítiques (entre 358 i 693 paraules cadascuna), 81
URLs indexables, **39 articles comprovats sense cap per sota de 400 paraules**,
cap llistat buit al sitemap, cap codi d'anuncis al web, imatges rastrejables.

Bloquegen dues coses, i **cap de les dues es resol amb contingut**:

1. **Dades identificatives legals absents** a l'avís legal (nom fiscal, NIF,
   adreça). Avui és defensable perquè el web no té activitat comercial; amb
   publicitat, l'article 10 de la LSSI-CE les exigeix.
2. **CMP certificat per Google** amb IAB TCF, necessari per servir anuncis
   personalitzats a usuaris de la UE. El bàner actual és correcte per a
   analítica, no per a publicitat.

---

## 3. Dues troballes que haurien de condicionar l'estratègia

### El senyal més fort no és cap article publicat

Aquests topònims ja posicionen **entre la 1 i la 7** amb una impressió
cadascun, i **no existeix cap pàgina de destinació per a cap d'ells**:

Ripollès · la Quar · Molló · Castellar de n'Hug · Cerdanya · Vall d'Aran ·
Vall d'en Bas · Alt Urgell · Setcases

La secció Destinacions existeix i té tres articles que hi cauen per categoria,
però no hi ha ni una sola pàgina pròpia de cap lloc. És l'actiu més gran sense
tocar.

### El que funciona no és el millor article, és l'únic que s'actualitza

El part setmanal de bolets és el **48 % de tots els clics del web**.

No té millor prosa que la resta. Té una xifra datada, amb font oficial, i es
refresca cada setmana a la mateixa URL. Aquesta és la variable.

Consultes relacionades on ja apareixem sense tenir-ne pàgina:
`mapa bolets catalunya 2026` (pos. 4,4) i `predicció bolets catalunya`
(pos. 20).

---

## 4. Dades de trànsit al dia

Search Console, 7 dies: **92 clics, 1.753 impressions, CTR 5,25 %, posició 6,2**.

| Data | Clics | Impressions |
|---|---|---|
| 17 set | 22 | 197 |
| 18 set | 16 | 235 |
| 19 set | 16 | 245 |
| 20 set | 10 | 273 |
| 21 set | 14 | 281 |
| 22 set | 8 | 314 |
| 23 set | 6 | 208 |

**Els clics baixen mentre les impressions pugen.** No és una caiguda de
rendiment: és Google servint les pàgines noves en més consultes, encara en
posicions baixes de la primera pàgina. La posició mitjana passa de 5,2 a 6,8
per la mateixa raó.

GA4, 10 dies: 78 usuaris, 148 pàgines vistes, mòbil 58 / escriptori 20.
Canals: orgànic 56, directe 10, **AI Assistant 8**, cross-network 4.
