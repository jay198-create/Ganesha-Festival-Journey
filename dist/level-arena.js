(() => {
  "use strict";
  const app=document.querySelector("#app"), PROFILE_KEY="ganesha-festival-v3", KEY="ganesha-festival-v5-levels";
  if(!app) return;
  const games=[
    {id:"memory",name:"Ganesha Memory",icon:"◈"},
    {id:"math",name:"Modak Math",icon:"×"},
    {id:"hunt",name:"Mushak Hunt",icon:"⌕"},
    {id:"sequence",name:"Ganesha Sequence",icon:"♫"},
    {id:"pattern",name:"Festival Pattern",icon:"✥"}
  ];
  const diffs={easy:{label:"Easy",mult:1},medium:{label:"Medium",mult:1.4},hard:{label:"Hard",mult:2}};
  let st={game:"memory",difficulty:"easy",progress:{},screen:"menu",level:1,puzzle:null,startedAt:0};
  try{st={...st,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{}
  const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
  const prof=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}catch{return {coins:0}}};
  const reward=n=>{const p=prof();p.coins=(Number(p.coins)||0)+n;localStorage.setItem(PROFILE_KEY,JSON.stringify(p));};
  const e=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const key=()=>st.game+":"+st.difficulty;
  const unlocked=()=>Math.max(1,Number(st.progress[key()]?.unlocked)||1);
  const best=()=>st.progress[key()]?.best||{};
  function rng(seed){let n=seed>>>0;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function int(r,n){return Math.floor(r()*n)}
  function shuffled(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const j=int(r,i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function build(level){
    const d=diffs[st.difficulty],r=rng(level*9173+st.game.length*313+(st.difficulty==="hard"?9999:st.difficulty==="medium"?4444:0));
    if(st.game==="memory"){
      const pairs=Math.min(12,3+Math.ceil(level/10)+(st.difficulty==="hard"?2:st.difficulty==="medium"?1:0));
      const icons=["🪔","🪷","🥟","🐭","🌺","🔔","🥥","🌿","🏺","✨","🌾","🦚"];
      const vals=shuffled([...icons.slice(0,pairs),...icons.slice(0,pairs)],r);
      return {type:"memory",vals,open:[],done:[],moves:0};
    }
    if(st.game==="math"){
      const a=2+int(r,8+level),b=2+int(r,7+Math.ceil(level/2)),op=level<15?"+":level<35?"×":level<60?"mixed":"combo";
      let text,ans;
      if(op==="+"){text=`${a} + ${b}`;ans=a+b}
      else if(op==="×"){text=`${a} × ${b}`;ans=a*b}
      else if(op==="mixed"){const c=1+int(r,12);text=`(${a} × ${b}) − ${c}`;ans=a*b-c}
      else{const c=2+int(r,10);text=`(${a} + ${b}) × ${c}`;ans=(a+b)*c}
      const opts=new Set([ans]);while(opts.size<4)opts.add(Math.max(0,ans+int(r,17)-8));
      return {type:"math",text,ans,opts:shuffled([...opts],r)};
    }
    if(st.game==="hunt"){
      const count=Math.min(64,16+Math.floor(level/3)+(st.difficulty==="hard"?12:st.difficulty==="medium"?6:0)),target=int(r,count);
      return {type:"hunt",count,target};
    }
    if(st.game==="sequence"){
      const pads=st.difficulty==="hard"?6:st.difficulty==="medium"?5:4,len=Math.min(16,3+Math.ceil(level/8)+(st.difficulty==="hard"?3:0));
      return {type:"sequence",pads,seq:Array.from({length:len},()=>int(r,pads)),entry:[],phase:"show"};
    }
    const base=2+int(r,4),step=1+int(r,5),len=Math.min(9,4+Math.floor(level/18)),series=Array.from({length:len},(_,i)=>base+i*step);
    const ans=base+len*step,opts=new Set([ans]);while(opts.size<4)opts.add(ans+int(r,9)-4);
    return {type:"pattern",series,ans,opts:shuffled([...opts],r)};
  }
  function shell(body){
    const p=prof();
    return `<section class="arena-shell"><div class="arena-head"><div><span class="eyebrow">100 LEVELS + ENDLESS</span><h1>Festival Skill Arena</h1></div><div class="v5-wallet"><b>${Number(p.coins)||0}</b><span>MODAKS</span></div></div>${body}<div class="arena-foot"><button data-arena="exit" class="secondary">← Back to game</button><small>Every completed level saves automatically.</small></div></section>`;
  }
  function menu(){
    app.innerHTML=shell(`<div class="arena-pickers"><div><h3>Game</h3>${games.map(g=>`<button data-arena="game" data-id="${g.id}" class="${st.game===g.id?"active":""}">${g.icon} ${g.name}</button>`).join("")}</div><div><h3>Difficulty</h3>${Object.entries(diffs).map(([id,d])=>`<button data-arena="difficulty" data-id="${id}" class="${st.difficulty===id?"active":""}">${d.label}</button>`).join("")}</div></div>
      <div class="arena-summary"><h2>${e(games.find(x=>x.id===st.game).name)} · ${diffs[st.difficulty].label}</h2><p>Unlocked through level <b>${unlocked()}</b>. Finish Level 100 to unlock Endless.</p></div>
      <div class="level-grid">${Array.from({length:100},(_,i)=>i+1).map(n=>`<button data-arena="level" data-level="${n}" class="${n<=unlocked()?"open":"locked"} ${best()[n]?"cleared":""}" ${n>unlocked()?"disabled":""}>${n}<small>${best()[n]?"✓":""}</small></button>`).join("")}</div>
      <button data-arena="level" data-level="${Math.max(101,unlocked())}" class="primary endless" ${unlocked()<101?"disabled":""}>∞ ENDLESS MODE</button>`);
  }
  function play(level){
    st.level=level;st.puzzle=build(level);st.screen="play";st.startedAt=Date.now();save();renderPlay();
    if(st.puzzle.type==="sequence") setTimeout(showSequence,250);
  }
  function renderPlay(msg=""){
    const p=st.puzzle,g=games.find(x=>x.id===st.game);
    let board="";
    if(p.type==="memory")board=`<div class="mem-grid" style="--cols:${Math.ceil(Math.sqrt(p.vals.length))}">${p.vals.map((x,i)=>`<button data-arena="mem" data-i="${i}" class="${p.open.includes(i)||p.done.includes(i)?"flip":""}">${p.open.includes(i)||p.done.includes(i)?x:"?"}</button>`).join("")}</div>`;
    if(p.type==="math")board=`<div class="question">${e(p.text)}</div><div class="answer-grid">${p.opts.map(x=>`<button data-arena="answer" data-value="${x}">${x}</button>`).join("")}</div>`;
    if(p.type==="hunt")board=`<div class="hunt-grid">${Array.from({length:p.count},(_,i)=>`<button data-arena="hunt" data-i="${i}">${i===p.target?"🐭":["🌼","🪔","🥟","🌿","🔔"][i%5]}</button>`).join("")}</div>`;
    if(p.type==="sequence")board=`<div class="seq-status">${p.phase==="show"?"Watch the pattern…":"Repeat the pattern"}</div><div class="seq-grid">${Array.from({length:p.pads},(_,i)=>`<button data-arena="seq" data-i="${i}" class="pad p${i}" ${p.phase==="show"?"disabled":""}>${i+1}</button>`).join("")}</div><div class="seq-entry">${p.entry.length}/${p.seq.length}</div>`;
    if(p.type==="pattern")board=`<div class="question">${p.series.join(" · ")} · ?</div><div class="answer-grid">${p.opts.map(x=>`<button data-arena="answer" data-value="${x}">${x}</button>`).join("")}</div>`;
    app.innerHTML=shell(`<div class="arena-playtop"><button data-arena="menu">← Levels</button><span>${g.name} · ${diffs[st.difficulty].label}</span><b>Level ${st.level>100?"∞ "+st.level:st.level}</b></div><div class="arena-board">${msg?`<p class="arena-msg">${e(msg)}</p>`:""}${board}</div>`);
  }
  function showSequence(){
    const p=st.puzzle;if(!p||p.type!=="sequence")return;
    let i=0;
    const t=setInterval(()=>{
      document.querySelectorAll(".seq-grid .pad").forEach(x=>x.classList.remove("flash"));
      if(i>=p.seq.length){clearInterval(t);p.phase="input";save();renderPlay();return;}
      document.querySelector(`.seq-grid .p${p.seq[i]}`)?.classList.add("flash");i++;
    },st.difficulty==="hard"?430:st.difficulty==="medium"?560:700);
  }
  function win(){
    const elapsed=Math.max(1,Math.round((Date.now()-st.startedAt)/1000)),base=4+Math.ceil(st.level/10),amount=Math.round(base*diffs[st.difficulty].mult);
    reward(amount);
    const k=key();st.progress[k] ||= {unlocked:1,best:{}};
    st.progress[k].best[st.level]=Math.min(st.progress[k].best[st.level]||99999,elapsed);
    st.progress[k].unlocked=Math.max(st.progress[k].unlocked,st.level+1);
    save();
    app.innerHTML=shell(`<div class="arena-win"><span class="eyebrow">LEVEL COMPLETE</span><h2>+ ${amount} modaks</h2><p>${elapsed}s · Level ${st.level}</p><div class="actions"><button data-arena="next" class="primary">NEXT LEVEL →</button><button data-arena="menu" class="secondary">LEVEL MAP</button></div></div>`);
  }
  function wrong(){renderPlay("Not quite. Try again.");}
  document.addEventListener("click",ev=>{
    const b=ev.target.closest("[data-arena]");if(!b)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    const a=b.dataset.arena;
    if(a==="open"){try{document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}));}catch{}st.screen="menu";save();menu();return}
    if(a==="exit"){save();Promise.resolve(window.GFJAnonymousSave?.syncNow?.()).finally(()=>location.reload());return}
    if(a==="menu"){st.screen="menu";save();menu();return}
    if(a==="game"){st.game=b.dataset.id;st.screen="menu";save();menu();return}
    if(a==="difficulty"){st.difficulty=b.dataset.id;st.screen="menu";save();menu();return}
    if(a==="level"){play(Number(b.dataset.level));return}
    if(a==="next"){play(st.level+1);return}
    const p=st.puzzle;if(!p)return;
    if(a==="answer"){Number(b.dataset.value)===p.ans?win():wrong();return}
    if(a==="hunt"){Number(b.dataset.i)===p.target?win():wrong();return}
    if(a==="seq"){if(p.phase!=="input")return;const v=Number(b.dataset.i);if(v!==p.seq[p.entry.length]){p.entry=[];save();wrong();return}p.entry.push(v);save();if(p.entry.length===p.seq.length)win();else renderPlay();return}
    if(a==="mem"){
      const i=Number(b.dataset.i);if(p.done.includes(i)||p.open.includes(i)||p.open.length>=2)return;
      p.open.push(i);p.moves++;save();renderPlay();
      if(p.open.length===2){
        const [x,y]=p.open;
        setTimeout(()=>{if(p.vals[x]===p.vals[y])p.done.push(x,y);p.open=[];save();if(p.done.length===p.vals.length)win();else renderPlay();},500);
      }
    }
  },true);
  function addNav(){const nav=document.querySelector("header nav");if(!nav||nav.querySelector("[data-arena='open']"))return;const b=document.createElement("button");b.textContent="100 Levels";b.dataset.arena="open";nav.insertBefore(b,nav.firstChild)}
  addNav();new MutationObserver(addNav).observe(document.body,{childList:true,subtree:true});
})();