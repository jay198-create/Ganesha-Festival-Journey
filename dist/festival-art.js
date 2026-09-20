(() => {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);

  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const num = id => Math.max(1, Number(String(id||"").match(/\d+/)?.[0] || 1));
  const uid = (prefix,id) => prefix + "-" + String(id||"x").replace(/[^a-z0-9_-]/gi,"-");

  function rosette(cx,cy,r,petals,fill,stroke="#ffffff55"){
    let p="";
    for(let i=0;i<petals;i++){
      const a=(Math.PI*2*i)/petals, x=cx+Math.cos(a)*r*.62, y=cy+Math.sin(a)*r*.62;
      p += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r*.38).toFixed(1)}" ry="${(r*.2).toFixed(1)}" transform="rotate(${(i*360/petals).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill}" stroke="${stroke}" stroke-width=".7"/>`;
    }
    return p+`<circle cx="${cx}" cy="${cy}" r="${(r*.25).toFixed(1)}" fill="#ffd35f"/>`;
  }

  function mandapSvg(m, opts={}){
    if(!m) return "";
    const id=uid("m",m.id), n=num(m.id), p=m.primary||"#d99a2b", s=m.secondary||"#6e1717";
    const accent=["#ffd76b","#f5efe0","#f4a6b8","#7fe0c7","#b9d5ff"][n%5];
    const arch=m.architecture||"Festival Mandap", roof=m.roof||"arch", pillars=clamp(Number(m.pillars)||4,2,6), pattern=Number(m.pattern)||0;
    const W=360,H=250;
    let roofShape="";
    if(roof==="dome") roofShape=`<path d="M62 92 Q180 10 298 92 L284 108 Q180 45 76 108Z" fill="url(#r-${id})" stroke="${accent}" stroke-width="3"/><circle cx="180" cy="31" r="8" fill="${accent}"/>`;
    else if(roof==="canopy") roofShape=`<path d="M48 72 Q180 34 312 72 L286 110 Q180 77 74 110Z" fill="url(#r-${id})" stroke="${accent}" stroke-width="3"/>`;
    else if(roof==="gopuram") roofShape=`<path d="M112 110 L132 91 L143 91 L154 72 L166 72 L180 45 L194 72 L206 72 L217 91 L228 91 L248 110Z" fill="url(#r-${id})" stroke="${accent}" stroke-width="3"/>`;
    else roofShape=`<path d="M55 109 Q72 44 180 38 Q288 44 305 109 L286 111 Q262 69 180 66 Q98 69 74 111Z" fill="url(#r-${id})" stroke="${accent}" stroke-width="3"/>`;

    let pillarSvg="";
    for(let i=0;i<pillars;i++){
      const x=68 + i*(224/(pillars-1));
      pillarSvg += `<g><rect x="${(x-6).toFixed(1)}" y="101" width="12" height="118" rx="5" fill="url(#p-${id})" stroke="${accent}" stroke-width="1.2"/><rect x="${(x-10).toFixed(1)}" y="99" width="20" height="8" rx="3" fill="${accent}" opacity=".9"/><rect x="${(x-10).toFixed(1)}" y="214" width="20" height="8" rx="3" fill="${accent}" opacity=".8"/></g>`;
    }

    let motif="";
    if(pattern===0) motif=`<path d="M90 121 Q180 86 270 121" fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="5 8"/>`;
    if(pattern===1) motif=`<g opacity=".9">${[110,145,180,215,250].map((x,i)=>rosette(x,118,9,6,i%2?p:accent)).join("")}</g>`;
    if(pattern===2) motif=`<path d="M94 119 L118 105 L142 119 L166 105 L190 119 L214 105 L238 119 L262 105" fill="none" stroke="${accent}" stroke-width="4"/>`;
    if(pattern===3) motif=`<g fill="${accent}">${[105,135,165,195,225,255].map((x,i)=>`<circle cx="${x}" cy="${115+(i%2)*8}" r="${4+(i%3)}"/>`).join("")}</g>`;
    if(pattern===4) motif=`<path d="M100 107 C125 135 150 90 180 120 C210 150 235 95 260 112" fill="none" stroke="${accent}" stroke-width="4"/>`;
    if(pattern===5) motif=`<g opacity=".95">${[120,150,180,210,240].map((x,i)=>`<path d="M${x} 104 l8 12 -8 12 -8 -12Z" fill="${i%2?accent:p}"/>`).join("")}</g>`;

    const lamps=[88,272].map(x=>`<g><path d="M${x} 202 q8 13 16 0 q-2 18-8 18t-8-18" fill="#c9822b"/><path d="M${x+8} 198 q-5-11 0-18 q6 8 0 18" fill="#ffd95c"/></g>`).join("");
    const sideFlowers=`${rosette(49,127,12,7,p)}${rosette(311,127,12,7,p)}`;
    const floorPattern=Array.from({length:7},(_,i)=>`<circle cx="${120+i*20}" cy="222" r="${3+(i%2)}" fill="${i%2?accent:p}" opacity=".9"/>`).join("");

    return `<svg class="mandap-art ${opts.large?"large":""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(m.name||arch)}">
      <defs>
        <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${s}"/><stop offset="1" stop-color="#07151a"/></linearGradient>
        <linearGradient id="r-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p}"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${p}"/></linearGradient>
        <linearGradient id="p-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${p}"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${p}"/></linearGradient>
        <radialGradient id="glow-${id}"><stop stop-color="${accent}" stop-opacity=".38"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${W}" height="${H}" rx="18" fill="url(#bg-${id})"/>
      <circle cx="180" cy="132" r="120" fill="url(#glow-${id})"/>
      <path d="M38 220 Q180 188 322 220 L322 242 L38 242Z" fill="#9c6b40" opacity=".48"/>
      ${roofShape}${pillarSvg}${motif}${sideFlowers}${lamps}
      <path d="M74 110 Q180 143 286 110" fill="none" stroke="${accent}" stroke-width="2.5" opacity=".8"/>
      ${floorPattern}
      <rect x="128" y="196" width="104" height="25" rx="7" fill="${p}" stroke="${accent}" stroke-width="2"/>
      <rect x="145" y="190" width="70" height="10" rx="4" fill="${accent}" opacity=".85"/>
      <g opacity=".75" fill="${accent}">
        ${Array.from({length:9},(_,i)=>`<circle cx="${74+i*26.5}" cy="${85 + ((i+n)%3)*6}" r="2.4"/>`).join("")}
      </g>
    </svg>`;
  }

  function decorSvg(d, opts={}){
    if(!d) return "";
    const id=uid("d",d.id), n=num(d.id), p=d.primary||"#d99a2b", s=d.secondary||"#6e1717", cat=d.category||"Festival Decor", tier=clamp(Number(d.tier)||1,1,5);
    const accent=["#ffd55f","#f7f0dd","#82d7c0","#e7a0b7","#94bfff"][n%5];
    let art="";
    const dots=(count,y=50)=>Array.from({length:count},(_,i)=>`<circle cx="${20+i*(80/Math.max(1,count-1))}" cy="${y+((i+n)%2)*7}" r="${3+tier*.45}" fill="${i%2?p:accent}"/>`).join("");

    switch(cat){
      case "Flower Garland":
      case "Marigold Toran":
        art=`<path d="M10 30 Q60 78 110 30" fill="none" stroke="${s}" stroke-width="4"/>${dots(7,40)}`; break;
      case "Mango Leaf Toran":
        art=`<path d="M10 28 Q60 52 110 28" fill="none" stroke="${p}" stroke-width="4"/>${Array.from({length:8},(_,i)=>`<ellipse cx="${18+i*13}" cy="${39+((i+n)%2)*5}" rx="5" ry="10" transform="rotate(${i%2?-18:18} ${18+i*13} ${39+((i+n)%2)*5})" fill="${i%2?p:accent}"/>`).join("")}`; break;
      case "Fairy Lights":
        art=`<path d="M8 25 Q60 62 112 25" fill="none" stroke="#cabf9d" stroke-width="2"/>${Array.from({length:9},(_,i)=>`<circle cx="${14+i*12}" cy="${31+Math.sin(i)*13}" r="${3+tier*.4}" fill="${i%2?accent:"#fff2a6"}"/><circle cx="${14+i*12}" cy="${31+Math.sin(i)*13}" r="${7+tier}" fill="${accent}" opacity=".12"/>`).join("")}`; break;
      case "Deepam Row":
      case "Floor Lamps":
        art=Array.from({length:5},(_,i)=>`<g transform="translate(${12+i*22},36)"><path d="M0 20 q9 8 18 0 q-3 13-9 13t-9-13" fill="${i%2?p:s}"/><path d="M9 18 q-5-10 0-16 q7 7 0 16" fill="#ffd65c"/></g>`).join(""); break;
      case "Brass Bells":
        art=Array.from({length:5},(_,i)=>`<g transform="translate(${13+i*22},18)"><path d="M8 8 v14 q-8 9-8 20 h16 q0-11-8-20" fill="${p}" stroke="${accent}" stroke-width="1.5"/><circle cx="8" cy="44" r="3" fill="${accent}"/></g>`).join(""); break;
      case "Rangoli":
        art=`<g transform="translate(60 55)">${rosette(0,0,32,8,p,accent)}<circle r="11" fill="${s}"/><circle r="5" fill="${accent}"/></g>`; break;
      case "Lotus Arrangement":
        art=`<g transform="translate(60 60)">${rosette(0,0,35,10,p,accent)}<ellipse cx="0" cy="21" rx="35" ry="8" fill="${s}" opacity=".6"/></g>`; break;
      case "Banana Stem":
        art=`<rect x="48" y="18" width="24" height="76" rx="10" fill="#78a23f"/><path d="M54 23 Q16 18 15 45 Q45 42 60 60" fill="#5ca65d"/><path d="M66 23 Q104 18 105 45 Q75 42 60 60" fill="#4b9250"/>`; break;
      case "Kalash":
        art=`<path d="M42 35 Q60 27 78 35 L74 45 Q84 60 77 85 Q60 99 43 85 Q36 60 46 45Z" fill="${p}" stroke="${accent}" stroke-width="2"/><path d="M60 34 Q45 18 39 16 Q52 13 60 25 Q68 13 81 16 Q75 18 60 34" fill="#5a9b55"/><ellipse cx="60" cy="44" rx="17" ry="5" fill="${accent}"/>`; break;
      case "Fabric Drapes":
      case "Backdrop":
        art=`<path d="M15 20 Q33 42 46 18 Q60 45 74 18 Q88 42 105 20 L105 98 L15 98Z" fill="${p}" opacity=".9"/><path d="M20 25 Q35 51 48 25 Q60 54 72 25 Q86 51 100 25" fill="none" stroke="${accent}" stroke-width="4"/>`; break;
      case "Flower Pillar":
        art=`<rect x="51" y="12" width="18" height="96" rx="7" fill="${s}"/>${Array.from({length:6},(_,i)=>rosette(60,20+i*16,9,6,i%2?p:accent)).join("")}`; break;
      case "Ceiling Hangings":
        art=`<path d="M10 18 H110" stroke="${accent}" stroke-width="3"/>${Array.from({length:6},(_,i)=>`<g transform="translate(${18+i*17},18)"><path d="M0 0 v${24+(i%3)*8}" stroke="${p}" stroke-width="2"/><path d="M-6 ${25+(i%3)*8} l6 10 6-10Z" fill="${accent}"/></g>`).join("")}`; break;
      case "Coconut Decor":
        art=`<ellipse cx="60" cy="62" rx="26" ry="32" fill="#8b5734"/><path d="M49 35 Q46 15 38 7 M59 31 Q60 12 60 5 M69 35 Q77 16 84 10" stroke="#4b8f4a" stroke-width="7" stroke-linecap="round"/><circle cx="52" cy="58" r="3" fill="#432719"/><circle cx="61" cy="55" r="3" fill="#432719"/><circle cx="68" cy="60" r="3" fill="#432719"/>`; break;
      case "Sugarcane Arch":
        art=`<path d="M24 102 Q20 30 46 18 M96 102 Q100 30 74 18 M46 18 Q60 5 74 18" fill="none" stroke="#72a84e" stroke-width="8"/>${Array.from({length:5},(_,i)=>`<path d="M${30+i*15} ${28+i%2*15} q-18-12-24 1 q18 8 28 13" fill="#5e9b48"/>`).join("")}`; break;
      case "Rice Sheaf":
        art=`<path d="M60 105 Q55 60 22 20 M60 105 Q62 57 95 18 M60 105 Q60 55 60 10" stroke="#c79a46" stroke-width="4"/>${Array.from({length:12},(_,i)=>`<ellipse cx="${24+(i%3)*35}" cy="${25+Math.floor(i/3)*15}" rx="4" ry="8" fill="${i%2?p:accent}"/>`).join("")}`; break;
      case "Peacock Accent":
        art=`<ellipse cx="61" cy="64" rx="13" ry="30" fill="#2778a2"/><circle cx="61" cy="29" r="11" fill="#3b9b7a"/><path d="M52 68 Q10 38 21 100 Q45 83 60 78 M70 68 Q110 38 99 100 Q77 83 62 78" fill="${p}" stroke="${accent}" stroke-width="2"/>${rosette(60,78,18,7,accent,p)}`; break;
      case "Umbrella Canopy":
        art=`<path d="M18 48 Q60 4 102 48 Q91 38 81 48 Q70 38 60 48 Q49 38 39 48 Q28 38 18 48Z" fill="${p}" stroke="${accent}" stroke-width="2"/><path d="M60 48 v54" stroke="${accent}" stroke-width="4"/><circle cx="60" cy="12" r="5" fill="${accent}"/>`; break;
      default:
        art=`${rosette(60,55,34,8,p,accent)}`;
    }

    return `<svg class="decor-art ${opts.large?"large":""}" viewBox="0 0 120 120" role="img" aria-label="${esc(d.name||cat)}">
      <defs><radialGradient id="dg-${id}"><stop stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${s}" stop-opacity=".04"/></radialGradient></defs>
      <rect x="2" y="2" width="116" height="116" rx="20" fill="url(#dg-${id})" stroke="${accent}" stroke-opacity=".22"/>
      ${art}
      <circle cx="105" cy="105" r="${5+tier}" fill="${p}" stroke="${accent}" stroke-width="1"/>
    </svg>`;
  }

  function pujaSvg(item){
    if(!item) return "";
    const fake={id:item.id,name:item.name,category:
      /diya|camphor/i.test(item.name)?"Deepam Row":
      /kalash|water/i.test(item.name)?"Kalash":
      /lotus/i.test(item.name)?"Lotus Arrangement":
      /flower/i.test(item.name)?"Flower Garland":
      /coconut/i.test(item.name)?"Coconut Decor":
      /rice|durva|leaf|thread/i.test(item.name)?"Rice Sheaf":
      "Rangoli",
      tier:2,primary:"#d69a37",secondary:"#6f311f"};
    return decorSvg(fake);
  }

  function scene(mandap,idol,decorations=[]){
    const m = mandap || {id:"mandap-preview",name:"Festival Mandap",primary:"#c58a35",secondary:"#173e39",architecture:"Temple Arch",roof:"arch",pillars:4,pattern:1};
    const dec = decorations.slice(0,10);
    return `<div class="festival-scene-art">
      <div class="scene-mandap">${mandapSvg(m,{large:true})}</div>
      <div class="scene-idol">${idol? `<img src="${esc(idol.image)}" alt="${esc(idol.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="scene-idol-fallback">ॐ</span>` : '<span class="scene-idol-fallback">ॐ</span>'}</div>
      <div class="scene-decorations">${dec.map((d,i)=>`<span class="scene-decor scene-decor-${i}">${decorSvg(d)}</span>`).join("")}</div>
      <div class="scene-floor-glow"></div>
    </div>`;
  }


  function pujaScene(day=1, mantraTitle="Ganesh Puja"){
    const n=Math.max(1,Number(day)||1), accent=["#ffd25f","#f09f7d","#86d6bd","#e9a6c0"][n%4];
    return `<svg class="ritual-art" viewBox="0 0 520 260" role="img" aria-label="Daily Ganesh puja scene">
      <defs>
        <radialGradient id="pujaGlow${n}"><stop stop-color="${accent}" stop-opacity=".4"/><stop offset="1" stop-color="#07181d" stop-opacity="0"/></radialGradient>
        <linearGradient id="altar${n}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9b5a2c"/><stop offset="1" stop-color="#52281d"/></linearGradient>
      </defs>
      <rect width="520" height="260" rx="18" fill="#08191f"/>
      <circle cx="260" cy="115" r="135" fill="url(#pujaGlow${n})"/>
      <path d="M70 210 Q260 185 450 210 L450 245 L70 245Z" fill="#6e452f" opacity=".7"/>
      <rect x="165" y="160" width="190" height="55" rx="10" fill="url(#altar${n})" stroke="#d8a75b" stroke-width="2"/>
      <rect x="205" y="145" width="110" height="22" rx="7" fill="#d29a45" stroke="#ffe0a2" stroke-width="2"/>
      <g transform="translate(260 119)">
        <circle cx="0" cy="-24" r="23" fill="#e1a873"/>
        <ellipse cx="-24" cy="-24" rx="15" ry="25" fill="#e7b584"/>
        <ellipse cx="24" cy="-24" rx="15" ry="25" fill="#e7b584"/>
        <path d="M4 -12 Q28 7 7 30 Q-4 33 -5 18 Q11 12 4-12" fill="#dda46e"/>
        <ellipse cx="0" cy="24" rx="30" ry="33" fill="#c74736"/>
        <path d="M-15 -45 Q0 -72 15 -45Z" fill="#d4a538" stroke="#ffe49a" stroke-width="2"/>
        <circle cx="-8" cy="-27" r="2.8" fill="#1c2225"/><circle cx="8" cy="-27" r="2.8" fill="#1c2225"/>
      </g>
      ${[125,395].map(x=>`<g transform="translate(${x} 165)"><path d="M0 25 q15 10 30 0 q-5 20-15 20t-15-20" fill="#b96c2a"/><path d="M15 20 q-8-16 0-26 q10 11 0 26" fill="#ffd95b"/></g>`).join("")}
      <g transform="translate(113 188)">${rosette(0,0,26,9,"#df5c67","#ffd67c")}</g>
      <g transform="translate(406 188)">${rosette(0,0,26,9,"#f1a81d","#ffe094")}</g>
      <path d="M198 224 Q260 197 322 224" fill="none" stroke="#f4cb73" stroke-width="3" stroke-dasharray="3 6"/>
      <text x="260" y="34" text-anchor="middle" fill="#efd59a" font-family="Georgia,serif" font-size="14">${esc(mantraTitle)}</text>
      <text x="260" y="54" text-anchor="middle" fill="#8fb3ad" font-family="Arial,sans-serif" font-size="10">DAY ${n} · PUJA & LEARNING</text>
    </svg>`;
  }

  function processionSvg(step=0, complete=false){
    const s=clamp(Number(step)||0,0,6);
    const water = s>=4;
    const farewell = complete || s>=6;
    return `<svg class="procession-art" viewBox="0 0 620 280" role="img" aria-label="Ganesh festival procession and visarjan scene">
      <defs>
        <linearGradient id="skyProc" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${water?"#122e4c":"#182c39"}"/><stop offset="1" stop-color="#09171d"/></linearGradient>
        <radialGradient id="moonProc"><stop stop-color="#fff1bd"/><stop offset="1" stop-color="#fff1bd" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="620" height="280" rx="18" fill="url(#skyProc)"/>
      <circle cx="505" cy="55" r="52" fill="url(#moonProc)"/><circle cx="505" cy="55" r="18" fill="#fff0bd"/>
      <path d="M0 170 L70 120 116 156 177 94 241 156 312 115 375 162 443 108 515 155 570 119 620 150 V215 H0Z" fill="#102a2e"/>
      ${water?'<path d="M0 208 Q90 188 180 208 T360 208 T540 208 T720 208 V280 H0Z" fill="#154b65"/><path d="M0 226 Q85 208 170 226 T340 226 T510 226 T680 226" fill="none" stroke="#7fc6d4" stroke-opacity=".45" stroke-width="3"/>':'<path d="M0 218 L620 190 V280 H0Z" fill="#4a3529"/><path d="M0 237 L620 210" stroke="#d6a55d" stroke-opacity=".3" stroke-width="3"/>'}
      <g transform="translate(${135+s*48} ${water?151:165})">
        <rect x="-48" y="40" width="96" height="18" rx="5" fill="#c88d34"/>
        <circle cx="-35" cy="61" r="8" fill="#1d2426"/><circle cx="35" cy="61" r="8" fill="#1d2426"/>
        <g transform="translate(0 8)" opacity="${farewell ? .72 : 1}">
          <circle cy="-18" r="17" fill="#e1a873"/><ellipse cx="-19" cy="-18" rx="12" ry="19" fill="#e8b682"/><ellipse cx="19" cy="-18" rx="12" ry="19" fill="#e8b682"/>
          <path d="M3 -8 Q20 5 5 23 Q-3 24-4 13 Q8 9 3-8" fill="#dca16b"/><ellipse cy="18" rx="23" ry="27" fill="#d14d38"/>
          <path d="M-11 -34 Q0 -55 11 -34Z" fill="#d4a538" stroke="#ffe49a" stroke-width="1.5"/>
        </g>
      </g>
      ${Array.from({length:14},(_,i)=>{
        const x=30+i*40+(i%3)*5, y=212-(i%4)*8;
        return `<g transform="translate(${x} ${y})"><circle cy="-23" r="7" fill="#9a6b4d"/><path d="M-8 -15 L8 -15 L12 17 L-12 17Z" fill="${["#b63a38","#d69326","#377f72","#7356a3"][i%4]}"/><path d="M-5 17 v17 M5 17 v17" stroke="#5c493c" stroke-width="4"/></g>`;
      }).join("")}
      <g transform="translate(72 201)"><circle cx="0" cy="0" r="17" fill="#c8893a"/><circle cx="0" cy="0" r="11" fill="#5e321e"/><path d="M-23 -9 L23 9 M-23 9 L23 -9" stroke="#f0c26e" stroke-width="3"/></g>
      ${Array.from({length:9},(_,i)=>`<circle cx="${35+i*66}" cy="${68+(i%3)*13}" r="${2+(i%2)}" fill="${i%2?"#ffd65d":"#ef7e8f"}" opacity=".8"/>`).join("")}
      <text x="24" y="34" fill="#f0d59d" font-family="Georgia,serif" font-size="17">${farewell?"Visarjan · Until next year":"Ganpati Bappa Morya"}</text>
      <text x="24" y="54" fill="#8fb3ad" font-family="Arial,sans-serif" font-size="10">PROCESSION STEP ${s+1} OF 7</text>
    </svg>`;
  }

  function festivalDaySvg(day=1,duration=3){
    const d=Math.max(1,Number(day)||1), total=Math.max(d,Number(duration)||3), night=d%2===0;
    return `<svg class="festival-day-art" viewBox="0 0 520 210" role="img" aria-label="Festival day ${d} of ${total}">
      <defs><linearGradient id="fd${d}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${night?"#183b5c":"#a85c35"}"/><stop offset="1" stop-color="#08171d"/></linearGradient></defs>
      <rect width="520" height="210" rx="18" fill="url(#fd${d})"/>
      <circle cx="430" cy="45" r="22" fill="${night?"#f3e7bc":"#f5c95c"}" opacity=".95"/>
      <path d="M0 156 Q80 130 160 156 T320 156 T480 156 T640 156 V210 H0Z" fill="#15342f"/>
      <path d="M140 160 L168 95 L196 160 M324 160 L352 95 L380 160" fill="none" stroke="#d89b3e" stroke-width="8"/>
      <path d="M150 110 Q260 48 370 110" fill="none" stroke="#edba71" stroke-width="5"/>
      ${Array.from({length:8},(_,i)=>`<circle cx="${158+i*29}" cy="${106-Math.sin(i/7*Math.PI)*35}" r="4" fill="${i%2?"#f5a4b8":"#ffd45f"}"/>`).join("")}
      <rect x="214" y="123" width="92" height="38" rx="8" fill="#8a4d2d" stroke="#e3b66e" stroke-width="2"/>
      <text x="260" y="72" text-anchor="middle" fill="#fff0c7" font-family="Georgia,serif" font-size="26">Day ${d}</text>
      <text x="260" y="92" text-anchor="middle" fill="#d7c9aa" font-family="Arial,sans-serif" font-size="11">OF ${total} FESTIVAL DAYS</text>
    </svg>`;
  }

  window.GFJArt={mandapSvg,decorSvg,pujaSvg,scene,pujaScene,processionSvg,festivalDaySvg};
})();