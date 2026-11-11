#!/usr/bin/env python3
"""
The Christmas lottery (Sorteo Extraordinario de Navidad, 22 December) day
pipeline: SELAE's official results and points of sale -> a validated snapshot
the site renders (src/lib/programmatic/gordo/snapshot.json).

Runbook: docs/GORDO_NAVIDAD_RUNBOOK.md. Run it with `python3 -I` and keep
downloads in their own new directory (they are untrusted input):

  # 1. Download SELAE's draw record and the per-prize "puntos de venta" pages
  #    into a NEW, empty directory (refused if it already holds files).
  python3 -I scripts/gordo-snapshot.py fetch --year 2026 --dir ~/gordo/run-1305

  # 2. Parse + validate them and write the snapshot (nothing is written when
  #    a check fails). --dry-run prints the summary only.
  python3 -I scripts/gordo-snapshot.py build --year 2026 --dir ~/gordo/run-1305

  # 3. Re-validate a snapshot file (the committed one by default).
  python3 -I scripts/gordo-snapshot.py check

  # 4. Print RESULTS_2026 for the Catalan lottery guide (loteria-nadal.ts).
  python3 -I scripts/gordo-snapshot.py catalonia

Official sources only (SELAE, Sociedad Estatal Loterías y Apuestas del Estado):
  - draw record (numbers):  https://www.loteriasyapuestas.es/servicios/buscadorSorteos?game_id=LNAC&celebrados=true&fechaInicioInclusiva=YYYY1222&fechaFinInclusiva=YYYY1222
  - one page per prize listing the points of sale that sold it:
      https://www.loteriasyapuestas.es/es/premios/{primer|segundo|tercer|cuarto|quinto}-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-YYYY
If SELAE's CDN blocks the script, save the same URLs from a browser into the
directory as draw.json and prize-<ordinal>.html and run `build` on it.

Municipalities: SELAE prints the point of sale's locality ("Localidad"), which
is not always a municipality (LAS NORIAS, CALA D'OR...). A locality is linked
to a municipality only when it matches exactly one INE municipality of its
province (scripts/data/ine-municipios-2026.tsv, Catalan names from the Idescat
register in src/lib/programmatic/weekend/snapshot.json) or an entry of
scripts/data/gordo-locality-aliases.json, which must cite the INE Nomenclátor.
Anything else is kept with SELAE's own spelling and gets no municipality page.

Standard library only.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "src/lib/programmatic/gordo/snapshot.json"
INE_FILE = ROOT / "scripts/data/ine-municipios-2026.tsv"
ALIASES_FILE = ROOT / "scripts/data/gordo-locality-aliases.json"
CATALAN_REGISTER = ROOT / "src/lib/programmatic/weekend/snapshot.json"

HOST = "https://www.loteriasyapuestas.es"
OFFICIAL_HOSTS = {"www.loteriasyapuestas.es", "www.selae.es"}
# SELAE's CDN (Akamai) refuses requests that do not look like a browser.
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
    "Accept-Language": "es-ES,es;q=0.9",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Dest": "document",
    "Upgrade-Insecure-Requests": "1",
}

# key, SELAE's ordinal in URLs and titles, how many numbers, euros per 20 € décimo
# (SELAE, programa de premios del Sorteo Extraordinario de Navidad 2026: 4,000,000 /
# 1,250,000 / 500,000 / 2 x 200,000 / 8 x 60,000 per 200 € billete).
PRIZES = [
    ("first", "primer", 1, 400_000),
    ("second", "segundo", 1, 125_000),
    ("third", "tercer", 1, 50_000),
    ("fourth", "cuarto", 2, 20_000),
    ("fifth", "quinto", 8, 6_000),
]
DRAW_KEYS = {"first": "primerPremio", "second": "segundoPremio", "third": "tercerosPremios", "fourth": "cuartosPremios", "fifth": "quintosPremios"}

# SELAE's province labels (as printed on the prize pages, folded) -> INE province code.
PROVINCE_LABELS = {
    "ALAVA": "01", "ARABA": "01", "ARABAALAVA": "01", "ALBACETE": "02", "ALICANTE": "03", "ALACANT": "03",
    "ALICANTEALACANT": "03", "ALMERIA": "04", "AVILA": "05", "BADAJOZ": "06", "BALEARES": "07",
    "ILLESBALEARS": "07", "BALEARSILLES": "07", "BARCELONA": "08", "BURGOS": "09", "CACERES": "10",
    "CADIZ": "11", "CASTELLON": "12", "CASTELLO": "12", "CASTELLONCASTELLO": "12", "CIUDADREAL": "13",
    "CORDOBA": "14", "CORUNAA": "15", "ACORUNA": "15", "LACORUNA": "15", "CUENCA": "16", "GIRONA": "17",
    "GERONA": "17", "GRANADA": "18", "GUADALAJARA": "19", "GUIPUZCOA": "20", "GIPUZKOA": "20",
    "HUELVA": "21", "HUESCA": "22", "JAEN": "23", "LEON": "24", "LLEIDA": "25", "LERIDA": "25",
    "RIOJALA": "26", "LARIOJA": "26", "RIOJA": "26", "LUGO": "27", "MADRID": "28", "MALAGA": "29",
    "MURCIA": "30", "NAVARRA": "31", "OURENSE": "32", "ORENSE": "32", "ASTURIAS": "33", "PALENCIA": "34",
    "LASPALMAS": "35", "PALMASLAS": "35", "PONTEVEDRA": "36", "SALAMANCA": "37", "STACRUZTFE": "38",
    "SANTACRUZDETENERIFE": "38", "SCTENERIFE": "38", "STACRUZDETENERIFE": "38", "CANTABRIA": "39",
    "SEGOVIA": "40", "SEVILLA": "41", "SORIA": "42", "TARRAGONA": "43", "TERUEL": "44", "TOLEDO": "45",
    "VALENCIA": "46", "VALENCIAVALENCIA": "46", "VALLADOLID": "47", "VIZCAYA": "48", "BIZKAIA": "48",
    "ZAMORA": "49", "ZARAGOZA": "50", "CEUTA": "51", "MELILLA": "52",
}

ARTICLES = {"EL", "LA", "LOS", "LAS", "L", "ELS", "LES", "ES", "SA", "SES", "A", "O", "AS", "OS"}


class Refused(Exception):
    """A check failed: nothing is written."""


# --------------------------------------------------------------------------- text


def fold(text: str) -> str:
    """Upper case, no accents, apostrophes and punctuation as spaces: 'L'Hospitalet' -> 'L HOSPITALET'."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.upper().replace("·", "").replace("Ŀ", "L")
    text = re.sub(r"[^A-Z0-9Ñ]+", " ", text.replace("Ñ", "N"))
    return re.sub(r"\s+", " ", text).strip()


