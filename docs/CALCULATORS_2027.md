# Calculators: 2027 figures, guards and watch-list

Read on 21 Nov 2026 (BOE daily summaries 22 Sep–21 Nov 2026 read in full, the BOE XML of every norm cited, the consolidated LGSS by
block, the AEAT withholding page, Seguridad Social bases and revaluation pages, SEPE annual amounts). Code: `src/lib/programmatic/<module>/`.
The page block and its data are in `calculators/year-2027.ts`, and `tests/calculators-2027.test.ts` holds them to the BOE fixtures.
**Status** is one of: **OFFICIAL** (a 2027 norm prints it), **LAW** (the law already fixes the 2027 figure),
**DERIVED** (arithmetic on an official figure and a rule the norm states), **pending** (left to a future instrument; never estimated),
or **no yearly figure**. "Last" is last year's instrument and its BOE day, which is the only evidence we have of timing.

DOGC: its web front is JavaScript-only and could not be searched with curl today. The Catalan rows rely on the modules' own reading
of the Portal Jurídic (19 Nov 2026) and on the BOE's republication of Catalan acts (Ley 10/2026 and Ley 11/2026 appeared on 17 Nov).

| # | Figure | Code (calculators) | 2026 value in code (source) | Guard | 21 Nov 2026 | Instrument for 2027 · last | Watch |
|---|---|---|---|---|---|---|---|
| 1 | SMI | `smi/rules.ts` OFFICIAL_2027; 2026 in `employment/rules.ts` SMI_*, `widow-pension`, `unemployment-subsidy`, `self-employed` SMI_ANNUAL | 1.221 €/month, 17.094 €/yr (RD 126/2026) | OFFICIAL_2027_DUE 15 Jan 2027; modules' RULES_UNTIL 1 Jan | **OFFICIAL** 1.286 €/month, 18.004 €/yr, 42,87 €/day (RD 1013/2026, BOE 19 Nov, BOE-A-2026-24189) | Royal decree · 2026: RD 126/2026, BOE 19 Feb | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-24189 |
| 2 | IRPF earned-income deduction (DA 61.ª LIRPF) and its withholding (RIRPF 85.3) | `net-salary/rules-2026.ts` SMI_DEDUCTION (net-salary, extra-pay) | 590,89 € up to 17.094 €, 0 from 20.048,45 € | SALARY_RULES_UNTIL 1 Jan 2027 | **OFFICIAL** 1.033,58 € up to 18.004 €, 0 from 23.171,89 € (RDL 38/2026 arts. 5–6, BOE 18 Nov; effects 1 Jan 2027). Convalidation pending: guard 18 Dec | RDL · 2026: RDL 5/2026 (17 Feb), art. 28 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-24120 |
| 3 | IRPF withholding algorithm (state scale, reductions, minimums) | `net-salary/rules-2026.ts` IRPF | 2026 algorithm, version of 10 Sep 2026 | SALARY_RULES_UNTIL 1 Jan 2027 | pending (only the 2026 files on the AEAT page) | AEAT algorithm; no fixed day | https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml |
| 4 | State IRPF scale (LIRPF arts. 63, 101) | `net-salary` IRPF.scale | 19–47 % | as row 3 | no change published | Act of Parliament only | https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764 |
| 5 | Catalan IRPF scale | not used by any calculator (withholding applies one state scale) | n/a | n/a | n/a | Catalan budget or tax-measures act (DOGC) | https://dogc.gencat.cat/ca/ |
| 6 | Maximum contribution base | `net-salary` SOCIAL_SECURITY.maxBaseMonthly, `employment` MAX_CONTRIBUTION_BASE, `sick-leave` MAX_BASE_2026, `self-employed` MAX_BASE | 5.101,20 €/month (Orden PJC/297/2026) | modules' RULES_UNTIL 1 Jan 2027 | pending. LGSS DT 38.ª fixes the formula (revaluation % + 1,2 points) but leaves the figure to the budget act | Budget act or RDL + contribution order · 2026: Orden PJC/297/2026, BOE 31 Mar | https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537 |
| 7 | Minimum contribution base | `net-salary` minBaseMonthly, `employment` MIN_CONTRIBUTION_BASE, `self-employed` CORPORATE_MIN_BASE | 1.424,40 €/month | as row 6 | pending. LGSS art. 19.2 ties it to the SMI + 1/6 "salvo disposición expresa"; the order prints the figure (2026: 1.424,40, not 1.424,50) | contribution order · as row 6 | as row 6 |
| 8 | Worker's contribution rates (CC 4,70; unemployment 1,55/1,60; FP 0,10) and the 4,85 % on benefits | `net-salary` SOCIAL_SECURITY.rates, `employment` BENEFIT_SS_RATE | Orden PJC/297/2026 | as row 6 | pending | as row 6 | as row 6 |
| 9 | MEI | `net-salary` intergenerationalEquity, `self-employed` RATES/STATUS_2027 | 0,90 (0,75 + 0,15) | as row 6 | **LAW** 1 point: 0,83 employer + 0,17 worker (LGSS DT 43.ª) | already in the LGSS | https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#dt-14 |
| 10 | Solidarity contribution | `net-salary` SOCIAL_SECURITY.solidarity | worker 0,19/0,21/0,24 (total 1,15/1,25/1,46) | as row 6 | **LAW** total 1,38/1,50/1,75 (LGSS DT 42.ª). The worker's share and the € bands come with the order and the 2027 maximum base | already in the LGSS | https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#dt-13 |
| 11 | Self-employed bands and bases | `self-employed/rules-2026.ts` BANDS_2026 | 15 bands, 653,59–5.101,20 € (RDL 3/2026 art. 3) | STATUS_2027_RECHECK_BY 15 Dec; RULES_UNTIL 1 Jan | pending | Budget act or RDL · 2026: RDL 3/2026, BOE 4 Feb | https://www.boe.es/diario_boe/ |
| 12 | Self-employed rate (31,5 %) and flat-rate total (88,64 € with MEI) | `self-employed` RATES, FLAT_RATE | Orden PJC/297/2026; TGSS guide | as row 11 | pending (the MEI part is row 9) | contribution order | as row 6 |
| 13 | Flat-rate extension threshold (annual SMI) | `self-employed` SMI_ANNUAL | 17.094 € | as row 11 | **DERIVED** 18.004 € (Ley 20/2007 art. 38 ter + RD 1013/2026) | — | as row 1 |
| 14 | IPREM | `iprem/rules.ts` IPREM_CURRENT (iprem, unemployment, subsidy, nc-pension, bono-social) | 600 €/month, 7.200/8.400 €/yr (Ley 31/2022 DA 90.ª, budget extended) | IPREM_RECHECK_FROM 1 Jan 2027 | pending. The Cortes are dissolved (RD 806/2026, elections 29 Nov), so no 2027 budget act before the new parliament | Budget act or RDL · unchanged since Ley 31/2022 | https://www.sepe.es/HomeSepe/prestaciones-desempleo/Cuantias-anuales.html |
| 15 | Unemployment benefit max/min (175/200/225 % and 80/107 % of IPREM + 1/6) | `employment/rules.ts` MAX_PCT, MIN_PCT | percentages in the LGSS; € from IPREM 2026 | RULES_VALID_UNTIL 31 Dec 2026 | percentages are law; € pending (row 14) | as row 14 | as row 14 |
| 16 | Subsidy amounts (95/90/80 % of IPREM) | `unemployment-subsidy/rules.ts` AMOUNT_BANDS, SEPE_AMOUNTS_2026; `employment` SUBSIDY_MONTHLY | 570/540/480 € | SUBSIDY_RULES_UNTIL 1 Jan 2027 | percentages are law (RDL 2/2024); € pending (row 14) | as row 14 | as row 14 |
| 17 | Subsidy income limit (75 % SMI) | `unemployment-subsidy` INCOME_LIMIT | 915,75 €/month | as row 16 | **DERIVED** 964,50 €/month (LGSS art. 275 + RD 1013/2026) | — | as row 1 |
| 18 | IMV amounts (tied to the PNC) | `unemployment-subsidy` PNC_ANNUAL_2026, SS_IMV_2026, IMV_CHILD_2026 | 733,60 € single adult | as row 16 | pending | Revaluation RDL / budget act · row 20 | https://www.seg-social.es/wps/portal/wss/internet/Pensionistas/Revalorizacion |
| 19 | Sick-leave maximum base | `sick-leave/rules.ts` MAX_BASE_2026 | 5.101,20 € | RULES_UNTIL 1 Jan 2027 | pending (row 6) | as row 6 | as row 6 |
| 20 | Pension revaluation % | `pensions-2027/rules.ts` NOVEMBER_FLASH, OFFICIAL_2027 | 2026: 2,7 % (RDL 3/2026) | flash guard 28 Nov; final 15 Dec; OFFICIAL_DUE 1 Feb 2027 | pending. The law fixes the formula (LGSS art. 58.2: mean CPI Dec 2025–Nov 2026); the page computes it from INE data as provisional/flash/final | INE flash 27 Nov, final 15 Dec; RDL · 2026: RDL 3/2026, BOE 4 Feb | https://www.ine.es/ (CPI) and https://www.boe.es/diario_boe/ |
| 21 | Maximum pension | `pensions-2027` MAX_PENSION_2026, `widow-pension` MAX_PENSION | 3.359,60 €/month | as row 20 | pending. LGSS DT 39.ª: revaluation % + 0,115 points, set by the budget act | RDL / budget act · RD 241/2026, BOE 26 Mar | as row 18 |
| 22 | Minimum pensions and their income limit | `pensions-2027` MINIMUMS_2026, MINIMUM_INCOME_LIMIT_2026 | e.g. 13.106,80 €/yr; limit 9.442/11.013 € | as row 20 | pending | RDL + RD · RDL 3/2026 and RD 241/2026 | as row 18 |
| 23 | Widow's minimums, income limit, complement cap | `widow-pension/rules.ts` WIDOW_MINIMUMS, INCOME_LIMIT, COMPLEMENT_CAP | 9.931,60–17.592,40 €; 9.442 € | RULES_UNTIL 1 Jan 2027 | pending | as row 22 | as row 18 |
| 24 | Widow's SMI thresholds | `widow-pension` BURDEN_THRESHOLD, REMARRIAGE_INCOME_LIMIT | 10.989 €; 34.188 € | as row 23 | **DERIVED** 11.574 € and 36.008 € (Decreto 3158/1966 art. 31.2, Orden 13-2-1967 art. 11.1 + RD 1013/2026) | — | as row 1 |
| 25 | Gender-gap supplement | `pensions-2027` GENDER_GAP_2026, `widow-pension` | 36,90 €/month | as row 20 | pending (revalued by art. 58.2) | as row 22 | as row 18 |
| 26 | Non-contributory pension, rent supplement, household limits | `non-contributory-pension/rules.ts` PNC_ANNUAL, RENT_SUPPLEMENT | 8.803,20 €/yr; 525 € | RULES_UNTIL 1 Jan 2027 | pending | budget act or revaluation RDL · RD 241/2026 art. 21 | https://imserso.es/pnc-prestaciones-subvenciones |
| 27 | Retirement age | `retirement-age/rules.ts` PHASE_IN | 2026: 65 with 38 y 3 m, else 66 y 10 m | RULES_UNTIL 1 Jan 2027 | **LAW** 2027: 65 with 38 y 6 m, else 67 (LGSS DT 7.ª), already in the table | — | https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724 |
| 28 | Retirement pension base divisor | not used by any calculator | — | — | **LAW** 2027: 304 best bases of 308 months ÷ 354,67 (LGSS DT 40.ª) | — | as row 27 |
| 29 | Christmas extra pay | `extra-pay/rules.ts` accrualPeriod (2026), net-salary engine | 2026 rules | EXTRA_PAY_RULES_UNTIL 1 Jan 2027 | rows 2, 3, 6–10 | — | — |
| 30 | Dismissal days, caps, 180.000 € exemption | `employment/rules.ts` | ET art. 56, 53; LIRPF 7.e | RULES_VALID_UNTIL 31 Dec 2026 | no yearly figure (law); SMI note uses row 1 | ET changes by act/RDL | https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430 |
| 31 | Paid leave days | `paid-leave/rules.ts` | ET arts. 37, 48 | RULES_UNTIL 1 Jan 2027 | no yearly figure (law) | as row 30 | as row 30 |
| 32 | Bono social discount | `bono-social/rules.ts` DISCOUNT_2026, PERMANENT_DISCOUNT | 42,5 % / 57,5 % until 31 Dec 2026 (RDL 7/2026 art. 1) | RULES_UNTIL 31 Dec 2026 | pending. Without a new RDL, RD 897/2017 art. 6.3 gives 35 % / 50 % (the page already shows it as "si no se prorroga") | RDL · 2026: RDL 7/2026, BOE 21 Mar | https://www.boe.es/diario_boe/ |
| 33 | Bono social no-cut-off guarantee | `bono-social` NO_CUTOFF_UNTIL | until 31 Dec 2026 (RDL 7/2026 art. 4) | as row 32 | pending | RDL | as row 32 |
| 34 | Bono social income thresholds (1,5 × IPREM 14) | `bono-social` BASE_MULTIPLIER × IPREM | 12.600 € base | as row 32 | multiples are law; € pending (row 14) | as row 14 | as row 14 |
| 35 | Rent update cap | `rent-update/rules.ts` DF6_* | 2 % for updates 8 Oct 2026–31 Dec 2027 (RDL 29/2026 DF 6.ª) | DF6_RECHECK_BY 16 Dec; RENT_RULES_REVIEW_BY 1 Jan | **LAW** runs through 2027 | — | https://www.boe.es/buscar/act.php?id=BOE-A-2026-20823 |
| 36 | IRAV / CPI for rent | `rent-update` INE series | monthly (Oct 2026: IRAV 2,57) | snapshot tests | monthly data, no yearly figure | INE | https://www.ine.es/ |
| 37 | Euribor | `euribor` snapshot | monthly (Oct 2026: 3,239) | snapshot ≤ 40 days (~23 Dec) | monthly data | Banco de España / BOE | https://www.bde.es/ |
| 38 | Mortgage early-repayment fees | `mortgage/rules.ts` EARLY_REPAYMENT | Ley 5/2019 art. 23 | RULES_REREAD_BY 13 May 2027 | no yearly figure | act | https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814 |
| 39 | ITP / AJD rates and reliefs by region | `home-purchase-tax/communities-data.ts` | 21 territories, read 13 Nov 2026 | COMMUNITIES_REREAD_BY 1 Feb 2027 | pending (budget/tax-measures acts usually apply from 1 Jan) | each region's bulletin | https://www.boe.es/diario_boe/ |
| 40 | Notary and Land Registry fees | `purchase-costs/rules.ts`, `home-purchase-tax/rules.ts` | RD 1426/1989, RD 1427/1989 (last change RD 1612/2011) | RULES_UNTIL 1 Jan 2027 | no yearly figure | royal decree | https://www.boe.es/buscar/act.php?id=BOE-A-1989-28111 |
| 41 | Plusvalía maximum coefficients | `plusvalia/rules.ts` TABLES rdl29-2026 | table from 1 Dec 2026 (RDL 29/2026 art. 10) | RULES_UNTIL 1 Jan 2027 | pending. With no new norm the RDL 29/2026 table keeps applying (the engine uses it for 2027 dates and says so) | norm with rank of law (TRLRHL 107.4) · RDL 29/2026, BOE 7 Oct | https://www.boe.es/diario_boe/ |
| 42 | Catalan inheritance and gift tax | `inheritance-tax/rules.ts`, `gift-tax/regions/catalonia.ts` | Codi tributari llibre sisè, consolidated 14 Jul 2026 | RULES_UNTIL 1 Jan 2027 | no 2027 change found (BOE republication; DOGC not searchable) | Catalan budget/tax-measures act · Llei 11/2026 (9 Jul) | https://dogc.gencat.cat/ca/ |
| 43 | Madrid inheritance and gift tax | `inheritance-tax/regions/madrid.ts`, `gift-tax/regions/madrid.ts` | DLeg 1/2010, consolidated 1 Jul 2026 | RULES_UNTIL 1 Jan 2027 | no change found in the BOE | BOCM act | https://www.bocm.es/ |
| 44 | Andalusian inheritance and gift tax | `…/andalucia.ts` | Ley 5/2021 | RULES_UNTIL 1 Jan 2027 | no change found in the BOE | BOJA act | https://www.juntadeandalucia.es/eboja.html |
| 45 | Valencian inheritance and gift tax | `…/valencia.ts` | Ley 13/1997, consolidated 10 Aug 2026 | RULES_UNTIL 1 Jan 2027 (< 1 Jun 2027) | **LAW** group III bonus 50 % for deaths/gifts from 1 Jun 2027 (Ley 5/2025 as reworded by Ley 5/2026), shown as text; the calculator applies 25 % | DOGV act | https://dogv.gva.es/ |
| 46 | Inheritance comparison, 21 territories | `inheritance-compare/data/*` | read 19 Nov 2026 | RULES_UNTIL 1 Jan 2027 | as rows 42–45 | each bulletin | https://www.boe.es/diario_boe/ |
| 47 | Rent-control zones | `zona-tensionada/declarations.json` | Catalan zones end 16 Mar and 10 Oct 2027 | per-zone guard 14 days before; RECHECK_BY 16 Dec | dated per zone | Ministry resolution (BOE) / DOGC | https://www.boe.es/diario_boe/ |
| 48 | CPI | `ipc` snapshot | monthly | snapshot ≤ 62 days; INE 2027 calendar by 10 Jan | monthly data | INE | https://www.ine.es/ |
| 49 | Average salary | `average-salary` snapshot | EAES 2024 | EPA deciles release 25 Nov | yearly data release | INE | https://www.ine.es/ |
| 50 | Letras auction calendar | `treasury-bills/calendar.ts` CALENDAR_2027 | 2026 calendar + 12 and 19 Jan 2027 | CALENDAR_2027_DUE 15 Dec | pending | Tesoro calendar (with the 2027 issuance order) | https://www.tesoro.es/deuda-publica/subastas/calendario |
| 51 | Savings tax scale on Letras | `treasury-bills/rules.ts` SAVINGS_SCALE | 19–30 % (Ley 7/2024) | RULES_REREAD_BY 15 Jan 2027 | no yearly figure | act | https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764 |
| 52 | Lottery levy (40.000 €, 20 %) | `lottery-tax/rules.ts` | Ley 35/2006 DA 33.ª | RULES_UNTIL 1 Jan 2027 | no yearly figure; no change published | act (e.g. budget act) | https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764 |
| 53 | Lottery draws and presets | `lottery-tax` DRAWS, PRESETS | Navidad 2026, Grossa 2026, Niño 2027 | as row 52 | Niño 2027 in (SELAE) | SELAE programme | https://www.loteriasyapuestas.es/ |
| 54 | ITV fees by region | `itv/prices.ts` | 2026 tariffs; Catalonia Ordre IUE/361/2010; Canarias valid to 31 Jan 2027 | PRICES_REREAD_BY 1 Feb 2027 | pending per region | each region's bulletin | https://dogc.gencat.cat/ca/document-del-dogc/?documentId=541600 |
| 55 | ITV and traffic-fine amounts | `itv/rules.ts` FINE, `traffic-fines/rules.ts` | Ley de Tráfico | RULES_UNTIL 18 May 2027 | no yearly figure | act | https://www.boe.es/buscar/act.php?id=BOE-A-2015-11722 |
| 56 | National and regional holidays 2027 | `holidays/boe-2027.ts` (working-days, paid-leave, traffic-fines) | — | COVER_EXTEND_BY 15 Nov 2027 | **OFFICIAL** BOE-A-2026-21254 (BOE 13 Oct) | — | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254 |
| 57 | AGE calendar of días inhábiles 2027 | `working-days/rules.ts` AGE_2027, AGE_2027_ANNEX | was null | AGE_2027_RECHECK_BY 31 Dec | **OFFICIAL, loaded today**: BOE-A-2026-23826 (BOE 14 Nov); the annex matches the BOE holiday list for every community (test) | Función Pública resolution · 2026: BOE 24 Nov 2025 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23826 |
| 58 | Catalan local holidays 2027 | `holidays/data` nextYearPublished() (working-days) | 2026 order | holidays module guards | pending; not counted until published, and the page says so | DOGC per-town resolution | https://dogc.gencat.cat/ca/ |

