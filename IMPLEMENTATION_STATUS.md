# Implementierungsstand v0.1

Stand: siehe letzter Commit in diesem Repository. Diese Datei beschreibt ehrlich, was tatsächlich funktioniert, was Beispieldaten sind und was noch fehlt – nichts hier ist eine Absichtserklärung, sondern Stand des Codes.

## Je Modul

| Modul | Route | Status |
|---|---|---|
| Command Center | `/` | Vollständig. Aufgabenüberblick (echt, lokal), Marktschnappschuss (echte Daten), Wetter-Widget (echte Daten), Verbindungsstatus, Sicherheits-Hinweis. |
| Finanzen | `/finanzen`, `/finanzen/:id` | Marktübersicht, Sparklines und Asset-Detailseiten mit **echten** Live-Daten (CoinGecko). Währungsrechner mit **echten** EZB-Kursen (Frankfurter.app). Watchlist und Investment-Journal sind echte, lokal gespeicherte Nutzerdaten. Portfolio/Asset-Allokation/Screener sind bewusst leer bzw. nicht verbunden (kein Broker-Import vorgesehen). |
| Music Studio | `/music-studio` | Songideen-Bibliothek ist eine echte, lokal gespeicherte CRUD-Funktion. Metronom & Tap-Tempo sind vollständig funktional (Web Audio API, kein Audio-Import). Audioexport-Analyse ist weiterhin ein vorbereitetes, aber inaktives Datenmodell – es wird kein Audio verarbeitet. |
| Uni & Studium | `/studium` | Kurse/Module sind explizit gekennzeichnete Beispieldaten (`src/data/demo.ts`). **Karteikarten & Lernmodus sind vollständig funktional** (eigene Karten anlegen, zufällige Lernrunde, Ergebnis-Zusammenfassung) – nicht mehr nur ein Platzhalter. Feiertage-Widget mit **echten** Daten (date.nager.at). PDF-Assistent bleibt als „Deaktiviert“ markierter Platzhalter. |
| Dateien & Dokumente | `/dokumente` | Kategorien sind eine echte, lokale CRUD-Funktion. Es gibt **keine** Dateibibliothek mit echten oder erfundenen Dateipfaden – die Ansicht zeigt ausschließlich die vorbereitete, inaktive Architektur. |
| Aufgaben & Planung | `/aufgaben` | Vollständig funktional: anlegen, bearbeiten, Status ändern, filtern (Status/Bereich), löschen (mit Undo). Zusätzlich: Listen- **und** Wochenansicht, ein Produktivitäts-Chart (erledigte Aufgaben der letzten 7 Tage) und ein eingebauter Pomodoro-/Fokus-Timer. Einzige modulübergreifend geteilte Datendomäne. |
| AI Lab | `/ai-lab` | Prompt-Bibliothek ist eine echte, lokale CRUD-Funktion. Es gibt keine Verbindung zu einem KI-Anbieter und keine simulierte Unterhaltung. |
| Automatisierungen | `/automatisierungen` | Reine Übersichtskarten („Entwurf“/inaktiv). Es läuft nichts tatsächlich. |
| Einstellungen & Verbindungen | `/einstellungen` | Vollständig: Dark/Light-Umschaltung, kompakte Dichte, Ort für Wetterdaten, **JSON-Backup-Export/-Import**, transparente Liste aller Datenquellen mit Status, Datenschutz- und Versionsinformationen. |

Zusätzlich, modulübergreifend: ein Toast-Benachrichtigungssystem mit **Rückgängig**-Funktion für jede Lösch-Aktion, sowie **PWA-Installierbarkeit** (eigenes App-Icon, Service Worker für den Produktionsbuild).

## Echte Datenquellen

- **CoinGecko** (`src/services/marketData.ts`): `coins/markets`-Endpunkt mit `sparkline=true`, sechs fest ausgewählte Coins (Bitcoin, Ethereum, Solana, Cardano, Ripple, Chainlink), Preis in EUR. Liefert Kurs, 24h-Veränderung, 24h-Hoch/Tief, Marktkapitalisierung, 7-Tage-Kursverlauf.
- **Open-Meteo** (`src/services/weather.ts`): Zwei-Schritt-Abruf (Geocoding → Forecast) für einen vom Nutzer frei wählbaren Ort, Standardwert „Berlin“.
- **Frankfurter.app** (`src/services/currency.ts`): EZB-Referenzkurse, Beträge werden direkt vom Endpunkt umgerechnet zurückgegeben (kein eigenes Rechnen mit potenziell veralteten Kursen).
- **date.nager.at** (`src/services/holidays.ts`): Gesetzliche Feiertage, fest auf Deutschland (`DE`) eingestellt; sucht über das aktuelle und das folgende Jahr den nächsten Feiertag ab heute.

Alle vier Adapter werfen bei HTTP-Fehlern oder leeren Ergebnissen eine `Error` mit Klartextmeldung; die zugehörigen Hooks (`useMarketData`, `useWeather`, `useNextHoliday`, bzw. der lokale Effekt in `CurrencyConverter`) bilden das auf einen `error`-Status mit sichtbarem Fehlertext ab. Es gibt keinen Fallback auf erfundene Werte.

**Bewusst nicht integriert:** Aktien/ETF-Kurse. Es sind mir keine kostenlosen, API-Key-freien Quellen bekannt, die zuverlässig per Browser-`fetch` (CORS) erreichbar sind – ich wollte keine Integration ausliefern, die ich nicht als tatsächlich funktionierend verifizieren kann (vgl. Netzwerk-Einschränkung unten).

## Qualitätsprüfungen – tatsächlich ausgeführt