def slugify(name: str) -> str:
    """The site's slug rule (src/lib/programmatic/holidays/slug.ts)."""
    text = unicodedata.normalize("NFD", name)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn").lower()
    text = re.sub(r"l·l|l\.l", "ll", text)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def ine_display(name: str) -> str:
    """INE writes the article after the name: 'Coruña, A' -> 'A Coruña'; 'Vila Joiosa, la/Villajoyosa' -> 'la Vila Joiosa/Villajoyosa'."""
    parts = []
    for part in name.split("/"):
        m = re.match(r"^(.*), (El|La|Los|Las|L'|l'|Els|Les|les|la|el|Es|Sa|Ses|A|O|As|Os)$", part.strip())
        if m:
            base, art = m.group(1), m.group(2)
            parts.append(f"{art}{base}" if art.endswith("'") else f"{art} {base}")
        else:
            parts.append(part.strip())
    return "/".join(parts)


def locality_variants(text: str) -> set[str]:
    """Match keys for a name: 'POLA DE GORDÓN (LA)' and 'La Pola de Gordón' both give 'LA POLA DE GORDON'."""
    out: set[str] = set()
    for part in text.split("/"):
        part = part.strip()
        m = re.match(r"^(.*)\(([^)]+)\)$", part)
        if m:
            part = f"{m.group(2)} {m.group(1)}"
        key = fold(part)
        if key:
            out.add(key)
            out.add(key.replace(" ", ""))
    return out


# ------------------------------------------------------------------ reference data


