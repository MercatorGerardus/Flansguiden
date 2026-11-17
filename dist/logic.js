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
export function sizes(family){if(family==='gf')return [200];if(family==='ibeco_sf')return sfSizes.map(x=>x[0]);return [...new Set(DATA.flanges.map(x=>x.od))].sort((a,b)=>a-b);}
export function resolveParts(s){
 const {family,od,pn,sdr,connection,collar}=s;
 if(family==='gf')return {blocked:true,message:'GF är ännu ett referensexempel',detail:'ELGEF Plus Ø200 / DN200 finns kontrollerat i GF:s verktyg. Fullständig koppling till PN, blindfläns och aktuella datablad återstår. Öppna GF:s verktyg för produktval.',dn:200,gf:true};
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
 const limits=[];
 if(SDR_PN[sdr])limits.push({part:family==='ibeco_sf'?`SF-fläns SDR${sdr}`:`PE100-bordring SDR${sdr}`,pn:family==='ibeco_sf'?Math.min(SDR_PN[sdr],pn):SDR_PN[sdr]});
 if(family==='standard'&&flange.rating)limits.push({part:`PP-stållösfläns ${flange.article}`,pn:flange.rating});
 if(connection==='blind'&&blind)limits.push({part:`blindfläns ${blind.article}`,pn:blind.pn==='10/16'?16:Number(blind.pn)});
 const ratedPn=limits.length?Math.min(...limits.map(x=>x.pn)):null;
 const limitedBy=limits.filter(x=>x.pn===ratedPn).map(x=>x.part);
 if(ratedPn!==null&&ratedPn<pn)issues.push(`Borrning PN${pn} ger hålbild mot PN${pn}-armatur, men förbandets dokumenterade tryckklass är PN${ratedPn} (${limitedBy.join(', ')}).`);
 if(family==='standard'&&!selectedCollar)issues.push('Bordring saknas för vald längd och SDR i det inlästa underlaget.');
 if(connection==='blind'&&!blind)issues.push(pn===16&&flange.dn>=200?'IBECO:s blindflänsar DN200 och större är katalogförda endast i PN10 (katalog 2023 s. 222 och datablad). PN16 ska beställas som specialutförande och verifieras hos IBECO.':'Blindflänsens exakta artikel behöver verifieras för detta val.');
 if(family==='ibeco_sf')issues.push('SF är en reducerad anslutning. Momentdata från Reinert-Ritz överförs inte automatiskt till IBECO:s SF-produkt.');
 if(connection==='pair'&&family==='ibeco_sf')issues.push('Underlaget här identifierar en SF-ände. Två SF-ändar som komplett förband behöver separat kontroll.');
 if(family==='ibeco_sf'&&flange.sfArticleReview)issues.push(`Katalogens beteckning ${flange.sfArticle} stämmer inte med DN${flange.dn}. Kontrollera artikeln hos IBECO.`);
 return {blocked:false,flange,selectedCollar,blind,issues,dn:flange.dn,ratedPn,limitedBy};
}
export function torqueRow(family,pn,od){return DATA.torques.find(x=>x.family===family&&x.pn===pn&&x.od===od);}
export function torqueValue(row,pair){return row?.[pair]??null;}

// Geometry only: ordinary through bolt, one nut, no threaded holes/studs.
// A and B exclude the gasket and washers. No catalog dimensions are assumed.
export function calculateBolt(input){
 const read=(key,min,inclusive=false)=>{
  const raw=input[key];
  if(raw===null||raw===undefined||String(raw).trim()==='')throw new Error('Fyll i alla mått.');
  const n=Number(String(raw).replace(',','.'));
  if(!Number.isFinite(n)||(inclusive?n<min:n<=min)||n>10000)throw new Error('Kontrollera måtten: positiva värden i mm krävs. Packning får vara 0.');
  return n;
 };
 const a=read('a',0),b=read('b',0),gasket=read('gasket',0,true),washerA=read('washerA',0,true),washerB=read('washerB',0,true),nut=read('nut',0),pitch=read('pitch',0);
 const turnsMin=read('turnsMin',0),turnsMax=read('turnsMax',0);
 if(turnsMax<turnsMin)throw new Error('Största gängutstick måste vara minst lika stort som det minsta.');
 const body=a+b+gasket+washerA+washerB+nut;
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
 return {a,b,gasket,washerA,washerB,nut,pitch,body,min,max,turnsMin,turnsMax,matches,candidate,next,actualTurns};
}

export const DUO_THICKNESS={40:21,50:21,60:21,65:21,80:21,100:21,125:21,150:21,200:22,250:26,300:32,350:36,400:38,450:38,500:40,600:46};

export const GASKETS={epdm:'EPDM med stålinlägg',grafex:'Grafex EX',oring:'O-ring',other:'Annan packning'};
export const KIT_SOURCE='https://ibeco.se/produkter/bultsats-lang-syrafast-epdm';
// Manufacturer's long A2/A4 EPDM kit, not a universal assembly length.
// Values reproduced exactly from IBECO katalog 2023 s. 233, including rows that conflict with the flange tables.
export const KIT_PAGE=233;
export const LONG_KITS=[
[50,'10/16',80,4,16,'2404544'],[65,'10/16',90,4,16,'2404545'],[80,'10/16',90,4,16,'2404546'],[100,'10/16',90,8,16,'2404547'],[125,'10/16',90,8,16,'2404548'],[150,'10/16',100,8,20,'2404549'],
[200,'10',110,8,20,'2404550'],[200,'16',120,12,20,'2404551'],[250,'10',110,12,20,'2404552'],[250,'16',140,12,24,'2404553'],[300,'10',130,12,24,'2404554'],[300,'16',140,12,24,'2404555'],[350,'10',140,16,20,'2404556'],[350,'16',150,16,24,'2404557'],[400,'10',140,16,24,'2404558'],[400,'16',160,16,27,'2404559'],[450,'10',150,20,24,'2404560'],[500,'10',180,20,24,'2404562'],[500,'16',190,20,30,'2404563'],[600,'10',190,20,27,'2404564'],[600,'16',200,20,33,'2404565'],[700,'10',190,24,27,'2404566'],[700,'16',200,24,33,'2404567'],[800,'10',200,24,30,'2404568'],[800,'16',210,24,36,'2404569']
].map(([dn,pn,length,bolts,thread,rsk])=>({dn,pn,length,bolts,thread,rsk}));
export function catalogKit(s,r){
 if(r.blocked||s.family!=='standard'||s.gasket!=='epdm')return null;
 const k=LONG_KITS.find(k=>k.dn===r.dn&&(k.pn==='10/16'||k.pn===String(s.pn)));
 return k?{...k,conflict:k.bolts!==r.flange.bolts||k.thread!==r.flange.thread}:null;
}
export function selectionKey(s){return JSON.stringify([s.family,s.od,s.sdr,s.pn,s.connection,s.collar,s.gasket]);}
