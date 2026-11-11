import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { SITE } from "@/lib/site";
import { COOKIES, OPERATOR, PROCESSORS } from "./operator";
import { legalEntryPath, paragraphs, section, type PageCopy, type PageSpec } from "./types";

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

/* -------------------------------------------------------------------------- */
/* Advertising (planned, not live)                                            */
/* -------------------------------------------------------------------------- */

/**
 * What Google asks a publisher's privacy policy to say once AdSense ads run,
 * read on Google's own pages on 11 Nov 2026 (curl + grep, every URL below
 * answered 200 that day except aboutads.info, which serves a bot checkpoint
 * (429) to curl and is the URL Google itself links):
 *
 * - AdSense "Required content" (support.google.com/adsense/answer/1348695):
 *   "Your privacy policy should include the following information:
 *   Third party vendors, including Google, use cookies to serve ads based on a
 *   user's prior visits to your website or other websites. / Google's use of
 *   advertising cookies enables it and its partners to serve ads to your users
 *   based on their visit to your sites and/or other sites on the Internet. /
 *   Users may opt out of personalized advertising by visiting Ads Settings
 *   [www.google.com/settings/ads]. (Alternatively, you can direct users to opt
 *   out of a third-party vendor's use of cookies for personalized advertising
 *   by visiting www.aboutads.info.)" and, for other vendors: "Notify your site
 *   visitors of the third-party vendors and ad networks serving ads on your
 *   site. Provide links to the appropriate vendor and ad network websites."
 * - Google Publisher Policies, "Privacy disclosures"
 *   (support.google.com/publisherpolicies/answer/10502938): "The privacy
 *   policy must disclose to users that third parties may be placing and reading
 *   cookies on your users' browsers, or using web beacons or IP addresses to
 *   collect information as a result of ad serving on your website." and "you
 *   have the option to display a prominent link to How Google uses data when
 *   you use our partners' sites or apps" (policies.google.com/technologies/partner-sites).
 * - policies.google.com/technologies/ads: opt-out tools "aboutads.info
 *   choices page or the EU-based Your Online Choices"; "when personalized ads
 *   are turned off, you may still see ads based on factors such as your general
 *   location derived from your IP address, your browser type, and your search
 *   terms."
 * - AdSense answer/13554116: "partners using [...] Google AdSense [...] are
 *   required to use a consent management platform (CMP) that has been
 *   certified by Google and integrates with the IAB's Transparency and Consent
 *   Framework (TCF) when serving personalized ads to users in [...] EEA and UK
 *   [...] Switzerland".
 * - EU user consent policy (google.com/about/company/user-consent-policy/):
 *   "You must clearly identify each party that may collect, receive, or use
 *   end users' personal data as a consequence of your use of a Google product."
 *
 * True today: no ad code exists (tests/security.test.ts), the consent gate
 * keeps `ad_storage`, `ad_user_data` and `ad_personalization` denied whatever
 * the reader chooses, and no advertising cookie is set. When ads go live this
 * section, the cookie policy, PROCESSORS and the legal notice change with them.
 */
export const AD_LINKS = {
  adsSettings: "https://www.google.com/settings/ads",
  aboutAds: "https://www.aboutads.info/choices/",
  yourOnlineChoices: {
    ca: "https://www.youronlinechoices.com/es/preferencias/",
    es: "https://www.youronlinechoices.com/es/preferencias/",
    en: "https://www.youronlinechoices.com/uk/your-ad-choices",
  },
  partnerSites: {
    ca: "https://policies.google.com/technologies/partner-sites?hl=ca",
    es: "https://policies.google.com/technologies/partner-sites?hl=es",
    en: "https://policies.google.com/technologies/partner-sites?hl=en",
  },
  googleAds: {
    ca: "https://policies.google.com/technologies/ads?hl=ca",
    es: "https://policies.google.com/technologies/ads?hl=es",
    en: "https://policies.google.com/technologies/ads?hl=en",
  },
  googleCookies: {
    ca: "https://policies.google.com/technologies/cookies?hl=ca",
    es: "https://policies.google.com/technologies/cookies?hl=es",
    en: "https://policies.google.com/technologies/cookies?hl=en",
  },
} as const;

