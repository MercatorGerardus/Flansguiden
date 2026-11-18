import { DATA } from './data.js';
export const SOURCE='https://ibeco.se/katalog-dokument';
export const HP_SOURCE=null;
export const SF_SOURCE=null;
export const GF_SOURCE='https://www.gfps.com/sv-se/downloads-tools/online-tools/perfect-flange-connection.html';
export const sfSizes=[
 [90,65,4,16,4,16],[110,80,8,16,8,16],[140,100,8,16,8,16],[160,125,8,16,8,16],[180,125,8,16,8,16],[200,150,8,20,8,20],[250,200,8,20,12,20],[315,250,12,20,12,24],[355,300,12,20,12,24],[400,350,16,20,16,24],[450,400,16,24,16,27],[500,400,16,24,16,27],[560,500,20,24,20,30],[630,500,20,24,20,30],[710,600,20,27,20,33],[800,700,24,27,20,33]
];
// IBECO katalog 2023 s. 202, kolumnen "RSK nr." återgiven ordagrant. PN16 finns endast i SDR11.
export const SF_ARTICLES={
 10:{17:{90:'SFF090-065-10-17',110:'SFF110-080-10-17',140:'SFF140-170-10-17',160:'SFF160-125-10-17',180:'SFF180-125-10-17',200:'SFF200-150-10-17',250:'251 62 48',315:'SFF315-250-10-17',355:'251 62 49',400:'251 62 50',450:'251 62 51',500:'SFF500-400-10-17',560:'251 62 52',630:'SFF630-500-10-17',710:'SFF710-600-10-17',800:'SFF800-700-10-17'},
     11:{90:'SFF090-065-10-11',110:'SFF110-080-10-11',140:'SFF140-100-10-11',160:'SFF160-125-10-11',180:'SFF180-125-10-11',200:'SFF200-150-10-11',250:'251 62 43',315:'SFF315-250-10-11',355:'251 62 44',400:'251 62 45',450:'251 62 46',500:'SFF500-400-10-11',560:'251 62 47',630:'SFF630-500-10-11',710:'SFF710-600-10-11',800:'SFF800-700-10-11'}},
 16:{11:{90:'SFF090-065-16-11',110:'SFF110-080-16-11',140:'SFF140-100-16-11',160:'SFF160-125-16-11',180:'SFF180-125-16-11',200:'SFF200-150-16-11',250:'SFF250-200-16-11',315:'SFF315-250-16-11',355:'SFF355-300-16-11',400:'SFF400-350-16-11',450:'SFF450-400-16-11',500:'SFF500-400-16-11',560:'SFF560-500-16-11',630:'SFF630-500-16-11',710:'SFF710-600-16-11',800:'SFF800-700-16-11'}}
};
// Katalogen anger SFF140-170-10-17 för DN100; beteckningen avviker från raden och måste kontrolleras.
export const SF_ARTICLE_REVIEW=new Set(['SFF140-170-10-17']);
// Källkonflikter som inte avgörs automatiskt: [od, pn] -> beskrivning.
export const SF_CONFLICTS={'800/16':'S. 202 anger 20 × M33 för SF Ø800 / DN700 PN16, men flänstabellen s. 397 och bultsatsen s. 233 anger 24 × M33. Hålbilden måste bekräftas av IBECO.'};
// Tryckklass för PE100-bordringar enligt katalog s. 200–201. Andra PE-material omfattas inte.
export const SDR_PN={11:16,17:10};
export function sizes(family){if(family.startsWith('rr_'))return [...new Set(DATA.torques.filter(x=>x.family===family.slice(3)).map(x=>x.od))];if(family==='ulefos')return ULEFOS.map(x=>x.od);if(family==='agru')return [160];if(family==='gf_ecofit')return GF_GUIDE.map(x=>x.od);if(['plasson','extena','pipelife'].includes(family))return [50,63,75,90,110,125,140,160,180,200,225,250,280,315,355,400,450,500,560,630,710,800];if(family==='gf')return [160,200];if(family==='ibeco_sf')return sfSizes.map(x=>x[0]);return [...new Set(DATA.flanges.map(x=>x.od))].sort((a,b)=>a-b);}
export function resolveParts(s){
 const {family,od,pn,sdr,connection,collar}=s;
 if(family==='gf_ecofit'||family==='agru')return resolveGuideParts(s);
 if(family.startsWith('rr_')||family==='ulefos')return resolveNamedParts(s);
 if(['agru','plasson','extena','pipelife'].includes(family))return {blocked:true,message:'Produktunderlag återstår för '+family,detail:'Fabrikatet är valt, men exakt flänsserie, DN, hålbild och moment är ännu inte inlästa. Använd bultguiden med egna mått. Inga uppgifter från andra fabrikat överförs.'};

 if(family==='gf')return {blocked:true,gf:true,message:'ELGEF Plus kräver separat kontroll i GF:s verktyg',detail:'ecoFIT-tabellen gäller inte automatiskt ELGEF Plus. Använd GF:s verktyg för exakt produkt och packning.'};
 if(family==='ibeco_sf'&&pn===16&&sdr!==11)return {blocked:true,message:'Ingen SF-fläns PN16 i SDR'+sdr+' i underlaget',detail:'IBECO:s långa SF-fläns PN16 är katalogförd endast för SDR11 (katalog 2023 s. 202). Välj PN10-borrning eller SDR11.'};
 if(family==='ibeco_sf'&&SF_CONFLICTS[od+'/'+pn])return {blocked:true,message:'Katalogkonflikt i hålbilden',detail:SF_CONFLICTS[od+'/'+pn],dn:sfSizes.find(x=>x[0]===od)?.[1]};
 let flange,selectedCollar;
 if(family==='ibeco_sf'){
  const r=sfSizes.find(x=>x[0]===od);if(!r)return {blocked:true,message:'Dimensionen saknas i underlaget'};
  const code=SF_ARTICLES[pn]?.[sdr]?.[od];
  flange={dn:r[1],bolts:r[pn===10?2:4],thread:r[pn===10?3:5],od,pn:String(pn),rating:pn,page:202,sfArticle:code??null,sfArticleReview:SF_ARTICLE_REVIEW.has(code),gasketIncluded:pn===16};
 }else{
  flange=DATA.flanges.find(x=>x.od===od&&(x.pn==='10/16'||x.pn===String(pn)));
  if(!flange)return {blocked:true,message:'Ingen katalogförd lösfläns för detta val',detail:'Det här betyder att prototypens underlag saknas, inte att produkten inte finns.'};
  if(flange.review)return {blocked:true,message:'Kataloguppgiften behöver verifieras',detail:'Denna dimensionsrad är spärrad på grund av avvikande DN- eller bultuppgifter. Kontrollera aktuell produkt hos IBECO.'};
  selectedCollar=DATA.collars.find(x=>x.od===od&&x.sdr===sdr&&x.type===collar);
 }
 const blind=DATA.blind.find(x=>x.dn===flange.dn&&(x.pn==='10/16'||x.pn===String(pn))&&!x.review);
 const issues=[];
 // Borrningen (pn) styr hålbilden. Förbandets tryckklass begränsas av svagaste dokumenterade del.
 // identifiedPn gäller endast identifierade katalogdelar. componentPn anges när alla katalogdelar är identifierade.
 // Hela förbandets tryckklass anges aldrig: packningens lämplighet och delarnas kompatibilitet verifieras inte här.
 const limits=[],missingParts=[];
 if(s.material!=='pe100')missingParts.push(s.material?'rörmaterial (endast PE100 omfattas av underlaget)':'rörmaterial (ej angivet)');
 if(family==='ibeco_sf')limits.push({part:`SF-fläns ${flange.sfArticle??'SDR'+sdr}`,pn:pn});
 else{
  if(selectedCollar&&s.material==='pe100'&&SDR_PN[sdr])limits.push({part:`PE100-bordring SDR${sdr}`,pn:SDR_PN[sdr]});
  else if(!selectedCollar)missingParts.push('bordring');
  if(flange.rating)limits.push({part:`PP-stållösfläns ${flange.article}`,pn:flange.rating});
 }
 if(connection==='blind'){if(blind)limits.push({part:`blindfläns ${blind.article}`,pn:blind.pn==='10/16'?16:Number(blind.pn)});else missingParts.push('blindfläns');}
 if(connection==='fixed')missingParts.push('motfläns / ventil (ej identifierad)');
 if(connection==='pair'&&family==='ibeco_sf')missingParts.push('andra SF-änden (kontrolleras separat)');
 if(family==='ibeco_sf'&&flange.sfArticleReview)missingParts.push(`SF-artikel ${flange.sfArticle}`);
 const identifiedPn=limits.length?Math.min(...limits.map(x=>x.pn)):null;
 const limitedBy=limits.filter(x=>x.pn===identifiedPn).map(x=>x.part);
 const componentPn=missingParts.length?null:identifiedPn;
 const identifiedParts=limits.map(x=>x.part);
 const jointUnverified=['packning (typ, tryckklass och lämplighet är inte verifierade)','kompatibilitet mellan delarna'];
 if(identifiedPn!==null&&identifiedPn<pn)issues.push(`Borrning PN${pn} ger hålbild mot PN${pn}-armatur, men identifierade delar är dokumenterade för högst PN${identifiedPn} (${limitedBy.join(', ')}).`);
 if(missingParts.length)issues.push(`Katalogdelarnas tryckklass är inte fastställd. Underlag saknas för: ${missingParts.join(', ')}.`);
 if(family==='standard'&&!selectedCollar)issues.push('Bordring saknas för vald längd och SDR i det inlästa underlaget.');
 if(connection==='blind'&&!blind)issues.push(pn===16&&flange.dn>=200?'IBECO:s blindflänsar DN200 och större är katalogförda endast i PN10 (katalog 2023 s. 222 och datablad). PN16 ska beställas som specialutförande och verifieras hos IBECO.':'Blindflänsens exakta artikel behöver verifieras för detta val.');
 if(family==='ibeco_sf')issues.push('SF är en reducerad anslutning. Momentdata från Reinert-Ritz överförs inte automatiskt till IBECO:s SF-produkt.');
 if(connection==='pair'&&family==='ibeco_sf')issues.push('Underlaget här identifierar en SF-ände. Två SF-ändar som komplett förband behöver separat kontroll.');
 if(family==='ibeco_sf'&&flange.sfArticleReview)issues.push(`Katalogens beteckning ${flange.sfArticle} stämmer inte med DN${flange.dn}. Kontrollera artikeln hos IBECO.`);
 return {blocked:false,flange,selectedCollar,blind,issues,dn:flange.dn,componentPn,identifiedPn,identifiedParts,limitedBy,missingParts,jointPn:null,jointUnverified};
}
export function torqueRow(family,pn,od){return DATA.torques.find(x=>x.family===family&&x.pn===pn&&x.od===od);}
export function torqueValue(row,pair){return row?.[pair]??null;}

