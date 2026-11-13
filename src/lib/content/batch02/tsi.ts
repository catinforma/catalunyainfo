import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";

import { B2_PATHS, b2Related, b2link, callout, faq, h2, keyFacts, lead, list, paras, steps, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * The TSI (targeta sanitària individual), Catalonia's public health card:
 * who is entitled, documents, how to apply, the provisional document, lost
 * cards, moving and changing CAP (13 Nov 2026). Pairs with the padró guide.
 *
 * Why this page: "tarjeta sanitaria" ≈ 2,700 searches a week in Catalonia and
 * "catsalut" peaks in Nov–Jan (Google Trends, 5 years, "festivos" anchor;
 * research_notes/evergreen-demand-nov2026.md). The site had no page; the
 * results are papelea, soynomadadigital, nimextranjeria, shbarcelona and
 * expat blogs. They disagree on the channel (one says there is no online
 * route) and invent details (a photo, a one-year expiry) no official page
 * gives. CatSalut's own pages are clear but spread over a dozen URLs, and are
 * only in Catalan.
 *
 * TSI_AS_OF 2026-11-13. Every fact was read that day on the page given (curl
 * with a browser User-Agent, grep of the quoted words). Only CatSalut, the
 * Seguridad Social and, for the March 2026 decree that CatSalut cites, the
 * BOE:
 *
 *  - CatSalut, "Obtenció de la primera TSI" (updated 27.11.2025): «requisit
 *    bàsic d'estar empadronades en un municipi de Catalunya»; workers,
 *    pensioners and benefit recipients are «donada d'alta a l'INSS» and
 *    «ja té acreditat el dret a l'assistència sanitària, sense cap sol·licitud
 *    prèvia a l'INSS»: they ask CatSalut for the TSI directly, online or at the
 *    CAP; MUFACE, MUGEJU, ISFAS the same; newborns: «alta del nadó com a
 *    beneficiari» at the INSS first, which «podreu fer directament des de
 *    l'Hospital, si en doneu el consentiment», plus the padró; foreigners with
 *    no INSS access get «un nivell de cobertura específic»; people returning
 *    to Catalonia «heu de tornar a demanar la TSI, igual que si fos la primera
 *    vegada». Online form: «un procés de validació de les dades amb altres
 *    administracions»; if positive, «rebreu per correu electrònic un resguard
 *    provisional amb el codi d'identificació personal (CIP)» valid «fins que
 *    rebeu la targeta física al vostre domicili»; otherwise «quedarà en
 *    situació de pendent i es resoldrà en els dies següents». At the CAP «que
 *    correspongui per domicili o el que s'hagi triat per lliure elecció»: the
 *    form, plus either authorising online checks or bringing an ID (DNI, NIE,
 *    passport), a padró certificate «amb la data d'emissió inferior a tres
 *    mesos» (unless the council offers online lookup) and, for someone else,
 *    proof of representation; «El CatSalut us enviarà gratuïtament la TSI per
 *    correu postal». INSS information lines 91 542 11 76 and 901 16 65 65.
 *  - salut.gencat.cat online form RCAPKTSI.SOLICITAR_TSI: language selector
 *    «Català / Castellà / Aranès»; one attachment, «El fitxer ha excedit la
 *    mida màxima de 2.048 kb».
 *  - CatSalut, "Targeta sanitària individual (TSI)" (31.07.2025): the card
 *    carries the CIP, the name, the «Codi SNS», and on the back the «Nivell de
 *    Cobertura»; old designs «continua essent vàlida, no cal canviar-la».
 *  - CatSalut, "La TSI digital" (17.09.2025): in La Meva Salut and La Meva
 *    Cartera, «té la mateixa validesa que la targeta física i es genera
 *    automàticament quan s'assigna el codi d'identificació personal (CIP)»;
 *    readers are being rolled out, so «es recomana portar també la targeta en
 *    format físic».
 *  - CatSalut, "Gestions relacionades amb la TSI" (25.11.2025) and
 *    "Sol·licitud de reedició": duplicate at the CAP for loss, theft, damage
 *    or a failed stripe; «Rebreu la targeta per correu postal»; «la TSI
 *    anterior deixa de tenir validesa»; wrong data → CAP or 061, and if it
 *    touches the CIP (surnames, gender, birth date) «el CatSalut us enviarà
 *    gratuïtament una nova TSI»; moving house → tell the CAP or 061, it may
 *    change your CAP, «Un canvi de domicili no comporta l'edició d'una nova
 *    TSI».
 *  - CatSalut, "Què són i com s'assignen [els nivells de cobertura]"
 *    (25.08.2026): seven levels; insured people get «Cobertura sanitària
 *    general»; the insured «poden tenir com a beneficiàries» spouses or
 *    partners, children and siblings; under «el Reial decret llei 7/2018 i el
 *    Reial Decret 180/2026», foreigners «no registrades ni autoritzades a
 *    residir a Espanya» are covered «sempre i quan acreditin empadronament o
 *    residència habitual»; foreigners on a Catalan padró who fit nothing else
 *    can ask for «Accés CatSalut segon nivell» at the CAP, valid only in
 *    Catalonia; the conveni especial: «una quota mensual» «entre els 60 € i
 *    els 157 €».
 *  - CatSalut, "Accés per a les persones estrangeres no registrades ni
 *    autoritzades" (25.11.2025): «més de tres mesos d'empadronament» (older
 *    than RD 180/2026: see below); request «al CAP»; the card gives
 *    «cobertura sanitària general (grup a)», «vàlides per als serveis
 *    sanitaris de Catalunya»; asylum seekers and trafficking victims the same.
 *  - CatSalut, "Formalització del conveni especial" (27.02.2024): «60 euros, si
 *    la persona té menys de 65 anys», «157 euros si la persona té 65 o més
 *    anys»; one year's residence in Spain, padró in Catalonia, no other public
 *    cover; at «les unitats d'atenció al ciutadà de les regions sanitàries
 *    demanant amb antelació cita prèvia»; answer «en un termini màxim de 30
 *    dies».
 *  - CatSalut, "Cobertura sanitària S1" (02.06.2025): for holders of an S1 «emès
 *    pel seu país d'origen i validat per l'Institut Nacional de la Seguretat
 *    Social»; «cal portar el formulari S1 [...] en format paper».
 *  - CatSalut, "De fora cap a Catalunya" (29.09.2026): EU visitors use the
 *    «targeta sanitària europea (TSE)» or the CPS plus ID; EU residents
 *    «han d'acreditar el seu dret [...] amb els models oficials expedits al
 *    seu país d'origen», delivered to the INSS; UK the same; people moving
 *    from another Spanish region to live here apply for the TSI; non-EU
 *    visitors under three months check at home or pay.
 *  - CatSalut, free choice of CAP: "Procediment" (11.11.2026): ask at the new
 *    CAP with the form; «en un termini màxim de deu dies hàbils», then
 *    «s'entén que la sol·licitud ha estat acceptada». "Preguntes més
 *    freqüents": any public CAP in Catalonia; «Per telèfon, no»; «Al cap d'un
 *    any des del canvi pot tornar a escollir»; moving house is the exception;
 *    not on a Catalan padró → no free choice. "Implicacions" (14.01.2015): the
 *    CAP for your address keeps home care, social work and out-of-hours care.
 *  - CatSalut, appointments: "Demanar cita en línia" via La Meva Salut, «Cites
 *    i agenda»; or by phone or at the desk (20.10.2025). "La Meva Salut":
 *    idCAT Mòbil, digital certificate, «properament, Cl@ve»; «ja no es podran
 *    crear noves contrasenyes».
 *  - Seguridad Social, "Titulares / Requisitos" (seg-social.es 10938/30476):
 *    entitled are «Todas las personas con nacionalidad española y las personas
 *    extranjeras que tengan establecida su residencia en el territorio
 *    español»; «La residencia legal de los extranjeros se acredita con el
 *    correspondiente permiso de residencia. La residencia habitual se certifica
 *    con el empadronamiento»; dependants: spouse or registered partner,
 *    descendants «menores de 26 años o que tengan una discapacidad en grado
 *    igual o superior al 65 %», siblings.
 *  - Seguridad Social, "Gestión y solicitudes" (10938/30497): documents (DNI;
 *    «tarjeta de identidad de extranjero (TIE) o en su caso pasaporte»; legal
 *    residence for non-nationals; padró certificate if recent; for EU/EEA/
 *    Swiss/UK citizens a certificate from home «acreditando que no reconoce la
 *    exportación del derecho a la asistencia sanitaria»).
 *  - Seguridad Social e-office, "Asistencia sanitaria": the services «Solicitud
 *    de reconocimiento del derecho (como titular)», «Alta de beneficiarios»,
 *    «Solicitud Tarjeta Sanitaria Europea (TSE)».
 *  - BOE, Real Decreto 180/2026, de 11 de marzo («BOE» núm. 63, de
 *    12/03/2026; in force the next day): proof of residence is a «Certificado
 *    o volante de empadronamiento actualizado» or, failing it, school
 *    enrolment, social-services visit records, utility bills and others; a
 *    «documento provisional acreditativo» on submission gives access «hasta que
 *    el expediente se resuelva»; «plazo máximo de tres meses», then «estimada
 *    por silencio administrativo»; the document «no tendrá caducidad»; minors
 *    and pregnant women are covered in any case (art. 4).
 *
 * The conflict: CatSalut's November 2025 page still says «més de tres mesos
 * d'empadronament» for people without legal residence; RD 180/2026 (March
 * 2026), which CatSalut's August 2026 coverage page cites, sets no minimum. The
 * page prints both and tells the reader to apply at the CAP straight away.
 *
 * Not printed: how many days the physical card takes (no official figure),
 * pharmacy co-payment percentages by income, the Ukraine temporary-protection
 * route, anything about photos or a one-year expiry (no official source), and
 * the INSS e-office service pages (JavaScript apps that curl cannot read; the
 * seg-social.es information pages are linked instead).
 *
 * Re-read by TSI_REREAD_BY (a test fails after it).
 */
