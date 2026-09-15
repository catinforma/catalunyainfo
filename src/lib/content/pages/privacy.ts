import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { SITE } from "@/lib/site";
import { COOKIES, OPERATOR, PROCESSORS } from "./operator";
import { legalEntryPath, section, type PageCopy, type PageSpec } from "./types";

/**
 * Privacy and cookies.
 *
 * Both are written against what the code actually does, not against a template.
 * The cookie table is generated from `COOKIES` in `operator.ts`, which is the
 * same list the consent gate honours, so a policy that describes a cookie the
 * site does not set - or omits one it does - is a repository-level mistake
 * rather than a drafting one.
 */

/* -------------------------------------------------------------------------- */
/* Privacy                                                                    */
/* -------------------------------------------------------------------------- */

function processorTable(locale: Locale): Block {
  return {
    type: "table",
    caption: {
      ca: "Qui més tracta dades en nom nostre",
      es: "Quién más trata datos en nuestro nombre",
      en: "Who else processes data on our behalf",
    }[locale],
    headers: {
      ca: ["Proveïdor", "Per a què", "On", "Política"],
      es: ["Proveedor", "Para qué", "Dónde", "Política"],
      en: ["Provider", "Purpose", "Where", "Policy"],
    }[locale],
    rows: PROCESSORS.map((processor) => [
      processor.name,
      processor.role[locale],
      processor.region[locale],
      `[${new URL(processor.url).hostname}](${processor.url})`,
    ]),
  } as Block;
}