// Geometry only: ordinary through bolt, one nut, no threaded holes/studs.
// A and B exclude the gasket and washers. No catalog dimensions are assumed.
export function calculateBolt(input){
 const read=(key,min,inclusive=false)=>{
  const raw=input[key];
  if(raw===null||raw===undefined||String(raw).trim()==='')throw new Error('Fyll i alla mått.');
  if(!/^\d+(?:[.,]\d+)?$/.test(String(raw).trim()))throw new Error('Ange ett decimaltal i mm, till exempel 25,5.');
  const n=Number(String(raw).replace(',','.'));
  if(!Number.isFinite(n)||(inclusive?n<min:n<=min)||n>10000)throw new Error('Kontrollera måtten: positiva värden i mm krävs. Packning får vara 0.');
  return n;
 };
 const compact=String(input.hardwareStack??'').trim()!=='';
 const a=read('a',0),b=read('b',0),gasket=read('gasket',0,true),washerA=compact?null:read('washerA',0,true),washerB=compact?null:read('washerB',0,true),nut=compact?null:read('nut',0),pitch=read('pitch',0);
 const hardwareStack=compact?read('hardwareStack',0):washerA+washerB+nut;
 const turnsMin=read('turnsMin',0),turnsMax=read('turnsMax',0);
 if(turnsMax<turnsMin)throw new Error('Största gängutstick måste vara minst lika stort som det minsta.');
 const body=a+b+gasket+hardwareStack;
 const min=body+pitch*turnsMin,max=body+pitch*turnsMax;
 const stockText=String(input.stock??'').trim();
 if(!stockText||!/^[\d\s.,;]+$/.test(stockText))throw new Error('Ange tillgängliga bultlängder som heltal, åtskilda med kommatecken.');
 const stock=[...new Set(stockText.split(/[\s,;]+/).filter(Boolean).map(Number))].sort((x,y)=>x-y);
 if(!stock.length||stock.some(x=>!Number.isSafeInteger(x)||x<=0||x>10000))throw new Error('Ange positiva hela millimeter för bultlängderna.');
 const tolerance=1e-8;
 const matches=stock.filter(x=>x>=min-tolerance&&x<=max+tolerance);
 const candidate=matches[0]??null;
 const next=stock.find(x=>x>=min-tolerance)??null;
 const actualTurns=candidate===null?null:(candidate-body)/pitch;
 return {a,b,gasket,washerA,washerB,nut,hardwareStack,compact,pitch,body,min,max,turnsMin,turnsMax,matches,candidate,next,actualTurns};
}