def load_municipalities() -> dict[str, dict[str, str]]:
    """INE code -> {ine, name, province}. Catalan municipalities take the Idescat register's name ('el Prat de Llobregat')."""
    out: dict[str, dict[str, str]] = {}
    for line in INE_FILE.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        code, name = line.split("\t")
        out[code] = {"ine": code, "name": ine_display(name), "ineName": name, "province": code[:2]}
    catalan = json.loads(CATALAN_REGISTER.read_text(encoding="utf-8"))["municipalities"]
    for m in catalan:
        if m["ine"] in out:
            out[m["ine"]]["name"] = m["name"]
    return out


def load_aliases() -> dict[tuple[str, str], str]:
    if not ALIASES_FILE.exists():
        return {}
    data = json.loads(ALIASES_FILE.read_text(encoding="utf-8"))
    out: dict[tuple[str, str], str] = {}
    for entry in data.get("aliases", []):
        if not re.fullmatch(r"\d{5}", entry.get("ine", "")) or not entry.get("source"):
            raise Refused(f"alias {entry!r}: needs a five-digit INE code and the source it was checked on")
        out[(entry["province"], fold(entry["selae"]))] = entry["ine"]
    return out


class Matcher:
    def __init__(self) -> None:
        self.municipalities = load_municipalities()
        self.aliases = load_aliases()
        self.index: dict[tuple[str, str], set[str]] = {}
        # Second tier: the name without its leading article ("VALL D'UIXO" for
        # "la Vall d'Uixó"), used only when the full name matches nothing.
        self.bare: dict[tuple[str, str], set[str]] = {}
        for code, m in self.municipalities.items():
            for name in (m["ineName"], m["name"]):
                for key in locality_variants(ine_display(name)):
                    self.index.setdefault((m["province"], key), set()).add(code)
                    words = key.split(" ")
                    if len(words) > 1 and words[0] in ARTICLES:
                        bare = " ".join(words[1:])
                        self.bare.setdefault((m["province"], bare), set()).add(code)
                        self.bare.setdefault((m["province"], bare.replace(" ", "")), set()).add(code)

    def match(self, province: str, locality: str) -> dict[str, str] | None:
        alias = self.aliases.get((province, fold(locality)))
        if alias:
            if alias not in self.municipalities or self.municipalities[alias]["province"] != province:
                raise Refused(f"alias {locality} -> {alias} is not a municipality of province {province}")
            return self.municipalities[alias]
        for index in (self.index, self.bare):
            codes: set[str] = set()
            for key in locality_variants(locality):
                codes |= index.get((province, key), set())
            if codes:
                return self.municipalities[next(iter(codes))] if len(codes) == 1 else None
        return None


# ----------------------------------------------------------------------- fetching


def get(url: str) -> tuple[int, bytes]:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=60) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, b""


def draw_url(year: int, held: bool) -> str:
    return (
        f"{HOST}/servicios/buscadorSorteos?game_id=LNAC&celebrados={'true' if held else 'false'}"
        f"&fechaInicioInclusiva={year}1222&fechaFinInclusiva={year}1222"
    )


def prize_url(ordinal: str, year: int) -> str:
    return f"{HOST}/es/premios/{ordinal}-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-{year}"


def cmd_fetch(args: argparse.Namespace) -> None:
    out = Path(args.dir).expanduser()
    if out.exists() and any(out.iterdir()):
        raise Refused(f"{out} is not empty: downloads go to a new, empty directory")
    if out.resolve().is_relative_to(ROOT):
        raise Refused("keep downloads outside the repository")
    out.mkdir(parents=True, exist_ok=True)
    manifest = []

    # Before the draw is held SELAE answers the "celebrados=true" query with a
    # JSON string ("No se ha encontrado ningún registro..."): ask for the open draw.
    url = draw_url(args.year, True)
    status, body = get(url)
    if status == 200 and not body.lstrip().startswith(b"[{"):
        url = draw_url(args.year, False)
        status, body = get(url)
    if status != 200:
        raise Refused(f"draw record: HTTP {status} (SELAE may be blocking scripts: save it from a browser, see the runbook)")
    (out / "draw.json").write_bytes(body)
    manifest.append({"file": "draw.json", "url": url, "status": status, "sha256": hashlib.sha256(body).hexdigest()})

    for _key, ordinal, _count, _amount in PRIZES:
        url = prize_url(ordinal, args.year)
        status, body = get(url)
        print(f"{status} {url}")
        if status != 200:
            continue  # not published yet
        name = f"prize-{ordinal}.html"
        (out / name).write_bytes(body)
        manifest.append({"file": name, "url": url, "status": status, "sha256": hashlib.sha256(body).hexdigest()})

    stamp = dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds")
    (out / "manifest.json").write_text(json.dumps({"fetchedAt": stamp, "files": manifest}, indent=2), encoding="utf-8")
    print(f"saved {len(manifest)} files in {out}")


