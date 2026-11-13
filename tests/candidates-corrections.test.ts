import assert from "node:assert/strict";
import { test } from "node:test";

import type { Candidacy, ProvinceKey } from "../src/lib/content/candidates/boe.ts";
import { CORRECTIONS_29N, applyCorrections } from "../src/lib/content/candidates/corrections.ts";

/**
 * The 29N correction (BOE-A-2026-23383, 7 Nov 2026) applied to lists shaped
 * like the proclaimed ones (BOE-A-2026-23103): names and numbers below are
 * copied from those two BOE items, read 13 Nov 2026.
 */

const ID = "BOE-A-2026-23383";

function senate(number: number, name: string, people: [string, string, string][]): Candidacy {
  return {
    number,
    name,
    status: "listed",
    note: null,
    candidates: people.map(([person, s1, s2], index) => ({ number: index + 1, name: person, substitutes: [s1, s2] })),
    substitutes: [],
  };
}

function congress(number: number, name: string, people: string[], substitutes: string[]): Candidacy {
  return {
    number,
    name,
    status: "listed",
    note: null,
    candidates: people.map((person, index) => ({ number: index + 1, name: person, substitutes: [] })),
    substitutes: substitutes.map((person, index) => ({ number: index + 1, name: person, substitutes: [] })),
  };
}

const ERC = "ESQUERRA REPUBLICANA DE CATALUNYA-EUSKAL HERRIA BILDU (ERC-EH BILDU)";
const PCTC = "PARTIT COMUNISTA DELS TREBALLADORS DE CATALUNYA (PCTC)";
const COMUNS = "Comuns-Front Ampli (COMUNS-FRONT AMPLI)";

function lists(): { province: ProvinceKey; congress: Candidacy[]; senate: Candidacy[] }[] {
  const g = " (ERC-EH BILDU)";
  const t = " (ERC-EH-BILDU)";
  const c = " (COMUNS-FRONT AMPLI)";
  return [
    {
      province: "girona",
      congress: [],
      senate: [
        senate(3, ERC, [
          [`Etna Estrems Fayos${g}`, `Albert Sanz Gonzàlez${g}`, `Carla Andreu Pujadas${g}`],
          [`Miquel Reverter Tres${g}`, `Lídia Àvila Medina${g}`, `Jordi Vilà Vilà${g}`],
          [`Roser Carré Gonzàlez${g}`, `Ferran Camps Campos${g}`, `Carme Viñas Benítez${g}`],
        ]),
      ],
    },
    {
      province: "tarragona",
      congress: [
        congress(
          7,
          COMUNS,
          ["Ester Roca Domodel", "Óscar Sendra Anglès", "Eva Amposta Serres"].map((name) => name + c),
          ["Teresa Fortuny Solà", "Josep Sementé Moyà"].map((name) => name + c),
        ),
      ],
      senate: [
        senate(2, ERC, [
          [`Noemí Llauradó Sans${t}`, `Josep Maria Farré Vidal${t}`, `Marina Berasategui Canals${t}`],
          [`Xavier Faura Sanmartín${t}`, `Montse Subirats Gisbert${t}`, `Jordi Gaseni Blanch${t}`],
          [`Montserrat Ventura Jané${t}`, `Jean-Marc Segarra Mauri${t}`, `Virginia Martínez Torres${t}`],
        ]),
        senate(4, PCTC, [["Albert Camarasa Escubedo", "Kelly Marcela Parra Aponte", "Jon Manso Fernandez"]]),
        senate(5, "VOX (VOX)", [["Ana Belén Rodríguez Ros", "Paul Daniel Axinte Axinte", "Elena Sánchez Fernández"]]),
        senate(6, "CONVERGENTS (CNV)", [["Demelsa Bartual Soria", "Manuel Andrés Marín García", "Mercè Alicia Sans Sáez"]]),
      ],
    },
  ];
}

