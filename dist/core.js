/* Ganesha's Festival Journey: pure game rules. No browser or rendering code.
 * Also loadable with require('./core.js') for the regression tests. */
(function (root) {
  "use strict";
  const STAGES = [
    "Ganesha Memory",
    "Modak Math",
    "Mushak Hunt",
    "Ganesha Sequence",
    "Festival Pattern",
  ];
  const BUILDINGS = [
    {
      name: "Diya grove",
      sprite: 0,
      cost: [24, 48, 80],
      skill: 0,
      ability: "Memory peek",
      detail: "Reveal the memory board once per practice round.",
    },
    {
      name: "Rangoli court",
      sprite: 1,
      cost: [24, 48, 80],
      skill: 4,
      ability: "Pattern insight",
      detail: "Remove two wrong pattern choices in practice.",
    },
    {
      name: "Modak kitchen",
      sprite: 2,
      cost: [24, 48, 80],
      skill: 1,
      ability: "Math insight",
      detail: "Remove two wrong maths choices in practice.",
    },
    {
      name: "Dhol pavilion",
      sprite: 3,
      cost: [24, 48, 80],
      skill: 3,
      ability: "Rhythm echo",
      detail: "Hear and see the sequence again in practice.",
    },
    {
      name: "Lotus garden",
      sprite: 4,
      cost: [24, 48, 80],
      skill: 2,
      ability: "Extra time",
      detail: "Add time to a Mushak hunt in practice.",
    },
  ];
  // Seeded puzzles make each challenge edition repeatable and comparable.
  function rng(seed) {
    let n = seed >>> 0;
    return () => {
      n += 0x6d2b79f5;
      let t = n;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(a, r = Math.random) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function puzzle(stage, level, difficulty, seed) {
    const hard = difficulty === "expert",
      r = rng(seed + stage * 997 + level * 173),
      int = (n) => Math.floor(r() * n);
    const p = {
      stage,
      level,
      limit: Math.max(9, 24 - level * 2 - (hard ? 5 : 0)) * 1000,
      preview: 0,
    };
    if (stage === 0) {
      p.count = [15, 20, 25, 30, 30][level];
      p.target = shuffled(
        Array.from({ length: p.count }, (_, i) => i),
        r,
      ).slice(0, 4 + level + (hard ? 2 : 0));
      p.preview = Math.max(1000, 2600 - level * 260 - (hard ? 400 : 0));
      p.limit = (hard ? 17 : 24) * 1000;
    }
    if (stage === 1) {
      const a = 3 + int(5 + level * 2) + (hard ? 4 : 0),
        b = 3 + int(4 + level) + (hard ? 3 : 0),
        c = 2 + int(8);
      p.a = a;
      p.b = b;
      p.c = c;
      p.operation = level < 2 ? "multiply" : level < 4 ? "add" : "subtract";
      p.answer =
        a * b +
        (p.operation === "add" ? c : p.operation === "subtract" ? -c : 0);
      p.question =
        p.operation === "multiply"
          ? `${a} × ${b}`
          : p.operation === "add"
            ? `(${a} × ${b}) + ${c}`
            : `(${a} × ${b}) − ${c}`;
      const opts = new Set([p.answer]);
      while (opts.size < 4) {
        let n = p.answer + int(21) - 10;
        if (n >= 0) opts.add(n);
      }
      p.options = shuffled([...opts], r);
    }
    if (stage === 2) {
      p.count = 24 + level * 6 + (hard ? 6 : 0);
      p.answer = int(p.count);
      p.objects = Array.from({ length: p.count }, (_, i) =>
        i === p.answer ? 6 : [0, 1, 2, 3, 4, 5, 7, 8][int(8)],
      );
      p.limit = (14 - level - (hard ? 3 : 0)) * 1000;
    }
    if (stage === 3) {
      p.sequence = Array.from({ length: 4 + level + (hard ? 1 : 0) }, () =>
        int(hard ? 6 : 4),
      );
      p.pads = hard ? 6 : 4;
      p.beat = hard ? 560 : 720;
      p.preview = p.sequence.length * p.beat + 650;
      p.limit = (hard ? 16 : 22) * 1000;
    }
    if (stage === 4) {
      const icons = shuffled([0, 1, 2, 3, 4, 5], r),
        rules = hard
          ? [
              [0, 1, 2, 1],
              [0, 0, 1, 2],
              [0, 1, 1, 2, 2],
              [0, 1, 2, 0, 2, 1],
              [0, 1, 2, 2, 1, 0],
            ]
          : [
              [0, 1],
              [0, 0, 1],
              [0, 1, 2],
              [0, 1, 1, 2],
              [0, 1, 2, 1],
            ];
      const rule = rules[level];
      const len = Math.min(14, rule.length * 2 + int(rule.length));
      p.pattern = Array.from(
        { length: len },
        (_, i) => icons[rule[i % rule.length]],
      );
      p.answer = icons[rule[len % rule.length]];
      p.options = shuffled(
        [
          p.answer,
          ...shuffled(
            icons.filter((x) => x !== p.answer),
            r,
          ).slice(0, 3),
        ],
        r,
      );
    }
    return p;
  }
  function newProfile() {
    return {
      version: 3,
      coins: 0,
      buildings: [0, 0, 0, 0, 0],
      positions: [0, 0, 0, 0, 0],
      palette: "amber",
      completed: [],
      best: { standard: null, expert: null },
      history: [],
      roundsWon: 0,
      perfects: 0,
      achievements: [],
      festivalComplete: false,
      active: null,
    };
  }
  function newRun(mode, difficulty, practiceStage = 0, seed = 71231) {
    return {
      id:
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      mode,
      difficulty,
      seed,
      stage: mode === "practice" ? practiceStage : 0,
      level: 0,
      score: 0,
      elapsed: 0,
      correct: 0,
      wrong: 0,
      retries: 0,
      combo: 0,
      maxCombo: 0,
      earned: 0,
      results: [],
      phase: "intro",
      round: null,
      finished: false,
    };
  }
  function beginRound(run) {
    const p = puzzle(run.stage, run.level, run.difficulty, run.seed);
    run.round = {
      p,
      phase: p.preview ? "preview" : "input",
      previewLeft: p.preview,
      inputLeft: p.limit,
      hearts: 3,
      selected: [],
      found: [],
      entry: [],
      misses: 0,
      attempts: 0,
      elapsed: 0,
      assistUsed: false,
      eliminated: [],
      settled: false,
    };
    run.phase = "playing";
  }
  function retry(run) {
    const q = run.round;
    if (!q || q.phase !== "failed") return false;
    run.retries++;
    q.attempts++;
    q.hearts = 3;
    q.selected = [];
    q.found = [];
    q.entry = [];
    q.previewLeft = q.p.preview;
    q.inputLeft = q.p.limit;
    q.phase = q.p.preview ? "preview" : "input";
    run.phase = "playing";
    return true;
  }
  // Misses and time survive retries. The same puzzle is retained.
  function miss(run) {
    const q = run.round;
    if (!q || q.phase !== "input") return false;
    run.wrong++;
    run.combo = 0;
    q.misses++;
    q.hearts--;
    if (q.hearts <= 0) q.phase = "failed";
    return true;
  }
  function tick(run, ms) {
    const q = run.round;
    if (
      run.phase !== "playing" ||
      !q ||
      !["preview", "input", "assist"].includes(q.phase)
    )
      return;
    run.elapsed += ms;
    q.elapsed += ms;
    if (q.phase === "preview" || q.phase === "assist") {
      q.previewLeft = Math.max(0, q.previewLeft - ms);
      if (q.previewLeft === 0) q.phase = "input";
    } else {
      q.inputLeft = Math.max(0, q.inputLeft - ms);
      if (q.inputLeft === 0) {
        run.wrong++;
        q.misses++;
        q.hearts = 0;
        run.combo = 0;
        q.phase = "failed";
      }
    }
  }
  function roundPoints(run) {
    const q = run.round,
      perfect = q.misses === 0 && q.attempts === 0;
    const speed =
      q.attempts === 0 ? Math.floor((50 * q.inputLeft) / q.p.limit) : 0;
    return Math.max(
      0,
      100 +
        run.level * 20 +
        (perfect ? 30 : 0) +
        Math.min(run.combo, 5) * 5 +
        speed -
        q.misses * 20 -
        q.attempts * 40,
    );
  }
  function settle(profile, run) {
    const q = run.round;
    if (!q || q.settled) return null;
    q.settled = true;
    q.phase = "won";
    run.phase = "round-result";
    const perfect = q.misses === 0 && q.attempts === 0;
    run.combo = perfect ? run.combo + 1 : 0;
    run.maxCombo = Math.max(run.maxCombo, run.combo);
    const points = roundPoints(run),
      coins =
        run.mode === "practice"
          ? 4 + (perfect ? 2 : 0)
          : 10 + (perfect ? 4 : 0);
    run.score += points;
    run.earned += coins;
    profile.coins += coins;
    profile.roundsWon++;
    if (perfect) profile.perfects++;
    const result = {
      stage: run.stage,
      level: run.level,
      points,
      coins,
      perfect,
      misses: q.misses,
      retries: q.attempts,
      time: q.elapsed,
    };
    run.results.push(result);
    if (run.level === 4 && !profile.completed.includes(run.stage))
      profile.completed.push(run.stage);
    return result;
  }
  function advance(run) {
    if (run.phase !== "round-result") return false;
    if (run.level < 4) run.level++;
    else if (run.mode === "challenge" && run.stage < 4) {
      run.stage++;
      run.level = 0;
    } else {
      run.finished = true;
      run.phase = "complete";
      return true;
    }
    run.round = null;
    run.phase = "intro";
    return true;
  }
  function accuracy(run) {
    return run.correct + run.wrong
      ? Math.round((run.correct / (run.correct + run.wrong)) * 100)
      : 0;
  }
  function complete(profile, run) {
    if (!run.finished || run.recorded) return;
    run.recorded = true;
    const record = {
      id: run.id,
      difficulty: run.difficulty,
      score: run.score,
      time: Math.round(run.elapsed),
      accuracy: accuracy(run),
      retries: run.retries,
      maxCombo: run.maxCombo,
      date: new Date().toISOString(),
    };
    if (run.mode === "challenge") {
      const old = profile.best[run.difficulty];
      if (
        !old ||
        record.score > old.score ||
        (record.score === old.score && record.time < old.time)
      )
        profile.best[run.difficulty] = record;
      profile.history = [record, ...profile.history].slice(0, 10);
    }
  }
  function upgrade(profile, i) {
    const b = BUILDINGS[i],
      level = profile.buildings[i];
    if (!b || level >= 3 || profile.coins < b.cost[level]) return false;
    profile.coins -= b.cost[level];
    profile.buildings[i]++;
    return true;
  }
  function useAssist(profile, run) {
    const q = run?.round;
    if (
      !q ||
      run.mode !== "practice" ||
      run.phase !== "playing" ||
      q.phase !== "input" ||
      q.assistUsed
    )
      return false;
    const i = BUILDINGS.findIndex((b) => b.skill === run.stage),
      tier = profile.buildings[i];
    if (tier < 1) return false;
    q.assistUsed = true;
    if (run.stage === 0) {
      q.phase = "assist";
      q.previewLeft = 700 + tier * 350;
    }
    if (run.stage === 1 || run.stage === 4)
      q.eliminated = q.p.options.filter((n) => n !== q.p.answer).slice(0, 2);
    if (run.stage === 2) q.inputLeft += 3000 + tier * 2000;
    if (run.stage === 3) {
      q.phase = "preview";
      q.previewLeft = q.p.preview;
      q.entry = [];
    }
    return true;
  }
  const api = {
    STAGES,
    BUILDINGS,
    rng,
    shuffled,
    puzzle,
    newProfile,
    newRun,
    beginRound,
    retry,
    miss,
    tick,
    roundPoints,
    settle,
    advance,
    accuracy,
    complete,
    upgrade,
    useAssist,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GaneshaCore = api;
})(typeof window !== "undefined" ? window : {});
