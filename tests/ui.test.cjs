// DOM integration tests, not a real browser or device-layout test.
const fs = require("node:fs"),
  assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync("dist/index.html", "utf8");
function load(profile) {
  const dom = new JSDOM(html, {
    url: "https://game.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.__scrollTop = 0;
  w.__scrollCalls = [];
  Object.defineProperty(w, "scrollY", {
    configurable: true,
    get: () => w.__scrollTop,
  });
  w.scrollTo = (arg, y) => {
    const top =
      typeof arg === "object" && arg !== null
        ? Number(arg.top || 0)
        : Number(y || 0);
    w.__scrollTop = top;
    w.__scrollCalls.push(top);
  };
  w.matchMedia = () => ({ matches: true });
  w.requestAnimationFrame = () => 0;
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  if (profile)
    w.localStorage.setItem("ganesha-festival-v3", JSON.stringify(profile));
  w.eval(fs.readFileSync("dist/core.js", "utf8"));
  w.eval(fs.readFileSync("dist/game.js", "utf8"));
  return dom;
}
function click(w, selector) {
  const el = w.document.querySelector(selector);
  assert(el, "Missing " + selector);
  assert(!el.disabled, "Disabled " + selector);
  el.click();
}
let dom = load(),
  w = dom.window;
assert(w.document.querySelector("h1").textContent.includes("GANESHA"));
click(w, '[data-action="trail"]');
click(w, '[data-action="start"]');
click(w, '[data-action="begin"]');
assert.equal(w.document.querySelectorAll(".memory-tile").length, 15);
click(w, '[data-action="pause"]');
let snap = JSON.parse(w.localStorage.getItem("ganesha-festival-v3"));
assert.equal(snap.active.phase, "paused");
assert(w.document.querySelector(".pause-cover"));
click(w, '[data-action="resume"]');
assert(!w.document.querySelector(".pause-cover"));
click(w, '[data-action="settings"]');
assert(w.document.querySelector("dialog").open);
assert.equal(
  JSON.parse(w.localStorage.getItem("ganesha-festival-v3")).active.phase,
  "paused",
);
click(w, '[data-action="close"]');
dom.window.close();
const C = require("../dist/core.js");
let p = C.newProfile();
p.coins = 200;
p.completed = [0, 1, 2, 3, 4];
dom = load(p);
w = dom.window;
click(w, '[data-action="workshop"]');
for (let i = 0; i < 5; i++) {
  click(w, `.build-tabs [data-value="${i}"]`);
  click(w, '[data-action="upgrade"]');
}
assert.equal(w.document.querySelectorAll(".landmark").length, 5);
assert.equal(
  JSON.parse(w.localStorage.getItem("ganesha-festival-v3")).coins,
  110,
);
click(w, '[data-action="move"]');
assert.equal(
  JSON.parse(w.localStorage.getItem("ganesha-festival-v3")).positions[4],
  1,
);
click(w, '[data-action="celebrate"]');
assert(w.document.querySelector(".celebration"));
dom.window.close();
// A resumed maths round verifies real click -> score/reward -> result -> next flow.
p = C.newProfile();
p.active = C.newRun("challenge", "standard");
p.active.stage = 1;
C.beginRound(p.active);
const answer = p.active.round.p.answer;
dom = load(p);
w = dom.window;
click(w, '[data-action="continue"]');
click(w, '[data-action="resume"]');
click(w, `[data-action="answer"][data-value="${answer}"]`);
assert(w.document.querySelector(".round-result"));
let saved = JSON.parse(w.localStorage.getItem("ganesha-festival-v3"));
assert.equal(saved.coins, 14);
assert.equal(saved.active.results.length, 1);
click(w, '[data-action="next"]');
assert(w.document.querySelector(".intro"));
dom.window.close();

// Gameplay re-renders must preserve the player's vertical position. This prevents
// the tall Memory board from jumping to the top after every tile selection.
p = C.newProfile();
p.active = C.newRun("practice", "standard", 0);
C.beginRound(p.active);
C.tick(p.active, p.active.round.p.preview + 1);
const memoryTarget = p.active.round.p.target[0];
dom = load(p);
w = dom.window;
click(w, '[data-action="continue"]');
click(w, '[data-action="resume"]');
w.__scrollTop = 640;
w.__scrollCalls.length = 0;
click(w, `[data-action="tile"][data-value="${memoryTarget}"]`);
assert.equal(w.__scrollTop, 640);
assert.equal(w.__scrollCalls.at(-1), 640);
dom.window.close();

// Every ability is wired to its practice screen. Challenge has no assist button.
for (let stage = 0; stage < 5; stage++) {
  p = C.newProfile();
  p.buildings = [1, 1, 1, 1, 1];
  p.active = C.newRun("practice", "standard", stage);
  C.beginRound(p.active);
  C.tick(p.active, p.active.round.p.preview);
  dom = load(p);
  w = dom.window;
  click(w, '[data-action="continue"]');
  click(w, '[data-action="resume"]');
  click(w, '[data-action="assist"]');
  assert(
    JSON.parse(w.localStorage.getItem("ganesha-festival-v3")).active.round
      .assistUsed,
  );
  dom.window.close();
}
console.log(
  "PASS: startup with real DOM/window globals; journey; pause/resume; settings pause; purchases and balance; placements; finale; answer/reward/advance; Memory scroll preservation; five ability buttons. Responsive visual/device QA remains unverified.",
);
