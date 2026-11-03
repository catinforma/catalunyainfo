"""Polling places for the general election of 29 November 2026, every Catalan municipality.

LOREG art. 24: each provincial delegation of the INE's Oficina del Censo
Electoral publishes, in the provincial bulletin (BOP), the list of electoral
sections, their polling places (locales) and tables (mesas); after the six
days of claims (art. 24.3) a delegation may publish changes. This script
reads those bulletins for the four Catalan provinces and writes the committed
snapshot `src/lib/programmatic/elections/polling-places.json`, keyed by the
five-digit INE municipality code the election snapshot uses.

    python -I scripts/elections-polling-places.py download <dir>
    python -I scripts/elections-polling-places.py build <dir> [--dry-run] [--show <code>] [--review]

`download` saves every official document listed in DOCS and INE_FILES into
<dir>, which must be a new or empty folder outside this repository's
`scripts/` (the files are untrusted input: they are parsed, never run).
`build` parses them, runs every check below and writes the snapshot, or
writes nothing and says why. Needs PyMuPDF and openpyxl.

Checks (any failure: nothing is written):
  - each bulletin is the PDF it should be (its own header names the
    election and the delegation; its BOP reference is in the text);
  - every table row has district, section, a table letter and a surname
    range, a polling place and an address; letters and codes are well formed;
  - text columns start where the column starts (a name running into the
    next column would not), and every line in the table area is a row, a
    header or a known continuation;
  - inside each section the surname ranges of its tables run from A to Z
    without gaps or overlaps: a missed or misread row breaks the chain;
  - a table appears once; one polling place per table;
  - the municipality name in the bulletin is the INE's name for its code
    (Lleida's list prints names only: the code comes from that match);
  - corrections replace whole municipalities (Tarragona) or the whole list
    (Girona, a full republication); the script prints what changed.
Reported, not fatal: sections that differ from the INE's sections file
(callejero, 30 June 2026; the 29N roll closed on 1 August), and any
municipality without a polling place, which is listed under `gaps` and
never guessed.

Text is printed as the bulletins print it (upper case), with whitespace
collapsed; Tarragona separates address parts with " -", printed as ", ".
"""
import hashlib
import json
import re
import sys
import unicodedata
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

REPO = Path(__file__).resolve().parent.parent
SCRIPTS = REPO / "scripts"
OUT = REPO / "src" / "lib" / "programmatic" / "elections" / "polling-places.json"

ELECTION_DAY = "2026-11-29"
USER_AGENT = "CatalunyaInfo polling-places reader (+https://www.catalunyainfo.com)"