export const DUO_THICKNESS={40:21,50:21,60:21,65:21,80:21,100:21,125:21,150:21,200:22,250:26,300:32,350:36,400:38,450:38,500:40,600:46};

export const GASKETS={epdm:'EPDM med stålinlägg · profil ej identifierad',epdm_profile:'EPDM-profilpackning med stålinlägg',epdm_flat:'EPDM-planpackning',grafex:'Grafex EX',oring:'O-ring',other:'Annan packning'};
export const KIT_SOURCE='https://ibeco.se/produkter/bultsats-lang-syrafast-epdm';
// Manufacturer's long A2/A4 EPDM kit, not a universal assembly length.
// Values reproduced exactly from IBECO katalog 2023 s. 233, including rows that conflict with the flange tables.
export const KIT_PAGE=233;
export const LONG_KITS=[
[50,'10/16',80,4,16,'2404544'],[65,'10/16',90,4,16,'2404545'],[80,'10/16',90,4,16,'2404546'],[100,'10/16',90,8,16,'2404547'],[125,'10/16',90,8,16,'2404548'],[150,'10/16',100,8,20,'2404549'],
[200,'10',110,8,20,'2404550'],[200,'16',120,12,20,'2404551'],[250,'10',110,12,20,'2404552'],[250,'16',140,12,24,'2404553'],[300,'10',130,12,24,'2404554'],[300,'16',140,12,24,'2404555'],[350,'10',140,16,20,'2404556'],[350,'16',150,16,24,'2404557'],[400,'10',140,16,24,'2404558'],[400,'16',160,16,27,'2404559'],[450,'10',150,20,24,'2404560'],[500,'10',180,20,24,'2404562'],[500,'16',190,20,30,'2404563'],[600,'10',190,20,27,'2404564'],[600,'16',200,20,33,'2404565'],[700,'10',190,24,27,'2404566'],[700,'16',200,24,33,'2404567'],[800,'10',200,24,30,'2404568'],[800,'16',210,24,36,'2404569']
].map(([dn,pn,length,bolts,thread,rsk])=>({dn,pn,length,bolts,thread,rsk}));
export function catalogKit(s,r){
 if(r.blocked||s.family!=='standard'||!['epdm','epdm_profile'].includes(s.gasket))return null;
 const k=LONG_KITS.find(k=>k.dn===r.dn&&(k.pn==='10/16'||k.pn===String(s.pn)));
 return k?{...k,conflict:k.bolts!==r.flange.bolts||k.thread!==r.flange.thread}:null;
}
export function selectionKey(s){return JSON.stringify([s.family,s.od,s.sdr,s.material??'',s.pn,s.connection,s.collar,s.gasket,s.lubrication??'']);}
// Tryckklassbesked för gränssnitt och kopierad lista. Säger aldrig att hela förbandet har en PN.
export function pressureSummary(r){
 const parts=r.identifiedParts?.join(', ')||'inga';
 const value=r.componentPn?`PN ${r.componentPn}`:'Ej fastställd';
 const scope=r.componentPn?`Gäller endast katalogdelarna: ${parts}. Lägst: ${r.limitedBy.join(', ')}.`:`Underlag saknas för: ${r.missingParts.join(', ')}.${r.identifiedPn?` Identifierade delar högst PN ${r.identifiedPn} (${r.limitedBy.join(', ')}).`:''}`;
 const joint=`Hela förbandet: ej fastställd. Ej verifierat: ${r.jointUnverified.join(', ')}.`;
 return {caption:'Tryckklass · katalogdelar',value,scope,joint,copy:`Tryckklass katalogdelar: ${value}. ${scope}\n${joint}`};
}
// Packningsrader för plocklistan. En medföljande packning får aldrig namnet på användarens val:
// katalogen anger bara att packning ingår, inte vilken typ.
export function gasketLines(s,r){
 const chosen=GASKETS[s.gasket];
 if(r.flange?.gasketIncluded)return [
  {name:'Medföljande packning · typ ej angiven i katalogen',detail:`Ingår i reducerad SF-fläns PN16 enligt IBECO-katalogen s. 202. Typ, material och tjocklek är inte dokumenterade i underlaget.`,qty:'Ingår · typ okänd',wait:true,included:true},
  {name:`Vald packning: ${chosen}`,detail:'Ersätter den medföljande packningen endast efter kontroll av typ, tjocklek och tillverkarens godkännande.',qty:'Kontroll krävs',wait:true,included:false}];
 return [{name:chosen,detail:`DN${r.dn} · PN${s.pn} · exakt produkt och profil kontrolleras`,qty:'1 st',wait:false,included:false}];
}

