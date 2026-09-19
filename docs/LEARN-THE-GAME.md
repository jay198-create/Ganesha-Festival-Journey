# Learn Ganesha's Festival Journey

This guide describes the delivered version 3. The game is a static browser app.
It uses HTML, CSS and JavaScript. It does not need a paid AI API to run.

## 1. What you now have

- Five mini-games, with five rounds each in a challenge run.
- Standard and Expert difficulties, with separate personal records.
- Practice for each skill, randomized separately from the fixed challenge circuit.
- A modak wallet that persists across runs.
- Five festival landmarks, each with three upgrade levels and three placements.
- Three lighting palettes and an unlocked festival celebration.
- Practical abilities unlocked by construction, used only in practice.
- Accuracy, active time, retries, combo, per-trial scores and downloadable results.
- Local save/resume, pause that preserves state, music and sound controls.

The scene uses generated 3D-style artwork layered in a 2D interface. It is not a
real-time WebGL model or a freely orbitable 3D world. Landmarks can be rearranged
between three designed positions with the Move landmark button.

## 2. Five files to understand first

| File                                        | Purpose                                                       | Start here                                     |
| ------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `dist/index.html`                           | Page shell, header, main game container, dialogs, scripts     | Find `id="app"`                                |
| `dist/style.css`                            | Layout, colours, responsive rules, sprite display, animation  | Find `:root`, `.festival-world`, `@media`      |
| `dist/core.js`                              | Puzzle generation, state transitions, points, coins, upgrades | Read `puzzle`, `beginRound`, `settle`          |
| `dist/game.js`                              | Screens, clicks, timers, sound and browser saving             | Read `renderGame`, `onAnswer`, `frame`, `save` |
| `dist/courtyard.png` and `dist/objects.png` | Background and six-object transparent sprite sheet            | See `.sprite` CSS                              |

`tests/core.test.cjs` tests rules. `tests/ui.test.cjs` tests simulated DOM interactions.
`package.json` and its lockfile describe development-only tools. They are not
needed when a player opens the hosted game.

## 3. HTML, CSS and JavaScript in one example

HTML is the structure: a button exists and has a label.

```html
<button data-action="begin">BEGIN ROUND</button>
```

CSS is its appearance: fill, border, font, dimensions and hover/focus states.
JavaScript is its behaviour: the click listener reads `data-action`, starts the
round, saves the state and renders the board. `data-action` connects HTML to JS.

The visible board is rebuilt inside the `app` element. Event delegation means one
click listener on the document can handle new buttons created later.

## 4. The two important data objects

`profile` lasts across runs. It holds coins, building levels and placements,
lighting, cleared trials, mastery achievements, best records, history and the
active run. Think of it as the player's save file.

`profile.active` is one run. It holds its mode, difficulty, puzzle seed, stage,
round, score, correct and wrong inputs, elapsed time, retries, combo and results.
Inside it, `round` holds the current puzzle, hearts, selected tiles, entered
sequence, timers, and whether the reward has already been paid.

A run moves through:

1. `intro`: player reads the objective.
2. `playing`: the current round is active.
3. `paused`: clocks stop and the puzzle is covered.
4. `round-result`: one round has been settled and rewarded.
5. `complete`: the whole run is finished.

The round itself can be in `preview`, `input`, `assist`, `failed` or `won`.
These two layers prevent a menu, pause or repeated click from accidentally paying
a second reward or advancing the wrong round.

## 5. One correct answer, step by step

1. A player taps an answer button.
2. The document click handler calls `onAnswer(action, value)`.
3. It checks that a run exists, is playing and is accepting input.
4. It compares the input with the puzzle's target, answer or next sequence item.
5. A correct input increments `correct`. A mistake calls `C.miss`.
6. Once the puzzle is complete, `C.settle(profile, run)` calculates its result.
7. `settle` checks `settled` first. It will not pay that round twice.
8. Points go to the current run. Modaks go to the permanent wallet.
9. `save()` writes the profile to browser storage.
10. `renderGame()` displays the result. Next round calls `C.advance`.

A key design choice is that the wallet and run score are separate. Practising or
replaying cannot inflate an already completed challenge's score.

## 6. Scoring, explained precisely

Each successful round earns:

```text
max(0,
  100
  + 20 × roundIndex
  + perfectBonus
  + comboBonus
  + speedBonus
  - 20 × totalRoundMistakes
  - 40 × retriesOfThisRound
)
```

