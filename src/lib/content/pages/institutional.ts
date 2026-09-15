import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { LOCALES } from "@/lib/i18n/config";
import { legalPath, sectionPath } from "@/lib/i18n/routes";
import { SITE } from "@/lib/site";
import { section, sectionEntryPath, type PageCopy, type PageSpec } from "./types";

/**
 * About and contact.
 *
 * The about page names no staff and claims no size: those are facts about real
 * people that this repository does not hold, and an invented masthead is the
 * exact kind of thing that makes a site look manufactured. It describes the
 * project and the method instead, both of which are true and checkable.
 */

/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */

function aboutBlocks(locale: Locale): Block[] {
  const editorial = legalPath("editorial-policy", locale);
  const sources = legalPath("sources", locale);
  const corrections = legalPath("corrections", locale);
  const contact = sectionPath("contact", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo és un projecte editorial independent que respon una pregunta concreta: què necessites saber abans d'anar a un lloc de Catalunya.",
      } as Block,
      ...section(
        "Què fem",
        "Publiquem informació pràctica i verificada: com arribar-hi, quan val la pena anar-hi, què cal tenir en compte i on consultar la font oficial. Tot en català, castellà i anglès, amb la mateixa informació als tres idiomes i no una traducció automàtica de mig contingut.",
        "No som una administració pública ni una oficina de turisme. Tampoc som un agregador: cada pàgina la escrivim nosaltres, citant d'on surt cada dada.",
      ),
      ...section(
        "Com treballem",
        "Tres regles ordenen tota la resta.",
        "**Si no ho podem verificar, no ho publiquem.** Preferim dir que no ho sabem abans que omplir un buit amb una suposició ben escrita.",
        "**La font oficial mana.** Enllacem sempre l'original, i quan una font diu una cosa i una altra en diu una altra, ho expliquem en comptes de triar en silenci.",
        "**Les dates caduquen.** Cada pàgina porta la data en què es va verificar, a la vista, perquè puguis jutjar tu mateix si encara és fiable.",
        `Els criteris complets són a la [política editorial](${editorial}) i a la pàgina de [fonts](${sources}).`,
      ),
      ...section(
        "Intel·ligència artificial, dit clar",
        "Fem servir eines d'IA com a suport de redacció i per generar algunes il·lustracions. Cap contingut es publica automàticament: tot passa per revisió humana, i la responsabilitat editorial és sempre humana.",
        "Les imatges generades s'identifiquen sempre al peu de la imatge, i mai no les presentem com si fossin fotografies reals d'un lloc concret.",
      ),
      ...section(
        "Com ens financem",
        "Ara mateix el web no té publicitat, ni enllaços d'afiliació, ni continguts patrocinats. Si algun dia n'hi ha, es marcarà clarament abans del contingut afectat i no canviarà què recomanem.",
      ),
      ...section(
        "Ajuda'ns a fer-ho millor",
        `Si trobes un error, [avisa'ns](${corrections}): és la manera més ràpida d'arreglar-ho. Si vols proposar-nos alguna cosa o simplement dir-nos què hi trobes a faltar, el [formulari de contacte](${contact}) va directe a la redacció.`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo es un proyecto editorial independiente que responde a una pregunta concreta: qué necesitas saber antes de ir a un lugar de Cataluña.",
      } as Block,
      ...section(
        "Qué hacemos",
        "Publicamos información práctica y verificada: cómo llegar, cuándo merece la pena ir, qué conviene tener en cuenta y dónde consultar la fuente oficial. Todo en catalán, castellano e inglés, con la misma información en los tres idiomas y no una traducción automática de medio contenido.",
        "No somos una administración pública ni una oficina de turismo. Tampoco un agregador: cada página la escribimos nosotros, citando de dónde sale cada dato.",
      ),
      ...section(
        "Cómo trabajamos",
        "Tres reglas ordenan todo lo demás.",
        "**Si no podemos verificarlo, no lo publicamos.** Preferimos decir que no lo sabemos antes que rellenar un hueco con una suposición bien escrita.",
        "**La fuente oficial manda.** Enlazamos siempre el original, y cuando una fuente dice una cosa y otra dice otra, lo explicamos en lugar de elegir en silencio.",
        "**Los datos caducan.** Cada página lleva a la vista la fecha en que se verificó, para que puedas juzgar por ti mismo si sigue siendo fiable.",
        `Los criterios completos están en la [política editorial](${editorial}) y en la página de [fuentes](${sources}).`,
      ),
      ...section(
        "Inteligencia artificial, dicho claro",
        "Usamos herramientas de IA como apoyo de redacción y para generar algunas ilustraciones. Ningún contenido se publica automáticamente: todo pasa por revisión humana, y la responsabilidad editorial es siempre humana.",
        "Las imágenes generadas se identifican siempre al pie de la imagen, y nunca las presentamos como fotografías reales de un lugar concreto.",
      ),
      ...section(
        "Cómo nos financiamos",
        "Ahora mismo el sitio no tiene publicidad, ni enlaces de afiliación, ni contenidos patrocinados. Si algún día los hay, se marcarán claramente antes del contenido afectado y no cambiarán lo que recomendamos.",
      ),
      ...section(
        "Ayúdanos a hacerlo mejor",
        `Si encuentras un error, [avísanos](${corrections}): es la forma más rápida de arreglarlo. Si quieres proponernos algo o simplemente decirnos qué echas en falta, el [formulario de contacto](${contact}) va directo a la redacción.`,
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "CatalunyaInfo is an independent editorial project answering one question: what you need to know before going somewhere in Catalonia.",
      } as Block,
      ...section(
        "What we do",
        "We publish practical, verified information: how to get there, when it is worth going, what to bear in mind, and where to check the official source. All of it in Catalan, Spanish and English, with the same information in each language rather than a machine translation of half the content.",
        "We are not a public authority or a tourist board, and we are not an aggregator: every page is written here, citing where each fact came from.",
      ),
      ...section(
        "How we work",
        "Three rules order everything else.",
        "**If we cannot verify it, we do not publish it.** Saying we don't know beats filling a gap with a well-written guess.",
        "**The official source prevails.** We always link the original, and where two sources disagree we explain the discrepancy instead of quietly picking one.",
        "**Facts go stale.** Every page carries its verification date in plain sight, so you can judge for yourself whether it still holds.",
        `The full criteria are in our [editorial policy](${editorial}) and on the [sources page](${sources}).`,
      ),
      ...section(
        "Artificial intelligence, plainly",
        "We use AI tools to support drafting and to generate some illustrations. Nothing is published automatically: everything goes through human review, and editorial responsibility is always human.",
        "Generated images are always labelled in the caption, and we never present them as real photographs of a specific place.",
      ),
      ...section(
        "How we are funded",
        "The site currently carries no advertising, no affiliate links and no sponsored content. If that ever changes, it will be marked clearly before the content concerned, and it will not change what we recommend.",
      ),
      ...section(
        "Help us do it better",
        `Found an error? [Tell us](${corrections}) — it is the fastest way to get it fixed. To suggest something, or simply say what is missing, the [contact form](${contact}) goes straight to the desk.`,
      ),
    ],
  };

  return copy[locale];
}