function privacyBlocks(locale: Locale): Block[] {
  const cookies = legalPath("cookies", locale);
  const contact = sectionPath("contact", locale);

  const common: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Aquest web recull les dades mínimes per funcionar i per respondre't. No venem dades, no fem perfils publicitaris i no compartim res amb tercers més enllà del que s'explica aquí.",
      } as Block,
      {
        type: "keyFacts",
        title: "El resum",
        items: [
          { label: "Responsable", value: `${OPERATOR.brand} — ${OPERATOR.email}` },
          { label: "Navegar pel web", value: "No cal donar cap dada" },
          { label: "Mesura d'audiència", value: "Només si l'acceptes; dades agregades" },
          { label: "Formulari de contacte", value: "Nom, correu i el que escrius" },
          { label: "Venda de dades", value: "Mai" },
          { label: "Publicitat personalitzada", value: "No n'hi ha" },
        ],
      } as Block,
      ...section(
        "Qui és el responsable",
        `El responsable del tractament és ${OPERATOR.brand}. Pots contactar-hi a [${OPERATOR.email}](mailto:${OPERATOR.email}) o pel [formulari de contacte](${contact}).`,
      ),
      ...section(
        "Quines dades tractem i per què",
        "**Navegació pel web.** Pots llegir-ho tot sense donar cap dada ni acceptar res. El servidor registra de manera tècnica i temporal les peticions per poder servir les pàgines i protegir-les d'abusos; aquest registre el gestiona el proveïdor d'allotjament i nosaltres no el fem servir per identificar ningú.",
        "**Mesura d'audiència.** Si acceptes la mesura, Google Analytics 4 ens dona dades agregades sobre quines pàgines es llegeixen. Base jurídica: el teu consentiment, que pots retirar quan vulguis. Si no l'acceptes, no es carrega res de Google: ni una petició.",
        "**Formulari de contacte.** Tractem el nom, l'adreça de correu, el motiu i el missatge que ens escrius, amb la finalitat única de respondre't. Base jurídica: el teu consentiment i l'interès legítim a atendre una consulta. Sense aquestes dades no et podem contestar.",
        "**Valoració «t'ha estat útil?».** Només desem la pàgina, l'idioma i un sí o un no. No hi ha cap identificador, ni sessió, ni adreça IP: no és possible relacionar una resposta amb una persona.",
        "**No tractem** dades de categories especials, ni dades de menors de manera intencionada, ni fem decisions automatitzades amb efectes jurídics sobre tu.",
      ),
      ...section(
        "Quant de temps les conservem",
        "**Missatges de contacte:** fins a 24 mesos des de l'última comunicació, per poder resseguir una consulta o una correcció. Després s'esborren.",
        "**Dades de Google Analytics:** 14 mesos, que és el màxim que hem configurat a la propietat.",
        "**Valoracions de pàgina:** de manera indefinida, perquè són anònimes i agregades des del primer moment.",
      ),
      ...section(
        "Amb qui les compartim",
        "Amb ningú, excepte els proveïdors que fan funcionar el servei i que actuen com a encarregats del tractament:",
      ),
      processorTable(locale),
      ...section(
        "Transferències internacionals",
        "Les funcions del servidor estan configurades a la regió de París (UE). Alguns proveïdors poden tractar dades fora de l'Espai Econòmic Europeu; en aquests casos la transferència s'empara en les clàusules contractuals tipus aprovades per la Comissió Europea o en una decisió d'adequació vigent.",
      ),
      ...section(
        "Els teus drets",
        "Pots exercir en qualsevol moment els drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat, i retirar el consentiment que hagis donat.",
        `Per fer-ho, escriu a [${OPERATOR.email}](mailto:${OPERATOR.email}) indicant quin dret vols exercir. Responem com a màxim en un mes.`,
        "Si consideres que no hem atès correctament la teva sol·licitud, pots reclamar davant l'**Agència Espanyola de Protecció de Dades** ([aepd.es](https://www.aepd.es/)) o, a Catalunya, davant l'**Autoritat Catalana de Protecció de Dades** ([apdcat.gencat.cat](https://apdcat.gencat.cat/)).",
      ),
      ...section(
        "Seguretat",
        "El web es serveix sempre per HTTPS. Les contrasenyes del panell de redacció es guarden amb derivació de clau (scrypt) i les sessions es desen només com a resum criptogràfic, de manera que ni una còpia de la base de dades no dona sessions utilitzables.",
        "Cap secret de configuració es guarda al repositori de codi.",
      ),
      ...section(
        "Galetes",
        `Cada galeta que instal·lem, amb finalitat i durada, està detallada a la [política de galetes](${cookies}).`,
      ),
      ...section(
        "Canvis en aquesta política",
        "Si canviem alguna cosa rellevant, actualitzarem aquesta pàgina i la data de verificació que hi apareix. Si el canvi afecta una finalitat que requereix consentiment, el tornarem a demanar.",
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Este sitio recoge los datos mínimos para funcionar y para responderte. No vendemos datos, no hacemos perfiles publicitarios y no compartimos nada con terceros más allá de lo que se explica aquí.",
      } as Block,
      {
        type: "keyFacts",
        title: "El resumen",
        items: [
          { label: "Responsable", value: `${OPERATOR.brand} — ${OPERATOR.email}` },
          { label: "Navegar por el sitio", value: "No hace falta dar ningún dato" },
          { label: "Medición de audiencia", value: "Solo si la aceptas; datos agregados" },
          { label: "Formulario de contacto", value: "Nombre, correo y lo que escribes" },
          { label: "Venta de datos", value: "Nunca" },
          { label: "Publicidad personalizada", value: "No hay" },
        ],
      } as Block,
      ...section(
        "Quién es el responsable",
        `El responsable del tratamiento es ${OPERATOR.brand}. Puedes contactar en [${OPERATOR.email}](mailto:${OPERATOR.email}) o por el [formulario de contacto](${contact}).`,
      ),
      ...section(
        "Qué datos tratamos y para qué",
        "**Navegación por el sitio.** Puedes leerlo todo sin dar ningún dato ni aceptar nada. El servidor registra de forma técnica y temporal las peticiones para poder servir las páginas y protegerlas de abusos; ese registro lo gestiona el proveedor de alojamiento y no lo usamos para identificar a nadie.",
        "**Medición de audiencia.** Si aceptas la medición, Google Analytics 4 nos da datos agregados sobre qué páginas se leen. Base jurídica: tu consentimiento, que puedes retirar cuando quieras. Si no lo aceptas, no se carga nada de Google: ni una sola petición.",
        "**Formulario de contacto.** Tratamos el nombre, la dirección de correo, el motivo y el mensaje que nos escribes, con la única finalidad de responderte. Base jurídica: tu consentimiento y el interés legítimo en atender una consulta. Sin esos datos no podemos contestarte.",
        "**Valoración «¿te ha sido útil?».** Solo guardamos la página, el idioma y un sí o un no. No hay identificador, ni sesión, ni dirección IP: no es posible relacionar una respuesta con una persona.",
        "**No tratamos** datos de categorías especiales, ni datos de menores de forma intencionada, ni tomamos decisiones automatizadas con efectos jurídicos sobre ti.",
      ),
      ...section(
        "Cuánto tiempo los conservamos",
        "**Mensajes de contacto:** hasta 24 meses desde la última comunicación, para poder seguir una consulta o una corrección. Después se borran.",
        "**Datos de Google Analytics:** 14 meses, que es el máximo configurado en la propiedad.",
        "**Valoraciones de página:** de forma indefinida, porque son anónimas y agregadas desde el primer momento.",
      ),
      ...section(
        "Con quién los compartimos",
        "Con nadie, salvo los proveedores que hacen funcionar el servicio y que actúan como encargados del tratamiento:",
      ),
      processorTable(locale),
      ...section(
        "Transferencias internacionales",
        "Las funciones del servidor están configuradas en la región de París (UE). Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo; en esos casos la transferencia se ampara en las cláusulas contractuales tipo aprobadas por la Comisión Europea o en una decisión de adecuación vigente.",
      ),
      ...section(
        "Tus derechos",
        "Puedes ejercer en cualquier momento los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar el consentimiento que hayas dado.",
        `Para hacerlo, escribe a [${OPERATOR.email}](mailto:${OPERATOR.email}) indicando qué derecho quieres ejercer. Respondemos como máximo en un mes.`,
        "Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la **Agencia Española de Protección de Datos** ([aepd.es](https://www.aepd.es/)) o, en Cataluña, ante la **Autoritat Catalana de Protecció de Dades** ([apdcat.gencat.cat](https://apdcat.gencat.cat/)).",
      ),
      ...section(
        "Seguridad",
        "El sitio se sirve siempre por HTTPS. Las contraseñas del panel de redacción se guardan con derivación de clave (scrypt) y las sesiones se almacenan solo como resumen criptográfico, de modo que ni una copia de la base de datos proporciona sesiones utilizables.",
        "Ningún secreto de configuración se guarda en el repositorio de código.",
      ),
      ...section(
        "Cookies",
        `Cada cookie que instalamos, con finalidad y duración, está detallada en la [política de cookies](${cookies}).`,
      ),
      ...section(
        "Cambios en esta política",
        "Si cambiamos algo relevante, actualizaremos esta página y la fecha de verificación que aparece en ella. Si el cambio afecta a una finalidad que requiere consentimiento, volveremos a pedirlo.",
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "This site collects the minimum it needs to work and to answer you. We do not sell data, we build no advertising profiles, and we share nothing with third parties beyond what is set out here.",
      } as Block,
      {
        type: "keyFacts",
        title: "The short version",
        items: [
          { label: "Controller", value: `${OPERATOR.brand} — ${OPERATOR.email}` },
          { label: "Reading the site", value: "No data required" },
          { label: "Audience measurement", value: "Only if you accept it; aggregate data" },
          { label: "Contact form", value: "Name, email and what you write" },
          { label: "Selling data", value: "Never" },
          { label: "Personalised advertising", value: "None" },
        ],
      } as Block,
      ...section(
        "Who the controller is",
        `The data controller is ${OPERATOR.brand}. You can write to [${OPERATOR.email}](mailto:${OPERATOR.email}) or use the [contact form](${contact}).`,
      ),
      ...section(
        "What we process, and why",
        "**Browsing the site.** You can read everything without giving any data or accepting anything. The server keeps technical, short-lived request logs so pages can be served and protected from abuse; those logs are held by the hosting provider and we do not use them to identify anyone.",
        "**Audience measurement.** If you accept measurement, Google Analytics 4 gives us aggregate data on which pages are read. Legal basis: your consent, which you can withdraw at any time. If you decline, nothing from Google is loaded — not a single request.",
        "**Contact form.** We process the name, email address, subject and message you send us, for the sole purpose of replying. Legal basis: your consent and our legitimate interest in answering an enquiry. Without those details we cannot reply.",
        "**The \"was this useful?\" rating.** We store only the page, the language and a yes or no. There is no identifier, no session and no IP address, so an answer cannot be linked to a person.",
        "**We do not process** special-category data, we do not knowingly process children's data, and we make no automated decisions with legal effects on you.",
      ),
      ...section(
        "How long we keep it",
        "**Contact messages:** up to 24 months from the last exchange, so an enquiry or correction can be traced. They are deleted afterwards.",
        "**Google Analytics data:** 14 months, the maximum configured on the property.",
        "**Page ratings:** indefinitely, because they are anonymous and aggregate from the outset.",
      ),
      ...section(
        "Who we share it with",
        "Nobody, other than the providers that make the service work and act as processors on our behalf:",
      ),
      processorTable(locale),
      ...section(
        "International transfers",
        "Server functions are pinned to the Paris (EU) region. Some providers may process data outside the European Economic Area; where they do, the transfer relies on the European Commission's standard contractual clauses or on a current adequacy decision.",
      ),
      ...section(
        "Your rights",
        "You may at any time exercise your rights of access, rectification, erasure, objection, restriction of processing and portability, and withdraw any consent you have given.",
        `To do so, write to [${OPERATOR.email}](mailto:${OPERATOR.email}) saying which right you wish to exercise. We reply within one month at most.`,
        "If you believe your request was not handled properly, you can complain to the **Spanish Data Protection Agency** ([aepd.es](https://www.aepd.es/)) or, in Catalonia, to the **Catalan Data Protection Authority** ([apdcat.gencat.cat](https://apdcat.gencat.cat/)).",
      ),
      ...section(
        "Security",
        "The site is always served over HTTPS. Editorial panel passwords are stored using key derivation (scrypt) and sessions are stored only as a cryptographic digest, so even a copy of the database yields no usable sessions.",
        "No configuration secret is kept in the code repository.",
      ),
      ...section(
        "Cookies",
        `Every cookie we set, with its purpose and duration, is listed in the [cookie policy](${cookies}).`,
      ),
      ...section(
        "Changes to this policy",
        "If we change anything material we will update this page and the verification date on it. If a change affects a purpose that requires consent, we will ask again.",
      ),
    ],
  };

  return common[locale];
}

