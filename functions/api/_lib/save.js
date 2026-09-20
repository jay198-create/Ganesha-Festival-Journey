const te = new TextEncoder();

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

export async function hashRecoveryKey(key) {
  const raw = String(key || "").trim();
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(raw)) return null;
  const digest = await crypto.subtle.digest("SHA-256", te.encode(raw));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,"0")).join("");
}

export function recoveryKeyFrom(request) {
  return request.headers.get("x-recovery-key") || "";
}
