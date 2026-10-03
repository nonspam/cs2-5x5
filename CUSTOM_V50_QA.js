const fs=require('fs');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('style.css','utf8');
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
assert(app.includes("baseMode:'maps'"),'Default mode must be All Games');
assert(app.includes('activeMapNumber(b.mp.map_id)-activeMapNumber(a.mp.map_id)'),'All Games ordering must be newest map number first');
assert(css.includes("url('assets/maps/nuke.svg')!important"),'Hero Nuke asset missing');
assert(css.includes('.home-info .promo-mark{font-size:22px!important'),'Promo mark sizing missing');
console.log('CUSTOM QA PASS');
