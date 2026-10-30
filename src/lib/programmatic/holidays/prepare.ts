import { nameKey, type OrderComarca } from "./dogc";
import { locate, nucleiAfter, sameComarca, type Located } from "./match";
import type { SnapshotMunicipality } from "./types";

/**
 * Idescat and the order can file a municipality under different comarques
 * (Torà and Biosca: Solsonès / Segarra in Ordre EMT/208/2025). Outside its
 * own comarca, only a unique exact match of the name is accepted.
 */
function locateAnywhere(comarques: OrderComarca[], dogcName: string): { comarca: OrderComarca; located: Located } | null {
  const hits = comarques.flatMap((comarca) =>
    comarca.entries.flatMap((entry, index) => (nameKey(entry.name) === nameKey(dogcName) ? [{ comarca, located: { entry, index, shape: "own" as const } }] : [])),
  );
  return hits.length === 1 ? hits[0]! : null;
}

/**
 * The 48-hour swap: reads next year's local-holiday order for the
 * municipalities already on the list, by the name and comarca each had in the
 * previous order. Anything that does not match exactly is a problem to fix by
 * hand, never a guess.
 */
export function extractLocalDays(
  comarques: OrderComarca[],
  municipalities: Pick<SnapshotMunicipality, "slug" | "name" | "dogcName" | "comarca" | "nuclei">[],
): {
  municipalities: Record<string, { local: string[]; nuclei: { name: string; dates: string[] }[] }>;
  problems: string[];
} {
  const out: Record<string, { local: string[]; nuclei: { name: string; dates: string[] }[] }> = {};
  const problems: string[] = [];

  for (const m of municipalities) {
    let comarca = comarques.find((c) => sameComarca(c.heading, m.comarca));
    if (!comarca) {
      problems.push(`${m.name}: comarca "${m.comarca}" not in the order`);
      continue;
    }
    let located: Located | null;
    try {
      located = locate(comarca, m.dogcName);
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (!located) {
      const elsewhere = locateAnywhere(comarques, m.dogcName);
      if (elsewhere) ({ comarca, located } = elsewhere);
    }
    if (!located) {
      problems.push(`${m.name}: "${m.dogcName}" not found under ${comarca.heading}`);
      continue;
    }

    const local = located.shape === "own" ? [...located.entry.dates].sort() : [];
    if (located.shape === "own" && located.entry.noProposal) problems.push(`${m.name}: "proposta no formulada"`);
    else if (located.shape === "own" && local.length !== 2) problems.push(`${m.name}: ${local.length} dates (${local.join(", ")}), check the text`);

    const nuclei = nucleiAfter(comarca, located, m.dogcName, m.nuclei.map((n) => n.name));
    for (const name of nuclei.missing) problems.push(`${m.name}: nucleus "${name}" not found`);

    out[m.slug] = {
      local,
      nuclei: m.nuclei.map((n) => ({ name: n.name, dates: [...(nuclei.found.get(n.name)?.dates ?? [])].sort() })),
    };
  }
  return { municipalities: out, problems };
}
