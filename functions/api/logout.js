import { json, parseCookies, sha256, clearSessionCookie } from "./_lib/auth.js";
export async function onRequestPost({request,env}) {
  const token = parseCookies(request).gfj_session;
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
  return json({ok:true},200,{"set-cookie":clearSessionCookie()});
}
