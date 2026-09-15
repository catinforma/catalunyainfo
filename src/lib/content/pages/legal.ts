import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { SITE } from "@/lib/site";
import { OPERATOR, hasLegalIdentity } from "./operator";
import { legalEntryPath, paragraphs, section, type PageCopy, type PageSpec } from "./types";

/**
 * Legal hub, legal notice, corrections, sources, editorial policy and
 * accessibility. Privacy and cookies live in `privacy.ts` because they are
 * long enough on their own.
 */

/* -------------------------------------------------------------------------- */
/* The legal hub                                                              */
/* -------------------------------------------------------------------------- */

const HUB_ITEMS: { key: Parameters<typeof legalPath>[0]; label: Record<Locale, string>; note: Record<Locale, string> }[] = [
  {
    key: "legal-notice",
    label: { ca: "Avís legal", es: "Aviso legal", en: "Legal notice" },
    note: {
      ca: "Qui edita aquest web, com contactar-hi i en quines condicions es fa servir.",
      es: "Quién edita este sitio, cómo contactar y en qué condiciones se utiliza.",
      en: "Who publishes this site, how to reach us, and the terms of use.",
    },
  },
  {
    key: "privacy",
    label: { ca: "Política de privadesa", es: "Política de privacidad", en: "Privacy policy" },
    note: {
      ca: "Quines dades tractem, per què, durant quant de temps i quins drets tens.",
      es: "Qué datos tratamos, para qué, durante cuánto tiempo y qué derechos tienes.",
      en: "What data we process, why, for how long, and your rights.",
    },
  },
  {
    key: "cookies",
    label: { ca: "Política de galetes", es: "Política de cookies", en: "Cookie policy" },
    note: {
      ca: "Una llista de cada galeta que instal·lem, amb durada i finalitat.",
      es: "Una lista de cada cookie que instalamos, con duración y finalidad.",
      en: "Every cookie we set, with its purpose and duration.",
    },
  },
  {
    key: "editorial-policy",
    label: { ca: "Política editorial", es: "Política editorial", en: "Editorial policy" },
    note: {
      ca: "Com decidim què publiquem, com ho verifiquem i què no fem mai.",
      es: "Cómo decidimos qué publicamos, cómo lo verificamos y qué no hacemos nunca.",
      en: "How we decide what to publish, how we verify it, and what we never do.",
    },
  },
  {
    key: "corrections",
    label: { ca: "Correccions", es: "Correcciones", en: "Corrections" },
    note: {
      ca: "Com avisar-nos d'un error i què fem quan ens equivoquem.",
      es: "Cómo avisarnos de un error y qué hacemos cuando nos equivocamos.",
      en: "How to report an error and what we do when we get something wrong.",
    },
  },
  {
    key: "sources",
    label: { ca: "Fonts", es: "Fuentes", en: "Sources" },
    note: {
      ca: "D'on surt la informació i per què citem sempre la font oficial.",
      es: "De dónde sale la información y por qué citamos siempre la fuente oficial.",
      en: "Where the information comes from and why we always cite the official source.",
    },
  },
  {
    key: "accessibility",
    label: { ca: "Accessibilitat", es: "Accesibilidad", en: "Accessibility" },
    note: {
      ca: "El nivell que perseguim, què ja compleix el web i què encara no.",
      es: "El nivel que perseguimos, qué cumple ya el sitio y qué todavía no.",
      en: "The level we aim for, what the site already meets, and what it does not.",
    },
  },
];

function hubBlocks(locale: Locale): Block[] {
  const intro: Record<Locale, string[]> = {
    ca: [
      "Aquesta pàgina reuneix tota la informació legal i editorial de CatalunyaInfo en un sol lloc: qui hi ha darrere del web, què fem amb les dades, com treballem i com reclamar o corregir.",
      "Si busques una cosa concreta i no la trobes aquí, escriu-nos i te la responem.",
    ],
    es: [
      "Esta página reúne toda la información legal y editorial de CatalunyaInfo en un solo lugar: quién está detrás del sitio, qué hacemos con los datos, cómo trabajamos y cómo reclamar o corregir.",
      "Si buscas algo concreto y no lo encuentras aquí, escríbenos y te respondemos.",
    ],
    en: [
      "This page brings together everything legal and editorial about CatalunyaInfo in one place: who is behind the site, what we do with data, how we work, and how to complain or request a correction.",
      "If you are looking for something specific and cannot find it here, write to us.",
    ],
  };

  return [
    ...paragraphs(...(intro[locale] ?? [])),
    {
      type: "list",
      ordered: false,
      items: HUB_ITEMS.map(
        (item) => `[${item.label[locale]}](${legalPath(item.key, locale)}) — ${item.note[locale]}`,
      ),
    } as Block,
    {
      type: "callout",
      tone: "info",
      title: { ca: "Contacte", es: "Contacto", en: "Contact" }[locale],
      text: {
        ca: `Per a qualsevol qüestió legal, editorial o de protecció de dades: [${SITE.contactEmail}](mailto:${SITE.contactEmail}), o el [formulari de contacte](${sectionPath("contact", locale)}).`,
        es: `Para cualquier cuestión legal, editorial o de protección de datos: [${SITE.contactEmail}](mailto:${SITE.contactEmail}), o el [formulario de contacto](${sectionPath("contact", locale)}).`,
        en: `For any legal, editorial or data-protection matter: [${SITE.contactEmail}](mailto:${SITE.contactEmail}), or the [contact form](${sectionPath("contact", locale)}).`,
      }[locale],
    } as Block,
  ];
}

const HUB_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Informació legal i editorial",
    seoTitle: "Informació legal i editorial",
    seoDescription:
      "Avís legal, privadesa, galetes, política editorial, correccions, fonts i accessibilitat de CatalunyaInfo.",
    excerpt:
      "Avís legal, privadesa, galetes, política editorial, correccions, fonts i accessibilitat.",
  },
  es: {
    title: "Información legal y editorial",
    seoTitle: "Información legal y editorial",
    seoDescription:
      "Aviso legal, privacidad, cookies, política editorial, correcciones, fuentes y accesibilidad de CatalunyaInfo.",
    excerpt:
      "Aviso legal, privacidad, cookies, política editorial, correcciones, fuentes y accesibilidad.",
  },
  en: {
    title: "Legal and editorial information",
    seoTitle: "Legal and editorial information",
    seoDescription:
      "Legal notice, privacy, cookies, editorial policy, corrections, sources and accessibility for CatalunyaInfo.",
    excerpt: "Legal notice, privacy, cookies, editorial policy, corrections, sources and accessibility.",
  },
};