# ------------------------------------------------------------------------ parsing


def parse_draw(raw: str, year: int) -> dict:
    data = json.loads(raw)
    if not isinstance(data, list) or len(data) != 1 or not isinstance(data[0], dict):
        raise Refused("draw.json: expected SELAE's draw record, a list with one draw")
    d = data[0]
    problems = []
    if d.get("game_id") != "LNAC":
        problems.append(f"game_id {d.get('game_id')!r} is not LNAC (Lotería Nacional)")
    if str(d.get("num_sorteo")) != "102":
        problems.append(f"num_sorteo {d.get('num_sorteo')!r} is not 102 (the Christmas draw)")
    if not str(d.get("fecha_sorteo", "")).startswith(f"{year}-12-22"):
        problems.append(f"fecha_sorteo {d.get('fecha_sorteo')!r} is not 22 December {year}")
    if "NAVIDAD" not in str(d.get("nombre", "")).upper():
        problems.append(f"nombre {d.get('nombre')!r} is not the Christmas draw")
    if not re.fullmatch(r"\d{6,12}", str(d.get("id_sorteo", ""))):
        problems.append("id_sorteo missing")
    if problems:
        raise Refused("draw.json: " + "; ".join(problems))

    numbers: dict[str, list[str]] = {}
    for key, _ordinal, count, _amount in PRIZES:
        value = d.get(DRAW_KEYS[key])
        items = [value] if isinstance(value, dict) else (value or [])
        found = [str(item.get("decimo", "")) for item in items if isinstance(item, dict) and item.get("decimo")]
        for number in found:
            if not re.fullmatch(r"\d{5}", number):
                raise Refused(f"{key}: {number!r} is not five digits")
        if len(found) > count:
            raise Refused(f"{key}: {len(found)} numbers, the programme has {count}")
        numbers[key] = found
    all_numbers = [n for ns in numbers.values() for n in ns]
    if len(set(all_numbers)) != len(all_numbers):
        raise Refused("a number appears twice among the top prizes")

    official_list = d.get("urlListadoOficial")
    if official_list:
        official_list = HOST + urllib.parse.quote(official_list) if official_list.startswith("/") else official_list
    return {"drawId": str(d["id_sorteo"]), "numbers": numbers, "officialList": official_list or None}


def parse_prize_page(raw: str, ordinal: str, year: int) -> list[dict]:
    title = re.search(r'<meta property="og:title" content="([^"]*)"', raw) or re.search(r"<title>([^<]*)</title>", raw)
    expected = f"{ordinal} premio de lotería nacional del sorteo extraordinario de navidad del 22 de diciembre de {year}"
    if not title or expected not in html.unescape(title.group(1)).lower():
        raise Refused(f"prize-{ordinal}.html: the title is not SELAE's page for the {ordinal} prize of 22 December {year}")
    start = raw.find("PUNTOS DE VENTA RELACIONADOS</strong>")
    if start < 0:
        return []
    end = raw.find("</div>", start)
    block = raw[start:end if end > 0 else None]
    outlets = []
    for chunk in re.split(r"<p>", block):
        if "Punto de Venta:" not in chunk:
            continue
        link = re.search(r'<a href="/es/punto-de-venta/red-comercial/(\d+)"\s*>(.*?)</a>', chunk, flags=re.S)
        if link:
            outlet_id, text = link.group(1), link.group(2)
        else:
            outlet_id, text = None, chunk.split("Punto de Venta:", 1)[1]
        text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))).strip(" .")
        via_web = "Repartido a través de la web oficial" in html.unescape(chunk)
        outlets.append({"id": outlet_id, "text": text, "viaWeb": via_web})
    return outlets


