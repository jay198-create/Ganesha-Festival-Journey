# Anonymous Cloud Save

This contest build keeps Cloudflare D1 for durable game memory without player accounts.

## What is NOT collected by the game

The game does not request or store:
- name
- email address
- phone number
- password
- roll number
- college ID
- date of birth
- postal address

There is no sign-up or login system.

## How recovery works

Each browser receives a random 256-bit recovery key. The game uses that random key only to locate one anonymous save record.

The D1 database stores:
- SHA-256 hash of the recovery key
- structured game progress
- save revision
- created/updated timestamps

The raw recovery key is not stored in D1.

Because the save is anonymous, clearing every browser cookie/site-storage item also removes the browser's copy of the recovery key. The player must keep the recovery key (copy it or download the small recovery-key file) and paste it back into the game to restore the server-side save.

Automatic restoration after a complete wipe without any recovery key would require another persistent identifier such as an account, email, device fingerprint or similar identifier. This build intentionally does not do that.

## Game data synchronized

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

Free-text Mandal/group name is deliberately excluded from server synchronization.

## Cloudflare setup

1. Create a D1 database, for example `ganesha-festival-journey`.
2. Run `schema.sql` in the D1 SQL console.
3. In the Cloudflare Pages project, bind the D1 database to variable name exactly `DB`.
4. Redeploy the branch.
5. Open the game, play briefly, press **Save**, and download/copy the recovery key.
6. Test by opening another browser, pressing **Save**, pasting the recovery key and restoring.

The game still falls back to browser-local saving if D1 is temporarily unavailable.
