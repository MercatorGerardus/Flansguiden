import {DATA} from './data.js';
import {resolveParts,sizes,torqueRow,torqueValue,SOURCE,HP_SOURCE,SF_SOURCE,GF_SOURCE,calculateBolt,DUO_THICKNESS,GASKETS,KIT_SOURCE,catalogKit,selectionKey} from './logic.js';
const $=id=>document.getElementById(id);
let pn=10, boltText='', currentText='', boltBinding=null, boltContextKey=null;
const gasketNote=value=>value==='grafex'?'Bilden visar Grafex EX DN200 PN10–16, nominellt 3 mm. Monterad tjocklek och moment behöver verifieras för din produkt.':value==='oring'?'Kontrollera O-ringens utförande och spåret. Monterad spalt anges separat.':value==='epdm'?'Kontrollera exakt profil, fabrikat och utförande för plast eller metall. Stålinlägg ensamt fastställer inte moment eller tjocklek.':'Ange produktens mått och följ dess monteringsanvisning.';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>url?`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:`<span>${label} · Original-PDF finns i projektunderlaget. Publik dokumentlänk återstår.</span>`;
function option(value,label){return `<option value="${esc(value)}">${esc(label)}</option>`;}
function diagram(dn,blind){return `<div class="diagram"><svg viewBox="0 0 520 170" role="img" aria-label="Principskiss av flänsförband. Inte en måttritning."><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#53716a" stroke-width=".5" opacity=".22"/></pattern></defs><rect width="520" height="170" fill="url(#grid)"/><g stroke="#a7c58b" stroke-width="1.5"><path d="M35 62H167V108H35" fill="#284b45"/><path d="M35 72H155V98H35" fill="#123337"/><path d="M167 44H183V126H167Z" fill="#637c61"/><path d="M184 37H198V133H184Z" fill="#244741"/><path d="M204 49H211V121H204Z" fill="#cde99d"/>${blind?'<path d="M216 37H238V133H216Z" fill="#49716c"/><path d="M239 73H278V97H239" fill="#30534e"/><path d="M249 74V96M255 74V96M261 74V96M267 74V96" stroke-width=".6"/>':'<path d="M217 37H231V133H217Z" fill="#244741"/><path d="M232 44H248V126H232Z" fill="#637c61"/><path d="M248 62H378V108H248Z" fill="#284b45"/><path d="M260 72H378V98H260" fill="#123337"/>'}<path d="M174 48H244M174 122H244" stroke="#e1e8d7" stroke-width="5"/><path d="M176 40V55M241 40V55M176 115V130M241 115V130" stroke="#d4dfc7" stroke-width="6"/><path d="M20 85H400" stroke="#87a58c" stroke-dasharray="5 5" stroke-width=".7"/><path d="M403 38H417M403 132H417M410 38V132" stroke-width=".8"/></g><g fill="#a8c1ae" font-family="monospace" font-size="10"><text x="50" y="143">PE-RÖR</text><text x="280" y="37">${blind?'BLINDFLÄNS + UTTAG':'FLÄNSFÖRBAND'}</text><text x="424" y="89">DN ${dn??'—'}</text><text x="20" y="20" font-size="8" fill="#749387">PRINCIPSKISS · EJ SKALENLIG</text></g></svg></div>`;}
function state(){return {family:$('family').value,od:+$('od').value,sdr:+$('sdr').value,pn,connection:$('connection').value,collar:$('collar').value,gasket:$('gasket').value};}
function fillSizes(){const old=+$('od').value;const opts=sizes($('family').value);$('od').innerHTML=opts.map(d=>option(d,`Ø ${d} mm`)).join('');$('od').value=opts.includes(old)?old:opts.includes(200)?200:opts[0];$('collar-field').hidden=$('family').value!=='standard';}
function row(name,detail,qty,wait=false){return `<div class="pick-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="qty ${wait?'wait':''}">${qty}</span></div>`;}
function renderParts(){
 const s=state(),r=resolveParts(s),blind=s.connection==='blind';
 $('gasket-note').textContent=gasketNote(s.gasket);
 if(boltBinding?.key!==selectionKey(s))boltBinding=null;
 if(boltContextKey&&boltContextKey!==selectionKey(s))boltContextKey=null;
 const saved=boltBinding, kit=catalogKit(s,r);
 const lengthText=saved?`${r.flange.bolts} × M${r.flange.thread} × ${saved.length} mm`:'Ej fastställd';
 const reference=kit?`<div class="notice"><h3>IBECO:s långa EPDM-bultsats · katalogreferens</h3><strong>${kit.bolts} × M${kit.thread} × ${kit.length} mm</strong><p>RSK ${kit.rsk} · PN${kit.pn}. A2-bult och bricka, A4-mutter, RSG-TW-packning. ${kit.conflict?'OBS: satsens hålbild avviker från vald lösfläns. Välj inte satsen till detta förband.':'Längden gäller satsens måttskiss. Passning till ditt valda förband är inte verifierad.'}</p><p>Kontrollera delmåtten mot ritningen, särskilt för blindfläns, HP eller två plaständar. Referensen förs inte till plocklistan som färdig bultlängd.</p>${link(KIT_SOURCE,'Visa bultsats och måttskiss')}</div>`:'';
 const title=`PE Ø${s.od} · SDR${s.sdr} · PN${s.pn}`;
 if(r.blocked){$('parts-result').innerHTML=`<div class="result-top"><span class="caption">Ditt förband</span><span class="status warn">UNDERLAG SAKNAS</span></div>${diagram(r.dn,blind)}<div class="empty"><h3>${r.message}</h3><p>${r.detail??'Välj en annan kombination eller kontrollera produktens datablad.'}</p></div><div class="source-link">${link(r.gf?GF_SOURCE:SOURCE,r.gf?'Öppna GF:s verktyg':'Visa IBECO-katalogen')}</div>`;$('picklist').innerHTML=row('Ingen färdig plocklista',esc(r.message),'Kontroll krävs',true);currentText=`FLÄNSGUIDEN – PROTOTYP\n${title}\n${r.message}\n${r.detail??''}\nIngen verifierad plocklista.\nKälla: ${r.gf?GF_SOURCE:SOURCE}`;return;}
 const f=r.flange,c=r.selectedCollar;
 const notices=[...r.issues,'Åtdragningsmoment är inte fastställt för detta förband.',...(saved?[]:['Bultlängd kan beräknas med delarnas mått i måttguiden.'])];
 const family=s.family==='ibeco_sf'?'IBECO reducerad SF-fläns':'IBECO bordring + PP-stållösfläns';
 $('parts-result').innerHTML=`<div class="result-top"><div class="section-head"><span class="step">2</span><h2>Ditt förband</h2></div><span class="status">KATALOGUPPGIFT</span></div>${diagram(r.dn,blind)}<div class="big-result"><div><div class="caption">Flänsanslutning</div><div class="dn">DN ${r.dn}</div><div class="result-sub">${title}</div></div><span class="pn-tag">PN ${s.pn}</span></div><div class="stats"><div class="stat"><span class="caption">Bultar · flänsens hålbild</span><b>${f.bolts} × M${f.thread}</b><small>${saved?`Längd ${saved.length} mm · egna kontrollerade mått`:'Bultlängd: ej fastställd för valda delar'}</small></div><div class="stat"><span class="caption">Åtdragningsmoment</span><b class="missing">Ej fastställt</b><small>Kräver exakt produkt och packning</small></div></div><div class="stat"><span class="caption">Bultlängd · valt förband</span><b>${lengthText}</b><small>${saved?'Från måttguiden · användarbekräftat':'Beräkna med delarnas mått via knappen nedan'}</small></div>${reference}<div class="notice">${notices.map(esc).join('<br>')}</div><div class="source-link">${link(SOURCE,`IBECO 2023 · s. ${s.family==='ibeco_sf'?'202':'200–201, 225'}${blind?', 222':''}`)}<br>Produktuppgifter behöver slutkontrolleras mot aktuellt datablad.</div>`;
 let rows=[];
 if(s.family==='standard'){
  rows.push(row(`${s.collar==='long'?'Lång':'Kort'} PE-bordring Ø${s.od} · SDR${s.sdr}`,c?`RSK ${c.rsk} · L ${c.length} mm · L1 ${c.l1} mm · H ${c.h} mm`:'Saknas i inläst katalogunderlag',c?(s.connection==='pair'?'2 st':'1 st'):'Kontroll krävs',!c));
  rows.push(row(`PP-stållösfläns DN${r.dn} · PN${s.pn}`,`IBECO ${f.article} · RSK ${f.rsk}`,s.connection==='pair'?'2 st':'1 st'));
 }else rows.push(row(`Reducerad SF-fläns Ø${s.od} → DN${r.dn} · PN${s.pn}`,`SDR${s.sdr} · Artikel och komplett förband kontrolleras mot sidan 202`,'Kontroll krävs',true));
 if(blind)rows.push(row(`Blindfläns DN${r.dn} med gängat uttag`,r.blind?`Katalog: ${r.blind.article} · G50 / 2″ · borrning PN${r.blind.pn}`:'PN-variant, uttag och artikel behöver verifieras hos IBECO',r.blind?'1 st':'Kontroll krävs',!r.blind));
 if(s.connection==='fixed')rows.push(row(`Fast metallfläns / ventil DN${r.dn}`,`Kontrollera PN${s.pn}, hålbild och tätningsyta`,'Ej identifierad',true));
 rows.push(row(GASKETS[s.gasket],`DN${r.dn} · PN${s.pn} · exakt produkt och profil kontrolleras`,'1 st'));
 rows.push(row(`${f.bolts} bultar M${f.thread}${saved?' × '+saved.length+' mm':''} + muttrar och brickor`,saved?'Längd från egna kontrollerade mått. Kvalitet, gänglängd och smörjning kontrolleras separat.':'Längden kräver paketmått för valda delar. Se eventuell katalogreferens ovan.',saved?'Måttberäknad':'Längd saknas',!saved));
 $('picklist').innerHTML=rows.join('')+'<button class="primary-button" id="use-parts-bolts">Beräkna bultlängd för detta förband →</button>'; $('use-parts-bolts').addEventListener('click',()=>startBoltFromParts());
 currentText=`FLÄNSGUIDEN – PROTOTYP 0.3\n${title}\n${family}\nAnslutning: ${$('connection').selectedOptions[0].textContent}\nDN ${r.dn}; flänsens hålbild ${f.bolts} x M${f.thread}\n${c?`Bordring RSK ${c.rsk}, ${s.connection==='pair'?2:1} st`:'Bordring / SF-artikel behöver kontrolleras'}\n${f.article?`Lösfläns ${f.article}, RSK ${f.rsk}, ${s.connection==='pair'?2:1} st\n`:''}${blind?`Blindfläns: ${r.blind?r.blind.article+' (kataloguppgift)':'artikel behöver verifieras'}\n`:''}Packning: ${GASKETS[s.gasket]}\nBultlängd: ${saved?lengthText+' (egna kontrollerade mått)':'ej fastställd'}\nÅtdragningsmoment: ej fastställt\n${r.issues.join('\n')}\nKälla: IBECO produktkatalog 2023, s. ${s.family==='ibeco_sf'?'202':'200–201, 225'}${blind?', 222':''}\n${SOURCE}\nKontrollera aktuell produktdata före beställning och montering.${saved?'\n\n'+saved.summary:''}`;
}
function fillTorque(){const family=$('tfamily').value,p=+$('tpn').value,old=+$('tsize').value;const rows=DATA.torques.filter(x=>x.family===family&&x.pn===p);$('tsize').innerHTML=rows.map(x=>option(x.od,`Ø ${x.od} / DN ${x.dn}`)).join('');$('tsize').value=rows.some(x=>x.od===old)?old:rows.some(x=>x.od===200)?200:rows[0].od;const pair=$('tpair').value;$('tpair').innerHTML=family==='hp'?option('a','Stål–HP · EPDM-profilpackning')+option('b','HP–HP · EPDM-profilpackning'):($('tgasket').value==='oring'?option('a','Stål–VP/SF · O-ring'):option('b','Stål–VP/SF · EPDM-profilpackning'));if(pair&&[...$('tpair').options].some(x=>x.value===pair))$('tpair').value=pair;renderTorque();}
function renderTorque(){if(!($('tgasket').value==='epdm'||($('tgasket').value==='oring'&&$('tfamily').value==='sf'))){$('torque-result').innerHTML=`<span class="status warn">MOMENTUNDERLAG SAKNAS</span><h2>${esc(GASKETS[$('tgasket').value])}</h2><p>De inlästa momenttabellerna gäller angiven EPDM-profilpackning eller O-ring. De får inte användas för denna packning. Följ tillverkarens anvisning för exakt förband.</p>`;return;}const family=$('tfamily').value,p=+$('tpn').value,r=torqueRow(family,p,+$('tsize').value),v=torqueValue(r,$('tpair').value);if(!r||!v){$('torque-result').textContent='Underlag saknas för valt förband.';return;}$('torque-result').innerHTML=`<div class="result-top"><span class="caption">Reinert-Ritz · ${family==='hp'?'HP':'Reducerad VP/SF'}</span><span class="status">TABELLVÄRDE</span></div><h2 style="margin-top:25px">Ø ${r.od} / DN ${r.dn} · PN${p}</h2><p class="result-sub">${esc($('tpair').selectedOptions[0].textContent)}</p><div class="torque-number">${v[1]} <small>Nm</small></div><span class="caption">Rekommenderat moment enligt tabellen</span><div class="range"><div><span class="caption">Min enligt tabell</span><b>${v[0]} Nm</b></div><div><span class="caption">Max enligt tabell</span><b>${v[2]} Nm</b></div></div><h3>Förutsättningar i källan</h3><ul class="conditions"><li>20 °C, horisontell montering utan böjbelastning.</li><li>Exakt flänspar och packning enligt tillverkarens anvisning.</li><li>Nya, förzinkade och smorda bultar/muttrar, kvalitet 5.6 eller högre.</li><li>Brickor under bult och mutter. Korsvis åtdragning i flera steg.</li><li>För profilpackning: stålförstärkt EPDM från Kroll & Ziller eller Klinger enligt källan.</li></ul><div class="notice">Min/max är gränser i källtabellen, inte instruktioner för momentsteg. Tillverkaren anger vägledande värden och garanterar inte långtidstäthet. Fullständig monteringsanvisning behöver följas.</div><div class="source-link">${link(family==='hp'?HP_SOURCE:SF_SOURCE,`Visa original · sida ${r.page}`)}<br>Gäller inte automatiskt GF- eller IBECO-produkter.</div>`;}
const sources=[['IBECO · långa syrafasta EPDM-bultsatser','Kataloglängder och måttskiss för specifika A2/A4-satser med RSG-TW. Visas som referens och överförs inte automatiskt till andra förband eller packningar.',KIT_SOURCE],['Bultlängd · GF:s beräkningsprincip','Summering av de faktiska delmåtten samt gängutstick. 2–3 gängor som startvärde enligt GF VA-handbok IV · 119. Inga antagna mutter-, brick- eller HP-mått. Beräkningen är geometrisk.','https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-utility-en.pdf'],['IBECO · DUO segjärn och bordringar','DUO-mått F ur datablad daterat 17 november 2026. Bordringsmått H ur katalog 2023 s. 200–201. Avsedda för de angivna produkterna; passning och eventuell överlappning måste kontrolleras.','https://ibeco.se/katalog-dokument'],['IBECO · produktkatalog 2023','Bordringar s. 200–202. Blindflänsar s. 222. Lösflänsar s. 225. Bultsatser s. 232–235. Moment för IBECO saknas. Bultlängd räknas i måttguiden med valda mått; inga bultsatser generaliseras.',SOURCE],['Reinert-Ritz · HP PN10 / PN16','Min, rekommenderat och max moment för stål–HP och HP–HP med profilpackning. Källans monteringsvillkor visas tillsammans med värdet.',HP_SOURCE],['Reinert-Ritz · reducerad VP/SF PN10 / PN16','Moment för stål–VP/SF med O-ring eller profilpackning. Ingen automatisk överföring till andra fabrikat.',SF_SOURCE],['GF · flänskopplingsverktyg','Referenskontroll för ELGEF Plus, SDR11, PE200/DN200, PP-stål och EPDM-profilpackning. Verktyget visar 8 × M20, 85 mm och 45 Nm i testfallet. PN och komplett produktvillkor måste dokumenteras innan det används som apprekommendation.',GF_SOURCE],['IBECO · blindfläns med gängat uttag','Utpekad som vanlig produkt hos er i PN10 och PN16. PN16-artiklar för större DN är ännu inte verifierade i prototypen.','https://ibeco.se/produkter/blindflans-gangat-uttag']];
$('source-list').innerHTML=sources.map(([title,desc,url])=>`<div class="source-item"><h3>${title}</h3><p>${desc}</p>${link(url,'Öppna källan')}</div>`).join('');
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});document.querySelectorAll('.panel').forEach(x=>x.hidden=x.id!==b.dataset.tab);}));
document.querySelectorAll('#pn button').forEach(b=>b.addEventListener('click',()=>{pn=+b.dataset.value;document.querySelectorAll('#pn button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});renderParts();}));
$('family').addEventListener('change',()=>{fillSizes();renderParts();});['od','sdr','connection','collar'].forEach(id=>$(id).addEventListener('change',renderParts));
['tfamily','tpn'].forEach(id=>$(id).addEventListener('change',fillTorque));['tsize','tpair','tgasket'].forEach(id=>$(id).addEventListener('change',renderTorque));
$('reset').addEventListener('click',()=>{$('family').value='standard';$('sdr').value='11';$('connection').value='blind';$('collar').value='long';$('gasket').value='epdm';syncGasket('epdm');fillSizes();$('od').value='200';document.querySelector('#pn [data-value="10"]').click();});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(currentText);$('toast').textContent='Plocklistan är kopierad';}catch{$('toast').textContent='Urklipp stöds inte. Använd Skriv ut / PDF.';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);});
$('print').addEventListener('click',()=>window.print());fillSizes();renderParts();fillTorque();

// Bultlängd: package measurements are independent of torque tables.
let boltExample=false;
const boltOrigins={a:'Eget mått',b:'Eget mått'};
function showPanel(id){document.querySelector(`[data-tab="${id}"]`).click();}
function startBoltFromParts(){
 const s=state(),r=resolveParts(s);
 boltContextKey=selectionKey(s);
 $('btype').value=s.connection==='pair'?'pe-pe':s.connection==='blind'?'blind':'pe-steel';
 updateBoltType();
 if(r.flange)$('bthread').value=`M${r.flange.thread}`;
 $('bolt-context').textContent=`Flänsval: PE Ø${s.od}, SDR${s.sdr}, PN${s.pn}${r.dn?`, DN${r.dn}`:''}. Packning: ${GASKETS[s.gasket]}. Förbandstyp, packningsval och bultdimension har hämtats. Fyll i paketmåtten separat.`;
 const c=r.selectedCollar;
 if(c){const index=DATA.collars.findIndex(x=>x.rsk===c.rsk);$('b-collar').value=String(index);}
 if(r.dn&&DUO_THICKNESS[r.dn])$('b-duo').value=String(r.dn);
 ['ba','bb','bgasket','bwa','bwb','bnut','bpitch'].forEach(id=>$(id).value='');
 $('bconfirmed').checked=false;boltExample=false;showCatalogDimensions();renderBolt();showPanel('bolts');
}
function updateBoltType(){
 const type=$('btype').value;
 const pe=type.startsWith('pe-'),two=type==='hp-hp'||type==='pe-pe';
 $('ba-label').textContent=pe?'A · Bordring + lösfläns, paketmått':'A · HP / plastände, paketmått';
 $('bb-label').textContent=two?(pe?'B · Bordring + lösfläns, paketmått':'B · HP / plastände, paketmått'):type==='blind'?'B · Blindflänsens verkliga tjocklek':'B · Stålflänsens verkliga tjocklek';
 $('ba-hint').textContent='Från brickans anliggning till packningens anliggningsyta. Ta med hela paketet av bordring och lösfläns när de ingår. Packning och bricka anges separat.';
 $('bb-hint').textContent=two?'Samma mätprincip som på A. Packning och bricka anges separat.':'Mät vid bulten mellan packningens och brickans anliggningsytor. Inget DUO-mått antas för metall- eller blindflänsen.';
 $('catalog-helper').hidden=!pe;
 $('set-side-b').hidden=type!=='pe-pe';
 $('ba').value='';$('bb').value='';$('bconfirmed').checked=false;
 boltOrigins.a='Eget mått';boltOrigins.b='Eget mått';
}
function showCatalogDimensions(){
 const c=DATA.collars[+$('b-collar').value],dn=+$('b-duo').value,f=DUO_THICKNESS[dn];
 $('catalog-dims').textContent=c&&f?`H ${c.h} mm + F ${f} mm = ${c.h+f} mm. Bordring RSK ${c.rsk}; DUO DN${dn}. Kontrollera kompatibilitet och anliggning.`:'Välj båda komponenterna.';
}
function setCatalogSide(side){
 if(!$('btype').value.startsWith('pe-')||(side==='b'&&$('btype').value!=='pe-pe'))return;
 const c=DATA.collars[+$('b-collar').value],dn=+$('b-duo').value,f=DUO_THICKNESS[dn];
 if(!c||!f)return;
 const val=resolveParts({family:'standard',od:c.od,pn:10,sdr:c.sdr,collar:c.type,connection:'fixed'});
 if(val.blocked||val.dn!==dn){$('catalog-dims').textContent='DN stämmer inte mellan vald bordring och DUO-fläns. Måtten har inte förts över.';return;}
 $(`b${side}`).value=String(c.h+f);
 boltOrigins[side]=`IBECO bordring Ø${c.od} SDR${c.sdr}, RSK ${c.rsk}, H ${c.h} + DUO DN${dn}, F ${f} (mm). Kontroll av passning/anliggning krävs.`;
 $('bconfirmed').checked=false;renderBolt();
}
function fmt(n){return Number(n.toFixed(3)).toLocaleString('sv-SE',{maximumFractionDigits:3});}
function boltDiagram(){return `<div class="bolt-sketch" role="img" aria-label="Principskiss: bultskalle, bricka, sida A, packning, sida B, bricka, mutter och gängutstick. L mäts under skallen till bultens spets."><div class="bolt-shaft"></div><div class="stack head">Skalle</div><div class="stack washer">Br.</div><div class="stack side">A</div><div class="stack gasket">P</div><div class="stack side">B</div><div class="stack washer">Br.</div><div class="stack nut">Mutter</div><div class="stack thread">Utstick</div><div class="length-arrow">← L · från undersidan av skallen till spetsen →</div></div>`;}
function renderBolt(){
 const title=$('btype').selectedOptions[0].textContent;
 if(boltBinding){boltBinding=null;renderParts();}
 const labels={a:'Paketmått A',b:'Paketmått B',gasket:'Packning',washerA:'Bricka under skallen',washerB:'Bricka under muttern',nut:'Mutterhöjd',pitch:'Gängstigning'};
 const ids={a:'ba',b:'bb',gasket:'bgasket',washerA:'bwa',washerB:'bwb',nut:'bnut',pitch:'bpitch',turnsMin:'bmin',turnsMax:'bmax',stock:'bstock'};
 const input=Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,$(id).value]));
 const missing=Object.entries(labels).filter(([k])=>!String(input[k]).trim()).map(([,label])=>label);
 let r;
 try{r=calculateBolt(input);}catch(e){
  $('bolt-result').innerHTML=`<div class="result-top"><span class="caption">Bultlängd · ${esc($('bthread').value)}</span><span class="status warn">MÅTT SAKNAS</span></div>${boltDiagram()}<div class="empty"><h3>${missing.length?'Fyll i förbandets mått': 'Kontrollera inmatningen'}</h3><p>${missing.length?missing.map(esc).join(' · '):esc(e.message)}</p></div><div class="notice">Välj ett räkneexempel för att se hur guiden fungerar, eller fyll i faktiska mått. Inget nollmått antas när ett fält är tomt.</div>`;
  boltText='';return;
 }
 const confirmed=$('bconfirmed').checked&&!boltExample;
 const valid=r.candidate!==null;
 const header=boltExample?'RÄKNEEXEMPEL':!valid?'INGEN LÄNGD PASSAR':confirmed?'KONTROLLERADE INMATNINGAR':'PRELIMINÄRT MÅTT';
 const status=boltExample?'Exempel med påhittade mått – inte ett produktförslag.':confirmed?'Måtten är bekräftade av användaren.':'Måtten är inte bekräftade. Resultatet är preliminärt.';
 const sum=[r.a,r.b,r.gasket,r.washerA,r.washerB,r.nut].map(fmt).join(' + ');
 const candidates=r.matches.map(x=>`${x} mm`).join(', ');
 const choice=valid?`<div class="bolt-size">${esc($('bthread').value)} × ${r.candidate}<small>mm · kortaste längd i din lista inom intervallet</small></div>`:`<div class="empty"><h3>Ingen angiven bultlängd ligger inom intervallet</h3><p>${r.next?`Nästa längre i listan är ${r.next} mm, men ger ${fmt((r.next-r.body)/r.pitch)} gängors utstick och väljs därför inte automatiskt.`:'Lägg till fler tillgängliga längder i listan.'}</p></div>`;
 $('bolt-result').innerHTML=`<div class="result-top"><span class="caption">${esc(title)}</span><span class="status ${confirmed&&valid?'':'warn'}">${header}</span></div>${boltDiagram()}<h2>Geometriskt längdintervall</h2><div class="length-range">${fmt(r.min)}–${fmt(r.max)} <small>mm</small></div><p class="result-sub">Utstick: ${fmt(r.turnsMin)}–${fmt(r.turnsMax)} gängor × ${fmt(r.pitch)} mm</p>${choice}<div class="bolt-calculation"><h3>Så räknas längden</h3><p>A + B + packning + bricka + bricka + mutter</p><strong>${sum} = ${fmt(r.body)} mm</strong><p>+ gängutstick ${fmt(r.turnsMin*r.pitch)}–${fmt(r.turnsMax*r.pitch)} mm</p>${valid?`<p>Utstick med ${r.candidate} mm: <strong>${fmt(r.actualTurns)} gängor</strong></p><p>Längder i intervallet: ${candidates}</p>`:''}</div><div class="notice">${status}<br>Beräkningen kontrollerar längdgeometrin. Kontrollera även bultens toleranser, tillräcklig gänglängd vid muttern, hållfasthet, packningskompression och utrymme enligt tillverkaren. Gäller inte pinnbult, gängade hål eller inspänningsventiler.</div><details class="origin-details"><summary>Måttens ursprung</summary><p>A: ${esc(boltOrigins.a)}</p><p>B: ${esc(boltOrigins.b)}</p><p>Packning, brickor, mutter och gängstigning: egna inmatningar.</p></details><div class="source-link">${link('https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-utility-en.pdf','Beräkningsprincip · GF VA-handbok IV · 119')}<br>Inga moment eller tryckklasser verifieras av bultlängdsberäkningen.</div><div class="helper-actions result-actions"><button class="small-button" id="bcopy">Kopiera bultunderlag</button><button class="small-button" id="bprint">Skriv ut / PDF</button>${confirmed&&valid&&!boltExample&&boltContextKey===selectionKey(state())?'<button class="primary-button" id="bapply">Visa längden i förband och plocklista →</button>':''}</div>`;
 boltText=`FLÄNSGUIDEN – BULTLÄNGD 0.3\n${title}\n${$('bolt-context').textContent}\n${status}\nDimension: ${$('bthread').value}\nPaket A: ${fmt(r.a)} mm (${boltOrigins.a})\nPaket B: ${fmt(r.b)} mm (${boltOrigins.b})\nPackning: ${GASKETS[$('bgasket-type').value]}, monterat mått ${fmt(r.gasket)} mm\nBrickor: ${fmt(r.washerA)} + ${fmt(r.washerB)} mm\nMutterhöjd: ${fmt(r.nut)} mm\nGängstigning: ${fmt(r.pitch)} mm\nÖnskat utstick: ${fmt(r.turnsMin)}–${fmt(r.turnsMax)} gängor\nGeometriskt intervall: ${fmt(r.min)}–${fmt(r.max)} mm\n${valid?`Kortaste match i angiven längdlista: ${$('bthread').value} x ${r.candidate} mm; utstick ${fmt(r.actualTurns)} gängor`:'Ingen angiven längd passar inom intervallet'}\nKontrollera gänglängd, toleranser, hållfasthet och tillverkarens monteringsanvisning separat. Genomgående bult med skalle och en mutter. Ej pinnbult eller gängat hål.`;
 $('bcopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(boltText);$('toast').textContent='Bultunderlaget är kopierat';}catch{$('toast').textContent='Använd Skriv ut / PDF för att spara underlaget.';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);});
 $('bprint').addEventListener('click',()=>window.print());
 if($('bapply'))$('bapply').addEventListener('click',()=>{boltBinding={key:boltContextKey,length:r.candidate,summary:boltText};renderParts();showPanel('parts');});
}
$('b-collar').innerHTML=DATA.collars.map((c,i)=>option(i,`Ø${c.od} SDR${c.sdr} · ${c.type==='long'?'lång':'kort'} · H ${c.h} · RSK ${c.rsk}`)).join('');
$('b-duo').innerHTML=Object.entries(DUO_THICKNESS).map(([dn,f])=>option(dn,`DUO DN${dn} · F ${f} mm`)).join('');
$('b-collar').value=String(DATA.collars.findIndex(c=>c.rsk==='240 99 03'));$('b-duo').value='200';
$('btype').addEventListener('change',()=>{boltContextKey=null;if(boltExample)['bgasket','bwa','bwb','bnut','bpitch'].forEach(id=>$(id).value='');updateBoltType();$('bolt-context').textContent='Eget förband. Kontrollera bultdimension och samtliga mått för den valda kombinationen.';boltExample=false;renderBolt();});
$('bthread').addEventListener('change',()=>{boltContextKey=null;['bpitch','bnut','bwa','bwb'].forEach(id=>$(id).value='');$('bconfirmed').checked=false;renderBolt();});
['ba','bb','bgasket','bwa','bwb','bnut','bpitch','bmin','bmax','bstock'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='ba')boltOrigins.a='Eget inmatat mått';if(id==='bb')boltOrigins.b='Eget inmatat mått';$('bconfirmed').checked=false;renderBolt();}));
$('bconfirmed').addEventListener('change',renderBolt);
['b-collar','b-duo'].forEach(id=>$(id).addEventListener('change',showCatalogDimensions));
$('set-side-a').addEventListener('click',()=>setCatalogSide('a'));$('set-side-b').addEventListener('click',()=>setCatalogSide('b'));
$('bexample').addEventListener('click',()=>{boltContextKey=null;
 $('btype').value='hp-steel';updateBoltType();$('bthread').value='M20';
 const values={ba:30,bb:28,bgasket:3,bwa:3,bwb:3,bnut:18,bpitch:2.5,bmin:2,bmax:3};
 Object.entries(values).forEach(([id,v])=>$(id).value=String(v));
 boltExample=true;boltOrigins.a='Påhittat räkneexempel';boltOrigins.b='Påhittat räkneexempel';$('bolt-context').textContent='Räkneexempel. Måtten avser inga identifierade produkter.';$('bconfirmed').checked=false;renderBolt();
});
$('bclear').addEventListener('click',()=>{boltContextKey=null;['ba','bb','bgasket','bwa','bwb','bnut','bpitch'].forEach(id=>$(id).value='');boltExample=false;$('bconfirmed').checked=false;$('bolt-context').textContent='Ingen produktkoppling vald. Ange måtten på dina faktiska delar.';boltOrigins.a='Eget mått';boltOrigins.b='Eget mått';renderBolt();});
updateBoltType();showCatalogDimensions();renderBolt();

function syncGasket(value){
 ['gasket','tgasket','bgasket-type'].forEach(id=>$(id).value=value);
 $('gasket-note').textContent=gasketNote(value);$('bgasket-note').textContent=gasketNote(value);
 boltBinding=null;boltContextKey=null;$('bgasket').value='';$('bconfirmed').checked=false;
 renderParts();fillTorque();renderBolt();
}
['gasket','tgasket','bgasket-type'].forEach(id=>$(id).addEventListener('change',()=>syncGasket($(id).value)));
$('bgasket-note').textContent=gasketNote($('bgasket-type').value);