def split_outlet(text: str) -> tuple[str, str, str]:
    """'RAMON LLULL, 8-10, EL PRAT DE LLOBREGAT, BARCELONA' -> (address, locality, province label)."""
    parts = [p.strip() for p in text.split(",")]
    if len(parts) < 3:
        raise Refused(f"point of sale {text!r}: expected 'address, locality, province'")
    return ", ".join(parts[:-2]).strip(" -"), parts[-2], parts[-1]


def build_snapshot(directory: Path, year: int, read_at: str, test_data: bool) -> tuple[dict, list[str]]:
    marker = (directory / "TEST_DATA").exists()
    if marker and not test_data:
        raise Refused(f"{directory} is marked TEST_DATA: pass --test-data (and never ship the result)")
    if test_data and not marker:
        raise Refused("--test-data is only for directories marked TEST_DATA")
    draw = parse_draw((directory / "draw.json").read_text(encoding="utf-8"), year)
    matcher = Matcher()
    warnings: list[str] = []
    prizes = []
    for key, ordinal, count, amount in PRIZES:
        numbers = draw["numbers"][key]
        page = directory / f"prize-{ordinal}.html"
        outlets = None
        if page.exists():
            if not numbers:
                raise Refused(f"prize-{ordinal}.html exists but the draw record has no {key} number yet")
            outlets = []
            for o in parse_prize_page(page.read_text(encoding="utf-8"), ordinal, year):
                if fold(o["text"]).startswith("WWW LOTERIASYAPUESTAS ES"):
                    outlets.append({"id": o["id"], "channel": "web", "address": None, "locality": None, "province": None, "viaWeb": True, "municipality": None})
                    continue
                address, locality, label = split_outlet(o["text"])
                province = PROVINCE_LABELS.get(fold(label).replace(" ", ""))
                if not province:
                    raise Refused(f"{key}: province {label!r} is unknown (add SELAE's spelling to PROVINCE_LABELS)")
                if not locality or not address:
                    raise Refused(f"{key}: {o['text']!r} has no address or locality")
                m = matcher.match(province, locality)
                if not m:
                    warnings.append(f"{key}: {locality} ({label}) matches no single INE municipality: listed without a municipality page")
                outlets.append({
                    "id": o["id"],
                    "channel": "outlet",
                    "address": address,
                    "locality": locality,
                    "province": province,
                    "viaWeb": o["viaWeb"],
                    "municipality": {"ine": m["ine"], "name": m["name"], "slug": slugify(m["name"])} if m else None,
                })
            if not outlets:
                warnings.append(f"{key}: SELAE's page lists no point of sale yet")
                outlets = None
        elif numbers:
            warnings.append(f"{key}: numbers are out but SELAE's points-of-sale page is not")
        if numbers and len(numbers) != count:
            warnings.append(f"{key}: {len(numbers)} of {count} numbers drawn so far")
        prizes.append({
            "key": key,
            "numbers": numbers,
            "perDecimo": amount,
            "page": prize_url(ordinal, year) if outlets is not None else None,
            "outlets": outlets,
        })
    if not draw["numbers"]["first"]:
        raise Refused("the Gordo is not in the draw record yet: nothing to publish")
    snapshot = {
        "schema": 1,
        "testData": test_data,
        "year": year,
        "drawDate": f"{year}-12-22",
        "drawId": draw["drawId"],
        "readAt": read_at,
        "sources": {
            "results": f"{HOST}/es/loteria-nacional/resultados/loteria-nacional-premios-mayores-del-sorteo-del-22-de-diciembre-de-{year}",
            "officialList": draw["officialList"],
        },
        "prizes": prizes,
    }
    problems = snapshot_problems(snapshot)
    if problems:
        raise Refused("; ".join(problems))
    return snapshot, warnings


# --------------------------------------------------------------------- validation


