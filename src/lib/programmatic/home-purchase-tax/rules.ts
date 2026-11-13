/**
 * The state rules of the home-purchase tax calculator, read in the BOE's
 * consolidated texts on 13 Nov 2026. Each figure carries its article and the
 * words of the law it comes from (QUOTE: tests check every figure appears in
 * its quote). The per-community rates are in communities.ts.
 *
 * - IVA on a new home: LIVA (Ley 37/1992) art. 91.Uno.1.7.º, 10 %; art.
 *   91.Dos.1.6.º, 4 % for VPO de régimen especial o de promoción pública
 *   (and permanently protected housing) delivered by the developer. The
 *   second and later sales of a building are exempt from IVA (art.
 *   20.Uno.22.º) and pay ITP instead.
 *   Note: Real Decreto-ley 26/2026 (BOE-A-2026-20266) rewrote art. 91.Dos.1.6.º
 *   from 1 Dec 2026 with the same first paragraph; Congress did not convalidate
 *   it on 2 Oct 2026, so the text in force is unchanged either way.
 * - The mortgage deed: TRLITP (RDL 1/1993) art. 29, second paragraph, added by
 *   Real Decreto-ley 17/2018 (in force 10 Nov 2018): the lender is the taxpayer.
 * - State fall-back rates when a community has not set its own (TRLITP arts.
 *   11.1.a and 31.2: 6 % and 0,50 %), which is what applies in Ceuta and
 *   Melilla, with the 50 % bonificación of art. 57 bis.
 * - Notary and registry fees: the scales of RD 1426/1989 (número 2) and RD
 *   1427/1989 (número 2), each with the 5 % rebaja; the page prints the scale,
 *   never a computed total (copies, folios and extra items vary).
 */

export const STATE_RULES_AS_OF = "2026-11-13";

