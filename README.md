# Ganesha's Festival Journey

A complete HTML5 festival adventure with five disciplines, a 25-round challenge,
Standard and Expert records, and a persistent festival workshop.

Version 3.0.1 includes a gameplay scroll-position fix: interactive re-renders keep
the player's current vertical position, while new pages and rounds can still open
at the top intentionally.

## Play locally

Open `dist/index.html` in a modern browser. All game assets are bundled; there are
no runtime API keys, payments, external fonts or mandatory remote libraries.
Browser storage on `file://` varies. For reliable saves use a local HTTP server:

```sh
python -m http.server 8000 --directory dist
```

Then open http://localhost:8000. On Windows, `py -m http.server 8000 --directory dist`
may be the correct command. Keep the command window open while playing locally.
Stop with Ctrl+C. This command is a local server, not public hosting.

## Develop and test (optional)

Install Node.js 22.12+ or a supported newer LTS release, then:

```sh
npm ci
npm run dev
npm test
```

Vite serves the editable `dist` directory. These files are authored source and
production files; do not run a build that empties this directory. No build is
required for static hosting. Development packages are not needed by players.

## Understand the code

Start with `docs/LEARN-THE-GAME.md`. It explains the files, game states, scoring,
modak economy, audio, artwork, testing, hosting, and a practice code walkthrough.

## Public hosting

Upload the CONTENTS of `dist` to a static host, preserving relative file paths.
`index.html` must be at the publishing root. See the guide for GitHub Pages steps.
The portable source package excludes the existing Sites project identity and
credentials. Do not copy another site's hosting identity into a new project.

## Competition

Read `docs/CONTEST-SUBMISSION.md`. Fill in real team details, provide this source,
record the actual game, and confirm organizer permission for AI and outside-team
assistance. The game contains an About & credits screen.

Local challenge records are not anti-cheat-secured online leaderboard entries.
No scores are submitted automatically. A trusted online ranking would require
server-side verification and an organizer-approved integration.

## Version 5 development branch

The `v5-festival-cloud` branch expands the original game into a larger Ganesh Chaturthi festival simulator while preserving the existing browser game.

New systems include:

- Five mini-games with Easy, Medium and Hard progression through 100 levels plus Endless mode
- Modak rewards shared with the main game economy
- 131-idol shop/catalog support
- 120 procedural mandap designs
- 500 decoration combinations
- Puja-item store
- Mantra learning with text, pronunciation and meanings
- 3, 6, 9 and 11-day festival progression
- Daily puja checklist
- Procession and Visarjan finale
- Resume data for active runs, scores, modaks, inventory, festival progress and level progress
- Recovery-key Cloudflare D1 game memory with optional player nickname

### Contest privacy and durable game memory

There are no player accounts. A player may optionally enter a first name or nickname for in-game personalization such as “Welcome, Jayanth”. The game does not request email, phone number, password, roll number, college ID, date of birth, address or payment information.

Cloudflare D1 is retained for recovery-key game-state persistence. If a player supplies a nickname, that nickname is stored with the game save.

Each installation gets a random 256-bit recovery key. The server stores the SHA-256 hash of that key together with structured game progress and the optional nickname. The raw recovery key is not stored in D1.

The synchronized state includes scores, Modaks, active run, level progress, purchased festival items, festival day and other gameplay state. The free-text Mandal/group name is deliberately excluded from server synchronization.

If all browser cookies and site storage are cleared, the browser also loses its copy of the anonymous recovery key. The player can paste the saved recovery key back into the game to restore progress from D1. No account is required.

Automatic restoration after a complete browser wipe without any recovery key would require another persistent identifier such as an account or device fingerprint, which this contest build intentionally avoids.

See `docs/ANONYMOUS-CLOUD-SAVE.md` for setup and testing.

### Large idol artwork

The generated 131-idol PNG library is intentionally stored separately from the public Git repository because the asset pack is very large. The catalog expects `assets/idols/idol_001.png` through `idol_131.png`. For production, these assets can be copied into that directory or served as static assets without collecting player information.