58 figures. Already set for 2027: 4 OFFICIAL (rows 1, 2, 56, 57), 6 LAW (rows 9, 10, 27, 28, 35, 45; no calculator uses row 28)
and 3 DERIVED (rows 13, 17, 24). The other 45 are pending, monthly or yearly data releases, or have no yearly figure. Regional acts
reach the BOE weeks after their own bulletin, so "no change found in the BOE" is weak evidence for rows 42–46.

## What the pages do on 1 January 2027

`Year2027Status` (inside `CalculatorNextStep`, under every tool) reads `CALC_2027`:
- **yearly** tools (net salary, extra pay, self-employed, paro, subsidy, sick leave, widow, PNC, IPREM, bono social): from the module's
  guard date the block becomes a warning: "Cifras de 2026: las de 2027 aún no están en esta calculadora", in force until 31 Dec 2026,
  the pending items with their official links, then what is already official. Before that, only the tools with an official 2027
  figure show "Ya oficial para 2027".
- **law** tools (dismissal, settlement, paid leave, home-purchase taxes and costs, plusvalía, inheritance and gift tax ×9, lottery,
  ITV): from 1 Jan 2027, while their rules were read before then, "Normas revisadas el …" and where a 2027 change would be published.
- **self** tools (SMI, pensions 2027, retirement age, working days, Letras, rent, Euribor, mortgage, IPC, average salary, rent
  zones, traffic fines) already switch on their own data or dates.
