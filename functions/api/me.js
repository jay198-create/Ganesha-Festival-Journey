import { json, requireUser } from "./_lib/auth.js";
export async function onRequestGet({request,env}) {
  const u = await requireUser(request,env);
  if (!u) return json({authenticated:false},200);
  return json({authenticated:true,user:{id:u.id,email:u.email,displayName:u.display_name}},200);
}
