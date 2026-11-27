// Lab for docs/SEO_EXPERIMENTS.md "Mobile CLS with ads" (25 Nov 2026). One headless Chromium, mobile emulation, >= 20 s, layout-shift sources.
// node scripts/ads-cls-lab.mjs <url> <W> <H>   env: WARM=1|<url> (consent accepted on an earlier view, cookie set), OVERLAYS=bottom (lab-only: sets data-overlays on Google's script tag, as AdSense help 7478225 describes, to preview a bottom-only anchor), CONSENT=accept|deny|none (clicks .fc-cta-consent / .fc-cta-do-not-consent of the Google CMP), BLOCK=1 (no-ads control), CSS=file, SHOT=png; summarise with ads-cls-sum.mjs
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [url, W, H] = [process.argv[2], +process.argv[3], +process.argv[4]];
const CONSENT = process.env.CONSENT || "none";
const CHROME = process.env.HOME + "/.cache/ms-playwright/chromium-1140/chrome-linux/chrome";
const port = 9800 + Math.floor(Math.random() * 400);
const dir = mkdtempSync(join(tmpdir(), "cls2-"));
const chrome = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--hide-scrollbars", `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tg;
for (let i = 0; i < 50 && !tg; i++) { try { const j = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); tg = j.find((t) => t.type === "page"); } catch {} if (!tg) await sleep(200); }
const ws = new WebSocket(tg.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result ?? d.error); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true })).result?.value;
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
if (process.env.BLOCK) await send("Network.setBlockedURLs", { urls: ["*googlesyndication.com*", "*googleads*", "*adservice*", "*fundingchoices*", "*doubleclick*", "*googletagservices*", "*adtrafficquality*"] });
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2.625, mobile: true });
await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" });
const css = process.env.CSS ? fs.readFileSync(process.env.CSS, "utf8") : "";
const obs = `
window.__ls=[];window.__mu=[];${process.env.OVERLAYS ? `new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.tagName==='SCRIPT'&&/adsbygoogle\\.js/.test(n.src||''))n.setAttribute('data-overlays',${JSON.stringify(process.env.OVERLAYS)});}).observe(document,{childList:true,subtree:true});` : ""}
function sel(n){ if(!n||!n.nodeType) return '?'; if(n.nodeType===3) n=n.parentElement; if(!n) return '?'; const parts=[]; let c=n; for(let i=0;i<3&&c&&c.tagName;i++){ let s=c.tagName.toLowerCase(); if(c.id) s+='#'+c.id; if(c.className&&typeof c.className==='string') s+='.'+c.className.trim().split(/\\s+/).slice(0,2).join('.'); parts.unshift(s); c=c.parentElement;} return parts.join(' > '); }
new PerformanceObserver(l=>{ for(const e of l.getEntries()){ window.__ls.push({t:Math.round(e.startTime),v:+e.value.toFixed(4),inp:e.hadRecentInput,src:(e.sources||[]).map(s=>({n:sel(s.node),ad:!!(s.node&&s.node.closest&&s.node.closest('.ci-ad')),mid:!!(s.node&&s.node.closest&&s.node.closest('.ci-ad-middle')),prev:[Math.round(s.previousRect.y),Math.round(s.previousRect.height)],cur:[Math.round(s.currentRect.y),Math.round(s.currentRect.height)]}))}); } }).observe({type:'layout-shift',buffered:true});
document.addEventListener('DOMContentLoaded',()=>{ new MutationObserver(ms=>{for(const m of ms){const t=Math.round(performance.now()); const n=m.target; if(n===document.body||n===document.documentElement){ if(m.type==='attributes') window.__mu.push({t,n:n.tagName,a:m.attributeName,v:(n.getAttribute(m.attributeName)||'').slice(0,160)}); else window.__mu.push({t,n:'body-child',add:[...m.addedNodes].map(x=>x.tagName+'.'+(x.className||x.id||'')).join(',').slice(0,120)});}}}).observe(document,{attributes:true,childList:true,subtree:true,attributeFilter:['style','class']});${css ? `const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.append(s);` : ""} });`;
await send("Page.addScriptToEvaluateOnNewDocument", { source: obs });
if (process.env.WARM) { // returning visitor: accept consent on a first view (FCCDCF cookie), then measure a fresh navigation with the cookie set
  await send("Page.navigate", { url: process.env.WARM.startsWith("http") ? process.env.WARM : url });
  let ok = false; for (let i = 0; i < 40 && !ok; i++) { await sleep(500); ok = await ev(`(()=>{const b=document.querySelector('.fc-cta-consent'); if(b){b.click();return true}return false})()`); }
  await sleep(4000); if (!ok) console.error("WARM: no consent dialog seen");
}
await send("Page.navigate", { url });
let clicked = null;
const t0 = Date.now();
if (CONSENT !== "none") {
  const want = CONSENT === "accept" ? ".fc-cta-consent" : ".fc-cta-do-not-consent";
  for (let i = 0; i < 40 && !clicked; i++) { await sleep(500); const r = await ev(`!!document.querySelector(${JSON.stringify(want)})`); if (process.env.DBG) console.error(i, r); if (r && await ev(`(()=>{const b=document.querySelector(${JSON.stringify(want)}); if(b){b.click();return true}return false})()`)) clicked = Date.now() - t0; }
  if (!clicked && CONSENT === "deny") {
    if (await ev(`(()=>{const b=document.querySelector('.fc-cta-manage-options');if(b){b.click();return true}return false})()`)) { await sleep(1500); await ev(`(()=>{const b=document.querySelector('.fc-confirm-choices');if(b){b.click();return true}return false})()`); clicked = "manage"; }
  }
}
await sleep(Math.max(1000, 20000 - (Date.now() - t0)));
if (process.env.SHOT) fs.writeFileSync(process.env.SHOT, Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64"));
const p1 = JSON.parse(await ev("JSON.stringify(window.__ls)"));
const total = await ev("document.documentElement.scrollHeight");
for (let y = 0; y < total; y += Math.floor(H * 0.7)) { await ev(`window.scrollTo(0,${y})`); await sleep(800); }
await sleep(3000);
const p2 = JSON.parse(await ev("JSON.stringify(window.__ls)"));
const mu = JSON.parse(await ev("JSON.stringify(window.__mu.slice(0,30))"));
const info = JSON.parse(await ev(`JSON.stringify({total:document.documentElement.scrollHeight, bodyStyle:document.body.getAttribute('style'), htmlStyle:document.documentElement.getAttribute('style'), bodyPT:getComputedStyle(document.body).paddingTop, bodyMT:getComputedStyle(document.body).marginTop, dialog:!!document.querySelector('.fc-consent-root,.fc-dialog-container'), anchor:[...document.querySelectorAll('[data-anchor-status],[data-vignette-status],.google-anchor,ins[data-anchor-shown]')].map(e=>e.tagName+':'+(e.getAttribute('data-anchor-status')||e.getAttribute('data-vignette-status')||e.className)), units:[...document.querySelectorAll('.ci-ad')].map(a=>{const i=a.querySelector('ins.adsbygoogle');return {c:a.className.replace('ci-ad ',''),box:Math.round(a.getBoundingClientRect().height),top:Math.round(a.getBoundingClientRect().top+scrollY),st:i?i.getAttribute('data-ad-status'):null}})})`));
const sum = (a) => +a.filter((e) => !e.inp).reduce((s, e) => s + e.v, 0).toFixed(4);
const sess = (a) => { let ss = [], c = null; for (const e of a.filter((e) => !e.inp)) { if (c && e.t - c.l < 1000 && e.t - c.f < 5000) { c.v += e.v; c.l = e.t; } else { c = { v: e.v, f: e.t, l: e.t }; ss.push(c); } } return +Math.max(0, ...ss.map((s) => s.v)).toFixed(4); };
console.log(JSON.stringify({ url: url.replace("https://www.catalunyainfo.com", ""), vp: `${W}x${H}`, consent: CONSENT, block: !!process.env.BLOCK, css: !!css, clicked, cls_noscroll: sum(p1), cls_all: sum(p2), cls_session: sess(p2), shifts: p2.filter((e) => e.v >= 0.001), mu, info }));
chrome.kill(); process.exit(0);
