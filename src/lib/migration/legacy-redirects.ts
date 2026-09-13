// GENERATED FILE - do not edit by hand.
// Source: migration/redirects.csv
// Regenerate: npm run build:redirects

export interface LegacyRedirect {
  readonly from: string;
  readonly to: string;
  readonly status: number;
}

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  {
    "from": "/index.html",
    "to": "/ca/",
    "status": 308
  },
  {
    "from": "/ultimahora/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/politica/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/economia/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/societat/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/esports/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/tecnologia/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/cultura/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/successos/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/opinio/",
    "to": "/ca/actualitat/",
    "status": 308
  },
  {
    "from": "/calendari/",
    "to": "/ca/agenda/",
    "status": 308
  },
  {
    "from": "/sobre-nosaltres.html",
    "to": "/ca/qui-som/",
    "status": 308
  },
  {
    "from": "/contacte.html",
    "to": "/ca/contacte/",
    "status": 308
  },
  {
    "from": "/legal/avis-legal.html",
    "to": "/ca/legal/avis-legal/",
    "status": 308
  },
  {
    "from": "/legal/politica-privacitat.html",
    "to": "/ca/legal/privacitat/",
    "status": 308
  },
  {
    "from": "/legal/politica-cookies.html",
    "to": "/ca/legal/cookies/",
    "status": 308
  },
  {
    "from": "/legal/termes-condicions.html",
    "to": "/ca/legal/avis-legal/",
    "status": 308
  },
  {
    "from": "/legal/transparencia-editorial.html",
    "to": "/ca/legal/politica-editorial/",
    "status": 308
  }
] as const;

/**
 * URLs that must answer 410 Gone.
 *
 * These are the auto-generated news items from version 1. They have no
 * equivalent on the new site, and funnelling 42 stale URLs into a hub page
 * would read as a soft 404. 410 tells Google the removal is deliberate.
 */
