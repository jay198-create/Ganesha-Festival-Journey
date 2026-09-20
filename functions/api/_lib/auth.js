const te = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}
export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
export function normalizeEmail(v) { return String(v || "").trim().toLowerCase(); }
export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", te.encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function b64(bytes) {
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
export async function hashPassword(password, saltB64 = null, iterations = 210000) {
  const passwordBytes = te.encode(password);
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return { salt: b64(salt), hash: b64(new Uint8Array(bits)), iterations };
}
export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let out = 0; for (let i=0;i<a.length;i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
export function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return b64(bytes).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export function parseCookies(request) {
  const raw = request.headers.get("cookie") || "";
  return Object.fromEntries(raw.split(";").map(x => x.trim()).filter(Boolean).map(x => {
    const i=x.indexOf("="); return i<0?[x,""]:[x.slice(0,i),decodeURIComponent(x.slice(i+1))];
  }));
}
export function sessionCookie(token, maxAge = 60*60*24*30) {
  return `gfj_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function clearSessionCookie() {
  return "gfj_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
export async function requireUser(request, env) {
  const token = parseCookies(request).gfj_session;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT u.id,u.email,u.display_name,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?"
  ).bind(tokenHash, now).first();
  return row || null;
}
export async function createSession(env, userId) {
  const token = makeToken();
  const tokenHash = await sha256(token);
  const expires = Date.now() + 30*24*60*60*1000;
  await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)")
    .bind(tokenHash,userId,expires,Date.now()).run();
  return { token, expires };
}