# The official documents, read 2 Nov 2026 (every BOP issue from 6 Oct to 2 Nov
# was searched for the Oficina del Censo Electoral; these are all of them).
DOCS = [
    {
        "id": "bopb-2026-10-12",
        "province": "08",
        "bulletin": "BOPB",
        "kind": "list",
        "date": "2026-10-12",
        "ref": "CVE 202610150687",
        "title": "Relació de les seccions electorals, locals i meses que s'utilitzaran per a les eleccions generals de 29 de novembre de 2026 en els municipis de la província de Barcelona",
        "publisher": "Institut Nacional d'Estadística, Oficina del Cens Electoral, Delegació Provincial de Barcelona",
        "url": "https://bop.diba.cat/anunci/3998658",
        "pdf": "https://bop.diba.cat/anunci/descarrega-pdf/3998658",
        "file": "bopb-3998658.pdf",
        "format": "bopb",
        "marker": "CVE 202610150687",
    },
    {
        "id": "bopgi-2026-10-12",
        "province": "17",
        "bulletin": "BOPGI",
        "kind": "list",
        "date": "2026-10-12",
        "ref": "BOP núm. 196, edicte 8784",
        "title": "Relació de municipis, seccions, meses i locals electorals corresponents a cadascuna d'elles",
        "publisher": "Institut Nacional d'Estadística, Oficina del Cens Electoral, Delegació Provincial de Girona",
        "url": "https://www.ddgi.cat/bop/mostra-bop/2026-10-12/2026/196",
        "pdf": "https://ssl4.ddgi.cat/bopV1/pdf/2026/196/202619608784.pdf",
        "file": "bopgi-202619608784.pdf",
        "format": "bopgi",
        "marker": "CVE BOP-2026_0_196_8784",
    },
    {
        "id": "bopgi-2026-10-27",
        "province": "17",
        "bulletin": "BOPGI",
        # A full republication of the list with the changes after the claims period.
        "kind": "list",
        "date": "2026-10-27",
        "ref": "BOP núm. 207, edicte 9280",
        "title": "Modificacions de la relació de municipis amb el número i els límits de les seccions electorals, els seus locals i les meses corresponents a cadascuna d'elles",
        "publisher": "Institut Nacional d'Estadística, Oficina del Cens Electoral, Delegació Provincial de Girona",
        "url": "https://www.ddgi.cat/bop/mostra-bop/2026-10-27/2026/207",
        "pdf": "https://ssl4.ddgi.cat/bopV1/pdf/2026/207/202620709280.pdf",
        "file": "bopgi-202620709280.pdf",
        "format": "bopgi",
        "marker": "CVE BOP-2026_0_207_9280",
    },
    {
        "id": "bopl-2026-10-12",
        "province": "25",
        "bulletin": "BOPL",
        "kind": "list",
        "date": "2026-10-12",
        "ref": "BOP núm. 194, edicte 8411",
        "title": "Relació de les seccions electorals, locals i meses corresponents. Eleccions Corts Generals Novembre 2026",
        "publisher": "Instituto Nacional de Estadística, Delegación Provincial de la Oficina del Censo Electoral en Lleida",
        "url": "https://ebop.diputaciolleida.cat/bop/mostra-bop/2026-10-12/2026/194",
        "pdf": "https://ebop.diputaciolleida.cat/aplicacions/bop/bopV1/fitxers/pdf/2026/194/202619408411.pdf",
        "file": "bopl-202619408411.pdf",
        "format": "bopl",
        "marker": "CVE BOP-2026_0_194_8411",
    },
    {
        "id": "bopt-2026-10-12",
        "province": "43",
        "bulletin": "BOPT",
        "kind": "list",
        "date": "2026-10-12",
        "ref": "CVE 2026-09487",
        "title": "Relació de seccions, meses i locals electorals de cada municipi. Eleccions a les Corts Generals del 29-11-2026",
        "publisher": "Instituto Nacional de Estadística, Delegación Provincial de la Oficina del Censo Electoral de Tarragona",
        "url": "https://www.dipta.cat/bopt/web/anunci/365268",
        "pdf": "https://www.dipta.cat/bopt/web/anunci/descarrega-pdf/365268",
        "file": "bopt-365268.pdf",
        "format": "bopt",
        "marker": "CVE 2026-09487",
    },
    {
        "id": "bopt-2026-10-23",
        "province": "43",
        "bulletin": "BOPT",
        # Replaces the whole list of the municipalities it names.
        "kind": "municipalities",
        "date": "2026-10-23",
        "ref": "CVE 2026-09890",
        "title": "Canvis en els locals electorals dels municipis d'Albinyana i Tivissa. Eleccions a les Corts Generals del 29-11-2026",
        "publisher": "Instituto Nacional de Estadística, Delegación Provincial de la Oficina del Censo Electoral de Tarragona",
        "url": "https://www.dipta.cat/bopt/web/anunci/365703",
        "pdf": "https://www.dipta.cat/bopt/web/anunci/descarrega-pdf/365703",
        "file": "bopt-365703.pdf",
        "format": "bopt",
        "marker": "CVE 2026-09890",
    },
]

# INE files for the checks: municipality codes and names, and sections.
INE_DICTIONARY = {
    "name": "Relación de municipios y códigos por comunidades autónomas y provincias a 1 de enero de 2026",
    "url": "https://www.ine.es/daco/daco42/codmun/diccionario26.xlsx",
    "file": "ine-diccionario26.xlsx",
}
INE_SECTIONS = {
    "name": "Callejero del Censo Electoral, julio 2026 (secciones a 30 de junio de 2026)",
    "page": "https://www.ine.es/dyngs/DAB/es/index.htm?cid=1390",
    "reference": "2026-06-30",
    "files": {p: (f"https://www.ine.es/prodyser/callejero/caj726/call_p{p}_726.zip", f"ine-call_p{p}_726.zip") for p in ("08", "17", "25", "43")},
}

