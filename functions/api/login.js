import { json, readJson, normalizeEmail, hashPassword, safeEqual, createSession, sessionCookie } from "./_lib/auth.js";
export async function onRequestPost({request,env}) {
  const body = await readJson(request);
  const email = normalizeEmail(body?.email), password = String(body?.password || "");
  const u = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  if (!u) return json({error:"Email or password is incorrect."},401);
  const hp = await hashPassword(password,u.password_salt,u.password_iterations);
  if (!safeEqual(hp.hash,u.password_hash)) return json({error:"Email or password is incorrect."},401);
  const s = await createSession(env,u.id);
  return json({ok:true,user:{id:u.id,email:u.email,displayName:u.display_name}},200,{"set-cookie":sessionCookie(s.token)});
}