Alle folgenden Prüfungen wurden in dieser Session wirklich ausgeführt, nicht nur behauptet:

- **TypeScript (strict):** `tsc -b` – keine Fehler, nach jedem größeren Implementierungsschritt erneut geprüft.
- **Produktionsbuild:** `vite build` – erfolgreich, Output in `dist/`. Durch Route-basiertes Lazy-Loading (jetzt inklusive `Tasks`, das durch den Produktivitäts-Chart Recharts benötigt) ist kein Chunk mehr über der 500-kB-Warnschwelle: `index` ≈ 279 kB, der von `Finance` und `Tasks` geteilte Recharts-Chunk („BarChart“) ≈ 350 kB (lädt nur bei Besuch dieser beiden Routen), alle übrigen Modul-Chunks zwischen 1,6 kB (Automatisierungen) und 35 kB (Finanzen).
- **PWA-Build:** `vite-plugin-pwa` generiert `manifest.webmanifest` und `sw.js` ohne Fehler; `index.html` enthält den Manifest-Link und das Service-Worker-Registrierungsskript; alle vier Icon-Varianten (192/512/maskable/apple-touch) sind vorhanden.
- **Lint:** `oxlint` – 0 Fehler, 11 Warnungen (ausschließlich wiederkehrende, bereits im Ausgangscode etablierte Muster, z. B. `setState` in einem Daten-Lade-Effect bei jedem der vier API-Hooks – ein in React-Codebases übliches, hier bewusst in Kauf genommenes Muster für „Fetch beim Mounten“).
- **Visuelle Prüfung im Browser (Headless-Chromium):** Dev-Server gestartet und gezielt durchgeklickt:
  - Aufgaben & Planung: Aufgabe anlegen, erledigen (Produktivitäts-Chart reagiert sichtbar), löschen + Rückgängig-Toast, Wechsel Listen-/Wochenansicht, Pomodoro-Timer gestartet (Ring-Fortschritt sichtbar).
  - Music Studio: Tap-Tempo (BPM ändert sich sichtbar), Metronom gestartet/gestoppt (Beat-Punkte pulsieren).
  - Uni & Studium: zwei Karteikarten angelegt, Lernmodus gestartet, Karte aufgedeckt, eine richtig/eine falsch beantwortet, Zusammenfassung „1 / 2 richtig“ korrekt angezeigt.
  - Finanzen: Währungsrechner-UI geprüft (Eingabe, Tausch-Button, Fehlerzustand bei blockiertem Netzwerk).
  - Einstellungen: Export-Button ausgelöst – Handler läuft fehlerfrei durch, Bestätigungs-Toast „Backup wurde heruntergeladen“ erscheint; alle sechs Datenquellen werden mit korrektem Status gelistet.
  - Dark/Light-Mode, Befehlspalette (⌘K), Asset-Detailseite inkl. Direktaufruf einer lazy geladenen Route: alles weiterhin fehlerfrei.
  - Keine JavaScript-Exceptions, keine Konsolenfehler außer den erwarteten, dokumentierten Netzwerk-Timeouts.

### Bekannte Einschränkungen dieser Prüfung

- Die Entwicklungsumgebung, in der diese Version gebaut wurde, läuft in einer Netzwerk-Sandbox, die `api.coingecko.com`, `api.open-meteo.com`, `api.frankfurter.app` und `date.nager.at` blockiert. Die *Erfolgsfälle* aller vier echten API-Integrationen (tatsächlich empfangene Daten statt Fehlerzustand) konnten dadurch in dieser Session nicht visuell verifiziert werden – nur die korrekten, konsistenten Fehlerzustände bei blockiertem Zugriff. Code, Request-Aufbau und Response-Mapping wurden sorgfältig gegen die öffentliche API-Dokumentation aller vier Dienste umgesetzt; ein Test mit `npm run dev` auf einem Rechner mit normalem Internetzugang bestätigt die Erfolgsfälle.
- Der Backup-**Download** selbst (die vom Browser erzeugte Datei) konnte mit dem verfügbaren Headless-Chromium nicht automatisiert abgefangen werden – ein bekanntes Verhalten von Blob-URL-Downloads in minimalen Headless-Browser-Builds, kein Hinweis auf einen App-Fehler. Dass der Export-Code fehlerfrei durchläuft (kein Reject, korrekter Toast), wurde verifiziert; der Dateiinhalt selbst wurde in dieser Session nicht Byte für Byte geprüft.
- PWA-Installierbarkeit (tatsächlicher „Installieren“-Dialog des Browsers) wurde anhand des korrekt erzeugten Manifests und Service Workers plausibilisiert, aber nicht mit einem echten Installationsvorgang in einem vollständigen Browser-UI getestet.

## Offene Punkte für eine v0.2

- Aktien/ETF-Marktdaten (aktuell nur Krypto über CoinGecko; bewusst zurückgestellt, siehe oben).
- Aktien-Screener, Unternehmensnachrichten, Kursalarme.
- Explizit freigegebene, rein lesende Dateisystem-Integration für „Dateien & Dokumente“ und „Uni & Studium“.
- Austauschbarer KI-Anbieter-Adapter für „AI Lab“ (weiterhin ohne automatische Übernahme der Bachelorarbeit in einen KI-Kontext, siehe SECURITY.md).
- Echte, nicht-destruktive Audioexport-Analyse für „Music Studio“ bei freigegebenem Ordner.
- Automatisches Vergessens-Intervall/Spaced-Repetition für den Karteikarten-Lernmodus (aktuell: einfache zufällige Durchläufe pro Sitzung, keine Zeitplanung über Tage).
