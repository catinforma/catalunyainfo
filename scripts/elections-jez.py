"""Junta Electoral de Zona and judicial district (partit judicial) of every Catalan municipality.

Why two districts. LOREG art. 8.3: the Juntas Electorales de Zona sit "en las
localidades cabeza de los partidos judiciales aludidos en el apartado 6", and
art. 8.6: "A los efectos de la presente Ley los partidos judiciales coinciden
con los de las Elecciones Locales de 1979" (BOE consolidated text, unchanged
since 1985). Catalonia has 49 judicial districts today but 31 electoral zones:
some 200 municipalities (Sant Boi, el Prat, Santa Coloma de Gramenet, Mollet...)
belong to a newer judicial district while their mesa excuses go to the JEZ of
the 1979 one. The page prints the JEZ, and the current district where it
differs, so nobody files at the wrong court.

Sources (all official, all open):
  - Generalitat de Catalunya, Secretaria de Governs Locals i de Relacions amb
    l'Aran, "Dades d'ens locals - Ajuntaments" (analisi.transparenciacatalunya.cat
    dataset vevv-8fvw, refreshed daily): PARTIT_ELECTORAL (the JEZ) and
    PARTIT_JUDICIAL (today's district) for each of the 947 municipalities.
  - Generalitat de Catalunya, Departament de Justícia i Qualitat Democràtica,
    "Relació Municipis i Partit Judicial de Catalunya" (772x-hgsh) and
    "Partits judicials de Catalunya" (95tc-3cti): municipality -> district id,
    id -> name and seat municipality. Cross-check of PARTIT_JUDICIAL.
  - Junta Electoral Central, "Junta Electoral de Zona que corresponde a cada
    municipio" (one page per province) and "Directorio de Juntas Electorales
    de Zona: Cataluña" (address and telephone of each JEZ). The first is a
    cross-check of PARTIT_ELECTORAL; the second gives the contact printed.

    python -I scripts/elections-jez.py download <dir>
    python -I scripts/elections-jez.py build <dir> [--dry-run]

`download` saves the eight documents into <dir>, which must be a new or empty
folder outside `scripts/` (untrusted input: parsed, never run). `build` runs
every check below and writes `src/lib/programmatic/elections/jez.json`
(compact, one line), or writes nothing and says why. Standard library only.

Checks (any failure: nothing is written):
  - the Generalitat list has exactly the 947 municipalities of the polling
    snapshot (same five-digit INE codes), none dissolved, each with a JEZ and
    a judicial district;
  - every JEZ and every district is named after a municipality (its seat);
  - Justícia's district for each municipality is the Generalitat's;
  - the JEC assigns each municipality the Generalitat's JEZ. Two known
    differences in the JEC pages, both checked here rather than ignored:
    the JEC names the Aran zone "VIELHA" (the Generalitat, after the
    municipality, "Vielha e Mijaran"); and the JEC lists the zone of Valls
    under a JEZ whose name is blank. The script requires that blank zone to
    be exactly the Generalitat's Valls zone, Valls itself included, and the
    JEC's "VALLS" to have no municipality of its own;
  - the JEC directory has one entry per JEZ, each with an address; only
    nine-digit telephone numbers are kept (on 4 Nov 2026 one of Lleida's two
    numbers had ten digits: dropped, reported).
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/lib/programmatic/elections/jez.json"
POLLING = ROOT / "src/lib/programmatic/elections/polling-places.json"
USER_AGENT = "CatalunyaInfo JEZ reader (+https://www.catalunyainfo.com)"

SODA = "https://analisi.transparenciacatalunya.cat/resource"
JEC = "https://www.juntaelectoralcentral.es/cs/jec/admelectoral/jezona"
PROVINCES = {"08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona"}

DOCS = {
    "ens.json": f"{SODA}/vevv-8fvw.json?$select=codi_municipi,municipi,partit_judicial,partit_electoral,dissolt&$limit=5000",
    "justice-towns.json": f"{SODA}/772x-hgsh.json?$limit=5000",
    "justice-districts.json": f"{SODA}/95tc-3cti.json?$limit=500",
    "jec-directory.html": f"{JEC}/directorio?comunidad=Catalu%C3%B1a&sIdCCAA=67&template=Jez/JEC_Provincias",
    **{
        f"jec-{code}.html": f"{JEC}/municipios?CodigoProvincia={int(code)}&desProvincia={name}&sIdCCAA=67&template=Jez/JEC_ProvinciasMun"
        for code, name in PROVINCES.items()
    },
}

SOURCES = {
    "towns": {
        "name": "Dades d'ens locals - Ajuntaments (partit electoral i partit judicial de cada municipi)",
        "publisher": "Generalitat de Catalunya, Secretaria de Governs Locals i de Relacions amb l'Aran",
        "url": "https://analisi.transparenciacatalunya.cat/d/vevv-8fvw",
        "file": "ens.json",
    },
    "justice": {
        "name": "Relació Municipis i Partit Judicial de Catalunya; Partits judicials de Catalunya",
        "publisher": "Generalitat de Catalunya, Departament de Justícia i Qualitat Democràtica",
        "url": "https://analisi.transparenciacatalunya.cat/d/772x-hgsh",
        "file": "justice-towns.json",
    },
    "jec": {
        "name": "Junta Electoral de Zona que corresponde a cada municipio",
        "publisher": "Junta Electoral Central",
        "url": f"{JEC}/municipios",
        "file": "jec-08.html",
    },
    "directory": {
        "name": "Directorio de Juntas Electorales de Zona: Cataluña",
        "publisher": "Junta Electoral Central",
        "url": DOCS["jec-directory.html"],
        "file": "jec-directory.html",
    },
}


def fail(msg: str) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)


def fetch(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as res:
        data = res.read()
    dest.write_bytes(data)
    print(f"  {dest.name}  {len(data):>9} bytes  {url}")


def norm(name: str) -> str:
    """Comparable form of a place name: "HOSPITALET DE LLOBREGAT, L'" == "l'Hospitalet de Llobregat"."""
    s = html.unescape(name).replace("\xa0", " ").replace("’", "'").strip().lower()
    m = re.match(r"^(.*),\s*(l'|la|el|els|les|es)$", s)
    if m:
        s = f"{m.group(2)}{m.group(1)}" if m.group(2).endswith("'") else f"{m.group(2)} {m.group(1)}"
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    s = re.sub(r"^(l'|la |el |els |les |es )", "", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def jec_pairs(raw: str) -> list[tuple[str, str]]:
    out = []
    for name, rest in re.findall(r'<strong id="\d+">([^<]+)</strong>(.*?)(?=<strong id=|$)', raw, flags=re.S):
        boards = re.findall(r">Junta Electoral de Zona de([^<]*)</a>", rest)
        if len(boards) != 1:
            fail(f"JEC: {name!r} has {len(boards)} JEZ links")
        out.append((html.unescape(name).strip(), html.unescape(boards[0]).replace("\xa0", " ").strip()))
    return out


def jec_directory(raw: str) -> list[dict]:
    """<strong>Junta Electoral de Zona de&nbsp;NAME</strong><p>address lines</p><p>Teléfonos:&nbsp;n - n</p>"""
    entries = []
    pattern = r'<div class="agrupacion"><strong>Junta Electoral de Zona de(.*?)</strong>(.*?)</div>'
    for name, rest in re.findall(pattern, raw, flags=re.S):
        paras = [html.unescape(re.sub(r"<[^>]+>", " ", p)).replace("\xa0", " ") for p in re.findall(r"<p>(.*?)</p>", rest, flags=re.S)]
        name = html.unescape(name).replace("\xa0", " ").strip()
        if not name and paras == [] or any("no disponible" in p for p in paras):
            print(f"  directory: skipped an entry without data (name {name!r})")
            continue
        phones = next((p for p in paras if p.strip().startswith("Tel")), "")
        address = next((p for p in paras if not p.strip().startswith("Tel")), "")
        lines = [re.sub(r"\s+", " ", line).strip() for line in address.split("\n")]
        entries.append({
            "name": name,
            "address": ", ".join(line for line in lines if line),
            "phones": [re.sub(r"\D", "", p) for p in phones.split(":", 1)[-1].split("-") if p.strip()],
        })
    return entries


def build(src: Path, dry_run: bool) -> None:
    files = {name: (src / name).read_bytes() for name in DOCS}
    sha = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    ens = json.loads(files["ens.json"])
    towns_ine = set(json.loads(POLLING.read_text(encoding="utf-8"))["municipalities"])
    if len(towns_ine) != 947:
        fail(f"polling snapshot has {len(towns_ine)} municipalities")

    # Generalitat register: code -> row.
    rows = {}
    for r in ens:
        code = r["codi_municipi"][:5]
        if r.get("dissolt") != "N":
            fail(f"{code} {r['municipi']} is dissolved")
        if not r.get("partit_electoral") or not r.get("partit_judicial"):
            fail(f"{code} {r['municipi']}: no partit electoral/judicial")
        if code in rows:
            fail(f"{code} twice in the register")
        rows[code] = r
    if set(rows) != towns_ine:
        fail(f"register vs polling snapshot: {sorted(set(rows) ^ towns_ine)}")

    by_name = {}
    for code, r in rows.items():
        by_name.setdefault(norm(r["municipi"]), []).append(code)
    def seat(name: str) -> str:
        codes = by_name.get(norm(name), [])
        if len(codes) != 1:
            fail(f"seat {name!r} matches {codes}")
        return codes[0]

    boards = sorted({r["partit_electoral"] for r in rows.values()}, key=norm)
    board_seat = {b: seat(b) for b in boards}

    # Judicial districts and their seats from Justícia; the register must name the same district.
    jt = {r["codi_municipi"][:5]: r["identificador_partit_judicial"] for r in json.loads(files["justice-towns.json"])}
    jd = {r["identificador"]: r for r in json.loads(files["justice-districts.json"])}
    town_district: dict[str, str] = {}
    for code, r in rows.items():
        d = jd.get(jt.get(code, ""))
        if not d:
            fail(f"Justícia has no district for {code}")
        seat_code = d["codi_municipi"][:5]
        if seat_code not in rows:
            fail(f"district {d['nom']}: seat {seat_code} is no municipality")
        # The register writes "Cornellà" for the district of Cornellà de Llobregat.
        named = norm(r["partit_judicial"])
        if named not in (norm(d["nom"]), norm(rows[seat_code]["municipi"])) and not norm(rows[seat_code]["municipi"]).startswith(named + " "):
            fail(f"{code} {r['municipi']}: Justícia {d['nom']} vs register {r['partit_judicial']}")
        town_district[code] = seat_code
    districts = sorted(set(town_district.values()))
    print(f"register: {len(rows)} municipalities, {len(boards)} JEZ, {len(districts)} judicial districts")
    print("Justícia: all 947 districts agree with the register")

    # JEC: every municipality's JEZ is the register's.
    aliases = {norm(b): b for b in boards} | {"vielha": "Vielha e Mijaran"}
    jec_seen: dict[str, str] = {}
    blank = set()
    renamed = {"bigues i riells": "bigues i riells del fai", "bisbal de falset": "bisbal de montsant", "bordes es": "bordes",
               "brunyola": "brunyola i sant marti sapresa", "masarac": "masarac i vilarnadal", "palamos": "palamos i sant joan"}
    for prov in PROVINCES:
        for name, board in jec_pairs(files[f"jec-{prov}.html"].decode("utf-8", "replace")):
            key = renamed.get(norm(name), norm(name))
            codes = [c for c in by_name.get(key, []) if c.startswith(prov)]
            if len(codes) != 1:
                fail(f"JEC municipality {name!r} ({prov}) matches {codes}")
            code = codes[0]
            jec_seen[code] = board
            if board == "":
                blank.add(code)
                continue
            if aliases.get(norm(board)) != rows[code]["partit_electoral"]:
                fail(f"{code} {name}: JEC {board!r} vs register {rows[code]['partit_electoral']!r}")
    if set(jec_seen) != set(rows):
        fail(f"JEC pages miss {sorted(set(rows) - set(jec_seen))}")
    valls = {c for c, r in rows.items() if r["partit_electoral"] == "Valls"}
    if blank != valls or board_seat["Valls"] not in blank:
        fail(f"JEC blank-named JEZ is not the Valls zone: {sorted(blank ^ valls)}")
    print(f"JEC: all 947 agree ({len(blank)} under the JEC's blank-named JEZ = the Valls zone)")

    # JEC directory: address and telephones.
    directory = jec_directory(files["jec-directory.html"].decode("utf-8", "replace"))
    contact = {}
    for e in directory:
        b = aliases.get(norm(e["name"]))
        if not b:
            fail(f"directory entry {e['name']!r} is no JEZ of the register")
        if b in contact:
            fail(f"directory lists {b} twice")
        good = [p for p in e["phones"] if re.fullmatch(r"[6-9]\d{8}", p)]
        for p in e["phones"]:
            if p not in good:
                print(f"  dropped malformed telephone {p!r} of the JEZ of {b}")
        if not e["address"] or not good:
            fail(f"directory entry {b}: no address or telephone")
        contact[b] = {"address": e["address"], "phones": good}
    if set(contact) != set(boards):
        fail(f"directory misses {sorted(set(boards) - set(contact))}")

    board_index = {b: i for i, b in enumerate(boards)}
    district_index = {d: i for i, d in enumerate(districts)}
    today = datetime.now(ZoneInfo("Europe/Madrid")).date().isoformat()
    snapshot = {
        "readAt": today,
        "sources": {k: {**{f: v for f, v in s.items() if f != "file"}, "sha256": sha[s["file"]]} for k, s in SOURCES.items()},
        "boards": [{"seat": board_seat[b], **contact[b]} for b in boards],
        "districts": districts,
        "towns": {code: [board_index[rows[code]["partit_electoral"]], district_index[town_district[code]]] for code in sorted(rows)},
    }
    differ = sum(1 for code, r in rows.items() if board_seat[r["partit_electoral"]] != town_district[code])
    print(f"{differ} municipalities have a JEZ other than their judicial district's seat")
    text = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")) + "\n"
    if dry_run:
        print(f"dry run: {len(text.encode())} bytes, not written")
        return
    OUT.write_text(text, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(text.encode())} bytes)")


def main() -> None:
    if len(sys.argv) < 3 or sys.argv[1] not in ("download", "build"):
        print(__doc__)
        sys.exit(2)
    target = Path(sys.argv[2]).resolve()
    if sys.argv[1] == "download":
        if (ROOT / "scripts") in target.parents or target == ROOT / "scripts":
            fail("download into a folder outside scripts/")
        target.mkdir(parents=True, exist_ok=True)
        if any(target.iterdir()):
            fail(f"{target} is not empty")
        for name, url in DOCS.items():
            fetch(url, target / name)
    else:
        build(target, "--dry-run" in sys.argv)


if __name__ == "__main__":
    main()
