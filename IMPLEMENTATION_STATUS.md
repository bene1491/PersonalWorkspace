# Implementierungsstand v0.1

Stand: siehe letzter Commit in diesem Repository. Diese Datei beschreibt ehrlich, was tatsächlich funktioniert, was Beispieldaten sind und was noch fehlt – nichts hier ist eine Absichtserklärung, sondern Stand des Codes.

## Je Modul

| Modul | Route | Status |
|---|---|---|
| Command Center | `/` | Vollständig. Aufgabenüberblick (echt, lokal), Marktschnappschuss (echte Daten), Wetter-Widget (echte Daten), Verbindungsstatus, Sicherheits-Hinweis. |
| Finanzen | `/finanzen`, `/finanzen/:id` | Marktübersicht, Sparklines und Asset-Detailseiten mit **echten** Live-Daten (CoinGecko). Währungsrechner mit **echten** EZB-Kursen (Frankfurter.app). Watchlist und Investment-Journal sind echte, lokal gespeicherte Nutzerdaten. **Portfolio-Tracking ist vollständig funktional**: eigene Bestände (Asset, Menge, Kaufpreis) werden lokal gespeichert und gegen die Live-Kurse zu Wert, Gewinn/Verlust und einer Allokations-Grafik berechnet – kein Broker-Import, reine manuelle Eingabe. **Preis-Alarme sind vollständig funktional** (Schwellenwert je Asset, optionale native Browser-Benachrichtigung bei Erreichen). Der tägliche Krypto-**Angst-&-Gier-Index** (Alternative.me) ist echt angebunden. Ein Aktien-Screener ist weiterhin nicht vorgesehen (kein Broker-Import, siehe oben). |
| Music Studio | `/music-studio` | Songideen-Bibliothek ist eine echte, lokal gespeicherte CRUD-Funktion. Metronom & Tap-Tempo sind vollständig funktional (Web Audio API, kein Audio-Import). **Reim- & Wortfinder ist vollständig funktional** (echte Datamuse-Abfrage, Modus „Reime“/„verwandte Wörter“, klarer Hinweis, dass die Datenbank Englisch-basiert ist). Audioexport-Analyse ist weiterhin ein vorbereitetes, aber inaktives Datenmodell – es wird kein Audio verarbeitet. |
| Uni & Studium | `/studium` | Kurse/Module sind explizit gekennzeichnete Beispieldaten (`src/data/demo.ts`). **Karteikarten & Lernmodus sind vollständig funktional** (eigene Karten anlegen, zufällige Lernrunde, Ergebnis-Zusammenfassung) – nicht mehr nur ein Platzhalter. Feiertage-Widget mit **echten** Daten (date.nager.at). PDF-Assistent bleibt als „Deaktiviert“ markierter Platzhalter. |
| Dateien & Dokumente | `/dokumente` | Kategorien sind eine echte, lokale CRUD-Funktion. Es gibt **keine** Dateibibliothek mit echten oder erfundenen Dateipfaden – die Ansicht zeigt ausschließlich die vorbereitete, inaktive Architektur. |
| Aufgaben & Planung | `/aufgaben` | Vollständig funktional: anlegen, bearbeiten, Status ändern, filtern (Status/Bereich), löschen (mit Undo). Drei Ansichten: Liste, Woche **und Kanban-Board** (Drag & Drop sowie tastaturbedienbare Verschieben-Buttons als Alternative), ein Produktivitäts-Chart (erledigte Aufgaben der letzten 7 Tage) und ein eingebauter Pomodoro-/Fokus-Timer. Einzige modulübergreifend geteilte Datendomäne. |
| AI Lab | `/ai-lab` | Prompt-Bibliothek ist eine echte, lokale CRUD-Funktion. Es gibt keine Verbindung zu einem KI-Anbieter und keine simulierte Unterhaltung. |
| Automatisierungen | `/automatisierungen` | Reine Übersichtskarten („Entwurf“/inaktiv). Es läuft nichts tatsächlich. |
| Einstellungen & Verbindungen | `/einstellungen` | Vollständig: Dark/Light-Umschaltung, **fünf wählbare Akzentfarben**, kompakte Dichte, Ort für Wetterdaten, **JSON-Backup-Export/-Import**, transparente Liste aller Datenquellen mit Status, Datenschutz- und Versionsinformationen. |