export const LEGAL_HUB: PageSpec = {
  key: "page-legal-hub",
  path: { ca: "legal", es: "legal", en: "legal" },
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...HUB_COPY[locale], blocks: hubBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Legal notice                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The identity block renders only the fields that are actually known. An
 * incomplete legal notice is a gap to close; an invented tax number is a false
 * statement, so the missing rows are simply absent.
 */
function identityFacts(locale: Locale): Block {
  const label = {
    ca: { brand: "Denominació", legal: "Titular", tax: "NIF", addr: "Adreça", reg: "Registre", email: "Correu", host: "Allotjament" },
    es: { brand: "Denominación", legal: "Titular", tax: "NIF", addr: "Dirección", reg: "Registro", email: "Correo", host: "Alojamiento" },
    en: { brand: "Name", legal: "Publisher", tax: "Tax ID", addr: "Address", reg: "Registry", email: "Email", host: "Hosting" },
  }[locale];

  const items: { label: string; value: string }[] = [{ label: label.brand, value: OPERATOR.brand }];
  if (OPERATOR.legalName) items.push({ label: label.legal, value: OPERATOR.legalName });
  if (OPERATOR.taxId) items.push({ label: label.tax, value: OPERATOR.taxId });
  if (OPERATOR.address) items.push({ label: label.addr, value: OPERATOR.address });
  if (OPERATOR.registry) items.push({ label: label.reg, value: OPERATOR.registry });
  items.push({ label: label.email, value: OPERATOR.email });
  items.push({ label: label.host, value: "Vercel Inc." });

  return {
    type: "keyFacts",
    title: { ca: "Dades identificatives", es: "Datos identificativos", en: "Publisher details" }[locale],
    items,
  } as Block;
}

function legalNoticeBlocks(locale: Locale): Block[] {
  const contact = sectionPath("contact", locale);
  const privacy = legalPath("privacy", locale);
  const editorial = legalPath("editorial-policy", locale);
  const corrections = legalPath("corrections", locale);

  const pendingIdentity: Record<Locale, string> = {
    ca: "CatalunyaInfo és, avui, un projecte editorial sense activitat comercial: no hi ha publicitat, ni enllaços d'afiliació, ni venda de cap producte o servei. Quan n'hi hagi, aquesta pàgina incorporarà les dades identificatives completes que exigeix l'article 10 de la Llei 34/2002 abans que s'activi cap forma d'ingrés.",
    es: "CatalunyaInfo es hoy un proyecto editorial sin actividad comercial: no hay publicidad, ni enlaces de afiliación, ni venta de ningún producto o servicio. Cuando la haya, esta página incorporará los datos identificativos completos que exige el artículo 10 de la Ley 34/2002 antes de que se active ninguna forma de ingreso.",
    en: "CatalunyaInfo is currently an editorial project with no commercial activity: no advertising, no affiliate links, nothing for sale. If that changes, this page will carry the full publisher details required by article 10 of Spain's Law 34/2002 before any form of revenue is switched on.",
  };

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: `Aquest avís legal regula l'accés i l'ús de ${SITE.productionOrigin}, editat per ${OPERATOR.brand}.`,
      } as Block,
      identityFacts(locale),
      ...(hasLegalIdentity() ? [] : paragraphs(pendingIdentity.ca)),
      ...section(
        "Objecte del web",
        "CatalunyaInfo publica informació pràctica i verificada sobre Catalunya: on anar, com arribar-hi, què cal saber abans i on consultar la font oficial. És un mitjà informatiu independent, no una administració pública ni una oficina de turisme oficial.",
        `Com treballem i què no fem mai ho expliquem a la [política editorial](${editorial}).`,
      ),
      ...section(
        "Condicions d'ús",
        "L'accés al web és lliure i gratuït. En fer-ne ús, acceptes aquestes condicions.",
        "Et compromets a no utilitzar el web ni els seus continguts per a finalitats il·lícites, ni a intentar-ne alterar el funcionament, accedir a àrees restringides o extreure'n dades de manera massiva i automatitzada sense autorització.",
      ),
      ...section(
        "Informació orientativa i responsabilitat",
        "Els horaris, preus, dates, condicions d'accés i normatives canvien. Publiquem la data de verificació a cada pàgina i enllacem sempre a la font oficial, però **la font oficial és la que mana**: confirma-hi la informació abans de desplaçar-te o de prendre una decisió.",
        "CatalunyaInfo no es fa responsable dels danys derivats de decisions preses únicament a partir d'informació d'aquest web, ni de l'estat o el contingut dels webs de tercers que enllacem. Enllaçar una font no implica que en compartim els criteris ni que en controlem el contingut.",
        "Aquest web no ofereix assessorament jurídic, mèdic, financer ni professional de cap tipus.",
      ),
      ...section(
        "Activitats a la natura",
        "Part del contingut fa referència a excursions, boscos, muntanya i activitats a l'aire lliure. Aquestes activitats comporten riscos propis. La informació que publiquem és orientativa i no substitueix ni la previsió meteorològica oficial, ni la normativa del parc o de la propietat, ni el teu propi criteri.",
      ),
      ...section(
        "Propietat intel·lectual",
        "Els textos, la marca, el disseny i el codi d'aquest web són titularitat de l'editor, llevat del que s'indiqui altrament. Les imatges generades amb intel·ligència artificial s'identifiquen com a tals al peu de cada imatge.",
        "Pots citar fragments breus amb atribució i un enllaç a la pàgina original. No en pots fer una reproducció íntegra ni sistemàtica, ni utilitzar el contingut per entrenar models sense autorització expressa.",
        `Si creus que algun contingut vulnera drets teus, escriu-nos a [${SITE.contactEmail}](mailto:${SITE.contactEmail}) i el revisarem sense demora.`,
      ),
      ...section(
        "Correccions",
        `Si hi detectes un error, avisa'ns. El procediment i els terminis són a la pàgina de [correccions](${corrections}).`,
      ),
      ...section(
        "Dades personals i galetes",
        `El tractament de dades s'explica a la [política de privadesa](${privacy}) i les galetes a la [política de galetes](${legalPath("cookies", locale)}).`,
      ),
      ...section(
        "Legislació i jurisdicció",
        "Aquestes condicions es regeixen per la legislació espanyola. Per a qualsevol controvèrsia, les parts se sotmeten als jutjats i tribunals que corresponguin segons la normativa aplicable, sense perjudici del fur que la llei reconegui als consumidors.",
      ),
      ...section(
        "Contacte",
        `Pots escriure'ns pel [formulari de contacte](${contact}) o a [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: `Este aviso legal regula el acceso y el uso de ${SITE.productionOrigin}, editado por ${OPERATOR.brand}.`,
      } as Block,
      identityFacts(locale),
      ...(hasLegalIdentity() ? [] : paragraphs(pendingIdentity.es)),
      ...section(
        "Objeto del sitio",
        "CatalunyaInfo publica información práctica y verificada sobre Cataluña: dónde ir, cómo llegar, qué conviene saber antes y dónde consultar la fuente oficial. Es un medio informativo independiente, no una administración pública ni una oficina de turismo oficial.",
        `Cómo trabajamos y qué no hacemos nunca se explica en la [política editorial](${editorial}).`,
      ),
      ...section(
        "Condiciones de uso",
        "El acceso al sitio es libre y gratuito. Al utilizarlo, aceptas estas condiciones.",
        "Te comprometes a no utilizar el sitio ni sus contenidos con fines ilícitos, ni a intentar alterar su funcionamiento, acceder a áreas restringidas o extraer datos de forma masiva y automatizada sin autorización.",
      ),
      ...section(
        "Información orientativa y responsabilidad",
        "Horarios, precios, fechas, condiciones de acceso y normativas cambian. Publicamos la fecha de verificación en cada página y enlazamos siempre a la fuente oficial, pero **la fuente oficial es la que manda**: confírmala antes de desplazarte o de tomar una decisión.",
        "CatalunyaInfo no se responsabiliza de los daños derivados de decisiones tomadas únicamente a partir de la información de este sitio, ni del estado o el contenido de los sitios de terceros que enlazamos. Enlazar una fuente no implica compartir sus criterios ni controlar su contenido.",
        "Este sitio no ofrece asesoramiento jurídico, médico, financiero ni profesional de ningún tipo.",
      ),
      ...section(
        "Actividades en la naturaleza",
        "Parte del contenido se refiere a excursiones, bosques, montaña y actividades al aire libre, que conllevan riesgos propios. La información publicada es orientativa y no sustituye la previsión meteorológica oficial, la normativa del parque o de la propiedad, ni tu propio criterio.",
      ),
      ...section(
        "Propiedad intelectual",
        "Los textos, la marca, el diseño y el código de este sitio son titularidad del editor, salvo indicación en contra. Las imágenes generadas con inteligencia artificial se identifican como tales al pie de cada imagen.",
        "Puedes citar fragmentos breves con atribución y enlace a la página original. No está permitida su reproducción íntegra o sistemática, ni el uso del contenido para entrenar modelos sin autorización expresa.",
        `Si consideras que algún contenido vulnera tus derechos, escríbenos a [${SITE.contactEmail}](mailto:${SITE.contactEmail}) y lo revisaremos sin demora.`,
      ),
      ...section(
        "Correcciones",
        `Si detectas un error, avísanos. El procedimiento y los plazos están en la página de [correcciones](${corrections}).`,
      ),
      ...section(
        "Datos personales y cookies",
        `El tratamiento de datos se explica en la [política de privacidad](${privacy}) y las cookies en la [política de cookies](${legalPath("cookies", locale)}).`,
      ),
      ...section(
        "Legislación y jurisdicción",
        "Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan según la normativa aplicable, sin perjuicio del fuero que la ley reconozca a los consumidores.",
      ),
      ...section(
        "Contacto",
        `Puedes escribirnos por el [formulario de contacto](${contact}) o a [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: `This notice governs access to and use of ${SITE.productionOrigin}, published by ${OPERATOR.brand}.`,
      } as Block,
      identityFacts(locale),
      ...(hasLegalIdentity() ? [] : paragraphs(pendingIdentity.en)),
      ...section(
        "What this site is",
        "CatalunyaInfo publishes practical, verified information about Catalonia: where to go, how to get there, what to know beforehand and where to check the official source. It is an independent publication, not a public authority or an official tourist board.",
        `How we work, and what we never do, is set out in our [editorial policy](${editorial}).`,
      ),
      ...section(
        "Terms of use",
        "Access is free of charge. By using the site you accept these terms.",
        "You agree not to use the site or its content for unlawful purposes, and not to attempt to disrupt its operation, reach restricted areas, or extract data in bulk by automated means without permission.",
      ),
      ...section(
        "Guidance, not guarantees",
        "Opening hours, prices, dates, access conditions and regulations change. We publish a verification date on every page and always link the official source, but **the official source prevails**: check it before travelling or making a decision.",
        "CatalunyaInfo accepts no liability for decisions taken solely on the basis of information on this site, nor for the content or availability of third-party sites we link to. Linking a source does not mean we endorse or control it.",
        "Nothing here is legal, medical, financial or professional advice.",
      ),
      ...section(
        "Outdoor activities",
        "Some content concerns hiking, forests, mountains and other outdoor activities, which carry inherent risks. What we publish is guidance; it does not replace the official weather forecast, the rules of the park or landowner, or your own judgement.",
      ),
      ...section(
        "Intellectual property",
        "Text, brand, design and code on this site belong to the publisher unless stated otherwise. Images generated with artificial intelligence are identified as such in the caption beneath each image.",
        "You may quote short extracts with attribution and a link to the original page. Full or systematic reproduction is not permitted, nor is using the content to train models without express permission.",
        `If you believe any content infringes your rights, write to [${SITE.contactEmail}](mailto:${SITE.contactEmail}) and we will review it promptly.`,
      ),
      ...section(
        "Corrections",
        `If you spot an error, tell us. The process and timescales are on the [corrections page](${corrections}).`,
      ),
      ...section(
        "Personal data and cookies",
        `Data processing is described in the [privacy policy](${privacy}) and cookies in the [cookie policy](${legalPath("cookies", locale)}).`,
      ),
      ...section(
        "Governing law",
        "These terms are governed by Spanish law. Any dispute will be heard by the courts designated under applicable legislation, without prejudice to any forum granted to consumers by law.",
      ),
      ...section(
        "Contact",
        `Use the [contact form](${contact}) or write to [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
      ),
    ],
  };

  return copy[locale];
}

const LEGAL_NOTICE_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Avís legal",
    seoTitle: "Avís legal",
    seoDescription:
      "Qui edita CatalunyaInfo, condicions d'ús, responsabilitat sobre la informació publicada i propietat intel·lectual.",
    excerpt: "Qui edita el web, condicions d'ús, responsabilitat i propietat intel·lectual.",
  },
  es: {
    title: "Aviso legal",
    seoTitle: "Aviso legal",
    seoDescription:
      "Quién edita CatalunyaInfo, condiciones de uso, responsabilidad sobre la información publicada y propiedad intelectual.",
    excerpt: "Quién edita el sitio, condiciones de uso, responsabilidad y propiedad intelectual.",
  },
  en: {
    title: "Legal notice",
    seoTitle: "Legal notice",
    seoDescription:
      "Who publishes CatalunyaInfo, terms of use, liability for published information, and intellectual property.",
    excerpt: "Who publishes the site, terms of use, liability and intellectual property.",
  },
};

export const LEGAL_NOTICE: PageSpec = {
  key: "page-legal-notice",
  path: legalEntryPath("legal-notice"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      { ...LEGAL_NOTICE_COPY[locale], blocks: legalNoticeBlocks(locale) },
    ]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Editorial policy                                                           */
/* -------------------------------------------------------------------------- */

function editorialBlocks(locale: Locale): Block[] {
  const sources = legalPath("sources", locale);
  const corrections = legalPath("corrections", locale);
  const about = sectionPath("about", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo existeix per respondre bé una pregunta concreta: què necessites saber abans d'anar a un lloc de Catalunya. Aquesta pàgina explica com decidim què publiquem, com ho comprovem i què no farem mai.",
      } as Block,
      ...section(
        "Què publiquem",
        "Publiquem informació pràctica i verificable: horaris, accessos, dates, condicions, com arribar-hi i què cal tenir en compte. Prioritzem el que es pot comprovar en una font oficial o primària.",
        "No publiquem res només perquè es busqui molt. Si no podem verificar una dada, no la publiquem: preferim dir «no ho sabem» que omplir un buit.",
      ),
      ...section(
        "Com ho verifiquem",
        `Cada pàgina cita les fonts que hem consultat i porta una data de verificació visible. Els criteris de selecció de fonts són a la pàgina de [fonts](${sources}).`,
        "Quan una dada prové d'una estació meteorològica, d'un parc natural o d'un ajuntament, ho diem i enllacem l'original. Quan una xifra descriu un punt de mesura concret, no la presentem com si descrivís tota una comarca.",
      ),
      ...section(
        "Distingim fets, orientació i opinió",
        "Un horari publicat per un ajuntament és un fet. «El millor cap de setmana per anar-hi» és una orientació editorial. Quan una cosa és orientació nostra i no una dada oficial, ho diem explícitament a la mateixa frase, no en una nota al final.",
        "Tampoc convertim una previsió en una promesa. Si una finestra temporal és aproximada, la pàgina ho diu.",
      ),
      ...section(
        "Intel·ligència artificial",
        "Fem servir eines d'IA com a suport de redacció i per generar algunes il·lustracions. Dues regles no negociables:",
        "**Cap contingut generat per IA es publica automàticament.** Tot passa per revisió humana abans de publicar-se, i la responsabilitat editorial és sempre humana.",
        "**Les imatges generades s'identifiquen sempre**, al peu de la imatge, en tots els idiomes. No presentem mai una imatge generada com si fos una fotografia real d'un lloc concret.",
      ),
      ...section(
        "Independència i diners",
        "Ara mateix el web no té publicitat, ni enllaços d'afiliació, ni continguts patrocinats. Ningú no ens paga per aparèixer-hi ni per aparèixer-hi millor.",
        "Si algun dia n'hi ha, es marcarà de manera clara i visible abans del contingut afectat, mai amagat al final, i no canviarà què recomanem.",
      ),
      ...section(
        "Actualització i retirada",
        "La informació pràctica caduca. Revisem les pàgines periòdicament i hi actualitzem la data de verificació. Quan una pàgina ja no és fiable i no la podem actualitzar, la marquem com a pendent d'actualitzar o la retirem.",
        `Si trobes una dada obsoleta, la manera més ràpida d'arreglar-ho és [avisar-nos](${corrections}).`,
      ),
      ...section(
        "Qui hi ha darrere",
        `Pots llegir qui fa el web i amb quin criteri a [qui som](${about}).`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo existe para responder bien a una pregunta concreta: qué necesitas saber antes de ir a un lugar de Cataluña. Esta página explica cómo decidimos qué publicamos, cómo lo comprobamos y qué no haremos nunca.",
      } as Block,
      ...section(
        "Qué publicamos",
        "Publicamos información práctica y verificable: horarios, accesos, fechas, condiciones, cómo llegar y qué conviene tener en cuenta. Priorizamos lo que puede comprobarse en una fuente oficial o primaria.",
        "No publicamos algo solo porque se busque mucho. Si no podemos verificar un dato, no lo publicamos: preferimos decir «no lo sabemos» a rellenar un hueco.",
      ),
      ...section(
        "Cómo lo verificamos",
        `Cada página cita las fuentes consultadas y lleva una fecha de verificación visible. Los criterios de selección están en la página de [fuentes](${sources}).`,
        "Cuando un dato procede de una estación meteorológica, de un parque natural o de un ayuntamiento, lo decimos y enlazamos el original. Cuando una cifra describe un punto de medición concreto, no la presentamos como si describiera toda una comarca.",
      ),
      ...section(
        "Distinguimos hechos, orientación y opinión",
        "Un horario publicado por un ayuntamiento es un hecho. «El mejor fin de semana para ir» es una orientación editorial. Cuando algo es orientación nuestra y no un dato oficial, lo decimos explícitamente en la misma frase, no en una nota al final.",
        "Tampoco convertimos una previsión en una promesa. Si una ventana temporal es aproximada, la página lo dice.",
      ),
      ...section(
        "Inteligencia artificial",
        "Utilizamos herramientas de IA como apoyo de redacción y para generar algunas ilustraciones. Dos reglas no negociables:",
        "**Ningún contenido generado por IA se publica automáticamente.** Todo pasa por revisión humana antes de publicarse, y la responsabilidad editorial es siempre humana.",
        "**Las imágenes generadas se identifican siempre** al pie de la imagen y en todos los idiomas. Nunca presentamos una imagen generada como si fuera una fotografía real de un lugar concreto.",
      ),
      ...section(
        "Independencia y dinero",
        "Ahora mismo el sitio no tiene publicidad, ni enlaces de afiliación, ni contenidos patrocinados. Nadie nos paga por aparecer ni por aparecer mejor.",
        "Si algún día los hay, se marcarán de forma clara y visible antes del contenido afectado, nunca escondido al final, y no cambiarán lo que recomendamos.",
      ),
      ...section(
        "Actualización y retirada",
        "La información práctica caduca. Revisamos las páginas periódicamente y actualizamos su fecha de verificación. Cuando una página deja de ser fiable y no podemos actualizarla, la marcamos como pendiente o la retiramos.",
        `Si encuentras un dato obsoleto, lo más rápido es [avisarnos](${corrections}).`,
      ),
      ...section("Quién está detrás", `Puedes leer quién hace el sitio en [quiénes somos](${about}).`),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo exists to answer one question well: what you need to know before going somewhere in Catalonia. This page explains how we decide what to publish, how we check it, and what we will never do.",
      } as Block,
      ...section(
        "What we publish",
        "Practical, checkable information: opening times, access, dates, conditions, how to get there, and what to be aware of. We prioritise what can be confirmed against an official or primary source.",
        "We do not publish something merely because it is heavily searched. If we cannot verify a fact, we leave it out — saying \"we don't know\" is better than filling a gap.",
      ),
      ...section(
        "How we verify",
        `Every page cites the sources consulted and carries a visible verification date. Our criteria for choosing sources are on the [sources page](${sources}).`,
        "Where a figure comes from a weather station, a natural park or a town council, we say so and link the original. Where a figure describes one measuring point, we do not present it as describing an entire region.",
      ),
      ...section(
        "Facts, guidance and opinion are kept apart",
        "An opening time published by a council is a fact. \"The best weekend to go\" is editorial guidance. Where something is our judgement rather than an official figure, we say so in the same sentence, not in a footnote.",
        "Nor do we turn a forecast into a promise. Where a time window is approximate, the page says so.",
      ),
      ...section(
        "Artificial intelligence",
        "We use AI tools to support drafting and to generate some illustrations. Two rules are non-negotiable:",
        "**No AI-generated content is ever published automatically.** Everything goes through human review before publication, and editorial responsibility is always human.",
        "**Generated images are always labelled** in the caption, in every language. We never present a generated image as a real photograph of a specific place.",
      ),
      ...section(
        "Independence and money",
        "The site currently carries no advertising, no affiliate links and no sponsored content. Nobody pays to appear here, or to appear more favourably.",
        "If that ever changes, it will be marked clearly and visibly before the content concerned — never buried at the end — and it will not change what we recommend.",
      ),
      ...section(
        "Updating and withdrawal",
        "Practical information goes stale. We review pages periodically and update the verification date. When a page can no longer be trusted and we cannot update it, we flag it as needing an update or withdraw it.",
        `If you find something out of date, the quickest fix is to [tell us](${corrections}).`,
      ),
      ...section("Who is behind it", `You can read who makes the site on the [about page](${about}).`),
    ],
  };

  return copy[locale];
}

