(() => {
  "use strict";

  const architectures = [
    "Temple Arch","Royal Pavilion","Lotus Canopy","Heritage Mantap",
    "Village Pandal","Floral Dome","Maratha Darbar","South Indian Gopuram",
    "Moon Pavilion","Bamboo Eco Mandap","Rangoli Court","Deepam Hall"
  ];

  const themes = [
    ["Saffron Gold","#d99a2b","#7b2519"],
    ["Emerald","#15805f","#0c3f35"],
    ["Royal Blue","#315cc7","#18245f"],
    ["Rose","#d4507e","#6f2145"],
    ["Ivory","#e9dfc8","#7c6752"],
    ["Marigold","#f2a50c","#7d3d00"],
    ["Moon Silver","#9aa9bf","#2f3a50"],
    ["Lotus Pink","#e67fa6","#6f2b49"],
    ["Forest","#3d7f47","#233f2b"],
    ["Festival Red","#c84137","#6e1717"]
  ];

  const decorCategories = [
    ["Flower Garland","🌼"],["Marigold Toran","🌼"],["Mango Leaf Toran","🌿"],
    ["Fairy Lights","✨"],["Deepam Row","🪔"],["Brass Bells","🔔"],
    ["Rangoli","✥"],["Lotus Arrangement","🪷"],["Banana Stem","🌿"],
    ["Kalash","🏺"],["Fabric Drapes","🎗️"],["Backdrop","🧵"],
    ["Flower Pillar","🌸"],["Ceiling Hangings","🎊"],["Floor Lamps","🪔"],
    ["Coconut Decor","🥥"],["Sugarcane Arch","🌾"],["Rice Sheaf","🌾"],
    ["Peacock Accent","🦚"],["Umbrella Canopy","☂️"]
  ];

  const pujaItems = [
    ["Durva grass","🌿",8],["Red flowers","🌺",8],["Lotus","🪷",12],
    ["Coconut","🥥",10],["Bananas","🍌",8],["Modaks","🥟",12],
    ["Incense","♨️",6],["Camphor","🔥",7],["Ghee diya","🪔",10],
    ["Cotton wicks","🧶",5],["Turmeric","🟡",5],["Kumkum","🔴",5],
    ["Sandal paste","🟤",8],["Akshata rice","🌾",6],["Betel leaves","🍃",7],
    ["Betel nuts","🟤",6],["Kalash water","🏺",8],["Panchamrit","🥛",12],
    ["Fruits","🍎",10],["Jaggery","🟫",7],["Flowers basket","💐",12],
    ["Aarti plate","🪔",14],["Sacred thread","🧵",6],["Bell","🔔",10],
    ["Prasadam plate","🍽️",12]
  ].map((x,i)=>({id:`puja-${i+1}`,name:x[0],icon:x[1],price:x[2]}));

  const mantras = [
    {
      id:"vakratunda",
      title:"Vakratunda Mahakaya",
      type:"Traditional invocation shloka",
      devanagari:"वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
      transliteration:"vakratuṇḍa mahākāya sūryakoṭi samaprabha | nirvighnaṃ kuru me deva sarva-kāryeṣu sarvadā ||",
      simple:"Vakratunda Mahakaya Suryakoti Samaprabha, Nirvighnam Kuru Me Deva Sarva Karyeshu Sarvada.",
      meaning:"O curved-trunked, mighty-bodied Lord, radiant like millions of suns, please remove obstacles from all my undertakings, always.",
      source:"Traditional community worship; text cross-checked with the Hindu Temple Community of Ottawa mantra library."
    },
    {
      id:"shuklambaradharam",
      title:"Shuklambaradharam",
      type:"Traditional opening prayer",
      devanagari:"शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम् । प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये ॥",
      transliteration:"śuklāmbaradharaṃ viṣṇuṃ śaśivarṇaṃ caturbhujam | prasanna-vadanaṃ dhyāyet sarva-vighnopaśāntaye ||",
      simple:"Shuklambaradharam Vishnum Shashivarnam Chaturbhujam, Prasanna Vadanam Dhyayet Sarva Vighnopashantaye.",
      meaning:"Meditate on the all-pervading Lord, clad in white, moon-hued, four-armed and serene, for the quieting of obstacles.",
      source:"Traditional opening prayer; text cross-checked with the Hindu Temple Community of Ottawa mantra library."
    },
    {
      id:"gajananam",
      title:"Gajananam Bhuta Ganadi Sevitam",
      type:"Ganesha dhyana shloka",
      devanagari:"गजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम् । उमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपङ्कजम् ॥",
      transliteration:"gajānanaṃ bhūta-gaṇādi-sevitaṃ kapittha-jambū-phala-cāru-bhakṣaṇam | umā-sutaṃ śoka-vināśa-kārakaṃ namāmi vighneśvara-pāda-paṅkajam ||",
      simple:"Gajananam Bhuta Ganadi Sevitam, Kapittha Jambu Phala Charu Bhakshanam, Uma Sutam Shoka Vinasha Karakam, Namami Vighneshwara Pada Pankajam.",
      meaning:"I bow to the lotus feet of the elephant-faced Lord, served by divine hosts, son of Uma and remover of sorrow.",
      source:"Traditional Ganesha dhyana shloka; text cross-checked with the Hindu Temple Community of Ottawa mantra library."
    },
    {
      id:"ganapati-beeja",
      title:"Om Gam Ganapataye Namah",
      type:"Ganapati bija mantra",
      devanagari:"ॐ गं गणपतये नमः ॥",
      transliteration:"oṃ gaṃ gaṇapataye namaḥ",
      simple:"Om Gam Ganapataye Namah.",
      meaning:"Salutations to Ganapati.",
      source:"Traditional Ganapati bija mantra; text cross-checked with the Hindu Temple Community of Ottawa mantra library."
    },
    {
      id:"ganapati-gayatri",
      title:"Ganapati Gayatri",
      type:"Ganapati Atharvashirsha Gayatri",
      devanagari:"ॐ एकदन्ताय विद्महे । वक्रतुण्डाय धीमहि । तन्नो दन्तिः प्रचोदयात् ॥",
      transliteration:"oṃ ekadantāya vidmahe | vakratuṇḍāya dhīmahi | tanno dantiḥ pracodayāt ||",
      simple:"Om Ekadantaya Vidmahe, Vakratundaya Dhimahi, Tanno Dantih Prachodayat.",
      meaning:"May we know the one-tusked Lord, meditate on the curved-trunked Lord, and may the tusked One inspire and guide our understanding.",
      source:"Ganapati Atharvashirsha; wording cross-checked against published Sanskrit scholarship and traditional sources."
    }
  ];

  function pad(n){ return String(n).padStart(3,"0"); }

  const idols = Array.from({length:131},(_,i)=>{
    const n=i+1;
    const sizes=[1,2,3,4,5];
    const styles=["Traditional","Eco clay","Royal","Lotus","Dancing","Scholar","Village","Temple","Floral","Gemstone"];
    const colors=["Saffron","Ivory","Emerald","Ruby","Royal blue","Rose","Gold","Terracotta","Silver","Multicolor"];
    return {
      id:`idol-${pad(n)}`,
      name:`Ganesha Idol ${pad(n)}`,
      image:`assets/idols/idol_${pad(n)}.png`,
      sizeFt:sizes[i%sizes.length],
      style:styles[i%styles.length],
      color:colors[(i*3)%colors.length],
      price:45 + (i%5)*20 + Math.floor(i/20)*5,
      rarity:i%17===0?"heritage":i%9===0?"special":"classic"
    };
  });

  const mandaps = [];
  architectures.forEach((arch,a)=>{
    themes.forEach((theme,t)=>{
      mandaps.push({
        id:`mandap-${pad(mandaps.length+1)}`,
        name:`${theme[0]} ${arch}`,
        architecture:arch,
        theme:theme[0],
        primary:theme[1],
        secondary:theme[2],
        pattern:(a+t)%6,
        pillars:2 + ((a+t)%4),
        roof:["arch","dome","canopy","gopuram"][(a*3+t)%4],
        price:70 + a*9 + t*6
      });
    });
  });

  const decorations = Array.from({length:500},(_,i)=>{
    const cat=decorCategories[i%decorCategories.length];
    const tier=1+(i%5);
    const theme=themes[(i*7)%themes.length];
    return {
      id:`decor-${pad(i+1)}`,
      name:`${theme[0]} ${cat[0]} ${1+Math.floor(i/decorCategories.length)}`,
      category:cat[0],
      icon:cat[1],
      tier,
      primary:theme[1],
      secondary:theme[2],
      price:4 + tier*3 + (i%7)
    };
  });

  window.GFJData = {
    version:5,
    difficulties:{
      easy:{label:"Easy",multiplier:0.8,reward:1},
      medium:{label:"Medium",multiplier:1,reward:1.35},
      hard:{label:"Hard",multiplier:1.25,reward:1.8}
    },
    stages:[
      {id:"memory",name:"Ganesha Memory",icon:"◈",skill:"Spatial focus"},
      {id:"math",name:"Modak Math",icon:"×",skill:"Mental arithmetic"},
      {id:"hunt",name:"Mushak Hunt",icon:"⌕",skill:"Visual discovery"},
      {id:"sequence",name:"Ganesha Sequence",icon:"♫",skill:"Sequential recall"},
      {id:"pattern",name:"Festival Pattern",icon:"✥",skill:"Pattern logic"}
    ],
    durations:[3,6,9,11],
    idols,
    mandaps,
    decorations,
    pujaItems,
    mantras
  };
})();