- `roundIndex` is 0 to 4, not 1 to 5.
- A perfect round has no mistakes and no retries. Its bonus is 30.
- A perfect round advances the combo; any mistake breaks it.
- Combo bonus is 5 times the current combo, capped at 25.
- Speed bonus is `floor(50 × remainingTime / originalTimeLimit)` on the first
  attempt. A retried round has no speed bonus.
- Timeouts count as one wrong input and one round mistake.
- Accuracy is correct inputs / (correct + wrong inputs), rounded to a percentage.
  This is input accuracy, not percentage of rounds passed.
- Active time includes previews, answering and failed attempts. It excludes
  pauses, instructions and results screens.
- Best record comparison uses score first, then lower active time for a tie.
- Only complete 25-round challenge runs enter Standard/Expert records.
- Practice runs are five rounds in one selected trial and never enter those records.

The challenge circuit uses a fixed seed and difficulty. That creates repeatable
puzzles for this edition. It supports learning and consistent personal comparison;
it is not a claim of cheat-proof or randomized tournament ranking. For a new
contest edition, change the circuit label and seeds together, and version/reset
the associated record keys rather than mixing unlike editions.

## 7. Modaks now do something

| Landmark      | Build / upgrade costs | Practice benefit                          |
| ------------- | --------------------- | ----------------------------------------- |
| Diya grove    | 24, then 48, then 80  | One board peek: 1.05 / 1.4 / 1.75 seconds |
| Rangoli court | 24, then 48, then 80  | Remove two wrong pattern choices          |
| Modak kitchen | 24, then 48, then 80  | Remove two wrong maths choices            |
| Dhol pavilion | 24, then 48, then 80  | Replay the sequence once                  |
| Lotus garden  | 24, then 48, then 80  | Add 5 / 7 / 9 seconds to a hunt           |

Every landmark level changes its visible installation. Level 2 adds another
piece; level 3 adds a third. All landmarks can be moved and the courtyard lighting
can be changed freely. Later tiers of math, pattern and sequence buildings are
visual upgrades; only memory and hunt assists scale numerically.

Each practice ability can be used once per round, not once per retry. Challenge
runs disable all abilities, so purchasing upgrades never buys a challenge score.

Challenge rounds pay 10 modaks, or 14 when perfect. Practice pays 4, or 6 when
perfect. Five one-time mastery rewards add 20, 20, 30, 40 and 60 modaks. Rewards
are not random purchases, and nothing costs real money.

The first set of five buildings costs 120 modaks. All 15 upgrades cost 760.
Finishing all five trials and constructing each building unlocks the celebration.
New runs keep the festival and wallet. There are no daily login penalties.

## 8. How pause and retry work

Pause changes the run phase to `paused`. The animation clock only updates a run
when it is `playing`. The board is covered so the player is not given an extra
visible study period. Resuming returns to the exact puzzle, hearts, selections
and remaining clock. Opening a menu or hiding the browser tab also pauses.

A failed round can be retried with three hearts, but the same puzzle remains and
its mistake/retry counters remain. The attempt's clock is replenished while the
run's total active time continues accumulating. This makes retries useful for
learning without erasing their effect on the result.

No browser-only pause feature can stop external note-taking or screenshots. An
organized prize leaderboard needs a separate trusted verification design.

## 9. Puzzle generation and randomness

`rng(seed)` creates a deterministic pseudo-random generator. The same seed gives
the same number stream. `shuffled` implements Fisher–Yates shuffle.

`puzzle(stage, level, difficulty, seed)` returns plain data:

- Memory: grid size, target indices, preview duration and answer time.
- Maths: an expression, its numeric answer and four distinct options.
- Hunt: object IDs containing exactly one mouse, and a time limit.
- Sequence: ordered symbols, pad count and beat duration.
- Pattern: a motif repeated twice and four choices for the next symbol.

Standard memory progresses from 15 to 30 tiles and 4 to 8 Ganeshas. Expert uses
6 to 10 Ganeshas with shorter reveals. Standard sequence grows from 4 to 8 items;
Expert grows from 5 to 9 with six pads and faster presentation.

## 10. Why the game may be worth replaying

Research by Ryan, Rigby and Przybylski links perceived competence and autonomy to
enjoyment and motivation for future play. We translated that into visible skill
progress, meaningful building choices and intuitive feedback. This is a design
hypothesis for this game, not proof that players will find it addictive.

Concrete implementations: separate difficulty records, immediate feedback,
perfect-round combos, one-time mastery milestones, persistent construction,
practice abilities, fixed challenge circuits to master, and random practice.
There are no payments, loot boxes or streak-loss punishments.

Source: https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf

## 11. Saving, portability and limits