// Primary product pages, kept separate from distributor catalogue data. b is the flange thickness.
export const ULEFOS=[
 {od:160,dn:150,pn:'10/16',bolts:8,thread:20,thickness:24,diameter:285,circle:240,rsk:'2818353',source:'https://ulefos.se/produkt/160xdn150/'},
 {od:560,dn:600,pn:'10',bolts:20,thread:27,thickness:64,diameter:796,circle:725,rsk:'2818364',source:'https://ulefos.se/produkt/560xdn600/'}
];
export const COARSE_PITCH={12:1.75,16:2,20:2.5,24:3,27:3,30:3.5,33:3.5,36:4,39:4,45:4.5,52:5};
export function selectedTorque(s){
 if(s.family==='gf_ecofit'||s.family==='agru')return guideTorque(s);
 if(s.gasket==='epdm')return {value:null,reason:'Packningsprofilen är inte identifierad. Välj profilpackning eller planpackning först. EPDM och stålinlägg ensamt bestämmer inte momentet.'};
 if(!s.family.startsWith('rr_'))return {value:null,reason:'Moment kräver underlag för det valda fabrikatet och flänssystemet. Inga Reinert-Ritz-värden överförs till andra produkter.'};
 const family=s.family.slice(3),row=torqueRow(family,s.pn,s.od);
 if(s.connection==='blind')return {value:null,reason:'Momenttabellen identifierar inte den valda blindflänsen. Underlag för det exakta flänsparet krävs.'};
 if(!['epdm_profile','oring'].includes(s.gasket)||family==='hp'&&s.gasket==='oring')return {value:null,reason:'Momentunderlag saknas för den här packningen i det valda systemet.'};
 if(family==='sf'&&s.connection==='pair')return {value:null,reason:'Tabellen gäller stål mot VP/SF, inte två VP/SF-ändar.'};
 if(!row)return {value:null,reason:'Dimensionen saknas i den inlästa momenttabellen.'};
 if(row.dn>200)return {value:null,reason:'För DN över 200 hänvisar Reinert-Ritz aktuella monteringsunderlag till leveransdokumenten. Begär moment för exakt produkt; den äldre tabellen används inte automatiskt.'};
 const column=family==='hp'?(s.connection==='pair'?'b':'a'):(s.gasket==='oring'?'a':'b');
 return {value:row[column],row,column,manufacturer:'Reinert-Ritz',kind:'recommendation',reason:'Tabellvärde för angivet Reinert-Ritz-flänspar. Kontrollera profilpackning och samtliga monteringsvillkor.'};
}
function resolveNamedParts(s){
 const isRR=s.family.startsWith('rr_');
 const t=isRR?torqueRow(s.family.slice(3),s.pn,s.od):null;
 const f=isRR?(t?{dn:t.dn,od:s.od,pn:String(s.pn),bolts:null,thread:null}:null):ULEFOS.find(x=>x.od===s.od&&(x.pn==='10/16'||x.pn===String(s.pn)));
 if(!f)return {blocked:true,message:'Valet saknas i det inlästa produktunderlaget',detail:'Välj en dokumenterad dimension och borrning. Ulefos-serien omfattar för närvarande Ø160 PN10/16 och Ø560 PN10.'};
 const name=isRR?'Reinert-Ritz '+(s.family==='rr_hp'?'HP-fläns':'VP/SF-fläns'):'Ulefos PP-stållösfläns';
 return {blocked:false,named:true,name,dn:f.dn,flange:f,source:isRR?'https://www.reinert-ritz.de/products/assembly-instructions-flanges/?lang=en':f.source,issues:['Artikel, motfläns och komplett förband måste identifieras separat.'],componentPn:null,identifiedPn:null,identifiedParts:[name],limitedBy:[],missingParts:['komplett produkt- och materialunderlag'],jointPn:null,jointUnverified:['packningens lämplighet','kompatibilitet mellan delarna']};
}

