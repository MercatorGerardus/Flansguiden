import {DATA} from './data.js';
import {resolveParts,sizes,torqueRow,torqueValue,SOURCE,HP_SOURCE,SF_SOURCE,GF_SOURCE,calculateBolt,DUO_THICKNESS,GASKETS,KIT_SOURCE,KIT_PAGE,catalogKit,selectionKey,gasketLines,pressureSummary,selectedTorque,COARSE_PITCH} from './logic.js';
const $=id=>document.getElementById(id);
let pn=10, boltText='', currentText='', boltBinding=null, boltContextKey=null;
const gasketNote=value=>value==='grafex'?'Ange monterad tjocklek för din Grafex EX-packning. Momentunderlag saknas; EPDM-värden får inte användas.':value==='oring'?'Kontrollera O-ringens utförande och spåret. Monterad spalt anges separat.':value==='epdm'?'Kontrollera exakt profil, fabrikat och utförande för plast eller metall. Stålinlägg ensamt fastställer inte moment eller tjocklek.':'Ange produktens mått och följ dess monteringsanvisning.';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>url?`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:`<span>${label} · Original-PDF finns i projektunderlaget. Publik dokumentlänk återstår.</span>`;
function option(value,label){return `<option value="${esc(value)}">${esc(label)}</option>`;}
function diagram(dn,blind){return `<div class="diagram"><svg viewBox="0 0 520 190" role="img" aria-label="Principsnitt med lösfläns bakom bordringskrage, packning mellan tätningsytorna och bult utanför kragen."><g stroke="#b7c5bc" stroke-width="1.5"><path d="M35 61H225V129H35M35 73H213V117H35" fill="#455b5b"/><path d="M213 51H229V139H213Z" fill="#6a8079"/><path d="M191 29H213V61H191ZM191 129H213V161H191Z" fill="#91a0a0"/><path d="M231 54H237V136H231Z" fill="#d3e7a6"/>${blind?'<path d="M239 29H263V161H239Z" fill="#92a8ab"/>':'<path d="M239 29H261V161H239ZM261 61H455V129H261M261 73H455V117H261" fill="#849e9e"/>'}<path d="M174 43H282M174 147H282" stroke="#cfd9dc" stroke-width="8"/><path d="M176 34V52M277 34V52M176 138V156M277 138V156" stroke="#e0e7e6" stroke-width="10"/></g><text x="25" y="181" fill="#b7c5bc" font-family="system-ui" font-size="11">DN ${dn??'—'} · principsnitt, ej måttritning</text></svg></div>`;}
function state(){return {family:$('family').value,od:+$('od').value,sdr:+$('sdr').value,material:$('material').value,pn,connection:$('connection').value,collar:$('collar').value,gasket:$('gasket').value};}
function fillSizes(){const old=+$('od').value;const opts=sizes($('family').value);$('od').innerHTML=opts.map(d=>option(d,`Ø ${d} mm`)).join('');$('od').value=opts.includes(old)?old:opts.includes(200)?200:opts[0];$('collar-field').hidden=$('family').value!=='standard';}
function row(name,detail,qty,wait=false){return `<div class="pick-row"><div><strong>${name}</strong><small>${detail}</small></div><span class="qty ${wait?'wait':''}">${qty}</span></div>`;}
function renderParts(){
 const s=state(),r=resolveParts(s),blind=s.connection==='blind',t=selectedTorque(s);
 $('family-note').textContent=$('family').selectedOptions[0].textContent+(r.blocked?' · produktunderlag saknas för detta val':'');
 $('gasket-note').textContent=gasketNote(s.gasket);
 if(boltBinding?.key!==selectionKey(s))boltBinding=null;
 if(boltContextKey&&boltContextKey!==selectionKey(s))detachBoltContext('Förbandet i Välj förband har ändrats efter att beräkningen startades. Resultatet kopplas inte till förbandet. Starta om från Välj förband för att koppla en längd.');
 const saved=boltBinding, kit=catalogKit(s,r);
 const lengthText=saved?`${r.flange.bolts?`${r.flange.bolts} × `:''}${saved.thread} × ${saved.length} mm`:'Ej fastställd';
 const reference=kit?`<details class="notice"><summary>Bultsats · referens ur IBECO-katalogen</summary><strong>${kit.bolts} × M${kit.thread} × ${kit.length} mm</strong><p>RSK ${kit.rsk} · PN${kit.pn}. A2-bult och bricka, A4-mutter, RSG-TW-packning. ${kit.conflict?'OBS: satsens hålbild avviker från vald lösfläns. Välj inte satsen till detta förband.':'Längden gäller satsens måttskiss. Passning till ditt valda förband är inte verifierad.'}</p><p>Kontrollera delmåtten mot ritningen, särskilt för blindfläns, HP eller två plaständar. Referensen förs inte till plocklistan som färdig bultlängd.</p>${`Värden enligt IBECO katalog 2023 s. ${KIT_PAGE}. `+link(KIT_SOURCE,'Visa bultsats och måttskiss')}</details>`:'';
 const title=`PE Ø${s.od} · SDR${s.sdr} · borrning PN${s.pn}`;
 if(r.blocked){$('parts-result').innerHTML=`<div class="result-top"><span class="caption">Ditt förband</span><span class="status warn">UNDERLAG SAKNAS</span></div>${torqueCard(t,s)}${diagram(r.dn,blind)}<div class="empty"><h3>${r.message}</h3><p>${r.detail??'Välj en annan kombination eller kontrollera produktens datablad.'}</p></div><div class="source-link">${link(r.gf?GF_SOURCE:SOURCE,r.gf?'Öppna GF:s verktyg':'Visa IBECO-katalogen')}</div>`;$('picklist').innerHTML=row('Ingen färdig plocklista',esc(r.message),'Kontroll krävs',true)+'<button class="primary-button" id="manual-bolts">Beräkna bult med egna mått →</button>';$('manual-bolts').addEventListener('click',()=>{detachBoltContext('Fristående måttberäkning. Inga produktmått eller hålbilder har hämtats.');showPanel('bolts');});currentText=`FLÄNSGUIDEN – PROTOTYP\n${title}\n${r.message}\n${r.detail??''}\nIngen verifierad plocklista.\nKälla: ${r.gf?GF_SOURCE:SOURCE}`;return;}
 const f=r.flange,c=r.selectedCollar;
 $('family-note').textContent=r.name??'Katalogdelar med ej identifierad tillverkare. IBECO är katalogkälla, inte angivet fabrikat.';
 const notices=[...r.issues,...(t.value?[]:['Åtdragningsmoment är inte fastställt för detta förband.']),...(saved?[]:['Bultlängd kan beräknas med delarnas mått i måttguiden.'])];
 const family=r.name??(s.family==='ibeco_sf'?'Reducerad SF-fläns · tillverkare ej identifierad':'Bordring + PP-stållösfläns · tillverkare ej identifierad');
 $('parts-result').innerHTML=`<div class="result-top"><div class="section-head"><span class="step">2</span><h2>Ditt förband</h2></div><span class="status">KATALOGUPPGIFT</span></div>${torqueCard(t,s)}${diagram(r.dn,blind)}<div class="big-result"><div><div class="caption">Flänsanslutning</div><div class="dn">DN ${r.dn}</div><div class="result-sub">${title}</div></div><span class="pn-tag">Borrning PN ${s.pn}</span></div><div class="stat"><span class="caption">${pressureSummary(r).caption}</span><b class="${r.componentPn?'':'missing'}">${pressureSummary(r).value}</b><small>${esc(pressureSummary(r).scope)}</small><small><strong>${esc(pressureSummary(r).joint)}</strong></small></div><div class="stats"><div class="stat"><span class="caption">Bultar · flänsens hålbild</span><b>${f.bolts?`${f.bolts} × M${f.thread}`:'Hålbild ej inläst'}</b><small>${saved?`Längd ${saved.length} mm · egna kontrollerade mått`:'Bultlängd: ej fastställd för valda delar'}</small></div></div><div class="stat"><span class="caption">Bultlängd · valt förband</span><b>${lengthText}</b><small>${saved?'Från måttguiden · användarbekräftat':'Beräkna med delarnas mått via knappen nedan'}</small></div>${reference}<div class="notice">${notices.map(esc).join('<br>')}</div><div class="source-link">${link(r.source??SOURCE,r.named?`Produktkälla · ${r.name}`:`IBECO 2023 · s. ${s.family==='ibeco_sf'?'202':'200–201, 225'}${blind?', 222':''}`)}<br>Produktuppgifter behöver slutkontrolleras mot aktuellt datablad.</div>`;
 let rows=[];
 if(r.named){rows.push(row(esc(r.name),f.rsk?`RSK ${f.rsk} · flänstjocklek b ${f.thickness} mm · ytterdiameter ${f.diameter} mm · bultcirkel ${f.circle} mm`:'Produktserie identifierad. Artikel och hålbild behöver kontrolleras mot aktuell produkt.',s.connection==='pair'?'2 st':'1 st',!f.rsk));}
 else if(s.family==='standard'){
  rows.push(row(`${s.collar==='long'?'Lång':'Kort'} PE-bordring Ø${s.od} · SDR${s.sdr}`,c?`RSK ${c.rsk} · L ${c.length} mm · L1 ${c.l1} mm · H ${c.h} mm`:'Saknas i inläst katalogunderlag',c?(s.connection==='pair'?'2 st':'1 st'):'Kontroll krävs',!c));
  rows.push(row(`PP-stållösfläns DN${r.dn} · PN${s.pn}`,`Katalogartikel ${f.article} · RSK ${f.rsk}`,s.connection==='pair'?'2 st':'1 st'));
 }else{const okArticle=f.sfArticle&&!f.sfArticleReview&&s.connection!=='pair';rows.push(row(`Reducerad SF-fläns Ø${s.od} → DN${r.dn} · PN${s.pn}`,f.sfArticle?`SDR${s.sdr} · IBECO katalog s. 202: ${esc(f.sfArticle)}${f.sfArticleReview?' · beteckningen avviker, kontrollera':''}${s.connection==='pair'?' · två SF-ändar kontrolleras separat':''}`:`SDR${s.sdr} · Artikel saknas i underlaget`,okArticle?'1 st':'Kontroll krävs',!okArticle));}
 if(blind)rows.push(row(`Blindfläns DN${r.dn} med gängat uttag`,r.blind?`Katalog: ${r.blind.article} · G50 / 2″ · borrning PN${r.blind.pn}`:'PN-variant, uttag och artikel behöver verifieras hos IBECO',r.blind?'1 st':'Kontroll krävs',!r.blind));
 if(s.connection==='fixed')rows.push(row(`Fast metallfläns / ventil DN${r.dn}`,`Kontrollera PN${s.pn}, hålbild och tätningsyta`,'Ej identifierad',true));
 gasketLines(s,r).forEach(g=>rows.push(row(esc(g.name),esc(g.detail),g.qty,g.wait)));
 rows.push(row(`${f.bolts?`${f.bolts} bultar M${f.thread}`:saved?`Bultar ${saved.thread} · antal kontrolleras`:'Bultar · hålbild kontrolleras'}${saved?' × '+saved.length+' mm':''} + muttrar och brickor`,saved?'Längd från egna kontrollerade mått. Kvalitet, gänglängd och smörjning kontrolleras separat.':'Längden kräver paketmått för valda delar. Se eventuell katalogreferens ovan.',saved?'Måttberäknad':'Längd saknas',!saved));
 $('picklist').innerHTML=rows.join('')+'<button class="primary-button" id="use-parts-bolts">Beräkna bultlängd för detta förband →</button>'; $('use-parts-bolts').addEventListener('click',()=>startBoltFromParts());
 currentText=`FLÄNSGUIDEN – PROTOTYP 0.4.1\n${title}\n${pressureSummary(r).copy}\n${family}\nAnslutning: ${$('connection').selectedOptions[0].textContent}\nDN ${r.dn}; flänsens hålbild ${f.bolts?`${f.bolts} x M${f.thread}`:'ej inläst'}\n${r.named?r.name:c?`Bordring RSK ${c.rsk}, ${s.connection==='pair'?2:1} st`:f.sfArticle?`SF-fläns ${f.sfArticle} (katalog s. 202)${f.gasketIncluded?', medföljande packning av okänd typ':''}`:'Bordring / SF-artikel behöver kontrolleras'}\n${f.article?`Lösfläns ${f.article}, RSK ${f.rsk}, ${s.connection==='pair'?2:1} st\n`:''}${blind?`Blindfläns: ${r.blind?r.blind.article+' (kataloguppgift)':'artikel behöver verifieras'}\n`:''}Packning: ${GASKETS[s.gasket]}\nBultlängd: ${saved?lengthText+' (egna kontrollerade mått)':'ej fastställd'}\nÅtdragningsmoment: ${t.value?`${t.value[1]} Nm · Reinert-Ritz-tabell; samtliga villkor måste uppfyllas`:t.reason}\n${r.issues.join('\n')}\nKälla: ${r.named?r.name:`IBECO produktkatalog 2023, s. ${s.family==='ibeco_sf'?'202':'200–201, 225'}${blind?', 222':''}`}\n${r.source??SOURCE}\nKontrollera aktuell produktdata före beställning och montering.${saved?'\n\n'+saved.summary:''}`;
}
function torqueCard(t,s){
 const product=$('family').selectedOptions[0].textContent;
 const scope=`Ø${s.od} · SDR${s.sdr} · PN${s.pn} · ${$('connection').selectedOptions[0].textContent}`;
 if(!t.value)return `<section class="inline-torque torque-unavailable" aria-label="Åtdragningsmoment"><div class="eyebrow">ÅTDRAGNINGSMOMENT · UNDERLAG SAKNAS</div><h3>Inget tabellvärde för detta val</h3><p><strong>${esc(product)}</strong><br>${esc(scope)}</p><p>${esc(t.reason)}</p><p>Momentdata finns för Reinert-Ritz HP och VP/SF i angivna kombinationer. Välj dem endast om det är den produkten du använder. SDR och EPDM ensamt räcker inte för ett momentbesked.</p></section>`;
 return `<section class="inline-torque torque-available" aria-label="Åtdragningsmoment"><div class="eyebrow">ÅTDRAGNINGSMOMENT · TABELLVÄRDE</div><h3>${esc(product)}</h3><p class="torque-selection">${esc(scope)}</p><div class="torque-number">${t.value[1]} <small>Nm</small></div><p>Rekommenderat tabellvärde · min ${t.value[0]}, max ${t.value[2]} Nm.</p><p>Kontrollera aktuell momentetikett och leveransanvisning. EPDM måste vara exakt den profilpackning tabellen avser; stålinlägg ensamt räcker inte.</p><details><summary>Villkor för att använda momentet</summary><p>${esc(t.reason)}</p><ul><li>Endast angivet Reinert-Ritz-system och flänspar.</li><li>EPDM: stålförstärkt profilpackning från Kroll &amp; Ziller eller Klinger enligt tabellen. Valet ”EPDM med stålinlägg” bekräftar inte i sig rätt profil.</li><li>20 °C, horisontell montering utan böjbelastning.</li><li>Nya, förzinkade och smorda bultar och muttrar, kvalitet 5.6 eller högre, två brickor. Värdena överförs inte automatiskt till A2/A4.</li><li>Korsvis åtdragning i flera steg. Följ aktuell produktmärkning och monteringsanvisning.</li></ul><p>De inlästa äldre momenttabellerna finns i projektunderlaget. Kontrollera aktuellt leveransunderlag, särskilt större dimensioner.</p>${link('https://www.reinert-ritz.de/products/assembly-instructions-flanges/?lang=en','Reinert-Ritz · monteringsanvisning')}</details></section>`;
}
const sources=[['IBECO · långa syrafasta EPDM-bultsatser','Kataloglängder och måttskiss för specifika A2/A4-satser med RSG-TW, återgivna ordagrant från katalog 2023 s. 233. Avvikande hålbild mot vald lösfläns markeras (t.ex. DN80 4 × M16 och DN300 PN10 12 × M24). Webbsidan är inte avstämd mot katalogen. Visas som referens och överförs inte automatiskt till andra förband eller packningar.',KIT_SOURCE],['Bultlängd · GF:s beräkningsprincip','Summering av de faktiska delmåtten samt gängutstick. 2–3 gängor som startvärde enligt GF · Planning Fundamentals. Inga antagna mutter-, brick- eller HP-mått. Beräkningen är geometrisk.','https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-utility-en.pdf'],['IBECO · DUO segjärn och bordringar','DUO-mått F ur datablad (utskriftsdatum är inte dokumentrevision). Bordringsmått H ur katalog 2023 s. 200–201. Avsedda för de angivna produkterna; passning och eventuell överlappning måste kontrolleras.','https://ibeco.se/katalog-dokument'],['IBECO · produktkatalog 2023','Bordringar s. 200–202. Blindflänsar s. 222. Lösflänsar s. 225. Bultsatser s. 232–235. Moment för IBECO saknas. Bultlängd räknas i måttguiden med valda mått; inga bultsatser generaliseras.',SOURCE],['Reinert-Ritz · HP PN10 / PN16','Min, rekommenderat och max moment för stål–HP och HP–HP med profilpackning. Källans monteringsvillkor visas tillsammans med värdet.',HP_SOURCE],['Reinert-Ritz · reducerad VP/SF PN10 / PN16','Moment för stål–VP/SF med O-ring eller profilpackning. Ingen automatisk överföring till andra fabrikat.',SF_SOURCE],['GF · flänskopplingsverktyg','Referenskontroll för ELGEF Plus, SDR11, PE200/DN200, PP-stål och EPDM-profilpackning. Fullständiga produktvillkor måste dokumenteras innan några värden används som apprekommendation.',GF_SOURCE],['IBECO · blindfläns med gängat uttag','Utpekad som vanlig produkt hos er i PN10 och PN16. PN16-artiklar för större DN är ännu inte verifierade i prototypen.','https://ibeco.se/produkter/blindflans-gangat-uttag']];
$('source-list').innerHTML=sources.map(([title,desc,url])=>`<div class="source-item"><h3>${title}</h3><p>${desc}</p>${link(url,'Öppna källan')}</div>`).join('');
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',String(x===b));});document.querySelectorAll('.panel').forEach(x=>x.hidden=x.id!==b.dataset.tab);}));
document.querySelectorAll('#pn button').forEach(b=>b.addEventListener('click',()=>{pn=+b.dataset.value;document.querySelectorAll('#pn button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});renderParts();}));
$('family').addEventListener('change',()=>{fillSizes();renderParts();});['od','sdr','material','connection','collar'].forEach(id=>$(id).addEventListener('change',renderParts));

$('reset').addEventListener('click',()=>{$('family').value='standard';$('sdr').value='11';$('material').value='';$('connection').value='blind';$('collar').value='long';$('gasket').value='epdm';syncGasket('epdm');fillSizes();$('od').value='200';document.querySelector('#pn [data-value="10"]').click();});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(currentText);$('toast').textContent='Plocklistan är kopierad';}catch{$('toast').textContent='Urklipp stöds inte. Använd Skriv ut / PDF.';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);});
$('print').addEventListener('click',()=>window.print());
// Reproducible example links restore only validated visible options. No material is assumed.
function restoreSelection(){
 const params=new URLSearchParams(location.search);
 const choose=id=>{const value=params.get(id);if(value!==null&&[...$(id).options].some(o=>o.value===value))$(id).value=value;};
 choose('family');fillSizes();['od','sdr','connection','gasket'].forEach(choose);
 if(['10','16'].includes(params.get('pn'))){pn=+params.get('pn');document.querySelectorAll('#pn button').forEach(b=>{const selected=+b.dataset.value===pn;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}
 $('bgasket-type').value=$('gasket').value;
}
restoreSelection();renderParts();

// Bultlängd: package measurements are independent of torque tables.
let boltExample=false;
const boltOrigins={a:'Eget mått',b:'Eget mått'};
function showPanel(id){document.querySelector(`[data-tab="${id}"]`).click();}
function startBoltFromParts(){
 const s=state(),r=resolveParts(s);
 boltContextKey=selectionKey(s);
 const kind=s.family==='rr_hp'?'hp':s.family==='ibeco_sf'||s.family==='rr_sf'?'sf':'pe';$('btype').value=`${kind}-${s.connection==='pair'?kind:s.connection==='blind'?'blind':'steel'}`;
 updateBoltType();
 if(r.flange?.thread)$('bthread').value=`M${r.flange.thread}`;
 $('bolt-context').textContent=`Flänsval: PE Ø${s.od}, SDR${s.sdr}, PN${s.pn}${r.dn?`, DN${r.dn}`:''}. Packning: ${GASKETS[s.gasket]}. Förbandstyp och packning har hämtats. ${r.flange?.thread?'Bultdimension hämtad från hålbilden.':'Bultdimension saknas i underlaget – välj och kontrollera den själv.'} Fyll i paketmåtten separat.`;
 const c=r.selectedCollar;
 if(c){const index=DATA.collars.findIndex(x=>x.rsk===c.rsk);$('b-collar').value=String(index);}
 $('b-duo').value='';$('helper-context').textContent=s.family==='standard'?`Ditt förband har PP-stållösfläns ${r.flange?.article??''}. DUO-måttet F gäller inte den – mät paketet. Används DUO-mått kopplas resultatet bort från förbandet.`:'';
 ['ba','bb','bgasket','bwa','bwb','bnut','bpitch','bhardware'].forEach(id=>$(id).value='');
 setPitch();
 $('bconfirmed').checked=false;boltExample=false;showCatalogDimensions();renderBolt();showPanel('bolts');
}
function updateBoltType(){
 const type=$('btype').value;
 const pe=type.startsWith('pe-'),sf=type.startsWith('sf-'),two=type==='hp-hp'||type==='pe-pe'||type==='sf-sf',isBlind=type.endsWith('blind');
 $('ba-label').textContent=pe?'A · Bordring + lösfläns, paketmått':sf?'A · SF-fläns, paketmått':'A · HP / plastände, paketmått';
 $('bb-label').textContent=two?(pe?'B · Bordring + lösfläns, paketmått':sf?'B · SF-fläns, paketmått':'B · HP / plastände, paketmått'):isBlind?'B · Blindflänsens verkliga tjocklek':'B · Stålflänsens verkliga tjocklek';
 $('ba-hint').textContent='Från brickans anliggning till packningens anliggningsyta. Ta med hela paketet av bordring och lösfläns när de ingår. Packning och bricka anges separat.';
 $('bb-hint').textContent=two?'Samma mätprincip som på A. Packning och bricka anges separat.':'Mät vid bulten mellan packningens och brickans anliggningsytor. Inget DUO-mått antas för metall- eller blindflänsen.';
 $('catalog-helper').hidden=!pe;
 $('set-side-b').hidden=type!=='pe-pe';
 $('ba').value='';$('bb').value='';$('bconfirmed').checked=false;
 boltOrigins.a='Eget mått';boltOrigins.b='Eget mått';
}
function detachBoltContext(message){
 if(!boltContextKey)return;
 boltContextKey=null;boltBinding=null;
 $('bolt-context').textContent=message;
 $('bconfirmed').checked=false;
 renderBolt();
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
 if(val.blocked){$('catalog-dims').textContent=`Bordringen Ø${c.od} har ingen giltig lösflänsrad i underlaget (${val.message}). Måtten har inte förts över.`;return;}
 if(val.dn!==dn){$('catalog-dims').textContent=`DN stämmer inte: bordring Ø${c.od} hör till DN${val.dn}, vald DUO-fläns är DN${dn}. Måtten har inte förts över.`;return;}
 $(`b${side}`).value=String(c.h+f);
 detachBoltContext(`Paketmått ${side.toUpperCase()} kommer från bordring + DUO-fläns, inte från lösflänsen i Välj förband. Resultatet kopplas inte till förbandet.`);
 boltOrigins[side]=`Bordring Ø${c.od} SDR${c.sdr}, RSK ${c.rsk}, H ${c.h} + DUO DN${dn}, F ${f} (mm). Kontroll av passning/anliggning krävs.`;
 $('bconfirmed').checked=false;renderBolt();
}
function fmt(n){return Number(n.toFixed(3)).toLocaleString('sv-SE',{maximumFractionDigits:3});}
function boltDiagram(){
 const val=id=>{const t=$(id).value.trim(),n=Number(t.replace(',','.'));return t&&Number.isFinite(n)&&n>=0?n:null;};
 const text=id=>val(id)===null?'—':fmt(val(id));
 const detailed=$('bdetailed').checked;
 const aw=Math.max(42,Math.min(110,(val('ba')??32)*1.8)),bw=Math.max(35,Math.min(100,(val('bb')??24)*1.8));
 const left=244,face=left+aw,gap=10,bs=face+gap,end=bs+bw,wa=7,nh=30,tip=end+wa+nh+18;
 const blind=$('btype').value.endsWith('blind'),pe=$('btype').value.startsWith('pe-'),two=/-(hp|pe|sf)$/.test($('btype').value);
 const dim=(x1,x2,y,label)=>`<path d="M${x1} ${y-6}V${y+6}M${x2} ${y-6}V${y+6}M${x1} ${y}H${x2}" fill="none" stroke="#bfd4bc"/><path d="M${x1} ${y}l5 -3v6zM${x2} ${y}l-5 -3v6z" fill="#bfd4bc"/><text x="${(x1+x2)/2}" y="${y-9}" text-anchor="middle">${label}</text>`;
 const wt=detailed?text('bwa'):'—',wm=detailed?text('bwb'):'—',mt=detailed?text('bnut'):'—';
 const pt=text('bpitch'),turns=text('bmin')+'–'+text('bmax');
 const c=detailed?[val('bwa'),val('bwb'),val('bnut')].every(x=>x!==null)?fmt(val('bwa')+val('bwb')+val('bnut')):'—':text('bhardware');
 return `<figure class="bolt-assembly"><svg viewBox="0 0 720 480" role="img" aria-label="Längdsnitt genom två flänsar med packning och en genomgående bult. Måttlinjer A, B, P, mutterhöjd m, brickor w1 och w2, gängstigning p, utstick u och bultlängd L.">
 <defs><linearGradient id="steel04" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dde4e6"/><stop offset=".4" stop-color="#8ba1a8"/><stop offset=".55" stop-color="#dce4e7"/><stop offset="1" stop-color="#829ba2"/></linearGradient><linearGradient id="pe04" x1="0" x2="1"><stop stop-color="#364b50"/><stop offset="1" stop-color="#60787c"/></linearGradient><pattern id="thread04" width="6" height="22" patternUnits="userSpaceOnUse"><path d="M0 0L6 22" stroke="#354e59" stroke-width="1.2"/></pattern></defs>
 <g stroke="#c1cdd0" stroke-width="1.3" stroke-linejoin="round">
 <path d="M70 144H${face-18}V130H${face}V302H${face-18}V288H70V272H${face-18}V160H70Z" fill="url(#pe04)"/>
 <path d="M${left} 62H${pe?face-18:face}V144H${left}ZM${left} 288H${pe?face-18:face}V370H${left}Z" fill="url(#steel04)"/>
 ${blind?`<path d="M${bs} 62H${end}V370H${bs}Z" fill="url(#steel04)"/>`:`<path d="M${bs} 62H${end}V144H650V160H${bs+18}V272H650V288H${end}V370H${bs}Z" fill="${two?'url(#pe04)':'url(#steel04)'}"/>`}
 <path d="M${face+2} 134H${bs-2}V160H${face+2}ZM${face+2} 272H${bs-2}V298H${face+2}Z" fill="#cee49d" stroke="#dfefbf"/>
 <!-- The bolt passes outside the pipe and collar; the IBC gasket is inside the bolt circle. -->
 <path d="M${left-1} 79H${end+1}V105H${left-1}Z" fill="#153338" stroke="none"/>
 <path d="M${left-wa} 81H${tip-4}L${tip} 85V99L${tip-4} 103H${left-wa}Z" fill="url(#steel04)"/>
 <path d="M${end-20} 81H${tip-4}L${tip} 85V99L${tip-4} 103H${end-20}Z" fill="url(#thread04)" stroke="none"/>
 <path d="M${left-wa-24} 74L${left-wa-19} 69H${left-wa-5}L${left-wa} 75V109L${left-wa-5} 115H${left-wa-19}L${left-wa-24} 109Z" fill="url(#steel04)"/>
 <rect x="${left-wa}" y="71" width="${wa}" height="42" rx="1" fill="url(#steel04)"/><rect x="${end}" y="71" width="${wa}" height="42" rx="1" fill="url(#steel04)"/>
 <path d="M${end+wa} 76L${end+wa+5} 71H${end+wa+nh-5}L${end+wa+nh} 76V108L${end+wa+nh-5} 113H${end+wa+5}L${end+wa} 108Z" fill="url(#steel04)"/>
 <path d="M${end+wa+5} 76V108M${end+wa+nh-5} 76V108" stroke="#5b747e"/>
 </g><path d="M45 216H670" stroke="#749796" stroke-dasharray="7 5" opacity=".5"/>
 <g font-family="system-ui,sans-serif" fill="#dbe8dc" font-size="17">
 <text x="65" y="37">Skalle</text><path d="M112 41L${left-wa-15} 70" stroke="#9fb7b1" fill="none"/>
 ${dim(end+wa,end+wa+nh,38,'m · '+mt+' mm')}
 ${dim(left-wa,left,150,'w1')}${dim(end,end+wa,150,'w2')}
 ${dim(end+wa+nh,tip,56,'u')}
 <text x="75" y="212" fill="#a0b7b4" font-size="12">Rörets insida</text>
 <text x="${(left+face)/2}" y="347" text-anchor="middle" fill="#173539" font-weight="700">A</text><text x="${(bs+end)/2}" y="347" text-anchor="middle" fill="#173539" font-weight="700">B</text>
 <text x="535" y="318">P · packning</text><path d="M530 314L${face+6} 292" stroke="#cfe2af" fill="none"/>
 ${dim(left,face,398,'A · '+text('ba')+' mm')}${dim(bs,end,421,'B · '+text('bb')+' mm')}
 ${dim(left-wa,tip,458,'L · undersida skalle → spets')}
 <path d="M${end-16} 116V132M${end-10} 116V132M${end-16} 127H${end-10}" stroke="#c4dfb0" fill="none"/>
 <text x="555" y="182">p · ${pt} mm</text><path d="M550 178L${end-13} 130" stroke="#99b4ab" fill="none"/>
 </g></svg><figcaption>Längdsnitt · proportionerna är illustrativa, ingen produktmåttritning. ${pe?'Lösflänsen ligger bakom bordringskragen. ':''}${blind?'B är en sluten blindfläns.':''}</figcaption>
 <dl class="dimension-key"><div><dt>A</dt><dd>Första flänspaketet <b>${text('ba')} mm</b></dd></div><div><dt>B</dt><dd>Andra flänspaketet <b>${text('bb')} mm</b></dd></div><div><dt>P</dt><dd>Monterad packning <b>${text('bgasket')} mm</b></dd></div><div><dt>C</dt><dd>w1 + w2 + m <b>${c} mm</b></dd></div><div><dt>w1 / w2</dt><dd>Brickornas tjocklek <b>${wt} / ${wm} mm${detailed?'':' · ingår i C'}</b></dd></div><div><dt>m</dt><dd>Mutterns höjd längs bulten <b>${mt} mm${detailed?'':' · ingår i C'}</b></dd></div><div><dt>p</dt><dd>Avstånd mellan gängtoppar <b>${pt} mm</b></dd></div><div><dt>u</dt><dd>Gängor utanför muttern <b>${turns} gängor</b></dd></div></dl></figure>`;
}

function renderBolt(){
 const title=$('btype').selectedOptions[0].textContent;
 if(boltBinding){boltBinding=null;renderParts();}
 const detailed=$('bdetailed').checked;
 const labels={...(detailed?{washerA:'Bricka under skallen',washerB:'Bricka under muttern',nut:'Mutterhöjd'}:{hardwareStack:'C · Mutter + båda brickorna'}),a:'Paketmått A',b:'Paketmått B',gasket:'Packning',pitch:'Gängstigning'};
 const ids={...(detailed?{washerA:'bwa',washerB:'bwb',nut:'bnut'}:{hardwareStack:'bhardware'}),a:'ba',b:'bb',gasket:'bgasket',pitch:'bpitch',turnsMin:'bmin',turnsMax:'bmax',stock:'bstock'};
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
 const pitchWarning=r.pitch!==COARSE_PITCH[+$('bthread').value.slice(1)]?'Avvikande gängstigning: kontrollera att bult och mutter har samma gänga. ':'';
 const status=boltExample?'Exempel med påhittade mått – inte ett produktförslag.':confirmed?'Måtten är bekräftade av användaren.':'Måtten är inte bekräftade. Resultatet är preliminärt.';
 const sum=[r.a,r.b,r.gasket,r.hardwareStack].map(fmt).join(' + ');
 const candidates=r.matches.map(x=>`${x} mm`).join(', ');
 const choice=valid?`<div class="bolt-size">${esc($('bthread').value)} × ${r.candidate}<small>mm · kortaste längd i din lista inom intervallet</small></div>`:`<div class="empty"><h3>Ingen angiven bultlängd ligger inom intervallet</h3><p>${r.next?`Nästa längre i listan är ${r.next} mm, men ger ${fmt((r.next-r.body)/r.pitch)} gängors utstick och väljs därför inte automatiskt.`:'Lägg till fler tillgängliga längder i listan.'}</p></div>`;
 $('bolt-result').innerHTML=`<div class="result-top"><span class="caption">${esc(title)}</span><span class="status ${confirmed&&valid?'':'warn'}">${header}</span></div>${boltDiagram()}<h2>Geometriskt längdintervall</h2><div class="length-range">${fmt(r.min)}–${fmt(r.max)} <small>mm</small></div><p class="result-sub">Utstick: ${fmt(r.turnsMin)}–${fmt(r.turnsMax)} gängor × ${fmt(r.pitch)} mm</p>${choice}<div class="bolt-calculation"><h3>Så räknas längden</h3><p>A + B + P (packning) + C (brickor och mutter)</p><strong>${sum} = ${fmt(r.body)} mm</strong><p>+ gängutstick ${fmt(r.turnsMin*r.pitch)}–${fmt(r.turnsMax*r.pitch)} mm</p>${valid?`<p>Utstick med ${r.candidate} mm: <strong>${fmt(r.actualTurns)} gängor</strong></p><p>Längder i intervallet: ${candidates}</p>`:''}</div><div class="notice">${pitchWarning}${status}<br>Beräkningen kontrollerar längdgeometrin. Kontrollera även bultens toleranser, tillräcklig gänglängd vid muttern, hållfasthet, packningskompression och utrymme enligt tillverkaren. Gäller inte pinnbult, gängade hål eller inspänningsventiler.</div><details class="origin-details"><summary>Måttens ursprung</summary><p>A: ${esc(boltOrigins.a)}</p><p>B: ${esc(boltOrigins.b)}</p><p>A, B, P och C: uppmätta mått. Gängstigning: förifylld grovgänga om du inte har ändrat den.</p></details><div class="source-link">${link('https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-utility-en.pdf','Beräkningsprincip · GF · Planning Fundamentals')}<br>Inga moment eller tryckklasser verifieras av bultlängdsberäkningen.</div><div class="helper-actions result-actions"><button class="small-button" id="bcopy">Kopiera bultunderlag</button><button class="small-button" id="bprint">Skriv ut / PDF</button>${confirmed&&valid&&!boltExample&&boltContextKey===selectionKey(state())?'<button class="primary-button" id="bapply">Visa längden i förband och plocklista →</button>':''}</div>`;
 boltText=`FLÄNSGUIDEN – BULTLÄNGD 0.4.1\n${title}\n${$('bolt-context').textContent}\n${status}\nDimension: ${$('bthread').value}\nPaket A: ${fmt(r.a)} mm (${boltOrigins.a})\nPaket B: ${fmt(r.b)} mm (${boltOrigins.b})\nPackning: ${GASKETS[$('bgasket-type').value]}, monterat mått ${fmt(r.gasket)} mm\nC · brickor och mutter tillsammans: ${fmt(r.hardwareStack)} mm${r.compact?'':` (brickor ${fmt(r.washerA)} + ${fmt(r.washerB)}, mutter ${fmt(r.nut)})`}\nGängstigning: ${fmt(r.pitch)} mm\nÖnskat utstick: ${fmt(r.turnsMin)}–${fmt(r.turnsMax)} gängor\nGeometriskt intervall: ${fmt(r.min)}–${fmt(r.max)} mm\n${valid?`Kortaste match i angiven längdlista: ${$('bthread').value} x ${r.candidate} mm; utstick ${fmt(r.actualTurns)} gängor`:'Ingen angiven längd passar inom intervallet'}\nKontrollera gänglängd, toleranser, hållfasthet och tillverkarens monteringsanvisning separat. Genomgående bult med skalle och en mutter. Ej pinnbult eller gängat hål.`;
 $('bcopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(boltText);$('toast').textContent='Bultunderlaget är kopierat';}catch{$('toast').textContent='Använd Skriv ut / PDF för att spara underlaget.';}$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);});
 $('bprint').addEventListener('click',()=>window.print());
 if($('bapply'))$('bapply').addEventListener('click',()=>{if(!boltContextKey||boltContextKey!==selectionKey(state())){detachBoltContext('Förbandet har ändrats. Resultatet kopplas inte till förbandet.');$('toast').textContent='Förbandet har ändrats – längden kopplades inte';$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000);return;}boltBinding={key:boltContextKey,length:r.candidate,thread:$('bthread').value,summary:boltText};renderParts();showPanel('parts');});
}
$('b-collar').innerHTML=DATA.collars.map((c,i)=>option(i,`Ø${c.od} SDR${c.sdr} · ${c.type==='long'?'lång':'kort'} · H ${c.h} · RSK ${c.rsk}`)).join('');
$('b-duo').innerHTML=option('','Välj DUO-fläns …')+Object.entries(DUO_THICKNESS).map(([dn,f])=>option(dn,`DUO DN${dn} · F ${f} mm`)).join('');
$('b-collar').value=String(DATA.collars.findIndex(c=>c.rsk==='240 99 03'));$('b-duo').value='';
$('btype').addEventListener('change',()=>{boltContextKey=null;boltBinding=null;$('helper-context').textContent='';if(boltExample)['bgasket','bwa','bwb','bnut','bpitch'].forEach(id=>$(id).value='');updateBoltType();$('bolt-context').textContent='Eget förband. Kontrollera bultdimension och samtliga mått för den valda kombinationen.';boltExample=false;renderBolt();});
$('bthread').addEventListener('change',()=>{if(boltContextKey){boltContextKey=null;$('bolt-context').textContent='Bultdimensionen har ändrats manuellt. Resultatet kopplas inte till förbandet.';}['bnut','bwa','bwb','bhardware'].forEach(id=>$(id).value='');setPitch();$('bconfirmed').checked=false;renderBolt();});
['ba','bb','bgasket','bwa','bwb','bnut','bpitch','bhardware','bmin','bmax','bstock'].forEach(id=>$(id).addEventListener('input',()=>{if(boltExample){boltExample=false;boltOrigins.a='Eget mått efter redigerat exempel';boltOrigins.b='Eget mått efter redigerat exempel';$('bolt-context').textContent='Fristående mått efter redigerat räkneexempel. Kontrollera alla mått; ingen produktkoppling.';}if(id==='ba')boltOrigins.a='Eget inmatat mått';if(id==='bb')boltOrigins.b='Eget inmatat mått';$('bconfirmed').checked=false;renderBolt();}));
$('bconfirmed').addEventListener('change',renderBolt);
['b-collar','b-duo'].forEach(id=>$(id).addEventListener('change',showCatalogDimensions));
$('set-side-a').addEventListener('click',()=>setCatalogSide('a'));$('set-side-b').addEventListener('click',()=>setCatalogSide('b'));
$('bexample').addEventListener('click',()=>{boltContextKey=null;
 $('btype').value='hp-steel';updateBoltType();$('bthread').value='M20';
 const values={ba:30,bb:28,bgasket:3,bwa:3,bwb:3,bnut:18,bpitch:2.5,bhardware:24,bmin:2,bmax:3};
 Object.entries(values).forEach(([id,v])=>$(id).value=String(v));
 boltExample=true;boltOrigins.a='Påhittat räkneexempel';boltOrigins.b='Påhittat räkneexempel';$('bolt-context').textContent='Räkneexempel. Måtten avser inga identifierade produkter.';$('bconfirmed').checked=false;renderBolt();
});
$('bclear').addEventListener('click',()=>{boltContextKey=null;$('helper-context').textContent='';['ba','bb','bgasket','bwa','bwb','bnut','bpitch','bhardware'].forEach(id=>$(id).value='');setPitch();boltExample=false;$('bconfirmed').checked=false;$('bolt-context').textContent='Ingen produktkoppling vald. Ange måtten på dina faktiska delar.';boltOrigins.a='Eget mått';boltOrigins.b='Eget mått';renderBolt();});
function setPitch(){$('bpitch').value=String(COARSE_PITCH[+$('bthread').value.slice(1)]??'');}
$('bdetailed').addEventListener('change',()=>{$('compact-hardware').hidden=$('bdetailed').checked;$('detailed-hardware').hidden=!$('bdetailed').checked;$('bconfirmed').checked=false;renderBolt();});
setPitch();updateBoltType();showCatalogDimensions();renderBolt();

function syncGasket(value){
 ['gasket','bgasket-type'].forEach(id=>$(id).value=value);
 $('gasket-note').textContent=gasketNote(value);$('bgasket-note').textContent=gasketNote(value);
 boltBinding=null;if(boltContextKey){boltContextKey=null;$('bolt-context').textContent='Packningsvalet har ändrats. Resultatet kopplas inte till förbandet.';}$('bgasket').value='';$('bconfirmed').checked=false;
 renderParts();renderBolt();
}
['gasket','bgasket-type'].forEach(id=>$(id).addEventListener('change',()=>syncGasket($(id).value)));
$('bgasket-note').textContent=gasketNote($('bgasket-type').value);
