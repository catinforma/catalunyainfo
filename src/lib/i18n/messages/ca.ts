/** Interface strings only. No editorial content lives here. */
const ca = {
  common: {
    skipToContent: "Vés al contingut principal",
    menu: "Menú",
    close: "Tanca",
    open: "Obre",
    search: "Cerca",
    searchPlaceholder: "Cerca destinacions, guies, agenda…",
    searchSubmit: "Cercar",
    language: "Idioma",
    changeLanguage: "Canvia d'idioma",
    home: "Inici",
    breadcrumb: "Ruta de navegació",
    readMore: "Llegeix-ne més",
    seeAll: "Veure-ho tot",
    backToHome: "Torna a l'inici",
    loading: "Carregant",
    error: "Hi ha hagut un error",
  },
  nav: {
    news: "Actualitat",
    guides: "Guies",
    destinations: "Destinacions",
    events: "Agenda",
    routes: "Rutes",
    topics: "Temes",
    search: "Cerca",
    authors: "Equip",
    about: "Qui som",
    contact: "Contacte",
    legal: "Legal",
  },
  home: {
    tagline: "La guia digital més útil sobre Catalunya",
    intro:
      "Informació pràctica, verificada i mantinguda al dia sobre Catalunya: on anar, com arribar-hi, què cal saber abans i on consultar la font oficial.",
    searchLabel: "Què vols saber de Catalunya?",
  },
  meta: {
    publishedOn: "Publicat el",
    updatedOn: "Actualitzat el",
    verifiedOn: "Verificat el",
    readingTime: "{minutes} min de lectura",
    by: "Per",
    sources: "Fonts",
    sourcesNote:
      "Aquesta pàgina cita fonts oficials i primàries. Si hi detectes un error, avisa'ns.",
    relatedContent: "Contingut relacionat",
    inThisPage: "En aquesta pàgina",
    category: "Categoria",
    tags: "Etiquetes",
  },
  feedback: {
    question: "T'ha estat útil aquesta pàgina?",
    yes: "Sí",
    no: "No",
    thanks: "Gràcies pel teu retorn.",
    reportError: "Informa d'un error",
  },
  empty: {
    sectionTitle: "Encara no hi ha contingut publicat en aquesta secció",
    sectionBody:
      "Estem preparant aquesta secció. Quan hi hagi contingut verificat, apareixerà aquí.",
    searchNoResults: "No hem trobat resultats per «{query}».",
    searchTry: "Prova amb menys paraules o revisa l'ortografia.",
  },
  notFound: {
    title: "Pàgina no trobada",
    body: "L'adreça que has obert no existeix o s'ha mogut.",
  },
  consent: {
    title: "Privadesa i galetes",
    body: "Fem servir galetes pròpies imprescindibles i, amb el teu consentiment, galetes de mesura per entendre com es fa servir el web.",
    accept: "Accepta-ho tot",
    reject: "Només les imprescindibles",
    manage: "Configura",
    save: "Desa les preferències",
    necessary: "Imprescindibles",
    necessaryNote: "Sempre actives. Cal per servir el web amb seguretat.",
    analytics: "Mesura d'audiència",
    analyticsNote: "Ens ajuda a saber quines pàgines són útils. Dades agregades.",
    ads: "Publicitat",
    adsNote: "Encara no servim publicitat. Quan ho fem, ho podràs decidir aquí.",
  },
  footer: {
    editorialNote: "Contingut editorial independent, amb fonts citades.",
    rights: "Tots els drets reservats.",
  },
} as const;

export default ca;

/**
 * Widens the literal types that `as const` produces, so a translation file is
 * checked for having the same KEYS as the Catalan source, not the same values.
 */
type Widen<T> = T extends string
  ? string
  : { -readonly [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof ca>;