export const GF_GUIDE_SOURCE='https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-industry-design-installation-en.pdf';
export const AGRU_GUIDE_SOURCE='https://www.agru.at/fileadmin/user_upload/produkte/agruline/downloads/Kataloge/de/AGRU_TechKAT_Agruline_DE.pdf';
export const AGRU_160_SOURCE='https://www.agru.at/en/products/agruline/product-catalogue/05/pe100-rc-piping-system-fm-215-psi-07/backing-rings-accessories-45/code-14014-005/cm/14014016011';
// Extracted rows and operating conditions are documented separately in docs/torque-review.md.
export const GF_GUIDE=[{"od":16,"dn":10,"flat":[10,13],"profile":[10,13]},{"od":20,"dn":15,"flat":[10,13],"profile":[10,13]},{"od":25,"dn":20,"flat":[10,13],"profile":[10,13]},{"od":32,"dn":25,"flat":[15,20],"profile":[10,13]},{"od":40,"dn":32,"flat":[20,26],"profile":[15,20]},{"od":50,"dn":40,"flat":[25,33],"profile":[15,20]},{"od":63,"dn":50,"flat":[35,46],"profile":[20,26]},{"od":75,"dn":65,"flat":[50,65],"profile":[25,33]},{"od":90,"dn":80,"flat":[30,39],"profile":[15,20]},{"od":110,"dn":100,"flat":[35,46],"profile":[20,26]},{"od":125,"dn":100,"flat":[35,46],"profile":[20,26]},{"od":140,"dn":125,"flat":[45,59],"profile":[25,33]},{"od":160,"dn":150,"flat":[60,78],"profile":[35,46]},{"od":180,"dn":150,"flat":[60,78],"profile":[35,46]},{"od":200,"dn":200,"flat":[75,91],"profile":[45,59]},{"od":225,"dn":200,"flat":[75,91],"profile":[45,59]},{"od":250,"dn":250,"flat":[65,85],"profile":[35,46]},{"od":280,"dn":250,"flat":[65,85],"profile":[35,46]},{"od":315,"dn":300,"flat":[90,117],"profile":[50,65]},{"od":355,"dn":350,"flat":[90,117],"profile":[50,65]},{"od":400,"dn":400,"flat":[100,130],"profile":[60,78]},{"od":450,"dn":500,"flat":[190,247],"profile":[70,91]},{"od":500,"dn":500,"flat":[190,247],"profile":[70,91]},{"od":560,"dn":600,"flat":[220,286],"profile":[90,117]},{"od":630,"dn":600,"flat":[220,286],"profile":[90,117]}];
export const AGRU_160={od:160,dn:150,pn:'10/16',bolts:8,thread:20,article:'14.014.0160.11',thickness:23,diameter:285,circle:240,maximumTorque:95};
function resolveGuideParts(s){
 const gf=s.family==='gf_ecofit',row=gf?GF_GUIDE.find(x=>x.od===s.od):(s.od===160?AGRU_160:null);
 if(!row)return {blocked:true,message:'Dimensionen saknas i det granskade underlaget',detail:gf?'Välj en dimension i GF-tabellen.':'För AGRU har endast Ø160 / lösfläns 14.014.0160.11 verifierats.'};
 const name=gf?'GF · ecoFIT PE med PP-stållösfläns':'AGRU · PE-bordring + DIN-lösfläns 14.014';
 const flange=gf?{od:s.od,dn:row.dn,pn:String(s.pn),bolts:null,thread:null}:{...row};
 return {blocked:false,named:true,guide:true,name,dn:flange.dn,flange,source:gf?GF_GUIDE_SOURCE:AGRU_160_SOURCE,issues:['Momentuppgiften är en villkorsstyrd tabellreferens. Exakt packning, bordring och motfläns samt driftförhållanden ska kontrolleras.'],componentPn:null,identifiedPn:null,identifiedParts:[name],limitedBy:[],missingParts:['komplett produkt- och driftunderlag'],jointPn:null,jointUnverified:['packningens utförande och hårdhet','kompatibilitet och driftförhållanden']};
}
function guideTorque(s){
 const gf=s.family==='gf_ecofit';
 if(['grafex','other'].includes(s.gasket))return {value:null,reason:'Tabellen gäller elastomerpackningar, inte Grafex eller annan packning.'};
 if(!['epdm_profile','epdm_flat'].includes(s.gasket))return {value:null,reason:'Välj identifierad EPDM-profilpackning eller planpackning. För O-ring krävs ett uttryckligen avsett flänssystem; för okänd profil ges inget Nm.'};
 if(s.connection!=='fixed')return {value:null,reason:'Den första verifierade tabellkopplingen omfattar PE mot fast metallfläns. Blindfläns och två plaständar är inte avstämda och får inget automatiskt moment.'};
 if(![11,17].includes(s.sdr))return {value:null,reason:'Vald SDR ingår inte i appens granskade omfattning.'};
 const row=gf?GF_GUIDE.find(x=>x.od===s.od):(s.od===160?{od:160,dn:150,flat:60,profile:40}:null);
 if(!row)return {value:null,reason:'Dimensionen saknas i det granskade momentunderlaget.'};
 if(gf&&!['lubed','unlubed'].includes(s.lubrication))return {value:null,reason:'Välj smort eller osmort utförande enligt GF-tabellen. Kolumnerna ger olika moment och väljs inte automatiskt.'};
 const flat=s.gasket==='epdm_flat',nm=gf?(flat?row.flat:row.profile)[s.lubrication==='lubed'?0:1]:(flat?row.flat:row.profile);
 const pressure=gf?null:flat?10:16;
 const conditions=gf?['Endast ecoFIT PE, metriskt ISO-förband med GF PP-stållösfläns. ELGEF Plus och andra GF-system omfattas inte av denna koppling.','Packningens profil, material, hårdhet och mått ska stämma med källans förutsättningar.',`Vald kolumn: ${s.lubrication==='lubed'?'lubed (smort)':'unlubed (osmord)'}. Detta är ett utförandeval enligt GF-tabellen, ingen instruktion att smörja packningen.`,'Vridspjäll- och inspänningsventiler kräver separat produktspecifik kontroll och omfattas inte av denna förenklade koppling.','Följ GF:s anvisningar för skruv/mutter, smörjmedel, korsvis åtdragning och kontroll efter montage och provtryck.']:
 ['Endast AGRU Ø160 / DN150 med DIN-lösfläns 14.014.0160.11.','Tabell C.9 avser 80 Shore A. Packningens hårdhet och profil måste verifieras.','Friktion cirka 0,15 i gänga och mutteranliggning enligt källan. Andra smörjförhållanden omfattas inte automatiskt.','Lösflänsens separata maxvärde är 95 Nm; det är inte ett rekommenderat åtdragningsmoment.'];
 if(!gf)conditions.push(`Tabellens tryckgräns för denna packningsform: ${pressure} bar${flat?' och högst 40 °C':''}. Det är en användningsgräns, inte samma sak som borrning PN${s.pn}.`);
 if(flat&&!gf)conditions.push('Planpackning förutsätter den tätningsyta som tillverkaren anger.');
 conditions.push('Kontrollera arbetstryck, provtryck, temperatur, toleranser och hela förbandets tillåtna belastning. Tabellen är inget montagegodkännande.');
 return {value:[null,nm,null],kind:'guideline',manufacturer:gf?'GF':'AGRU',source:gf?GF_GUIDE_SOURCE:AGRU_GUIDE_SOURCE,page:gf?'IV · 311, utgåva 09/2026':'60 · tabell C.9',maximumTorque:gf?null:95,conditions,pressureLimit:pressure,reason:'Villkorsstyrt riktvärde ur tillverkarens tabell. Kontroll krävs före användning.'};
}
