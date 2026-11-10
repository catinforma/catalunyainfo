/**
 * sources.name and sources.publisher are varchar(240). Official titles can be
 * longer (a Canarias school-calendar resolution is ~300 characters), and the
 * insert then failed the whole publish group (6 Nov 2026). Cut at a word
 * boundary and mark the cut; the URL still points at the full text.
 */
export function fitColumn(value: string, max = 240): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, "")}…`;
}