PROVINCES = {"08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona"}

# Names the INE dictionary (1 Jan 2026) does not have yet, as the Generalitat's
# register of local authorities writes them (`name` in the election snapshot).
RENAMED = {"17118": "Palamós i Sant Joan"}

# Column layout of each bulletin, in PDF points: (field, left edge). A cell is
# every character whose left edge falls between its column's edge and the
# next one. ALIGNED: text columns whose cells must start at that x (±1.5).
LAYOUTS = {
    "bopb": {
        "columns": [("prov", 55), ("mun", 70), ("name", 86), ("district", 184), ("section", 197), ("sub", 212), ("table", 224), ("from", 237), ("to", 251), ("code", 265), ("place", 300), ("address", 465), ("end", 800)],
        "aligned": {"name": 88.8, "code": 270.9, "place": 302.6, "address": 467.6},
        "size": (4.9, 5.2),
    },
    "bopgi": {
        "columns": [("ine", 30), ("name", 56), ("district", 205), ("section", 222), ("sub", 242), ("table", 262), ("from", 283), ("to", 300), ("place", 312), ("address", 490), ("end", 800)],
        "aligned": {"name": 57.4, "place": 315.9, "address": 493.5},
        "size": (5.5, 5.8),
    },
    "bopt": {
        "columns": [("prov", 90), ("mun", 110), ("name", 125), ("dss", 240), ("table", 274), ("from", 286), ("to", 300), ("place", 313), ("address", 453), ("end", 800)],
        "aligned": {"name": 126.6, "place": 314.7, "address": 455.5},
        "size": (4.8, 5.0),
    },
    "bopl": {
        "columns": [("name", 95), ("district", 168), ("section", 183), ("sub", 198), ("table", 212), ("from", 235), ("to", 250), ("place", 265), ("address", 366), ("postcode", 480), ("end", 520)],
        "aligned": {"name": 99.9, "place": 268.6, "address": 367.6},
        "size": (5.7, 6.8),
    },
}

HEADER_WORDS = re.compile(r"MUNICIPIO|C?OD\.|DISTRITO|SECCI|SUBSECCI|LETRA|LOCAL ELECTORAL|DIRECCI|NOMBRE MUNICIPIO|NOM MUNICIPI|LOCALES EN LOS QUE|LOCALS EN QUE|ADRE|^\s*(DT|SC|SB|MESA|INI|FIN|L\.|C\.P\.|LOCAL|DTE\.|SECC\.|SUB\.|DE|A|C\.Prov\.|C\.M\.|Municipio|D\.|S\.|Sb|Ms|L\.I\.|L\.F\.|Local Electoral|direcci.n)\s*$")


class Fail(Exception):
    pass


# --------------------------------------------------------------------------
# Download
# --------------------------------------------------------------------------

