const fs=require('fs');
const app=fs.readFileSync('app_v57.js','utf8');
const css=fs.readFileSync('style_v57.css','utf8');
const checks=[
  ['cloud render waits for authoritative remote',app.includes("if(!state.cloudMode){")&&app.includes('loadServerState()')&&app.includes('const [remote, admin] = await Promise.all')&&app.includes('render();\n    preloadMapPhotos();')],
  ['home counters are data-driven',app.includes('${activeMapCount()}')&&app.includes('${activePlayers().length}')&&app.includes('new Set(activeMaps.map(x=>mapKey(x.map))).size')],
  ['home table uses fixed layout',css.includes('.home-rebuild .home-last-table{font-size:12px!important;width:100%!important;table-layout:fixed!important;}')],
  ['home K/D has bounded cell width',css.includes('width:100%!important;text-align:center!important;font-variant-numeric:tabular-nums!important;')],
  ['refresh responses are sequence-guarded',app.includes('SERVER_REFRESH_SEQ')&&app.includes('if(seq!==SERVER_REFRESH_SEQ)return false;')],
  ['no hard-coded 61-map home counter',!app.includes('<b>61</b><span>Карт</span>')],
];
for(const [name,ok] of checks){if(!ok)throw new Error('FAIL: '+name);console.log('PASS:',name)}
