import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { MoreCalculators } from "@/components/programmatic/calculators/MoreCalculators";
import { ShareBar } from "@/components/share/ShareBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { hubCrumb } from "@/lib/programmatic/calculators/hub";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { CATEGORY_LABEL, bareDay, dayInText, euros, frequencyText, itvEditions, itvPath, yearsText, type ItvLocale } from "@/lib/programmatic/itv/copy";
import { firstDue, onTimeChain } from "@/lib/programmatic/itv/engine";
import { itvMeta } from "@/lib/programmatic/itv/page";
import { DGT_FEE, PRICES_AS_OF, REGIONS, type Region } from "@/lib/programmatic/itv/prices";
import { BOE, CATEGORIES, FINE, ITV_RULES_AS_OF, QUOTE, type Category } from "@/lib/programmatic/itv/rules";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { ItvCalculator } from "./ItvCalculator";

/**
 * "¿Cuándo me toca pasar la ITV?" / "Quan em toca passar l'ITV?" / "When is
 * my ITV due?": the calculator (RD 920/2017 art. 6), the frequency table by
 * vehicle type with the BOE's words, the 30-day rule, what driving with an
 * expired ITV costs (Ley de Tráfico), the V-19 sticker, historic vehicles,
 * the official fee per community (only where the community publishes one)
 * and each community's official station list. Static: it ships with the
 * deploy (no publish group).
 */

const L = <T,>(locale: ItvLocale, v: Record<ItvLocale, T>): T => v[locale];

export function itvCrumbs(locale: ItvLocale, label: string): Crumb[] {
  return [{ label: getMessages(locale).common.home, href: `/${locale}/` }, hubCrumb(locale), { label, href: itvPath(locale) }];
}

export function itvMetadata(locale: ItvLocale): Metadata {
  const m = itvMeta(locale);
  return buildMetadata({ locale, path: itvPath(locale), title: m.title, description: m.description, translations: itvEditions() });
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener" target="_blank">
      {children}
    </a>
  );
}

function Quote({ children, lang = "es" }: { children: string; lang?: string }) {
  return (
    <blockquote lang={lang}>
      <p>«{children}»</p>
    </blockquote>
  );
}

/** "A los 4 años" / "Desde la matriculación": when the first periodic ITV falls. */
function firstText(c: Category, locale: ItvLocale): string {
  const exempt = c.bands[0]!.every === "exempt" ? c.bands[1]!.fromYears : 0;
  if (exempt > 0) return L(locale, { es: `A los ${yearsText(exempt, "es")}`, ca: `Als ${yearsText(exempt, "ca")}`, en: `At ${yearsText(exempt, "en")}` });
  const every = c.bands[0]!.every;
  return L(locale, {
    es: `${capitalise(frequencyText(every, "es"))} desde la matriculación`,
    ca: `${capitalise(frequencyText(every, "ca"))} des de la matriculació`,
    en: `${capitalise(frequencyText(every, "en"))} from registration`,
  });
}

/** "cada 2 años hasta los 10; después, cada año". */
function thenText(c: Category, locale: ItvLocale): string {
  const bands = c.bands.filter((b) => b.every !== "exempt");
  const parts = bands.map((b, i) => {
    const next = bands[i + 1];
    const f = frequencyText(b.every, locale);
    if (!next) return i === 0 ? f : L(locale, { es: `después, ${f}`, ca: `després, ${f}`, en: `then ${f}` });
    return L(locale, { es: `${f} hasta los ${yearsText(next.fromYears, "es")}`, ca: `${f} fins als ${yearsText(next.fromYears, "ca")}`, en: `${f} until ${yearsText(next.fromYears, "en")}` });
  });
  return capitalise(parts.join("; "));
}

function regimeText(r: Region, locale: ItvLocale): string {
  if (r.regime === "fixed") return L(locale, { es: "Tarifa oficial", ca: "Tarifa oficial", en: "Official tariff" });
  if (r.regime === "max") return L(locale, { es: "Tarifa máxima oficial", ca: "Tarifa màxima oficial", en: "Official maximum tariff" });
  return L(locale, { es: "No publicado oficialmente", ca: "No publicat oficialment", en: "Not officially published" });
}