export const TSI_AS_OF = "2026-11-13";
export const TSI_REREAD_BY = "2027-02-13";

const CS = "https://catsalut.gencat.cat/ca/coneix-catsalut/acces-sistema-salut";
export const TSI_URLS = {
  first: `${CS}/la-tsi/obtencio-tsi/`,
  form: "https://salut.gencat.cat/pls/rca/RCAPKTSI.SOLICITAR_TSI",
  card: `${CS}/la-tsi/`,
  digital: `${CS}/la-tsi/tsi-digital/`,
  procedures: `${CS}/la-tsi/gestions-relacionades-tsi-dades-personals/`,
  reissue: `${CS}/la-tsi/obtencio-tsi/solicitud-reedicio-tsi/`,
  access: `${CS}/qui-te-acces-al-sistema-sanitari-public/`,
  undocumented: `${CS}/qui-te-acces-al-sistema-sanitari-public/acces-per-a-les-persones-que-es-troben-en-situacions-especials-segons-reial-decret-1192-2012/`,
  agreement: `${CS}/qui-te-acces-al-sistema-sanitari-public/formalitzacio-del-conveni-especial-de-prestacio-de-lassistencia-sanitaria/`,
  levels: `${CS}/nivells-cobertura/que-son-i-com-sassignen/`,
  s1: `${CS}/nivells-cobertura/cobertura-sanitaria-s1/`,
  arriving: `${CS}/desplacaments/de-fora-cap-a-catalunya/`,
  appointments: `${CS}/com-accedeix/programacio-visites/demanar-cita-en-linia/`,
  capFinder: "https://catsalut.gencat.cat/ca/centres-sanitaris/quin-cap-correspon-a-una-adreca/",
  capChange: "https://catsalut.gencat.cat/ca/serveis-sanitaris/atencio-primaria-comunitaria/lliure-eleccio-metge-cap/procediment/",
  capChangeFaq: "https://catsalut.gencat.cat/ca/serveis-sanitaris/atencio-primaria-comunitaria/lliure-eleccio-metge-cap/preguntes-frequents/",
  laMevaSalut: "https://catsalut.gencat.cat/ca/serveis-sanitaris/la-meva-salut/",
  inssWho: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938/30476",
  inssHow: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938/30497",
  rd180: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-5714",
} as const;

const SOURCES: B2Source[] = [
  { name: "Obtenció de la primera Targeta Sanitària Individual (TSI)", url: TSI_URLS.first, publisher: "CatSalut" },
  { name: "Sol·licitud de primera TSI (formulari en línia)", url: TSI_URLS.form, publisher: "CatSalut" },
  { name: "Targeta sanitària individual (TSI)", url: TSI_URLS.card, publisher: "CatSalut" },
  { name: "La TSI digital", url: TSI_URLS.digital, publisher: "CatSalut" },
  { name: "Gestions relacionades amb la TSI i les dades personals", url: TSI_URLS.procedures, publisher: "CatSalut" },
  { name: "Sol·licitud de reedició de la TSI", url: TSI_URLS.reissue, publisher: "CatSalut" },
  { name: "Qui té accés al sistema sanitari públic?", url: TSI_URLS.access, publisher: "CatSalut" },
  { name: "Accés per a les persones estrangeres no registrades ni autoritzades a residir a Espanya", url: TSI_URLS.undocumented, publisher: "CatSalut" },
  { name: "Formalització del conveni especial de prestació de l'assistència sanitària", url: TSI_URLS.agreement, publisher: "CatSalut" },
  { name: "Nivells de cobertura: què són i com s'assignen", url: TSI_URLS.levels, publisher: "CatSalut" },
  { name: "Cobertura sanitària S1", url: TSI_URLS.s1, publisher: "CatSalut" },
  { name: "Desplaçaments: de fora cap a Catalunya", url: TSI_URLS.arriving, publisher: "CatSalut" },
  { name: "Demanar cita en línia", url: TSI_URLS.appointments, publisher: "CatSalut" },
  { name: "Quin CAP correspon a una adreça", url: TSI_URLS.capFinder, publisher: "CatSalut" },
  { name: "Lliure elecció d'EAP i de professionals: procediment", url: TSI_URLS.capChange, publisher: "CatSalut" },
  { name: "Lliure elecció d'EAP i de professionals: preguntes més freqüents", url: TSI_URLS.capChangeFaq, publisher: "CatSalut" },
  { name: "La Meva Salut", url: TSI_URLS.laMevaSalut, publisher: "CatSalut" },
  { name: "Asistencia sanitaria: titulares y requisitos", url: TSI_URLS.inssWho, publisher: "Seguridad Social (INSS)" },
  { name: "Asistencia sanitaria: gestión y solicitudes", url: TSI_URLS.inssHow, publisher: "Seguridad Social (INSS)" },
  { name: "Real Decreto 180/2026, de 11 de marzo (atención sanitaria de personas extranjeras sin residencia legal)", url: TSI_URLS.rd180, publisher: "BOE" },
];

/** A Markdown link. */
const a = (href: string, label: string) => `[${label}](${href})`;

export const TSI_META: Record<Locale, { title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    title: "Com demanar la targeta sanitària (TSI) a Catalunya: qui hi té dret, documents i cita al CAP",
    seoTitle: "Targeta sanitària (TSI) a Catalunya: com demanar-la",
    seoDescription: "Cal estar empadronat. Es demana per internet o al CAP, i rebràs un resguard provisional amb el CIP per correu. Qui hi té dret en cada cas i quins documents cal portar.",
    excerpt: "La TSI pas a pas: qui hi té dret (treballadors, família, ciutadans de la UE, estrangers sense residència), documents, el resguard provisional, duplicats i canvi de CAP.",
  },
  es: {
    title: "Cómo pedir la tarjeta sanitaria (TSI) en Cataluña: quién tiene derecho, documentos y cita en el CAP",
    seoTitle: "Tarjeta sanitaria (TSI) en Cataluña: cómo pedirla",
    seoDescription: "Hay que estar empadronado. Se pide por internet o en el CAP y llega por email un resguardo provisional con el CIP. Quién tiene derecho en cada caso y qué llevar.",
    excerpt: "La TSI paso a paso: quién tiene derecho (trabajadores, familia, ciudadanos de la UE, extranjeros sin residencia), documentos, el resguardo provisional, duplicados y cambio de CAP.",
  },
  en: {
    title: "How to get the health card (TSI) in Catalonia: who is entitled, documents and your CAP",
    seoTitle: "Health card (TSI) in Catalonia: how to apply",
    seoDescription: "You must be on the padró. Apply online or at your CAP and a provisional receipt with your CIP number arrives by email. Who is entitled in each case and what to bring.",
    excerpt: "The TSI step by step: who is entitled (workers, family, EU citizens, people without residence), documents, the provisional receipt, lost cards and changing CAP.",
  },
};

