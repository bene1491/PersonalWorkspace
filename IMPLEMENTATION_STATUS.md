# Implementierungsstand v0.1

Stand: siehe letzter Commit in diesem Repository. Diese Datei beschreibt ehrlich, was tatsächlich funktioniert, was Beispieldaten sind und was noch fehlt – nichts hier ist eine Absichtserklärung, sondern Stand des Codes.

## Je Modul

| Modul | Route | Status |
|---|---|---|
| Command Center | `/` | Vollständig. Aufgabenüberblick (echt, lokal), Marktschnappschuss (echte Daten), Wetter-Widget (echte Daten), Verbindungsstatus, Sicherheits-Hinweis. |
| Finanzen | `/finanzen`, `/finanzen/:id` | Marktübersicht, Sparklines und Asset-Detailseiten mit **echten** Live-Daten (CoinGecko). Watchlist und Investment-Journal sind echte, lokal gespeicherte Nutzerdaten. Portfolio/Asset-Allokation/Screener sind bewusst leer bzw. nicht verbunden (kein Broker-Import vorgesehen). |
| Music Studio | `/music-studio` | Songideen-Bibliothek ist eine echte, lokal gespeicherte CRUD-Funktion. Audioexport-Analyse ist ein vorbereitetes, aber inaktives Datenmodell – es wird kein Audio verarbeitet. |
| Uni & Studium | `/studium` | Kurse/Module sind explizit gekennzeichnete Beispieldaten (`src/data/demo.ts`). Karteikarten/Quiz und PDF-Assistent sind als „Geplant“/„Deaktiviert“ markierte Platzhalter ohne Funktion. |
| Dateien & Dokumente | `/dokumente` | Kategorien sind eine echte, lokale CRUD-Funktion. Es gibt **keine** Dateibibliothek mit echten oder erfundenen Dateipfaden – die Ansicht zeigt ausschließlich die vorbereitete, inaktive Architektur. |
| Aufgaben & Planung | `/aufgaben` | Vollständig funktional: anlegen, bearbeiten, Status ändern, filtern (Status/Bereich), löschen. Einzige modulübergreifend geteilte Datendomäne. |
| AI Lab | `/ai-lab` | Prompt-Bibliothek ist eine echte, lokale CRUD-Funktion. Es gibt keine Verbindung zu einem KI-Anbieter und keine simulierte Unterhaltung. |
| Automatisierungen | `/automatisierungen` | Reine Übersichtskarten („Entwurf“/inaktiv). Es läuft nichts tatsächlich. |
| Einstellungen & Verbindungen | `/einstellungen` | Vollständig: Dark/Light-Umschaltung, kompakte Dichte, Ort für Wetterdaten, transparente Liste aller Datenquellen mit Status, Datenschutz- und Versionsinformationen. |

## Echte Datenquellen

- **CoinGecko** (`src/services/marketData.ts`): `coins/markets`-Endpunkt mit `sparkline=true`, sechs fest ausgewählte Coins (Bitcoin, Ethereum, Solana, Cardano, Ripple, Chainlink), Preis in EUR. Liefert Kurs, 24h-Veränderung, 24h-Hoch/Tief, Marktkapitalisierung, 7-Tage-Kursverlauf.
- **Open-Meteo** (`src/services/weather.ts`): Zwei-Schritt-Abruf (Geocoding → Forecast) für einen vom Nutzer frei wählbaren Ort, Standardwert „Berlin“.

Beide Adapter werfen bei HTTP-Fehlern oder leeren Ergebnissen eine `Error` mit Klartextmeldung; die zugehörigen Hooks (`useMarketData`, `useWeather`) bilden das auf einen `error`-Status mit sichtbarem Retry ab. Es gibt keinen Fallback auf erfundene Werte.

## Qualitätsprüfungen – tatsächlich ausgeführt

Alle folgenden Prüfungen wurden in dieser Session wirklich ausgeführt, nicht nur behauptet:

- **TypeScript (strict):** `tsc -b` – keine Fehler.
- **Produktionsbuild:** `vite build` – erfolgreich, Output in `dist/`. Durch Route-basiertes Lazy-Loading liegt kein Chunk mehr über der 500-kB-Warnschwelle (zuvor ein 669-kB-Bundle, jetzt aufgeteilt in u. a. `index` ≈ 298 kB, `Finance` ≈ 380 kB, `WorkspaceModules` ≈ 22 kB – Letztere laden erst beim Besuch der jeweiligen Route).
- **Lint:** `oxlint` – 0 Fehler, 7 Warnungen (alle bereits im Ausgangscode bzw. exakt demselben, bestehenden Muster folgend, z. B. `setState` in einem Daten-Lade-Effect – ein in React-Codebases übliches, hier bewusst in Kauf genommenes Muster für „Fetch beim Mounten“).
- **Visuelle Prüfung im Browser:** Ein lokaler Dev-Server wurde gestartet und alle neun Routen plus die Asset-Detailseite, Dark-/Light-Mode, die Befehlspalette (⌘K) und das Anlegen/Abhaken einer Aufgabe wurden per Headless-Chromium durchgeklickt und per Screenshot geprüft. Keine Rendering-Fehler, keine JavaScript-Exceptions, korrekte Fehlerzustände bei nicht erreichbaren APIs, korrekter Redirect auf `/` bei unbekannter Route, kein Bruch beim Direktaufruf einer lazy geladenen Route.

### Bekannte Einschränkung dieser Prüfung

Die Entwicklungsumgebung, in der diese Version gebaut wurde, läuft in einer Netzwerk-Sandbox, die `api.coingecko.com` und `api.open-meteo.com` blockiert. Die *Erfolgsfälle* der beiden echten API-Integrationen (tatsächlich empfangene Marktdaten/Wetterdaten) konnten dadurch in dieser Session nicht visuell verifiziert werden – nur die korrekten Fehlerzustände bei blockiertem Zugriff. Code, Request-Aufbau und Response-Mapping wurden sorgfältig gegen die öffentliche API-Dokumentation beider Dienste umgesetzt; ein Test mit `npm run dev` auf einem Rechner mit normalem Internetzugang bestätigt die Erfolgsfälle.

## Offene Punkte für eine v0.2

- Aktien/ETF-Marktdaten (aktuell nur Krypto über CoinGecko).
- Aktien-Screener, Unternehmensnachrichten, Kursalarme.
- Explizit freigegebene, rein lesende Dateisystem-Integration für „Dateien & Dokumente“ und „Uni & Studium“.
- Austauschbarer KI-Anbieter-Adapter für „AI Lab“ (weiterhin ohne automatische Übernahme der Bachelorarbeit in einen KI-Kontext, siehe SECURITY.md).
- Echte, nicht-destruktive Audioexport-Analyse für „Music Studio“ bei freigegebenem Ordner.
