import { SITE } from "@/lib/site";

/**
 * Who operates the site, for the legal notice.
 *
 * Spanish law (Ley 34/2002, LSSI-CE, art. 10) requires an information-society
 * service provider to publish its name or company name, its tax identifier and
 * an address. Those are facts about a real person that this repository does not
 * hold, and a legal notice that invents them is worse than one that is
 * incomplete — so the fields below are empty and every line that renders them
 * is skipped while they are.
 *
 * FILL THESE IN BEFORE THE SITE IS PRESENTED AS A COMMERCIAL SERVICE
 * (advertising, affiliate links, sponsorship). Until then the site publishes
 * the contact channel, which is what actually lets a reader reach the
 * publisher.
 */
export const OPERATOR = {
  /** Trading name. Known and true. */
  brand: SITE.name,
  /** Legal name of the natural or legal person. */
  legalName: "",
  /** NIF / CIF. */
  taxId: "",
  /** Postal address for notifications. */
  address: "",
  /** Registry details, if it is a company. */
  registry: "",
  email: SITE.contactEmail,
} as const;

/** True when the LSSI-CE identity block can be rendered in full. */
export function hasLegalIdentity(): boolean {
  return Boolean(OPERATOR.legalName && OPERATOR.taxId && OPERATOR.address);
}

/**
 * Third parties that process data on our behalf, or that receive it because of
 * how the site is built. Every one of these is verifiable from the repository
 * and the Vercel configuration; nothing here is aspirational.
 */
export const PROCESSORS = [
  {
    name: "Vercel Inc.",
    role: { ca: "Allotjament del web", es: "Alojamiento del sitio", en: "Website hosting" },
    url: "https://vercel.com/legal/privacy-policy",
    /** Serverless functions are pinned to cdg1 in vercel.json. */
    region: { ca: "París (UE) i CDN global", es: "París (UE) y CDN global", en: "Paris (EU) and global CDN" },
  },
  {
    name: "Neon Inc.",
    role: { ca: "Base de dades", es: "Base de datos", en: "Database" },
    url: "https://neon.com/privacy-policy",
    region: { ca: "Segons la regió contractada", es: "Según la región contratada", en: "Per the contracted region" },
  },
  {
    name: "Google Ireland Ltd.",
    role: {
      ca: "Mesura d'audiència (Google Analytics 4), només amb consentiment",
      es: "Medición de audiencia (Google Analytics 4), solo con consentimiento",
      en: "Audience measurement (Google Analytics 4), only with consent",
    },
    url: "https://policies.google.com/privacy",
    region: { ca: "UE i EUA", es: "UE y EE. UU.", en: "EU and USA" },
  },
] as const;

/** Cookies actually set by this site. Keep in step with the code. */
export const COOKIES = [
  {
    name: "ci_consent",
    purpose: {
      ca: "Recorda la teva decisió sobre les galetes de mesura.",
      es: "Recuerda tu decisión sobre las cookies de medición.",
      en: "Remembers your decision about measurement cookies.",
    },
    duration: { ca: "180 dies", es: "180 días", en: "180 days" },
    kind: { ca: "Pròpia, necessària", es: "Propia, necesaria", en: "First-party, necessary" },
  },
  {
    name: "ci_locale",
    purpose: {
      ca: "Recorda l'idioma triat perquè una adreça sense idioma t'hi porti.",
      es: "Recuerda el idioma elegido para que una dirección sin idioma te lleve a él.",
      en: "Remembers your chosen language so a URL without one lands in the right place.",
    },
    duration: { ca: "1 any", es: "1 año", en: "1 year" },
    kind: { ca: "Pròpia, necessària", es: "Propia, necesaria", en: "First-party, necessary" },
  },
  {
    name: "ci_session",
    purpose: {
      ca: "Manté la sessió del panell de redacció. No s'activa mai visitant el web públic.",
      es: "Mantiene la sesión del panel de redacción. Nunca se activa visitando el sitio público.",
      en: "Keeps the editorial panel session. Never set by visiting the public site.",
    },
    duration: { ca: "12 hores", es: "12 horas", en: "12 hours" },
    kind: { ca: "Pròpia, necessària", es: "Propia, necesaria", en: "First-party, necessary" },
  },
  {
    name: "_ga, _ga_*",
    purpose: {
      ca: "Google Analytics 4: distingeix visites i sessions de manera agregada. Només s'instal·la si acceptes la mesura.",
      es: "Google Analytics 4: distingue visitas y sesiones de forma agregada. Solo se instala si aceptas la medición.",
      en: "Google Analytics 4: distinguishes visits and sessions in aggregate. Only set if you accept measurement.",
    },
    duration: { ca: "Fins a 2 anys", es: "Hasta 2 años", en: "Up to 2 years" },
    kind: { ca: "De tercers, analítica", es: "De terceros, analítica", en: "Third-party, analytics" },
  },
] as const;
