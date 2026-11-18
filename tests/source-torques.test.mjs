import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GF_GUIDE,AGRU_160,selectedTorque,resolveParts,selectionKey} from '../dist/logic.js';
const base={family:'gf_ecofit',od:160,pn:10,sdr:11,connection:'fixed',gasket:'epdm_profile',lubrication:'lubed'};
test('all GF flat/profile and lubed/unlubed entries match the independently extracted PDF fixture',()=>{
 const rows=readFileSync(new URL('./fixtures/gf-2026-IV-311.csv',import.meta.url),'utf8').trim().split(/\r?\n/).slice(1);
 const expected=rows.flatMap(line=>{const [ods,dn,bolts,fl,fu,pl,pu]=line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x=>x.replaceAll('"',''));return ods.split(',').map(od=>({od:+od,dn:+dn,flat:[+fl,+fu],profile:[+pl,+pu]}));});
 assert.equal(rows.length,19);assert.equal(expected.length,25);assert.deepEqual(GF_GUIDE,expected);
});
test('GF d160 profile is 35 lubed and 46 unlubed; flat is 60 and 78',()=>{
 for(const pn of [10,16])for(const [gasket,expected] of [['epdm_profile',[35,46]],['epdm_flat',[60,78]]])for(const [i,lubrication] of ['lubed','unlubed'].entries()){
 const t=selectedTorque({...base,pn,gasket,lubrication});assert.equal(t.value[1],expected[i]);assert.equal(t.kind,'guideline');assert.equal(t.manufacturer,'GF');assert.match(t.page,/311/);assert.equal(t.pressureLimit,null);
 }
});
test('GF source anomaly is preserved: d200 lubed/unlubed flat 75/91, never recomputed',()=>{assert.deepEqual(GF_GUIDE.find(x=>x.od===200).flat,[75,91]);});
test('unknown profile or unknown GF lubrication never selects a moment',()=>{for(const gasket of ['epdm','oring','other','grafex'])assert.equal(selectedTorque({...base,gasket}).value,null,gasket);for(const lubrication of [undefined,'','unknown'])assert.equal(selectedTorque({...base,lubrication}).value,null);});
test('GF ecoFIT data never silently becomes ELGEF Plus, another brand or a blind-flange torque',()=>{for(const family of ['gf','ulefos','standard','plasson','extena','pipelife'])assert.equal(selectedTorque({...base,family}).value,null,family);for(const connection of ['blind','pair'])assert.equal(selectedTorque({...base,connection}).value,null,connection);assert.equal(resolveParts({...base,family:'gf'}).blocked,true);});
test('AGRU d160 C.9 guidance is distinct from the backing flange maximum',()=>{for(const [gasket,nm,pressure] of [['epdm_profile',40,16],['epdm_flat',60,10]]){const s={...base,family:'agru',gasket},t=selectedTorque(s),r=resolveParts(s);assert.equal(t.value[1],nm);assert.equal(t.maximumTorque,95);assert.equal(t.pressureLimit,pressure);assert.match(t.conditions.join(' '),/80 Shore A/);assert.match(t.conditions.join(' '),/0,15/);assert.equal(r.flange.article,'14.014.0160.11');assert.equal(r.flange.thickness,23);assert.equal(r.flange.thread,20);assert.equal(r.jointPn,null);}});
test('unreviewed AGRU dimensions, unknown profiles and Grafex have no invented torque',()=>{for(const od of [110,200,225,315]){const s={...base,family:'agru',od};assert.equal(selectedTorque(s).value,null);assert.equal(resolveParts(s).blocked,true);}for(const gasket of ['epdm','grafex','other','oring'])assert.equal(selectedTorque({...base,family:'agru',gasket}).value,null);});
test('changing lubrication changes joint identity and unsupported rr gasket profiles stay blocked',()=>{assert.notEqual(selectionKey(base),selectionKey({...base,lubrication:'unlubed'}));for(const family of ['rr_hp','rr_sf'])for(const gasket of ['epdm','epdm_flat','grafex'])assert.equal(selectedTorque({...base,family,gasket}).value,null);});
