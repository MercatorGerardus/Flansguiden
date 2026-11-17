# Flänsguiden

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

## Bultlängdsguide 0.2

Genomgående bult med skalle, två brickor och en mutter. Användaren anger verkliga paketmått A/B, monterad packningstjocklek, brickor, mutterhöjd, gängstigning och utstick. Guiden väljer endast från en redigerbar längdlista och inom hela utsticksintervallet. Ingen automatisk avrundning över övre gränsen. Inga dimensioner överförs mellan HP, DUO och blindflänsar.

IBECO H och DUO F kan hämtas i separat måtthjälp; dimensionerna identifierar delarna, inte deras generella kompatibilitet. Överlappning eller försänkning kräver ett mätt paketmått. Räkneexempel är påhittade och märks även i kopierat underlag. Måttändringar återkallar användarens bekräftelse. Ingen hållfasthetsdimensionering, automatisk momentrekommendation, pinnbult, gängat hål eller inspänningsventil.

Bygg den fristående GitHub Pages-filen med `python3 scripts/build.py`. Publicering från main / root.