const EDITORIAL_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Política editorial",
    seoTitle: "Política editorial",
    seoDescription:
      "Com decidim què publiquem a CatalunyaInfo, com ho verifiquem, com fem servir la IA i per què no acceptem contingut pagat.",
    excerpt: "Com decidim què publiquem, com ho verifiquem i què no fem mai.",
  },
  es: {
    title: "Política editorial",
    seoTitle: "Política editorial",
    seoDescription:
      "Cómo decidimos qué publicamos en CatalunyaInfo, cómo lo verificamos, cómo usamos la IA y por qué no aceptamos contenido pagado.",
    excerpt: "Cómo decidimos qué publicamos, cómo lo verificamos y qué no hacemos nunca.",
  },
  en: {
    title: "Editorial policy",
    seoTitle: "Editorial policy",
    seoDescription:
      "How CatalunyaInfo decides what to publish, how we verify it, how we use AI, and why we take no paid content.",
    excerpt: "How we decide what to publish, how we verify it, and what we never do.",
  },
};

export const EDITORIAL_POLICY: PageSpec = {
  key: "page-editorial-policy",
  path: legalEntryPath("editorial-policy"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      { ...EDITORIAL_COPY[locale], blocks: editorialBlocks(locale) },
    ]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Corrections                                                                */
/* -------------------------------------------------------------------------- */

function correctionsBlocks(locale: Locale): Block[] {
  const contact = sectionPath("contact", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Ens equivocarem. El que importa és què fem després. Aquesta pàgina explica com avisar-nos d'un error i què pots esperar que passi.",
      } as Block,
      ...section(
        "Com avisar-nos",
        `La via més ràpida és el [formulari de contacte](${contact}), triant «Corregir un error en una pàgina», o un correu a [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
        "Ens ajuda molt que hi incloguis l'adreça de la pàgina, quina frase o dada és incorrecta i, si el tens, l'enllaç a la font correcta. Amb això podem verificar-ho i corregir-ho el mateix dia.",
      ),
      ...section(
        "Què fem amb un avís",
        "Comprovem la dada contra la font oficial o primària. Si l'error és nostre, el corregim i actualitzem la data de verificació de la pàgina.",
        "Si l'error és substancial —una dada que podia fer que algú es desplacés per res, un preu, una data, una condició d'accés, una atribució incorrecta— ho fem constar a la mateixa pàgina amb la data de la correcció, no ho corregim en silenci.",
        "Les correccions menors (una errada tipogràfica, un enllaç trencat) es fan sense nota.",
      ),
      ...section(
        "Terminis",
        "Objectiu: resposta en 72 hores i correcció immediata quan la dada és verificable. Si una correcció requereix consultar una administració, t'ho diem i t'anem informant.",
      ),
      ...section(
        "Si no hi estàs d'acord",
        "Si has demanat una correcció i creus que la resposta no és satisfactòria, contesta el mateix fil: ho revisa una segona persona abans de tancar-ho.",
      ),
      ...section(
        "Dret de rectificació",
        "Si consideres que una informació publicada et perjudica i és inexacta, pots exercir el dret de rectificació. Envia'ns l'escrit de rectificació i la documentació que el sustenti a la nostra adreça de contacte.",
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Nos equivocaremos. Lo que importa es qué hacemos después. Esta página explica cómo avisarnos de un error y qué puedes esperar que ocurra.",
      } as Block,
      ...section(
        "Cómo avisarnos",
        `La vía más rápida es el [formulario de contacto](${contact}), eligiendo «Corregir un error en una página», o un correo a [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
        "Nos ayuda mucho que incluyas la dirección de la página, qué frase o dato es incorrecto y, si lo tienes, el enlace a la fuente correcta. Con eso podemos verificarlo y corregirlo el mismo día.",
      ),
      ...section(
        "Qué hacemos con un aviso",
        "Comprobamos el dato contra la fuente oficial o primaria. Si el error es nuestro, lo corregimos y actualizamos la fecha de verificación de la página.",
        "Si el error es sustancial —un dato que podía hacer que alguien se desplazara en balde, un precio, una fecha, una condición de acceso, una atribución incorrecta— lo hacemos constar en la propia página con la fecha de la corrección: no corregimos en silencio.",
        "Las correcciones menores (una errata, un enlace roto) se hacen sin nota.",
      ),
      ...section(
        "Plazos",
        "Objetivo: respuesta en 72 horas y corrección inmediata cuando el dato es verificable. Si una corrección requiere consultar a una administración, te lo decimos y te mantenemos informado.",
      ),
      ...section(
        "Si no estás de acuerdo",
        "Si has pedido una corrección y consideras que la respuesta no es satisfactoria, responde en el mismo hilo: lo revisa una segunda persona antes de cerrarlo.",
      ),
      ...section(
        "Derecho de rectificación",
        "Si consideras que una información publicada te perjudica y es inexacta, puedes ejercer el derecho de rectificación. Envíanos el escrito de rectificación y la documentación que lo sustente a nuestra dirección de contacto.",
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "We will get things wrong. What matters is what happens next. This page explains how to report an error and what you can expect us to do.",
      } as Block,
      ...section(
        "How to tell us",
        `The fastest route is the [contact form](${contact}), choosing "Report an error on a page", or an email to [${SITE.contactEmail}](mailto:${SITE.contactEmail}).`,
        "It helps enormously if you include the page address, which sentence or figure is wrong and, if you have it, a link to the correct source. That lets us verify and fix it the same day.",
      ),
      ...section(
        "What we do with a report",
        "We check the fact against the official or primary source. If the error is ours, we correct it and update the page's verification date.",
        "Where the error is substantial — something that could have sent someone on a wasted journey, a price, a date, an access condition, a wrong attribution — we note it on the page itself with the date of the correction. We do not correct silently.",
        "Minor fixes (a typo, a broken link) are made without a note.",
      ),
      ...section(
        "Timescales",
        "Target: a reply within 72 hours, and an immediate fix where the fact is verifiable. If a correction requires asking a public body, we tell you and keep you posted.",
      ),
      ...section(
        "If you disagree with the outcome",
        "If you asked for a correction and are not satisfied with the response, reply on the same thread: a second person reviews it before it is closed.",
      ),
      ...section(
        "Right of reply",
        "If you believe published information about you is inaccurate and damaging, you may exercise your right of rectification. Send your statement and supporting documentation to our contact address.",
      ),
    ],
  };

  return copy[locale];
}

