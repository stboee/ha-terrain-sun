# Terrain Sun

Se når terrenget slipper sola til der du bor. Én Home Assistant-integrasjon gir entiteter for direkte sol og tre dashboardkort. Beregningene kjører lokalt i Home Assistant.

## Installer i Home Assistant

Krever Home Assistant **2026.11.2** eller nyere.

1. Åpne **Innstillinger → Marketplace → Legg til fra lenke**. Koble til GitHub hvis Home Assistant ber om det.
2. Legg til `https://github.com/stboee/ha-terrain-sun` og installer **Terrain Sun**.
3. Legg til **Terrain Sun** under **Innstillinger → Enheter og tjenester**. Velg `horizon.txt` fra PeakFinder (**Export → Horizon for Stellarium**).
4. Last inn Home Assistant-fanen på nytt etter oppsettet. Rediger dashboardet, åpne **Legg til kort → Etter kort** og søk etter **Terrain Sun**.

For en første gjennomgang kan du bruke [eksempelprofilen fra Øyer](examples/horizon.txt), basert på vinkelverdier fra PeakFinder. Eksempelfilen bruker plasseringen i Home Assistant. En PeakFinder-eksport med koordinater bruker utsiktspunktet i eksporten. Alle profiler bruker tidssonen fra Home Assistant.

Marketplace henter oppdateringer fra GitHub Releases. Start Home Assistant på nytt når Marketplace ber om det. Terrengprofilen ligger i integrasjonens konfigurasjon og følger med ved oppdatering.

## Terrengprofiler

Åpne **Innstillinger → Enheter og tjenester → Terrain Sun → Konfigurer på nytt**. Der kan du legge til en navngitt profil, gi en profil nytt navn, oppdatere horisontfilen eller fjerne en profil.

- **Standardprofil for kortene** (`select.terrain_sun_default_profile`) kan styres på entitetssiden og legges på et dashboard. Den brukes av alle kort som står på **Følg standardprofil**.
- **Profil** og **Sammenlign med** i kortet gjelder den visningen. Velg eventuelt startverdier i kortredigeringen, eller angi profil-ID-er i YAML med `profile` og `compare_profile`. Valg gjort i selve visningen gjelder mens kortet er åpent.
- Hver profil får en egen enhet med en fast entitet for direkte sol og seks sensorer. Eksempel for Hjemme er `binary_sensor.terrain_sun_hjemme_direct_sun` og `sensor.terrain_sun_hjemme_direct_duration`. Et nytt visningsnavn beholder de samme ID-ene.

Ved oppdatering fra versjoner med én profil blir terrengdataene lagt i **Hjemme** (eller **Home** ved andre språk). Terrengsensorene får profilspesifikke entitets-ID-er. Oppdater eventuelle manuelle referanser til gamle ID-er i automasjoner og dashboard.

## Kort

| Kort | Innhold | Type i YAML |
|---|---|---|
| **Sol i dag** | Døgnstripe, solperioder, dagslengde, terrengskygge og lysfaser for valgt dato. Starter på dagens dato, som også viser status og neste overgang. | `custom:terrain-sun-today` |
| **Lokal horisont** | Terrengprofil, sol- og månebaner og vinkelverdier. Velg mellom **Utsnitt**, **360°**, **Solbane** og **Månebane**. | `custom:terrain-sun-horizon` |
| **Solåret** | Årsgraf i klokkeslett- og varighetsvisning, årssummer, neste solverv og jevndøgn, neste dato med tilsvarende soltid og kveldssol ved valgt klokkeslett. | `custom:terrain-sun-year` |

Med **Sammenlign med** bruker begge profiler samme dato eller år. **Sol i dag** viser to døgnstriper på samme klokkeakse, tidspunkter og en forskjell i direkte soltid. **Lokal horisont** legger de to terrenglinjene oppå hverandre i **Utsnitt** og **360°**, med solbanen fra hovedprofilen. **Solbane** og **Månebane** viser to paneler med identiske akser. **Solåret** viser to kurver for daglig direkte soltid og sammenligner årssummene. På smale kort vises profilverdiene under hverandre innen hver rad.

I **Sol i dag** sammenlignes direkte soltid med dagen før, dagen etter og datoene nøyaktig sju dager før og etter valgt dato.

**Neste gang det er så lyst** sammenligner samlet direkte soltid for valgt dato med dagene etter neste solverv. Kortet viser datoen som ligger nærmest ved første tilbakekomst til omtrent samme soltid. Har valgt dato ingen direkte sol, viser kortet første kommende dato med direkte sol, innen ett år.

**Årssummer** gjelder valgt kalenderår. Mulig direkte sol er beregnet for klar himmel. Andelen i terrengskygge er antall dagslystimer skjermet av terrenget delt på dagslystimene ved fri horisont. Årsgrafen markerer solverv og jevndøgn i valgt år. Nedtellingen viser neste forekomst av hver hendelse fra i dag, i lokale kalenderdager. Datoene beregnes med Astronomy Engine og vises i tidssonen til Home Assistant.

