(() => {
  "use strict";
  const PROFILE_KEY="ganesha-festival-v3", BUILDER_KEY="ganesha-festival-v5-builder", SOUND_KEY="ganesha-sound";
  const api = async (path,options={}) => {
    const r=await fetch(path,{credentials:"same-origin",headers:{"content-type":"application/json",...(options.headers||{})},...options});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error||("Request failed: "+r.status));
    return data;
  };
  const localSnapshot=()=>({
    version:5,
    profile:JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"),
    builder:JSON.parse(localStorage.getItem(BUILDER_KEY)||"null"),
    settings:JSON.parse(localStorage.getItem(SOUND_KEY)||"null"),
    savedAt:Date.now()
  });
  const apply=(s)=>{
    if(!s) return;
    if(s.profile) localStorage.setItem(PROFILE_KEY,JSON.stringify(s.profile));
    if(s.builder) localStorage.setItem(BUILDER_KEY,JSON.stringify(s.builder));
    if(s.settings) localStorage.setItem(SOUND_KEY,JSON.stringify(s.settings));
  };
  let user=null,timer=null,syncing=false,booted=false;
  const sync=()=>{
    if(!user||syncing) return;
    clearTimeout(timer);
    timer=setTimeout(async()=>{
      syncing=true;
      try{ await api("/api/state",{method:"PUT",body:JSON.stringify({state:localSnapshot()})}); }
      catch(e){ console.warn("Cloud save failed",e); }
      finally{ syncing=false; }
    },350);
  };
  const originalSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){
    originalSet.call(this,k,v);
    if(this===localStorage && [PROFILE_KEY,BUILDER_KEY,SOUND_KEY].includes(k) && booted) sync();
  };
  window.GFJCloud={
    get user(){return user;},
    api,
    snapshot:localSnapshot,
    syncNow:async()=>{ if(user) return api("/api/state",{method:"PUT",body:JSON.stringify({state:localSnapshot()})}); },
    async register(email,password,displayName){
      const out=await api("/api/register",{method:"POST",body:JSON.stringify({email,password,displayName})});
      user=out.user; await this.syncNow(); return out;
    },
    async login(email,password){
      const out=await api("/api/login",{method:"POST",body:JSON.stringify({email,password})});
      user=out.user;
      const remote=await api("/api/state");
      if(remote.state) apply(remote.state); else await this.syncNow();
      return out;
    },
    async logout(){ await api("/api/logout",{method:"POST"}); user=null; }
  };
  async function loadScript(src){
    await new Promise((resolve,reject)=>{ const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  }
  (async()=>{
    try{
      const me=await api("/api/me");
      if(me.authenticated){
        user=me.user;
        const remote=await api("/api/state");
        if(remote.state) apply(remote.state);
      }
    }catch(e){ console.warn("Cloud bootstrap offline",e); }
    booted=true;
    await loadScript("core.js?v=5");
    await loadScript("festival-data.js?v=5");
    await loadScript("game.js?v=5");
    await loadScript("festival-studio.js?v=5");
    window.addEventListener("pagehide",()=>{ if(user) navigator.sendBeacon?.("/api/state",new Blob([JSON.stringify({state:localSnapshot()})],{type:"application/json"})); });
  })();
})();