export const LEGACY_GONE: ReadonlySet<string> = new Set([
  "/article/alerten-duna-onada-dimatges-falses-generades-amb-ia-que-difonen-desinformacio-a--2026-03-12.html",
  "/article/detecten-el-primer-cas-de-pesta-porcina-africana-a-larea-de-barcelona-i-tanquen--2026-03-12.html",
  "/article/la-marato-de-barcelona-2026-prepara-record-de-participacio-amb-milers-de-corredo-2026-03-12.html",
  "/article/victor-font-torna-a-atacar-joan-laporta-en-plena-campanya-per-les-eleccions-del--2026-03-12.html",
  "/article/el-barca-dhandbol-domina-el-granollers-42-31-i-consolida-el-lideratge-a-la-lliga-2026-03-11.html",
  "/article/el-barca-rescata-un-empat-agonic-contra-el-newcastle-a-la-champions-amb-un-penal-2026-03-11.html",
  "/article/el-festival-cruilla-anuncia-els-primers-artistes-confirmats-per-a-ledicio-daques-2026-03-11.html",
  "/article/el-parlament-debat-noves-mesures-dhabitatge-per-frenar-el-preu-del-lloguer-a-cat-2026-03-11.html",
  "/article/el-risc-denfonsament-duna-escola-digualada-obliga-a-tancar-el-centre-almenys-fin-2026-03-11.html",
  "/article/els-mossos-investiguen-una-onada-de-robatoris-de-coure-a-montcada-i-reixac-duran-2026-03-11.html",
  "/article/els-transportistes-catalans-alerten-que-laugment-del-combustible-ha-disparat-els-2026-03-11.html",
  "/article/la-nit-de-les-lletres-catalanes-celebrara-la-seva-75a-edicio-al-mnac-de-barcelon-2026-03-11.html",
  "/article/mor-un-motorista-en-xocar-amb-un-cabirol-a-la-carretera-c-61-a-vallgorguina-2026-03-11.html",
  "/article/restablerta-la-circulacio-de-la-linia-r3-de-rodalies-entre-la-garriga-i-ripoll-d-2026-03-11.html",
  "/article/barca-atletic-de-madrid-el-partit-de-laliga-centra-lactualitat-esportiva-a-catal-2026-03-09.html",
  "/article/catalunya-impulsa-un-nou-hub-dintelligencia-artificial-a-barcelona-per-reforcar--2026-03-09.html",
  "/article/desaparicions-a-catalunya-els-mossos-van-registrar-3682-casos-el-2025-amb-mes-me-2026-03-09.html",
  "/article/educacio-acorda-amb-ccoo-i-ugt-una-pujada-salarial-i-una-rebaixa-de-ratios-a-cat-2026-03-09.html",
  "/article/manifestacio-del-8m-a-barcelona-22000-persones-omplen-el-centre-en-una-de-les-gr-2026-03-09.html",
  "/article/recorden-a-catalunya-el-cas-de-cristina-bergua-29-anys-despres-de-la-desaparicio-2026-03-09.html",
  "/article/joan-laporta-guanya-amb-contundencia-les-eleccions-del-barca-i-presidira-el-club-2026-03-16.html",
  "/article/comenca-una-setmana-de-vagues-a-leducacio-amb-protestes-i-talls-a-barcelona-2026-03-16.html",
  "/article/laporta-inicia-un-nou-mandat-al-barca-despres-duna-victoria-aclaparadora-a-les-e-2026-03-16.html",
  "/article/silvia-orriols-amenaca-amb-una-nova-questio-de-confianca-si-no-pot-aprovar-els-p-2026-03-16.html",
  "/article/preocupacio-al-penedes-pel-futur-de-freixenet-despres-dels-moviments-empresarial-2026-03-16.html",
  "/article/el-fort-temporal-de-vent-deixa-ferits-carreteres-tallades-i-mes-de-mil-incidenci-2026-03-16.html",
  "/article/fineart-igualada-reuneix-desenes-dexposicions-de-fotografia-en-la-seva-14a-edici-2026-03-16.html",
  "/article/el-projecte-catalunya-media-city-a-les-tres-xemeneies-pren-forma-com-a-gran-hub--2026-03-16.html",
  "/article/els-mossos-detecten-sis-persones-fent-trampes-a-lexamen-teoric-de-conduir-a-tort-2026-03-17.html",
  "/article/el-car-de-sant-cugat-modernitza-el-seu-gimnas-per-millorar-el-rendiment-dels-esp-2026-03-17.html",
  "/article/el-futur-parc-natural-de-les-muntanyes-de-prades-sera-realitat-aquest-estiu-2026-03-17.html",
  "/article/rosalia-enlluerna-lio-amb-linici-de-la-seva-nova-gira-internacional-lux-2026-03-17.html",
  "/article/la-pobresa-baixa-a-barcelona-pero-augmenta-als-municipis-de-larea-metropolitana-2026-03-18.html",
  "/article/detingut-a-lleida-un-home-acusat-de-maltractar-la-seva-parella-en-un-nou-cas-de--2026-03-18.html",
  "/article/salou-habilita-prop-de-1100-places-gratuites-en-aparcaments-dissuasius-per-redui-2026-03-18.html",
  "/article/mor-una-dona-a-barcelona-despres-de-caure-li-el-sostre-duna-nau-industrial-pel-t-2026-03-18.html",
  "/article/el-preu-del-diesel-es-dispara-fins-a-un-29-en-dues-setmanes-i-afecta-el-sector-d-2026-03-18.html",
  "/article/busquen-un-estudiant-nord-america-desaparegut-a-barcelona-des-de-fa-dies-2026-03-19.html",
  "/article/badalona-impulsa-un-pla-per-construir-prop-de-300-habitatges-publics-fins-al-203-2026-03-19.html",
  "/article/catalunya-afronta-una-primavera-amb-nivells-elevats-de-pollen-per-les-pluges-rec-2026-03-19.html",
  "/article/la-volta-a-catalunya-2026-arrencara-el-23-de-marc-amb-un-recorregut-de-mes-de-10-2026-03-19.html",
  "/article/exhibicio-historica-del-barca-goleja-7-2-el-newcastle-i-vola-als-quarts-de-la-ch-2026-03-19.html"
]);
