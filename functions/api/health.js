import { json } from "./_lib/auth.js";
export async function onRequestGet({env}) {
  try {
    const row = await env.DB.prepare("SELECT 1 AS ok").first();
    return json({ok:row?.ok===1,database:true});
  } catch (error) {
    return json({ok:false,database:false,error:"D1 binding or schema is not ready."},503);
  }
}
