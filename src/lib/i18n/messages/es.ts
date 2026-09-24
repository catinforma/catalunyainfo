import type { Messages } from "./ca";

const es: Messages = {
  common: {
    skipToContent: "Ir al contenido principal",
    menu: "Menú",
    close: "Cerrar",
    open: "Abrir",
    search: "Buscar",
    searchPlaceholder: "Busca destinos, guías, agenda…",
    searchSubmit: "Buscar",
    language: "Idioma",
    changeLanguage: "Cambiar de idioma",
    home: "Inicio",
    breadcrumb: "Ruta de navegación",
    readMore: "Leer más",
    seeAll: "Ver todo",
    backToHome: "Volver al inicio",
    loading: "Cargando",
    error: "Se ha producido un error",
  },
  nav: {
    news: "Actualidad",
    guides: "Guías",
    destinations: "Destinos",
    events: "Agenda",
    routes: "Rutas",
    topics: "Temas",
    search: "Buscar",
    authors: "Equipo",
    about: "Quiénes somos",
    contact: "Contacto",
    legal: "Legal",
  },
  home: {
    tagline: "La guía digital más útil sobre Cataluña",
    intro:
      "Información práctica, verificada y mantenida al día sobre Cataluña: adónde ir, cómo llegar, qué conviene saber antes y dónde consultar la fuente oficial.",
    searchLabel: "¿Qué quieres saber de Cataluña?",
  },
  meta: {
    publishedOn: "Publicado el",
    updatedOn: "Actualizado el",
    verifiedOn: "Verificado el",
    readingTime: "{minutes} min de lectura",
    by: "Por",
    sources: "Fuentes",
    sourcesNote:
      "Esta página cita fuentes oficiales y primarias. Si detectas un error, avísanos.",
    relatedContent: "Contenido relacionado",
    inThisPage: "En esta página",
    category: "Categoría",
    tags: "Etiquetas",
  },
  feedback: {
    question: "¿Te ha resultado útil esta página?",
    yes: "Sí",
    no: "No",
    thanks: "Gracias por tu respuesta.",
    reportError: "Informar de un error",
  },
  empty: {
    sectionTitle: "Todavía no hay contenido publicado en esta sección",
    sectionBody:
      "Estamos preparando esta sección. Cuando haya contenido verificado, aparecerá aquí.",
    searchNoResults: "No hemos encontrado resultados para «{query}».",
    searchTry: "Prueba con menos palabras o revisa la ortografía.",
  },
  notFound: {
    title: "Página no encontrada",
    body: "La dirección que has abierto no existe o se ha movido.",
  },
  consent: {
    title: "Privacidad y cookies",
    body: "Usamos cookies propias imprescindibles y, con tu consentimiento, cookies de medición para entender cómo se usa la web.",
    accept: "Aceptar todo",
    reject: "Solo las imprescindibles",
    manage: "Configurar",
    save: "Guardar preferencias",
    necessary: "Imprescindibles",
    necessaryNote: "Siempre activas. Necesarias para servir la web con seguridad.",
    analytics: "Medición de audiencia",
    analyticsNote: "Nos ayuda a saber qué páginas son útiles. Datos agregados.",
    ads: "Publicidad",
    adsNote: "Todavía no servimos publicidad. Cuando lo hagamos, podrás decidirlo aquí.",
  },
  contactForm: {
    legend: "Escríbenos",
    intro:
      "Respondemos todos los mensajes. Si nos avisas de un error en una página, indícanos la dirección y lo corregimos.",
    name: "Nombre",
    email: "Correo electrónico",
    emailHint: "Solo lo usamos para responderte.",
    topic: "Motivo",
    topics: {
      correction: "Corregir un error en una página",
      editorial: "Propuesta o sugerencia de contenido",
      press: "Prensa y comunicación",
      collaboration: "Colaboraciones y publicidad",
      privacy: "Privacidad y protección de datos",
      other: "Otra cosa",
    },
    aboutPath: "Página relacionada (opcional)",
    aboutPathHint: "Pega aquí la dirección si el mensaje trata sobre una página concreta.",
    message: "Mensaje",
    consent:
      "Acepto que se traten mis datos para responder a este mensaje, tal como explica la [política de privacidad]({privacy}).",
    submit: "Enviar el mensaje",
    sending: "Enviando…",
    success:
      "Mensaje recibido. Gracias. Si requiere respuesta, la recibirás en el correo que nos has indicado.",
    errorGeneric: "No hemos podido enviar el mensaje. Inténtalo de nuevo en unos minutos.",
    errorRate: "Has enviado demasiados mensajes seguidos. Espera un rato e inténtalo de nuevo.",
    errorValidation: "Revisa los campos marcados.",
    required: "Campo obligatorio",
    invalidEmail: "Dirección de correo no válida",
    tooShort: "Escribe un poco más para que podamos entenderte.",
    fallback: "También puedes escribir directamente a",
  },
  calculator: {
    disclaimer:
      "Cálculo orientativo a partir de las tarifas publicadas en la fuente citada. Comprueba siempre el importe final con el organismo o el establecimiento.",
  },
  calendar: {
    download: "Añadir al calendario",
    hint: "Se descarga un archivo .ics que puedes abrir con Google Calendar, Outlook o el calendario del móvil.",
  },
  footer: {
    editorialNote: "Contenido editorial independiente, con fuentes citadas.",
    rights: "Todos los derechos reservados.",
  },
};

export default es;