test("the 7 Nov correction is applied as the BOE wrote it: suffixes gone, surname fixed, Senate 4 and 5 swapped", () => {
  const input = lists();
  const snapshot = JSON.stringify(input);
  const { lists: out, applied } = applyCorrections(input, new Set([ID]));
  assert.deepEqual(applied, [ID]);
  assert.equal(JSON.stringify(input), snapshot, "the input is never modified");

  const [girona, tarragona] = out;
  const gironaErc = girona!.senate[0]!;
  assert.deepEqual(
    gironaErc.candidates.map((candidate) => [candidate.name, ...candidate.substitutes]),
    [
      ["Etna Estrems Fayos", "Albert Sanz Gonzàlez", "Carla Andreu Pujadas"],
      ["Miquel Reverter Tres", "Lídia Àvila Medina", "Jordi Vilà Vilà"],
      ["Roser Carré Gonzàlez", "Ferran Camps Campos", "Carme Viñas Benítez"],
    ],
  );
  assert.deepEqual(gironaErc.corrections, [ID]);

  const comuns = tarragona!.congress[0]!;
  assert.deepEqual(
    comuns.candidates.map((candidate) => candidate.name),
    ["Ester Roca Domedel", "Óscar Sendra Anglès", "Eva Amposta Serres"],
  );
  assert.deepEqual(
    comuns.substitutes.map((candidate) => candidate.name),
    ["Teresa Fortuny Solà", "Josep Sementé Moyà"],
  );
  assert.equal(comuns.name, COMUNS, "the candidacy's own name is untouched");

  assert.deepEqual(
    tarragona!.senate.map((candidacy) => [candidacy.number, candidacy.name]),
    [
      [2, ERC],
      [4, "VOX (VOX)"],
      [5, PCTC],
      [6, "CONVERGENTS (CNV)"],
    ],
  );
  assert.equal(tarragona!.senate[0]!.candidates[0]!.name, "Noemí Llauradó Sans");
  assert.equal(tarragona!.senate[3]!.corrections?.length ?? 0, 0, "untouched lists carry no mark");
});

test("a correction the page did not find in the BOE is not applied", () => {
  const { lists: out, applied } = applyCorrections(lists(), new Set());
  assert.deepEqual(applied, []);
  assert.equal(out[1]!.congress[0]!.candidates[0]!.name, "Ester Roca Domodel (COMUNS-FRONT AMPLI)");
});

test("all or nothing: if one expectation fails, nothing of that correction is applied", () => {
  // The Tarragona Senate list no longer has the PCTC candidacy at number 4.
  const input = lists();
  input[1]!.senate[1]!.number = 8;
  const { lists: out, applied } = applyCorrections(input, new Set([ID]));
  assert.deepEqual(applied, []);
  assert.equal(out[0]!.senate[0]!.candidates[0]!.name, "Etna Estrems Fayos (ERC-EH BILDU)");
  assert.equal(out[1]!.congress[0]!.candidates[0]!.name, "Ester Roca Domodel (COMUNS-FRONT AMPLI)");

  // A name already respelled (the BOE republished the list) is not stripped again.
  const respelled = lists();
  respelled[1]!.congress[0]!.candidates[0]!.name = "Ester Roca Domedel";
  assert.deepEqual(applyCorrections(respelled, new Set([ID])).applied, []);
});

test("a renumbering that would leave two lists with one number is refused", () => {
  const input = lists();
  input[1]!.senate.push(senate(4, "ALTRA (ALT)", [["Nom Cognom Cognom", "A B C", "D E F"]]));
  assert.deepEqual(applyCorrections(input, new Set([ID])).applied, []);
});

test("every fix names a Catalan province, a chamber and a BOE correction item", () => {
  for (const correction of CORRECTIONS_29N) {
    assert.match(correction.id, /^BOE-A-2026-\d+$/);
    assert.match(correction.date, /^2026-\d{2}-\d{2}$/);
    for (const fix of correction.fixes) {
      assert.ok(["barcelona", "girona", "lleida", "tarragona"].includes(fix.province));
      assert.ok(["congress", "senate"].includes(fix.chamber));
      assert.ok(fix.stripSuffix || fix.rename?.length || fix.renumber !== undefined, "a fix that changes nothing");
    }
  }
});
