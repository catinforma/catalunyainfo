import { readFileSync } from "node:fs";
for (const l of readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean)) {
  const r = JSON.parse(l);
  const big = r.shifts.filter((s) => s.v >= 0.005).map((s) => `${(s.t / 1000).toFixed(1)}s ${s.v}: ` + s.src.slice(0, 3).map((x) => x.n.split(" > ").slice(-2).join(">").replace(/\.(fraunces|ibm)[^ ]*/g, "").slice(0, 60) + (x.ad ? "[ad]" : "") + `(${x.prev[0]}->${x.cur[0]})`).join(" | ")).join("\n      ");
  const pad = r.mu.filter((m) => m.a === "style" && /padding|top:/.test(m.v)).map((m) => `${m.t}:${m.v}`).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(" ; ");
  console.log(`${r.url} ${r.vp} ${r.consent}${r.block ? "+block" : ""}${r.css ? "+css" : ""} click=${r.clicked} noscroll=${r.cls_noscroll} all=${r.cls_all} sess=${r.cls_session} anchor=${(r.info.anchor || []).join(",")} bodyPT=${r.info.bodyPT}\n   units=${r.info.units.map((u) => u.c.replace("ci-ad-", "") + ":" + u.box + "/" + u.st).join(" ")}\n   pad=${pad}\n      ${big}`);
}
