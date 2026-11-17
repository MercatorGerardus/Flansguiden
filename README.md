# Vabon Flänsguiden

Svensk mobilanpassad prototyp för flänsval, plocklista och dokumenterade tabellmoment. Statisk webbapp utan konto eller serverdatabas i applikationen.

## Köra

`npm run dev` öppnar en statisk server på port 4173. `npm test` kontrollerar urval, spärrar och momenttabeller. Publiceringsmapp: `dist`.

## Underlag

- IBECO produktkatalog 2023: s. 200–202, 222 och 225. Inlästa 35 lösflänsrader och 91 bordringsrader. Anomalier på stora dimensioner spärras. Bultlängder från satstabellerna används inte generellt.
- Reinert-Ritz HP PN10/PN16: 48 rader; reducerad VP/SF PN10/PN16: 38 rader. Båda kolumnerna bevaras per rad med min/rekommenderat/max samt källsida.
- GF-verktyget: en referenskontroll i källvyn, inga generella GF-rekommendationer.
- Blindfläns med gängat uttag prioriteras enligt användaren. PN16 för DN200 och uppåt återstår att dokumentera; ingen PN10-artikel återanvänds som PN16.

## Begränsningar och nästa steg

Tabellvärdena behöver oberoende verifiering mot ritningar, aktuella datablad och tillverkarvillkor innan skarp fältanvändning. Ej en generell dimensioneringsberäkning. Inga automatiska moment eller bultlängder för IBECO/GF. Ingen automatiskt påstådd kompatibilitet mellan fabrikat. Katalogens DN65-blindfläns är markerad DN60 i originalet och därför spärrad. DN300 PN16-bultsatser skiljer mellan s.232 och s.234 och är inte inlagda som rekommendationer.

Håll produkter och källor åtskilda från beräkningslogiken. Nya dokument ska identifiera exakt produkt, artikel, DN, PN, SDR, packning och monteringsvillkor. Lägg till regressionstest för säkerhetskritiska rättningar.