const ABOUT_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Qui som",
    seoTitle: "Qui som",
    seoDescription:
      "CatalunyaInfo és un projecte editorial independent d'informació pràctica i verificada sobre Catalunya, en català, castellà i anglès.",
    excerpt: "Un projecte editorial independent d'informació pràctica i verificada sobre Catalunya.",
  },
  es: {
    title: "Quiénes somos",
    seoTitle: "Quiénes somos",
    seoDescription:
      "CatalunyaInfo es un proyecto editorial independiente de información práctica y verificada sobre Cataluña, en catalán, castellano e inglés.",
    excerpt: "Un proyecto editorial independiente de información práctica y verificada sobre Cataluña.",
  },
  en: {
    title: "About CatalunyaInfo",
    seoTitle: "About us",
    seoDescription:
      "CatalunyaInfo is an independent editorial project publishing practical, verified information about Catalonia in Catalan, Spanish and English.",
    excerpt: "An independent editorial project publishing practical, verified information about Catalonia.",
  },
};

export const ABOUT: PageSpec = {
  key: "page-about",
  path: sectionEntryPath("about"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...ABOUT_COPY[locale], blocks: aboutBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};

/* -------------------------------------------------------------------------- */
/* Contact                                                                    */
/* -------------------------------------------------------------------------- */

function contactBlocks(locale: Locale): Block[] {
  const corrections = legalPath("corrections", locale);
  const privacy = legalPath("privacy", locale);

  const copy: Record<Locale, Block[]> = {
    ca: [
      {
        type: "paragraph",
        lead: true,
        text: "Escriu-nos. Llegim tots els missatges i responem els que necessiten resposta.",
      } as Block,
      {
        type: "keyFacts",
        title: "En què et podem ajudar",
        items: [
          { label: "Un error en una pàgina", value: "És el missatge que més agraïm" },
          { label: "Proposar contingut", value: "Digues-nos què hi trobes a faltar" },
          { label: "Premsa", value: "Consultes de mitjans i ús de continguts" },
          { label: "Protecció de dades", value: "Exercici de drets i privadesa" },
          { label: "Temps de resposta", value: "Objectiu: 72 hores" },
          { label: "Correu directe", value: SITE.contactEmail },
        ],
      } as Block,
      { type: "contactForm" } as Block,
      ...section(
        "Si ens avises d'un error",
        `Inclou-hi l'adreça de la pàgina, quina frase o dada és incorrecta i, si el tens, l'enllaç a la font correcta. Amb això ho podem verificar i corregir el mateix dia. El procediment complet és a la pàgina de [correccions](${corrections}).`,
      ),
      ...section(
        "Què no cal que ens enviïs",
        "No ens enviïs dades personals de tercers, ni documentació sensible, ni contrasenyes. Per respondre't només necessitem el teu nom i el teu correu.",
        "Tampoc acceptem propostes de publicació de contingut patrocinat, intercanvis d'enllaços ni articles escrits per tercers amb enllaços inserits: no en publiquem.",
      ),
      ...section(
        "Què fem amb el que ens escrius",
        `Fem servir el teu nom i el teu correu únicament per respondre't, i conservem el missatge un màxim de 24 mesos des de l'última comunicació. Pots demanar-ne la supressió quan vulguis. Tots els detalls són a la [política de privadesa](${privacy}).`,
      ),
    ],
    es: [
      {
        type: "paragraph",
        lead: true,
        text: "Escríbenos. Leemos todos los mensajes y respondemos los que necesitan respuesta.",
      } as Block,
      {
        type: "keyFacts",
        title: "En qué podemos ayudarte",
        items: [
          { label: "Un error en una página", value: "Es el mensaje que más agradecemos" },
          { label: "Proponer contenido", value: "Dinos qué echas en falta" },
          { label: "Prensa", value: "Consultas de medios y uso de contenidos" },
          { label: "Protección de datos", value: "Ejercicio de derechos y privacidad" },
          { label: "Tiempo de respuesta", value: "Objetivo: 72 horas" },
          { label: "Correo directo", value: SITE.contactEmail },
        ],
      } as Block,
      { type: "contactForm" } as Block,
      ...section(
        "Si nos avisas de un error",
        `Incluye la dirección de la página, qué frase o dato es incorrecto y, si lo tienes, el enlace a la fuente correcta. Con eso podemos verificarlo y corregirlo el mismo día. El procedimiento completo está en la página de [correcciones](${corrections}).`,
      ),
      ...section(
        "Qué no hace falta que nos envíes",
        "No nos envíes datos personales de terceros, ni documentación sensible, ni contraseñas. Para responderte solo necesitamos tu nombre y tu correo.",
        "Tampoco aceptamos propuestas de contenido patrocinado, intercambios de enlaces ni artículos escritos por terceros con enlaces insertados: no los publicamos.",
      ),
      ...section(
        "Qué hacemos con lo que nos escribes",
        `Usamos tu nombre y tu correo únicamente para responderte, y conservamos el mensaje un máximo de 24 meses desde la última comunicación. Puedes pedir su supresión cuando quieras. Todos los detalles están en la [política de privacidad](${privacy}).`,
      ),
    ],
    en: [
      {
        type: "paragraph",
        lead: true,
        text: "Write to us. We read every message and answer the ones that need an answer.",
      } as Block,
      {
        type: "keyFacts",
        title: "What we can help with",
        items: [
          { label: "An error on a page", value: "The message we appreciate most" },
          { label: "Suggesting content", value: "Tell us what is missing" },
          { label: "Press", value: "Media enquiries and use of our content" },
          { label: "Data protection", value: "Exercising your rights, privacy" },
          { label: "Response time", value: "Target: 72 hours" },
          { label: "Direct email", value: SITE.contactEmail },
        ],
      } as Block,
      { type: "contactForm" } as Block,
      ...section(
        "If you are reporting an error",
        `Include the page address, which sentence or figure is wrong and, if you have it, a link to the correct source. That lets us verify and fix it the same day. The full process is on the [corrections page](${corrections}).`,
      ),
      ...section(
        "What not to send",
        "Please do not send other people's personal data, sensitive documents, or passwords. To reply we only need your name and your email address.",
        "We also do not accept sponsored content, link exchanges, or third-party articles with links embedded: we do not publish them.",
      ),
      ...section(
        "What we do with your message",
        `We use your name and email solely to reply, and keep the message for at most 24 months from the last exchange. You can ask for it to be deleted at any time. Full details in the [privacy policy](${privacy}).`,
      ),
    ],
  };

  return copy[locale];
}

const CONTACT_COPY: Record<Locale, Omit<PageCopy, "blocks">> = {
  ca: {
    title: "Contacte",
    seoTitle: "Contacte",
    seoDescription:
      "Escriu a CatalunyaInfo: correccions, propostes de contingut, premsa i protecció de dades. Formulari directe i correu de contacte.",
    excerpt: "Formulari de contacte per a correccions, propostes, premsa i protecció de dades.",
  },
  es: {
    title: "Contacto",
    seoTitle: "Contacto",
    seoDescription:
      "Escribe a CatalunyaInfo: correcciones, propuestas de contenido, prensa y protección de datos. Formulario directo y correo de contacto.",
    excerpt: "Formulario de contacto para correcciones, propuestas, prensa y protección de datos.",
  },
  en: {
    title: "Contact",
    seoTitle: "Contact",
    seoDescription:
      "Write to CatalunyaInfo: corrections, content suggestions, press and data protection. Direct form and contact email.",
    excerpt: "Contact form for corrections, suggestions, press and data protection.",
  },
};

export const CONTACT: PageSpec = {
  key: "page-contact",
  path: sectionEntryPath("contact"),
  copy: Object.fromEntries(
    LOCALES.map((locale) => [locale, { ...CONTACT_COPY[locale], blocks: contactBlocks(locale) }]),
  ) as Record<Locale, PageCopy>,
};
