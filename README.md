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