export const BOE_TEXTS = {
  liva: { id: "BOE-A-1992-28740", name: "Ley 37/1992, del Impuesto sobre el Valor Añadido", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740", consolidated: "2026-10-07" },
  trlitp: {
    id: "BOE-A-1993-25359",
    name: "Real Decreto Legislativo 1/1993, texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359",
    consolidated: "2026-03-21",
  },
  rdl17_2018: { id: "BOE-A-2018-15344", name: "Real Decreto-ley 17/2018, de 8 de noviembre", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-15344", consolidated: null },
  notaries: { id: "BOE-A-1989-28111", name: "Real Decreto 1426/1989, Arancel de los Notarios", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1989-28111", consolidated: "2011-11-17" },
  registries: { id: "BOE-A-1989-28112", name: "Real Decreto 1427/1989, Arancel de los Registradores de la Propiedad", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1989-28112", consolidated: "2011-11-17" },
} as const;

/** IVA on the first delivery of a home by its developer (LIVA art. 91). */
export const VAT = { general: 10, protected: 4 } as const;

/** TRLITP fall-back rates (arts. 11.1.a, 31.2) and the Ceuta/Melilla bonificación (art. 57 bis). */
export const STATE_DEFAULTS = { itp: 6, ajd: 0.5, ceutaMelillaBonus: 50 } as const;

/** The law's words, as the BOE prints them (consolidated texts read on STATE_RULES_AS_OF). */
export const QUOTE = {
  vat10: "Los edificios o partes de los mismos aptos para su utilización como viviendas, incluidas las plazas de garaje, con un máximo de dos unidades, y anexos en ellos situados que se transmitan conjuntamente.",
  vat10Lead: "Se aplicará el tipo del 10 por ciento a las operaciones siguientes:",
  vat4Lead: "Se aplicará el tipo del 4 por ciento a las operaciones siguientes:",
  vat4: "Las viviendas calificadas administrativamente como de protección oficial de régimen especial o de promoción pública, así como las viviendas protegidas sujetas a calificación permanente o indefinida, cuando las entregas se efectúen por sus promotores, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente.",
  secondDelivery: "Las segundas y ulteriores entregas de edificaciones, incluidos los terrenos en que se hallen enclavadas, cuando tengan lugar después de terminada su construcción o rehabilitación.",
  mortgageLender: "Cuando se trate de escrituras de préstamo con garantía hipotecaria, se considerará sujeto pasivo al prestamista.",
  itpDefault: "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 6 por 100 a la transmisión de inmuebles",
  ajdDefault: "Si la Comunidad Autónoma no hubiese aprobado el tipo a que se refiere el párrafo anterior, se aplicará el 0,50 por 100, en cuanto a tales actos o contratos.",
  ceutaMelillaItp: "Las cuotas derivadas de la aplicación de la modalidad de transmisiones patrimoniales onerosas tendrán derecho a la aplicación de una bonificación del 50 por 100 en los siguientes casos:",
  ceutaMelillaItpWhat: "Transmisiones y arrendamiento de inmuebles situados en Ceuta o Melilla",
  ceutaMelillaAjd: "La cuota gradual de documentos notariales del gravamen de actos jurídicos documentados se bonificará en un 50 por 100 cuando el Registro en el que se deba proceder a la inscripción o anotación de los bienes o actos radique en Ceuta o Melilla.",
  notaryScale: "Por los instrumentos de cuantía se percibirán los derechos que resulten de aplicar al valor de los bienes objeto del negocio documentado la siguiente escala:",
  notaryRebate: "En todos los supuestos de este apartado se aplicará una rebaja del 5 por 100 del importe del arancel a percibir por el notario.",
  notaryCopies: "Las copias y cédulas autorizadas y su nota de expedición, en su caso, devengarán 3,005061 euros por cada folio o parte de él.",
  registryCap: "En todo caso, el arancel global aplicable regulado en el número 2 del arancel no podrá superar los 2.181,673939 euros ni ser inferior a 24,040484 euros.",
  registryRebate: "En todos los supuestos de este número se aplicará una rebaja del 5 por 100 del importe del arancel a percibir por el registrador de la propiedad.",
  referenceValue: "En el caso de los bienes inmuebles, su valor será el valor de referencia previsto en la normativa reguladora del catastro inmobiliario, a la fecha de devengo del impuesto.",
  higherDeclared: "si el valor declarado por los interesados, el precio o contraprestación pactada o ambos son superiores al valor de mercado, la mayor de esas magnitudes se tomará como base imponible.",
  vatGeneral: "El Impuesto se exigirá al tipo del 21 por ciento, salvo lo dispuesto en el artículo siguiente.",
  vpoDeedLead: "Estarán exentas:",
  vpoDeed: "Las escrituras públicas otorgadas para formalizar la primera transmisión de viviendas de protección oficial, una vez obtenida la calificación definitiva.",
} as const;

/** One slice of an arancel scale: the fee on the value between `from` and `to` (per mille), or a fixed amount for the first slice. */
export interface FeeSlice {
  from: number;
  to: number | null;
  fixed?: number;
  perMille?: number;
}

/** RD 1426/1989, número 2.1 (documentos de cuantía), as printed. Above 6.010.121,04 € the fee is agreed freely. */
export const NOTARY_SCALE: readonly FeeSlice[] = [
  { from: 0, to: 6010.12, fixed: 90.151816 },
  { from: 6010.13, to: 30050.61, perMille: 4.5 },
  { from: 30050.62, to: 60101.21, perMille: 1.5 },
  { from: 60101.22, to: 150253.03, perMille: 1 },
  { from: 150253.04, to: 601012.1, perMille: 0.5 },
  { from: 601012.1, to: 6010121.04, perMille: 0.3 },
];

/** RD 1427/1989, número 2.1 (inscripciones), as printed; capped at 2.181,673939 € and never below 24,040484 €. */
export const REGISTRY_SCALE: readonly FeeSlice[] = [
  { from: 0, to: 6010.12, fixed: 24.040484 },
  { from: 6010.13, to: 30050.61, perMille: 1.75 },
  { from: 30050.62, to: 60101.21, perMille: 1.25 },
  { from: 60101.22, to: 150253.03, perMille: 0.75 },
  { from: 150253.04, to: 601012.1, perMille: 0.3 },
  { from: 601012.1, to: null, perMille: 0.2 },
];

export const REGISTRY_CAP = { max: 2181.673939, min: 24.040484 } as const;
export const ARANCEL_REBATE = 5;
export const NOTARY_COPY_PER_FOLIO = 3.005061;