/** One body for the three editions: the same sections, tables and links in each. */
export function buildTsiBody(locale: Locale): Block[] {
  const L = locale;
  const padro = b2link("padro", L, { ca: "guia de l'empadronament", es: "guía del empadronamiento", en: "padró registration guide" }[L]);
  const padroShort = b2link("padro", L, { ca: "com empadronar-se", es: "cómo empadronarse", en: "how to register on the padró" }[L]);
  const nieTie = b2link("nieTie", L, { ca: "com obtenir el NIE, la TIE o el certificat de la UE", es: "cómo obtener el NIE, la TIE o el certificado de la UE", en: "how to get a NIE, TIE or EU registration certificate" }[L]);

  const t = {
    ca: {
      lead: `**Per tenir la targeta sanitària (TSI) cal estar empadronat en un municipi de Catalunya, i es demana al CatSalut, per internet o al teu centre d'atenció primària (CAP).** Si treballes, cobres una pensió o l'atur, ja tens el dret reconegut per la Seguretat Social i pots demanar la targeta directament. Si s'aprova la sol·licitud en línia, reps per correu electrònic un resguard provisional amb el teu codi d'identificació personal (CIP), que ja et dona accés als centres públics fins que la targeta arriba per correu a casa, sense cost. Els familiars, els nadons i els ciutadans de la UE que viuen aquí passen abans per l'INSS; les persones estrangeres sense residència legal també hi tenen dret i ho demanen al CAP.`,
      factsTitle: "La TSI en sis respostes",
      facts: [
        { label: "Què és", value: "La targeta que t'identifica a la sanitat pública catalana, amb el teu codi CIP i el nivell de cobertura" },
        { label: "Requisit bàsic", value: "Estar empadronat en un municipi de Catalunya" },
        { label: "On es demana", value: "Formulari en línia del CatSalut o el CAP que et toca per domicili" },
        { label: "Mentre esperes", value: "Resguard provisional amb el CIP per correu electrònic; després, la TSI digital a La Meva Salut" },
        { label: "Preu", value: "Gratuït: el CatSalut envia la targeta per correu postal" },
        { label: "Qui reconeix el dret", value: "L'INSS per a treballadors, pensionistes i familiars; el CatSalut per a la resta" },
      ],
      whoH: "Qui hi té dret, segons la teva situació",
      whoIntro: [
        `Tots els residents a Catalunya tenen garantida l'atenció sanitària. El que canvia és qui reconeix el dret abans que el CatSalut emeti la targeta i quin **nivell de cobertura** hi surt imprès al darrere. La primera taula és per a qui està a la Seguretat Social i la seva família; la segona, per a la resta de situacions.`,
      ],
      workCaption: "Treballadors, pensionistes i les seves famílies",
      workHead: ["Situació", "Què fas primer", "Després"],
      workRows: [
        ["Treballes (per compte d'altri o autònom) i estàs d'alta a la Seguretat Social", "Res: el dret ja consta a l'INSS", "Demanes la TSI per internet o al CAP"],
        ["Cobres una pensió o una prestació de la Seguretat Social (l'atur, per exemple)", "Res: el dret ja consta a l'INSS", "Demanes la TSI per internet o al CAP"],
        ["Cònjuge o parella de fet, fills, germans d'una persona assegurada", "La persona assegurada et dona d'alta com a beneficiari a l'INSS (fills i germans, menors de 26 anys o amb una discapacitat del 65 % o més)", "Demanes la TSI quan l'INSS respon"],
        ["Nadó", "Alta com a beneficiari del pare, la mare o el tutor a l'INSS (es pot fer des de l'hospital, si hi dones el consentiment) i empadronament", "Demanes la TSI del nadó per internet o al CAP"],
        ["Funcionari de MUFACE, MUGEJU o ISFAS", "Res, si estàs en un dels col·lectius de la mutualitat", "Demanes la TSI directament; si has triat sanitat privada, la cobertura pública és la mínima"],
      ],
      workNote: "Fonts: CatSalut (obtenció de la TSI i nivells de cobertura) i Seguretat Social (titulars i beneficiaris), consultades el 13 de novembre de 2026.",
      otherCaption: "Ciutadans de la UE, persones estrangeres i altres casos",
      otherHead: ["Situació", "Què has de fer", "Cobertura"],
      otherRows: [
        ["Ciutadà de la UE, l'EEE, Suïssa o el Regne Unit de visita (estada temporal)", "No et cal la TSI: presenta la targeta sanitària europea (TSE) o el certificat provisional substitutori i un document d'identitat", "La mateixa assistència pública que els residents per als problemes que sorgeixen durant l'estada"],
        ["Ciutadà de la UE o del Regne Unit que viu a Catalunya, assegurat al teu país (amb el formulari S1, per exemple)", "Lliura el formulari del teu país a l'INSS, que el valida; després demanes la TSI", "Cobertura sanitària S1: porta sempre el formulari S1 en paper"],
        ["Resident estranger (de la UE o no) amb residència legal, que no treballa ni cobra cap prestació", "Demana a l'INSS el reconeixement del dret com a titular: residència legal, padró i, si vens de la UE, l'EEE, Suïssa o el Regne Unit, un certificat del teu país que digui que no hi exporta la cobertura", "Cobertura sanitària general, quan l'INSS el reconeix"],
        ["Persona estrangera sense residència legal (en situació irregular)", "Ho demanes al CAP amb una declaració responsable, el passaport o un altre document d'identitat i el padró. En presentar-ho reps un document provisional que ja dona accés", "Cobertura sanitària general, per als serveis de Catalunya"],
        ["Sol·licitant de protecció internacional o víctima de tràfic d'éssers humans", "Ho demanes al CAP amb la documentació de la teva situació", "Cobertura sanitària general"],
        ["Persona estrangera empadronada a Catalunya que no encaixa en cap cas anterior", "Demanes l'«Accés CatSalut segon nivell» al CAP que et toca per domicili", "Només vàlida a Catalunya"],
        ["Sense dret per cap via i sense cap altra assegurança pública", "Conveni especial: un any de residència a Espanya i padró a Catalunya; es demana amb cita a la unitat d'atenció al ciutadà de la regió sanitària, que respon en 30 dies com a màxim", "Quota mensual de 60 € (menys de 65 anys) o 157 € (65 o més)"],
        ["Véns d'una altra comunitat autònoma a viure a Catalunya", "Demanes la TSI catalana com si fos la primera. Si només hi estàs de pas, fes servir la targeta de la teva comunitat", "La que et correspongui"],
        ["Tornes a viure a Catalunya després d'un temps fora", "Tornes a demanar la TSI, igual que la primera vegada", "La que et correspongui"],
      ],
      otherNote: `Fonts: CatSalut (accés, nivells de cobertura, S1, conveni especial, desplaçaments), Seguretat Social i Reial decret 180/2026 (${a(TSI_URLS.rd180, "BOE")}), consultats el 13 de novembre de 2026.`,
      undocH: "Sense papers: què va canviar el març del 2026",
      undoc: [
        `Les persones estrangeres sense residència legal tenen dret a l'atenció sanitària pública si viuen a Espanya i no tenen cap altra cobertura (per exemple, la del seu país). El **Reial decret 180/2026**, en vigor des del 13 de març de 2026, fixa com es demana: una declaració responsable, el passaport o un altre document oficial d'identitat amb fotografia, i el certificat o volant de padró actualitzat. Si no et pots empadronar, valen altres proves, com la matrícula escolar dels fills, un certificat de visites dels serveis socials o factures de llum, aigua o gas a nom teu.`,
        `En presentar la sol·licitud t'han de donar un **document provisional** que ja et dona accés a l'assistència mentre es resol. L'administració té tres mesos per respondre; si no respon, la sol·licitud s'entén acceptada. El document definitiu no caduca. En tots els casos, els menors tenen la mateixa atenció que qualsevol resident, i les dones embarassades, l'atenció a l'embaràs, el part i el postpart.`,
        `Una nota: la pàgina del CatSalut sobre aquesta via, actualitzada el novembre del 2025, encara parla de «més de tres mesos d'empadronament». El decret posterior no fixa cap mínim, i la pàgina de nivells de cobertura del CatSalut (agost del 2026) ja el cita. Si estàs en aquesta situació, ves al CAP de seguida i demana-ho: el decret obliga els centres a informar-te i a deixar-te iniciar el tràmit allà mateix.`,
      ],
      docsH: "Quins documents necessites",
      docs: [
        `Si demanes la TSI al CAP pots autoritzar el CatSalut perquè consulti les teves dades a altres administracions, o bé portar-les tu:`,
      ],
      docsList: [
        "Document d'identitat: DNI, NIE o passaport.",
        `Certificat d'empadronament emès fa menys de tres mesos. Si el teu ajuntament ofereix la consulta en línia, no cal; si no, porta l'original (${padroShort}).`,
        "Si ho demanes per una altra persona, el document que acrediti la representació: el certificat de naixement o el llibre de família, en el cas d'un fill.",
      ],
      docsAfter: [
        `Si abans has de passar per l'**INSS** (familiars, residents que no treballen, ciutadans de la UE), la Seguretat Social demana el DNI o la targeta d'identitat d'estranger (TIE) o el passaport, la residència legal si no ets espanyol, el certificat de padró si t'has empadronat fa poc, el llibre de família o el certificat de matrimoni o de parella de fet per als familiars i, per als ciutadans de la UE, l'EEE, Suïssa o el Regne Unit, el certificat del teu país que diu que no hi exporta la cobertura (${a(TSI_URLS.inssHow, "Seguretat Social, en castellà")}). Si encara no tens el NIE o la TIE: ${nieTie}.`,
      ],
      howH: "Com es demana, pas a pas",
      stepsTitle: "De l'empadronament a la targeta",
      steps: [
        { title: "Empadrona't", text: `És el requisit bàsic per a tothom. Com es fa i quins documents demana l'ajuntament, amb contracte o sense, a la ${padro}.` },
        { title: "Passa per l'INSS, si et toca", text: "Si treballes o cobres una pensió o una prestació, salta aquest pas. Els familiars, els nadons, els residents que no treballen i els ciutadans de la UE amb S1 necessiten primer la resposta de l'INSS: per internet a la seu electrònica de la Seguretat Social o amb cita a les seves oficines." },
        { title: "Demana la TSI", text: `Per internet, amb el ${a(TSI_URLS.form, "formulari del CatSalut")} (en català, castellà o aranès; s'hi pot adjuntar un fitxer de 2.048 KB com a màxim), o presencialment al CAP que et toca per domicili, que pots consultar amb el ${a(TSI_URLS.capFinder, "cercador del CatSalut")}.` },
        { title: "Espera la validació", text: "El CatSalut comprova el padró i l'alta a l'INSS amb les altres administracions. Si tot quadra, rebràs per correu electrònic el resguard provisional amb el teu CIP. Si cal alguna comprovació, la sol·licitud queda pendent i es resol en els dies següents." },
        { title: "Rep la targeta", text: "El CatSalut envia la TSI gratis per correu postal al teu domicili. Mentrestant pots fer servir el resguard, i la versió digital apareix a La Meva Salut tan bon punt tens el CIP." },
      ],
      provH: "El resguard provisional i la TSI digital",
      prov: [
        `**Resguard provisional.** Quan el CatSalut aprova la sol·licitud en línia, t'envia per correu electrònic un resguard amb el CIP assignat. Amb aquest resguard ja pots anar als centres i serveis de la sanitat pública fins que t'arriba la targeta física (${a(TSI_URLS.first, "CatSalut")}).`,
        `**TSI digital.** La targeta digital de La Meva Salut i La Meva Cartera té la mateixa validesa que la física i es genera sola quan se t'assigna el CIP, encara que no tinguis la targeta de plàstic. Funciona amb codi de barres, i s'hi està afegint un codi QR. Com que no tots els centres en tenen lectors encara, el CatSalut recomana portar també la física (${a(TSI_URLS.digital, "La TSI digital")}).`,
        "**Document provisional sense residència legal.** Si ho demanes per la via del Reial decret 180/2026, el document que et donen en presentar la sol·licitud et dona accés a l'assistència fins que es resol l'expedient.",
      ],
      timeH: "Quant es triga",
      timeCaption: "Terminis oficials de cada tràmit",
      timeHead: ["Tràmit", "Termini"],
      timeRows: [
        ["Sol·licitud de la TSI per internet", "Resguard provisional per correu electrònic si es valida; si queda pendent, es resol en els dies següents"],
        ["Targeta física", "Arriba per correu postal (el CatSalut no publica cap termini)"],
        ["Persones sense residència legal (Reial decret 180/2026)", "Document provisional en el moment de la sol·licitud; resolució en 3 mesos com a màxim, i si no hi ha resposta, acceptada"],
        ["Conveni especial", "Resolució en 30 dies com a màxim"],
        ["Canvi de CAP o de metge", "Resposta en 10 dies hàbils com a màxim; si no hi ha resposta, acceptat"],
      ],
      timeNote: "Fonts: CatSalut i BOE, consultats el 13 de novembre de 2026.",
      afterH: "Renovació, pèrdua, canvi de domicili i canvi de CAP",
      afterCaption: "Què fer en cada cas un cop tens la targeta",
      afterHead: ["Cas", "Què has de fer"],
      afterRows: [
        ["Renovació", "El CatSalut no demana renovar la targeta: els models antics continuen sent vàlids. El que has de mantenir al dia és el padró (si no ets de la UE i no tens residència de llarga durada, es renova cada 2 anys)"],
        ["Pèrdua, robatori o targeta espatllada", "Demana un duplicat al teu CAP. Arriba per correu i l'antiga deixa de ser vàlida. Mentrestant, fes servir la TSI digital"],
        ["Dades errònies a la targeta", "Avisa el CAP o truca al 061 Salut Respon. Si l'error és als cognoms, el gènere o la data de naixement, el CatSalut t'envia una targeta nova gratis"],
        ["Canvi de domicili", "Comunica-ho al CAP o al 061: potser et canvien de CAP i de metge. No et fan una targeta nova"],
        ["Canvi de CAP o de metge", "Lliure elecció: presenta la sol·licitud en persona al CAP on vols anar (per telèfon no es pot). Ho pots tornar a fer al cap d'un any, o abans si canvies de domicili"],
      ],
      afterNote: "Fonts: CatSalut (TSI, gestions relacionades i lliure elecció), consultades el 13 de novembre de 2026.",
      capH: "Triar un altre CAP",
      cap: [
        `Et correspon el CAP de la teva adreça, però pots triar qualsevol altre centre públic de Catalunya, o un altre metge, pediatre o infermer dins del teu. La sol·licitud es presenta al CAP nou, emplenada, i si no et responen en deu dies hàbils s'entén acceptada (${a(TSI_URLS.capChange, "procediment del CatSalut")}). Algunes coses es queden al CAP del teu domicili: l'atenció a casa, el treball social i l'atenció continuada fora d'horari. Si no estàs empadronat a Catalunya pots rebre assistència, però no triar centre.`,
      ],
      useH: "Demanar hora i La Meva Salut",
      use: [
        `Pots demanar cita per telèfon, al taulell del CAP o en línia a ${a(TSI_URLS.appointments, "La Meva Salut")} (apartat «Cites i agenda»), que també té els informes, les vacunes, el pla de medicació i l'eConsulta. S'hi entra amb l'idCAT Mòbil o un certificat digital, i aviat amb Cl@ve; el CatSalut està deixant de crear contrasenyes noves.`,
      ],
      warnTitle: "Tot el tràmit és gratuït",
      warn: "Demanar la TSI no costa res i la targeta arriba per correu sense cost. Si algú et cobra per «tramitar-te la targeta sanitària», el que pagues és la gestió, no el tràmit.",
      faqH: "Preguntes freqüents",
      faq: [
        { question: "Cal estar empadronat per tenir la targeta sanitària?", answer: "Sí. Estar empadronat en un municipi de Catalunya és el requisit bàsic per a tothom. Al CAP et demanaran un certificat d'empadronament de menys de tres mesos, tret que el teu ajuntament permeti la consulta en línia." },
        { question: "Es pot demanar la TSI per internet?", answer: "Sí. El CatSalut té un formulari en línia, en català, castellà o aranès. Si la sol·licitud es valida, reps per correu electrònic un resguard provisional amb el CIP, i la targeta arriba després per correu postal." },
        { question: "Quant es triga a tenir la targeta sanitària?", answer: "Si la sol·licitud en línia es valida, el resguard provisional amb el CIP arriba per correu electrònic; si queda pendent, es resol en els dies següents. El CatSalut no publica quant triga la targeta física, però el resguard i la TSI digital ja et donen accés." },
        { question: "Puc tenir la TSI si no treballo?", answer: "Sí. Si cobres l'atur o una pensió ja tens el dret. Si no, pots ser beneficiari d'un familiar assegurat, demanar a l'INSS el reconeixement com a titular si tens residència legal, o anar a les vies del CatSalut per a qui no té cap altra cobertura." },
        { question: "Puc tenir la targeta sanitària sense papers?", answer: "Sí. Les persones estrangeres sense residència legal tenen dret a l'atenció pública. Ho demanes al CAP amb una declaració responsable, un document d'identitat i el padró, i en presentar-ho reps un document provisional que ja et dona accés." },
        { question: "Soc ciutadà de la UE: em serveix la targeta sanitària europea?", answer: "Només per a estades temporals. Si vius a Catalunya, has de lliurar a l'INSS el formulari del teu país (l'S1, per exemple) o, si no en tens, demanar-hi el reconeixement del dret; després demanes la TSI." },
        { question: "He perdut la targeta sanitària: què faig?", answer: "Demana un duplicat al teu CAP. Arriba per correu postal i l'antiga deixa de funcionar. Mentrestant pots fer servir la TSI digital de La Meva Salut, que té la mateixa validesa." },
        { question: "Com canvio de CAP o de metge de capçalera?", answer: "Presenta la sol·licitud de lliure elecció en persona al CAP on vols anar. Et responen en deu dies hàbils com a màxim i, si no ho fan, s'entén acceptada. Ho pots tornar a canviar al cap d'un any." },
        { question: "Què és el CIP?", answer: "El codi d'identificació personal que el CatSalut assigna a cada persona. Surt a la targeta i al resguard provisional, i és el que fan servir els centres per identificar-te." },
      ],
      official: "CatSalut (obtenció de la TSI, formulari en línia, TSI digital, gestions, accés, nivells de cobertura, S1, conveni especial, desplaçaments, lliure elecció de CAP, La Meva Salut), Seguretat Social (titulars i documents) i Reial decret 180/2026 (BOE).",
    },
    es: {
      lead: `**Para tener la tarjeta sanitaria (TSI) hay que estar empadronado en un municipio de Cataluña, y se pide al CatSalut, por internet o en tu centro de atención primaria (CAP).** Si trabajas, cobras una pensión o el paro, ya tienes el derecho reconocido por la Seguridad Social y puedes pedir la tarjeta directamente. Si se aprueba la solicitud en línea, recibes por correo electrónico un resguardo provisional con tu código de identificación personal (CIP), que ya te da acceso a los centros públicos hasta que la tarjeta llega por correo a casa, sin coste. Los familiares, los bebés y los ciudadanos de la UE que viven aquí pasan antes por el INSS; las personas extranjeras sin residencia legal también tienen derecho y lo piden en el CAP.`,
      factsTitle: "La TSI en seis respuestas",
      facts: [
        { label: "Qué es", value: "La tarjeta que te identifica en la sanidad pública catalana, con tu código CIP y el nivel de cobertura" },
        { label: "Requisito básico", value: "Estar empadronado en un municipio de Cataluña" },
        { label: "Dónde se pide", value: "Formulario en línea del CatSalut o el CAP que te corresponde por domicilio" },
        { label: "Mientras esperas", value: "Resguardo provisional con el CIP por correo electrónico; después, la TSI digital en La Meva Salut" },
        { label: "Precio", value: "Gratis: el CatSalut envía la tarjeta por correo postal" },
        { label: "Quién reconoce el derecho", value: "El INSS para trabajadores, pensionistas y familiares; el CatSalut para el resto" },
      ],
      whoH: "Quién tiene derecho, según tu situación",
      whoIntro: [
        `Todos los residentes en Cataluña tienen garantizada la atención sanitaria. Lo que cambia es quién reconoce el derecho antes de que el CatSalut emita la tarjeta y qué **nivel de cobertura** aparece impreso en el dorso. La primera tabla es para quien está en la Seguridad Social y su familia; la segunda, para el resto de situaciones.`,
      ],
      workCaption: "Trabajadores, pensionistas y sus familias",
      workHead: ["Situación", "Qué haces primero", "Después"],
      workRows: [
        ["Trabajas (por cuenta ajena o autónomo) y estás de alta en la Seguridad Social", "Nada: el derecho ya consta en el INSS", "Pides la TSI por internet o en el CAP"],
        ["Cobras una pensión o una prestación de la Seguridad Social (el paro, por ejemplo)", "Nada: el derecho ya consta en el INSS", "Pides la TSI por internet o en el CAP"],
        ["Cónyuge o pareja de hecho, hijos, hermanos de una persona asegurada", "La persona asegurada te da de alta como beneficiario en el INSS (hijos y hermanos, menores de 26 años o con una discapacidad del 65 % o más)", "Pides la TSI cuando el INSS responde"],
        ["Bebé", "Alta como beneficiario del padre, la madre o el tutor en el INSS (se puede hacer desde el hospital, si das tu consentimiento) y empadronamiento", "Pides la TSI del bebé por internet o en el CAP"],
        ["Funcionario de MUFACE, MUGEJU o ISFAS", "Nada, si estás en uno de los colectivos de la mutualidad", "Pides la TSI directamente; si elegiste sanidad privada, la cobertura pública es la mínima"],
      ],
      workNote: "Fuentes: CatSalut (obtención de la TSI y niveles de cobertura) y Seguridad Social (titulares y beneficiarios), consultadas el 13 de noviembre de 2026.",
      otherCaption: "Ciudadanos de la UE, personas extranjeras y otros casos",
      otherHead: ["Situación", "Qué tienes que hacer", "Cobertura"],
      otherRows: [
        ["Ciudadano de la UE, el EEE, Suiza o el Reino Unido de visita (estancia temporal)", "No necesitas la TSI: presenta la tarjeta sanitaria europea (TSE) o el certificado provisional sustitutorio y un documento de identidad", "La misma asistencia pública que los residentes para los problemas que surjan durante la estancia"],
        ["Ciudadano de la UE o del Reino Unido que vive en Cataluña, asegurado en tu país (con el formulario S1, por ejemplo)", "Entrega el formulario de tu país al INSS, que lo valida; después pides la TSI", "Cobertura sanitaria S1: lleva siempre el formulario S1 en papel"],
        ["Residente extranjero (de la UE o no) con residencia legal, que no trabaja ni cobra ninguna prestación", "Pide al INSS el reconocimiento del derecho como titular: residencia legal, padrón y, si vienes de la UE, el EEE, Suiza o el Reino Unido, un certificado de tu país que diga que no exporta allí la cobertura", "Cobertura sanitaria general, cuando el INSS la reconoce"],
        ["Persona extranjera sin residencia legal (en situación irregular)", "Lo pides en el CAP con una declaración responsable, el pasaporte u otro documento de identidad y el padrón. Al presentarlo recibes un documento provisional que ya da acceso", "Cobertura sanitaria general, para los servicios de Cataluña"],
        ["Solicitante de protección internacional o víctima de trata de seres humanos", "Lo pides en el CAP con la documentación de tu situación", "Cobertura sanitaria general"],
        ["Persona extranjera empadronada en Cataluña que no encaja en ningún caso anterior", "Pides el «Accés CatSalut segon nivell» en el CAP que te corresponde por domicilio", "Solo válida en Cataluña"],
        ["Sin derecho por ninguna vía y sin ningún otro seguro público", "Convenio especial: un año de residencia en España y padrón en Cataluña; se pide con cita en la unidad de atención al ciudadano de la región sanitaria, que responde en 30 días como máximo", "Cuota mensual de 60 € (menos de 65 años) o 157 € (65 o más)"],
        ["Vienes de otra comunidad autónoma a vivir a Cataluña", "Pides la TSI catalana como si fuera la primera. Si solo estás de paso, usa la tarjeta de tu comunidad", "La que te corresponda"],
        ["Vuelves a vivir en Cataluña después de un tiempo fuera", "Vuelves a pedir la TSI, igual que la primera vez", "La que te corresponda"],
      ],
      otherNote: `Fuentes: CatSalut (acceso, niveles de cobertura, S1, convenio especial, desplazamientos), Seguridad Social y Real Decreto 180/2026 (${a(TSI_URLS.rd180, "BOE")}), consultados el 13 de noviembre de 2026.`,
      undocH: "Sin papeles: qué cambió en marzo de 2026",
      undoc: [
        `Las personas extranjeras sin residencia legal tienen derecho a la atención sanitaria pública si viven en España y no tienen otra cobertura (por ejemplo, la de su país). El **Real Decreto 180/2026**, en vigor desde el 13 de marzo de 2026, fija cómo se pide: una declaración responsable, el pasaporte u otro documento oficial de identidad con fotografía, y el certificado o volante de padrón actualizado. Si no puedes empadronarte, valen otras pruebas, como la matrícula escolar de los hijos, un certificado de visitas de los servicios sociales o facturas de luz, agua o gas a tu nombre.`,
        `Al presentar la solicitud te tienen que dar un **documento provisional** que ya te da acceso a la asistencia mientras se resuelve. La administración tiene tres meses para responder; si no responde, la solicitud se entiende aceptada. El documento definitivo no caduca. En todos los casos, los menores tienen la misma atención que cualquier residente, y las mujeres embarazadas, la atención al embarazo, el parto y el posparto.`,
        `Una nota: la página del CatSalut sobre esta vía, actualizada en noviembre de 2025, todavía habla de «más de tres meses de empadronamiento». El decreto posterior no fija ningún mínimo, y la página de niveles de cobertura del CatSalut (agosto de 2026) ya lo cita. Si estás en esta situación, ve al CAP enseguida y pídelo: el decreto obliga a los centros a informarte y a dejarte iniciar el trámite allí mismo.`,
      ],
      docsH: "Qué documentos necesitas",
      docs: [
        `Si pides la TSI en el CAP puedes autorizar al CatSalut a consultar tus datos en otras administraciones, o bien llevarlos tú:`,
      ],
      docsList: [
        "Documento de identidad: DNI, NIE o pasaporte.",
        `Certificado de empadronamiento emitido hace menos de tres meses. Si tu ayuntamiento ofrece la consulta en línea, no hace falta; si no, lleva el original (${padroShort}).`,
        "Si lo pides para otra persona, el documento que acredite la representación: el certificado de nacimiento o el libro de familia, en el caso de un hijo.",
      ],
      docsAfter: [
        `Si antes tienes que pasar por el **INSS** (familiares, residentes que no trabajan, ciudadanos de la UE), la Seguridad Social pide el DNI o la tarjeta de identidad de extranjero (TIE) o el pasaporte, la residencia legal si no eres español, el certificado de padrón si te has empadronado hace poco, el libro de familia o el certificado de matrimonio o de pareja de hecho para los familiares y, para los ciudadanos de la UE, el EEE, Suiza o el Reino Unido, el certificado de tu país que dice que no exporta allí la cobertura (${a(TSI_URLS.inssHow, "Seguridad Social")}). Si aún no tienes el NIE o la TIE: ${nieTie}.`,
      ],
      howH: "Cómo se pide, paso a paso",
      stepsTitle: "Del empadronamiento a la tarjeta",
      steps: [
        { title: "Empadrónate", text: `Es el requisito básico para todos. Cómo se hace y qué documentos pide el ayuntamiento, con contrato o sin él, en la ${padro}.` },
        { title: "Pasa por el INSS, si te toca", text: "Si trabajas o cobras una pensión o una prestación, salta este paso. Los familiares, los bebés, los residentes que no trabajan y los ciudadanos de la UE con S1 necesitan antes la respuesta del INSS: por internet en la sede electrónica de la Seguridad Social o con cita en sus oficinas." },
        { title: "Pide la TSI", text: `Por internet, con el ${a(TSI_URLS.form, "formulario del CatSalut")} (en catalán, castellano o aranés; se puede adjuntar un archivo de 2.048 KB como máximo), o en persona en el CAP que te corresponde por domicilio, que puedes consultar en el ${a(TSI_URLS.capFinder, "buscador del CatSalut")}.` },
        { title: "Espera la validación", text: "El CatSalut comprueba el padrón y el alta en el INSS con las otras administraciones. Si todo cuadra, recibirás por correo electrónico el resguardo provisional con tu CIP. Si hace falta alguna comprobación, la solicitud queda pendiente y se resuelve en los días siguientes." },
        { title: "Recibe la tarjeta", text: "El CatSalut envía la TSI gratis por correo postal a tu domicilio. Mientras tanto puedes usar el resguardo, y la versión digital aparece en La Meva Salut en cuanto tienes el CIP." },
      ],
      provH: "El resguardo provisional y la TSI digital",
      prov: [
        `**Resguardo provisional.** Cuando el CatSalut aprueba la solicitud en línea, te envía por correo electrónico un resguardo con el CIP asignado. Con este resguardo ya puedes ir a los centros y servicios de la sanidad pública hasta que te llega la tarjeta física (${a(TSI_URLS.first, "CatSalut, en catalán")}).`,
        `**TSI digital.** La tarjeta digital de La Meva Salut y La Meva Cartera tiene la misma validez que la física y se genera sola cuando se te asigna el CIP, aunque no tengas la tarjeta de plástico. Funciona con código de barras, y se está añadiendo un código QR. Como no todos los centros tienen lectores todavía, el CatSalut recomienda llevar también la física (${a(TSI_URLS.digital, "La TSI digital")}).`,
        "**Documento provisional sin residencia legal.** Si lo pides por la vía del Real Decreto 180/2026, el documento que te dan al presentar la solicitud te da acceso a la asistencia hasta que se resuelve el expediente.",
      ],
      timeH: "Cuánto se tarda",
      timeCaption: "Plazos oficiales de cada trámite",
      timeHead: ["Trámite", "Plazo"],
      timeRows: [
        ["Solicitud de la TSI por internet", "Resguardo provisional por correo electrónico si se valida; si queda pendiente, se resuelve en los días siguientes"],
        ["Tarjeta física", "Llega por correo postal (el CatSalut no publica ningún plazo)"],
        ["Personas sin residencia legal (Real Decreto 180/2026)", "Documento provisional en el momento de la solicitud; resolución en 3 meses como máximo, y si no hay respuesta, aceptada"],
        ["Convenio especial", "Resolución en 30 días como máximo"],
        ["Cambio de CAP o de médico", "Respuesta en 10 días hábiles como máximo; si no hay respuesta, aceptado"],
      ],
      timeNote: "Fuentes: CatSalut y BOE, consultados el 13 de noviembre de 2026.",
      afterH: "Renovación, pérdida, cambio de domicilio y cambio de CAP",
      afterCaption: "Qué hacer en cada caso una vez tienes la tarjeta",
      afterHead: ["Caso", "Qué tienes que hacer"],
      afterRows: [
        ["Renovación", "El CatSalut no pide renovar la tarjeta: los modelos antiguos siguen siendo válidos. Lo que tienes que mantener al día es el padrón (si no eres de la UE y no tienes residencia de larga duración, se renueva cada 2 años)"],
        ["Pérdida, robo o tarjeta estropeada", "Pide un duplicado en tu CAP. Llega por correo y la antigua deja de ser válida. Mientras tanto, usa la TSI digital"],
        ["Datos erróneos en la tarjeta", "Avisa al CAP o llama al 061 Salut Respon. Si el error está en los apellidos, el género o la fecha de nacimiento, el CatSalut te envía una tarjeta nueva gratis"],
        ["Cambio de domicilio", "Comunícalo al CAP o al 061: quizá te cambien de CAP y de médico. No te hacen una tarjeta nueva"],
        ["Cambio de CAP o de médico", "Libre elección: presenta la solicitud en persona en el CAP al que quieres ir (por teléfono no se puede). Puedes volver a hacerlo al cabo de un año, o antes si cambias de domicilio"],
      ],
      afterNote: "Fuentes: CatSalut (TSI, gestiones relacionadas y libre elección), consultadas el 13 de noviembre de 2026.",
      capH: "Elegir otro CAP",
      cap: [
        `Te corresponde el CAP de tu dirección, pero puedes elegir cualquier otro centro público de Cataluña, u otro médico, pediatra o enfermero dentro del tuyo. La solicitud se presenta en el CAP nuevo, rellenada, y si no te responden en diez días hábiles se entiende aceptada (${a(TSI_URLS.capChange, "procedimiento del CatSalut, en catalán")}). Algunas cosas se quedan en el CAP de tu domicilio: la atención en casa, el trabajo social y la atención continuada fuera de horario. Si no estás empadronado en Cataluña puedes recibir asistencia, pero no elegir centro.`,
      ],
      useH: "Pedir hora y La Meva Salut",
      use: [
        `Puedes pedir cita por teléfono, en el mostrador del CAP o en línea en ${a(TSI_URLS.appointments, "La Meva Salut")} (apartado «Cites i agenda»), que también tiene los informes, las vacunas, el plan de medicación y la eConsulta. Se entra con el idCAT Mòbil o un certificado digital, y pronto con Cl@ve; el CatSalut está dejando de crear contraseñas nuevas.`,
      ],
      warnTitle: "Todo el trámite es gratuito",
      warn: "Pedir la TSI no cuesta nada y la tarjeta llega por correo sin coste. Si alguien te cobra por «tramitarte la tarjeta sanitaria», lo que pagas es la gestión, no el trámite.",
      faqH: "Preguntas frecuentes",
      faq: [
        { question: "¿Hay que estar empadronado para tener la tarjeta sanitaria?", answer: "Sí. Estar empadronado en un municipio de Cataluña es el requisito básico para todos. En el CAP te pedirán un certificado de empadronamiento de menos de tres meses, salvo que tu ayuntamiento permita la consulta en línea." },
        { question: "¿Se puede pedir la TSI por internet?", answer: "Sí. El CatSalut tiene un formulario en línea, en catalán, castellano o aranés. Si la solicitud se valida, recibes por correo electrónico un resguardo provisional con el CIP, y la tarjeta llega después por correo postal." },
        { question: "¿Cuánto se tarda en tener la tarjeta sanitaria?", answer: "Si la solicitud en línea se valida, el resguardo provisional con el CIP llega por correo electrónico; si queda pendiente, se resuelve en los días siguientes. El CatSalut no publica cuánto tarda la tarjeta física, pero el resguardo y la TSI digital ya te dan acceso." },
        { question: "¿Puedo tener la TSI si no trabajo?", answer: "Sí. Si cobras el paro o una pensión ya tienes el derecho. Si no, puedes ser beneficiario de un familiar asegurado, pedir al INSS el reconocimiento como titular si tienes residencia legal, o ir a las vías del CatSalut para quien no tiene ninguna otra cobertura." },
        { question: "¿Puedo tener la tarjeta sanitaria sin papeles?", answer: "Sí. Las personas extranjeras sin residencia legal tienen derecho a la atención pública. Lo pides en el CAP con una declaración responsable, un documento de identidad y el padrón, y al presentarlo recibes un documento provisional que ya te da acceso." },
        { question: "Soy ciudadano de la UE: ¿me sirve la tarjeta sanitaria europea?", answer: "Solo para estancias temporales. Si vives en Cataluña, tienes que entregar al INSS el formulario de tu país (el S1, por ejemplo) o, si no lo tienes, pedir allí el reconocimiento del derecho; después pides la TSI." },
        { question: "He perdido la tarjeta sanitaria: ¿qué hago?", answer: "Pide un duplicado en tu CAP. Llega por correo postal y la antigua deja de funcionar. Mientras tanto puedes usar la TSI digital de La Meva Salut, que tiene la misma validez." },
        { question: "¿Cómo cambio de CAP o de médico de cabecera?", answer: "Presenta la solicitud de libre elección en persona en el CAP al que quieres ir. Te responden en diez días hábiles como máximo y, si no lo hacen, se entiende aceptada. Puedes volver a cambiarlo al cabo de un año." },
        { question: "¿Qué es el CIP?", answer: "El código de identificación personal que el CatSalut asigna a cada persona. Aparece en la tarjeta y en el resguardo provisional, y es lo que usan los centros para identificarte." },
      ],
      official: "CatSalut (obtención de la TSI, formulario en línea, TSI digital, gestiones, acceso, niveles de cobertura, S1, convenio especial, desplazamientos, libre elección de CAP, La Meva Salut; páginas en catalán), Seguridad Social (titulares y documentos) y Real Decreto 180/2026 (BOE).",
    },
    en: {
      lead: `**To get the health card (TSI) you must be on the padró in a Catalan municipality, and you apply to CatSalut, online or at your primary care centre (CAP).** If you work, draw a pension or unemployment benefit, Social Security already recognises your right and you can ask for the card straight away. If the online application is approved, a provisional receipt with your personal identification code (CIP) arrives by email: it already gets you into public health centres until the card reaches your home by post, free. Family members, newborns and EU citizens living here go through the INSS first; foreign nationals without legal residence are entitled too and apply at the CAP.`,
      factsTitle: "The TSI in six answers",
      facts: [
        { label: "What it is", value: "The card that identifies you in Catalonia's public health service, with your CIP code and coverage level" },
        { label: "Basic requirement", value: "Being registered on the padró in a Catalan municipality" },
        { label: "Where to apply", value: "CatSalut's online form or the CAP for your address" },
        { label: "While you wait", value: "A provisional receipt with your CIP by email; then the digital TSI in La Meva Salut" },
        { label: "Cost", value: "Free: CatSalut posts the card to you" },
        { label: "Who recognises the right", value: "The INSS for workers, pensioners and their families; CatSalut for everyone else" },
      ],
      whoH: "Who is entitled, by situation",
      whoIntro: [
        `Everyone resident in Catalonia is guaranteed healthcare. What changes is who recognises your right before CatSalut issues the card, and which **coverage level** is printed on the back. The first table is for people in the Social Security system and their families; the second covers every other situation.`,
      ],
      workCaption: "Workers, pensioners and their families",
      workHead: ["Situation", "What you do first", "Then"],
      workRows: [
        ["You work (employed or self-employed) and are registered with Social Security", "Nothing: the INSS already has your right on record", "Apply for the TSI online or at the CAP"],
        ["You receive a Social Security pension or benefit (unemployment, for example)", "Nothing: the INSS already has your right on record", "Apply for the TSI online or at the CAP"],
        ["Spouse or registered partner, children or siblings of an insured person", "The insured person adds you as a dependant (beneficiario) at the INSS (children and siblings under 26, or with a disability of 65% or more)", "Apply for the TSI once the INSS answers"],
        ["Newborn baby", "Registration as a dependant of the father, mother or guardian at the INSS (it can be done from the hospital, with your consent), and the padró", "Apply for the baby's TSI online or at the CAP"],
        ["Civil servant with MUFACE, MUGEJU or ISFAS", "Nothing, if you are in one of the mutual fund's groups", "Apply for the TSI directly; if you chose private healthcare, your public coverage is the minimum level"],
      ],
      workNote: "Sources: CatSalut (first TSI and coverage levels) and Spain's Social Security (holders and dependants), read on 13 November 2026.",
      otherCaption: "EU citizens, foreign nationals and other cases",
      otherHead: ["Situation", "What to do", "Coverage"],
      otherRows: [
        ["EU, EEA, Swiss or UK citizen on a visit (temporary stay)", "You do not need a TSI: show your European Health Insurance Card (EHIC, or the UK GHIC) or the provisional replacement certificate, plus ID", "The same public care as residents for problems that arise during your stay"],
        ["EU or UK citizen living in Catalonia and insured in your home country (with an S1 form, for example)", "Hand your country's form to the INSS, which validates it; then apply for the TSI", "S1 coverage: always carry the paper S1"],
        ["Foreign resident (EU or not) with legal residence who neither works nor receives a benefit", "Ask the INSS to recognise you as a holder (titular): legal residence, the padró and, if you come from the EU, EEA, Switzerland or the UK, a certificate from your country saying it does not export your cover to Spain", "General coverage, once the INSS recognises it"],
        ["Foreign national without legal residence (undocumented)", "Apply at the CAP with a sworn statement, your passport or other ID and the padró. On applying you get a provisional document that already gives access", "General coverage, for services in Catalonia"],
        ["Asylum seeker or victim of human trafficking", "Apply at the CAP with the documents for your situation", "General coverage"],
        ["Foreign national on a Catalan padró who fits none of the above", "Ask for \"Accés CatSalut segon nivell\" at the CAP for your address", "Valid in Catalonia only"],
        ["No right by any route and no other public cover", "Special agreement (conveni especial): one year's residence in Spain and the padró in Catalonia; apply by appointment at the health region's citizen service unit, which answers within 30 days", "Monthly fee of €60 (under 65) or €157 (65 and over)"],
        ["Moving from another Spanish region to live in Catalonia", "Apply for the Catalan TSI as if it were your first. If you are only visiting, use your own region's card", "Whatever applies to you"],
        ["Coming back to live in Catalonia after time abroad", "Apply for the TSI again, as the first time", "Whatever applies to you"],
      ],
      otherNote: `Sources: CatSalut (access, coverage levels, S1, special agreement, travel), Spain's Social Security and Royal Decree 180/2026 (${a(TSI_URLS.rd180, "BOE, in Spanish")}), read on 13 November 2026.`,
      undocH: "Undocumented: what changed in March 2026",
      undoc: [
        `Foreign nationals without legal residence are entitled to public healthcare if they live in Spain and have no other cover (from their own country, for example). **Royal Decree 180/2026**, in force since 13 March 2026, sets out how to apply: a sworn statement, your passport or another official photo ID, and an up-to-date padró certificate or volante. If you cannot register on the padró, other proof works, such as your children's school enrolment, a social-services record of visits, or electricity, water or gas bills in your name.`,
        `When you apply you must be given a **provisional document** that gets you care while the application is decided. The authorities have three months to answer; if they do not, the application counts as accepted. The final document does not expire. In every case, children get the same care as any resident, and pregnant women get pregnancy, birth and postnatal care.`,
        `One note: CatSalut's page on this route, last updated in November 2025, still says "more than three months on the padró". The later decree sets no minimum, and CatSalut's coverage-levels page (August 2026) already cites it. If this is your situation, go to the CAP straight away and apply: the decree requires health centres to inform you and let you start the procedure there.`,
      ],
      docsH: "Which documents you need",
      docs: [
        `If you apply at the CAP you can authorise CatSalut to check your details with other authorities, or bring them yourself:`,
      ],
      docsList: [
        "ID: DNI, NIE or passport.",
        `A padró certificate issued within the last three months. Not needed if your council offers online checks; otherwise bring the original (${padroShort}).`,
        "If you apply for someone else, proof that you represent them: for a child, the birth certificate or family book.",
      ],
      docsAfter: [
        `If you have to go through the **INSS** first (family members, residents who do not work, EU citizens), Social Security asks for your DNI or foreigner's identity card (TIE) or passport, proof of legal residence if you are not Spanish, a padró certificate if you registered recently, the family book or a marriage or registered-partnership certificate for dependants and, for EU, EEA, Swiss or UK citizens, the certificate from your country saying it does not export your cover (${a(TSI_URLS.inssHow, "Social Security, in Spanish")}). If you do not have a NIE or TIE yet: ${nieTie}.`,
      ],
      howH: "How to apply, step by step",
      stepsTitle: "From the padró to the card",
      steps: [
        { title: "Register on the padró", text: `It is the basic requirement for everyone. How to do it and what the council asks for, with or without a rental contract, is in our ${padro}.` },
        { title: "Go through the INSS, if it applies", text: "If you work or receive a pension or benefit, skip this step. Family members, newborns, residents who do not work and EU citizens with an S1 need the INSS's answer first: online on the Social Security e-office or by appointment at its offices." },
        { title: "Apply for the TSI", text: `Online, with ${a(TSI_URLS.form, "CatSalut's form")} (in Catalan, Spanish or Aranese; you can attach one file of up to 2,048 KB), or in person at the CAP for your address, which ${a(TSI_URLS.capFinder, "CatSalut's finder")} shows.` },
        { title: "Wait for the check", text: "CatSalut checks your padró and INSS status with the other authorities. If everything matches, you get the provisional receipt with your CIP by email. If something needs checking, the application is left pending and decided in the following days." },
        { title: "Receive the card", text: "CatSalut posts the TSI to your home free of charge. Meanwhile you can use the receipt, and the digital version appears in La Meva Salut as soon as you have your CIP." },
      ],
      provH: "The provisional receipt and the digital TSI",
      prov: [
        `**Provisional receipt.** When CatSalut approves an online application, it emails you a receipt with your CIP. With it you can already use public health centres and services until the plastic card arrives (${a(TSI_URLS.first, "CatSalut, in Catalan")}).`,
        `**Digital TSI.** The digital card in the La Meva Salut and La Meva Cartera apps is as valid as the plastic one and is created automatically once you have a CIP, even before the physical card exists. It works with a barcode, and a QR code is being added. Not every centre has the readers yet, so CatSalut recommends carrying the physical card as well (${a(TSI_URLS.digital, "the digital TSI, in Catalan")}).`,
        "**Provisional document without legal residence.** If you apply under Royal Decree 180/2026, the document you are given on applying gets you care until your file is decided.",
      ],
      timeH: "How long it takes",
      timeCaption: "Official timings for each step",
      timeHead: ["Step", "Timing"],
      timeRows: [
        ["Online TSI application", "Provisional receipt by email if it validates; if left pending, decided in the following days"],
        ["Physical card", "Arrives by post (CatSalut publishes no timing)"],
        ["People without legal residence (Royal Decree 180/2026)", "Provisional document when you apply; a decision within 3 months, and if none comes, accepted"],
        ["Special agreement (conveni especial)", "A decision within 30 days"],
        ["Changing CAP or doctor", "An answer within 10 working days; if none comes, accepted"],
      ],
      timeNote: "Sources: CatSalut and the BOE, read on 13 November 2026.",
      afterH: "Renewal, lost cards, moving house and changing CAP",
      afterCaption: "What to do in each case once you have the card",
      afterHead: ["Case", "What to do"],
      afterRows: [
        ["Renewal", "CatSalut does not ask you to renew the card: older designs are still valid. What you must keep up to date is the padró (non-EU nationals without long-term residence renew it every 2 years)"],
        ["Lost, stolen or damaged card", "Ask your CAP for a duplicate. It arrives by post and the old card stops working. Meanwhile, use the digital TSI"],
        ["Wrong details on the card", "Tell your CAP or call 061 Salut Respon. If the error is in your surnames, gender or date of birth, CatSalut sends a new card free"],
        ["Moving house", "Tell your CAP or 061: you may be moved to another CAP and doctor. You do not get a new card"],
        ["Changing CAP or doctor", "Free choice: hand in the request in person at the CAP you want (not by phone). You can change again after a year, or sooner if you move house"],
      ],
      afterNote: "Sources: CatSalut (TSI, card procedures and free choice of CAP), read on 13 November 2026.",
      capH: "Choosing a different CAP",
      cap: [
        `You are assigned the CAP for your address, but you can choose any other public centre in Catalonia, or another GP, paediatrician or nurse within yours. Hand the completed request in at the new CAP; if it does not answer within ten working days, the request counts as accepted (${a(TSI_URLS.capChange, "CatSalut's procedure, in Catalan")}). Some services stay with the CAP for your address: home visits, social work and out-of-hours care. If you are not on a Catalan padró you can still be treated, but you cannot choose a centre.`,
      ],
      useH: "Booking appointments and La Meva Salut",
      use: [
        `You can book by phone, at the CAP desk or online in ${a(TSI_URLS.appointments, "La Meva Salut")} (under "Cites i agenda"), which also holds your reports, vaccinations, medication plan and eConsulta messaging. You log in with idCAT Mòbil or a digital certificate, and soon with Cl@ve; CatSalut is phasing out new passwords.`,
      ],
      warnTitle: "The whole procedure is free",
      warn: "Applying for the TSI costs nothing and the card is posted to you free. If someone charges you to \"get you a health card\", you are paying for their service, not for the procedure.",
      faqH: "Frequently asked questions",
      faq: [
        { question: "Do I need to be on the padró to get a health card in Catalonia?", answer: "Yes. Being registered on the padró in a Catalan municipality is the basic requirement for everyone. At the CAP you will be asked for a padró certificate issued within three months, unless your council allows online checks." },
        { question: "Can I apply for the TSI online?", answer: "Yes. CatSalut has an online form in Catalan, Spanish or Aranese. If the application validates, a provisional receipt with your CIP arrives by email, and the card follows by post." },
        { question: "How long does it take to get the health card?", answer: "If the online application validates, the provisional receipt with your CIP arrives by email; if it is left pending, it is decided in the following days. CatSalut publishes no timing for the plastic card, but the receipt and the digital TSI already give you access." },
        { question: "Can I get a TSI if I do not work?", answer: "Yes. If you receive unemployment benefit or a pension you already have the right. Otherwise you can be a dependant of an insured relative, ask the INSS to recognise you as a holder if you have legal residence, or use CatSalut's routes for people with no other cover." },
        { question: "Can I get a health card if I am undocumented?", answer: "Yes. Foreign nationals without legal residence are entitled to public healthcare. Apply at the CAP with a sworn statement, an ID document and the padró; on applying you get a provisional document that already gives access." },
        { question: "I am an EU citizen: is my EHIC enough?", answer: "Only for temporary stays. If you live in Catalonia, hand your country's form (the S1, for example) to the INSS or, if you have none, ask it to recognise your right; then apply for the TSI." },
        { question: "I have lost my health card: what do I do?", answer: "Ask your CAP for a duplicate. It arrives by post and the old card stops working. Meanwhile you can use the digital TSI in La Meva Salut, which is just as valid." },
        { question: "How do I change my CAP or GP?", answer: "Hand in the free-choice request in person at the CAP you want. It must answer within ten working days and, if it does not, the request counts as accepted. You can change again after a year." },
        { question: "What is the CIP?", answer: "The personal identification code CatSalut gives each person. It is on the card and on the provisional receipt, and it is what health centres use to identify you." },
      ],
      official: "CatSalut (first TSI, online form, digital TSI, card procedures, access, coverage levels, S1, special agreement, travel, free choice of CAP, La Meva Salut; pages in Catalan), Spain's Social Security (holders and documents) and Royal Decree 180/2026 (BOE).",
    },
  }[L];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    ...h2(t.whoH, ...t.whoIntro),
    table(t.workCaption, t.workHead, t.workRows, t.workNote),
    table(t.otherCaption, t.otherHead, t.otherRows, t.otherNote),
    ...h2(t.undocH, ...t.undoc),
    ...h2(t.docsH, ...t.docs),
    list(...t.docsList),
    ...paras(...t.docsAfter),
    { type: "heading", level: 2, text: t.howH } as Block,
    steps(t.stepsTitle, t.steps),
    ...h2(t.provH, ...t.prov),
    ...h2(t.timeH),
    table(t.timeCaption, t.timeHead, t.timeRows, t.timeNote),
    ...h2(t.afterH),
    table(t.afterCaption, t.afterHead, t.afterRows, t.afterNote),
    ...h2(t.capH, ...t.cap),
    ...h2(t.useH, ...t.use),
    callout("tip", t.warnTitle, t.warn),
    { type: "heading", level: 2, text: t.faqH } as Block,
    faq(t.faq),
    callout("official", verifiedLine(L, TSI_AS_OF), t.official),
    ...b2Related(["padro", "nieTie", "barcelonaHub", "foreignVote", "transport"], L),
  ];
}

export const TSI_GUIDE: B2Article = {
  key: "tsi",
  entryKey: "guide-health-card-tsi-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "barcelona-hub-vista-carmel",
  heroAlt: {
    ca: "Vista de Barcelona des dels Bunkers del Carmel, amb la ciutat fins al mar",
    es: "Vista de Barcelona desde los Búnkeres del Carmel, con la ciudad hasta el mar",
    en: "Barcelona seen from the Bunkers del Carmel, the city stretching to the sea",
  },
  heroCaption: {
    ca: "La TSI dona accés als centres sanitaris públics de tot Catalunya.",
    es: "La TSI da acceso a los centros sanitarios públicos de toda Cataluña.",
    en: "The TSI gives access to public health centres across Catalonia.",
  },
  verifiedAt: TSI_AS_OF,
  publishedAt: "2026-11-13T18:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [locale, { path: B2_PATHS.tsi[locale], ...TSI_META[locale], blocks: buildTsiBody(locale) }]),
  ) as B2Article["editions"],
};
