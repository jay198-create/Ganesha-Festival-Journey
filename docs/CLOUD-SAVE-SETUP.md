# Cloud save setup

Version 5 stores signed-in player progress in Cloudflare D1 instead of relying only on browser storage.

## What is stored

The server save contains:
- Modaks
- Original challenge records and active run
- 100-level / Endless progression for every mini-game and difficulty
- Festival Builder inventory and selections
- Mandap, idol, decoration and puja purchases
- Festival day, daily puja completion, mantra-learning progress
- Procession / Visarjan progress
- Sound settings

Browser storage remains a fast local cache. For signed-in players, the D1 copy is the durable copy.

If a player clears history, cache, cookies and site storage:
- The browser copy and login session disappear.
- The D1 save remains.
- The player signs in again with the same account and the server save is restored.

## Cloudflare setup

1. Create a D1 database named `ganesha-festival-journey`.
2. Open its SQL console and run the complete contents of `schema.sql`.
3. Open the Ganesha Festival Journey Pages project.
4. Add a D1 binding with variable name exactly `DB` and select that database.
5. Apply the binding to Production and Preview if you want branch previews to support accounts.
6. Redeploy after adding the binding.
7. Visit `/api/health`. A successful setup returns JSON with `"ok": true` and `"database": true`.

Do not put a production database ID, account token, password, or secret in this public repository.

## Authentication design

Passwords are never stored directly. The Functions code derives a PBKDF2-SHA256 password hash with a random salt and 210,000 iterations. Login sessions use random tokens; only the SHA-256 hash of the session token is stored in D1. The browser receives the token only as a Secure, HttpOnly, SameSite=Lax cookie.

## Assets

The game catalog contains 131 Ganesha idol entries. Their expected paths are:

`dist/assets/idols/idol_001.png` through `idol_131.png`.

The full generated idol library is kept separately because it is hundreds of megabytes. For production, put the images either in those paths or move them to Cloudflare R2 / Images and update the catalog URLs.

Mandaps and decorations are procedural lightweight game assets:
- 120 mandap combinations
- 500 decoration combinations

This keeps the initial download small instead of shipping hundreds of large background PNG files.
