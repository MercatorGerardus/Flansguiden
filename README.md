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

## Packning och bultresultat 0.3

EPDM med stålinlägg är förvalt. Grafex EX, O-ring och annan packning kan väljas. Valet delas mellan vyerna; Grafex får inga EPDM-moment. Fotots nominella 3 mm för DN200 används inte som monterad tjocklek. O-ring stöds endast av VP/SF-källans särskilda kolumn.

25 rader för långa syrafasta EPDM-bultsatser, återgivna ordagrant från IBECO-katalogen 2023 s. 233, visas separat som katalogreferens, med källänk och konfliktmarkering vid avvikande hålbild. Ingen generell kompatibilitet antas. Bultguiden kan föra ett bekräftat, icke-exempelbaserat geometriskt resultat till det förband där beräkningen startades. Ändrat förband, packning eller mått återkallar kopplingen. Ingen lokal beständig lagring av resultat.

## Granskningsrättningar 0.3.2

- DUO-måttet F förväljs inte längre. Förbanden i Välj förband har PP-stållösfläns, och DUO-mått gäller inte den. Används DUO-hjälpen kopplas resultatet bort från förbandet. SF-flänsar har egna bultförbandstyper utan bordringshjälp.
- Bultsatsen DN300 PN10 följer katalogen s. 233 (12 × M24) och markeras därför som avvikande mot lösflänsen (12 × M20). Webbsidan är inte avstämd mot katalogen.
- SF Ø800 / DN700 PN16 spärras: s. 202 anger 20 × M33, s. 397 och s. 233 anger 24 × M33.
- Flänsborrning (hålbild) är skild från tryckklassen. Appen anger bara tryckklass för identifierade katalogdelar (bordring, lösfläns, blindfläns eller SF-fläns), och bara när alla katalogdelar är identifierade och rörmaterialet aktivt är valt som PE100. Materialfältet är tomt från start. Hela förbandets tryckklass anges aldrig: packningens typ, tryckklass och lämplighet samt delarnas kompatibilitet verifieras inte i underlaget. PN16-borrning på SDR17 PE100 är tillåten men katalogdelarna begränsas till PN10.
- SF-flänsens katalogbeteckning (s. 202) visas. För PN16 anger katalogen att packning ingår men inte vilken typ: plocklistan visar en medföljande packning av okänd typ och användarens valda packning som en separat rad som kräver kontroll. Beteckningen SFF140-170-10-17 avviker från DN100 och flaggas.
- Bultvyn visar när kopplingen till förbandet har brutits (ändrat förband, packning, bultdimension eller DUO-mått), och knappen för att koppla längden kontrollerar förbandet igen vid klick.


## Förbandsflöde 0.4.0

Förband och moment delar samma produkt-, dimensions-, flänspar- och packningsval. Inga moment överförs mellan fabrikat. Neutrala produktnamn används för katalogdelar där tillverkaren inte är identifierad; IBECO behålls som distributör/katalogkälla. Reinert-Ritz HP och VP/SF är separata serier. GF, Agru, Plasson, Extena och Pipelife visas med tydlig avgränsning när exakt produktunderlag saknas.

Ulefos PP-stållösfläns har två separat verifierade rader, utan att ärva bordringar, blindflänsar eller moment ur någon annan katalog:
- Ø160/DN150 PN10/16: RSK 2818353, 8×M20, b=24 mm, D=285 mm, k=240 mm. Källa: https://ulefos.se/produkt/160xdn150/
- Ø560/DN600 PN10: RSK 2818364, 20×M27, b=64 mm, D=796 mm, k=725 mm. Källa: https://ulefos.se/produkt/560xdn600/

Reinert-Ritz aktuella anvisning ska kontrolleras mot levererad produkt. För DN över 200 används inte äldre momentrader automatiskt i det gemensamma flödet, eftersom det aktuella underlaget hänvisar till leveransdokumenten:
https://www.reinert-ritz.de/wp-content/uploads/2025/03/Flange-installation_EN.pdf
https://www.reinert-ritz.de/products/assembly-instructions-flanges/?lang=en

Bultguidens enkla läge använder fyra uppmätta mått: A, B, monterad packning P och C (mutter + två brickor staplade). Inga enskilda mutter-/brickmått härleds ur C. Detaljerat läge finns kvar. Metrisk grovgänga förifylls; avvikande stigning varnas. Formel: A+B+P+C+n×p. C ersätter endast summan av de två brickorna och muttern.

Skisserna är illustrativa längdsnitt, inte produktmåttritningar. Alla måttsymboler återkommer i bildens måttnyckel. Blindfläns ritas utan rörlopp, lösfläns bakom bordringskragen och bult utanför kragens ytterdiameter.


### 0.4.1 – synligt momentbesked
Momentbeskedet visas före skiss, DN och tryckklass. Saknat momentunderlag benämns separat från ej fastställd tryckklass. Neutrala katalogval och Ulefos är märkta med att moment saknas. Inga nya momentvärden eller tillverkarantaganden har lagts till.

Reproducerbart kontrollfall: `?family=rr_hp&od=160&sdr=11&pn=10&connection=fixed&gasket=epdm` visar HP-tabellens 66 Nm; `family=rr_sf` ger VP/SF-tabellens 50 Nm. Queryparametrar återställer bara val som finns i respektive synligt fält; rörmaterial lämnas tomt.