/** The date the advertising wording was last checked against Google's pages. */
export const AD_POLICY_VERIFIED = "2026-11-11";

function advertisingSection(locale: Locale): Block[] {
  const cookies = legalPath("cookies", locale);
  const notice = legalPath("legal-notice", locale);
  const L = AD_LINKS;

  const copy: Record<Locale, Block[]> = {
    ca: section(
      "Publicitat (Google AdSense)",
      "**Avui:** el web no mostra cap anunci i no carrega cap codi publicitari. No s'instal·la cap galeta de publicitat i no s'envia res a cap xarxa d'anuncis, triïs el que triïs al bàner de galetes.",
      `**El que està previst:** tenim previst finançar el web amb anuncis servits per Google a través del programa AdSense. Abans que es mostri el primer anunci actualitzarem aquesta política, la [política de galetes](${cookies}) i l'[avís legal](${notice}).`,
      "**Com funcionen les galetes publicitàries quan hi hagi anuncis:** proveïdors tercers, inclòs Google, fan servir galetes per mostrar anuncis basats en les visites anteriors d'un usuari a aquest web o a altres webs. L'ús de galetes publicitàries permet a Google i als seus socis mostrar-te anuncis basats en les teves visites a aquest web i/o a altres webs d'internet. Com a conseqüència de la publicitat, Google i altres proveïdors poden instal·lar i llegir galetes al teu navegador, o fer servir balises web i l'adreça IP per recollir informació.",
      `**Com desactivar la publicitat personalitzada:** pots desactivar la publicitat personalitzada de Google a la [configuració d'anuncis de Google](${L.adsSettings}). Pots desactivar l'ús de galetes per a publicitat personalitzada d'alguns altres proveïdors a [www.aboutads.info/choices](${L.aboutAds}) o, a Europa, a [Your Online Choices](${L.yourOnlineChoices.ca}). Si desactives la personalització, encara pots veure anuncis, triats per factors com la teva ubicació general derivada de l'adreça IP, el tipus de navegador o el que cerques. Si a més de Google hi serveixen anuncis altres proveïdors o xarxes, els anomenarem en aquesta pàgina amb l'enllaç a la seva pàgina per desactivar-los.`,
      `**Com fa servir Google les dades:** Google ho explica a [Com utilitza Google la informació dels llocs web o de les aplicacions que utilitzen els nostres serveis](${L.partnerSites.ca}) i a la seva pàgina sobre [publicitat](${L.googleAds.ca}).`,
      "**Consentiment a l'EEE, el Regne Unit i Suïssa:** hi mostrarem anuncis només amb una plataforma de gestió del consentiment certificada per Google i integrada amb el Marc de Transparència i Consentiment de l'IAB (TCF). Et preguntarà abans d'instal·lar cap galeta publicitària o de fer servir dades personals per personalitzar anuncis, identificarà cada proveïdor i et deixarà refusar o retirar el consentiment en qualsevol moment. La base jurídica serà el teu consentiment. Fins que els anuncis no estiguin actius, no s'instal·la cap galeta de publicitat.",
    ),
    es: section(
      "Publicidad (Google AdSense)",
      "**Hoy:** el sitio no muestra ningún anuncio y no carga ningún código publicitario. No se instala ninguna cookie de publicidad y no se envía nada a ninguna red de anuncios, elijas lo que elijas en el banner de cookies.",
      `**Lo que está previsto:** tenemos previsto financiar el sitio con anuncios servidos por Google a través del programa AdSense. Antes de que se muestre el primer anuncio actualizaremos esta política, la [política de cookies](${cookies}) y el [aviso legal](${notice}).`,
      "**Cómo funcionan las cookies publicitarias cuando haya anuncios:** proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores de un usuario a este sitio web o a otros sitios web. El uso de cookies publicitarias permite a Google y a sus socios mostrarte anuncios basados en tus visitas a este sitio y/o a otros sitios de internet. Como consecuencia de la publicidad, Google y otros proveedores pueden instalar y leer cookies en tu navegador, o usar balizas web y la dirección IP para recoger información.",
      `**Cómo desactivar la publicidad personalizada:** puedes desactivar la publicidad personalizada de Google en la [configuración de anuncios de Google](${L.adsSettings}). Puedes desactivar el uso de cookies para publicidad personalizada de algunos otros proveedores en [www.aboutads.info/choices](${L.aboutAds}) o, en Europa, en [Your Online Choices](${L.yourOnlineChoices.es}). Si desactivas la personalización, aún puedes ver anuncios, elegidos por factores como tu ubicación general derivada de la dirección IP, el tipo de navegador o lo que buscas. Si además de Google sirven anuncios otros proveedores o redes, los nombraremos en esta página con el enlace a su página para desactivarlos.`,
      `**Cómo usa Google los datos:** Google lo explica en [Cómo utiliza Google la información de sitios web o aplicaciones que utilizan nuestros servicios](${L.partnerSites.es}) y en su página sobre [publicidad](${L.googleAds.es}).`,
      "**Consentimiento en el EEE, el Reino Unido y Suiza:** solo mostraremos anuncios con una plataforma de gestión del consentimiento certificada por Google e integrada con el Marco de Transparencia y Consentimiento de IAB (TCF). Te preguntará antes de instalar ninguna cookie publicitaria o de usar datos personales para personalizar anuncios, identificará a cada proveedor y te dejará rechazar o retirar el consentimiento en cualquier momento. La base jurídica será tu consentimiento. Hasta que los anuncios no estén activos, no se instala ninguna cookie de publicidad.",
    ),
    en: section(
      "Advertising (Google AdSense)",
      "**Today:** the site shows no ads and loads no advertising code. No advertising cookie is set and nothing is sent to any ad network, whatever you choose in the cookie banner.",
      `**What is planned:** we plan to fund the site with ads served by Google through its AdSense programme. Before the first ad is shown we will update this policy, the [cookie policy](${cookies}) and the [legal notice](${notice}).`,
      "**How advertising cookies work once ads are shown:** third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the Internet. As a result of ad serving, Google and other vendors may place and read cookies on your browser, or use web beacons and your IP address to collect information.",
      `**Opting out of personalised advertising:** you can opt out of personalised advertising from Google in [Google's Ads Settings](${L.adsSettings}). You can opt out of some other vendors' use of cookies for personalised advertising at [www.aboutads.info/choices](${L.aboutAds}) or, in Europe, at [Your Online Choices](${L.yourOnlineChoices.en}). With personalisation off you may still see ads, chosen by factors such as your general location derived from your IP address, your browser type and your searches. If vendors or ad networks other than Google serve ads here, we will name them on this page with a link to their opt-out page.`,
      `**How Google uses data:** Google explains it in [How Google uses information from sites or apps that use our services](${L.partnerSites.en}) and on its [advertising](${L.googleAds.en}) page.`,
      "**Consent in the EEA, the UK and Switzerland:** ads will be shown there only through a consent management platform certified by Google and integrated with the IAB Transparency and Consent Framework (TCF). It will ask before any advertising cookie is set or any personal data is used to personalise ads, name each vendor, and let you refuse or withdraw consent at any time. The legal basis will be your consent. Until ads are active, no advertising cookie is set.",
    ),
  };

  return copy[locale];
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
          { label: "Publicitat", value: "Encara cap anunci; prevista amb Google AdSense, personalitzada només si hi consents" },
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
      ...advertisingSection(locale),
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
          { label: "Publicidad", value: "Aún ningún anuncio; prevista con Google AdSense, personalizada solo si consientes" },
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
      ...advertisingSection(locale),
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
          { label: "Advertising", value: "No ads yet; planned with Google AdSense, personalised only if you consent" },
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
      ...advertisingSection(locale),
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
  verifiedAt: AD_POLICY_VERIFIED,
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

/**
 * Advertising cookies: none today, and what changes when ads are switched on.
 * Kept out of COOKIES on purpose: that list is what the site sets now, and a
 * test holds it to the code. Sources and check date: AD_LINKS above.
 */
function advertisingCookies(locale: Locale): Block[] {
  const privacy = legalPath("privacy", locale);
  const L = AD_LINKS;

  const table: Record<Locale, Block> = {
    ca: {
      type: "table",
      caption: "Galetes de publicitat",
      headers: ["Què", "Avui", "Quan s'activin els anuncis"],
      rows: [
        ["Galetes", "Cap", "Galetes de Google (AdSense) i, si n'hi ha, d'altres proveïdors d'anuncis, des dels seus dominis o des del d'aquest web"],
        ["Finalitat", "—", "Mostrar anuncis, limitar quantes vegades en veus un, detectar frau i, si hi consents, personalitzar-los segons les teves visites a aquest web i a altres"],
        ["Consentiment", "—", "A l'EEE, el Regne Unit i Suïssa, amb una plataforma de gestió del consentiment certificada per Google (IAB TCF), abans d'instal·lar-ne cap"],
        ["Noms i durades", "—", `Els publica Google a la seva [pàgina sobre galetes](${L.googleCookies.ca}); la plataforma de consentiment els llistarà per proveïdor`],
      ],
    } as Block,
    es: {
      type: "table",
      caption: "Cookies de publicidad",
      headers: ["Qué", "Hoy", "Cuando se activen los anuncios"],
      rows: [
        ["Cookies", "Ninguna", "Cookies de Google (AdSense) y, si los hay, de otros proveedores de anuncios, desde sus dominios o desde el de este sitio"],
        ["Finalidad", "—", "Mostrar anuncios, limitar cuántas veces ves uno, detectar fraude y, si consientes, personalizarlos según tus visitas a este sitio y a otros"],
        ["Consentimiento", "—", "En el EEE, el Reino Unido y Suiza, con una plataforma de gestión del consentimiento certificada por Google (IAB TCF), antes de instalar ninguna"],
        ["Nombres y duraciones", "—", `Los publica Google en su [página sobre cookies](${L.googleCookies.es}); la plataforma de consentimiento los listará por proveedor`],
      ],
    } as Block,
    en: {
      type: "table",
      caption: "Advertising cookies",
      headers: ["What", "Today", "When ads are switched on"],
      rows: [
        ["Cookies", "None", "Cookies from Google (AdSense) and, if any, other ad vendors, set from their domains or from this site's"],
        ["Purpose", "—", "Serving ads, capping how often you see one, detecting fraud and, if you consent, personalising them based on your visits to this site and others"],
        ["Consent", "—", "In the EEA, the UK and Switzerland, through a consent management platform certified by Google (IAB TCF), before any is set"],
        ["Names and durations", "—", `Published by Google on its [cookies page](${L.googleCookies.en}); the consent platform will list them per vendor`],
      ],
    } as Block,
  };

  const text: Record<Locale, Block[]> = {
    ca: section(
      "Galetes de publicitat",
      "Avui, cap. Tenim previst mostrar anuncis servits per Google (AdSense); fins que no estiguin actius, no s'instal·la cap galeta de publicitat. Quan s'activin, proveïdors tercers, inclòs Google, faran servir galetes per mostrar anuncis basats en les teves visites anteriors a aquest web o a altres webs.",
    ),
    es: section(
      "Cookies de publicidad",
      "Hoy, ninguna. Tenemos previsto mostrar anuncios servidos por Google (AdSense); hasta que no estén activos, no se instala ninguna cookie de publicidad. Cuando se activen, proveedores externos, incluido Google, usarán cookies para mostrar anuncios basados en tus visitas anteriores a este sitio o a otros sitios web.",
    ),
    en: section(
      "Advertising cookies",
      "None today. We plan to show ads served by Google (AdSense); until they are active, no advertising cookie is set. Once they are, third-party vendors, including Google, will use cookies to serve ads based on your prior visits to this site or other websites.",
    ),
  };

  const after: Record<Locale, string> = {
    ca: `Com desactivar la publicitat personalitzada (configuració d'anuncis de Google, aboutads.info, Your Online Choices) i com fa servir Google les dades s'explica a la [política de privadesa](${privacy}).`,
    es: `Cómo desactivar la publicidad personalizada (configuración de anuncios de Google, aboutads.info, Your Online Choices) y cómo usa Google los datos se explica en la [política de privacidad](${privacy}).`,
    en: `How to opt out of personalised advertising (Google's Ads Settings, aboutads.info, Your Online Choices) and how Google uses data is explained in the [privacy policy](${privacy}).`,
  };

  return [...text[locale], table[locale], ...paragraphs(after[locale])];
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
        text: "Les galetes de mesura només s'instal·len si les acceptes explícitament. Avui no s'instal·la cap galeta de publicitat, perquè el web encara no mostra anuncis.",
      } as Block,
      ...advertisingCookies(locale),
      ...section(
        "Com canviar la teva decisió",
        "Pots canviar-la en qualsevol moment des del botó de configuració de galetes del peu de pàgina. També pots esborrar les galetes des de la configuració del teu navegador; llavors se't tornarà a preguntar.",
        "Si esborres la galeta `ci_consent`, la decisió desapareix i el web torna a l'estat inicial: tot denegat.",
      ),
      ...section(
        "Google Consent Mode",
        "Fem servir el mode de consentiment de Google en versió 2. Avui els senyals de publicitat (`ad_storage`, `ad_user_data`, `ad_personalization`) queden denegats triïs el que triïs, no només fins que decideixes: el web encara no mostra anuncis. Quan n'hi hagi, només s'activaran si ho acceptes a la plataforma de consentiment certificada.",
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
        text: "Las cookies de medición solo se instalan si las aceptas explícitamente. Hoy no se instala ninguna cookie de publicidad, porque el sitio todavía no muestra anuncios.",
      } as Block,
      ...advertisingCookies(locale),
      ...section(
        "Cómo cambiar tu decisión",
        "Puedes cambiarla en cualquier momento desde el botón de configuración de cookies del pie de página. También puedes borrar las cookies desde la configuración de tu navegador; entonces se te volverá a preguntar.",
        "Si borras la cookie `ci_consent`, la decisión desaparece y el sitio vuelve al estado inicial: todo denegado.",
      ),
      ...section(
        "Google Consent Mode",
        "Usamos el modo de consentimiento de Google en versión 2. Hoy las señales publicitarias (`ad_storage`, `ad_user_data`, `ad_personalization`) quedan denegadas elijas lo que elijas, no solo hasta que decides: el sitio todavía no muestra anuncios. Cuando los haya, solo se activarán si lo aceptas en la plataforma de consentimiento certificada.",
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
        text: "Measurement cookies are set only if you explicitly accept them. No advertising cookie is set today, because the site does not show ads yet.",
      } as Block,
      ...advertisingCookies(locale),
      ...section(
        "Changing your decision",
        "You can change it at any time from the cookie settings button in the footer. You can also delete cookies in your browser settings, after which you will be asked again.",
        "If you delete the `ci_consent` cookie, the decision is gone and the site returns to its initial state: everything denied.",
      ),
      ...section(
        "Google Consent Mode",
        "We use Google Consent Mode v2. Today the advertising signals (`ad_storage`, `ad_user_data`, `ad_personalization`) stay denied whatever you choose, not merely until you choose: the site does not show ads yet. Once it does, they will be granted only if you accept them in the certified consent platform.",
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
  verifiedAt: AD_POLICY_VERIFIED,
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...COOKIE_COPY[locale], blocks: cookieBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/** Re-exported so the sitemap-facing module has one import. */
export const PRIVACY_CONTACT_EMAIL = SITE.contactEmail;