def fetch(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as res:
        data = res.read()
    dest.write_bytes(data)
    print(f"  {dest.name}  {len(data):>9} bytes  {url}")


def untrusted_dir(arg: str, create: bool) -> Path:
    folder = Path(arg).resolve()
    if folder == SCRIPTS or SCRIPTS in folder.parents:
        raise Fail(f"{folder}: keep downloaded files outside {SCRIPTS}")
    if create:
        folder.mkdir(parents=True, exist_ok=True)
        if any(folder.iterdir()):
            raise Fail(f"{folder} is not empty: download into a new folder")
    elif not folder.is_dir():
        raise Fail(f"{folder} does not exist")
    return folder


def download(folder: Path) -> None:
    for doc in DOCS:
        fetch(doc["pdf"], folder / doc["file"])
    fetch(INE_DICTIONARY["url"], folder / INE_DICTIONARY["file"])
    for url, name in INE_SECTIONS["files"].values():
        fetch(url, folder / name)


# --------------------------------------------------------------------------
# PDF text, by column
# --------------------------------------------------------------------------

def spaced(chars: list) -> str:
    """Characters of one cell in reading order, with a space where the glyphs leave a gap."""
    out = []
    prev = None
    for c in chars:
        if prev is not None and c["x0"] - prev["x1"] > 0.25 * c["size"] and c["c"] != " " and prev["c"] != " ":
            out.append(" ")
        out.append(c["c"])
        prev = c
    return re.sub(r"\s+", " ", "".join(out)).strip()


def page_lines(page, layout: dict) -> list:
    """Every text line in the table's columns: {y, cells: {field: text}, starts: {field: x}}."""
    lo, hi = layout["size"]
    edges = layout["columns"]
    left, right = edges[0][1], edges[-1][1]
    chars = []
    for block in page.get_text("rawdict")["blocks"]:
        for line in block.get("lines", []):
            if abs(line["dir"][0] - 1) > 1e-3:
                continue  # the rotated signature notes in the margins
            for span in line["spans"]:
                if not (lo <= span["size"] <= hi):
                    continue
                for c in span["chars"]:
                    x0, _, x1, _ = c["bbox"]
                    if left <= x0 < right:
                        chars.append({"c": c["c"], "x0": x0, "x1": x1, "y": c["origin"][1], "size": span["size"]})
    chars.sort(key=lambda c: (c["y"], c["x0"]))
    lines, current, last_y = [], [], None
    for c in chars:
        if last_y is not None and c["y"] - last_y > 2.0:
            lines.append(current)
            current = []
        current.append(c)
        last_y = c["y"]
    if current:
        lines.append(current)

    out = []
    for group in lines:
        group.sort(key=lambda c: c["x0"])
        cells: dict = {}
        for c in group:
            field = None
            for (name, edge), (_, nxt) in zip(edges, edges[1:]):
                if edge <= c["x0"] < nxt:
                    field = name
                    break
            if field:
                cells.setdefault(field, []).append(c)
        text = {f: spaced(cs) for f, cs in cells.items()}
        # The first glyph, a space included: some cells start with one at the column's edge.
        starts = {f: cs[0]["x0"] for f, cs in cells.items()}
        text = {f: t for f, t in text.items() if t}
        if text:
            out.append({"y": min(c["y"] for c in group), "cells": text, "starts": starts})
    return out


def check_aligned(line: dict, layout: dict, where: str) -> None:
    for field, x in layout["aligned"].items():
        start = line["starts"].get(field)
        if line["cells"].get(field) and start is not None and abs(start - x) > 1.5:
            raise Fail(f"{where}: {field} starts at {start:.1f}, its column at {x}: text from the column before runs into it? {line['cells']}")


def is_header(line: dict) -> bool:
    cells = line["cells"].values()
    if any(re.fullmatch(r"\d+", t) for t in cells):
        return False
    return all(HEADER_WORDS.search(t) for t in cells) or bool(re.search(r"(?i)municip.*(local|direcci)", " ".join(cells)))


# --------------------------------------------------------------------------
# Rows
# --------------------------------------------------------------------------

LETTER = re.compile(r"[A-Z]")


def two(value: str, where: str) -> str:
    if not re.fullmatch(r"\d{1,2}", value or ""):
        raise Fail(f"{where}: district {value!r}")
    return value.zfill(2)


def three(value: str, where: str) -> str:
    if not re.fullmatch(r"\d{1,3}", value or ""):
        raise Fail(f"{where}: section {value!r}")
    return value.zfill(3)


def row_from(cells: dict, doc: dict, where: str) -> dict:
    fmt = doc["format"]
    if fmt == "bopb":
        prov, mun = cells.get("prov", ""), cells.get("mun", "")
        district, section, sub = cells.get("district", ""), cells.get("section", ""), cells.get("sub", "")
    elif fmt == "bopgi":
        ine = cells.get("ine", "")
        if not re.fullmatch(r"\d{5}", ine):
            raise Fail(f"{where}: municipality code {ine!r}")
        prov, mun = ine[:2], ine[2:]
        district, section, sub = cells.get("district", ""), cells.get("section", ""), cells.get("sub", "")
    elif fmt == "bopt":
        prov, mun = cells.get("prov", ""), cells.get("mun", "")
        m = re.fullmatch(r"(\d{1,2}) (\d{1,3})(?: (\d{1,2}))?", cells.get("dss", ""))
        if not m:
            raise Fail(f"{where}: district/section {cells.get('dss')!r}")
        district, section, sub = m.group(1), m.group(2), m.group(3) or ""
    else:
        prov, mun = doc["province"], None
        district, section, sub = cells.get("district", ""), cells.get("section", ""), cells.get("sub", "")
    if prov != doc["province"]:
        raise Fail(f"{where}: province {prov!r} in the {doc['bulletin']} list")
    if mun is not None and not re.fullmatch(r"\d{3}", mun):
        raise Fail(f"{where}: municipality {mun!r}")
    table, first, last = cells.get("table", ""), cells.get("from", ""), cells.get("to", "")
    for label, value in (("table", table), ("from", first), ("to", last)):
        if not LETTER.fullmatch(value):
            raise Fail(f"{where}: {label} {value!r} in {cells}")
    if sub and not re.fullmatch(r"\d{1,2}", sub):
        raise Fail(f"{where}: subsection {sub!r}")
    code = cells.get("code", "")
    if fmt == "bopb" and not re.fullmatch(r"\d{8}", code):
        raise Fail(f"{where}: polling-place code {code!r}")
    place, address = cells.get("place", ""), cells.get("address", "")
    if fmt == "bopt":
        address = ", ".join(p.strip() for p in re.split(r"\s+-", address) if p.strip())
    # Right-aligned numbers: La Molsosa's 08281 is printed 8281.
    postcode = cells.get("postcode", "")
    if fmt == "bopl" and not re.fullmatch(r"\d{4,5}", postcode):
        raise Fail(f"{where}: postcode {postcode!r}")
    postcode = postcode.zfill(5) if postcode else ""
    name = cells.get("name", "")
    if not name or not place or not address:
        raise Fail(f"{where}: empty name, polling place or address in {cells}")
    return {
        "prov": prov,
        "mun": mun,
        "name": name,
        "district": two(district, where),
        "section": three(section, where),
        "sub": sub.zfill(2) if sub else "",
        "table": table,
        "from": first,
        "to": last,
        "code": code,
        "place": place,
        "address": address,
        "postcode": postcode,
        "where": where,
    }


def parse_doc(path: Path, doc: dict) -> list:
    import pymupdf  # noqa: PLC0415 (only `build` needs it)

    pdf = pymupdf.open(path)
    first_page = pdf[0].get_text()
    if doc["marker"] not in first_page and doc["marker"].replace(" ", "") not in first_page.replace(" ", ""):
        raise Fail(f"{path.name}: {doc['marker']} not on its first page: not the {doc['bulletin']} notice expected")
    if not re.search(r"(?i)cortes generales|corts generals", first_page) or not re.search(r"(?i)2026", first_page):
        raise Fail(f"{path.name}: the first page does not name the 2026 general election")
    layout = LAYOUTS[doc["format"]]
    rows = []
    unplaced = []
    for pno in range(len(pdf)):
        lines = page_lines(pdf[pno], layout)
        if doc["format"] == "bopl":
            rows += lleida_rows(lines, doc, layout, path.name, pno, unplaced)
            continue
        for line in lines:
            where = f"{path.name} p.{pno + 1} y={line['y']:.1f}"
            cells = line["cells"]
            has_codes = re.fullmatch(r"\d{2}|\d{5}", cells.get("prov") or cells.get("ine") or "") and re.match(r"\d", cells.get("district") or cells.get("dss") or "")
            if not has_codes:
                if is_header(line):
                    continue
                raise Fail(f"{where}: a line that is neither a row nor a header: {cells}")
            check_aligned(line, layout, where)
            rows.append(row_from(cells, doc, where))
    if unplaced:
        raise Fail(f"{path.name}: {len(unplaced)} text fragments belong to no row: {unplaced[:5]}")
    return rows


def lleida_rows(lines: list, doc: dict, layout: dict, file: str, pno: int, unplaced: list) -> list:
    """Lleida's list wraps long names over two or three lines. The lines of a
    wrapped cell sit above its row, the last one level with the row's codes:
    every fragment belongs to the first row below it on the page."""
    anchors = [l for l in lines if re.fullmatch(r"\d{2}", l["cells"].get("district", "")) and re.fullmatch(r"\d{3}", l["cells"].get("section", ""))]
    pending: list = []
    rows = []
    texts = ("name", "place", "address", "postcode")
    for line in lines:
        where = f"{file} p.{pno + 1} y={line['y']:.1f}"
        if line in anchors:
            check_aligned(line, layout, where)
            cells = dict(line["cells"])
            near = []
            for frag in pending:
                # Three lines at most: a fragment further up belongs to no row.
                (near if line["y"] - frag["y"] <= 27 else unplaced).append(frag if line["y"] - frag["y"] <= 27 else (where, frag["cells"]))
            wrapped = []
            for field in texts:
                parts = [f["cells"][field] for f in near if f["cells"].get(field)]
                if parts:
                    cells[field] = " ".join([*parts, cells.get(field, "")]).strip()
                    wrapped.append(field)
            pending = []
            row = row_from(cells, doc, where)
            row["wrapped"] = wrapped
            rows.append(row)
            continue
        if is_header(line):
            continue
        if set(line["cells"]) - set(texts):
            raise Fail(f"{where}: a line that is neither a row, a header nor a wrapped name: {line['cells']}")
        check_aligned(line, layout, where)
        pending.append(line)
    for frag in pending:
        unplaced.append((f"{file} p.{pno + 1} y={frag['y']:.1f}", frag["cells"]))
    return rows


# --------------------------------------------------------------------------
# INE files
# --------------------------------------------------------------------------

def norm_name(name: str) -> str:
    """'ALAMÚS (ELS)', 'Alamús, Els' and 'els Alamús' all give 'ELSALAMUS'."""
    s = unicodedata.normalize("NFD", name.upper())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    m = re.fullmatch(r"(.*?)\s*\((EL|LA|LES|ELS|L'|ES|SA|SES|S')\)\s*", s) or re.fullmatch(r"(.*?),\s*(EL|LA|LES|ELS|L'|ES|SA|SES|S')\s*", s)
    if m:
        s = f"{m.group(2)} {m.group(1)}"
    return re.sub(r"[^A-Z0-9]", "", s)


def ine_dictionary(folder: Path) -> dict:
    import openpyxl  # noqa: PLC0415

    wb = openpyxl.load_workbook(folder / INE_DICTIONARY["file"], read_only=True)
    out = {}
    for row in wb.worksheets[0].iter_rows(values_only=True):
        if not row or len(row) < 5:
            continue
        _, cpro, cmun, _, name = row[:5]
        if isinstance(cpro, str) and cpro in PROVINCES and isinstance(cmun, str) and re.fullmatch(r"\d{3}", cmun):
            out[cpro + cmun] = name
    if len(out) != 947:
        raise Fail(f"INE dictionary: {len(out)} Catalan municipalities, expected 947")
    return out


def ine_sections(folder: Path) -> dict:
    out: dict = {}
    for prov, (_, name) in INE_SECTIONS["files"].items():
        with zipfile.ZipFile(folder / name) as z:
            members = [n for n in z.namelist() if re.search(rf"/SECC\.P{prov}\.D260630\.", n)]
            if len(members) != 1:
                raise Fail(f"{name}: no single SECC member for 30 June 2026 ({members})")
            for raw in z.read(members[0]).decode("latin-1").splitlines():
                rec = raw.strip()
                if not rec:
                    continue
                if not re.fullmatch(r"\d{10}", rec[:10]) or rec[:2] != prov:
                    raise Fail(f"{name}: SECC record {rec!r}")
                out.setdefault(rec[:5], set()).add((rec[5:7], rec[7:10]))
    return out


# --------------------------------------------------------------------------
# Build
# --------------------------------------------------------------------------

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def by_municipality(rows: list, names: dict, doc: dict) -> dict:
    """Rows grouped under their INE code; Lleida's codes come from the name."""
    accepted = {code: {norm_name(name)} | ({norm_name(RENAMED[code])} if code in RENAMED else set()) for code, name in names.items()}
    by_norm: dict = {}
    for code in names:
        if code.startswith(doc["province"]):
            for n in accepted[code]:
                by_norm.setdefault(n, []).append(code)
    out: dict = {}
    wrong = []
    for row in rows:
        if row["mun"] is None:
            match = by_norm.get(norm_name(row["name"]), [])
            if len(match) != 1:
                wrong.append(f"{row['where']}: {row['name']!r} is not one INE municipality name ({match})")
                continue
            code = match[0]
        else:
            code = row["prov"] + row["mun"]
            if code not in names:
                wrong.append(f"{row['where']}: {code} is not an INE municipality code")
                continue
            if norm_name(row["name"]) not in accepted[code]:
                wrong.append(f"{row['where']}: {code} is {names[code]!r} for the INE, {row['name']!r} in the bulletin")
                continue
        out.setdefault(code, []).append(row)
    if wrong:
        raise Fail(f"{len(wrong)} rows with a municipality the INE does not know:\n  " + "\n  ".join(dict.fromkeys(wrong)))
    return out


def next_letter(ch: str) -> str:
    return chr(ord(ch) + 1)


def check_municipality(code: str, rows: list) -> None:
    """Table letters run A, B, C... (or a single U) through a section; the
    surname ranges run A to Z through each subsection (a section split in two
    has a table A-Z in each part: Abrera 01-004, Albinyana 01-001)."""
    seen = {}
    sections: dict = {}
    parts: dict = {}
    for r in rows:
        key = (r["district"], r["section"], r["table"])
        if key in seen:
            raise Fail(f"{r['where']}: table {key} of {code} listed twice (also {seen[key]})")
        seen[key] = r["where"]
        sections.setdefault((r["district"], r["section"]), []).append(r)
        parts.setdefault((r["district"], r["section"], r["sub"]), []).append(r)
    for (district, section), tables in sections.items():
        letters = sorted(r["table"] for r in tables)
        if letters != ["U"] and letters != [chr(ord("A") + i) for i in range(len(letters))]:
            raise Fail(f"{code} {district}-{section}: tables {letters}")
        subs = {r["sub"] for r in tables}
        if len(subs) > 1 and "" in subs:
            raise Fail(f"{code} {district}-{section}: some tables with a subsection and some without")
    for (district, section, sub), tables in parts.items():
        tables.sort(key=lambda r: r["table"])
        expect = "A"
        for r in tables:
            if r["from"] != expect or r["to"] < r["from"]:
                raise Fail(f"{r['where']}: {code} {district}-{section}/{sub or '-'} table {r['table']} runs {r['from']}-{r['to']}, expected to start at {expect}")
            expect = next_letter(r["to"])
        if expect != "[":  # one past Z
            raise Fail(f"{code} {district}-{section}/{sub or '-'}: the surname ranges end at {tables[-1]['to']}, not Z")


def group_places(rows: list) -> list:
    places: dict = {}
    for r in sorted(rows, key=lambda r: (r["district"], r["section"], r["table"])):
        key = (r["place"], r["address"], r["postcode"], r["code"])
        place = places.setdefault(key, {"name": r["place"], "address": r["address"], **({"postcode": r["postcode"]} if r["postcode"] else {}), "tables": []})
        place["tables"].append({"district": r["district"], "section": r["section"], "table": r["table"], "from": r["from"], "to": r["to"]})
    return list(places.values())


def build(folder: Path, dry_run: bool, show: str | None, review: bool = False) -> None:
    names = ine_dictionary(folder)
    sections = ine_sections(folder)
    latest: dict = {}  # code -> (doc, rows): the latest publication that lists it
    changes = []
    used = []
    for doc in DOCS:
        path = folder / doc["file"]
        rows = parse_doc(path, doc)
        if review:
            for r in rows:
                if r.get("wrapped"):
                    print(f"  wrapped {r['wrapped']}: {r['name']} | {r['place']} | {r['address']} | {r['postcode']}   ({r['where']})")
        grouped = by_municipality(rows, names, doc)
        for code, mrows in grouped.items():
            check_municipality(code, mrows)
        print(f"{doc['id']}: {len(rows)} tables, {len(grouped)} municipalities")
        if doc["kind"] == "list":
            province_codes = {c for c in names if c.startswith(doc["province"])}
            missing = sorted(province_codes - set(grouped))
            if doc["province"] in {d["province"] for d in used if d["kind"] == "list"}:
                for code in sorted(province_codes):
                    before = latest.get(code, (None, []))[1]
                    after = grouped.get(code, [])
                    if summary(before) != summary(after):
                        changes.append((doc["id"], code, names[code], diff(before, after)))
            if missing:
                print(f"  not in this list: {', '.join(f'{c} {names[c]}' for c in missing)}")
            for code in province_codes:
                if code in grouped:
                    latest[code] = (doc, grouped[code])
                else:
                    latest.pop(code, None)
        else:
            for code, mrows in grouped.items():
                before = latest.get(code, (None, []))[1]
                changes.append((doc["id"], code, names[code], diff(before, mrows)))
                latest[code] = (doc, mrows)
        used.append({**doc, "sha256": sha256(path)})

    for doc_id, code, name, lines in changes:
        print(f"changed by {doc_id}: {code} {name}")
        for line in lines:
            print(f"    {line}")

    municipalities = {}
    differences = []
    for code in sorted(names):
        if code not in latest:
            continue
        doc, rows = latest[code]
        bop = {(r["district"], r["section"]) for r in rows}
        ine = sections.get(code, set())
        if bop != ine:
            differences.append({
                "code": code,
                "onlyBulletin": sorted(f"{d}-{s}" for d, s in bop - ine),
                "onlyIne": sorted(f"{d}-{s}" for d, s in ine - bop),
            })
        municipalities[code] = {
            "name": rows[0]["name"],
            "source": doc["id"],
            "sections": len(bop),
            "places": group_places(rows),
        }
    gaps = [{"code": c, "name": names[c], "reason": "not in any bulletin read"} for c in sorted(names) if c not in municipalities]

    tables = sum(len(p["tables"]) for m in municipalities.values() for p in m["places"])
    places = sum(len(m["places"]) for m in municipalities.values())
    print(f"municipalities {len(municipalities)}/947, polling places {places}, tables {tables}, sections {sum(m['sections'] for m in municipalities.values())}")
    for prov, label in PROVINCES.items():
        ms = [m for c, m in municipalities.items() if c.startswith(prov)]
        print(f"  {label}: {len(ms)} municipalities, {sum(len(m['places']) for m in ms)} places, {sum(len(p['tables']) for m in ms for p in m['places'])} tables, {sum(m['sections'] for m in ms)} sections")
    print(f"sections differing from the INE's callejero (30 Jun 2026): {len(differences)} municipalities")
    for d in differences:
        print(f"  {d['code']} {names[d['code']]}: bulletin only {d['onlyBulletin']}, INE only {d['onlyIne']}")
    if gaps:
        print("GAPS: " + ", ".join(f"{g['code']} {g['name']}" for g in gaps))
    if show:
        print(json.dumps(municipalities.get(show), ensure_ascii=False, indent=1))

    read_at = datetime.now(ZoneInfo("Europe/Madrid")).date().isoformat()
    snapshot = {
        "election": ELECTION_DAY,
        "readAt": read_at,
        "sources": [
            {k: d[k] for k in ("id", "province", "bulletin", "kind", "date", "ref", "title", "publisher", "url", "pdf", "sha256")}
            for d in used
        ],
        "checks": {
            "sections": {"name": INE_SECTIONS["name"], "url": INE_SECTIONS["page"], "reference": INE_SECTIONS["reference"], "differences": differences},
            "names": {"name": INE_DICTIONARY["name"], "url": INE_DICTIONARY["url"]},
        },
        "gaps": gaps,
        "municipalities": municipalities,
    }
    if dry_run:
        print("dry run: nothing written")
        return
    OUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {OUT.relative_to(REPO)} ({OUT.stat().st_size} bytes)")


def summary(rows: list) -> list:
    return sorted((r["district"], r["section"], r["table"], r["from"], r["to"], r["place"], r["address"], r["postcode"]) for r in rows)


def diff(before: list, after: list) -> list:
    a, b = set(summary(before)), set(summary(after))
    return [f"- {' '.join(x)}" for x in sorted(a - b)] + [f"+ {' '.join(x)}" for x in sorted(b - a)]


def main(argv: list) -> int:
    try:
        if len(argv) >= 2 and argv[0] == "download":
            download(untrusted_dir(argv[1], create=True))
            return 0
        if len(argv) >= 2 and argv[0] == "build":
            show = argv[argv.index("--show") + 1] if "--show" in argv else None
            build(untrusted_dir(argv[1], create=False), "--dry-run" in argv, show, "--review" in argv)
            return 0
    except Fail as e:
        print(f"FAILED: {e}", file=sys.stderr)
        return 1
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
