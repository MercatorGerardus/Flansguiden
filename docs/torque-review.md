# Momentunderlag granskade 2026-11-18

## GF

Primärkälla: [Planning Fundamentals Industry – Design and Installation](https://www.gfps.com/content/dam/gfps/com/planning-fundamentals/en/gfps-planning-fundamentals-industry-design-installation-en.pdf), utgåva 09/2026, tryckt sida IV · 311 (PDF-index 308). Metrisk tabell, inte SYGEF Ultra-tabellen på III · 174. Sidan har kontrollerats visuellt och med textextraktion.

Appen avgränsar tabellkopplingen till ecoFIT PE med PP-stållösfläns. Tabellen innehåller även andra system som inte importeras som egna alternativ. ELGEF Plus omfattas inte av denna koppling. Utility-handboken 2023 hänvisar till ett onlineverktyg och är inget numeriskt momentunderlag i appen.

De 19 grupperade raderna ger 25 ytterdiametrar. Fyra kolumner bevaras: plan/profil × lubed/unlubed. Inga värden räknas fram med en generell friktionsfaktor. Exempelvis bevaras källans 75/91 Nm för planpackning Ø200/225, trots att kvoten skiljer sig från andra rader. Fixtur: tests/fixtures/gf-2026-IV-311.csv. Dokumenthash och sidmetadata: torque-source-review.json.

Appen kopierar inte tabellens generella hålbilder till vald PN-borrning. Tabellen fastställer inte arbetstrycket och appen sätter ingen generell 6-barsgräns från en annan källa/utgåva. Produktens driftvillkor behöver verifieras. Smort/osmort avser tabellens utförande, inte en instruktion att smörja packningen.

## AGRU

Primärkälla: [AGRULINE teknisk katalog](https://www.agru.at/fileadmin/user_upload/produkte/agruline/downloads/Kataloge/de/AGRU_TechKAT_Agruline_DE.pdf), s. 60 tabell C.9, visuellt kontrollerad. För DN150 är riktvärdena planpackning 60 Nm, profilpackning 40 Nm. Tabellen förutsätter 80 Shore A och friktion cirka 0,15 i gänga och mutteranliggning. Planpackningens gräns vid DN150 är 10 bar och högst 40 °C; profilkolumnen anger 16 bar. Det är inte samma sak som vald flänsborrning eller godkänd tryckklass för hela förbandet.

[Produktkälla för artikel 14.014.0160.11](https://www.agru.at/en/products/agruline/product-catalogue/05/pe100-rc-piping-system-fm-215-psi-07/backing-rings-accessories-45/code-14014-005/cm/14014016011): Ø160/DN150, PP-FRP med stålinlägg, PN10/16, b=23 mm (tolerans ±1,5 mm), D=285, k=240, 8×M20. Produktens 95 Nm är ett separat maxvärde för lösflänsen, inte packningens målmoment. Endast denna artikel/dimension har produktkopplats. Tjockleken förs inte automatiskt till ett komplett paketmått.

## Avgränsning i appen

- Riktvärde visas endast för identifierad plan-/profilpackning och PE mot fast metallfläns. GF kräver aktivt utförandeval.
- Exakt packning, hårdhet, bordring, motfläns, driftvillkor, skruvar och monteringsvillkor måste fortfarande kontrolleras. Villkoren visas öppet vid värdet och följer med kopierad lista.
- Blindfläns, två plaständar, O-ring i de nya systemen, Grafex och annan/okänd packning får inga överförda moment.
- Inget Nm överförs mellan fabrikat. Ingen tryckklass fastställs för hela förbandet.
- DENSIQ-underlag för Grafex, GF ELGEF-verktygskontroll och moment för Ulefos/övriga fabrikat återstår.

## Kontroll

54 enhetstester inklusive radvis GF-fixtur, alla fyra kolumner, produktseparation, AGRU-riktvärde mot produktmax och återkallad bultkoppling vid ändrat GF-utförande. Manuell webbläsarkontroll dokumenteras i PR:n; denna ändring tillför inte automatiserade UI-tester.