Zusätzlich, modulübergreifend: ein Toast-Benachrichtigungssystem mit **Rückgängig**-Funktion für jede Lösch-Aktion, **PWA-Installierbarkeit** (eigenes App-Icon, Service Worker für den Produktionsbuild), eine Befehlspalette (⌘K), die neben Navigation jetzt auch Prompts/Songideen/Journal-Einträge/Karteikarten/Watchlist durchsucht und drei Aktionen direkt ausführen kann (Theme umschalten, neue Aufgabe anlegen, Pomodoro starten), und ein von jeder Seite aus erreichbarer **Schnellnotizen**-Zettel (ein automatisch speicherndes Textfeld, über ein Symbol in der Kopfzeile).

## Echte Datenquellen

- **CoinGecko** (`src/services/marketData.ts`): `coins/markets`-Endpunkt mit `sparkline=true`, sechs fest ausgewählte Coins (Bitcoin, Ethereum, Solana, Cardano, Ripple, Chainlink), Preis in EUR. Liefert Kurs, 24h-Veränderung, 24h-Hoch/Tief, Marktkapitalisierung, 7-Tage-Kursverlauf.
- **Open-Meteo** (`src/services/weather.ts`): Zwei-Schritt-Abruf (Geocoding → Forecast) für einen vom Nutzer frei wählbaren Ort, Standardwert „Berlin“.
- **Frankfurter.app** (`src/services/currency.ts`): EZB-Referenzkurse, Beträge werden direkt vom Endpunkt umgerechnet zurückgegeben (kein eigenes Rechnen mit potenziell veralteten Kursen).
- **date.nager.at** (`src/services/holidays.ts`): Gesetzliche Feiertage, fest auf Deutschland (`DE`) eingestellt; sucht über das aktuelle und das folgende Jahr den nächsten Feiertag ab heute.
- **Alternative.me** (`src/services/fearGreed.ts`): `fng/`-Endpunkt, täglicher Angst-&-Gier-Index für den Kryptomarkt; `translateClassification()` übersetzt die englischen Klassifizierungen ins Deutsche.
- **Datamuse** (`src/services/rhymes.ts`): `words`-Endpunkt mit `rel_rhy` (Reime) bzw. `ml` (verwandte Wörter), debounced nach Texteingabe im Reim-/Wortfinder.

Alle sechs Adapter werfen bei HTTP-Fehlern oder leeren Ergebnissen eine `Error` mit Klartextmeldung; die zugehörigen Hooks (`useMarketData`, `useWeather`, `useNextHoliday`, `useFearGreedIndex`, bzw. der lokale Effekt in `CurrencyConverter`/`RhymeFinder`) bilden das auf einen `error`-Status mit sichtbarem Fehlertext ab. Es gibt keinen Fallback auf erfundene Werte.

**Bewusst nicht integriert:** Aktien/ETF-Kurse. Es sind mir keine kostenlosen, API-Key-freien Quellen bekannt, die zuverlässig per Browser-`fetch` (CORS) erreichbar sind – ich wollte keine Integration ausliefern, die ich nicht als tatsächlich funktionierend verifizieren kann (vgl. Netzwerk-Einschränkung unten).

## Qualitätsprüfungen – tatsächlich ausgeführt

Alle folgenden Prüfungen wurden in dieser Session wirklich ausgeführt, nicht nur behauptet:

- **TypeScript (strict):** `tsc -b` – keine Fehler, nach jedem größeren Implementierungsschritt erneut geprüft.
- **Produktionsbuild:** `vite build` – erfolgreich, Output in `dist/`. Durch Route-basiertes Lazy-Loading (inklusive `Tasks` und `Finance`, die sich einen Recharts-Chunk teilen) ist kein Chunk über der 500-kB-Warnschwelle: `index` ≈ 285 kB, der geteilte Recharts-Chunk („BarChart“) ≈ 351 kB (lädt nur bei Besuch dieser beiden Routen), alle übrigen Modul-Chunks zwischen 1,6 kB (Automatisierungen) und 64 kB (Finanzen, gewachsen durch Portfolio-Tabelle, Allokations-Pie-Chart und Preis-Alarme).
- **PWA-Build:** `vite-plugin-pwa` generiert `manifest.webmanifest` und `sw.js` ohne Fehler; `index.html` enthält den Manifest-Link und das Service-Worker-Registrierungsskript; alle vier Icon-Varianten (192/512/maskable/apple-touch) sind vorhanden.
- **Lint:** `oxlint` – 0 Fehler, ausschließlich wiederkehrende, bereits im Ausgangscode etablierte Warnmuster (z. B. `setState` in einem Daten-Lade-Effect bei jedem API-Hook – ein in React-Codebases übliches, hier bewusst in Kauf genommenes Muster für „Fetch beim Mounten“).
- **Kontrastrechnung:** `--text-muted` wurde für beide Themes gegen die WCAG-2.1-Formel (relative Luminanz → Kontrastverhältnis) von Hand nachgerechnet: vorher 4,09:1 (Dark) / 3,39:1 (Light), beide unter der 4,5:1-Grenze für Normaltext; nach Anpassung 5,31:1 (Dark) / 4,88:1 (Light).
- **Visuelle Prüfung im Browser (Headless-Chromium):** Dev-Server gestartet und gezielt durchgeklickt:
  - Aufgaben & Planung: Aufgabe anlegen, erledigen (Produktivitäts-Chart reagiert sichtbar), löschen + Rückgängig-Toast, Wechsel Liste/Woche/Board, Karte im Kanban-Board per Tastatur-Button von „Offen“ nach „In Arbeit“ verschoben (Spaltenzähler aktualisieren sich live), Pomodoro-Timer gestartet (Ring-Fortschritt sichtbar).
  - Music Studio: Tap-Tempo (BPM ändert sich sichtbar), Metronom gestartet/gestoppt (Beat-Punkte pulsieren).
  - Uni & Studium: zwei Karteikarten angelegt, Lernmodus gestartet, Karte aufgedeckt, eine richtig/eine falsch beantwortet, Zusammenfassung „1 / 2 richtig“ korrekt angezeigt.
  - Finanzen: Währungsrechner-UI geprüft (Eingabe, Tausch-Button, Fehlerzustand bei blockiertem Netzwerk). Mit gemockten API-Antworten (siehe unten): zwei Portfolio-Positionen angelegt → Wert, Gewinn/Verlust und Allokations-Pie-Chart korrekt gegen die gemockten Kurse berechnet; Preis-Alarm für BTC „unter 70.000 €“ bei einem gemockten Kurs von 58.230 € angelegt → sofort als „Ausgelöst“ markiert (siehe Fehlerkorrektur unten); Angst-&-Gier-Index zeigt den gemockten Wert „68 – Greed“ korrekt übersetzt als „Gier“.
  - Music Studio: Reim-/Wortfinder mit gemocktem Datamuse-Ergebnis für „flow“ → Reime-Liste erscheint, Klick auf einen Treffer verkettet die Suche auf das neue Wort.
  - Schnellnotizen: Zettel über das Kopfzeilen-Symbol geöffnet, Text eingetippt, mit Escape geschlossen, Seite neu geladen, Zettel erneut geöffnet → Text war vollständig persistiert.
  - Einstellungen: Export-Button ausgelöst – Handler läuft fehlerfrei durch, Bestätigungs-Toast „Backup wurde heruntergeladen“ erscheint; alle Datenquellen werden mit korrektem Status gelistet; alle fünf Akzentfarben durchgeklickt und per Screenshot bestätigt, dass Sidebar, aktive Navigation und Hervorhebungen konsistent mitfärben.
  - Befehlspalette: Textsuche „neue aufgabe“ → Pfeiltasten + Enter löst die Aktion aus → navigiert zu „Aufgaben & Planung“ **und** öffnet automatisch das Anlage-Formular; Suche „pomodoro“ + Enter → navigiert dorthin und startet den Timer automatisch (Button zeigt „Pause“ statt „Start“); Suche „Testkarte“ findet eine zuvor angelegte Karteikarte aus Uni & Studium.
  - Tastatur-/Fokus-Verhalten: Such-Button fokussiert, mit Enter geöffnet, Fokus liegt danach nachweislich im Eingabefeld (`document.activeElement` geprüft), nach `Escape` liegt der Fokus nachweislich wieder auf dem auslösenden Such-Button zurück (nicht auf `<body>`).
  - Dark/Light-Mode, Asset-Detailseite inkl. Direktaufruf einer lazy geladenen Route: weiterhin fehlerfrei.
  - Keine JavaScript-Exceptions, keine Konsolenfehler außer den erwarteten, dokumentierten Netzwerk-Timeouts.
