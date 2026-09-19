const assert = require("node:assert/strict");
const C = require("../dist/core.js");
function winRound(p, r) {
  C.beginRound(r);
  if (r.round.p.preview) C.tick(r, r.round.p.preview);
  r.correct++;
  return C.settle(p, r);
}
// Same challenge seed produces identical boards; alternatives are distinct.
for (const d of ["standard", "expert"])
  for (let s = 0; s < 5; s++)
    for (let l = 0; l < 5; l++) {
      const a = C.puzzle(s, l, d, 71231),
        b = C.puzzle(s, l, d, 71231);
      assert.deepEqual(a, b);
      if (s === 0) {
        assert.equal(new Set(a.target).size, a.target.length);
        assert(a.target.every((x) => x < a.count));
      }
      if (s === 1 || s === 4) {
        assert.equal(a.options.length, 4);
        assert.equal(new Set(a.options).size, 4);
        assert(a.options.includes(a.answer));
      }
      if (s === 2) assert.equal(a.objects.filter((x) => x === 6).length, 1);
      if (s === 3) assert(a.sequence.every((x) => x < a.pads));
    }
const p = C.newProfile(),
  r = C.newRun("challenge", "standard");
for (let i = 0; i < 25; i++) {
  const reward = winRound(p, r),
    coins = p.coins;
  assert(reward);
  assert.equal(C.settle(p, r), null);
  assert.equal(p.coins, coins);
  C.advance(r);
}
assert(r.finished);
assert.equal(r.results.length, 25);
assert.equal(p.coins, 350);
assert.equal(p.completed.length, 5);
C.complete(p, r);
C.complete(p, r);
assert.equal(p.history.length, 1);
assert.equal(p.best.standard.score, r.score);
assert.equal(p.best.expert, null);
const r2 = C.newRun("challenge", "standard");
C.beginRound(r2);
C.tick(r2, r2.round.p.preview);
const puzzle = structuredClone(r2.round.p);
C.miss(r2);
const before = structuredClone(r2.round);
r2.phase = "paused";
C.tick(r2, 10000);
assert.deepEqual(r2.round, before);
r2.phase = "playing";
C.miss(r2);
C.miss(r2);
assert.equal(r2.round.phase, "failed");
assert(C.retry(r2));
assert.deepEqual(r2.round.p, puzzle);
assert.equal(r2.round.misses, 3);
assert.equal(r2.retries, 1);
assert.equal(r2.round.hearts, 3);
C.tick(r2, r2.round.p.preview);
assert(C.roundPoints(r2) < r.results[0].points);
const q = C.newProfile();
q.coins = 24;
assert(C.upgrade(q, 0));
assert.equal(q.coins, 0);
assert(!C.upgrade(q, 0));
const pr = C.newRun("practice", "expert", 0);
C.beginRound(pr);
C.tick(pr, pr.round.p.preview);
assert(C.useAssist(q, pr));
assert(!C.useAssist(q, pr));
assert.equal(pr.round.phase, "assist");
C.tick(pr, pr.round.previewLeft);
assert.equal(pr.round.phase, "input");
assert(!C.useAssist(q, r2));
for (let s = 0; s < 5; s++) {
  q.buildings = [3, 3, 3, 3, 3];
  const tr = C.newRun("practice", "expert", s);
  C.beginRound(tr);
  C.tick(tr, tr.round.p.preview);
  const remaining = tr.round.inputLeft;
  assert(C.useAssist(q, tr));
  if (s === 2) assert.equal(tr.round.inputLeft, remaining + 9000);
  if (s === 1 || s === 4) {
    assert.equal(tr.round.eliminated.length, 2);
    assert(!tr.round.eliminated.includes(tr.round.p.answer));
  }
}
const timeout = C.newRun("practice", "standard", 2);
C.beginRound(timeout);
C.tick(timeout, timeout.round.inputLeft);
assert.equal(timeout.round.phase, "failed");
assert.equal(timeout.wrong, 1);
const practice = C.newRun("practice", "standard", 1);
for (let i = 0; i < 5; i++) {
  winRound(q, practice);
  C.advance(practice);
}
C.complete(q, practice);
assert.equal(q.history.length, 0);
console.log(
  "PASS: 50 puzzle configurations, deterministic circuits, 25-round completion, one-time rewards, separate records, pause preservation, retry penalties, all five practice abilities, timeout and practice exclusion.",
);