def snapshot_problems(s: object) -> list[str]:
    """The same rules as src/lib/programmatic/gordo/validate.ts."""
    if s is None:
        return []
    if not isinstance(s, dict):
        return ["the snapshot is not an object"]
    p: list[str] = []
    if s.get("schema") != 1:
        p.append("schema must be 1")
    year = s.get("year")
    if not isinstance(year, int) or s.get("drawDate") != f"{year}-12-22":
        p.append("drawDate must be 22 December of the snapshot's year")
    if not isinstance(s.get("testData"), bool):
        p.append("testData must be true or false")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)", str(s.get("readAt", ""))):
        p.append("readAt must be an ISO timestamp with offset")
    for name, url in (s.get("sources") or {}).items():
        if url is not None and urllib.parse.urlparse(url).hostname not in OFFICIAL_HOSTS:
            p.append(f"source {name} is not on an official SELAE host")
    prizes = s.get("prizes") or []
    if [x.get("key") for x in prizes] != [k for k, *_ in PRIZES]:
        p.append("prizes must be first, second, third, fourth, fifth in that order")
        return p
    seen: set[str] = set()
    for (key, _ordinal, count, amount), prize in zip(PRIZES, prizes):
        numbers = prize.get("numbers") or []
        if len(numbers) > count:
            p.append(f"{key}: more than {count} numbers")
        for n in numbers:
            if not re.fullmatch(r"\d{5}", str(n)):
                p.append(f"{key}: {n!r} is not five digits")
            if n in seen:
                p.append(f"{n} appears twice")
            seen.add(n)
        if prize.get("perDecimo") != amount:
            p.append(f"{key}: perDecimo must be {amount}")
        outlets = prize.get("outlets")
        if outlets is None:
            continue
        if not numbers:
            p.append(f"{key}: points of sale without a number")
        if prize.get("page") and urllib.parse.urlparse(prize["page"]).hostname not in OFFICIAL_HOSTS:
            p.append(f"{key}: page is not on an official SELAE host")
        for o in outlets:
            if o.get("channel") == "web":
                continue
            if o.get("channel") != "outlet":
                p.append(f"{key}: unknown channel {o.get('channel')!r}")
                continue
            if o.get("province") not in set(PROVINCE_LABELS.values()):
                p.append(f"{key}: province {o.get('province')!r} is not an INE province code")
            if not str(o.get("locality") or "").strip() or not str(o.get("address") or "").strip():
                p.append(f"{key}: a point of sale without locality or address")
            m = o.get("municipality")
            if m is not None:
                if not re.fullmatch(r"\d{5}", str(m.get("ine", ""))) or m["ine"][:2] != o.get("province"):
                    p.append(f"{key}: municipality {m.get('ine')!r} is not in province {o.get('province')}")
                if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", str(m.get("slug", ""))) or not m.get("name"):
                    p.append(f"{key}: municipality {m.get('ine')!r} has no name or a bad slug")
    if not prizes[0].get("numbers"):
        p.append("the snapshot has no Gordo")
    # One slug per municipality and province: a URL must name one place.
    slugs: dict[str, str] = {}
    for prize in prizes:
        for o in prize.get("outlets") or []:
            m = o.get("municipality")
            if not m:
                continue
            key = f"{o.get('province')}/{m.get('slug')}"
            if slugs.setdefault(key, m.get("ine")) != m.get("ine"):
                p.append(f"{key} names two municipalities ({slugs[key]}, {m.get('ine')})")
    return p


# ----------------------------------------------------------------------- commands


def summary(snapshot: dict, warnings: list[str]) -> None:
    for prize in snapshot["prizes"]:
        outlets = prize["outlets"]
        towns = sorted({o["municipality"]["name"] for o in outlets or [] if o.get("municipality")})
        state = "points of sale not published" if outlets is None else f"{len(outlets)} points of sale, {len(towns)} municipalities"
        print(f"{prize['key']:7} {', '.join(prize['numbers']) or '-':60} {state}")
    for w in warnings:
        print(f"WARNING {w}")


