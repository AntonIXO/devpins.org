// Surface anchors are generated from atlas vertices in public/mind/regions.json.
export const mindZones = [
 {id:'bridge',number:'01',area:'Parietal association cortex',color:'#568cff',position:[1.35,.86,.89]},
 {id:'motor',number:'02',area:'Precentral gyrus / motor cortex',color:'#4bd4a1',position:[1.19,1.07,.12]},
 {id:'root',number:'03',area:'Insular cortex',color:'#e48155',position:[1.04,.18,.03]},
 {id:'audio',number:'04',area:'Temporal cortex',color:'#d16eaa',position:[1.53,-.19,.75]},
 {id:'vision',number:'05',area:'Occipital cortex',color:'#9c78e4',position:[1.08,.17,1.79]},
 {id:'frontal',number:'06',area:'Frontal cortex',color:'#dfab5e',position:[1.28,.36,-.54]},
];

// Every CV entry belongs to exactly one territory. Content stays in cv.ts.
export const cvRegionProjects: Record<string, string[]> = {
 bridge: ['sensorlm'], motor: ['optihealth'], root: ['sailfish'],
 audio: ['firmware', 'player'], vision: ['dreamwalker', 'aireader'], frontal: ['minebit'],
};
export const cvRegionLabels: Record<string, string> = {
 bridge: 'Research & learning', motor: 'Health & movement', root: 'Systems & skills',
 audio: 'Audio & firmware', vision: 'Worlds & interfaces', frontal: 'Builds & identity',
};

export const cvSummary = [
 {id:'sensorlm',region:'bridge',label:'Sensor Language Models'},
 {id:'optihealth',region:'motor',label:'optiHealth'},
 {id:'sailfish',region:'root',label:'SailfishOS on ARM'},
 {id:'firmware',region:'audio',label:'Audio & Android firmware'},
 {id:'player',region:'audio',label:'Bit-perfect Player'},
 {id:'dreamwalker',region:'vision',label:'Dream Walker'},
 {id:'aireader',region:'vision',label:'AI Reader'},
 {id:'minebit',region:'frontal',label:'MineBit'},
 {id:'education',region:'bridge',label:'Education'},
 {id:'skills',region:'root',label:'Skills'},
 {id:'sport',region:'motor',label:'Sport'},
 {id:'awards',region:'frontal',label:'Awards'},
 {id:'misc-vibe',region:'frontal',label:'Misc vibe coding'},
 {id:'about',region:'frontal',label:'About & contact'},
];
