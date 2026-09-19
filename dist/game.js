/* Browser presentation, input, audio and persistence. The scoring rules live in core.js.
 * This closure keeps every helper away from protected browser globals. */
(() => {
  "use strict";
  const C = window.GaneshaCore,
    $ = (s) => document.querySelector(s),
    app = $("#app"),
    modal = $("#modal");
  const KEY = "ganesha-festival-v3";
  const stageIcons = ["◈", "×", "⌕", "♫", "✥"];
  const tips = [
    "Hold the layout in your mind. Find every Ganesha after the tiles turn.",
    "Count the offerings. Solve the full expression before the timer ends.",
    "Find Mushak among moving festival treasures. Every wrong tap costs a heart.",
    "Watch each illuminated symbol. Recreate the sequence in order.",
    "Find the repeating motif. Choose what belongs in the final space.",
  ];
  let profile = C.newProfile(),
    settings = { music: true, sfx: true, volume: 0.35 },
    view = "home",
    difficulty = "standard",
    selectedBuilding = 0,
    storageOK = true,
    lastFrame = performance.now(),
    lastSave = 0,
    lastTone = -1,
    toastTimer,
    audio = null,
    musicTimer = null;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (
      stored?.version === 3 &&
      stored.buildings?.length === 5 &&
      stored.best &&
      Array.isArray(stored.history)
    ) {
      profile = { ...profile, ...stored };
      profile.coins = Math.max(0, Number(profile.coins) || 0);
      profile.buildings = profile.buildings.map((x) =>
        Math.max(0, Math.min(3, Number(x) || 0)),
      );
    } else {
      const old = JSON.parse(localStorage.getItem("ganesha-journey-v1"));
      if (old) {
        profile.coins = Math.max(0, Number(old.coins) || 0);
        profile.completed = (old.completed || []).filter(
          (x) => Number.isInteger(x) && x >= 0 && x < 5,
        );
        (old.owned || []).forEach((i) => {
          if (i >= 0 && i < 5) profile.buildings[i] = 1;
        });
      }
    }
    const pref = JSON.parse(localStorage.getItem("ganesha-sound"));
    if (pref) settings = { ...settings, ...pref };
    if (profile.active?.phase === "playing") profile.active.phase = "paused";
  } catch {
    storageOK = false;
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      localStorage.setItem("ganesha-sound", JSON.stringify(settings));
    } catch {
      if (storageOK)
        notify(
          "Storage is unavailable. Keep this tab open to retain progress.",
        );
      storageOK = false;
    }
  }
  function esc(value) {
    return String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function sprite(i, cls = "") {
    return `<span aria-hidden="true" class="sprite sprite-${i} ${cls}"></span>`;
  }
  function symbol(i) {
    return i === 0
      ? '<span class="ganesha-token" aria-label="Ganesha" role="img"></span>'
      : i === 1
        ? sprite(0)
        : i === 2
          ? sprite(5)
          : i === 3
            ? sprite(4)
            : i === 4
              ? sprite(1)
              : i === 5
                ? sprite(3)
                : `<span class="emoji-symbol">${["🐭", "🐿️", "🐘"][i - 6] || "🌿"}</span>`;
  }
  const symbolNames = [
    "Ganesha",
    "Diya",
    "Modak",
    "Lotus",
    "Rangoli",
    "Dhol",
    "Mushak",
    "Squirrel",
    "Elephant",
  ];
  function clock(ms) {
    let sec = Math.ceil(ms / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }
  function button(action, text, cls = "primary", attrs = "") {
    return `<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;
  }
  function wallet() {
    return `<div class="wallet">${sprite(5)}<span><b>${profile.coins}</b> <small>MODAKS</small></span></div>`;
  }
  function topbar(label) {
    return `<div class="page-top"><div class="eyebrow">${label}</div>${wallet()}</div>`;
  }
  function show(html, resetScroll = true) {
    const previousScrollTop = window.scrollY;
    app.innerHTML = html;
    app.classList.remove("arrive");
    void app.offsetWidth;
    app.classList.add("arrive");
    document
      .querySelectorAll("header nav button")
      .forEach((b) => b.classList.toggle("active", b.dataset.action === view));
    window.scrollTo({
      top: resetScroll ? 0 : previousScrollTop,
      behavior: "auto",
    });
  }
  function notify(text) {
    $("#toast").textContent = text;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      2800,
    );
  }
  function burst() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $("#particles").innerHTML = Array.from(
      { length: 38 },
      (_, i) =>
        `<i style="--x:${Math.random() * 100}%;--d:${Math.random() * 0.6}s;--c:${["#ffc778", "#57d4be", "#f29abe"][i % 3]}">✦</i>`,
    ).join("");
    setTimeout(() => ($("#particles").innerHTML = ""), 3300);
  }
  function activateAudio() {
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      void audio.resume();
      if (!musicTimer) {
        let step = 0;
        musicTimer = setInterval(() => {
          if (settings.music && !document.hidden) {
            const notes = [
              196, 246.94, 293.66, 392, 293.66, 246.94, 220, 293.66,
            ];
            tone(notes[step++ % 8], 1.2, 0.025);
            if (step % 4 === 0) tone(98, 1.7, 0.025);
          }
        }, 620);
      }
    } catch {}
  }
  function tone(hz, dur = 0.25, gain = 0.14, delay = 0, type = "sine") {
    if (!audio || audio.state !== "running") return;
    const osc = audio.createOscillator(),
      amp = audio.createGain(),
      t = audio.currentTime + delay;
    osc.type = type;
    osc.frequency.value = hz;
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(gain * settings.volume, t + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  function sound(name) {
    if (!settings.sfx) return;
    if (name === "wrong") {
      tone(160, 0.2, 0.12, 0, "triangle");
      return;
    }
    if (name === "win") {
      [392, 494, 587, 784].forEach((n, i) => tone(n, 0.45, 0.12, i * 0.1));
      return;
    }
    tone(660, 0.16);
    tone(990, 0.2, 0.07, 0.07);
  }
  function pause() {
    const r = profile.active;
    if (r?.phase === "playing") {
      r.phase = "paused";
      save();
      if (view === "game") renderGame();
    }
  }
  function navigate(next) {
    pause();
    view = next;
    if (next === "home") home();
    else if (next === "trail") trail();
    else if (next === "workshop") workshop();
    else if (next === "records") records();
  }
  function home() {
    const active = profile.active && !profile.active.finished;
    show(
      `<section class="home-stage"><img class="home-backdrop" src="courtyard.png" alt="Ganesha in a moonlit temple courtyard"><div class="home-shade"></div><div class="home-content"><div class="eyebrow"><span class="live-dot"></span> THE FESTIVAL AWAITS</div><h1>GANESHA'S<br><em>FESTIVAL</em><br>JOURNEY</h1><p class="home-subtitle">A Festival of Memory, Maths & Fun</p><p class="home-description">Master the trials. Earn your offerings.<br>Bring an entire festival to life.</p><div class="home-actions">${button(active ? "continue" : "trail", active ? "CONTINUE YOUR JOURNEY <span>↗</span>" : "ENTER THE FESTIVAL <span>↗</span>")}${button("workshop", "MY FESTIVAL", "secondary")}</div><div class="home-features"><span>05 SKILL TRIALS</span><span>25 ROUNDS</span><span>YOUR OWN FESTIVAL</span></div></div><div class="home-corner">${wallet()}<span>Your next creation starts here.</span></div><div class="home-caption"><span>CHAPTER 01</span><strong>The Courtyard of Beginnings</strong></div></section><section class="home-lower"><div><span class="eyebrow">A LITTLE SKILL. A LASTING CREATION.</span><h2>Every modak has a purpose.</h2></div><p>Build, upgrade and arrange five festival landmarks.<br>Each one unlocks a new way to train your mind.</p>${button("help", "HOW TO PLAY ↗", "text-button")}</section>${!storageOK ? '<p class="notice">Saving is unavailable in this browser. Progress lasts while this tab stays open.</p>' : ""}`,
    );
  }
  function modeSelector() {
    return `<div class="difficulty" role="group" aria-label="Challenge difficulty">${["standard", "expert"].map((d) => button("difficulty", d === "standard" ? "Standard" : "Expert", "mode " + (difficulty === d ? "selected" : ""), `data-value="${d}" aria-pressed="${difficulty === d}"`)).join("")}</div>`;
  }
  function trail() {
    const a = profile.active,
      record = profile.best[difficulty];
    show(
      `${topbar("THE FESTIVAL CIRCUIT")}<div class="title-row"><div><h1>Sharpen your mind.<br><em>Build your celebration.</em></h1><p>Five disciplines. One complete run. A personal best worth beating.</p></div>${modeSelector()}</div><div class="journey-layout"><section class="trial-list">${C.STAGES.map((name, i) => `<article class="trial ${profile.completed.includes(i) ? "mastered" : ""}"><span class="trial-index">0${i + 1}</span><span class="trial-glyph">${stageIcons[i]}</span><div><h3>${name}</h3><p>${["Spatial focus", "Mental arithmetic", "Visual discovery", "Sequential recall", "Pattern logic"][i]}</p></div><span class="trial-status">${profile.completed.includes(i) ? "✓ CLEARED" : "5 ROUNDS"}</span>${button("practice", "Practice ↗", "small-button", `data-stage="${i}"`)}</article>`).join("")}<div class="circuit-note">Challenge order: Memory → Maths → Hunt → Sequence → Pattern → Festival. ${button("records", "View personal records ↗", "text-button")}</div></section><aside class="run-card"><span class="eyebrow">${difficulty.toUpperCase()} · CIRCUIT 01</span><h2>${difficulty === "expert" ? "Meet your next limit." : "Make every move count."}</h2><p>${difficulty === "expert" ? "Denser grids. Faster reveals. Longer sequences. Mixed maths." : "A steady climb in speed, memory and logic. Three hearts for each attempt."}</p><div class="run-summary"><div><b>25</b><small>ROUNDS</small></div><div><b>${record ? record.score.toLocaleString() : "—"}</b><small>PERSONAL BEST</small></div></div>${button(a && !a.finished ? "continue" : "start", a && !a.finished ? "RESUME ACTIVE RUN →" : "START CHALLENGE →", "primary full")}<p class="fine">Fixed puzzles for this edition. No purchased assists in challenge runs. Records are saved on this device.</p>${a && !a.finished ? button("replace", "Start a different run", "text-button") : ""}<div class="reward-strip">${sprite(5)}<span><b>10–14 modaks per round</b><small>Keep your earnings. Grow your festival.</small></span></div></aside></div><section class="mastery"><div><span class="eyebrow">MASTERY REWARDS</span><h2>Something to work towards.</h2></div><div class="mission-grid">${missionCards()}</div></section>`,
    );
  }
  const missions = [
    ["focus", "Clear 5 perfect rounds", 20, (p) => p.perfects >= 5],
    ["journey", "Clear 10 rounds", 20, (p) => p.roundsWon >= 10],
    [
      "builder",
      "Build all 5 landmarks",
      30,
      (p) => p.buildings.every((x) => x > 0),
    ],
    ["circuit", "Finish a challenge", 40, (p) => p.history.length > 0],
    ["expert", "Finish an Expert challenge", 60, (p) => !!p.best.expert],
  ];
  function missionCards() {
    return missions
      .map(
        ([id, title, reward, check]) =>
          `<div class="mission ${profile.achievements.includes(id) ? "claimed" : ""}"><span>${profile.achievements.includes(id) ? "✓" : "◇"}</span><div><strong>${title}</strong><small>${profile.achievements.includes(id) ? "Reward collected" : `+${reward} modaks`}</small></div></div>`,
      )
      .join("");
  }
  function awardMissions() {
    let reward = 0;
    for (const [id, , coins, check] of missions)
      if (!profile.achievements.includes(id) && check(profile)) {
        profile.achievements.push(id);
        profile.coins += coins;
        reward += coins;
      }
    if (reward) notify(`Mastery reward unlocked: +${reward} modaks`);
  }
  function start(mode = "challenge", stage = 0) {
    if (profile.active && !profile.active.finished) {
      confirmReplacement(mode, stage);
      return;
    }
    createRun(mode, stage);
  }
  function createRun(mode, stage) {
    profile.active = C.newRun(
      mode,
      difficulty,
      stage,
      mode === "challenge"
        ? 71231 + (difficulty === "expert" ? 10000 : 0)
        : Math.floor(Math.random() * 1e8),
    );
    save();
    view = "game";
    renderGame(true);
  }
  function confirmReplacement(mode = "challenge", stage = 0) {
    pause();
    dialog(
      `<span class="eyebrow">A FRESH ATTEMPT</span><h2>Start a new run?</h2><p>This ends your unfinished run. Your earned modaks, buildings and completed records stay.</p>${button("confirm-start", "START NEW RUN", "primary", `data-mode="${mode}" data-stage="${stage}"`)}${button("close", "Keep current run", "text-button")}`,
    );
  }
  function continueRun() {
    if (!profile.active) return navigate("trail");
    view = "game";
    renderGame(true);
  }
  function gameHeader(r) {
    return `<div class="play-top"><button class="text-button" data-action="trail">← Journey</button><span class="eyebrow">${r.mode === "practice" ? "PRACTICE" : r.difficulty.toUpperCase() + " CHALLENGE"}</span>${button("pause", "Ⅱ", "icon-button", 'aria-label="Pause"')}</div><div class="game-hud"><div><small>RUN SCORE</small><strong id="score">${r.score.toLocaleString()}</strong></div><div><small>COMBO</small><strong id="combo">${r.combo} <span class="gold">✦</span></strong></div><div><small>HEARTS</small><strong id="hearts">${"♥".repeat(r.round?.hearts ?? 3)}${"♡".repeat(3 - (r.round?.hearts ?? 3))}</strong></div><div><small>TIME</small><strong id="timer">${clock(r.round?.inputLeft || 0)}</strong></div></div>`;
  }
  function renderGame(resetScroll = false) {
    const r = profile.active;
    if (!r) return navigate("trail");
    if (r.finished) return results();
    const q = r.round;
    let content = "";
    if (r.phase === "intro") {
      content = `<div class="intro"><div class="trial-medallion">${stageIcons[r.stage]}</div><span class="eyebrow">TRIAL 0${r.stage + 1} · ROUND ${r.level + 1} OF 5</span><h1>${C.STAGES[r.stage]}</h1><p>${tips[r.stage]}</p><p class="fine">${r.mode === "challenge" ? "Three hearts per attempt. Retries and mistakes reduce this round’s score." : "Practice earns modaks. Your unlocked landmark assists are available here."}</p>${button("begin", "BEGIN ROUND →")}</div>`;
    } else if (r.phase === "round-result") {
      const last = r.results.at(-1);
      content = `<div class="round-result"><div class="result-seal">${last.perfect ? "✦" : "✓"}</div><span class="eyebrow">${last.perfect ? "PERFECT ROUND" : "ROUND COMPLETE"}</span><h1>${last.perfect ? "Precision, rewarded." : "One step closer."}</h1><div class="result-numbers"><div><b>+${last.points}</b><small>RUN POINTS</small></div><div><b>+${last.coins}</b><small>MODAKS</small></div><div><b>${r.combo}</b><small>PERFECT COMBO</small></div></div>${button("next", (r.level === 4 && r.stage === 4) || (r.mode === "practice" && r.level === 4) ? "SEE RESULTS →" : "NEXT ROUND →")}${button("workshop", "Spend modaks in your festival", "text-button")}<p class="fine">${last.misses} mistakes · ${last.retries} retries · ${clock(last.time)} active time</p></div>`;
    } else if (q?.phase === "failed") {
      content = `<div class="intro"><div class="trial-medallion">↻</div><span class="eyebrow">FOCUS. RESET. TRY AGAIN.</span><h1>${q.inputLeft === 0 ? "Time slipped away." : "A new attempt."}</h1><p>The same puzzle. Three fresh hearts.<br>Your mistakes and time remain part of this run.</p>${button("retry", "RETRY ROUND →")}<p class="fine">Retry penalty: 40 points. No modaks are lost.</p></div>`;
    } else {
      content = `<div class="board-title"><div><span class="eyebrow">TRIAL 0${r.stage + 1} / 05 · ROUND ${r.level + 1} / 05</span><h2>${C.STAGES[r.stage]}</h2></div><span class="round-badge">${r.difficulty === "expert" ? "EXPERT" : "STANDARD"}</span></div><p class="instruction" id="instruction">${instruction(r)}</p><div class="time-track"><i id="time-fill"></i></div>${boardMarkup(r)}${assistMarkup(r)}`;
    }
    show(
      `<section class="game-wrap">${gameHeader(r)}<div class="round-progress">${Array.from({ length: 5 }, (_, i) => `<i class="${i <= r.level ? "filled" : ""}"></i>`).join("")}</div><div class="play-arena ${r.phase === "paused" ? "is-paused" : ""}">${content}${r.phase === "paused" ? `<div class="pause-cover"><span class="eyebrow">PAUSED</span><h2>Your place is saved.</h2><p>The puzzle, hearts and clock are unchanged.</p>${button("resume", "RESUME →")}</div>` : ""}</div><p class="game-bottom">${r.mode === "challenge" ? "CIRCUIT 01 · Assists disabled · Every completed round counts once" : "PRACTICE · No challenge record · Landmark abilities enabled"}</p></section>`,
      resetScroll,
    );
    lastFrame = performance.now();
    updateLive();
  }
  function instruction(r) {
    const q = r.round;
    return r.stage === 0
      ? q.phase === "preview" || q.phase === "assist"
        ? `Memorize ${q.p.target.length} Ganeshas. The board will hide.`
        : `Find the Ganeshas. ${q.found.length} / ${q.p.target.length} discovered.`
      : r.stage === 3
        ? q.phase === "preview"
          ? "Watch the illuminated symbols. Keep their order."
          : `Recreate the sequence. ${q.entry.length} / ${q.p.sequence.length}`
        : r.stage === 2
          ? "Find Mushak, Ganesha’s mouse. Look closely."
          : r.stage === 1
            ? "How many modaks? Solve the complete expression."
            : "Find the repeating motif. What comes next?";
  }
  function boardMarkup(r) {
    const q = r.round,
      p = q.p,
      disabled = q.phase !== "input";
    if (r.stage === 0)
      return `<div class="memory-board" style="--cols:${p.count >= 25 ? 6 : 5}">${Array.from(
        { length: p.count },
        (_, i) => {
          const show =
              (["preview", "assist"].includes(q.phase) &&
                p.target.includes(i)) ||
              q.found.includes(i),
            wrong = q.selected.includes(i) && !p.target.includes(i);
          return `<button class="memory-tile ${q.found.includes(i) ? "correct" : ""} ${wrong ? "incorrect" : ""}" data-action="tile" data-value="${i}" aria-label="Tile ${i + 1}${q.found.includes(i) ? ", found" : ""}" ${disabled || q.selected.includes(i) ? "disabled" : ""}>${show ? symbol(0) : '<span class="tile-rune">✧</span>'}</button>`;
        },
      ).join("")}</div>`;
    if (r.stage === 1)
      return `<div class="math-scene">${sprite(2)}<div class="equation">${p.question}<small>${p.a} modaks per plate × ${p.b} plates${p.operation === "add" ? ` + ${p.c} extra` : p.operation === "subtract" ? ` − ${p.c} served` : ""}</small></div></div>${options(r, false)}`;
    if (r.stage === 2)
      return `<div class="hunt-field" style="--cols:6">${p.objects.map((s, i) => `<button class="hunt-item ${q.selected.includes(i) ? "missed" : ""}" style="--delay:-${(i % 9) * 0.3}s" data-action="hunt" data-value="${i}" aria-label="${symbolNames[s]}" ${q.selected.includes(i) ? "disabled" : ""}>${symbol(s)}</button>`).join("")}</div>`;
    if (r.stage === 3)
      return `<div class="sequence-ribbon">${p.sequence.map((s, i) => `<div class="sequence-slot ${i < q.entry.length ? "entered" : ""}" id="sequence-${i}">${i < q.entry.length ? symbol(s) : "<span>·</span>"}</div>`).join("")}</div><div class="answer-grid pads" style="--pads:${p.pads}">${Array.from({ length: p.pads }, (_, i) => `<button class="answer symbol-answer" data-action="sequence" data-value="${i}" aria-label="${symbolNames[i]}" ${disabled ? "disabled" : ""}>${symbol(i)}<small>${i + 1}</small></button>`).join("")}</div><p class="fine center">Tap symbols or use keys 1–${p.pads}.</p>`;
    return `<div class="pattern-board">${p.pattern.map((s) => `<div class="pattern-tile">${symbol(s)}</div>`).join("")}<div class="pattern-tile unknown">?</div></div>${options(r, true)}`;
  }
  function options(r, visual) {
    return `<div class="answer-grid">${r.round.p.options.map((n, i) => `<button class="answer ${visual ? "symbol-answer" : ""}" data-action="answer" data-value="${n}" aria-label="${visual ? symbolNames[n] : n}" ${r.round.selected.includes(n) || r.round.eliminated.includes(n) ? "disabled" : ""}>${visual ? symbol(n) : n}<small>${i + 1}</small></button>`).join("")}</div>`;
  }
  function assistMarkup(r) {
    if (r.mode !== "practice") return "";
    const index = C.BUILDINGS.findIndex((b) => b.skill === r.stage),
      b = C.BUILDINGS[index],
      tier = profile.buildings[index];
    return `<div class="assist-bar"><span>${tier ? b.ability + " · Level " + tier : "Build the " + b.name.toLowerCase() + " to unlock an assist."}</span>${button("assist", r.round.assistUsed ? "USED" : tier ? "USE ABILITY" : "LOCKED", "small-button", tier && !r.round.assistUsed && r.round.phase === "input" ? "" : "disabled")}</div>`;
  }
  function updateLive() {
    const r = profile.active,
      q = r?.round;
    if (view !== "game" || !q || r.phase !== "playing") return;
    const t = $("#timer");
    if (t)
      t.textContent = clock(
        q.phase === "preview" || q.phase === "assist"
          ? q.previewLeft
          : q.inputLeft,
      );
    const fill = $("#time-fill");
    if (fill)
      fill.style.width =
        Math.min(
          100,
          (q.phase === "input"
            ? q.inputLeft / q.p.limit
            : q.previewLeft / Math.max(q.p.preview, 1)) * 100,
        ) + "%";
    if (r.stage === 3 && q.phase === "preview") {
      const elapsed = q.p.preview - q.previewLeft,
        index = Math.floor((elapsed - 350) / q.p.beat),
        lit =
          elapsed >= 350 &&
          index < q.p.sequence.length &&
          (elapsed - 350) % q.p.beat < q.p.beat * 0.73;
      document.querySelectorAll(".sequence-slot").forEach((el, i) => {
        const on = lit && index === i;
        el.classList.toggle("lit", on);
        el.innerHTML = on ? symbol(q.p.sequence[i]) : "<span>·</span>";
      });
      if (lit && index !== lastTone) {
        lastTone = index;
        if (settings.sfx)
          tone([392, 440, 494, 587, 659, 784][q.p.sequence[index]], 0.35, 0.12);
      }
    }
  }
  function onAnswer(action, value) {
    const r = profile.active,
      q = r?.round;
    if (view !== "game" || r?.phase !== "playing" || q?.phase !== "input")
      return;
    let correct = false,
      complete = false;
    if (action === "tile") {
      if (q.selected.includes(value)) return;
      q.selected.push(value);
      correct = q.p.target.includes(value);
      if (correct) q.found.push(value);
      complete = q.found.length === q.p.target.length;
    } else if (action === "sequence") {
      correct = value === q.p.sequence[q.entry.length];
      if (correct) q.entry.push(value);
      else q.entry = [];
      complete = q.entry.length === q.p.sequence.length;
    } else {
      if (q.selected.includes(value) || q.eliminated.includes(value)) return;
      q.selected.push(value);
      correct = value === q.p.answer;
      complete = correct;
    }
    if (correct) {
      r.correct++;
      sound("ok");
      if (complete) {
        const won = C.settle(profile, r);
        if (won) {
          awardMissions();
          sound("win");
          burst();
        }
      }
    } else {
      C.miss(r);
      sound("wrong");
      notify(
        q.hearts > 0
          ? "Not quite. Stay focused."
          : "Round ended. You can retry.",
      );
    }
    save();
    renderGame();
  }
  function next() {
    const r = profile.active;
    if (!r) return;
    C.advance(r);
    if (r.finished) {
      C.complete(profile, r);
      awardMissions();
    }
    save();
    renderGame(true);
  }
  function results() {
    const r = profile.active;
    if (!r) return navigate("records");
    view = "results";
    const record = profile.best[r.difficulty],
      isBest = r.mode === "challenge" && record?.id === r.id,
      grade =
        r.score >= 5500
          ? "S"
          : r.score >= 4500
            ? "A"
            : r.score >= 3200
              ? "B"
              : "C";
    show(
      `${topbar("YOUR RUN, COMPLETE")}<section class="results-page"><span class="eyebrow">${r.mode === "practice" ? "PRACTICE COMPLETE" : isBest ? "NEW PERSONAL BEST" : r.difficulty.toUpperCase() + " CHALLENGE COMPLETE"}</span><h1>${r.mode === "practice" ? "Sharper than before." : "A journey worth celebrating."}</h1><div class="result-hero"><div class="grade">${r.mode === "practice" ? "✓" : grade}</div><div><strong>${r.score.toLocaleString()}</strong><small>${r.mode === "practice" ? "PRACTICE POINTS · NOT RANKED" : "FINAL RUN SCORE · CIRCUIT 01"}</small></div></div><div class="stat-grid"><div><b>${C.accuracy(r)}%</b><small>ACCURACY</small></div><div><b>${clock(r.elapsed)}</b><small>ACTIVE TIME</small></div><div><b>${r.retries}</b><small>RETRIES</small></div><div><b>${r.maxCombo}</b><small>BEST COMBO</small></div><div><b>+${r.earned}</b><small>MODAKS EARNED</small></div></div><div class="actions">${button("workshop", "BUILD YOUR FESTIVAL →")}${button("again", "PLAY AGAIN", "secondary")}${button("export-result", "Download result", "text-button")}</div><div class="result-breakdown">${C.STAGES.map(
        (name, i) => {
          const rows = r.results.filter((x) => x.stage === i);
          return rows.length
            ? `<div><span>${name}</span><b>${rows.reduce((a, x) => a + x.points, 0)}</b><small>${rows.filter((x) => x.perfect).length}/5 perfect</small></div>`
            : "";
        },
      ).join(
        "",
      )}</div><p class="fine">Personal records are stored on this browser. They are not server-verified leaderboard submissions.</p></section>`,
    );
  }
  const positions = [
    [
      [17, 56],
      [10, 64],
      [22, 68],
    ],
    [
      [49, 73],
      [46, 67],
      [55, 76],
    ],
    [
      [66, 61],
      [74, 67],
      [61, 72],
    ],
    [
      [26, 74],
      [14, 76],
      [31, 66],
    ],
    [
      [80, 76],
      [85, 59],
      [73, 77],
    ],
  ];
  function worldMarkup(interactive = true) {
    return `<div class="festival-world palette-${profile.palette}" id="festival-world"><img src="courtyard.png" class="courtyard" alt="Your festival courtyard and Ganesha mandap"><div class="world-mist"></div><div class="world-sparkles" aria-hidden="true">✦ <span>✧</span> ✦</div>${C.BUILDINGS.map(
      (b, i) => {
        const tier = profile.buildings[i],
          [x, y] = positions[i][profile.positions[i] || 0];
        return tier
          ? `<button class="landmark tier-${tier} ${selectedBuilding === i && interactive ? "chosen" : ""}" style="left:${x}%;top:${y}%" data-action="select-building" data-value="${i}" aria-label="${b.name}, level ${tier}" ${interactive ? "" : "disabled"}>${sprite(b.sprite)}${tier > 1 ? `<span class="landmark-satellite">${sprite(b.sprite)}</span>` : ""}${tier > 2 ? `<span class="landmark-satellite second">${sprite(b.sprite)}</span>` : ""}<span class="landmark-label">${b.name}<b>${"◆".repeat(tier)}</b></span></button>`
          : "";
      },
    ).join(
      "",
    )}<span class="world-title">YOUR FESTIVAL <b>${profile.buildings.reduce((a, b) => a + b, 0)} / 15 UPGRADES</b></span></div>`;
  }
  function workshop() {
    const b = C.BUILDINGS[selectedBuilding],
      tier = profile.buildings[selectedBuilding],
      level = profile.buildings.reduce((a, x) => a + x, 0),
      ready =
        profile.completed.length === 5 && profile.buildings.every((x) => x > 0);
    show(
      `${topbar("THE FESTIVAL WORKSHOP")}<div class="title-row"><div><h1>Make this place <em>yours.</em></h1><p>Build a landmark. Unlock an ability. Watch your festival grow.</p></div><span class="festival-level">${level < 5 ? "FOUNDATIONS" : level < 10 ? "FESTIVAL MAKER" : level < 15 ? "GRAND CELEBRATION" : "MASTER BUILDER"}</span></div><div class="workshop-layout"><section>${worldMarkup()}<div class="world-controls"><span>LIGHTING</span>${["amber", "moon", "rose"].map((p) => button("palette", p[0].toUpperCase() + p.slice(1), "palette-button " + (profile.palette === p ? "selected" : ""), `data-value="${p}" aria-pressed="${profile.palette === p}"`)).join("")}${button("celebrate", "LIGHT THE FESTIVAL ✦", "small-button", ready ? "" : "disabled")}</div><p class="fine">Select a landmark to upgrade or move it. The finale unlocks after all five trials and five landmarks.</p></section><aside class="build-panel"><div class="build-tabs" role="group" aria-label="Festival landmarks">${C.BUILDINGS.map((x, i) => `<button data-action="select-building" data-value="${i}" class="${i === selectedBuilding ? "selected" : ""}" aria-label="${x.name}" aria-pressed="${i === selectedBuilding}">${sprite(x.sprite)}<span>${profile.buildings[i] ? "◆".repeat(profile.buildings[i]) : "+"}</span></button>`).join("")}</div><div class="build-preview">${sprite(b.sprite)}</div><span class="eyebrow">${tier ? "LEVEL " + tier + " / 3" : "NEW LANDMARK"}</span><h2>${b.name}</h2><p>${b.detail}</p><div class="unlock-note"><span>✧</span><div><b>${tier ? "ABILITY UNLOCKED" : "BUILD TO UNLOCK"}: ${b.ability}</b><small>Practice only · Once per round · No score advantage in challenges</small></div></div>${tier < 3 ? button("upgrade", `${tier ? "UPGRADE" : "BUILD"} · ${b.cost[tier]} MODAKS`, "primary full", profile.coins >= b.cost[tier] ? "" : "disabled") : button("practice", "TRY YOUR ABILITY →", "primary full", `data-stage="${b.skill}"`)}${tier ? button("move", "Move landmark ↔", "secondary full") : ""}<p class="fine">${tier < 3 ? ["Build the first landmark and unlock its practice ability.", "Level 2 adds a second piece; memory/time assists become stronger.", "Level 3 creates a full installation; memory/time assists reach full strength."][tier] : "Fully upgraded. Keep building the rest of your festival."}</p>${profile.coins < (b.cost[tier] || 0) ? button("trail", "Earn more modaks →", "text-button") : ""}</aside></div><div class="mission-grid">${missionCards()}</div>`,
    );
  }
  function celebrate() {
    if (profile.completed.length < 5 || !profile.buildings.every((x) => x > 0))
      return;
    profile.festivalComplete = true;
    save();
    view = "celebration";
    show(
      `<section class="celebration"><span class="eyebrow">THE GRAND GANESHA FESTIVAL</span><h1>You built the celebration.</h1><p>Every trial, every offering, every creation brought you here.</p>${worldMarkup(false)}<h2>Ganpati Bappa Morya</h2><div class="actions">${button("fireworks", "CELEBRATE ✦")}${button("workshop", "KEEP BUILDING", "secondary")}${button("trail", "CHASE A NEW BEST →", "text-button")}</div><p class="fine">Your festival stays with you. New runs keep your landmarks and modaks.</p></section>`,
    );
    burst();
    sound("win");
  }
  function records() {
    show(
      `${topbar("YOUR PERSONAL RECORDS")}<h1>A better run <em>starts here.</em></h1><p>Standard and Expert records stay separate. Same circuit. A sharper you.</p><div class="record-cards">${[
        "standard",
        "expert",
      ]
        .map((d) => {
          const r = profile.best[d];
          return `<article><span class="eyebrow">${d.toUpperCase()}</span><strong>${r ? r.score.toLocaleString() : "—"}</strong><p>${r ? `${r.accuracy}% accuracy · ${clock(r.time)} · ${r.retries} retries` : "Complete a challenge to set your first record."}</p>${button("record-play", "PLAY " + d.toUpperCase() + " →", "secondary", `data-value="${d}"`)}</article>`;
        })
        .join(
          "",
        )}</div><h2>Recent complete runs</h2>${profile.history.length ? `<div class="table-scroll"><table><thead><tr><th>Difficulty</th><th>Score</th><th>Accuracy</th><th>Time</th><th>Retries</th></tr></thead><tbody>${profile.history.map((r) => `<tr><td>${esc(r.difficulty)}</td><td>${r.score}</td><td>${r.accuracy}%</td><td>${clock(r.time)}</td><td>${r.retries}</td></tr>`).join("")}</tbody></table></div>` : "<p>No complete challenge runs yet. Practice does not enter these records.</p>"}<p class="fine">Stored on this device. No account, campus details or personal information required.</p>`,
    );
  }
  function dialog(html) {
    $("#dialog-body").innerHTML = html;
    if (!modal.open) modal.showModal();
  }
  function openHelp() {
    pause();
    dialog(
      `<span class="eyebrow">YOUR FESTIVAL JOURNEY</span><h2>Play. Master. Create.</h2><ol><li><b>Choose your challenge.</b> Standard or Expert. Five rounds in each of five trials.</li><li><b>Play for precision.</b> Fast answers, clean rounds and perfect combos earn points. Mistakes and retries reduce them.</li><li><b>Spend modaks.</b> Build five landmarks, upgrade each to level 3 and arrange your courtyard.</li><li><b>Train with abilities.</b> Landmarks unlock useful practice assists. Challenge runs never use them.</li><li><b>Celebrate.</b> Clear all five trials and build every landmark to unlock the Grand Festival.</li></ol><p class="fine">Mouse, touch or keyboard. Tab selects controls; Enter/Space activates. Use keys 1–6 for answer pads. Escape pauses. Pause hides the puzzle and freezes the clock without resetting anything.</p>`,
    );
  }
  function openSettings() {
    pause();
    dialog(
      `<span class="eyebrow">YOUR SOUNDSTAGE</span><h2>Sound settings</h2><label class="setting">Ambient melody<input type="checkbox" id="music" ${settings.music ? "checked" : ""}></label><label class="setting">Gameplay sounds<input type="checkbox" id="sfx" ${settings.sfx ? "checked" : ""}></label><label class="setting">Volume<input type="range" id="volume" min="0" max="1" step=".05" value="${settings.volume}"></label><p class="fine">Original synthesized chimes and melody. Your device’s reduced-motion preference is respected.</p>`,
    );
  }
  function downloadResult() {
    const r = profile.active;
    if (!r?.finished) return;
    const data = {
      game: "Ganesha’s Festival Journey",
      edition: "Circuit 01",
      mode: r.mode,
      difficulty: r.difficulty,
      score: r.score,
      accuracy: C.accuracy(r),
      activeTimeMs: Math.round(r.elapsed),
      retries: r.retries,
      bestCombo: r.maxCombo,
      verification: "Local, not server verified",
      rounds: r.results,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ganesha-run-result.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // One delegated listener handles clicks from dynamically rendered screens.
  document.addEventListener("click", (event) => {
    const b = event.target.closest("button[data-action]");
    if (!b || b.disabled) return;
    activateAudio();
    const action = b.dataset.action,
      value = Number(b.dataset.value),
      r = profile.active;
    if (["home", "trail", "workshop", "records"].includes(action))
      return navigate(action);
    if (action === "help") return openHelp();
    if (action === "settings") return openSettings();
    if (action === "close") return modal.close();
    if (action === "difficulty") {
      difficulty = b.dataset.value;
      return trail();
    }
    if (action === "start") return start();
    if (action === "practice")
      return start("practice", Number(b.dataset.stage));
    if (action === "continue") return continueRun();
    if (action === "replace") return confirmReplacement();
    if (action === "confirm-start") {
      modal.close();
      return createRun(b.dataset.mode, Number(b.dataset.stage));
    }
    if (action === "begin" && r?.phase === "intro") {
      C.beginRound(r);
      lastTone = -1;
      save();
      return renderGame();
    }
    if (action === "retry" && r) {
      C.retry(r);
      lastTone = -1;
      save();
      return renderGame();
    }
    if (action === "next") return next();
    if (action === "pause") return pause();
    if (action === "resume" && r?.phase === "paused") {
      r.phase = "playing";
      lastTone = -1;
      save();
      return renderGame();
    }
    if (["tile", "hunt", "sequence", "answer"].includes(action))
      return onAnswer(action, value);
    if (action === "assist" && C.useAssist(profile, r)) {
      lastTone = -1;
      sound("ok");
      save();
      return renderGame();
    }
    if (action === "select-building") {
      selectedBuilding = value;
      return navigate("workshop");
    }
    if (action === "upgrade") {
      if (C.upgrade(profile, selectedBuilding)) {
        awardMissions();
        save();
        sound("win");
        burst();
        workshop();
        notify(
          C.BUILDINGS[selectedBuilding].name +
            " upgraded. Your festival is growing!",
        );
      }
      return;
    }
    if (action === "move") {
      profile.positions[selectedBuilding] =
        (profile.positions[selectedBuilding] + 1) % 3;
      save();
      return workshop();
    }
    if (action === "palette") {
      profile.palette = b.dataset.value;
      save();
      return workshop();
    }
    if (action === "celebrate") return celebrate();
    if (action === "fireworks") {
      burst();
      sound("win");
      return;
    }
    if (action === "record-play") {
      difficulty = b.dataset.value;
      return start();
    }
    if (action === "again") {
      const mode = r?.mode || "challenge",
        stage = r?.stage || 0;
      return start(mode, stage);
    }
    if (action === "export-result") return downloadResult();
    if (action === "about") {
      pause();
      dialog(
        '<span class="eyebrow">BUILT FOR THE FESTIVAL</span><h2>Ganesha’s Festival Journey</h2><p>A browser game about memory, logic and building a celebration.</p><p>Artwork: AI-generated with OpenAI image generation. Code: HTML, CSS and JavaScript, developed with AI assistance. Music and effects: original Web Audio synthesis.</p><p class="fine">No accounts, payments, advertising or online score submissions. Progress saves locally when your browser allows storage. Competition entrants should disclose their tools and confirm organizer approval for AI assistance.</p>',
      );
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "music") settings.music = e.target.checked;
    if (e.target.id === "sfx") settings.sfx = e.target.checked;
    save();
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "volume") {
      settings.volume = Number(e.target.value);
      save();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (modal.open || e.target.matches("input,textarea,select")) return;
    if (e.key === "Escape") {
      pause();
      return;
    }
    if (view === "game" && /^[1-6]$/.test(e.key)) {
      const buttons = [...document.querySelectorAll(".answer-grid .answer")],
        b = buttons[Number(e.key) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("pagehide", () => {
    pause();
    save();
  });
  function frame(now) {
    const dt = now - lastFrame;
    lastFrame = now;
    const r = profile.active;
    if (view === "game" && r?.phase === "playing" && !document.hidden) {
      const before = r.round.phase;
      C.tick(r, dt);
      if (before !== r.round.phase) {
        save();
        renderGame();
      } else updateLive();
      if (now - lastSave > 1000) {
        save();
        lastSave = now;
      }
    }
    requestAnimationFrame(frame);
  }
  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(
        document.modelContext.registerTool({
          name: "get_festival_progress",
          description:
            "Read local festival buildings, modaks and best completed challenge scores.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: () => ({
            modaks: profile.coins,
            buildings: C.BUILDINGS.map((b, i) => ({
              name: b.name,
              level: profile.buildings[i],
            })),
            best: profile.best,
          }),
        }),
      ).catch(() => {});
    } catch {}
  }
  save();
  home();
  requestAnimationFrame(frame);
})();
