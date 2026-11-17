import test from 'node:test';
import assert from 'node:assert/strict';
import {DATA} from '../dist/data.js';
import {resolveParts,torqueRow,calculateBolt,DUO_THICKNESS,catalogKit,selectionKey} from '../dist/logic.js';
const base={family:'standard',od:200,pn:10,sdr:11,connection:'blind',collar:'long'};
test('PE200 uses DN200 for standard flange and DN150 for reduced SF',()=>{assert.equal(resolveParts(base).dn,200);assert.equal(resolveParts({...base,family:'ibeco_sf'}).dn,150);});
test('PN changes hole count and does not invent a PN16 blind article',()=>{const a=resolveParts(base),b=resolveParts({...base,pn:16});assert.equal(a.flange.bolts,8);assert.equal(b.flange.bolts,12);assert.equal(a.blind.article,'BF200-2');assert.equal(b.blind,undefined);});
test('PN16 is blocked for SDR17 catalog products',()=>assert.equal(resolveParts({...base,pn:16,sdr:17}).blocked,true));
test('collar thickness and RSK change with SDR',()=>{const a=resolveParts(base).selectedCollar,b=resolveParts({...base,sdr:17}).selectedCollar;assert.equal(a.h,32);assert.equal(b.h,24);assert.equal(a.rsk,'240 99 03');assert.equal(b.rsk,'240 99 22');});
test('unknown dimensions and anomalous catalog rows never get a guessed result',()=>{assert.equal(resolveParts({...base,od:999}).blocked,true);assert.equal(resolveParts({...base,od:710}).blocked,true);});
test('HP PN10 PE110 selects exact flange pair',()=>{const r=torqueRow('hp',10,110);assert.equal(r.dn,100);assert.deepEqual(r.a,[11,38,45]);assert.deepEqual(r.b,[12,55,64]);});
test('SF PN16 PE200 uses the correct reduced DN and gasket columns',()=>{const r=torqueRow('sf',16,200);assert.equal(r.dn,150);assert.deepEqual(r.a,[30,72,84]);assert.deepEqual(r.b,[32,66,78]);});
test('all imported torque rows have ordered limits and unique source keys',()=>{assert.equal(DATA.torques.length,86);const keys=DATA.torques.map(x=>[x.family,x.pn,x.od].join('/'));assert.equal(new Set(keys).size,keys.length);for(const r of DATA.torques)for(const v of [r.a,r.b])assert.ok(v[0]<=v[1]&&v[1]<=v[2]);});

const boltBase={a:30,b:28,gasket:3,washerA:3,washerB:3,nut:18,pitch:2.5,turnsMin:2,turnsMax:3,stock:'80,85,90,95,100'};
test('through-bolt includes each stack component once, excludes the head',()=>{const r=calculateBolt(boltBase);assert.equal(r.body,85);assert.equal(r.min,90);assert.equal(r.max,92.5);assert.equal(r.candidate,90);assert.equal(r.actualTurns,2);});
test('rounding never recommends a bolt beyond maximum requested protrusion',()=>{const r=calculateBolt({...boltBase,a:32,b:25,nut:16});assert.equal(r.min,87);assert.equal(r.max,89.5);assert.equal(r.candidate,null);assert.equal(r.next,90);});
test('both plastic sides must be included independently',()=>{const r=calculateBolt({...boltBase,a:54,b:54});assert.equal(r.body,135);assert.equal(r.min,140);});
test('blank inputs never become zero and negative or invalid hardware is rejected',()=>{for(const key of ['a','b','gasket','washerA','washerB','nut','pitch'])assert.throws(()=>calculateBolt({...boltBase,[key]:''}));for(const pitch of [0,-1,'bad',Infinity])assert.throws(()=>calculateBolt({...boltBase,pitch}));assert.throws(()=>calculateBolt({...boltBase,turnsMax:1}));});
test('explicit zero gasket and comma decimals are accepted',()=>{assert.equal(calculateBolt({...boltBase,gasket:0}).gasket,0);assert.equal(calculateBolt({...boltBase,pitch:'2,5'}).pitch,2.5);});
test('stock list validation, sorting and inclusive end points',()=>{assert.throws(()=>calculateBolt({...boltBase,stock:'90mm'}));assert.throws(()=>calculateBolt({...boltBase,stock:''}));assert.throws(()=>calculateBolt({...boltBase,stock:'90.5'}));assert.equal(calculateBolt({...boltBase,stock:'100; 90 90,85'}).candidate,90);assert.equal(calculateBolt({...boltBase,turnsMin:4,turnsMax:4,stock:'95'}).candidate,95);});
test('DUO data is product specific and not a blind flange assumption',()=>{assert.equal(DUO_THICKNESS[200],22);assert.equal(DUO_THICKNESS[600],46);assert.equal(DUO_THICKNESS[700],undefined);});

test('catalog kit is a material-specific reference with separate PN lengths',()=>{
 const s={...base,gasket:'epdm'};
 assert.equal(catalogKit(s,resolveParts(s)).length,110);
 const b={...s,pn:16};assert.equal(catalogKit(b,resolveParts(b)).length,120);
 for(const gasket of ['grafex','other','oring'])assert.equal(catalogKit({...s,gasket},resolveParts(s)),null);
 assert.equal(catalogKit({...s,family:'ibeco_sf'},resolveParts({...s,family:'ibeco_sf'})),null);
 const conflict={...resolveParts(s),flange:{bolts:4,thread:16},dn:200};assert.equal(catalogKit(s,conflict).conflict,true);
});
test('assembly identity changes with gasket and every dimension or part choice',()=>{
 const s={...base,gasket:'epdm'};
 for(const [key,value] of Object.entries({gasket:'grafex',od:225,pn:16,sdr:17,collar:'short',connection:'pair',family:'ibeco_sf'}))assert.notEqual(selectionKey(s),selectionKey({...s,[key]:value}));
});
