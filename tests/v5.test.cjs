const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {} };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("dist/festival-data.js","utf8"), context);
vm.runInContext(fs.readFileSync("dist/festival-art.js","utf8"), context);

const D = context.window.GFJData;
const A = context.window.GFJArt;

assert(D, "GFJData must load");
assert(A, "GFJArt must load");
assert.equal(D.idols.length, 131, "131 idol catalog entries");
assert.equal(D.mandaps.length, 120, "120 mandap designs");
assert.equal(D.decorations.length, 500, "500 decoration designs");
assert(D.pujaItems.length >= 20, "puja inventory should be substantial");
assert(D.mantras.length >= 5, "mantra learning library should exist");

const mandapArt = D.mandaps.map(x => A.mandapSvg(x));
assert(mandapArt.every(x => x.startsWith("<svg") && x.includes("mandap-art")));
assert.equal(new Set(mandapArt).size, 120, "all mandap SVG outputs must be distinct");

const decorArt = D.decorations.map(x => A.decorSvg(x));
assert(decorArt.every(x => x.startsWith("<svg") && x.includes("decor-art")));
assert.equal(new Set(decorArt).size, 500, "all decoration SVG outputs must be distinct");

assert(A.pujaSvg(D.pujaItems[0]).includes("<svg"));
assert(A.pujaScene(1, D.mantras[0].title).includes("ritual-art"));
assert(A.festivalDaySvg(1,3).includes("festival-day-art"));
assert(A.processionSvg(0,false).includes("procession-art"));
assert(A.processionSvg(6,true).includes("Visarjan"));

const index = fs.readFileSync("dist/index.html","utf8");
const cloud = fs.readFileSync("dist/anonymous-cloud.js","utf8");
assert(!/type=["']password["']/i.test(index + cloud), "contest build must not request passwords");
assert(!/\/api\/(register|login|logout|me)/.test(index + cloud), "no account endpoints");
assert(/\/api\/save/.test(cloud), "durable D1 save endpoint must remain");
assert(/recovery key/i.test(cloud), "recovery-key restore must remain");

console.log("PASS: V5 has 131 idol entries, 120 distinct SVG mandaps, 500 distinct SVG decorations, puja/procession artwork and recovery-key persistence without password accounts.");
