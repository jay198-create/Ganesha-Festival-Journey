import { json, readJson, hashRecoveryKey, recoveryKeyFrom } from "./_lib/save.js";

const MAX_BYTES = 900000;

export async function onRequestGet({ request, env }) {
  const keyHash = await hashRecoveryKey(recoveryKeyFrom(request));
  if (!keyHash) return json({ error: "Invalid recovery key." }, 400);

  const row = await env.DB.prepare(
    "SELECT state_json, revision, updated_at FROM anonymous_saves WHERE key_hash=?"
  ).bind(keyHash).first();

  if (!row) return json({ found: false, state: null, revision: 0, updatedAt: 0 });

  return json({
    found: true,
    state: JSON.parse(row.state_json),
    revision: row.revision,
    updatedAt: row.updated_at
  });
}

export async function onRequestPut({ request, env }) {
  const keyHash = await hashRecoveryKey(recoveryKeyFrom(request));
  if (!keyHash) return json({ error: "Invalid recovery key." }, 400);

  const body = await readJson(request);
  if (!body || typeof body.state !== "object" || body.state === null) {
    return json({ error: "Invalid game state." }, 400);
  }

  const payload = JSON.stringify(body.state);
  if (new TextEncoder().encode(payload).byteLength > MAX_BYTES) {
    return json({ error: "Save is too large." }, 413);
  }

  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO anonymous_saves(key_hash, state_json, revision, created_at, updated_at)
    VALUES(?, ?, 1, ?, ?)
    ON CONFLICT(key_hash) DO UPDATE SET
      state_json=excluded.state_json,
      revision=anonymous_saves.revision+1,
      updated_at=excluded.updated_at
  `).bind(keyHash, payload, now, now).run();

  const row = await env.DB.prepare(
    "SELECT revision FROM anonymous_saves WHERE key_hash=?"
  ).bind(keyHash).first();

  return json({ ok: true, revision: row.revision, updatedAt: now });
}

export const onRequestPost = onRequestPut;
