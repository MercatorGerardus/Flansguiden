import { DATA } from './data.js';
export const SOURCE='https://ibeco.se/katalog-dokument';
export const HP_SOURCE=null;
export const SF_SOURCE=null;
export const GF_SOURCE='https://www.gfps.com/sv-se/downloads-tools/online-tools/perfect-flange-connection.html';
export const sfSizes=[
 [90,65,4,16,4,16],[110,80,8,16,8,16],[140,100,8,16,8,16],[160,125,8,16,8,16],[180,125,8,16,8,16],[200,150,8,20,8,20],[250,200,8,20,12,20],[315,250,12,20,12,24],[355,300,12,20,12,24],[400,350,16,20,16,24],[450,400,16,24,16,27],[500,400,16,24,16,27],[560,500,20,24,20,30],[630,500,20,24,20,30],[710,600,20,27,20,33],[800,700,24,27,20,33]
];
export function sizes(family){if(family==='gf')return [200];if(family==='ibeco_sf')return sfSizes.map(x=>x[0]);return [...new Set(DATA.flanges.map(x=>x.od))].sort((a,b)=>a-b);}
export function resolveParts(s){
 const {family,od,pn,sdr,connection,collar}=s;
 if(family==='gf')return {blocked:true,message:'GF är ännu ett referensexempel',detail:'ELGEF Plus Ø200 / DN200 finns kontrollerat i GF:s verktyg. Fullständig koppling till PN, blindfläns och aktuella datablad återstår. Öppna GF:s verktyg för produktval.',dn:200,gf:true};
 if(pn===16&&sdr===17)return {blocked:true,message:'SDR17-produkten är angiven för PN10',detail:'IBECO:s bordringar i SDR17 är katalogförda för PN10. Välj PN10 eller kontrollera en annan produkt med dokumenterad tryckklass.'};
 let flange,selectedCollar;
 if(family==='ibeco_sf'){
  const r=sfSizes.find(x=>x[0]===od);if(!r)return {blocked:true,message:'Dimensionen saknas i underlaget'};
  flange={dn:r[1],bolts:r[pn===10?2:4],thread:r[pn===10?3:5],od,pn:String(pn),page:202};
 }else{
  flange=DATA.flanges.find(x=>x.od===od&&(x.pn==='10/16'||x.pn===String(pn)));
  if(!flange)return {blocked:true,message:'Ingen katalogförd lösfläns för detta val',detail:'Det här betyder att prototypens underlag saknas, inte att produkten inte finns.'};
  if(flange.review)return {blocked:true,message:'Kataloguppgiften behöver verifieras',detail:'Denna dimensionsrad är spärrad på grund av avvikande DN- eller bultuppgifter. Kontrollera aktuell produkt hos IBECO.'};
  selectedCollar=DATA.collars.find(x=>x.od===od&&x.sdr===sdr&&x.type===collar);
 }
 const blind=DATA.blind.find(x=>x.dn===flange.dn&&(x.pn==='10/16'||x.pn===String(pn))&&!x.review);
 const issues=[];
 if(family==='standard'&&!selectedCollar)issues.push('Bordring saknas för vald längd och SDR i det inlästa underlaget.');
 if(connection==='blind'&&!blind)issues.push(pn===16&&flange.dn>=200?'PN16-blindflänsen används hos er, men artikel och mått återstår att verifiera.':'Blindflänsens exakta artikel behöver verifieras för detta val.');
 if(family==='ibeco_sf')issues.push('SF är en reducerad anslutning. Momentdata från Reinert-Ritz överförs inte automatiskt till IBECO:s SF-produkt.');
 if(connection==='pair'&&family==='ibeco_sf')issues.push('Underlaget här identifierar en SF-ände. Två SF-ändar som komplett förband behöver separat kontroll.');
 return {blocked:false,flange,selectedCollar,blind,issues,dn:flange.dn};
}
export function torqueRow(family,pn,od){return DATA.torques.find(x=>x.family===family&&x.pn===pn&&x.od===od);}
export function torqueValue(row,pair){return row?.[pair]??null;}