const PRIVACY_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Política de privadesa",
    seoTitle: "Política de privadesa",
    seoDescription:
      "Quines dades tracta CatalunyaInfo, amb quina base jurídica, durant quant de temps, amb qui es comparteixen i com exercir els teus drets.",
    excerpt: "Quines dades tractem, per què, durant quant de temps i quins drets tens.",
  },
  es: {
    title: "Política de privacidad",
    seoTitle: "Política de privacidad",
    seoDescription:
      "Qué datos trata CatalunyaInfo, con qué base jurídica, durante cuánto tiempo, con quién se comparten y cómo ejercer tus derechos.",
    excerpt: "Qué datos tratamos, para qué, durante cuánto tiempo y qué derechos tienes.",
  },
  en: {
    title: "Privacy policy",
    seoTitle: "Privacy policy",
    seoDescription:
      "What data CatalunyaInfo processes, on what legal basis, for how long, who it is shared with, and how to exercise your rights.",
    excerpt: "What data we process, why, for how long, and your rights.",
  },
};

export const PRIVACY: PageSpec = {
  key: "page-privacy",
  path: legalEntryPath("privacy"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...PRIVACY_COPY[locale], blocks: privacyBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Cookies                                                                    */
/* -------------------------------------------------------------------------- */

function cookieTable(locale: Locale): Block {
  return {
    type: "table",
    caption: {
      ca: "Galetes que pot instal·lar aquest web",
      es: "Cookies que puede instalar este sitio",
      en: "Cookies this site may set",
    }[locale],
    headers: {
      ca: ["Nom", "Tipus", "Finalitat", "Durada"],
      es: ["Nombre", "Tipo", "Finalidad", "Duración"],
      en: ["Name", "Type", "Purpose", "Duration"],
    }[locale],
    rows: COOKIES.map((cookie) => [
      cookie.name,
      cookie.kind[locale],
      cookie.purpose[locale],
      cookie.duration[locale],
    ]),
  } as Block;
}

function cookieBlocks(locale: Locale): Block[] {
  const privacy = legalPath("privacy", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Aquest web funciona sense galetes de tercers si no les acceptes. En la primera visita no es carrega res de Google ni de cap altre tercer: ni un sol script, ni una sola petició.",
      } as Block,
      ...section(
        "Què és una galeta",
        "Un fitxer petit que el navegador desa quan visites un web i que permet recordar una cosa entre pàgines: per exemple, que ja has decidit si acceptes la mesura d'audiència.",
      ),
      ...section("Quines galetes fem servir", "Aquesta és la llista completa:"),
      cookieTable(locale),
      {
        type: "callout",
        tone: "info",
        title: "Per defecte, denegat",
        text: "Les galetes de mesura només s'instal·len si les acceptes explícitament. Les de publicitat no s'instal·len mai, perquè aquest web no en serveix.",
      } as Block,
      ...section(
        "Com canviar la teva decisió",
        "Pots canviar-la en qualsevol moment des del botó de configuració de galetes del peu de pàgina. També pots esborrar les galetes des de la configuració del teu navegador; llavors se't tornarà a preguntar.",
        "Si esborres la galeta `ci_consent`, la decisió desapareix i el web torna a l'estat inicial: tot denegat.",
      ),
      ...section(
        "Google Consent Mode",
        "Fem servir el mode de consentiment de Google en versió 2. Els senyals de publicitat (`ad_storage`, `ad_user_data`, `ad_personalization`) estan denegats de manera permanent, no només fins que decideixes: aquest web no serveix publicitat.",
      ),
      ...section(
        "Més informació",
        `El tractament de dades en conjunt s'explica a la [política de privadesa](${privacy}).`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Este sitio funciona sin cookies de terceros si no las aceptas. En la primera visita no se carga nada de Google ni de ningún otro tercero: ni un solo script, ni una sola petición.",
      } as Block,
      ...section(
        "Qué es una cookie",
        "Un archivo pequeño que el navegador guarda al visitar un sitio y que permite recordar algo entre páginas: por ejemplo, que ya has decidido si aceptas la medición de audiencia.",
      ),
      ...section("Qué cookies usamos", "Esta es la lista completa:"),
      cookieTable(locale),
      {
        type: "callout",
        tone: "info",
        title: "Por defecto, denegado",
        text: "Las cookies de medición solo se instalan si las aceptas explícitamente. Las de publicidad no se instalan nunca, porque este sitio no sirve publicidad.",
      } as Block,
      ...section(
        "Cómo cambiar tu decisión",
        "Puedes cambiarla en cualquier momento desde el botón de configuración de cookies del pie de página. También puedes borrar las cookies desde la configuración de tu navegador; entonces se te volverá a preguntar.",
        "Si borras la cookie `ci_consent`, la decisión desaparece y el sitio vuelve al estado inicial: todo denegado.",
      ),
      ...section(
        "Google Consent Mode",
        "Usamos el modo de consentimiento de Google en versión 2. Las señales publicitarias (`ad_storage`, `ad_user_data`, `ad_personalization`) están denegadas de forma permanente, no solo hasta que decides: este sitio no sirve publicidad.",
      ),
      ...section(
        "Más información",
        `El tratamiento de datos en conjunto se explica en la [política de privacidad](${privacy}).`,
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "This site works without third-party cookies unless you accept them. On a first visit nothing from Google or any other third party is loaded — not one script, not one request.",
      } as Block,
      ...section(
        "What a cookie is",
        "A small file your browser stores when you visit a site, which lets something be remembered between pages: for example, that you have already decided whether to accept audience measurement.",
      ),
      ...section("Which cookies we use", "This is the complete list:"),
      cookieTable(locale),
      {
        type: "callout",
        tone: "info",
        title: "Denied by default",
        text: "Measurement cookies are set only if you explicitly accept them. Advertising cookies are never set, because this site carries no advertising.",
      } as Block,
      ...section(
        "Changing your decision",
        "You can change it at any time from the cookie settings button in the footer. You can also delete cookies in your browser settings, after which you will be asked again.",
        "If you delete the `ci_consent` cookie, the decision is gone and the site returns to its initial state: everything denied.",
      ),
      ...section(
        "Google Consent Mode",
        "We use Google Consent Mode v2. The advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) are denied permanently, not merely until you choose: this site serves no advertising.",
      ),
      ...section(
        "More information",
        `Data processing as a whole is explained in the [privacy policy](${privacy}).`,
      ),
    ],
  };

  return copy[locale];
}

const COOKIE_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Política de galetes",
    seoTitle: "Política de galetes",
    seoDescription:
      "Llista completa de les galetes de CatalunyaInfo, amb finalitat i durada, i com canviar la teva decisió en qualsevol moment.",
    excerpt: "Una llista de cada galeta que instal·lem, amb durada i finalitat.",
  },
  es: {
    title: "Política de cookies",
    seoTitle: "Política de cookies",
    seoDescription:
      "Lista completa de las cookies de CatalunyaInfo, con finalidad y duración, y cómo cambiar tu decisión en cualquier momento.",
    excerpt: "Una lista de cada cookie que instalamos, con duración y finalidad.",
  },
  en: {
    title: "Cookie policy",
    seoTitle: "Cookie policy",
    seoDescription:
      "The complete list of cookies CatalunyaInfo sets, with purpose and duration, and how to change your decision at any time.",
    excerpt: "Every cookie we set, with its purpose and duration.",
  },
};

export const COOKIES_PAGE: PageSpec = {
  key: "page-cookies",
  path: legalEntryPath("cookies"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...COOKIE_COPY[locale], blocks: cookieBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/** Re-exported so the sitemap-facing module has one import. */
export const PRIVACY_CONTACT_EMAIL = SITE.contactEmail;
