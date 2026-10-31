# Samen — dienstenkalender

Een installeerbare webapp voor iPhone (Safari) en Android (Chrome), met een eigen vormgeving geïnspireerd op de snelle invoer van persoonlijke dienstenapps.

## Gratis gebruiken

De app gebruikt geen accounts, advertenties, abonnementen of betaalde API's. De openbare statische app kan gratis op GitHub Pages vanuit een openbare repository worden gehost. De code is openbaar; persoonlijke roosters worden uitsluitend in `localStorage` op het eigen toestel opgeslagen. GitHub ontvangt gewone hostingverzoeken, geen roosterinhoud. Er is geen synchronisatie met de oude privéwebversie of andere toestellen.

## Installeren

1. Open de gepubliceerde app-link.
2. **iPhone:** open in Safari → Delen → Zet op beginscherm → Voeg toe.
3. **Android:** open in Chrome → menu ⋮ → App installeren of Toevoegen aan startscherm.
4. Open de geïnstalleerde app eenmaal online, voordat je offline gebruik probeert.

Browseropslag kan verschillen tussen de browser en een geïnstalleerde app. Controleer na installatie je rooster en importeer zo nodig een back-up. Wis browsergegevens niet zonder back-up.

## Functies

- Maand-, week- en lijstweergave met optionele weeknummers.
- Dienst kiezen, meerdere dagen aantikken en in één keer inplannen.
- Meerdere diensttypes per dag, nachtdiensten over middernacht en notities.
- Eigen dienstnaam, afkorting, emoji, kleur, tijden, pauze en urenclassificatie.
- Vrije dagen en bereikbaarheidsdiensten apart van werkuren.
- Herhaalpatronen en hele weken kopiëren; bestaande dagen blijven behouden.
- Licht, donker of systeemthema en instelbare kalenderonderdelen.
- Urenoverzicht met gemiddeld maanddoel op basis van contracturen.
- Eén wijziging ongedaan maken tijdens de huidige sessie.
- JSON-back-up importeren en exporteren en eenmalige .ics-agenda-export.
- Offline applicatiebestanden via een service worker, zonder externe lettertypes of CDN's.

## Grenzen

Dit is een mobiele webapp, geen App Store- of Play Store-app. Native widgets, betrouwbare wekkerfuncties, achtergrondverwerking en automatische agendasynchronisatie zijn niet geïmplementeerd. Het urenoverzicht is geen loonstrook of definitieve overurenberekening. De dienstduur gebruikt de ingestelde kloktijden; bij de overgang tussen zomer- en wintertijd kan de werkelijke verstreken tijd daarvan afwijken. De .ics-export gebruikt Europe/Amsterdam. Werk je in een andere tijdzone, pas de export eerst aan.

De bestanden voor de vorige privéwebversie en de experimentele native versie staan niet in deze repository. Er staan geen persoonlijke roostergegevens in de broncode.

## Lokaal ontwikkelen

Geen installatie of build vereist voor de app:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Een service worker werkt alleen op HTTPS of localhost. `file://` openen is geen ondersteunde installatie.

Tests (Node 22+):

```sh
node --test tests/*.test.js
```

`model.ts` is de getypeerde bron; `model.js` is de rechtstreeks bruikbare ES-module. Houd beide gelijk bij wijzigingen. Verhoog de `VERSION` in `sw.js` bij iedere publicatie, zodat alle bestanden samen worden vernieuwd.

## Publicatie

GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/ (root)`. `.nojekyll` voorkomt verwerking door Jekyll. Alle app-paden zijn relatief en werken ook op een Pages-projectpad.
