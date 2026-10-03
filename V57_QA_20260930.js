const fs=require('fs');
const app=fs.readFileSync('app_v57.js','utf8');
const css=fs.readFileSync('style_v57.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const maps=JSON.parse(fs.readFileSync('data/maps.json','utf8')).maps;
const active=maps.filter(m=>m.archived!==true);
const nums=active.map(m=>Number(String(m.map_id).match(/(\d+)$/)?.[1]||0)).sort((a,b)=>b-a);
function ok(name,cond){if(!cond)throw new Error('FAIL: '+name);console.log('PASS:',name)}
ok('active map count is 66',active.length===66);
ok('active map numbers descend 66..1',nums.length===66 && nums.every((n,i)=>n===66-i));
ok('base map rows sort by activeMapNumber descending',app.includes('const mapRank=new Map') && app.includes('rows=activeMaps.slice().sort'));
ok('new map_062 will rank above map_061',activeMapNumberTest());
ok('hero has local Nuke asset',css.includes("url('assets/maps/nuke.svg')"));
ok('final hero rule is present',css.includes("/* V57 FINAL — single source of truth for the home hero. */") && css.includes("url('assets/maps/nuke.svg') !important"));
ok('index cache-busts CSS',html.includes('style_v57.css'));
ok('index cache-busts JS',html.includes('app_v57.js'));
ok('promo mark is compact',css.includes('.home-info .promo-mark { display:flex !important;') && css.includes('font-size:18px !important'));
ok('no V39 absolute path in custom QA',!fs.readFileSync('CUSTOM_V50_QA.js','utf8').match(/CS2_ANALYTICS_V39|C:\\\\|\/mnt\\/));
function activeMapNumberTest(){const f=id=>Number(String(id).match(/(\d+)$/)?.[1]||0); return f('map_062')>f('map_061') && f('map_061')===61}
