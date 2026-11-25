import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { b2link, callout } from "./shared";

/**
 * The "hand-in deadline has passed" callout of the 29N postal vote (26 Nov 2026, 14:00 Madrid). It lives in its own
 * module because two guides show it from that instant (`handin` variant of an `electionPhased` block, content/
 * election-phased.ts): the postal-vote guide and the how-to-vote guide; voting.ts cannot import postal-vote.ts
 * (that one imports voting.ts for its hero), and the text must be the same in both.
 */
export const HANDIN_URL = {
  interior: "https://29neleccionesgenerales.es/informacion-general/como-votar/voto-por-correo-desde-espana/",
  loreg: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
  jecExtension: "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&idacuerdoinstruccion=156427&idsesion=1122&template=Doctrina/JEC_Detalle",
} as const;

const POSTAL_URL = HANDIN_URL;
const a = (label: string, url: string) => `[${label}](${url})`;

/**
 * From Thu 26 Nov 2026, 14:00 Madrid until polling day: the hand-in deadline is past (26 Nov 2026, 25 Nov 08:16 UTC,
 * read the same day). Sources, all re-read on 25 Nov:
 *  - Correos' postal-vote page: "El solicitante tiene de plazo para depositar el sobre con su voto hasta el 26 de
 *    noviembre de 2026 a las 14:00h, en los horarios habituales de apertura de las oficinas postales" and "si es
 *    aceptada por la Oficina del Censo Electoral, no podrá votar en la mesa electoral el día de la votación";
 *  - Interior's 29N postal page: "la persona que solicita el voto por correo, una vez ha sido admitida su solicitud,
 *    ya no puede votar de forma presencial"; Correos takes the mail to the tables "a las nueve de la mañana" and the
 *    table puts the postal votes into the urn at 20:00;
 *  - INE cid=1700: "Los electores que soliciten el voto por correo no podrán votar personalmente en la mesa
 *    electoral"; free census line 900 343 232, "El día 29 de noviembre, día de la votación, el horario será de 8:00
 *    a 20:00 horas";
 *  - LOREG art. 73.1: the census is annotated "a fin de que el día de las elecciones no se realice el voto
 *    personalmente".
 * No official source read says what happens to someone who asked for the postal vote and did not hand it in, and
 * none gives an exception that lets them vote in person: the callout says exactly that and promises nothing.
 * Shown by `resolveElectionPhased` (content/election-phased.ts, `handin` variant), only in the "closed" phase;
 * POSTAL_AS_OF is not involved.
 */
export const HANDIN_PAST: Record<Locale, { title: string; text: string }> = {
  ca: {
    title: "El termini per lliurar el vot per correu ja ha acabat: va ser el dijous 26 de novembre a les 14.00",
    text: `El termini per lliurar el vot a Correus va acabar el **dijous 26 de novembre a les 14.00** (${a("Acord 418/2026 de la Junta Electoral Central", POSTAL_URL.jecExtension)}). **Si el vas demanar i no l'has lliurat:** les fonts oficials que citem aquí (LOREG, Ministeri de l'Interior, INE, Correus) no donen cap altra via per votar. La llei fa anotar al cens qui demana el vot per correu «a fin de que el día de las elecciones no se realice el voto personalmente» (${a("LOREG, article 73.1", POSTAL_URL.loreg)}) i Interior ho diu així: «una vez ha sido admitida su solicitud, ya no puede votar de forma presencial» (${a("Interior", POSTAL_URL.interior)}). Si no t'han arribat les paperetes, truca a l'Oficina del Cens Electoral, 900 343 232 (el diumenge 29, de 8:00 a 20:00). **Si el vas lliurar a temps:** Correus el porta a la mesa el diumenge 29 a les 9.00 i la mesa el posa a l'urna a les 20.00. **Si no el vas demanar:** vota en persona a la teva mesa, de 9:00 a 20:00`,
  },
  es: {
    title: "El plazo para entregar el voto por correo ya ha terminado: fue el jueves 26 de noviembre a las 14:00",
    text: `El plazo para entregar el voto en Correos terminó el **jueves 26 de noviembre a las 14:00** (${a("Acuerdo 418/2026 de la Junta Electoral Central", POSTAL_URL.jecExtension)}). **Si lo pediste y no lo has entregado:** las fuentes oficiales que citamos aquí (LOREG, Ministerio del Interior, INE, Correos) no dan ninguna otra vía para votar. La ley hace anotar en el censo a quien pide el voto por correo «a fin de que el día de las elecciones no se realice el voto personalmente» (${a("LOREG, artículo 73.1", POSTAL_URL.loreg)}) e Interior lo dice así: «una vez ha sido admitida su solicitud, ya no puede votar de forma presencial» (${a("Interior", POSTAL_URL.interior)}). Si no te llegaron las papeletas, llama a la Oficina del Censo Electoral, 900 343 232 (el domingo 29, de 8:00 a 20:00). **Si lo entregaste a tiempo:** Correos lo lleva a tu mesa el domingo 29 a las 9:00 y la mesa lo mete en la urna a las 20:00. **Si no lo pediste:** vota en persona en tu mesa, de 9:00 a 20:00`,
  },
  en: {
    title: "The deadline to hand in the postal vote has passed: it was Thursday 26 November at 14:00",
    text: `The deadline to hand the vote in at Correos ended on **Thursday 26 November at 14:00** (${a("Central Electoral Board Agreement 418/2026", POSTAL_URL.jecExtension)}). **If you asked for a postal vote and have not handed it in:** the official sources we cite here (the electoral law, the Interior Ministry, the INE and Correos) give no other way to vote. The law has the census marked for anyone who asks for a postal vote "so that personal voting does not take place on election day" (${a("LOREG article 73.1", POSTAL_URL.loreg)}), and the Interior Ministry says: "once the request has been accepted, the person can no longer vote in person" (${a("Interior", POSTAL_URL.interior)}; both quotes are our translation of the Spanish). If your ballot papers never arrived, call the census office, 900 343 232 (Sunday 29 November, 8:00 to 20:00). **If you handed it in on time:** Correos takes it to your table on Sunday 29 at 9:00 and the table puts it in the ballot box at 20:00. **If you did not ask for one:** vote in person at your table, 9:00 to 20:00`,
  },
};

/**
 * The callout. `voteGuideLabel` closes the text with a link to the how-to-vote guide ("if you did not ask for one:
 * vote in person ..."); the how-to-vote guide itself passes null (no link to itself).
 */
export function handinPastCallout(locale: Locale, voteGuideLabel: string | null): Block {
  const { title, text } = HANDIN_PAST[locale];
  return callout("warning", title, voteGuideLabel ? `${text} (${b2link("voting", locale, voteGuideLabel)}).` : `${text}.`);
}