const CORRECTIONS_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Correccions",
    seoTitle: "Correccions",
    seoDescription:
      "Com avisar CatalunyaInfo d'un error en una pàgina, què fem amb l'avís i en quins terminis corregim.",
    excerpt: "Com avisar-nos d'un error i què fem quan ens equivoquem.",
  },
  es: {
    title: "Correcciones",
    seoTitle: "Correcciones",
    seoDescription:
      "Cómo avisar a CatalunyaInfo de un error en una página, qué hacemos con el aviso y en qué plazos corregimos.",
    excerpt: "Cómo avisarnos de un error y qué hacemos cuando nos equivocamos.",
  },
  en: {
    title: "Corrections",
    seoTitle: "Corrections",
    seoDescription:
      "How to report an error on CatalunyaInfo, what we do with the report, and how quickly we correct it.",
    excerpt: "How to report an error and what we do when we get something wrong.",
  },
};

export const CORRECTIONS: PageSpec = {
  key: "page-corrections",
  path: legalEntryPath("corrections"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      { ...CORRECTIONS_COPY[locale], blocks: correctionsBlocks(locale) },
    ]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

function sourcesBlocks(locale: Locale): Block[] {
  const corrections = legalPath("corrections", locale);
  const editorial = legalPath("editorial-policy", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Cada pàgina de CatalunyaInfo cita d'on surt la informació. Aquesta pàgina explica quines fonts fem servir, en quin ordre i per què.",
      } as Block,
      ...section(
        "L'ordre de prioritat",
        "**1. Font oficial.** Qui gestiona allò de què parlem: el parc natural, l'ajuntament, el servei meteorològic, el gestor del transport. És la font que té autoritat sobre la dada i la que enllacem sempre que existeix.",
        "**2. Font primària.** Un document, un butlletí, un registre o una base de dades publicats directament per qui els genera.",
        "**3. Premsa i mitjans especialitzats.** Útils per detectar canvis i context, però els fem servir per anar a buscar l'original, no com a substitut.",
        "**4. Observació pròpia.** Quan la fem, la identifiquem com a tal i diem quan.",
      ),
      ...section(
        "Què no acceptem com a font",
        "Agregadors sense atribució, contingut copiat entre webs, xarxes socials sense verificació independent, i qualsevol text del qual no puguem resseguir d'on surt la dada.",
        "Tampoc fem servir textos generats per IA com a font d'informació: una eina de llenguatge no és una autoritat sobre un horari ni sobre una carretera.",
      ),
      ...section(
        "Com les citem",
        "Les fonts consultades apareixen al final de la pàgina, amb el nom de l'organisme i un enllaç directe a l'original. Els enllaços van nets: sense paràmetres de seguiment afegits per nosaltres.",
        "Quan una dada té una data concreta de consulta, la pàgina porta la data de verificació corresponent.",
      ),
      ...section(
        "Quan les fonts es contradiuen",
        "Si dues fonts oficials diuen coses diferents, no en triem una en silenci: expliquem la discrepància i, si podem, preguntem a qui té l'autoritat sobre la dada.",
      ),
      ...section(
        "Enllaços a tercers",
        `Enllaçar una font no vol dir que en compartim els criteris ni que en controlem el contingut. Si trobes un enllaç trencat o que ha canviat de destí, [avisa'ns](${corrections}).`,
        `El marc general de com treballem és a la [política editorial](${editorial}).`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Cada página de CatalunyaInfo cita de dónde sale la información. Esta página explica qué fuentes usamos, en qué orden y por qué.",
      } as Block,
      ...section(
        "El orden de prioridad",
        "**1. Fuente oficial.** Quien gestiona aquello de lo que hablamos: el parque natural, el ayuntamiento, el servicio meteorológico, el gestor del transporte. Es la fuente con autoridad sobre el dato y la que enlazamos siempre que existe.",
        "**2. Fuente primaria.** Un documento, boletín, registro o base de datos publicado directamente por quien lo genera.",
        "**3. Prensa y medios especializados.** Útiles para detectar cambios y contexto, pero los usamos para llegar al original, no como sustituto.",
        "**4. Observación propia.** Cuando la hacemos, la identificamos como tal y decimos cuándo.",
      ),
      ...section(
        "Qué no aceptamos como fuente",
        "Agregadores sin atribución, contenido copiado entre webs, redes sociales sin verificación independiente y cualquier texto cuyo origen no podamos rastrear.",
        "Tampoco usamos textos generados por IA como fuente de información: una herramienta de lenguaje no es una autoridad sobre un horario ni sobre una carretera.",
      ),
      ...section(
        "Cómo las citamos",
        "Las fuentes consultadas aparecen al final de la página, con el nombre del organismo y un enlace directo al original. Los enlaces van limpios: sin parámetros de seguimiento añadidos por nosotros.",
        "Cuando un dato tiene una fecha concreta de consulta, la página lleva la fecha de verificación correspondiente.",
      ),
      ...section(
        "Cuando las fuentes se contradicen",
        "Si dos fuentes oficiales dicen cosas distintas, no elegimos una en silencio: explicamos la discrepancia y, si podemos, preguntamos a quien tiene autoridad sobre el dato.",
      ),
      ...section(
        "Enlaces a terceros",
        `Enlazar una fuente no implica compartir sus criterios ni controlar su contenido. Si encuentras un enlace roto o que ha cambiado de destino, [avísanos](${corrections}).`,
        `El marco general de cómo trabajamos está en la [política editorial](${editorial}).`,
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "Every CatalunyaInfo page cites where its information came from. This page explains which sources we use, in what order, and why.",
      } as Block,
      ...section(
        "Order of preference",
        "**1. The official source.** Whoever runs the thing we are describing: the natural park, the town council, the meteorological service, the transport operator. It has authority over the fact, and we link it wherever it exists.",
        "**2. Primary sources.** A document, bulletin, register or dataset published directly by whoever produced it.",
        "**3. Press and specialist media.** Useful for spotting changes and context, but we use them to reach the original, never as a substitute for it.",
        "**4. Our own observation.** Where we do this, we label it as such and say when.",
      ),
      ...section(
        "What we do not accept as a source",
        "Aggregators without attribution, content copied between websites, social media without independent verification, and any text whose origin we cannot trace.",
        "We also never use AI-generated text as a source of fact: a language tool is not an authority on an opening time or a mountain road.",
      ),
      ...section(
        "How we cite them",
        "Sources consulted appear at the foot of the page with the name of the organisation and a direct link to the original. Links are clean: no tracking parameters added by us.",
        "Where a fact was checked on a specific date, the page carries the corresponding verification date.",
      ),
      ...section(
        "When sources disagree",
        "If two official sources say different things, we do not quietly pick one: we explain the discrepancy and, where possible, ask whoever has authority over the fact.",
      ),
      ...section(
        "Third-party links",
        `Linking a source does not mean we endorse or control it. If you find a broken link or one that now points somewhere else, [tell us](${corrections}).`,
        `The wider framework is set out in our [editorial policy](${editorial}).`,
      ),
    ],
  };

  return copy[locale];
}