function PriceCell({ r, locale }: { r: Region; locale: ItvLocale }) {
  if (r.regime === "unpublished" || !r.prices?.length) return <strong>{regimeText(r, locale)}</strong>;
  return (
    <>
      <span className="block text-sm text-[var(--color-muted)]">{regimeText(r, locale)}</span>
      <ul className="m-0 list-none p-0">
        {r.prices.map((p) => (
          <li key={p.label.es}>
            {p.label[locale]}: <strong>{euros(p.amount, locale)}</strong>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ItvRoute({ locale }: { locale: ItvLocale }) {
  const meta = itvMeta(locale);
  const crumbs = itvCrumbs(locale, meta.breadcrumb);
  const car = CATEGORIES.find((c) => c.id === "car")!;
  const sampleReg = "2019-03-15";
  const sample = onTimeChain(car, sampleReg, 6);
  const day = (iso: string) => bareDay(iso, locale);
  const priced = REGIONS.filter((r) => r.regime !== "unpublished" && r.prices?.length);

  const lead = L(locale, {
    es: `Un turismo particular pasa la primera ITV a los 4 años de su primera matriculación, después cada 2 años y, desde los 10 años, cada año (Real Decreto 920/2017, art. 6). Puedes pasarla en los 30 días antes de que caduque sin perder la fecha. Circular con la ITV caducada es una infracción grave: ${FINE.serious} euros, ${FINE.paidEarly} si pagas en ${FINE.discountDays} días.`,
    ca: `Un turisme particular passa la primera ITV als 4 anys de la primera matriculació, després cada 2 anys i, a partir dels 10 anys, cada any (Reial decret 920/2017, art. 6). La pots passar en els 30 dies abans que caduqui sense perdre la data. Circular amb l'ITV caducada és una infracció greu: ${FINE.serious} euros, ${FINE.paidEarly} si pagues en ${FINE.discountDays} dies.`,
    en: `A private car has its first ITV (Spain's roadworthiness test) 4 years after first registration, then every 2 years and, from 10 years old, every year (Royal Decree 920/2017, art. 6). You can pass it in the 30 days before it expires without losing the date. Driving with an expired ITV is a serious offence: €${FINE.serious}, €${FINE.paidEarly} if paid within ${FINE.discountDays} days.`,
  });
  const freshness = L(locale, {
    es: `Normas leídas en el BOE ${dayInText(ITV_RULES_AS_OF, "es")}; tarifas oficiales revisadas ${dayInText(PRICES_AS_OF, "es")}.`,
    ca: `Normes llegides al BOE ${dayInText(ITV_RULES_AS_OF, "ca")}; tarifes oficials revisades ${dayInText(PRICES_AS_OF, "ca")}.`,
    en: `Rules read in the BOE on ${day(ITV_RULES_AS_OF)}; official fees checked on ${day(PRICES_AS_OF)}.`,
  });

  const h = L(locale, {
    es: { table: "Cada cuánto se pasa la ITV, por tipo de vehículo", early: "¿Se puede pasar la ITV antes? La regla de los 30 días", expired: "¿Qué pasa si circulas con la ITV caducada?", sticker: "La pegatina de la ITV (distintivo V-19)", historic: "Vehículos históricos", prices: "Precio de la ITV por comunidad autónoma", book: "Dónde pasar la ITV y pedir cita", sources: "Fuentes" },
    ca: { table: "Cada quant es passa l'ITV, per tipus de vehicle", early: "Es pot passar l'ITV abans? La regla dels 30 dies", expired: "Què passa si circules amb l'ITV caducada?", sticker: "L'adhesiu de l'ITV (distintiu V-19)", historic: "Vehicles històrics", prices: "Preu de l'ITV per comunitat autònoma", book: "On passar l'ITV i demanar cita", sources: "Fonts" },
    en: { table: "How often the ITV is due, by type of vehicle", early: "Can you take the ITV early? The 30-day rule", expired: "What happens if you drive with an expired ITV?", sticker: "The ITV sticker (V-19 badge)", historic: "Historic vehicles", prices: "ITV fees by region", book: "Where to take the ITV and book", sources: "Sources" },
  });

  const cols = L(locale, { es: ["Vehículo", "Primera ITV", "Después", "Texto del BOE (art. 6.1)"], ca: ["Vehicle", "Primera ITV", "Després", "Text del BOE (art. 6.1)"], en: ["Vehicle", "First ITV", "After that", "BOE wording (art. 6.1)"] });

  const tableText = L(locale, {
    es: ["La tabla del artículo 6.1 del Real Decreto 920/2017 fija la frecuencia según la categoría del vehículo (la que figura en la tarjeta ITV) y su antigüedad, que se cuenta así:", "Los vehículos mixtos siguen la frecuencia de la categoría N (furgoneta o camión) y los quads la de las motos (art. 6.3 y 6.4). Taxis, ambulancias, transporte escolar y autoescuelas tienen su propia tabla, más frecuente."],
    ca: ["La taula de l'article 6.1 del Reial decret 920/2017 fixa la freqüència segons la categoria del vehicle (la que figura a la targeta ITV) i l'antiguitat, que es compta així (text oficial en castellà):", "Els vehicles mixtos segueixen la freqüència de la categoria N (furgoneta o camió) i els quads la de les motos (art. 6.3 i 6.4). Taxis, ambulàncies, transport escolar i autoescoles tenen una taula pròpia, més freqüent."],
    en: ["The table in article 6.1 of Royal Decree 920/2017 sets the frequency by vehicle category (the one on the ITV card, tarjeta ITV) and age, counted like this (official text in Spanish):", "Dual-purpose vehicles follow the N category (van or truck) and quads follow motorcycles (art. 6.3 and 6.4). Taxis, ambulances, school transport and driving schools have their own, more frequent table."],
  });

  const howWeRead = L(locale, {
    es: "Cómo lo calculamos: la primera ITV, cuando acaba el periodo de exención; las siguientes, sumando la frecuencia del tramo de edad en que está el vehículo el día que empieza la nueva validez. Un tramo empieza el aniversario que nombra («De más de 10 años: Anual» se aplica desde que el coche cumple 10 años).",
    ca: "Com ho calculem: la primera ITV, quan acaba el període d'exempció; les següents, sumant la freqüència del tram d'edat en què és el vehicle el dia que comença la nova validesa. Un tram comença l'aniversari que anomena («De más de 10 años: Anual» s'aplica des que el cotxe fa 10 anys).",
    en: "How we calculate it: the first ITV falls when the exemption ends; each next one adds the frequency of the age band the vehicle is in on the day the new validity starts. A band starts on the anniversary it names (“De más de 10 años: Anual” applies from the car's 10th anniversary).",
  });

  const sampleText = L(locale, {
    es: `Ejemplo: un coche matriculado el ${day(sampleReg)} pasa la primera ITV antes del ${day(firstDue(car, sampleReg))} y, si cada una se pasa a tiempo, las siguientes antes del ${sample.slice(1).map(day).join(", del ")}.`,
    ca: `Exemple: un cotxe matriculat ${dayInText(sampleReg, "ca")} passa la primera ITV abans ${caBefore(firstDue(car, sampleReg))} i, si cadascuna es passa a temps, les següents abans ${sample.slice(1).map(caBefore).join(", ")}.`,
    en: `Example: a car first registered on ${day(sampleReg)} has its first ITV before ${day(firstDue(car, sampleReg))} and, if each one is passed on time, the next ones before ${sample.slice(1).map(day).join(", ")}.`,
  });

  const earlyText = L(locale, {
    es: [
      "Sí. El artículo 6.5 del reglamento cuenta la nueva validez desde el día en que pasas la ITV, salvo que la pases en los 30 días naturales anteriores a que caduque: entonces se cuenta desde la fecha de caducidad y no pierdes ni un día.",
      "Si la pasas antes de esos 30 días, la próxima se cuenta desde el día en que la pases. El texto habla de la «inspección anterior»: para la primera ITV no hay una regla escrita de 30 días.",
      "La fecha que vale es la del informe de tu última inspección: el reglamento manda poner en él",
    ],
    ca: [
      "Sí. L'article 6.5 del reglament compta la nova validesa des del dia que passes l'ITV, llevat que la passis en els 30 dies naturals anteriors a la caducitat: aleshores es compta des de la data de caducitat i no perds ni un dia.",
      "Si la passes abans d'aquests 30 dies, la propera es compta des del dia que la passis. El text parla de la «inspección anterior»: per a la primera ITV no hi ha una regla escrita de 30 dies.",
      "La data que val és la de l'informe de la teva última inspecció: el reglament obliga a posar-hi",
    ],
    en: [
      "Yes. Article 6.5 of the regulation counts the new validity from the day you pass, unless you pass in the 30 calendar days before it expires: then it counts from the expiry date and you lose no days.",
      "Pass it earlier than that and the next one counts from the day you pass. The text speaks of the “previous inspection”: there is no written 30-day rule for the first ITV.",
      "The date that counts is the one on your last inspection report: the regulation requires it to show",
    ],
  });

  const expiredText = L(locale, {
    es: [
      "Es una infracción grave del artículo 76 de la Ley de Tráfico (Real Decreto Legislativo 6/2015), letra o):",
      `Las graves se multan con ${FINE.serious} euros (art. 80.1), sin pérdida de puntos en el anexo II de la ley:`,
      `Si pagas en el acto o en los ${FINE.discountDays} días naturales siguientes a la notificación, la multa baja a ${FINE.paidEarly} euros (art. 94: procedimiento abreviado, renuncias a alegar):`,
      "Además, los agentes te dan 10 días para pasarla; si no lo acreditas, Tráfico puede dar de baja el vehículo (art. 6.9 del reglamento):",
      "Si la ITV sale desfavorable por defectos graves, solo puedes llevar el coche al taller y volver a la estación, en un plazo de dos meses (art. 11.2):",
    ],
    ca: [
      "És una infracció greu de l'article 76 de la Llei de trànsit (Reial decret legislatiu 6/2015), lletra o) (text oficial en castellà):",
      `Les greus es multen amb ${FINE.serious} euros (art. 80.1), sense pèrdua de punts a l'annex II de la llei:`,
      `Si pagues en l'acte o en els ${FINE.discountDays} dies naturals següents a la notificació, la multa baixa a ${FINE.paidEarly} euros (art. 94: procediment abreujat, renuncies a al·legar):`,
      "A més, els agents et donen 10 dies per passar-la; si no ho acredites, Trànsit pot donar de baixa el vehicle (art. 6.9 del reglament):",
      "Si l'ITV surt desfavorable per defectes greus, només pots portar el cotxe al taller i tornar a l'estació, en un termini de dos mesos (art. 11.2):",
    ],
    en: [
      "It is a serious offence under article 76.o) of the Traffic Act (Royal Legislative Decree 6/2015; official text in Spanish):",
      `Serious offences carry a €${FINE.serious} fine (art. 80.1), with no points lost under the act's annex II:`,
      `Pay on the spot or within ${FINE.discountDays} calendar days of notification and it drops to €${FINE.paidEarly} (art. 94: abbreviated procedure, you waive the right to contest it):`,
      "Police also give you 10 days to have it inspected; if you cannot show you did, Tráfico can deregister the vehicle (regulation art. 6.9):",
      "If the ITV fails with serious defects, you may only drive to a garage and back to the station, within two months (art. 11.2):",
    ],
  });

  const stickerText = L(locale, {
    es: ["Cuando pasas la ITV, la estación te da el distintivo V-19, que es la prueba de la inspección (art. 12.1; los históricos no lo llevan):", "Los agentes comprueban la ITV en el Registro de Vehículos de la DGT, en el informe de inspección o en la tarjeta ITV (art. 12.2):"],
    ca: ["Quan passes l'ITV, l'estació et dona el distintiu V-19, que és la prova de la inspecció (art. 12.1; els històrics no el porten):", "Els agents comproven l'ITV al Registre de Vehicles de la DGT, a l'informe d'inspecció o a la targeta ITV (art. 12.2):"],
    en: ["When you pass, the station gives you the V-19 sticker, which is the proof of inspection (art. 12.1; historic vehicles do not carry it):", "Police check the ITV in the DGT's vehicle register, the inspection report or the ITV card (art. 12.2):"],
  });

  const historicRows: [string, string][] = L(locale, {
    es: [["Motocicletas históricas, cualquier antigüedad", "Cada 4 años"], ["Resto, menos de 30 años", "La de su categoría"], ["De 30 a 40 años", "Cada 2 años"], ["De 40 a 45 años", "Cada 3 años"], ["45 años o más", "Cada 4 años"]],
    ca: [["Motocicletes històriques, qualsevol antiguitat", "Cada 4 anys"], ["La resta, menys de 30 anys", "La de la seva categoria"], ["De 30 a 40 anys", "Cada 2 anys"], ["De 40 a 45 anys", "Cada 3 anys"], ["45 anys o més", "Cada 4 anys"]],
    en: [["Historic motorcycles, any age", "Every 4 years"], ["Others, under 30 years", "As for their category"], ["30 to 40 years", "Every 2 years"], ["40 to 45 years", "Every 3 years"], ["45 years or more", "Every 4 years"]],
  });
  const historicText = L(locale, {
    es: ["Los vehículos catalogados como históricos tienen su propia tabla (art. 6.2, modificado por el Real Decreto 892/2024):", "Y algunos quedan exentos:"],
    ca: ["Els vehicles catalogats com a històrics tenen una taula pròpia (art. 6.2, modificat pel Reial decret 892/2024):", "I alguns en queden exempts:"],
    en: ["Vehicles classed as historic have their own table (art. 6.2, as amended by Royal Decree 892/2024):", "And some are exempt:"],
  });

  const pricesText = L(locale, {
    es: [
      "No hay un precio único de la ITV en España: el reglamento deja la tarifa a cada comunidad autónoma (art. 19.1).",
      `Aquí solo damos importes que publica la propia comunidad (su boletín oficial o su departamento de industria), revisados ${dayInText(PRICES_AS_OF, "es")}. Donde los precios son libres, o no hemos encontrado una tarifa oficial publicada, lo decimos y no ponemos cifra: consulta el precio en la estación antes de ir. Toda estación debe tener a la vista sus tarifas desglosadas (art. 14.7 c).`,
    ],
    ca: [
      "No hi ha un preu únic de l'ITV a Espanya: el reglament deixa la tarifa a cada comunitat autònoma (art. 19.1; text oficial en castellà).",
      `Aquí només donem imports que publica la mateixa comunitat (el seu butlletí oficial o el seu departament d'indústria), revisats ${dayInText(PRICES_AS_OF, "ca")}. On els preus són lliures, o no hem trobat una tarifa oficial publicada, ho diem i no posem xifra: consulta el preu a l'estació abans d'anar-hi. Tota estació ha de tenir a la vista les tarifes desglossades (art. 14.7 c).`,
    ],
    en: [
      "There is no single ITV price in Spain: the regulation leaves the fee to each region (art. 19.1; official text in Spanish).",
      `We only give amounts the region itself publishes (its official bulletin or its industry department), checked on ${day(PRICES_AS_OF)}. Where prices are free, or we found no published official tariff, we say so and print no figure: ask the station before you go. Every station must display its itemised fees (art. 14.7 c).`,
    ],
  });
  const priceCols = L(locale, { es: ["Comunidad", "Precio de la ITV periódica", "Fuente oficial"], ca: ["Comunitat", "Preu de l'ITV periòdica", "Font oficial"], en: ["Region", "Periodic ITV fee", "Official source"] });
  const taxNote = (r: Region): string | null => {
    if (r.regime === "unpublished" || !r.taxes) return r.validFor ? r.validFor[locale] : null;
    const tax = L(locale, {
      es: { included: "IVA y tasa de Tráfico incluidos", excluded: "sin IVA ni tasa de Tráfico", "dgt-extra": "más la tasa de Tráfico", unstated: "la norma no dice si incluye IVA y tasa" },
      ca: { included: "IVA i taxa de Trànsit inclosos", excluded: "sense IVA ni taxa de Trànsit", "dgt-extra": "més la taxa de Trànsit", unstated: "la norma no diu si inclou IVA i taxa" },
      en: { included: "VAT and DGT fee included", excluded: "before VAT and the DGT fee", "dgt-extra": "plus the DGT fee", unstated: "the norm does not say whether VAT and the fee are included" },
    })[r.taxes];
    return [tax, r.validFor?.[locale]].filter(Boolean).join(" · ");
  };

  const bookText = L(locale, {
    es: "Puedes pasar la ITV en cualquier estación, aunque no sea de tu provincia ni de tu comunidad (art. 11.8, sobre la libre elección de estación). Estas son las páginas oficiales de cada comunidad con sus estaciones y la forma de pedir cita:",
    ca: "Pots passar l'ITV a qualsevol estació, encara que no sigui de la teva província ni de la teva comunitat (art. 11.8, sobre la lliure elecció d'estació). Aquestes són les pàgines oficials de cada comunitat amb les estacions i com demanar cita:",
    en: "You can take the ITV at any station, even outside your province or region (art. 11.8, on free choice of station). These are each region's official pages listing stations and how to book:",
  });

  const disclaimer = L(locale, {
    es: "Calculadora orientativa: la fecha que vale es la del informe de tu última ITV y la del Registro de Vehículos de la DGT. No damos asesoramiento; ante una multa o una baja, consulta a la DGT.",
    ca: "Calculadora orientativa: la data que val és la de l'informe de la teva última ITV i la del Registre de Vehicles de la DGT. No donem assessorament; davant d'una multa o una baixa, consulta la DGT.",
    en: "A guide only: the date that counts is the one on your last ITV report and in the DGT's vehicle register. This is not legal advice; for a fine or a deregistration, contact the DGT.",
  });

  return (
    <>
      <SiteHeader locale={locale} translations={itvEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{meta.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{lead}</p>
              <p className="ci-measure mt-2 text-sm text-[var(--color-muted)]">{freshness}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <ItvCalculator locale={locale} />
              <p className="text-sm text-[var(--color-muted)]">{disclaimer}</p>

              <h2 id="frecuencia">{h.table}</h2>
              <p>{tableText[0]}</p>
              <Quote>{QUOTE.age}</Quote>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {cols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((c) => (
                      <tr key={c.id}>
                        <th scope="row">{CATEGORY_LABEL[c.id][locale]}</th>
                        <td data-label={cols[1]}>{firstText(c, locale)}</td>
                        <td data-label={cols[2]}>{thenText(c, locale)}</td>
                        <td data-label={cols[3]} lang="es" className="text-sm">
                          {c.quote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{tableText[1]}</p>
              <p>{howWeRead}</p>
              <p>{sampleText}</p>

              <h2 id="adelantar">{h.early}</h2>
              <p>{earlyText[0]}</p>
              <Quote>{QUOTE.early}</Quote>
              <p>{earlyText[1]}</p>
              <p>{earlyText[2]}</p>
              <Quote>{QUOTE.reportDate}</Quote>

              <h2 id="caducada">{h.expired}</h2>
              <p>{expiredText[0]}</p>
              <Quote>{QUOTE.offence}</Quote>
              <p>{expiredText[1]}</p>
              <Quote>{QUOTE.fine}</Quote>
              <p>{expiredText[2]}</p>
              <Quote>{`${QUOTE.discountWhen} […] ${QUOTE.discount}`}</Quote>
              <p>{expiredText[3]}</p>
              <Quote>{QUOTE.tenDays}</Quote>
              <p>{expiredText[4]}</p>
              <Quote>{QUOTE.seriousDefects}</Quote>

              <h2 id="pegatina">{h.sticker}</h2>
              <p>{stickerText[0]}</p>
              <Quote>{QUOTE.sticker}</Quote>
              <p>{stickerText[1]}</p>
              <Quote>{QUOTE.register}</Quote>

              <h2 id="historicos">{h.historic}</h2>
              <p>{historicText[0]}</p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <tbody>
                    {historicRows.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row" className="font-normal">
                          {k}
                        </th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>{historicText[1]}</p>
              <Quote>{QUOTE.historicExempt}</Quote>

              <h2 id="precio">{h.prices}</h2>
              <p>{pricesText[0]}</p>
              <Quote>{QUOTE.tariffs}</Quote>
              <p>{pricesText[1]}</p>
              <p>
                {L(locale, {
                  es: `A muchas tarifas se suma la tasa de Tráfico por anotar el resultado en el Registro de Vehículos (Ley 16/1979, art. 6, grupo IV, tarifa 6): ${euros(DGT_FEE.amount, "es")}, según las tablas oficiales de la Generalitat Valenciana, VEIASA (Andalucía) y Melilla.`,
                  ca: `A moltes tarifes s'hi suma la taxa de Trànsit per anotar el resultat al Registre de Vehicles (Llei 16/1979, art. 6, grup IV, tarifa 6): ${euros(DGT_FEE.amount, "ca")}, segons les taules oficials de la Generalitat Valenciana, VEIASA (Andalusia) i Melilla.`,
                  en: `Many tariffs add the DGT fee for recording the result in the vehicle register (Ley 16/1979, art. 6, group IV, tariff 6): ${euros(DGT_FEE.amount, "en")}, according to the official tables of the Valencian government, VEIASA (Andalusia) and Melilla.`,
                })}
              </p>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table ci-stack-table">
                  <thead>
                    <tr>
                      {priceCols.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONS.map((r) => {
                      const tax = taxNote(r);
                      return (
                        <tr key={r.id} id={`itv-${r.id}`}>
                          <th scope="row">{r.name[locale]}</th>
                          <td data-label={priceCols[1]}>
                            <PriceCell r={r} locale={locale} />
                            {tax ? <span className="block text-sm text-[var(--color-muted)]">{tax}</span> : null}
                            {r.note ? <span className="block text-sm text-[var(--color-muted)]">{r.note[locale]}</span> : null}
                          </td>
                          <td data-label={priceCols[2]} className="text-sm">
                            {r.sources.length === 0
                              ? "—"
                              : r.sources.map((src) => (
                                  <span key={src.url} className="block">
                                    <A href={src.url}>{src.title}</A>
                                    {src.published ? ` (${day(src.published)})` : null}
                                  </span>
                                ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {priced.length === 0 ? null : (
                <p className="text-sm">
                  {L(locale, {
                    es: "Las cifras son las que imprime cada norma; si la norma da varias (por combustible, por estación o por tipo de inspección), mostramos las de la ITV periódica.",
                    ca: "Les xifres són les que imprimeix cada norma; si la norma en dona diverses (per combustible, per estació o per tipus d'inspecció), mostrem les de l'ITV periòdica.",
                    en: "Figures are as printed in each norm; where it gives several (by fuel, station or type of inspection), we show the periodic ITV ones.",
                  })}
                </p>
              )}

              <h2 id="cita">{h.book}</h2>
              <p>{bookText}</p>
              <ul>
                {REGIONS.filter((r) => r.stations.length > 0).map((r) => (
                  <li key={r.id}>
                    {r.name[locale]}:{" "}
                    {r.stations.map((st, i) => (
                      <span key={st.url}>
                        {i > 0 ? " · " : null}
                        <A href={st.url}>{st.label[locale]}</A>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              <p>
                {L(locale, { es: "¿Vas a calcular otro plazo con fecha?", ca: "Has de calcular un altre termini amb data?", en: "Another deadline to work out?" })}{" "}
                <Link href={calcPath("working-days", locale)}>{L(locale, { es: "Calculadora de días hábiles y plazos", ca: "Calculadora de dies hàbils i terminis", en: "Working days and deadline calculator" })}</Link>.
              </p>

              <h2 id="fuentes">{h.sources}</h2>
              <ul className="text-sm">
                <li>
                  <A href={BOE.rd920.url}>{BOE.rd920.name}</A> ({BOE.rd920.id}): {L(locale, { es: "arts. 4, 6, 11, 12, 14, 19 y anexo II", ca: "arts. 4, 6, 11, 12, 14, 19 i annex II", en: "arts. 4, 6, 11, 12, 14, 19 and annex II" })}
                </li>
                <li>
                  <A href={BOE.lsv.url}>{BOE.lsv.name}</A> ({BOE.lsv.id}): {L(locale, { es: "arts. 76, 80 y 94", ca: "arts. 76, 80 i 94", en: "arts. 76, 80 and 94" })}
                </li>
                <li>
                  <A href={DGT_FEE.url}>{DGT_FEE.law}</A>: {L(locale, { es: "tasa de Tráfico por anotar la ITV (art. 6, grupo IV, tarifa 6)", ca: "taxa de Trànsit per anotar l'ITV (art. 6, grup IV, tarifa 6)", en: "DGT fee for recording the ITV (art. 6, group IV, tariff 6)" })}
                </li>
                {REGIONS.flatMap((r) =>
                  r.sources.map((src) => (
                    <li key={src.url}>
                      {r.name[locale]}: <A href={src.url}>{src.title}</A>
                    </li>
                  )),
                )}
              </ul>

              <MoreCalculators current="itv" locale={locale} />
            </div>
            <ShareBar locale={locale} path={itvPath(locale)} title={meta.h1} contentType="itv" variant="full" />
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Catalan "abans del 15 de març de 2027" / "abans de l'1 de gener de 2027". */
function caBefore(iso: string): string {
  const d = bareDay(iso, "ca");
  return /^1(1)? /.test(d) ? `de l'${d}` : `del ${d}`;
}
