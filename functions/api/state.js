import { json, readJson, requireUser } from "./_lib/auth.js";
const MAX = 750000;
export async function onRequestGet({request,env}) {
  const u = await requireUser(request,env);
  if (!u) return json({error:"Authentication required."},401);
  const row = await env.DB.prepare("SELECT state_json,revision,updated_at FROM game_state WHERE user_id=?").bind(u.id).first();
  return json({state:row?JSON.parse(row.state_json):null,revision:row?.revision||0,updatedAt:row?.updated_at||0});
}
export async function onRequestPut({request,env}) {
  const u = await requireUser(request,env);
  if (!u) return json({error:"Authentication required."},401);
  const body = await readJson(request);
  if (!body || typeof body.state!=="object") return json({error:"Invalid state."},400);
  const payload = JSON.stringify(body.state);
  if (payload.length>MAX) return json({error:"Save is too large."},413);
  const now=Date.now();
  await env.DB.prepare(`
    INSERT INTO game_state(user_id,state_json,revision,updated_at)
    VALUES(?,?,1,?)
    ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json,revision=game_state.revision+1,updated_at=excluded.updated_at
  `).bind(u.id,payload,now).run();
  const row=await env.DB.prepare("SELECT revision FROM game_state WHERE user_id=?").bind(u.id).first();
  return json({ok:true,revision:row.revision,updatedAt:now});
}

export const onRequestPost = onRequestPut;