const SOURCES_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Fonts",
    seoTitle: "Fonts d'informació",
    seoDescription:
      "Quines fonts fem servir a CatalunyaInfo, en quin ordre de prioritat, què no acceptem com a font i com les citem.",
    excerpt: "D'on surt la informació i per què citem sempre la font oficial.",
  },
  es: {
    title: "Fuentes",
    seoTitle: "Fuentes de información",
    seoDescription:
      "Qué fuentes usamos en CatalunyaInfo, en qué orden de prioridad, qué no aceptamos como fuente y cómo las citamos.",
    excerpt: "De dónde sale la información y por qué citamos siempre la fuente oficial.",
  },
  en: {
    title: "Sources",
    seoTitle: "Our sources",
    seoDescription:
      "Which sources CatalunyaInfo uses, in what order of preference, what we never accept, and how we cite them.",
    excerpt: "Where the information comes from and why we always cite the official source.",
  },
};

export const SOURCES_PAGE: PageSpec = {
  key: "page-sources",
  path: legalEntryPath("sources"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...SOURCES_COPY[locale], blocks: sourcesBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Accessibility                                                              */
/* -------------------------------------------------------------------------- */

function accessibilityBlocks(locale: Locale): Block[] {
  const contact = sectionPath("contact", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Volem que aquest web es pugui fer servir amb teclat, amb lector de pantalla, amb el text ampliat i amb una connexió dolenta. Aquesta pàgina diu on som i què encara no està resolt.",
      } as Block,
      ...section(
        "Nivell de conformitat",
        "L'objectiu és complir les **WCAG 2.2 en nivell AA**. Aquesta declaració és una autoavaluació feta per l'equip editorial; no hi ha hagut auditoria externa certificada.",
      ),
      ...section(
        "Què ja fa el web",
        "Estructura semàntica real: un sol `h1` per pàgina i encapçalaments jeràrquics que permeten navegar amb lector de pantalla.",
        "Enllaç per saltar al contingut principal, focus visible a tots els elements interactius i navegació completa amb teclat.",
        "Contrast de color comprovat sobre la paleta del web, imatges amb text alternatiu, i taules amb encapçalaments associats que es reorganitzen en targetes al mòbil mantenint els rols d'accessibilitat.",
        "Text que es pot ampliar sense trencar el disseny, i pàgines que no depenen de JavaScript per mostrar el contingut.",
      ),
      ...section(
        "Què encara no està resolt",
        "No hi ha auditoria externa ni prova sistemàtica amb persones usuàries de productes de suport. Ho volem fer.",
        "Algunes il·lustracions decoratives tenen text alternatiu genèric. Els mapes incrustats de tercers depenen de l'accessibilitat del proveïdor, que no controlem.",
        "Encara no publiquem versions en lectura fàcil.",
      ),
      ...section(
        "Avisa'ns si trobes una barrera",
        `Si alguna cosa no et funciona, escriu-nos pel [formulari de contacte](${contact}) o a [${SITE.contactEmail}](mailto:${SITE.contactEmail}) explicant la pàgina, el navegador i el producte de suport que fas servir.`,
        "Responem en un màxim de 15 dies hàbils i, si podem, arreglem la barrera abans.",
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Queremos que este sitio se pueda usar con teclado, con lector de pantalla, con el texto ampliado y con una conexión mala. Esta página dice dónde estamos y qué sigue sin resolver.",
      } as Block,
      ...section(
        "Nivel de conformidad",
        "El objetivo es cumplir las **WCAG 2.2 en nivel AA**. Esta declaración es una autoevaluación del equipo editorial; no ha habido auditoría externa certificada.",
      ),
      ...section(
        "Qué hace ya el sitio",
        "Estructura semántica real: un solo `h1` por página y encabezados jerárquicos que permiten navegar con lector de pantalla.",
        "Enlace para saltar al contenido principal, foco visible en todos los elementos interactivos y navegación completa con teclado.",
        "Contraste de color comprobado sobre la paleta del sitio, imágenes con texto alternativo y tablas con encabezados asociados que se reorganizan en tarjetas en el móvil manteniendo los roles de accesibilidad.",
        "Texto ampliable sin romper el diseño y páginas que no dependen de JavaScript para mostrar el contenido.",
      ),
      ...section(
        "Qué sigue sin resolver",
        "No hay auditoría externa ni pruebas sistemáticas con personas usuarias de productos de apoyo. Queremos hacerlo.",
        "Algunas ilustraciones decorativas tienen texto alternativo genérico. Los mapas incrustados de terceros dependen de la accesibilidad del proveedor, que no controlamos.",
        "Todavía no publicamos versiones en lectura fácil.",
      ),
      ...section(
        "Avísanos si encuentras una barrera",
        `Si algo no te funciona, escríbenos por el [formulario de contacto](${contact}) o a [${SITE.contactEmail}](mailto:${SITE.contactEmail}) indicando la página, el navegador y el producto de apoyo que utilizas.`,
        "Respondemos en un máximo de 15 días hábiles y, si podemos, arreglamos la barrera antes.",
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "We want this site to work with a keyboard, with a screen reader, with text enlarged, and on a bad connection. This page says where we are and what is still unresolved.",
      } as Block,
      ...section(
        "Conformance level",
        "The target is **WCAG 2.2 level AA**. This statement is a self-assessment by the editorial team; there has been no certified external audit.",
      ),
      ...section(
        "What the site already does",
        "Real semantic structure: one `h1` per page and a proper heading hierarchy for screen-reader navigation.",
        "A skip link to the main content, visible focus on every interactive element, and full keyboard navigation.",
        "Colour contrast checked across the site palette, alternative text on images, and tables with associated headers that reflow into cards on a phone while keeping their accessibility roles.",
        "Text that can be enlarged without breaking the layout, and pages that do not need JavaScript to show their content.",
      ),
      ...section(
        "What is not resolved yet",
        "There has been no external audit and no systematic testing with people who use assistive technology. We want to do both.",
        "Some decorative illustrations carry generic alternative text. Embedded third-party maps depend on the provider's accessibility, which we do not control.",
        "We do not yet publish easy-read versions.",
      ),
      ...section(
        "Tell us if you hit a barrier",
        `If something does not work for you, write via the [contact form](${contact}) or to [${SITE.contactEmail}](mailto:${SITE.contactEmail}), saying which page, which browser and which assistive technology you use.`,
        "We reply within 15 working days at most, and fix the barrier sooner where we can.",
      ),
    ],
  };

  return copy[locale];
}