The browser re-checks the date (`DateSwitch`), so a page built in December flips on 1 January without a new build.
Titles, descriptions and leads are untouched (calculators review 17 Dec, `docs/SEO_EXPERIMENTS.md`).

When a 2027 figure comes out: load it in the module, move its id from `PENDING` to `OFFICIAL` (or the tool to `self`), move the
module's guard, and update this table. `tests/calculators-2027.test.ts` fails on each pending item's `recheckBy`.

## Watch-list, 21 Nov 2026 – 2 Jan 2027

| Day | What | Where | Then |
|---|---|---|---|
| 25 Nov | INE EPA wage deciles 2025 | ine.es | average-salary snapshot (guard 26 Nov) |
| 27 Nov | INE CPI flash for November: 12th month of the revaluation mean | ine.es | pensions-2027 NOVEMBER_FLASH (guard 28 Nov) |
| 28 Nov | RDL 31/2026 guard (sick leave, widow) | **already convalidated**: Diputación Permanente 18 Nov, BOE 20 Nov, BOE-A-2026-24292 | update `sick-leave` status text and `widow-pension` RDL31_STATUS before 28 Nov |
| 15 Dec | INE final November CPI; Tesoro 2027 calendar due; self-employed 2027 recheck | ine.es, tesoro.es, BOE | pensions-2027 final %; CALENDAR_2027; STATUS_2027 |
| 16 Dec | rent DF 6.ª and rent-zone rechecks | BOE, DOGC | rent-update, zona-tensionada |
| by 17–18 Dec | RDL 38/2026 convalidation (IRPF deduction 2027) | BOE (Congress resolution) | drop the caveat, or remove `irpfSmi2027` if derogated |
| late Dec | revaluation RDL (pensions, PNC, IMV, maybe IPREM), bono social extension, Catalan/regional budget or tax-measures acts, AEAT 2027 algorithm | BOE daily summary, DOGC/BOCM/BOJA/DOGV, AEAT | load what is out; the 1 Jan block warns about the rest |
| 31 Dec | bono social 2026 discount and no-cut-off guarantee end | BOE | bono-social RULES_UNTIL |
| 1 Jan | every RULES_UNTIL guard; the blocks switch | — | deploy after the updates (static pages show the new state server-side only after a build) |