The save is a JSON string in `localStorage` under `ganesha-festival-v3`.
Settings use `ganesha-sound`. Saves are specific to the browser and website
origin. Clearing browsing data removes them. Moving to a new domain does not
transfer them. Private mode or blocked storage may prevent persistent saves.
The old game's unspent modaks and purchased decorations are migrated, but its
unbounded score is deliberately not treated as a new challenge record.

A copied source folder preserves the program and artwork, not every player's
browser save. Keep the ZIP yourself. Personal result export downloads a summary;
it is not a save import/export or an authenticated score certificate.

## 12. Hosting and how long it lasts

The existing public URL is hosted through ChatGPT Sites. The official docs say a
Site is persistent and stays in Sites after the creating chat ends. Your laptop
or chat does not have to remain open for that hosted URL to work.

You do not need to separately buy hosting for the current deployment. However,
Sites is in public beta and plan-specific limits apply. The documentation says
limits can affect keeping a high-usage Site public. I could not verify a fixed
expiry period or a lifetime uptime guarantee. Do not promise either to judges.

Official source checked 19 September 2026:
https://learn.chatgpt.com/docs/sites

For independent control, retain this source and use a static host under your own
account. GitHub Pages can publish HTML, CSS and JavaScript directly from a repo:
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

Example GitHub Pages route (you must own/manage the repository):

1. Create a repository for the game.
2. Upload the CONTENTS of `dist` into its root: index.html, style.css, core.js,
   game.js, courtyard.png and objects.png. Keep their names and paths together.
3. In the repository's Pages settings, choose deployment from the appropriate
   branch and root folder, if that option is available for the account/repository.
4. Wait for publication and use the exact URL GitHub reports.
5. Test it signed out, on laptop and phone. Keep the repo and hosting active.

If you upload the full project instead, configure the publishing directory
appropriately; do not publish the repository root if its index.html is inside dist.
A custom domain is optional. Hosting still depends on the provider, account,
policies and limits. No host should be represented as guaranteed lifelong.

## 13. Sound and artwork

AudioContext creates oscillators and gain envelopes for music and feedback. A
user interaction enables audio to meet browser autoplay rules. The volume slider
changes the gain of future sounds. There are no downloaded music tracks.

The six-object PNG sheet supplies lamps, rangoli, modaks, drums and a lotus basin.
CSS background positioning selects a cell. Transparency lets the artwork sit over
the courtyard. Artwork was generated with OpenAI image generation. It should be
disclosed as AI-generated; this guide does not promise exclusivity or legal clearance.

## 14. Testing honestly

`npm test` runs pure rule tests and DOM integration tests. They check deterministic
puzzles, unique answers, 25-round completion, duplicate reward prevention, retries,
pause state, five assists, purchases, placement, finale, startup and click flows.

The controlled browser preview was blocked by its URL/security policy during this
build. Therefore actual rendered mobile/desktop screenshots, touch behaviour and
end-to-end playback were NOT verified. Simulated DOM tests are not real-browser QA.

Before the contest, complete this short real-device check:

- Open the public URL while signed out on a phone and laptop.
- Verify the title and both artwork files load without clipping.
- Play one complete Standard run and one Expert/practice sample of every trial.
- Pause during a reveal and while answering; compare hearts and time on resume.
- Buy, move and upgrade landmarks; use each practice assist.
- Reach the finale; play again; confirm records and coins remain correct.
- Test sound on/off, volume, keyboard navigation and refresh/resume.
- Check at roughly 360px, 768px and desktop width, plus increased browser zoom.

## 15. A 20-minute learning session for your brother

Minutes 0–4: Play one round in each discipline. Say what the input and output are.
Minutes 4–8: Open index.html and style.css. Change a heading or the --gold colour,
refresh, explain the difference between structure and styling, then restore it.
Minutes 8–13: Read newRun, beginRound, miss and settle in core.js. Explain why a
boolean named settled prevents duplicate rewards.
Minutes 13–17: Follow a button from data-action to onAnswer and renderGame.
Minutes 17–20: Explain localStorage, deterministic seeds, fair scoring and why
local records are not cheat-proof online rankings. Run the tests.

Questions to practise answering in your own words:

- Why are modaks and score separate?
- What changes when the game pauses?
- How do you know the maths options are unique?
- Why are assists limited to practice?
- Where is progress stored? What happens if it is cleared?
- Is this real 3D? Explain the layered 3D-style artwork honestly.
- What did AI help create? What did you test and understand yourself?

Do not claim sole unaided authorship. Confirm the contest's rules on AI tools and
outside-team help, and be ready to explain your actual contribution.