const ACCESSIBILITY_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Declaració d'accessibilitat",
    seoTitle: "Accessibilitat",
    seoDescription:
      "Nivell d'accessibilitat de CatalunyaInfo, què compleix el web, què encara no i com avisar-nos d'una barrera.",
    excerpt: "El nivell que perseguim, què ja compleix el web i què encara no.",
  },
  es: {
    title: "Declaración de accesibilidad",
    seoTitle: "Accesibilidad",
    seoDescription:
      "Nivel de accesibilidad de CatalunyaInfo, qué cumple el sitio, qué todavía no y cómo avisarnos de una barrera.",
    excerpt: "El nivel que perseguimos, qué cumple ya el sitio y qué todavía no.",
  },
  en: {
    title: "Accessibility statement",
    seoTitle: "Accessibility",
    seoDescription:
      "CatalunyaInfo's accessibility level, what the site already meets, what it does not, and how to report a barrier.",
    excerpt: "The level we aim for, what the site already meets, and what it does not.",
  },
};

export const ACCESSIBILITY: PageSpec = {
  key: "page-accessibility",
  path: legalEntryPath("accessibility"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      { ...ACCESSIBILITY_COPY[locale], blocks: accessibilityBlocks(locale) },
    ]),
  ) as Record<Locale, PageCopy>,
};