- **Request-Mocking mit Playwright `page.route()`:** Da die Sandbox echte API-Zugriffe blockiert (siehe unten), wurden in dieser Session erstmals alle sechs externen Hosts über `page.route()` mit realistisch strukturierten Antworten abgefangen, um nicht nur Fehlerzustände, sondern die tatsächlichen *Erfolgsfälle* zu verifizieren: korrektes Rendering von Portfolio-Werten, Allokations-Chart, Preis-Alarmen, Angst-&-Gier-Index, Reimfinder-Ergebnissen und dem Wetter-Widget mit echten (gemockten) Daten statt nur mit dem Fehlerzustand. Dabei wurde ein echter Bug gefunden und behoben: Ein neu angelegter Preis-Alarm wurde nicht sofort gegen den aktuell schon vorliegenden Kurs geprüft (die Prüfung lief nur im `useEffect` bei neuen Marktdaten, nicht beim Anlegen selbst) – ein Alarm, der bereits beim Anlegen erreicht war, blieb fälschlich „Aktiv“ statt „Ausgelöst“. Fix: `addAlert()` prüft jetzt sofort gegen die bereits vorhandenen Marktdaten und setzt `triggeredAt` direkt beim Anlegen, falls die Schwelle schon überschritten ist. Mit einem gezielten Mock-Szenario (BTC-Kurs 58.230 €, Alarm „≤ 70.000 €“) verifiziert: Zeile zeigt nach dem Fix sofort „Ausgelöst“ statt „Aktiv“.

### Bekannte Einschränkungen dieser Prüfung

- Die Entwicklungsumgebung, in der diese Version gebaut wurde, läuft in einer Netzwerk-Sandbox, die alle sechs externen Hosts blockiert. Die Erfolgsfälle wurden deshalb nicht gegen die echten, live antwortenden APIs verifiziert, sondern gegen Playwright-`page.route()`-Mocks, deren Antwortstruktur von Hand gegen die öffentliche API-Dokumentation jedes Dienstes nachgebaut wurde (siehe Bullet oben) – das bestätigt das Response-Mapping und das Rendering, nicht aber, dass die echten Endpunkte exakt diese Struktur liefern. Ein Test mit `npm run dev` auf einem Rechner mit normalem Internetzugang bestätigt zusätzlich die tatsächlichen Live-Erfolgsfälle.
- Der Backup-**Download** selbst (die vom Browser erzeugte Datei) konnte mit dem verfügbaren Headless-Chromium nicht automatisiert abgefangen werden – ein bekanntes Verhalten von Blob-URL-Downloads in minimalen Headless-Browser-Builds, kein Hinweis auf einen App-Fehler. Dass der Export-Code fehlerfrei durchläuft (kein Reject, korrekter Toast), wurde verifiziert; der Dateiinhalt selbst wurde in dieser Session nicht Byte für Byte geprüft.
- PWA-Installierbarkeit (tatsächlicher „Installieren“-Dialog des Browsers) wurde anhand des korrekt erzeugten Manifests und Service Workers plausibilisiert, aber nicht mit einem echten Installationsvorgang in einem vollständigen Browser-UI getestet.
- Die Barrierefreiheits-Prüfung war gezielt (Fokus-Reihenfolge, Fokus-Rückgabe, Tastaturbedienbarkeit von Befehlspalette und Kanban-Board, Kontrastrechnung für die am häufigsten verwendete gedämpfte Textfarbe), aber kein vollständiger automatisierter Audit (z. B. axe-core) über jede Seite und jeden Zustand. Ein Screenreader-Testlauf (VoiceOver/NVDA) wurde nicht durchgeführt.

## Offene Punkte für eine v0.2

- Aktien/ETF-Marktdaten (aktuell nur Krypto über CoinGecko; bewusst zurückgestellt, siehe oben). Portfolio-Tracking und Preis-Alarme funktionieren bereits, aber ausschließlich für die sechs Krypto-Assets.
- Aktien-Screener, Unternehmensnachrichten.
- Preis-Alarme als echter Hintergrunddienst (Push-Benachrichtigung bei geschlossenem Tab) – aktuell funktional, aber nur solange der Tab offen und mit aktuellen Daten versorgt ist.
- Explizit freigegebene, rein lesende Dateisystem-Integration für „Dateien & Dokumente“ und „Uni & Studium“.
- Austauschbarer KI-Anbieter-Adapter für „AI Lab“ (weiterhin ohne automatische Übernahme der Bachelorarbeit in einen KI-Kontext, siehe SECURITY.md).
- Echte, nicht-destruktive Audioexport-Analyse für „Music Studio“ bei freigegebenem Ordner.
- Automatisches Vergessens-Intervall/Spaced-Repetition für den Karteikarten-Lernmodus (aktuell: einfache zufällige Durchläufe pro Sitzung, keine Zeitplanung über Tage).
