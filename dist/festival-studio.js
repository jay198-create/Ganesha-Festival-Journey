(() => {
  "use strict";
  const D=window.GFJData, A=window.GFJArt, app=document.querySelector("#app"), PROFILE_KEY="ganesha-festival-v3", KEY="ganesha-festival-v5-builder";
  if(!D||!app) return;

  const defaultState=()=>({
    version:5, groupName:"Our Ganesh Mandal", chanda:0, duration:3, day:1,
    ownedIdols:[], selectedIdol:null, ownedMandaps:[], selectedMandap:null,
    ownedDecor:[], activeDecor:[], ownedPuja:[], mantraLearned:[], dailyPuja:{},
    processionStep:0, visarjanComplete:false, view:"setup", page:0, filter:"all"
  });
  let state=defaultState();
  try{ state={...state,...JSON.parse(localStorage.getItem(KEY)||"{}")}; }catch{}
  const profile=()=>{ try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch{return {coins:0}} };
  const setProfile=(p)=>localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const coins=()=>Math.max(0,Number(profile().coins)||0);
  const spend=(n)=>{
    const p=profile(); p.coins=Math.max(0,Number(p.coins)||0);
    if(p.coins<n) return false; p.coins-=n; setProfile(p); return true;
  };
  const earn=(n)=>{ const p=profile(); p.coins=Math.max(0,Number(p.coins)||0)+n; setProfile(p); };

  const e=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money=n=>`${n} 🥟`;
  const wallet=()=>`<div class="v5-wallet"><b>${coins()}</b><span>MODAKS</span></div>`;
  const shell=(body)=>`<section class="v5-shell">
    <div class="v5-top"><div><span class="eyebrow">GANESHA FESTIVAL STUDIO</span><h1>Build the celebration.</h1></div>${wallet()}</div>
    <div class="v5-tabs">
      ${[
        ["setup","Mandal"],["idols","Idol shop"],["mandaps","Mandap"],["decor","Decor"],
        ["puja","Puja"],["mantras","Mantras"],["festival","Festival days"],["procession","Visarjan"]
      ].map(([id,label])=>`<button data-v5="tab" data-id="${id}" class="${state.view===id?"active":""}">${label}</button>`).join("")}
    </div>
    <div class="v5-content">${body}</div>
    <div class="v5-footer"><button data-v5="back-game" class="secondary">← Back to game</button><small>Recovery-key cloud memory enabled. Player name is optional; no account, email, password, phone number or student ID is requested.</small></div>
  </section>`;

  function render(){
    const m={
      setup:renderSetup,idols:renderIdols,mandaps:renderMandaps,decor:renderDecor,
      puja:renderPuja,mantras:renderMantras,festival:renderFestival,procession:renderProcession
    };
    app.innerHTML=shell((m[state.view]||renderSetup)());
    window.scrollTo({top:0,behavior:"auto"});
  }

  function renderSetup(){
    const idol=D.idols.find(x=>x.id===state.selectedIdol), mandap=D.mandaps.find(x=>x.id===state.selectedMandap), decorations=state.activeDecor.map(id=>D.decorations.find(x=>x.id===id)).filter(Boolean);
    return `<div class="v5-grid two">
      <article class="v5-card">
        <span class="eyebrow">YOUR GROUP</span><h2>Mandal setup</h2>
        <label>Festival group name (optional, device only)<input id="v5-group" value="${e(state.groupName)}" maxlength="40" autocomplete="off"></label>
        <label>Festival duration<select id="v5-duration">${D.durations.map(x=>`<option value="${x}" ${state.duration===x?"selected":""}>${x} days</option>`).join("")}</select></label>
        <label>Chanda collected<input id="v5-chanda" type="number" min="0" step="10" value="${state.chanda}"></label>
        <button data-v5="save-setup" class="primary">SAVE MANDAL</button>
        <p class="fine">Your chanda is a festival planning value. Modaks are the in-game currency earned from mini-games.</p>
      </article>
      <article class="v5-card preview-card">
        <span class="eyebrow">CURRENT FESTIVAL</span>
        ${A?.scene ? A.scene(mandap,idol,decorations) : `<div class="v5-mandap-preview" style="--p:${mandap?.primary||"#785020"};--s:${mandap?.secondary||"#1e463c"}"><div class="idol-slot">${idol?`<img src="${idol.image}" alt="${e(idol.name)}">`:'<span class="idol-fallback">ॐ</span>'}</div></div>`}
        <h3>${e(mandap?.name||"Choose a mandap")}</h3>
        <p>${idol?e(idol.name):"Choose a Ganesha idol"} · Day ${state.day}/${state.duration}</p>
      </article>
    </div>`;
  }

  function renderIdols(){
    const per=12, pages=Math.ceil(D.idols.length/per), page=Math.min(state.page,pages-1), rows=D.idols.slice(page*per,page*per+per);
    return `<div class="v5-title"><div><span class="eyebrow">131 INDIVIDUAL DESIGNS</span><h2>Choose your Ganesha idol</h2><p>Different sizes, styles and budgets. Buy once, then switch between owned idols freely.</p></div></div>
      <div class="v5-catalog">${rows.map(x=>`<article class="shop-card ${state.selectedIdol===x.id?"selected":""}">
        <div class="asset-box"><img src="${x.image}" alt="${e(x.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="asset-fallback">ॐ</span></div>
        <h3>${e(x.name)}</h3><p>${x.sizeFt} ft · ${e(x.style)} · ${e(x.color)}</p>
        <b>${money(x.price)}</b>
        ${state.ownedIdols.includes(x.id)?`<button data-v5="select-idol" data-id="${x.id}" class="secondary">${state.selectedIdol===x.id?"SELECTED":"USE IDOL"}</button>`:`<button data-v5="buy-idol" data-id="${x.id}" class="primary">BUY</button>`}
      </article>`).join("")}</div>
      <div class="pager"><button data-v5="page" data-value="${page-1}" ${page<=0?"disabled":""}>←</button><span>Page ${page+1} / ${pages}</span><button data-v5="page" data-value="${page+1}" ${page>=pages-1?"disabled":""}>→</button></div>`;
  }

  function renderMandaps(){
    const per=12,pages=Math.ceil(D.mandaps.length/per),page=Math.min(state.page,pages-1),rows=D.mandaps.slice(page*per,page*per+per);
    return `<div class="v5-title"><span class="eyebrow">120 MANDAP DESIGNS</span><h2>Build your pandal</h2><p>Architecture, fabric, lighting and theme combinations are generated as real in-game designs.</p></div>
      <div class="v5-catalog">${rows.map(x=>`<article class="shop-card ${state.selectedMandap===x.id?"selected":""}">
        ${A?.mandapSvg ? A.mandapSvg(x) : `<div class="mini-mandap" style="--p:${x.primary};--s:${x.secondary}"><i></i><i></i><b></b></div>`}
        <h3>${e(x.name)}</h3><p>${e(x.architecture)} · ${e(x.theme)}</p><b>${money(x.price)}</b>
        ${state.ownedMandaps.includes(x.id)?`<button data-v5="select-mandap" data-id="${x.id}" class="secondary">${state.selectedMandap===x.id?"SELECTED":"USE MANDAP"}</button>`:`<button data-v5="buy-mandap" data-id="${x.id}" class="primary">BUY</button>`}
      </article>`).join("")}</div>
      <div class="pager"><button data-v5="page" data-value="${page-1}" ${page<=0?"disabled":""}>←</button><span>Page ${page+1} / ${pages}</span><button data-v5="page" data-value="${page+1}" ${page>=pages-1?"disabled":""}>→</button></div>`;
  }

  function renderDecor(){
    const cats=["all",...new Set(D.decorations.map(x=>x.category))], filtered=state.filter==="all"?D.decorations:D.decorations.filter(x=>x.category===state.filter);
    const per=20,pages=Math.ceil(filtered.length/per),page=Math.min(state.page,Math.max(0,pages-1)),rows=filtered.slice(page*per,page*per+per);
    return `<div class="v5-title"><span class="eyebrow">500 DECOR OPTIONS</span><h2>Decorate every corner</h2></div>
      <select id="decor-filter"><option value="all">All decorations</option>${cats.slice(1).map(c=>`<option ${state.filter===c?"selected":""}>${e(c)}</option>`).join("")}</select>
      <div class="decor-grid">${rows.map(x=>`<article class="decor-card ${state.activeDecor.includes(x.id)?"selected":""}"><div class="decor-thumb">${A?.decorSvg ? A.decorSvg(x) : `<span>${x.icon}</span>`}</div><div><b>${e(x.name)}</b><small>Tier ${x.tier} · ${money(x.price)}</small></div>
      ${state.ownedDecor.includes(x.id)?`<button data-v5="toggle-decor" data-id="${x.id}">${state.activeDecor.includes(x.id)?"Remove":"Place"}</button>`:`<button data-v5="buy-decor" data-id="${x.id}">Buy</button>`}</article>`).join("")}</div>
      <div class="pager"><button data-v5="page" data-value="${page-1}" ${page<=0?"disabled":""}>←</button><span>Page ${page+1} / ${pages}</span><button data-v5="page" data-value="${page+1}" ${page>=pages-1?"disabled":""}>→</button></div>`;
  }

  function renderPuja(){
    return `<div class="v5-title"><span class="eyebrow">PUJA STORE</span><h2>Prepare today's puja</h2><p>Purchase offerings and ritual items with modaks, then use them in the daily puja checklist.</p></div>
      <div class="decor-grid">${D.pujaItems.map(x=>`<article class="decor-card"><div class="decor-thumb">${A?.pujaSvg ? A.pujaSvg(x) : `<span>${x.icon}</span>`}</div><div><b>${e(x.name)}</b><small>${money(x.price)}</small></div>
      ${state.ownedPuja.includes(x.id)?'<em>Owned</em>':`<button data-v5="buy-puja" data-id="${x.id}">Buy</button>`}</article>`).join("")}</div>`;
  }

  function renderMantras(){
    return `<div class="v5-title"><span class="eyebrow">LEARN DURING PUJA</span><h2>Mantra library</h2><p>Read, pronounce, understand and mark each prayer as learned.</p></div>
      <div class="mantra-list">${D.mantras.map(x=>`<article class="v5-card mantra"><span class="eyebrow">${e(x.type)}</span><h3>${e(x.title)}</h3><div class="devanagari">${e(x.devanagari)}</div><p><b>Pronunciation</b><br>${e(x.simple)}</p><p><b>Meaning</b><br>${e(x.meaning)}</p><small>${e(x.source)}</small>
      <button data-v5="learn-mantra" data-id="${x.id}" class="${state.mantraLearned.includes(x.id)?"secondary":"primary"}">${state.mantraLearned.includes(x.id)?"✓ LEARNED":"MARK AS LEARNED"}</button></article>`).join("")}</div>`;
  }

  function renderFestival(){
    const key="day-"+state.day, done=state.dailyPuja[key]||[];
    const steps=["Clean mandap","Light diya","Offer flowers / durva","Chant today's mantra","Offer naivedyam","Perform aarti"];
    const mantra=D.mantras[(state.day-1)%D.mantras.length];
    return `<div class="v5-grid two"><article class="v5-card"><span class="eyebrow">DAY ${state.day} OF ${state.duration}</span><h2>Daily Ganesh puja</h2>
      <div class="ritual-scene">${A?.pujaScene ? A.pujaScene(state.day,mantra.title) : ""}</div>
      <p>Today's learning: <b>${e(mantra.title)}</b></p>
      <div class="checklist">${steps.map((s,i)=>`<label><input type="checkbox" data-v5-check="${i}" ${done.includes(i)?"checked":""}> ${e(s)}</label>`).join("")}</div>
      <button data-v5="complete-day" class="primary" ${done.length<steps.length?"disabled":""}>${state.day>=state.duration?"COMPLETE FINAL PUJA":"COMPLETE DAY & CONTINUE"}</button></article>
      <article class="v5-card"><span class="eyebrow">FESTIVAL LIFE</span><h2>${e(state.groupName)}</h2>
      <div class="festival-day-scene">${A?.festivalDaySvg ? A.festivalDaySvg(state.day,state.duration) : ""}</div>
      <p>Idol: ${e(D.idols.find(x=>x.id===state.selectedIdol)?.name||"Not selected")}</p><p>Mandap: ${e(D.mandaps.find(x=>x.id===state.selectedMandap)?.name||"Not selected")}</p><p>Decorations placed: ${state.activeDecor.length}</p><p>Puja items owned: ${state.ownedPuja.length}</p><p>Mantras learned: ${state.mantraLearned.length}/${D.mantras.length}</p></article></div>`;
  }

  function renderProcession(){
    const unlocked=state.day>=state.duration;
    const steps=["Prepare Ganapati for farewell","Gather the mandal","Begin the procession","Chant Ganpati Bappa Morya","Reach the waterbody","Final aarti and prayers","Respectful visarjan"];
    if(!unlocked) return `<article class="v5-card"><span class="eyebrow">LOCKED UNTIL FINAL DAY</span><h2>Procession & Visarjan</h2><div class="procession-scene">${A?.processionSvg ? A.processionSvg(0,false) : ""}</div><p>Complete all ${state.duration} festival days first. You are currently on day ${state.day}.</p></article>`;
    return `<div class="v5-grid two"><article class="v5-card"><span class="eyebrow">FAREWELL PROCESSION</span><h2>Ganpati Bappa Morya</h2>
      <div class="procession-scene">${A?.processionSvg ? A.processionSvg(state.processionStep,state.visarjanComplete) : ""}</div>
      <div class="procession-track">${steps.map((x,i)=>`<div class="${i<state.processionStep?"done":i===state.processionStep?"current":""}"><b>${i+1}</b><span>${e(x)}</span></div>`).join("")}</div>
      ${state.visarjanComplete?'<div class="finale">🙏 Festival complete. See you next year.</div>':`<button data-v5="procession-next" class="primary">${state.processionStep>=steps.length-1?"COMPLETE VISARJAN":"NEXT STEP →"}</button>`}</article>
      <article class="v5-card"><span class="eyebrow">YOUR FESTIVAL SUMMARY</span><h2>${e(state.groupName)}</h2><p>${state.duration}-day celebration · ${state.ownedIdols.length} idols unlocked · ${state.ownedMandaps.length} mandaps · ${state.ownedDecor.length} decorations owned.</p><p>Keep playing mini-games to earn more modaks. Your purchased festival collection remains available for future celebrations.</p></article></div>`;
  }

  function buy(kind,id){
    const map={idol:D.idols,mandap:D.mandaps,decor:D.decorations,puja:D.pujaItems}, item=map[kind].find(x=>x.id===id);
    if(!item||!spend(item.price)) return alert("You need more modaks. Go back and play more levels.");
    const key={idol:"ownedIdols",mandap:"ownedMandaps",decor:"ownedDecor",puja:"ownedPuja"}[kind];
    if(!state[key].includes(id)) state[key].push(id);
    if(kind==="idol"&&!state.selectedIdol) state.selectedIdol=id;
    if(kind==="mandap"&&!state.selectedMandap) state.selectedMandap=id;
    save(); render();
  }

  document.addEventListener("click", async ev=>{
    const b=ev.target.closest("[data-v5]"); if(!b) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const a=b.dataset.v5,id=b.dataset.id;
    if(a==="open"){ try{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}));}catch{} state.view="setup";save();render();return; }
    if(a==="tab"){state.view=id;state.page=0;save();render();return;}
    if(a==="page"){state.page=Math.max(0,Number(b.dataset.value)||0);save();render();return;}
    if(a==="save-setup"){state.groupName=document.querySelector("#v5-group").value.trim()||"Our Ganesh Mandal";state.duration=Number(document.querySelector("#v5-duration").value);state.chanda=Math.max(0,Number(document.querySelector("#v5-chanda").value)||0);save();render();return;}
    if(a==="buy-idol") return buy("idol",id); if(a==="buy-mandap") return buy("mandap",id); if(a==="buy-decor") return buy("decor",id); if(a==="buy-puja") return buy("puja",id);
    if(a==="select-idol"){state.selectedIdol=id;save();render();return;} if(a==="select-mandap"){state.selectedMandap=id;save();render();return;}
    if(a==="toggle-decor"){const i=state.activeDecor.indexOf(id); if(i>=0)state.activeDecor.splice(i,1); else if(state.activeDecor.length<20)state.activeDecor.push(id); else alert("Maximum 20 active decorations in one scene."); save();render();return;}
    if(a==="learn-mantra"){if(!state.mantraLearned.includes(id))state.mantraLearned.push(id);save();render();return;}
    if(a==="complete-day"){if(state.day<state.duration)state.day++; else state.processionStep=0;save();state.view=state.day>=state.duration?"procession":"festival";render();return;}
    if(a==="procession-next"){const steps=7;if(state.processionStep<steps-1)state.processionStep++;else state.visarjanComplete=true;save();render();return;}
    if(a==="back-game"){save();Promise.resolve(window.GFJAnonymousSave?.syncNow?.()).finally(()=>location.reload());return;}
  },true);

  document.addEventListener("change",ev=>{
    if(ev.target.id==="decor-filter"){state.filter=ev.target.value;state.page=0;save();render();}
    if(ev.target.matches("[data-v5-check]")){const key="day-"+state.day,arr=state.dailyPuja[key]||[],i=Number(ev.target.dataset.v5Check); if(ev.target.checked&&!arr.includes(i))arr.push(i);if(!ev.target.checked&&arr.includes(i))arr.splice(arr.indexOf(i),1);state.dailyPuja[key]=arr;save();render();}
  });

  function addNav(){
    const nav=document.querySelector("header nav");
    if(!nav||nav.querySelector("[data-v5='open']")) return;
    const studio=document.createElement("button");
    studio.textContent="Festival Studio";
    studio.dataset.v5="open";
    nav.insertBefore(studio,nav.firstChild);
  }

  addNav();
  new MutationObserver(addNav).observe(document.body,{childList:true,subtree:true});
})();