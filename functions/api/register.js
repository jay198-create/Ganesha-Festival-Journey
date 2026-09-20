import { json, readJson, normalizeEmail, hashPassword, createSession, sessionCookie } from "./_lib/auth.js";
export async function onRequestPost({request,env}) {
  const body = await readJson(request);
  const email = normalizeEmail(body?.email), password = String(body?.password || ""), displayName = String(body?.displayName || "").trim().slice(0,40);
  if (!email || !email.includes("@")) return json({error:"Enter a valid email."},400);
  if (password.length < 8) return json({error:"Password must be at least 8 characters."},400);
  const exists = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  if (exists) return json({error:"An account already exists for this email."},409);
  const id = crypto.randomUUID(), now = Date.now();
  const hp = await hashPassword(password);
  await env.DB.prepare("INSERT INTO users(id,email,display_name,password_hash,password_salt,password_iterations,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)")
    .bind(id,email,displayName||email.split("@")[0],hp.hash,hp.salt,hp.iterations,now,now).run();
  const s = await createSession(env,id);
  return json({ok:true,user:{id,email,displayName:displayName||email.split("@")[0]}},201,{"set-cookie":sessionCookie(s.token)});
}