Kort kan også legges til med typen i tabellen. Etter en oppdatering laster du inn Home Assistant-fanen på nytt. Integrasjonen registrerer kortfilen automatisk, også når dashboardressurser styres fra YAML. En eksisterende YAML-oppføring med `/terrain_sun/terrain-sun.js` og typen `module` kan brukes videre.

### Innstillinger for Lokal horisont

| Visning | Utsnitt |
|---|---|
| **Utsnitt** | Terreng og solbane rundt retningen der sola står høyest. |
| **360°** | Terreng og solbane rundt hele kompasset, med høydeaksen tilpasset terrengprofilen og solas toppunkt. |
| **Solbane** | Hele solbanen for valgt døgn, også under terrenget. Begge aksene tilpasses banen og terrengprofilen i utsnittet. |
| **Månebane** | Hele solbanen og månebanen for valgt døgn. Begge aksene utvides etter behov, og månebanen vises som en lilla kurve. |

Banene går fra lokal midnatt til neste midnatt. Start og slutt kan ligge på forskjellige steder i grafen.

**Vis skumring** er et eget valg i alle fire visninger. Fargebåndene vises innenfor grafens eksisterende gradgrenser. Aksene og kurvene beholder posisjon og skala når du veksler. Solbanen viser solsentrum, mens periodene med direkte sol beregnes ved øvre solrand mot terrenget.

Velg innstillingene i den visuelle kortredigeringen, eller bruk de tilsvarende YAML-feltene.

| Innstilling | Felt i YAML | Standard og virkemåte |
|---|---|---|
| Grafhøyde | `graph_height` | Høy (`tall`). Velg eventuelt Kompakt (`compact`) eller Normal (`normal`). |
| Nedre og øvre gradgrense | `min_elevation`, `max_elevation` | Gjelder **Utsnitt** og **360°**. Tomme felt skaleres automatisk. Lås begge for å sammenligne datoer med samme målestokk. |
| Startvisning | `horizon_view` | Utsnitt (`area`). De andre valgene er 360° (`circle`), Solbane (`sun`) og Månebane (`moon`). Eldre kort med `fixed_sun: true` eller aliaset `center_sun: true` åpner i **Solbane** dersom `horizon_view` ikke er angitt. |
| Vis skumring | `show_twilight` | Av ved åpning. Båndene bruker samme astronomiske grenser og farger som **Solåret**. |
| Vis månen | `show_moon` | Av. Viser en markør for månens nåværende posisjon på dagens dato når den er innenfor figuren. **Månebane** beregner hele kurven for valgt døgn uavhengig av denne innstillingen. Måneposisjonene beregnes lokalt med [Astronomy Engine](https://pypi.org/project/astronomy-engine/). |

### Skjermbilder

Kortene er vist i Home Assistant med [eksempelprofilen fra Øyer](examples/horizon.txt) og en flat profil på 0° ved samme utsiktspunkt.

#### Sol i dag

<img src="docs/images/sol-i-dag.webp" width="600" alt="To døgnstriper med felles klokkeakse og sammenlignede solperioder">

#### Lokal horisont

<img src="docs/images/lokal-horisont.webp" width="600" alt="Lokal horisont med to terrengprofiler på samme akse">

#### Solåret

<img src="docs/images/solaret.webp" width="600" alt="Solåret med to kurver for daglig direkte sol og årssummer per profil">

## Entiteter og beregninger

- Binærsensoren **Direkte sol** viser om øvre solrand er over terrengprofilen. Sensoren **Neste overgang for direkte sol** gir et tidsstempel for første overgang innen utgangen av neste lokale døgn, når en slik overgang finnes.
- Sensorer gir dagens direkte soltid og dagslengde ved fri horisont i minutter, samt solas geometriske høyde, azimut og terrenghøyden i solretningen. Nåverdiene oppdateres omtrent hvert minutt.
- Terrengprofilen interpoleres lineært rundt hele kompasset. Solposisjonen følger NOAA/Meeus-modellen. Direkte sol bruker tilsynelatende øvre solrand med standard refraksjon og en solradius på 0,26667°. Standard soloppgang og solnedgang bruker −0,833° geometrisk solhøyde. Skumringsgrensene er −6°, −12° og −18°.
- Modellen søker etter kryssinger i trinn på ett minutt og beregner tidspunktet for kryssinger mellom søkepunktene til nærmeste hele sekund. Svært korte perioder kan falle mellom søkepunktene. Beregnet direkte soltid er summen av alle synlige perioder i døgnet. Tider vises i lokal tid, mens varigheter beregnes i faktisk medgått tid.
- Tidene beskriver terrengskygge ved utsiktspunktet. Faste hindringer inngår slik de er representert i horisontprofilen. Observert direkte sol vil også avhenge av skydekke og lokale hindringer.

Solarberegningen er basert på [NOAA Solar Calculator](https://gml.noaa.gov/grad/solcalc/calcdetails.html). Den reelle horisontprofilen må passe til stedet du ønsker å beregne for.

## Versjonsbeskrivelser

Legg til `docs/releases/v<VERSJON>.md` med endringene for brukerne i samme commit som oppdaterer `version` i manifestet. Publiseringen bruker teksten fra filen i både Git-taggen og GitHub-releasen. [Publiserte versjoner](https://github.com/stboee/ha-terrain-sun/releases)
