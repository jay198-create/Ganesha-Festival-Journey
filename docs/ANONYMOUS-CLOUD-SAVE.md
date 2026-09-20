# Recovery-Key Cloud Save

This contest build keeps Cloudflare D1 for durable game memory without requiring a player account.

## Optional player name

A player may enter a **first name or nickname** (maximum 24 characters). It is used only to personalize the game, for example:

`Welcome, Jayanth`

The name is optional. If entered, it is stored with that player's game save so it can be restored with the same recovery key.

## What the game does NOT request

- email address
- phone number
- password
- roll number
- college ID
- date of birth
- postal address
- payment information

There is no sign-up or login system.

## How recovery works

Each browser receives a random 256-bit recovery key. The game uses that random key to locate one save record.

The D1 database stores:
- SHA-256 hash of the recovery key
- optional first name / nickname
- structured game progress
- save revision
- created/updated timestamps

The raw recovery key is not stored in D1.

If every browser cookie and site-storage item is cleared, the browser loses its copy of the recovery key. The player can restore the server-side save by pasting the recovery key again.

Automatic restoration after a complete wipe without a recovery key would require another persistent identifier such as an account, email address or device fingerprint. This build intentionally avoids those.

## Game data synchronized

- optional first name / nickname
- Modaks
- challenge scores and active run
- 100-level / Endless progress
- purchased idols
- mandap selection
- purchased and placed decorations
- puja inventory and festival day
- mantra-learning flags
- procession / Visarjan progress
- sound settings

The free-text Mandal/group name remains device-only and is deliberately excluded from server synchronization.

## Cloudflare setup

1. Create a D1 database, for example `ganesha-festival-journey`.
2. Run `schema.sql` in the D1 SQL console.
3. In the Cloudflare Pages project, bind the D1 database to variable name exactly `DB`.
4. Redeploy the branch.
5. Open the game, enter an optional name, play briefly, press **Save**, and download/copy the recovery key.
6. Test in another browser by pressing **Save**, pasting the recovery key and restoring.

The game falls back to browser-local saving if D1 is temporarily unavailable.