def cmd_build(args: argparse.Namespace) -> None:
    directory = Path(args.dir).expanduser()
    read_at = args.read_at or dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds")
    snapshot, warnings = build_snapshot(directory, args.year, read_at, args.test_data)
    summary(snapshot, warnings)
    if args.dry_run:
        return
    out = Path(args.out)
    if snapshot["testData"] and out.resolve() == DEFAULT_OUT.resolve():
        raise Refused("test data never goes into the committed snapshot")
    out.write_text(json.dumps(snapshot, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {out}")


def cmd_check(args: argparse.Namespace) -> None:
    data = json.loads(Path(args.file).read_text(encoding="utf-8"))
    problems = snapshot_problems(data)
    if data is not None and data.get("testData") and Path(args.file).resolve() == DEFAULT_OUT.resolve():
        problems.append("the committed snapshot is marked testData")
    if problems:
        raise Refused("; ".join(problems))
    print("no snapshot (pages do not exist)" if data is None else f"ok: {sum(len(p['outlets'] or []) for p in data['prizes'])} points of sale")


CATALAN_PROVINCES = {"08": "Barcelona", "17": "Girona", "25": "Lleida", "43": "Tarragona"}


def cmd_catalonia(args: argparse.Namespace) -> None:
    """Prints RESULTS_2026 for the lottery guide (src/lib/content/batch02/loteria-nadal.ts) from a snapshot."""
    data = json.loads(Path(args.file).read_text(encoding="utf-8"))
    problems = snapshot_problems(data)
    if data is None or problems:
        raise Refused("; ".join(problems) or "no snapshot")
    prizes = {p["key"]: p for p in data["prizes"]}

    def sold(key: str) -> str:
        outlets = prizes[key]["outlets"]
        if outlets is None:
            return "null"
        towns: list[tuple[str, str]] = []
        for o in outlets:
            if o["channel"] != "outlet" or o["province"] not in CATALAN_PROVINCES:
                continue
            if not o["municipality"]:
                print(f"// WARNING {key}: {o['locality']} matches no Catalan municipality: check it by hand", file=sys.stderr)
                continue
            town = (o["municipality"]["name"], CATALAN_PROVINCES[o["province"]])
            if town not in towns:
                towns.append(town)
        return "[" + ", ".join(f'{{ town: {json.dumps(t, ensure_ascii=False)}, province: "{p}" }}' for t, p in towns) + "]"

    n = lambda key: prizes[key]["numbers"]  # noqa: E731
    if len(n("fourth")) != 2 or len(n("fifth")) != 8 or not n("second") or not n("third"):
        raise Refused("the guide needs all thirteen numbers: wait for the rest of the draw")
    year = data["year"]
    print("export const RESULTS_2026: NadalResults | null = {")
    print(f'  first: "{n("first")[0]}",')
    print(f'  second: "{n("second")[0]}",')
    print(f'  third: "{n("third")[0]}",')
    print(f"  fourth: {json.dumps(n('fourth'))},")
    print(f"  fifth: {json.dumps(n('fifth'))},")
    print(f"  soldInCatalonia: {{ first: {sold('first')}, second: {sold('second')}, third: {sold('third')}, fourth: {sold('fourth')} }},")
    print(f'  source: {{ name: "Lotería Nacional: premios mayores del sorteo del 22 de diciembre de {year}", url: "{data["sources"]["results"]}", publisher: "SELAE" }},')
    print("};")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    f = sub.add_parser("fetch", help="download SELAE's draw record and prize pages into a new directory")
    f.add_argument("--year", type=int, required=True)
    f.add_argument("--dir", required=True)
    b = sub.add_parser("build", help="parse, validate and write the snapshot")
    b.add_argument("--year", type=int, required=True)
    b.add_argument("--dir", required=True)
    b.add_argument("--out", default=str(DEFAULT_OUT))
    b.add_argument("--read-at", help="ISO timestamp of the download (default: now)")
    b.add_argument("--dry-run", action="store_true")
    b.add_argument("--test-data", action="store_true", help="only for the test fixture directory")
    c = sub.add_parser("check", help="validate a snapshot file")
    c.add_argument("--file", default=str(DEFAULT_OUT))
    g = sub.add_parser("catalonia", help="print RESULTS_2026 for the lottery guide from a snapshot")
    g.add_argument("--file", default=str(DEFAULT_OUT))
    args = parser.parse_args()
    try:
        {"fetch": cmd_fetch, "build": cmd_build, "check": cmd_check, "catalonia": cmd_catalonia}[args.command](args)
    except Refused as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
