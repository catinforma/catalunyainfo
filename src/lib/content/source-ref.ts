/**
 * The bulletin reference a source may print after its publisher
 * ("núm. 9551, 27.11.2025"), stored by the publish pipeline in
 * `entry_sources.note`. That column is also free text in the admin editor, so
 * the public page prints it only when it has one of these forms; any other
 * note stays private. The pipeline itself never rejects a `ref`: it writes the
 * note and this guard decides what a reader sees.
 *
 *  - "[DOGC|DOG|BOE|...] núm. 9551, [de ]27.11.2025" (number, then date)
 *  - "BOE-A-2025-21667[, BOE de 28.10.2025 | , última actualització 31.12.2025]"
 *    (BOE identifier, optionally with its bulletin or consolidation date)
 */
const BULLETINS = "(?:DOGC|DOG|BOE|BOP|BOPB|BOCM|BOJA|DOGV|BOA|BOC|BON|BOPV)";
const DATE = "\\d{1,2}\\.\\d{1,2}\\.\\d{4}";
const NUMBERED = new RegExp(`^(?:${BULLETINS}\\s+)?núm\\.\\s?\\d{1,5},\\s?(?:de\\s)?${DATE}$`);
const BOE_ID = new RegExp(`^BOE-[A-Z]-\\d{4}-\\d{1,6}(?:,\\s(?:BOE de|última actualització|última actualización|last updated)\\s${DATE})?$`);

export function isSourceRef(value: string | null | undefined): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return NUMBERED.test(v) || BOE_ID.test(v);
}

/** The note to print next to a source, or null when it is not a bulletin reference. */
export function publicSourceRef(note: string | null | undefined): string | null {
  return isSourceRef(note) ? note.trim() : null;
}
